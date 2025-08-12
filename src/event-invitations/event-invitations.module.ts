import { Module } from '@nestjs/common';
import { EventInvitationsService } from './event-invitations.service';
import { EventInvitationsResolver } from './event-invitations.resolver';

@Module({
  providers: [EventInvitationsResolver, EventInvitationsService],
})
export class EventInvitationsModule {}
