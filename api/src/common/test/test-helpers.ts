import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { AppModule } from '../../app.module';
import { AppExceptionFilter } from '../filters/app-exception.filter';
import { PrismaService } from '../../prisma/prisma.service';
import { execSync } from 'child_process';
import { ClerkAuthGuard } from '../../auth/guards/clerk-auth.guard';
import { Role, User } from '@prisma/client';

export async function createTestApp(
  activeUser?: User,
): Promise<INestApplication> {
  const mockGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
      if (activeUser) {
        context.switchToHttp().getRequest().user = activeUser;
      }
      return !!activeUser;
    },
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(ClerkAuthGuard)
    .useValue(mockGuard)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AppExceptionFilter());
  await app.init();
  return app;
}

export async function seedTestDatabase(): Promise<void> {
  execSync('npx prisma db seed', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: 'pipe',
  });
}

export async function cleanCharacterTables(
  prisma: PrismaService,
): Promise<void> {
  await prisma.characterMarkedTrait.deleteMany();
  await prisma.characterThresholdBonus.deleteMany();
  await prisma.characterDomainCard.deleteMany();
  await prisma.characterExperience.deleteMany();
  await prisma.character.deleteMany();
}

export async function cleanUserTables(prisma: PrismaService): Promise<void> {
  await cleanCharacterTables(prisma);
  await prisma.user.deleteMany();
}

export function makeTestUser(
  prisma: PrismaService,
  role: Role,
  clerkId: string,
): Promise<User> {
  return prisma.user.create({ data: { clerkId, role } });
}
