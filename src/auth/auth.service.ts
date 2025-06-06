import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './interfaces/jwt.interface';
import type { Request, Response } from 'express';
import { isDev } from '../utils/isDev';
import { RegisterInput } from './inputs/register.input';
import { LoginInput } from './inputs/login.input';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: string;
  private readonly JWT_REFRESH_TOKEN_TTL: string;

  private readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<string>('JWT_ACCESS_TOKEN_TTL');
    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<string>('JWT_REFRESH_TOKEN_TTL');

    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
  }

  async register(res: Response, input: RegisterInput) {
    const { name, email, password, city, nickname } = input;

    const existUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existUser) {
      throw new ConflictException('Пользователь с такой почтой уже существует');
    }

    let existingCity = await this.prismaService.city.findFirst({
      where: { name: city },
    });

    if (!existingCity) {
      existingCity = await this.prismaService.city.create({
        data: { name: city },
      });
    }

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        nickname,
        cityId: existingCity.id,
        password: await hash(password),
      },
    });

    return this.auth(res, user.id);
  }

  async login(res: Response, input: LoginInput) {
    const { email, password } = input;

    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!user.password) {
      throw new UnauthorizedException('Вход по паролю невозможен, используйте OAuth');
    }

    const isValidPassword: boolean = await verify(user.password, password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Неверный пароль');
    }

    return this.auth(res, user.id);
  }

  async refresh(req: Request, res: Response) {
    const cookies = req.cookies as Record<string, unknown>;

    const refreshToken = typeof cookies.refreshToken === 'string' ? cookies.refreshToken : null;

    if (!refreshToken) {
      throw new UnauthorizedException('Недействительный refresh-токен');
    }

    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);

    if (payload) {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload.id,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      return this.auth(res, user.id);
    }
  }

  logout(res: Response): boolean {
    this.setCookie(res, 'refreshToken', new Date(0));

    return true;
  }

  async validate(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  public auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id);

    this.setCookie(res, refreshToken, new Date(Date.now() + 1000 * 60 * 60 * 24 * 7));

    return { accessToken };
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: 'lax',
    });
  }

  async findOrCreateGoogleUser(googleUser: { email: string; name: string }): Promise<User> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: googleUser.email },
      });

      if (user) return user;

      const generatedNickname = googleUser.name.replace(/\s+/g, '').toLowerCase();
      const defaultCity = await this.prismaService.city.findFirst({
        where: { name: 'Алматы' },
        select: { id: true },
      });

      if (!defaultCity) throw new Error('Default city not found');

      const userData: Prisma.UserCreateInput = {
        email: googleUser.email,
        name: googleUser.name,
        nickname: generatedNickname,
        city: {
          connect: { id: defaultCity.id },
        },
      };

      return await this.prismaService.user.create({ data: userData });
    } catch (error) {
      console.error('❌ Error in findOrCreateGoogleUser:', error);
      throw new Error('Failed to find or create Google user');
    }
  }
}
