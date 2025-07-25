import { randomUUID } from 'crypto';
import { FileUpload } from 'graphql-upload-ts';
import { join } from 'path';
import { createWriteStream } from 'fs';
import sharp from 'sharp';

export async function processFile(file: FileUpload, isImage: boolean): Promise<{ filename: string; mimetype: string; path: string }> {
  const { createReadStream, filename, mimetype } = file;
  const stream = createReadStream();

  const uniqueName = `${randomUUID()}_${filename.replace(/\..+$/, '')}.webp`;
  const outputPath = join(process.cwd(), 'static', 'uploads', uniqueName);
  const output = createWriteStream(outputPath);

  if (isImage) {
    const transformer = sharp()
      .resize(1600, 1600, { fit: 'inside' })
      .toFormat('webp')
      .webp({ quality: 80 });

    await new Promise<void>((resolve, reject) => {
      stream.pipe(transformer).pipe(output)
        .on('finish', resolve)
        .on('error', reject);
    });

    return { filename: uniqueName, mimetype: 'image/webp', path: `/static/uploads/${uniqueName}` };
  }

  // Для видео и других файлов — обычная запись
  const finalName = `${randomUUID()}_${filename}`;
  const finalPath = join(process.cwd(), 'static', 'uploads', finalName);
  const writeStream = createWriteStream(finalPath);

  await new Promise<void>((resolve, reject) => {
    stream.pipe(writeStream)
      .on('finish', resolve)
      .on('error', reject);
  });

  return { filename: finalName, mimetype, path: `/static/uploads/${finalName}` };
}
