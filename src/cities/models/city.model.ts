import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CityModel {
  @Field(() => String)
  id: string;

  @Field()
  name: string;
}
