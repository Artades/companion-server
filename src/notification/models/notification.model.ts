import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { GraphQLJSON } from 'graphql-type-json';
import { NotificationType } from '@prisma/client';

registerEnumType(NotificationType, { name: 'NotificationType' });

@ObjectType()
export class NotificationModel {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  read: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  data: Prisma.JsonValue | null;

  @Field()
  createdAt: Date;
}
