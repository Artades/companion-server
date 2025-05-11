import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { City } from '@prisma/client';

@Injectable()
export class CityService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<City[]> {
    return this.prismaService.city.findMany();
  }
}
