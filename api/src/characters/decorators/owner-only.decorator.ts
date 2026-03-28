import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import { ClerkAuthGuard } from '../../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CharacterOwnerGuard } from '../guards/character-owner.guard';

export const OwnerOnly = () =>
  applyDecorators(
    SetMetadata(ROLES_KEY, [Role.GM, Role.PC, Role.DEMO]),
    UseGuards(ClerkAuthGuard, RolesGuard, CharacterOwnerGuard),
  );
