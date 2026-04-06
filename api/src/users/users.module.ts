import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { verifyToken } from '@clerk/backend';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
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
  exports: [UsersService],
})
export class UsersModule {}
