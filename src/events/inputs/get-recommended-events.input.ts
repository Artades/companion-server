import { Field, InputType, Int } from '@nestjs/graphql';
import { EventDifficulty } from '@prisma/client';

@InputType()
export class GetRecommendedEventsInput {
  @Field(() => [String], { nullable: true })
  interestIds?: string[];

  @Field(() => String, { nullable: true })
  cityId?: string;

  @Field(() => EventDifficulty, { nullable: true })
  difficulty?: EventDifficulty;

  @Field(() => Date, { nullable: true })
  afterDate?: Date;

  @Field(() => Int, { defaultValue: 0 })
  skip?: number;

  @Field(() => Int, { defaultValue: 10 })
  take?: number;
}
