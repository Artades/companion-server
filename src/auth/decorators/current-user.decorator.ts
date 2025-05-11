import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { RequestWithUser } from '../interfaces/req-with-user.interface';

export const CurrentUser = createParamDecorator((data: keyof User, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);

  const request = ctx.getContext<{ req: RequestWithUser }>().req;

  const user = request.user as User;

  return data ? user[data] : user;
});
