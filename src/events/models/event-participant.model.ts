import { ObjectType, Field } from '@nestjs/graphql';
import { UserModel } from 'src/users/models/user.model';

@ObjectType()
export class EventParticipant {
  @Field()
  eventId: string;

  @Field()
  userId: string;

  @Field()
  joinedAt: Date;

  @Field(() => UserModel)
  user: UserModel;
}
