import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { NotificationModel } from './models/notification.model';
import { NotificationService } from './notification.service';

@Resolver(() => NotificationModel)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query(() => [NotificationModel])
  @Authorization()
  async getMyNotifications(@CurrentUser('id') userId: string): Promise<NotificationModel[]> {
    return this.notificationService.findByUserId(userId);
  }

  @Mutation(() => NotificationModel)
  @Authorization()
  async markNotificationAsRead(
    @CurrentUser('id') userId: string,
    @Args('notificationId') notificationId: string,
  ): Promise<NotificationModel> {
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Mutation(() => Boolean)
  @Authorization()
  async markAllNotificationsAsRead(@CurrentUser('id') userId: string): Promise<boolean> {
    return this.notificationService.markAllAsRead(userId);
  }
}
