import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserModel } from 'src/users/models/user.model';

@ObjectType()
export class EventReview {
  @Field(() => ID)
  id: string;

  @Field()
  rating: number;

  @Field({ nullable: true })
  content?: string;

  @Field()
  createdAt: Date;

  @Field()
  userId: string;

  @Field()
  eventId: string;

  @Field(() => UserModel)
  user: UserModel;
}
