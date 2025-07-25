import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { graphqlUploadExpress } from 'graphql-upload-ts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 4001;
  app.use(graphqlUploadExpress({maxFileSize: 10_000_000, maxFiles: 10}))
  app.use(cookieParser());

  await app.listen(port);
}
bootstrap();
