import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { City } from '@prisma/client';

@Injectable()
export class CityService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<City[]> {
    return this.prismaService.city.findMany();
  }

  async findByName(name: string): Promise<City | null> {
    return this.prismaService.city.findFirst({ where: { name } });
  }
  async create(name: string): Promise<City> {
    const isExists = await this.findByName(name);

    if (isExists) {
      throw new Error(`Город ${name} уже существует`);
    }

    return await this.prismaService.city.create({ data: { name } });
  }

  async findOrCreate(name: string): Promise<City> {
    const city = await this.findByName(name);
    if (city) return city;
    return this.create(name);
  }
}
