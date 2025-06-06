import { Module } from '@nestjs/common';
import { GoogleOauthController } from './google-oauth.controller';
import { AuthModule } from '../auth/auth.module'; // Для доступа к AuthService
import { GoogleStrategy } from './strategies/google.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [GoogleOauthController],
  providers: [GoogleStrategy],
})
export class GoogleOauthModule {}
