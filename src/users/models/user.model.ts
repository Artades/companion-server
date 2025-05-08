import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';

registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType({
  description: 'Модель пользователя (с исключением чувствительных данных)',
})
export class UserModel {
  @Field(() => String)
  id: string;

  @Field(() => String, {
    nullable: true,
    description: 'Имя пользователя',
  })
  name?: string;

  @Field(() => String)
  nickname: string;

  @Field(() => String)
  email: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => String)
  cityId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
