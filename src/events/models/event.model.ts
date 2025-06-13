import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { City, EventDifficulty, EventPrivacyType, User } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';
import { UserModel } from 'src/users/models/user.model';
import { CityModel } from 'src/cities/models/city.model';
import { EventMedia } from './event-media.model';
import { EventInterest } from './event-interest.model';
import { EventParticipant } from './event-participant.model';
import { EventReview } from './event-review.model';

registerEnumType(EventDifficulty, { name: 'EventDifficulty' });
registerEnumType(EventPrivacyType, { name: 'EventPrivacyType' });

@ObjectType()
export class EventModel {
  @Field(() => ID)
  id: string;

  @Field()
  label: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  date: Date;

  @Field(() => Float, { nullable: true })
  duration?: number;

  @Field()
  startTime: string;

  @Field()
  location: string;

  @Field({ nullable: true })
  locationLink?: string;

  @Field({ nullable: true })
  image?: string;

  @Field(() => EventDifficulty, { nullable: true })
  difficulty?: EventDifficulty;

  @Field(() => EventPrivacyType)
  privacyType: EventPrivacyType;

  @Field(() => Boolean)
  isCancelled: boolean;

  @Field(() => Float, { nullable: true })
  maxParticipants?: number;

  @Field()
  creatorId: string;

  @Field()
  cityId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => CityModel)
  city: City;

  @Field(() => UserModel)
  creator: User;

  @Field(() => [EventMedia])
  media: EventMedia[];

  @Field(() => [EventInterest])
  interests: EventInterest[];

  @Field(() => [EventParticipant])
  participants: EventParticipant[];

  @Field(() => [EventReview])
  reviews: EventReview[];
}
