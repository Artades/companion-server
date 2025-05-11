import { Module } from '@nestjs/common';
import { CityService } from './cities.service';

@Module({
  providers: [CityService, CitiesModule],
})
export class CitiesModule {}
