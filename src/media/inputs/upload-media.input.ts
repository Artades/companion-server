import { InputType, Field } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';


@InputType()
export class UploadMediaInput {
  @Field(() => GraphQLUpload)
  file: Promise<FileUpload>;

  @Field({ nullable: true })
  caption?: string;
}
