import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateReviewInput {
  @Field(() => String)
  eventId: string;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  content?: string;
}
