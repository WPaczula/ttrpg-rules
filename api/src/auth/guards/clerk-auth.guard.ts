import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '../../common/error-codes';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    @Inject('CLERK_CLIENT')
    private readonly clerk: {
      verifyToken(token: string): Promise<{ sub: string }>;
    },
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const payload = await this.clerk.verifyToken(token);
      request.user = await this.users.findOrCreate(payload.sub);
      return true;
    } catch (e: any) {
      console.error(e);
      throw new UnauthorizedException(
        'Invalid or expired token' + JSON.stringify(e),
      );
    }
  }
}
