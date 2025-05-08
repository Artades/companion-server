import { Query, Resolver } from '@nestjs/graphql';
import { UserService } from './users.service';
import { UserModel } from './models/user.model';

@Resolver()
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserModel], {
    name: 'getAllUsers',
    description: 'This is best method',
  })
  async getAll() {
    return await this.userService.findAll();
  }
}
