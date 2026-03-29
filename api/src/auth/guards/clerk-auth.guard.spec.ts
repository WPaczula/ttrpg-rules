import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { UsersService } from '../../users/users.service';
import { Role, User } from '@prisma/client';

const mockUser: User = {
  id: 'user-1',
  clerkId: 'clerk-abc',
  role: Role.PC,
  tokenLimit: null,
  tokensUsed: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockClerkClient = {
  verifyToken: jest.fn(),
};

const mockUsersService = {
  findOrCreate: jest.fn(),
};

function createContext(headers: Record<string, string> = {}): ExecutionContext {
  const request = { headers, user: undefined };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClerkAuthGuard,
        { provide: UsersService, useValue: mockUsersService },
        { provide: 'CLERK_CLIENT', useValue: mockClerkClient },
      ],
    }).compile();
    guard = module.get(ClerkAuthGuard);
  });

  it('sets request.user and returns true for valid token', async () => {
    mockClerkClient.verifyToken.mockResolvedValue({ sub: 'clerk-abc' });
    mockUsersService.findOrCreate.mockResolvedValue(mockUser);

    const ctx = createContext({ authorization: 'Bearer valid-token' });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(ctx.switchToHttp().getRequest().user).toEqual(mockUser);
    expect(mockUsersService.findOrCreate).toHaveBeenCalledWith('clerk-abc');
  });

  it('throws UnauthorizedException when Authorization header is missing', async () => {
    const ctx = createContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      'Authentication required',
    );
  });

  it('throws UnauthorizedException when token is invalid', async () => {
    mockClerkClient.verifyToken.mockRejectedValue(new Error('bad token'));
    const ctx = createContext({ authorization: 'Bearer bad-token' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      'Invalid or expired token',
    );
  });
});
