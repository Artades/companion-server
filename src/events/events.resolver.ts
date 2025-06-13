import { Args, Resolver } from '@nestjs/graphql';
import { EventsService } from './events.service';
import { Query } from '@nestjs/graphql';
import { EventModel } from './models/event.model';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { GetRecommendedEventsInput } from './inputs/get-recommended-events.input';

@Resolver()
export class EventsResolver {
  constructor(private readonly eventsService: EventsService) {}

  @Query(() => [EventModel])
  @Authorization()
  async getMe(@CurrentUser() user: User, @Args() data: GetRecommendedEventsInput) {
    return await this.eventsService.getRecommendedEvents(user.id, data);
  }
}
