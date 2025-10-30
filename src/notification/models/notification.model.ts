import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { NotificationType } from '@prisma/client';

registerEnumType(NotificationType, { name: 'NotificationType' });

@ObjectType()
export class NotificationModel {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  message: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field(() => Boolean)
  read: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  data: unknown;

  @Field()
  createdAt: Date;
}
