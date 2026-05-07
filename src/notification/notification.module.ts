import { Module } from '@nestjs/common';
import { NotificationEventsListener } from './notification-events.listener';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';

@Module({
  providers: [NotificationResolver, NotificationService, NotificationEventsListener],
})
export class NotificationModule {}
