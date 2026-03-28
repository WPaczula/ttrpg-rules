import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CharacterRepository } from '../repositories/character.repository';
import { ForbiddenException, NotFoundException, ErrorCode } from '../../common/error-codes';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

@Injectable()
export class CharacterOwnerGuard implements CanActivate {
  constructor(private readonly characters: CharacterRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser & { params: { id: string } }>();
    const user = request.user;

    if (user.role === Role.GM || user.role === Role.DEMO) return true;

    const characterId = request.params.id;
    const character = await this.characters.findById(characterId);

    if (!character) {
      throw new NotFoundException(ErrorCode.CHARACTER_NOT_FOUND, `Character ${characterId} not found`);
    }
    if (character.userId !== user.id) {
      throw new ForbiddenException('You do not own this character');
    }
    return true;
  }
}
