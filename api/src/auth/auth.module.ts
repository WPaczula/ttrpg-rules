import { Module } from '@nestjs/common';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { createClerkClient } from '@clerk/backend';

@Module({
  imports: [UsersModule],
  providers: [
    ClerkAuthGuard,
    RolesGuard,
    {
      provide: 'CLERK_CLIENT',
      useFactory: () =>
        createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY ?? '' }),
    },
  ],
  exports: [ClerkAuthGuard, RolesGuard],
})
export class AuthModule {}
