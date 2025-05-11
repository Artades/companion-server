import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';
import { ProfileModel } from './profile.model';
import { CityModel } from 'src/cities/models/city.model';

registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType({
  description: 'Модель пользователя (с исключением чувствительных данных)',
})
@ObjectType()
export class UserModel {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  nickname: string;

  @Field(() => String)
  email: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => CityModel)
  city: CityModel;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => ProfileModel, { nullable: true })
  profile?: ProfileModel | null;
}
