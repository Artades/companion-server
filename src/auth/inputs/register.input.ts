import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field(() => String)
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно для заполнения' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  name: string;

  @Field(() => String)
  @IsString({ message: 'Никнейм должен быть строкой' })
  @IsNotEmpty({ message: 'Никнейм обязателен для заполнения' })
  @MaxLength(20, { message: 'Никнейм не должен превышать 20 символов' })
  nickname: string;

  @Field(() => String)
  @IsString({ message: 'Город должен быть строкой' })
  @IsNotEmpty({ message: 'Город обязателен для заполнения' })
  @MaxLength(20, { message: 'Город не должен превышать 20 символов' })
  city: string;

  @Field(() => String)
  @IsString({ message: 'Почта должна быть строкой' })
  @IsNotEmpty({ message: 'Почта обязательна для заполнения' })
  @IsEmail({}, { message: 'Некорректный формат электронной почты' })
  email: string;

  @Field(() => String)
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
  @MinLength(6, { message: 'Пароль должен содержать не менее 6 символов' })
  @MaxLength(128, { message: 'Пароль должен содержать не более 128 символов' })
  password: string;
}
