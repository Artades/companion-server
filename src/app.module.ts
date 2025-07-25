import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getGqlConfig } from './config/gql.config';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CitiesModule } from './cities/cities.module';
import { GoogleOauthController } from './google/google-oauth.controller';
import { GoogleOauthModule } from './google/google-oauth.module';
// import { EventsModule } from './events/events.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: getGqlConfig,
      inject: [ConfigService],
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    CitiesModule,
    GoogleOauthModule,
    ReviewsModule,
    MediaModule,
    // EventsModule,
  ],
  controllers: [GoogleOauthController],
})
export class AppModule {}
