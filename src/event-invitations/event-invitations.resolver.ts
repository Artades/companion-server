import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { EventInvitationsService } from './event-invitations.service';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { EventInvitationModel } from './models/event-invitation.model';

@Resolver('EventInvitation')
export class EventInvitationsResolver {
  constructor(private readonly invitationsService: EventInvitationsService) {}

  @Mutation(() => EventInvitationModel)
  @Authorization()
  sendInvitation(
    @CurrentUser('id') userId: string,
    @Args('eventId') eventId: string,
    @Args('receiverId') receiverId: string,
  ) {
    return this.invitationsService.sendInvitation(userId, eventId, receiverId);
  }

  @Mutation(() => EventInvitationModel)
  @Authorization()
  acceptInvitation(@CurrentUser('id') userId: string, @Args('invitationId') invitationId: string) {
    return this.invitationsService.acceptInvitation(userId, invitationId);
  }

  @Mutation(() => EventInvitationModel)
  @Authorization()
  declineInvitation(@CurrentUser('id') userId: string, @Args('invitationId') invitationId: string) {
    return this.invitationsService.declineInvitation(userId, invitationId);
  }

  @Mutation(() => EventInvitationModel)
  @Authorization()
  cancelInvitation(@CurrentUser('id') userId: string, @Args('invitationId') invitationId: string) {
    return this.invitationsService.cancelInvitation(userId, invitationId);
  }

  @Query(() => [EventInvitationModel])
  @Authorization()
  listReceivedInvitations(@CurrentUser('id') userId: string) {
    return this.invitationsService.listReceivedInvitations(userId);
  }

  @Query(() => [EventInvitationModel])
  @Authorization()
  listSentInvitations(@CurrentUser('id') userId: string) {
    return this.invitationsService.listSentInvitations(userId);
  }
}
