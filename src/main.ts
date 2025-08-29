import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { calculateDistance } from './utils/math/calc';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 4001;

  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  app.use(graphqlUploadExpress({maxFileSize: 10_000_000, maxFiles: 10}))
  app.use(cookieParser());

  await app.listen(port);

  const d = calculateDistance({a: {
    latitude: 0,
    longitude: 0,
  }, b: {
    latitude: 0,
    longitude: 1,
  } })

  console.log("Result: ",d )
}
bootstrap();
