import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class SearchEventsInput {
  @Field(() => String, { nullable: true })
  searchQuery: string;

  @Field(() => Int, { defaultValue: 0 })
  skip?: number;

  @Field(() => Int, { defaultValue: 10 })
  take?: number;
}
