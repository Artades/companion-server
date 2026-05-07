import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Event } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';
import { GetRecommendedEventsInput } from './inputs/get-recommended-events.input';
import { CreateEventInput } from './inputs/create-event.input';
import { CityService } from 'src/cities/cities.service';
import { MediaService } from 'src/media/media.service';
import { UpdateEventInput } from './inputs/update-event.input';
import { isInRadius } from 'src/utils/math/calc';
import { SearchEventsInput } from './inputs/search-event.input';
import { eventBus } from 'src/core/event-bus';

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

    const rawEvents = await this.prismaService.event.findMany({
      where: {
        isCancelled: false,
        privacyType: 'PUBLIC',
        date: input.afterDate ? { gte: input.afterDate } : undefined,
        cityId: input.cityId ?? undefined,
        difficulty: input.difficulty ?? undefined,
        interests: input.interestIds?.length
          ? { some: { interestId: { in: input.interestIds } } }
          : userInterestIds.length
            ? { some: { interestId: { in: userInterestIds } } }
            : undefined,
      },
      orderBy: { date: 'asc' },
      skip: input.skip,
      take: input.take,
    });

    const { userCoords: center, searchRadius: radius } = input;

    if (center && radius) {
      return rawEvents.filter(
        (event) =>
          event.latitude !== null &&
          event.longitude !== null &&
          isInRadius({
            center,
            point: { latitude: event.latitude, longitude: event.longitude },
            radiusKm: radius,
          }),
      );
    }

    return rawEvents;
  }

  async getEventById(eventId: string): Promise<Event> {
    const foundEvent = await this.prismaService.event.findFirst({
      where: {
        id: eventId,
      },
    });

    if (!foundEvent) {
      throw new NotFoundException('Event with this id was not found.');
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
      throw new NotFoundException('User does not exist.');
    }
    if (!foundEvents.length) {
      throw new NotFoundException('No events found for this creator.');
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
      throw new NotFoundException('No events found for this participant.');
    }

    return events;
  }

  async createEvent(input: CreateEventInput, userId: string): Promise<Event> {
    const foundCity = await this.cityService.findByName(input.city);

    const city = foundCity ?? (await this.cityService.create(input.city));

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
        latitude: input.coords?.latitude,
        longitude: input.coords?.longitude,

        participants: {
          create: {
            userId,
          },
        },
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

      const thumbnail = await this.prismaService.eventMedia.create({
        data: {
          eventId: event.id,
          mediaId: media.id,
          order: order++,
        },
      });

      await this.prismaService.event.update({
        where: { id: event.id },
        data: { thumbnailId: thumbnail.id },
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
    eventBus.emit('event.created', {
      eventId: event.id,
      creatorId: userId,
    });

    return this.prismaService.event.findUniqueOrThrow({
      where: { id: event.id },
      include: {
        city: true,
        creator: true,
        interests: { include: { interest: true } },
        participants: true,
        media: { include: { media: true } },
        reviews: true,
      },
    });
  }

  async updateEvent(input: UpdateEventInput, eventId: string, userId: string): Promise<Event> {
    const event = await this.prismaService.event.findUnique({
      where: { id: eventId },
      select: { id: true, creatorId: true, thumbnailId: true },
    });

    if (!event) {
      throw new NotFoundException('Event with this id was not found.');
    }

    if (event.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can edit this event.');
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
      const toDeleteMedia = await this.prismaService.eventMedia.findMany({
        where: {
          eventId,
          id: {
            not: event.thumbnailId ?? undefined,
          },
          mediaId: {
            notIn: existingMediaIds,
          },
        },
        select: { id: true, mediaId: true },
      });

      await this.prismaService.eventMedia.deleteMany({
        where: {
          id: {
            in: toDeleteMedia.map((m) => m.id),
          },
        },
      });

      for (const { mediaId } of toDeleteMedia) {
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
        ...(thumbnailMedia && { thumbnailId: thumbnailMedia.id }),
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

    if (thumbnailMedia && event.thumbnailId) {
      const previousThumbnail = await this.prismaService.eventMedia.findUnique({
        where: { id: event.thumbnailId },
        select: { mediaId: true },
      });

      await this.prismaService.eventMedia.delete({
        where: { id: event.thumbnailId },
      });

      if (previousThumbnail) {
        await this.mediaService.deleteMedia(previousThumbnail.mediaId);
      }
    }

    eventBus.emit('event.updated', {
      eventId,
      updatedBy: userId,
    });

    return updated;
  }

  async cancelEvent(userId: string, eventId: string): Promise<Event> {
    const foundEvent = await this.prismaService.event.findUnique({
      where: { id: eventId },
      select: { creatorId: true },
    });

    if (!foundEvent) {
      throw new NotFoundException('Event with this id was not found.');
    }

    if (foundEvent.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can cancel this event.');
    }

    const event = await this.prismaService.event.update({
      where: { id: eventId },
      data: {
        isCancelled: true,
      },
    });
    eventBus.emit('event.cancelled', {
      eventId,
      cancelledBy: userId,
    });

    return event;
  }

  async checkEventCreator(userId: string, eventId: string): Promise<boolean> {
    const isCreator =
      (await this.prismaService.event.count({
        where: { id: eventId, creatorId: userId },
      })) > 0;
    return isCreator;
  }

  async checkUserBelongsToEvent(userId: string, eventId: string): Promise<boolean> {
    const user = await this.prismaService.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    return Boolean(user);
  }

  async searchEvent(input: SearchEventsInput): Promise<Event[]> {
    const { searchQuery, take, skip } = input;

    if (!searchQuery?.trim()) return [];

    const events = await this.prismaService.event.findMany({
      where: {
        isCancelled: false,
        privacyType: 'PUBLIC',
        OR: [
          { label: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { city: { name: { contains: searchQuery, mode: 'insensitive' } } },
        ],
      },
      take,
      skip,
      orderBy: { date: 'asc' },
      include: {
        city: true,
        interests: { include: { interest: true } },
        creator: { select: { id: true, name: true } },
        media: { include: { media: true } },
      },
    });

    return events;
  }
}
