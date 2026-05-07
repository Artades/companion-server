import { NotificationType } from '@prisma/client';
import { buildNotificationContent } from './notification.config';

export function validateNotificationData(type: NotificationType, data: unknown) {
  buildNotificationContent(type, data);
}
