// users.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UsersResolver } from './users.resolver';
import { CitiesModule } from 'src/cities/cities.module'; 
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [CitiesModule, MediaModule], // 👈 здесь
  providers: [UsersResolver, UserService],
  exports: [UserService],
})
export class UsersModule {}
