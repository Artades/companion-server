import { Controller, Get, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { GoogleUser } from 'src/common/interfaces/google.interface';
import { GoogleAuthGuard } from './decorators/google.decorator';

@Controller('auth/google')
export class GoogleOauthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @GoogleAuthGuard()
  async googleAuth() {}

  @Get('/callback')
  @GoogleAuthGuard()
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user as GoogleUser;

    const user = await this.authService.findOrCreateGoogleUser(googleUser);

    const authTokens = this.authService.auth(res, user.id);

    const frontendUrl = new URL(this.configService.getOrThrow<string>('FRONTEND_URL'));
    frontendUrl.searchParams.set('accessToken', authTokens.accessToken);

    return res.redirect(frontendUrl.toString());
  }
}
