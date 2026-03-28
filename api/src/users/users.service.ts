import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async findOrCreate(clerkId: string): Promise<User> {
    const existing = await this.repository.findByClerkId(clerkId);
    if (existing) return existing;
    return this.repository.create(clerkId);
  }
}
