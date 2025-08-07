// users.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UsersResolver } from './users.resolver';

@Module({
  providers: [UsersResolver, UserService],
  exports: [UserService], // 👈 обязательно
})
export class UsersModule {}
