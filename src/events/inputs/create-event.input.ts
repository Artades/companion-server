import { Field, InputType, Float, Int } from '@nestjs/graphql';
import { EventDifficulty, EventPrivacyType } from '@prisma/client';
import { UploadMediaInput } from 'src/media/inputs/upload-media.input';

@InputType()
export class CreateEventInput {
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
  city: string;

  @Field()
  location: string;

  @Field({ nullable: true })
  locationLink?: string;

  @Field(() => UploadMediaInput, { nullable: true })
  thumbnail?: UploadMediaInput;

  @Field(() => [UploadMediaInput], { nullable: true })
  media?: UploadMediaInput[];

  @Field(() => EventDifficulty, { nullable: true })
  difficulty?: EventDifficulty;

  @Field(() => Int, { nullable: true })
  maxParticipants?: number;

  @Field(() => EventPrivacyType)
  privacyType: EventPrivacyType;

  @Field(() => [String], { nullable: true })
  interests?: string[];
}
