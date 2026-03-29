import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  seedTestDatabase,
  cleanUserTables,
  makeTestUser,
} from '../src/common/test/test-helpers';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { execSync } from 'child_process';

describe('SRD Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: User;

  beforeAll(async () => {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'pipe',
    });
    const tempApp = await createTestApp(undefined);
    prisma = tempApp.get(PrismaService);
    await seedTestDatabase();
    await prisma.user.deleteMany();
    testUser = await makeTestUser(prisma, Role.PC, 'srd-test-user');
    await tempApp.close();
    app = await createTestApp(testUser);
  });

  afterAll(async () => {
    await cleanUserTables(prisma);
    await app.close();
  });

  describe('GET /srd/classes', () => {
    it('should return all classes', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/classes')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const warrior = res.body.find(
        (c: { name: string }) => c.name === 'Warrior',
      );
      expect(warrior).toBeDefined();
      expect(warrior.evasion).toBeDefined();
      expect(warrior.hp).toBeDefined();
      expect(warrior.features).toBeDefined();
      expect(warrior.domains).toBeDefined();
      expect(warrior.subclasses).toBeDefined();
    });
  });

  describe('GET /srd/classes/:id', () => {
    it('should return a single class', async () => {
      const listRes = await request(app.getHttpServer()).get('/srd/classes');
      const classId = listRes.body[0].id;

      const res = await request(app.getHttpServer())
        .get(`/srd/classes/${classId}`)
        .expect(200);

      expect(res.body.id).toBe(classId);
      expect(res.body.name).toBeDefined();
      expect(res.body.features).toBeDefined();
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/classes/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('SRD_RESOURCE_NOT_FOUND');
    });
  });

  describe('GET /srd/subclasses', () => {
    it('should return all subclasses with features', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/subclasses')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].features).toBeDefined();
      expect(res.body[0].className).toBeDefined();
    });
  });

  describe('GET /srd/ancestries', () => {
    it('should return all ancestries with features', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/ancestries')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].features).toBeDefined();
    });
  });

  describe('GET /srd/communities', () => {
    it('should return all communities with features', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/communities')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].note).toBeDefined();
    });
  });

  describe('GET /srd/domains', () => {
    it('should return all domains with cards and classes', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/domains')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].cards).toBeDefined();
      expect(res.body[0].classes).toBeDefined();
    });
  });

  describe('GET /srd/domain-cards', () => {
    it('should return all domain cards', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/domain-cards')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].domainName).toBeDefined();
    });

    it('should filter by domain name', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/domain-cards?domain=Arcana')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(
        res.body.every(
          (c: { domainName: string }) => c.domainName === 'Arcana',
        ),
      ).toBe(true);
    });

    it('should filter by level', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/domain-cards?level=1')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((c: { level: number }) => c.level === 1)).toBe(
        true,
      );
    });
  });

  describe('GET /srd/weapons', () => {
    it('should return all weapons', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/weapons')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter by tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/weapons?tier=1')
        .expect(200);

      expect(res.body.every((w: { tier: number }) => w.tier === 1)).toBe(true);
    });

    it('should filter by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/weapons?type=Primary')
        .expect(200);

      expect(
        res.body.every((w: { type: string }) => w.type === 'Primary'),
      ).toBe(true);
    });

    it('should reject invalid tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/weapons?tier=99')
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /srd/armor', () => {
    it('should return all armor', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/armor')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter by tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/armor?tier=1')
        .expect(200);

      expect(res.body.every((a: { tier: number }) => a.tier === 1)).toBe(true);
    });
  });

  describe('GET /srd/adversaries', () => {
    it('should return all adversaries with features', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/adversaries')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].tier).toBeDefined();
      expect(res.body[0].type).toBeDefined();
      expect(res.body[0].features).toBeDefined();
    });

    it('should filter by tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/adversaries?tier=1')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((a: { tier: number }) => a.tier === 1)).toBe(true);
    });

    it('should filter by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/adversaries?type=Solo')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((a: { type: string }) => a.type === 'Solo')).toBe(
        true,
      );
    });
  });

  describe('GET /srd/adversaries/:id', () => {
    it('should return a single adversary', async () => {
      const listRes = await request(app.getHttpServer()).get(
        '/srd/adversaries',
      );
      const id = listRes.body[0].id;

      const res = await request(app.getHttpServer())
        .get(`/srd/adversaries/${id}`)
        .expect(200);

      expect(res.body.id).toBe(id);
      expect(res.body.features).toBeDefined();
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/adversaries/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('SRD_RESOURCE_NOT_FOUND');
    });
  });

  describe('GET /srd/beastforms', () => {
    it('should return all beastforms with features', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/beastforms')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].traitBonus).toBeDefined();
      expect(res.body[0].features).toBeDefined();
    });

    it('should filter by tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/beastforms?tier=1')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((b: { tier: number }) => b.tier === 1)).toBe(true);
    });
  });

  describe('GET /srd/beastforms/:id', () => {
    it('should return a single beastform', async () => {
      const listRes = await request(app.getHttpServer()).get('/srd/beastforms');
      const id = listRes.body[0].id;

      const res = await request(app.getHttpServer())
        .get(`/srd/beastforms/${id}`)
        .expect(200);

      expect(res.body.id).toBe(id);
      expect(res.body.features).toBeDefined();
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/beastforms/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('SRD_RESOURCE_NOT_FOUND');
    });
  });

  describe('GET /srd/consumables', () => {
    it('should return all consumables ordered by roll', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/consumables')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].roll).toBeDefined();
      expect(res.body[0].description).toBeDefined();
    });
  });

  describe('GET /srd/consumables/:id', () => {
    it('should return a single consumable', async () => {
      const listRes = await request(app.getHttpServer()).get(
        '/srd/consumables',
      );
      const id = listRes.body[0].id;

      const res = await request(app.getHttpServer())
        .get(`/srd/consumables/${id}`)
        .expect(200);

      expect(res.body.id).toBe(id);
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/consumables/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('SRD_RESOURCE_NOT_FOUND');
    });
  });

  describe('GET /srd/environments', () => {
    it('should return all environments with features', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/environments')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].impulses).toBeDefined();
      expect(res.body[0].features).toBeDefined();
    });

    it('should filter by tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/environments?tier=1')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((e: { tier: number }) => e.tier === 1)).toBe(true);
    });

    it('should filter by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/environments?type=Exploration')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(
        res.body.every((e: { type: string }) => e.type === 'Exploration'),
      ).toBe(true);
    });
  });

  describe('GET /srd/environments/:id', () => {
    it('should return a single environment with feature questions', async () => {
      const listRes = await request(app.getHttpServer()).get(
        '/srd/environments',
      );
      const id = listRes.body[0].id;

      const res = await request(app.getHttpServer())
        .get(`/srd/environments/${id}`)
        .expect(200);

      expect(res.body.id).toBe(id);
      expect(res.body.features).toBeDefined();
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/environments/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('SRD_RESOURCE_NOT_FOUND');
    });
  });

  describe('GET /srd/items', () => {
    it('should return all items ordered by roll', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/items')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].roll).toBeDefined();
      expect(res.body[0].description).toBeDefined();
    });
  });

  describe('GET /srd/items/:id', () => {
    it('should return a single item', async () => {
      const listRes = await request(app.getHttpServer()).get('/srd/items');
      const id = listRes.body[0].id;

      const res = await request(app.getHttpServer())
        .get(`/srd/items/${id}`)
        .expect(200);

      expect(res.body.id).toBe(id);
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/items/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('SRD_RESOURCE_NOT_FOUND');
    });
  });
});
