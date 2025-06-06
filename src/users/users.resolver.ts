import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './users.service';
import { UserModel } from './models/user.model';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User, UserRole } from '@prisma/client';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { UpdateUserInput } from './inputs/update-user.input';
import { UpdateUserProfileInput } from './inputs/update-profile.input';
import { FullUser } from './interfaces/full-user.interface';

@Resolver()
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserModel, {
    name: 'getMe',
    description: 'Receiving current user',
  })
  @Authorization()
  async getMe(@CurrentUser() user: User) {
    const foundUser = await this.userService.getCurrentUser(user.id);

    return foundUser;
  }

  @Query(() => [UserModel], {
    name: 'getAll',
    description: 'Receiving all users. Available only for admins',
  })
  @Authorization(UserRole.ADMIN)
  async getAll(): Promise<UserModel[]> {
    return await this.userService.findAll();
  }

  @Query(() => UserModel, {
    name: 'getOneById',
    description: 'Receiving user by unique id',
  })
  @Authorization()
  async getOneById(@Args('id') id: string) {
    return await this.userService.findOneById(id);
  }

  @Mutation(() => UserModel)
  @Authorization()
  async updateOneById(
    @CurrentUser('id') userId: string,
    @Args('updateUserData', { type: () => UpdateUserInput }) input: UpdateUserInput,
    @Args('updateProfileData', { type: () => UpdateUserProfileInput, nullable: true })
    profileData?: UpdateUserProfileInput,
  ) {
    return await this.userService.updateOneById(userId, input, profileData);
  }

  @Query(() => [UserModel], {
    name: 'getRecommendedToCurrent',
    description: 'Recieving recommended users simmiliar to current user',
  })
  @Authorization()
  async getRecommendedToCurrent(@CurrentUser('id') id: string): Promise<FullUser[]> {
    return await this.userService.getRecommendedToCurrent(id);
  }

  @Mutation(() => Boolean)
  @Authorization()
  async sendFriendRequest(
    @CurrentUser('id') currentUserId: string,
    @Args('friendId') friendId: string,
  ) {
    await this.userService.sendFriendRequest(currentUserId, friendId);
    return true;
  }
  @Mutation(() => Boolean)
  @Authorization()
  async rejectFriendRequest(
    @CurrentUser('id') currentUserId: string,
    @Args('friendId') friendId: string,
  ) {
    await this.userService.rejectFriendRequest(currentUserId, friendId);
    return true;
  }
  @Mutation(() => Boolean)
  @Authorization()
  async acceptFriendRequest(
    @CurrentUser('id') currentUserId: string,
    @Args('friendId') friendId: string,
  ) {
    await this.userService.acceptFriendRequest(currentUserId, friendId);
    return true;
  }

  @Mutation(() => Boolean)
  @Authorization()
  async removeFriend(@CurrentUser('id') currentUserId: string, @Args('friendId') friendId: string) {
    await this.userService.removeFriend(currentUserId, friendId);
    return true;
  }

  @Mutation(() => [UserModel])
  @Authorization()
  async getFriends(@Args('userId') userId: string): Promise<FullUser[]> {
    return await this.userService.getFriends(userId);
  }

  @Mutation(() => [UserModel])
  @Authorization()
  async getPendingReceivedRequests(@CurrentUser('id') currentUserId: string): Promise<FullUser[]> {
    return await this.userService.getPendingReceivedRequests(currentUserId);
  }
}
