import { Injectable, NotFoundException } from '@nestjs/common';
import { City, Event } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';
import { GetRecommendedEventsInput } from './inputs/get-recommended-events.input';
import { CreateEventInput } from './inputs/create-event.input';
import { CityService } from 'src/cities/cities.service';
import { MediaService } from 'src/media/media.service';
import { UpdateEventInput } from './inputs/update-event.input';

@Injectable()
export class EventsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly cityService: CityService,
    private readonly mediaService: MediaService,
  ) {}

  async getRecommendedEvents(userId: string, input: GetRecommendedEventsInput): Promise<Event[]> {
    const user = await this.userService.getCurrentUser(userId);
    if (!user) throw new NotFoundException('User not found');
    const userInterestIds = user.profile?.interests?.map((i) => i.interestId) ?? [];

    return await this.prismaService.event.findMany({
      where: {
        isCancelled: false,
        privacyType: 'PUBLIC',
        date: input.afterDate ? { gte: input.afterDate } : undefined,
        cityId: input.cityId ?? undefined,
        difficulty: input.difficulty ?? undefined,
        interests: input.interestIds?.length
          ? {
              some: {
                interestId: { in: input.interestIds },
              },
            }
          : {
              some: {
                interestId: { in: userInterestIds },
              },
            },
      },
      orderBy: {
        date: 'asc',
      },
      skip: input.skip,
      take: input.take,
    });
  }
  async getEventById(eventId: string): Promise<Event> {
    const foundEvent = await this.prismaService.event.findFirst({
      where: {
        id: eventId,
      },
    });

    if (!foundEvent) {
      throw new NotFoundException('Событие с таким id не найдено.');
    }

    return foundEvent;
  }

  async getCreatedEvents(userId: string): Promise<Event[]> {
    const foundEvents = await this.prismaService.event.findMany({
      where: {
        creatorId: userId,
      },
    });
    const foundUser = await this.userService.findOneById(userId);

    if (!foundUser) {
      throw new NotFoundException('Такого пользователя не существует');
    }
    if (!foundEvents.length) {
      throw new NotFoundException('Событий с таким создателем не найдено.');
    }

    return foundEvents;
  }
  async getParticipatedEvents(userId: string): Promise<Event[]> {
    const events = await this.prismaService.event.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
      },
    });

    if (!events.length) {
      throw new NotFoundException('Нет событий, в которых участвует пользователь');
    }

    return events;
  }

  async createEvent(input: CreateEventInput, userId: string): Promise<Event> {
    let city: City;

    const foundCity = await this.cityService.findByName(input.city);
    city = foundCity ?? (await this.cityService.create(input.city));

    const event = await this.prismaService.event.create({
      data: {
        label: input.label,
        description: input.description,
        date: input.date,
        duration: input.duration,
        startTime: input.startTime,
        location: input.location,
        locationLink: input.locationLink,
        difficulty: input.difficulty,
        privacyType: input.privacyType,
        isCancelled: false,
        creatorId: userId,
        cityId: city.id,
        interests: input.interests
          ? {
              create: await Promise.all(
                input.interests.map(async (interestName) => {
                  let interest = await this.prismaService.interest.findUnique({
                    where: { name: interestName },
                  });

                  if (!interest) {
                    interest = await this.prismaService.interest.create({
                      data: { name: interestName },
                    });
                  }

                  return {
                    interest: { connect: { id: interest.id } },
                  };
                }),
              ),
            }
          : undefined,
      },
      include: {
        city: true,
        creator: true,
        interests: { include: { interest: true } },
        participants: true,
        media: true,
        reviews: true,
      },
    });

    let order = 1;

    if (input.thumbnail) {
      const media = await this.mediaService.uploadSingleMedia(input.thumbnail);

      await this.prismaService.eventMedia.create({
        data: {
          eventId: event.id,
          mediaId: media.id,
          order: order++,
        },
      });
    }

    if (input.media?.length) {
      for (const file of input.media) {
        const media = await this.mediaService.uploadSingleMedia(file);
        await this.prismaService.eventMedia.create({
          data: {
            eventId: event.id,
            mediaId: media.id,
            order: order++,
          },
        });
      }
    }

    return event;
  }
  async updateEvent(input: UpdateEventInput, eventId: string, userId: string): Promise<Event> {
    const userBelongsToEvent = await this.prismaService.eventParticipant.findUniqueOrThrow({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!userBelongsToEvent) {
      throw new Error('Пользователь не может редактировать это событие');
    }

    const { media, existingMediaIds, thumbnail, interests: newInterests, ...restInput } = input;

    if (newInterests) {
      await this.prismaService.eventInterest.deleteMany({ where: { eventId } });

      await Promise.all(
        newInterests.map(async (name) => {
          let interest = await this.prismaService.interest.findUnique({ where: { name } });

          if (!interest) {
            interest = await this.prismaService.interest.create({ data: { name } });
          }

          await this.prismaService.eventInterest.create({
            data: {
              eventId,
              interestId: interest.id,
            },
          });
        }),
      );
    }

    if (existingMediaIds) {
      const toDeleteMediaIds = await this.prismaService.eventMedia.findMany({
        where: {
          eventId,
          mediaId: {
            notIn: existingMediaIds,
          },
        },
        select: { mediaId: true },
      });

      await this.prismaService.eventMedia.deleteMany({
        where: {
          eventId,
          mediaId: {
            in: toDeleteMediaIds.map((m) => m.mediaId),
          },
        },
      });

      for (const { mediaId } of toDeleteMediaIds) {
        await this.mediaService.deleteMedia(mediaId);
      }
    }

    let thumbnailMedia;
    if (thumbnail) {
      const uploaded = await this.mediaService.uploadSingleMedia(thumbnail);

      thumbnailMedia = await this.prismaService.eventMedia.create({
        data: {
          eventId,
          mediaId: uploaded.id,
          order: 0,
        },
      });
    }

    if (thumbnailMedia) {
      const existing = await this.prismaService.event.findUnique({ where: { id: eventId } });
      if (existing?.thumbnailId) {
        await this.mediaService.deleteMedia(existing.thumbnailId);
      }
    }

    if (media?.length) {
      const maxOrder = await this.prismaService.eventMedia.aggregate({
        where: { eventId },
        _max: { order: true },
      });

      let order = (maxOrder._max.order ?? 0) + 1;

      for (const file of media) {
        const uploaded = await this.mediaService.uploadSingleMedia(file);
        await this.prismaService.eventMedia.create({
          data: {
            eventId,
            mediaId: uploaded.id,
            order: order++,
          },
        });
      }
    }

    const updated = await this.prismaService.event.update({
      where: { id: eventId },
      data: {
        ...restInput,
        ...(thumbnailMedia && { thumbnailId: thumbnailMedia.mediaId }),
      },
      include: {
        city: true,
        creator: true,
        interests: { include: { interest: true } },
        participants: true,
        media: { include: { media: true } },
        reviews: true,
      },
    });

    return updated;
  }

  async cancelEvent(userId: string, eventId: string): Promise<Event> {
    const userBelongsToEvent = await this.prismaService.eventParticipant.findUniqueOrThrow({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    const isCreator =
      (await this.prismaService.event.count({
        where: { id: eventId, creatorId: userId },
      })) > 0;

    if (!userBelongsToEvent || !isCreator) {
      throw new Error('Пользователь не может отменить событие');
    }

    const event = this.prismaService.event.update({
      where: { id: eventId },
      data: {
        isCancelled: true,
      },
    });


    return event;
  }
}
