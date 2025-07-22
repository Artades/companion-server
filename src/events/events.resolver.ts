import { Args, Resolver } from '@nestjs/graphql';
import { EventsService } from './events.service';
import { Query } from '@nestjs/graphql';
import { EventModel } from './models/event.model';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { GetRecommendedEventsInput } from './inputs/get-recommended-events.input';
import { RateEventInput } from './inputs/rate-event.input';

@Resolver()
export class EventsResolver {
  constructor(private readonly eventsService: EventsService) {}
  @Query(() => [EventModel])
  @Authorization()
  async getRecommendedEvents(
    @CurrentUser() user: User,
    @Args('userId') data: GetRecommendedEventsInput,
  ) {
    return await this.eventsService.getRecommendedEvents(user.id, data);
  }

  @Query(() => EventModel)
  @Authorization()
  async getEvent(@Args('eventId') eventId: string) {
    return await this.eventsService.getEventById(eventId);
  }

  @Query(() => [EventModel])
  @Authorization()
  async getCreatedEvents(@Args('userId') userId: string) {
    return await this.eventsService.getCreatedEvents(userId);
  }

  @Query(() => [EventModel])
  @Authorization()
  async getParticipatedEvents(@Args('userId') userId: string) {
    return await this.eventsService.getParticipatedEvents(userId);
  }

  @Mutation(() => EventModel)
  @Authorization()
  async rateEvent(@CurrentUser() user: User, @Args('rateEventInput') input: RateEventInput) {
    return await this.eventsService.rateEvent(user.id, input);
  }
}
