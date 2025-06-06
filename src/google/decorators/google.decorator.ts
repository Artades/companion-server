import { applyDecorators, UseGuards } from '@nestjs/common';
import { GoogleOauthGuard } from '../../google/guards/google-oauth.guard';

export function GoogleAuthGuard() {
  return applyDecorators(UseGuards(GoogleOauthGuard));
}
