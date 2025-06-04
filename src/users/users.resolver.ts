import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './users.service';
import { UserModel } from './models/user.model';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User, UserRole } from '@prisma/client';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { UpdateUserInput } from './inputs/update-user.input';
import { UpdateUserProfileInput } from './inputs/update-profile.input';

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
  async getRecommendedToCurrent(@CurrentUser('id') id: string) {
    return await this.userService.getRecommendedToCurrent(id);
  }
}
