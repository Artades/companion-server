import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { NotificationType } from '@prisma/client';

@InputType()
export class CreateNotificationInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  message: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: Record<string, unknown> | null;

  @Field(() => ID)
  userId: string;
}
