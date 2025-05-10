import { Query, Resolver } from '@nestjs/graphql';
import { UserService } from './users.service';
import { UserModel } from './models/user.model';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { User, UserRole } from '@prisma/client';
import { Authorization } from 'src/auth/decorators/authorization.decorator';

@Resolver()
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserModel, {
    name: 'getMe',
    description: 'Receiving current user',
  })
  @Authorization()
  async getMe(@CurrentUser() user: User): Promise<UserModel> {
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
  async getOneById(@CurrentUser('id') id: string): Promise<UserModel> {
    return await this.userService.findOneById(id);
  }
}
