import { Injectable } from '@nestjs/common';
import { UploadMediaInput } from './inputs/upload-media.input';
import { detectMediaType } from 'src/utils/media-type';
import { processFile } from 'src/utils/process-file';
import { PrismaService } from 'src/prisma/prisma.service';
import { MediaType } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(private readonly prismaService: PrismaService) {}

  async uploadSingleMedia(input: UploadMediaInput) {
    const { file } = input;
    const type = detectMediaType((await file).mimetype);
    const isImage = type === MediaType.IMAGE;

    const uploadedFile = await processFile(await file, isImage);

    return this.prismaService.media.create({
      data: {
        url: uploadedFile.path,
        type,
      },
    });
  }
  async deleteMedia(mediaId: string) {
    await this.prismaService.media.delete({where: {id: mediaId}})
  }
}
