import { Controller, Get, Req } from '@nestjs/common';
import { AnyRole } from '../auth/decorators/any-role.decorator';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('users')
export class UsersController {
  @AnyRole()
  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    return { role: req.user.role };
  }
}
