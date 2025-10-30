// events.module.ts
import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsResolver } from './events.resolver';
import { MediaService } from 'src/media/media.service';
import { UsersModule } from 'src/users/users.module';
import { CityService } from 'src/cities/cities.service';

@Module({
  imports: [UsersModule],
  providers: [EventsResolver, EventsService, MediaService, CityService],
  exports: [EventsService],
})
export class EventsModule {}
