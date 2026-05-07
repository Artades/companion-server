import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { eventBus } from 'src/core/event-bus';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationInput } from './inputs/notification.input';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationEventsListener implements OnModuleInit {
  private readonly logger = new Logger(NotificationEventsListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  onModuleInit() {
    eventBus.on('event.invitation.sent', (data) => {
      void this.handleInvitationSent(data).catch((error) => {
        this.logger.error('Failed to create invitation notification', error);
      });
    });

    eventBus.on('event.updated', (data) => {
      void this.handleEventUpdated(data).catch((error) => {
        this.logger.error('Failed to create event update notifications', error);
      });
    });

    eventBus.on('event.cancelled', (data) => {
      void this.handleEventCancelled(data).catch((error) => {
        this.logger.error('Failed to create event cancellation notifications', error);
      });
    });
  }

  private async handleInvitationSent(data: {
    eventId: string;
    senderId: string;
    receiverId: string;
  }): Promise<void> {
    const [event, sender] = await Promise.all([
      this.prisma.event.findUnique({
        where: { id: data.eventId },
        select: { label: true },
      }),
      this.prisma.user.findUnique({
        where: { id: data.senderId },
        select: { name: true },
      }),
    ]);

    if (!event || !sender) return;

    await this.notificationService.create({
      userId: data.receiverId,
      type: NotificationType.EVENT_INVITE,
      data: {
        from: sender.name,
        event: event.label,
      },
    });
  }

  private async handleEventUpdated(data: { eventId: string; updatedBy: string }): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: data.eventId },
      select: {
        label: true,
        participants: {
          select: { userId: true },
        },
      },
    });

    if (!event) return;

    await this.createForUsers(
      event.participants
        .map((participant) => participant.userId)
        .filter((userId) => userId !== data.updatedBy),
      {
        type: NotificationType.EVENT_UPDATE,
        data: { event: event.label },
      },
    );
  }

  private async handleEventCancelled(data: {
    eventId: string;
    cancelledBy: string;
  }): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: data.eventId },
      select: {
        label: true,
        participants: {
          select: { userId: true },
        },
      },
    });

    if (!event) return;

    await this.createForUsers(
      event.participants
        .map((participant) => participant.userId)
        .filter((userId) => userId !== data.cancelledBy),
      {
        type: NotificationType.SYSTEM,
        data: { text: `Событие "${event.label}" отменено` },
      },
    );
  }

  private async createForUsers(
    userIds: string[],
    notification: Omit<CreateNotificationInput, 'userId'>,
  ): Promise<void> {
    const uniqueUserIds = [...new Set(userIds)];

    await Promise.all(
      uniqueUserIds.map((userId) =>
        this.notificationService.create({
          ...notification,
          userId,
        }),
      ),
    );
  }
}
