import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanCharacterTables } from '../src/common/test/test-helpers';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Characters Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // SRD IDs populated in beforeAll
  let classId: string;
  let subclassId: string;
  let ancestryId: string;
  let ancestryFeatureId: string;
  let communityId: string;
  let weaponId: string;
  let armorId: string;
  let domainCardId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    // Fetch SRD IDs for test data
    const srdClass = await prisma.srdClass.findFirst({ include: { subclasses: true, domains: { include: { domain: { include: { cards: true } } } } } });
    classId = srdClass!.id;
    subclassId = srdClass!.subclasses[0].id;

    const ancestry = await prisma.ancestry.findFirst({ include: { features: true } });
    ancestryId = ancestry!.id;
    ancestryFeatureId = ancestry!.features[0].id;

    const community = await prisma.community.findFirst();
    communityId = community!.id;

    const weapon = await prisma.weapon.findFirst({ where: { type: 'Primary' } });
    weaponId = weapon!.id;

    const armor = await prisma.armor.findFirst();
    armorId = armor!.id;

    const domainCard = srdClass!.domains[0].domain.cards[0];
    domainCardId = domainCard!.id;
  });

  beforeEach(async () => {
    await cleanCharacterTables(prisma);
  });

  afterAll(async () => {
    await cleanCharacterTables(prisma);
    await app.close();
  });

  function validCreateBody() {
    return {
      name: 'Test Character',
      classId,
      subclassId,
      ancestryId,
      ancestryFeatureId,
      communityId,
      agility: 0,
      strength: 2,
      finesse: 1,
      instinct: 1,
      presence: 0,
      knowledge: -1,
    };
  }

  describe('POST /characters', () => {
    it('should create a character and return computed stats', async () => {
      const res = await request(app.getHttpServer())
        .post('/characters')
        .send(validCreateBody())
        .expect(201);

      expect(res.body.character.name).toBe('Test Character');
      expect(res.body.character.id).toBeDefined();
      expect(res.body.computed).toBeDefined();
      expect(res.body.computed.tier).toBe(1);
    });

    it('should reject invalid SRD classId', async () => {
      const res = await request(app.getHttpServer())
        .post('/characters')
        .send({ ...validCreateBody(), classId: '00000000-0000-0000-0000-000000000000' })
        .expect(400);

      expect(res.body.error).toBe('INVALID_SRD_REFERENCE');
    });

    it('should reject missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Incomplete' })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('should set hpTotal and evasion from class defaults', async () => {
      const res = await request(app.getHttpServer())
        .post('/characters')
        .send(validCreateBody())
        .expect(201);

      expect(res.body.character.hpTotal).toBeGreaterThan(0);
      expect(res.body.character.evasion).toBeGreaterThan(0);
    });
  });

  describe('GET /characters', () => {
    it('should return empty array when no characters', async () => {
      const res = await request(app.getHttpServer()).get('/characters').expect(200);
      expect(res.body).toEqual([]);
    });

    it('should return all characters', async () => {
      await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      await request(app.getHttpServer()).post('/characters').send({ ...validCreateBody(), name: 'Second' });

      const res = await request(app.getHttpServer()).get('/characters').expect(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('GET /characters/:id', () => {
    it('should return character with computed stats', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send({
        ...validCreateBody(),
        armorId,
        primaryWeaponId: weaponId,
      });
      const id = createRes.body.character.id;

      const res = await request(app.getHttpServer()).get(`/characters/${id}`).expect(200);

      expect(res.body.character.id).toBe(id);
      expect(res.body.computed.tier).toBe(1);
      expect(res.body.computed.thresholds).toBeDefined();
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/characters/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('CHARACTER_NOT_FOUND');
    });
  });

  describe('PATCH /characters/:id', () => {
    it('should update mutable state', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      const id = createRes.body.character.id;

      const res = await request(app.getHttpServer())
        .patch(`/characters/${id}`)
        .send({ hpMarked: 3, hope: 5, goldHandfuls: 2 })
        .expect(200);

      expect(res.body.character.hpMarked).toBe(3);
      expect(res.body.character.hope).toBe(5);
      expect(res.body.character.goldHandfuls).toBe(2);
    });

    it('should reject unknown fields', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      const id = createRes.body.character.id;

      await request(app.getHttpServer())
        .patch(`/characters/${id}`)
        .send({ invalidField: 99 })
        .expect(400);
    });
  });

  describe('DELETE /characters/:id', () => {
    it('should delete character', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      const id = createRes.body.character.id;

      await request(app.getHttpServer()).delete(`/characters/${id}`).expect(204);
      await request(app.getHttpServer()).get(`/characters/${id}`).expect(404);
    });
  });

  describe('Experiences sub-resource', () => {
    it('should add, update, and remove experiences', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      const charId = createRes.body.character.id;

      // Add
      const addRes = await request(app.getHttpServer())
        .post(`/characters/${charId}/experiences`)
        .send({ name: 'Lore Scholar', modifier: 3 })
        .expect(201);
      const expId = addRes.body.id;

      // Update
      const updateRes = await request(app.getHttpServer())
        .patch(`/characters/${charId}/experiences/${expId}`)
        .send({ modifier: 4 })
        .expect(200);
      expect(updateRes.body.modifier).toBe(4);

      // Remove
      await request(app.getHttpServer())
        .delete(`/characters/${charId}/experiences/${expId}`)
        .expect(204);

      // Verify removed
      const charRes = await request(app.getHttpServer()).get(`/characters/${charId}`).expect(200);
      expect(charRes.body.character.experiences).toHaveLength(0);
    });
  });

  describe('Domain cards sub-resource', () => {
    it('should add and remove domain cards', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      const charId = createRes.body.character.id;

      // Add
      await request(app.getHttpServer())
        .post(`/characters/${charId}/domain-cards`)
        .send({ domainCardId })
        .expect(201);

      // Verify in character
      const charRes = await request(app.getHttpServer()).get(`/characters/${charId}`).expect(200);
      expect(charRes.body.character.domainCards).toHaveLength(1);

      // Remove
      const cardRelationId = charRes.body.character.domainCards[0].id;
      await request(app.getHttpServer())
        .delete(`/characters/${charId}/domain-cards/${cardRelationId}`)
        .expect(204);
    });

    it('should reject duplicate domain card', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      const charId = createRes.body.character.id;

      await request(app.getHttpServer())
        .post(`/characters/${charId}/domain-cards`)
        .send({ domainCardId })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post(`/characters/${charId}/domain-cards`)
        .send({ domainCardId })
        .expect(409);

      expect(res.body.error).toBe('DUPLICATE_DOMAIN_CARD');
    });
  });
});
