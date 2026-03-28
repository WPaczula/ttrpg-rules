import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByClerkId(clerkId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { clerkId } });
  }

  create(clerkId: string): Promise<User> {
    return this.prisma.user.create({ data: { clerkId } });
  }
}
