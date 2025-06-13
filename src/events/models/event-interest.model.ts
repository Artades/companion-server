import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Interest {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}

@ObjectType()
export class EventInterest {
  @Field()
  eventId: string;

  @Field()
  interestId: string;

  @Field(() => Interest)
  interest: Interest;
}
