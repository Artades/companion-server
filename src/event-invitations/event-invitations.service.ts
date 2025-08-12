import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventInvitation, InvitationStatus } from '@prisma/client';
import { EventsService } from 'src/events/events.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class EventInvitationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventService: EventsService,
    private readonly usersService: UserService,
  ) {}

  async sendInvitation(
    userId: string,
    eventId: string,
    receiverId: string,
  ): Promise<EventInvitation> {
    const event = await this.eventService.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('Событие не найдено');
    }

    if (receiverId === userId) {
      throw new BadRequestException('Нельзя пригласить самого себя');
    }

    const userBelongsToEvent = await this.eventService.checkUserBelongsToEvent(userId, eventId);
    const isCreator = await this.eventService.checkEventCreator(userId, eventId);

    const receiver = await this.usersService.findOneById(receiverId);

    if (!userBelongsToEvent || !isCreator) {
      throw new BadRequestException('Пользователь не может пригласить в событие');
    }

    if (!receiver) {
      throw new NotFoundException('Приглашенный пользователь не существует');
    }

    const existingInvitation = await this.prismaService.eventInvitation.findUnique({
      where: {
        eventId_invitedUserId: {
          eventId,
          invitedUserId: receiverId,
        },
      },
    });

    if (existingInvitation) {
      throw new ConflictException('Приглашение этому пользователю уже отправлено');
    }

    return this.prismaService.eventInvitation.create({
      data: {
        status: InvitationStatus.PENDING,
        eventId,
        invitedUserId: receiverId,
        invitedById: userId,
      },
    });
  }

  async acceptInvitation(userId: string, invitationId: string): Promise<EventInvitation> {
    const invitation = await this.prismaService.eventInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Приглашение не найдено');
    }
    if (invitation.invitedUserId !== userId) {
      throw new ForbiddenException('Вы не можете принять это приглашение');
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Приглашение уже обработано');
    }

    // Добавляем пользователя в участников события
    await this.prismaService.eventParticipant.create({
      data: {
        eventId: invitation.eventId,
        userId: userId,
      },
    });

    return this.prismaService.eventInvitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.ACCEPTED },
    });
  }

  async declineInvitation(userId: string, invitationId: string): Promise<EventInvitation> {
    const invitation = await this.prismaService.eventInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Приглашение не найдено');
    }
    if (invitation.invitedUserId !== userId) {
      throw new ForbiddenException('Вы не можете отклонить это приглашение');
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Приглашение уже обработано');
    }

    return this.prismaService.eventInvitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.REJECTED },
    });
  }

  async cancelInvitation(userId: string, invitationId: string): Promise<EventInvitation> {
    const invitation = await this.prismaService.eventInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Приглашение не найдено');
    }
    if (invitation.invitedById !== userId) {
      throw new ForbiddenException('Вы не можете отменить это приглашение');
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Приглашение уже обработано');
    }

    return this.prismaService.eventInvitation.delete({
      where: { id: invitationId },
    });
  }

  async listReceivedInvitations(userId: string): Promise<EventInvitation[]> {
    return this.prismaService.eventInvitation.findMany({
      where: { invitedUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: { event: true, invitedBy: true },
    });
  }

  async listSentInvitations(userId: string): Promise<EventInvitation[]> {
    return this.prismaService.eventInvitation.findMany({
      where: { invitedById: userId },
      orderBy: { createdAt: 'desc' },
      include: { event: true, invitedUser: true },
    });
  }
}
