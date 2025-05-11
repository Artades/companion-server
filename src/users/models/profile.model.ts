import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InterestModel {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class ProfileInterestModel {
  @Field(() => String)
  interestId: string;

  @Field(() => InterestModel)
  interest: InterestModel;
}

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

  // теперь interests — это массив связок ProfileInterestModel
  @Field(() => [ProfileInterestModel], { nullable: true })
  interests?: ProfileInterestModel[];
}
