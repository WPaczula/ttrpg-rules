import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
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

const mockRepo = {
  findByClerkId: jest.fn(),
  create: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  describe('findOrCreate', () => {
    it('returns existing user if found', async () => {
      mockRepo.findByClerkId.mockResolvedValue(mockUser);
      const result = await service.findOrCreate('clerk-abc');
      expect(result).toEqual(mockUser);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('creates and returns user if not found', async () => {
      mockRepo.findByClerkId.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockUser);
      const result = await service.findOrCreate('clerk-abc');
      expect(mockRepo.create).toHaveBeenCalledWith('clerk-abc');
      expect(result).toEqual(mockUser);
    });
  });
});
