import { City, User } from '@prisma/client';
import { ProfileModel } from '../models/profile.model';

export type FullUser = User & {
  city: City;
  profile: ProfileModel | null; // Замените тип на ProfileModel
};
