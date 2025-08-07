import { Module } from '@nestjs/common';
import { CityService } from './cities.service';

@Module({
  providers: [CityService],
  exports: [CityService],
})
export class CitiesModule {}
