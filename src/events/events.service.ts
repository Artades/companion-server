import { Injectable, NotFoundException } from '@nestjs/common';
import { City, Event } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';
import { GetRecommendedEventsInput } from './inputs/get-recommended-events.input';
import { CreateEventInput } from './inputs/create-event.input';
import { CityService } from 'src/cities/cities.service';
import { MediaService } from 'src/media/media.service';

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

  async createEvent(input: CreateEventInput, userId: string) {
    let city: City;

    const foundCity = await this.cityService.findByName(input.city);

    if (!foundCity) {
      city = await this.cityService.create(input.city);
    } else {
      city = foundCity;
    }

    const event = await this.prismaService.event.create({
      data: {
        label: input.label,
        description: input.description,
        date: input.date,
        duration: input.duration,
        startTime: input.startTime,
        location: input.location,
        locationLink: input.locationLink,
        // image: input.image, ❌ больше не нужно, удаляем если не используешь
        difficulty: input.difficulty,
        privacyType: input.privacyType,
        isCancelled: false,
        creatorId: userId,
        cityId: city.id,
        interests: input.interests
          ? {
              create: input.interests.map((interestId) => ({
                interest: {
                  connect: { id: interestId },
                },
              })),
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
    if (input.media?.length) {
      for (const media of input.media) {
        await this.mediaService.uploadSingleMedia(event.id, media, order);
        order++;
      }
    }

    return event;
  }
}
