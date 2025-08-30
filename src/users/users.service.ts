import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserInput } from './inputs/update-user.input';
import { UpdateUserProfileInput } from './inputs/update-profile.input';
import { FullUser } from './interfaces/full-user.interface';
import { MediaService } from 'src/media/media.service';
import { CityService } from 'src/cities/cities.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mediaService: MediaService,
    private readonly cityService: CityService,
  ) {}

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
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const existingCity = city ? await this.cityService.findOrCreate(city) : null;

    const avatarMedia = avatar ? await this.mediaService.uploadSingleMedia(avatar) : null;

    await this.prismaService.user.update({
      where: { id },
      data: {
        name,
        nickname,
        cityId: existingCity?.id,
      },
    });

    const profileData = {
      bio,
      avatar: avatarMedia ? { connect: { id: avatarMedia.id } } : undefined,
      socialLinks,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    };

    const profileId = user.profile
      ? user.profile.id
      : (await this.prismaService.profile.create({ data: { userId: id } })).id;

    await this.prismaService.profile.update({
      where: { id: profileId },
      data: profileData,
    });

    if (interests?.length) {
      await this.updateInterests(profileId, interests);
    }

    return this.prismaService.user.findUniqueOrThrow({
      where: { id },
      include: {
        city: true,
        profile: { include: { interests: { include: { interest: true } } } },
      },
    });
  }

  private async updateInterests(profileId: string, interests: string[]): Promise<void> {
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

  async getRecommendedToCurrent(id: string): Promise<FullUser[]> {
    const currentUser = await this.findOneById(id);

    const currentUserInterestIds = currentUser.profile?.interests?.map((i) => i.interestId) ?? [];

    const recommendedUsers = await this.prismaService.user.findMany({
      where: {
        cityId: currentUser.cityId,
        profile: {
          interests: {
            some: {
              interestId: {
                in: currentUserInterestIds,
              },
            },
          },
        },
        NOT: {
          id: id,
        },
      },
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

    return recommendedUsers;
  }
  async sendFriendRequest(currentUserId: string, friendId: string): Promise<void> {
    if (currentUserId === friendId) {
      throw new BadRequestException('Нельзя добавить самого себя в друзья');
    }

    const existing = await this.prismaService.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: currentUserId,
          friendId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Заявка уже существует (статус: ${existing.status})`);
    }

    await this.prismaService.friendship.create({
      data: {
        userId: currentUserId,
        friendId,
        status: 'PENDING',
      },
    });
  }

  async acceptFriendRequest(currentUserId: string, requesterId: string): Promise<void> {
    const request = await this.prismaService.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: requesterId,
          friendId: currentUserId,
        },
      },
    });

    if (!request || request.status !== 'PENDING') {
      throw new NotFoundException('Заявка не найдена или уже обработана');
    }

    // Обновляем существующую
    await this.prismaService.friendship.update({
      where: {
        userId_friendId: {
          userId: requesterId,
          friendId: currentUserId,
        },
      },
      data: { status: 'ACCEPTED' },
    });

    await this.prismaService.friendship.create({
      data: {
        userId: currentUserId,
        friendId: requesterId,
        status: 'ACCEPTED',
      },
    });
  }

  async rejectFriendRequest(currentUserId: string, requesterId: string): Promise<void> {
    const request = await this.prismaService.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: requesterId,
          friendId: currentUserId,
        },
      },
    });

    if (!request || request.status !== 'PENDING') {
      throw new NotFoundException('Заявка не найдена или уже обработана');
    }

    await this.prismaService.friendship.update({
      where: {
        userId_friendId: {
          userId: requesterId,
          friendId: currentUserId,
        },
      },
      data: { status: 'REJECTED' },
    });
  }

  async removeFriend(currentUserId: string, friendId: string): Promise<void> {
    const friendshipA = await this.prismaService.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: currentUserId,
          friendId,
        },
      },
    });

    const friendshipB = await this.prismaService.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: friendId,
          friendId: currentUserId,
        },
      },
    });

    if (
      !friendshipA ||
      !friendshipB ||
      friendshipA.status !== 'ACCEPTED' ||
      friendshipB.status !== 'ACCEPTED'
    ) {
      throw new NotFoundException('Вы не являетесь друзьями');
    }

    await this.prismaService.friendship.delete({
      where: {
        userId_friendId: {
          userId: currentUserId,
          friendId,
        },
      },
    });

    await this.prismaService.friendship.update({
      where: {
        userId_friendId: {
          userId: friendId,
          friendId: currentUserId,
        },
      },
      data: {
        status: 'PENDING',
      },
    });
  }

  async getFriends(userId: string): Promise<FullUser[]> {
    const friendships = await this.prismaService.friendship.findMany({
      where: {
        userId,
        status: 'ACCEPTED',
      },
      select: { friendId: true },
    });

    const friendIds = friendships.map((f) => f.friendId);

    return this.prismaService.user.findMany({
      where: { id: { in: friendIds } },
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
  }

  async getPendingReceivedRequests(userId: string): Promise<FullUser[]> {
    const pending = await this.prismaService.friendship.findMany({
      where: {
        friendId: userId,
        status: 'PENDING',
      },
      select: { userId: true },
    });

    const senderIds = pending.map((r) => r.userId);

    return this.prismaService.user.findMany({
      where: { id: { in: senderIds } },
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
  }
}
