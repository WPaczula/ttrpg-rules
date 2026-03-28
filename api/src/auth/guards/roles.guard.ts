import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ForbiddenException } from '../../common/error-codes';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
