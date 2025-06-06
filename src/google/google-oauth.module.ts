import { Module } from '@nestjs/common';
import { GoogleOauthController } from './google-oauth.controller';
import { AuthModule } from '../auth/auth.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [GoogleOauthController],
  providers: [GoogleStrategy],
})
export class GoogleOauthModule {}
