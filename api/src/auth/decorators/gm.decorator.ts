import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const GM = () =>
  applyDecorators(
    SetMetadata(ROLES_KEY, [Role.GM, Role.DEMO]),
    UseGuards(ClerkAuthGuard, RolesGuard),
  );
