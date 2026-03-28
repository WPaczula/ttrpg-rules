import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, seedTestDatabase } from '../src/common/test/test-helpers';
import { execSync } from 'child_process';

describe('SRD Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Apply migrations and seed test DB
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'pipe',
    });
    await seedTestDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /srd/classes', () => {
    it('should return all classes', async () => {
      const res = await request(app.getHttpServer()).get('/srd/classes').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const warrior = res.body.find((c: { name: string }) => c.name === 'Warrior');
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

      const res = await request(app.getHttpServer()).get(`/srd/classes/${classId}`).expect(200);

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
      const res = await request(app.getHttpServer()).get('/srd/subclasses').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].features).toBeDefined();
      expect(res.body[0].className).toBeDefined();
    });
  });

  describe('GET /srd/ancestries', () => {
    it('should return all ancestries with features', async () => {
      const res = await request(app.getHttpServer()).get('/srd/ancestries').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].features).toBeDefined();
    });
  });

  describe('GET /srd/communities', () => {
    it('should return all communities with features', async () => {
      const res = await request(app.getHttpServer()).get('/srd/communities').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].note).toBeDefined();
    });
  });

  describe('GET /srd/domains', () => {
    it('should return all domains with cards and classes', async () => {
      const res = await request(app.getHttpServer()).get('/srd/domains').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].cards).toBeDefined();
      expect(res.body[0].classes).toBeDefined();
    });
  });

  describe('GET /srd/domain-cards', () => {
    it('should return all domain cards', async () => {
      const res = await request(app.getHttpServer()).get('/srd/domain-cards').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].domainName).toBeDefined();
    });

    it('should filter by domain name', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/domain-cards?domain=Arcana')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((c: { domainName: string }) => c.domainName === 'Arcana')).toBe(true);
    });

    it('should filter by level', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/domain-cards?level=1')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((c: { level: number }) => c.level === 1)).toBe(true);
    });
  });

  describe('GET /srd/weapons', () => {
    it('should return all weapons', async () => {
      const res = await request(app.getHttpServer()).get('/srd/weapons').expect(200);

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

      expect(res.body.every((w: { type: string }) => w.type === 'Primary')).toBe(true);
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
      const res = await request(app.getHttpServer()).get('/srd/armor').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter by tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/armor?tier=1')
        .expect(200);

      expect(res.body.every((a: { tier: number }) => a.tier === 1)).toBe(true);
    });
  });
});
