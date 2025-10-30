import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationInput } from './inputs/notification.input';
import { Notification, NotificationType } from '@prisma/client';
import { NotificationPayloads, NotificationTemplates } from './notification.config';

type StrictNotificationInput<T extends NotificationType> = Omit<
  CreateNotificationInput,
  'type' | 'data'
> & {
  type: T;
  data: NotificationPayloads[T];
};

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async create<T extends NotificationType>(
    input: StrictNotificationInput<T>,
  ): Promise<Notification> {
    const template = NotificationTemplates[input.type];
    const payload = input.data;

    return this.prismaService.notification.create({
      data: {
        title: template.title,
        message: template.message(payload),
        type: input.type,
        read: false,
        data: input.data,
        userId: input.userId,
      },
    });
  }
}
