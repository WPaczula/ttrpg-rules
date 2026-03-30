import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AppExceptionFilter } from '../src/common/filters/app-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { ClerkAuthGuard } from '../src/auth/guards/clerk-auth.guard';
import { SearchService } from '../src/search/search.service';
import { Role, User } from '@prisma/client';
import { makeTestUser, cleanUserTables } from '../src/common/test/test-helpers';
import { execSync } from 'child_process';

describe('Search Endpoint (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: User;

  beforeAll(async () => {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'pipe',
    });

    const mockSearchService = {
      search: jest.fn().mockResolvedValue([
        'Hope is a player resource used to activate abilities.',
        'Players gain hope when they roll with hope.',
      ]),
    };

    const mockGuard = {
      canActivate: (context: { switchToHttp: () => { getRequest: () => Record<string, unknown> } }) => {
        context.switchToHttp().getRequest().user = testUser;
        return true;
      },
    };

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue(mockGuard)
      .overrideProvider(SearchService)
      .useValue(mockSearchService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AppExceptionFilter());

    prisma = moduleFixture.get(PrismaService);
    await prisma.user.deleteMany();
    testUser = await makeTestUser(prisma, Role.PC, 'search-test-user');

    await app.init();
  });

  afterAll(async () => {
    await cleanUserTables(prisma);
    await app.close();
  });

  describe('POST /search', () => {
    it('returns search results as string array', async () => {
      const res = await request(app.getHttpServer())
        .post('/search')
        .send({ query: 'how does hope work?' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toContain('Hope');
    });

    it('accepts optional limit and category', async () => {
      await request(app.getHttpServer())
        .post('/search')
        .send({ query: 'attack', limit: 3, category: 'classes' })
        .expect(200);
    });

    it('rejects empty query', async () => {
      await request(app.getHttpServer())
        .post('/search')
        .send({ query: '' })
        .expect(400);
    });

    it('rejects missing query', async () => {
      await request(app.getHttpServer())
        .post('/search')
        .send({ limit: 5 })
        .expect(400);
    });

    it('rejects limit out of range', async () => {
      await request(app.getHttpServer())
        .post('/search')
        .send({ query: 'test', limit: 50 })
        .expect(400);
    });
  });
});
