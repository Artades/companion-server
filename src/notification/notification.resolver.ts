import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { NotificationModel } from './models/notification.model';
import { CreateNotificationInput } from './inputs/notification.input';

@Resolver(() => NotificationModel)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Mutation(() => NotificationModel)
  async createNotification(
    @Args('input') input: CreateNotificationInput,
  ): Promise<NotificationModel> {
    return this.notificationService.create(input);
  }
}
