import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class RateEventInput {
  @Field(() => String)
  eventId: string;

  @Field(() => Float)
  rateAmount: number;
}
