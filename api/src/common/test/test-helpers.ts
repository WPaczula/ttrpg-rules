import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { AppExceptionFilter } from '../filters/app-exception.filter';
import { PrismaService } from '../../prisma/prisma.service';
import { execSync } from 'child_process';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

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

export async function cleanCharacterTables(prisma: PrismaService): Promise<void> {
  await prisma.characterMarkedTrait.deleteMany();
  await prisma.characterThresholdBonus.deleteMany();
  await prisma.characterDomainCard.deleteMany();
  await prisma.characterExperience.deleteMany();
  await prisma.character.deleteMany();
}
