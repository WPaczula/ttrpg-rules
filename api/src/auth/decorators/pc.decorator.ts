import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const PC = () =>
  applyDecorators(
    SetMetadata(ROLES_KEY, [Role.PC, Role.DEMO]),
    UseGuards(ClerkAuthGuard, RolesGuard),
  );
