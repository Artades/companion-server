import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewInput } from './inputs/review-event.input';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, input: CreateReviewInput) {
    const event = await this.prisma.event.findUnique({
      where: { id: input.eventId },
    });
    if (!event) {
      throw new NotFoundException('Событие не найдено');
    }

    const existingReview = await this.prisma.eventReview.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: input.eventId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('Вы уже оставили отзыв на это событие');
    }

    return this.prisma.eventReview.create({
      data: {
        userId,
        eventId: input.eventId,
        rating: input.rating,
        content: input.content,
      },
      include: {
        user: true,
      },
    });
  }

  async getReviewsByEvent(eventId: string) {
    return this.prisma.eventReview.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  async getReviewsByUser(userId: string) {
    return this.prisma.eventReview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  async deleteReview(userId: string, eventId: string) {
    const review = await this.prisma.eventReview.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужой отзыв');
    }

    return this.prisma.eventReview.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
      include: { user: true },
    });
  }
}
