import { Injectable, NotFoundException } from '@nestjs/common';
import { Event } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';
import { GetRecommendedEventsInput } from './inputs/get-recommended-events.input';

@Injectable()
export class EventsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
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
}
