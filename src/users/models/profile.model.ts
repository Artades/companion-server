import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProfileModel {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field(() => String, { nullable: true })
  bio?: string | null;

  @Field(() => [String], { nullable: true })
  socialLinks?: string[];

  @Field(() => Date, { nullable: true })
  dateOfBirth?: Date | null;
}
