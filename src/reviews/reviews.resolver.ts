import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ReviewsService } from './reviews.service';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ReviewModel } from './models/review.model';
import { EventReview, User } from '@prisma/client';
import { CreateReviewInput } from './inputs/review-event.input';

@Resolver()
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Mutation(() => ReviewModel)
  @Authorization()
  async reviewEvent(@CurrentUser() user: User, @Args('input') input: CreateReviewInput):Promise<EventReview> {
    return await this.reviewsService.createReview(user.id, input)
  }

  @Mutation(() => ReviewModel)
  async deleteReview(
    @CurrentUser() user: User,
    @Args('eventId') eventId: string,
  ): Promise<EventReview> {
    return this.reviewsService.deleteReview(user.id, eventId);
  }

  @Query(() => [ReviewModel])
  async reviewsByEvent(
    @Args('eventId') eventId: string,
  ): Promise<EventReview[]> {
    return this.reviewsService.getReviewsByEvent(eventId);
  }

  @Query(() => [ReviewModel])
  async reviewsByUser(
    @Args('userId') userId: string,
  ): Promise<EventReview[]> {
    return this.reviewsService.getReviewsByUser(userId);
  }
}
