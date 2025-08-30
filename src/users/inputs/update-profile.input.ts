import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength, IsDateString, IsArray } from 'class-validator';
import { UploadMediaInput } from 'src/media/inputs/upload-media.input';

@InputType()
export class UpdateUserProfileInput {
  @Field(() => UploadMediaInput, { nullable: true })
  avatar?: UploadMediaInput;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  socialLinks?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
