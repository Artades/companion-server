import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildNotificationContent } from './notification.config';
import { CreateNotificationInput } from './inputs/notification.input';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const result = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.findUniqueOrThrow({
      where: {
        id: notificationId,
      },
    });
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return true;
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    const content = buildNotificationContent(input.type, input.data);

    return this.prisma.notification.create({
      data: {
        title: content.title,
        message: content.message,
        type: input.type,
        read: false,
        data: content.data as Prisma.InputJsonObject,
        userId: input.userId,
      },
    });
  }
}
