import { ObjectType, Field, ID } from '@nestjs/graphql';
import { MediaType } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(MediaType, { name: 'MediaType' });

@ObjectType()
export class EventMedia {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field(() => MediaType)
  type: MediaType;

  @Field({ nullable: true })
  caption?: string;

  @Field()
  order: number;

  @Field()
  eventId: string;

  @Field()
  uploadedAt: Date;
}
