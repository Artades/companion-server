import { MediaType } from '@prisma/client';

export function detectMediaType(mime: string): MediaType {
  if (mime.startsWith('image/')) return MediaType.IMAGE;
  if (mime.startsWith('video/')) return MediaType.VIDEO;
  if (mime === 'application/gpx+xml') return MediaType.GPX;
  return MediaType.OTHER;
}
