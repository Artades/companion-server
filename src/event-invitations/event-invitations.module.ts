import { Module } from '@nestjs/common';
import { EventInvitationsService } from './event-invitations.service';
import { EventInvitationsResolver } from './event-invitations.resolver';
import { EventsModule } from 'src/events/events.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [EventsModule, UsersModule],
  providers: [EventInvitationsResolver, EventInvitationsService],
})
export class EventInvitationsModule {}
