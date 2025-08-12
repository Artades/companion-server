import { InvitationStatus, EventInvitation as PrismaEventInvitation } from '@prisma/client';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

registerEnumType(InvitationStatus, {
  name: 'InvitationStatus',
});

@ObjectType()
export class EventInvitationModel implements PrismaEventInvitation {
  @Field()
  invitedById: string;

  @Field()
  createdAt: Date;

  @Field()
  id: string;

  @Field()
  eventId: string;

  @Field()
  invitedUserId: string;

  @Field(() => InvitationStatus)
  status: InvitationStatus;
}
