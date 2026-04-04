import { Module } from '@nestjs/common';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { verifyToken } from '@clerk/backend';

@Module({
  imports: [UsersModule],
  providers: [
    ClerkAuthGuard,
    RolesGuard,
    {
      provide: 'CLERK_CLIENT',
      useFactory: () => {
        const secretKey = process.env.CLERK_SECRET_KEY ?? '';
        return {
          verifyToken: (token: string) => verifyToken(token, { secretKey }),
        };
      },
    },
  ],
  exports: [ClerkAuthGuard, RolesGuard, 'CLERK_CLIENT', UsersModule],
})
export class AuthModule {}
