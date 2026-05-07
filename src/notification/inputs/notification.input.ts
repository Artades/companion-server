import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { NotificationType } from '@prisma/client';

@InputType()
export class CreateNotificationInput {
  @Field(() => NotificationType)
  type: NotificationType;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: Record<string, unknown>;

  @Field(() => ID)
  userId: string;
}
