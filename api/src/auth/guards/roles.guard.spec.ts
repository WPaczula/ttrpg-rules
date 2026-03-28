import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role, User } from '@prisma/client';

function makeUser(role: Role): User {
  return { id: 'u1', clerkId: 'c1', role, tokenLimit: null, tokensUsed: 0, createdAt: new Date(), updatedAt: new Date() };
}

function createContext(user: User, handler = {}): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => handler,
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();
    guard = module.get(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('allows access when user has a required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.GM, Role.DEMO]);
    const ctx = createContext(makeUser(Role.GM));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws ForbiddenException when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.GM, Role.DEMO]);
    const ctx = createContext(makeUser(Role.PC));
    expect(() => guard.canActivate(ctx)).toThrow('Insufficient permissions');
  });

  it('allows DEMO when GM and DEMO are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.GM, Role.DEMO]);
    const ctx = createContext(makeUser(Role.DEMO));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies when no roles metadata is set', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = createContext(makeUser(Role.GM));
    expect(() => guard.canActivate(ctx)).toThrow('Insufficient permissions');
  });
});
