import { Resolver, Query } from '@nestjs/graphql';
import { CityService } from './cities.service';
import { CityModel } from './models/city.model';

@Resolver(() => CityModel)
export class CityResolver {
  constructor(private readonly citiesService: CityService) {}

  @Query(() => [CityModel])
  async getAll(): Promise<CityModel[]> {
    return await this.citiesService.findAll();
  }
}
