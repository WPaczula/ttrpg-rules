import { Module } from '@nestjs/common';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [ClerkAuthGuard, RolesGuard],
  exports: [ClerkAuthGuard, RolesGuard],
})
export class AuthModule {}
