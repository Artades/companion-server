import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RequestWithUser } from '../interfaces/reqWithUser.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const rolesContext = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesContext) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext<{ req: RequestWithUser }>().req;
    const user = req.user;

    if (!user || !rolesContext.includes(user.role)) {
      throw new ForbiddenException('У вас недостаточно прав');
    }

    return true;
  }
}
