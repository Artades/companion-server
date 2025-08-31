import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { EventDifficulty } from '@prisma/client';
@InputType()
export class CoordinatesInput {
  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;
}

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

  @Field(() => CoordinatesInput, { nullable: true })
  userCoords?: CoordinatesInput;

  @Field(() => Int, { defaultValue: 5 })
  searchRadius?: number;
}
