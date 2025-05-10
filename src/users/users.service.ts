import { Injectable, NotFoundException } from '@nestjs/common';
import { User, Profile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<User[]> {
    return await this.prismaService.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        profile: {
          include: {
            interests: {
              include: {
                interest: true,
              },
            },
          },
        },
      },
    });
  }

  async findOneById(id: string): Promise<User & { profile: Profile | null }> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            interests: {
              include: {
                interest: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь с таким Id не найден');
    }

    return user;
  }

  async getCurrentUser(id: string): Promise<User & { profile: Profile | null }> {
    return await this.findOneById(id);
  }
}
