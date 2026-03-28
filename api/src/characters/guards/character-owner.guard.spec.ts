import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { CharacterOwnerGuard } from './character-owner.guard';
import { CharacterRepository } from '../repositories/character.repository';
import { Role, User } from '@prisma/client';

function makeUser(role: Role, id = 'user-1'): User {
  return { id, clerkId: 'c1', role, tokenLimit: null, tokensUsed: 0, createdAt: new Date(), updatedAt: new Date() };
}

function makeCharacter(userId: string) {
  return { id: 'char-1', userId };
}

function createContext(user: User, params: Record<string, string> = {}): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user, params }) }),
  } as unknown as ExecutionContext;
}

const mockCharacters = { findById: jest.fn() };

describe('CharacterOwnerGuard', () => {
  let guard: CharacterOwnerGuard;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterOwnerGuard,
        { provide: CharacterRepository, useValue: mockCharacters },
      ],
    }).compile();
    guard = module.get(CharacterOwnerGuard);
  });

  it('allows GM to access any character without ownership check', async () => {
    const ctx = createContext(makeUser(Role.GM), { id: 'char-1' });
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(mockCharacters.findById).not.toHaveBeenCalled();
  });

  it('allows DEMO to access any character without ownership check', async () => {
    const ctx = createContext(makeUser(Role.DEMO), { id: 'char-1' });
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(mockCharacters.findById).not.toHaveBeenCalled();
  });

  it('allows PC to access their own character', async () => {
    mockCharacters.findById.mockResolvedValue(makeCharacter('user-1'));
    const ctx = createContext(makeUser(Role.PC, 'user-1'), { id: 'char-1' });
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it("throws ForbiddenException when PC tries to access another user's character", async () => {
    mockCharacters.findById.mockResolvedValue(makeCharacter('other-user'));
    const ctx = createContext(makeUser(Role.PC, 'user-1'), { id: 'char-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('You do not own this character');
  });

  it('throws NotFoundException when character does not exist', async () => {
    mockCharacters.findById.mockResolvedValue(null);
    const ctx = createContext(makeUser(Role.PC, 'user-1'), { id: 'nonexistent' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('Character nonexistent not found');
  });
});
