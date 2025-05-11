import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { City } from '@prisma/client';
import { UpdateUserInput } from './inputs/update-user.input';
import { UpdateUserProfileInput } from './inputs/update-profile.input';
import { FullUser } from './interfaces/full-user.interface';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<FullUser[]> {
    return await this.prismaService.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        city: true,
        profile: {
          include: {
            interests: { include: { interest: true } },
          },
        },
      },
    });
  }

  async findOneById(id: string): Promise<FullUser> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        city: true,
        profile: {
          include: {
            interests: {
              include: { interest: true },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Пользователь с таким Id не найден');

    return user;
  }

  async getCurrentUser(id: string): Promise<FullUser> {
    return await this.findOneById(id);
  }

  async updateOneById(
    id: string,
    updateUserData: UpdateUserInput,
    updateUserProfileData?: UpdateUserProfileInput,
  ): Promise<FullUser> {
    const { name, nickname, city } = updateUserData || {};
    const { bio, avatar, socialLinks, dateOfBirth, interests } = updateUserProfileData || {};

    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: { profile: { include: { interests: { include: { interest: true } } } } },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    let existingCity: City | null = city
      ? await this.prismaService.city.findFirst({ where: { name: city } })
      : null;

    if (!existingCity && city) {
      existingCity = await this.prismaService.city.create({ data: { name: city } });
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: {
        name,
        nickname,
        cityId: existingCity?.id,
      },
      include: { profile: { include: { interests: { include: { interest: true } } } } },
    });

    if (updatedUser.profile) {
      await this.prismaService.profile.update({
        where: { id: updatedUser.profile.id },
        data: {
          bio,
          avatar,
          socialLinks,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        },
      });

      if (interests?.length) {
        await this.updateInterests(updatedUser.profile.id, interests);
      }
    } else {
      const newProfile = await this.prismaService.profile.create({
        data: {
          userId: id,
          bio,
          avatar,
          socialLinks,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        },
      });

      if (interests?.length) {
        await this.updateInterests(newProfile.id, interests);
      }
    }

    return this.prismaService.user.findUniqueOrThrow({
      where: { id },
      include: {
        city: true,
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

  async updateInterests(profileId: string, interests: string[]): Promise<void> {
    const existingInterests = await this.prismaService.interest.findMany({
      where: { name: { in: interests } },
    });

    const existingNames = existingInterests.map((i) => i.name);
    const newNames = interests.filter((name) => !existingNames.includes(name));

    const newInterests = await Promise.all(
      newNames.map((name) => this.prismaService.interest.create({ data: { name } })),
    );

    const allInterests = [...existingInterests, ...newInterests];

    await this.prismaService.profile.update({
      where: { id: profileId },
      data: {
        interests: {
          deleteMany: {},
          create: allInterests.map((interest) => ({
            interest: { connect: { id: interest.id } },
          })),
        },
      },
      include: {
        interests: { include: { interest: true } },
      },
    });
  }
}
