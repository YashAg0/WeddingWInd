import { AsyncLocalStorage } from 'async_hooks';

const userContext = new AsyncLocalStorage<any>();

const mockRequireAuth = jest.fn(async () => {
  const user = userContext.getStore();
  if (user) return user;
  throw new Error("UNAUTHORIZED: Test user context missing");
});

jest.mock('@/lib/auth', () => {
  const actualAuth = jest.requireActual('@/lib/auth');
  return {
    ...actualAuth,
    requireAuth: mockRequireAuth,
  };
});

jest.mock('../../lib/auth', () => {
  const actualAuth = jest.requireActual('../../lib/auth');
  return {
    ...actualAuth,
    requireAuth: mockRequireAuth,
  };
});

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

import { createWedding } from '@/lib/actions/index';
import { saveHostApplicationDraftAction } from '@/lib/actions/host-application';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

jest.setTimeout(300000);

const isLiveDb = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost:5432'));
const describeLive = isLiveDb ? describe : describe.skip;

describeLive('STAGE 9 SECTIONS 6 & 7: DRAFT CREATION & HOST APPLICATION CONCURRENCY IDEMPOTENCY', () => {
  const runId = `stage9_draft_${Date.now()}`;
  const createdUserIds: string[] = [];

  async function createFreshCoupleUser(suffix: string) {
    const user = await prisma.user.create({
      data: {
        email: `couple_${runId}_${suffix}@disposable.test`,
        clerkUserId: `clerk_c_${runId}_${suffix}`,
        role: UserRole.COUPLE,
        status: 'ACTIVE',
        coupleProfile: { create: {} },
      },
      include: { coupleProfile: true },
    });
    createdUserIds.push(user.id);
    return user;
  }

  afterAll(async () => {
    try {
      await prisma.$disconnect();
    } catch {}
  });

  describe('SECTION 6: DRAFT CREATION IDEMPOTENCY — REAL FIRST-TIME CREATION PATH', () => {
    it('TEST A & C: 2 simultaneous first-time create requests (double-click) - exactly 1 Wedding row created', async () => {
      const couple = await createFreshCoupleUser('A');
      const weddingPayload = {
        title: `Double Click Wedding ${runId}`,
        description: 'First time creation double click test',
        location: 'Jaipur, Rajasthan',
        category: 'ROYAL',
        date: new Date('2027-06-01').toISOString(),
        pricePerGuest: '500',
        capacity: '50',
        mainImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552',
      };

      const promises = [1, 2].map(() =>
        userContext.run(couple, async () => {
          return createWedding(weddingPayload);
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[0].wedding.id).toBe(results[1].wedding.id);

      const dbWeddings = await prisma.wedding.findMany({
        where: { hostCoupleId: couple.coupleProfile.id, deletedAt: null },
      });
      expect(dbWeddings).toHaveLength(1);
      expect(dbWeddings[0].id).toBe(results[0].wedding.id);
    });

    it('TEST D: 10 simultaneous first-time create requests (rapid clicks) - exactly 1 Wedding row created', async () => {
      const couple = await createFreshCoupleUser('D');
      const weddingPayload = {
        title: `Rapid Clicks Wedding ${runId}`,
        description: 'First time creation 10 concurrent requests test',
        location: 'Udaipur, Rajasthan',
        category: 'HERITAGE',
        date: new Date('2027-07-01').toISOString(),
        pricePerGuest: '600',
        capacity: '80',
        mainImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552',
      };

      const promises = Array.from({ length: 10 }, () =>
        userContext.run(couple, async () => {
          return createWedding(weddingPayload);
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      const firstId = results[0].wedding.id;

      for (let i = 0; i < 10; i++) {
        expect(results[i].success).toBe(true);
        expect(results[i].wedding.id).toBe(firstId);
      }

      const dbWeddings = await prisma.wedding.findMany({
        where: { hostCoupleId: couple.coupleProfile.id, deletedAt: null },
      });
      expect(dbWeddings).toHaveLength(1);
      expect(dbWeddings[0].id).toBe(firstId);
    });

    it('TEST E: 20 simultaneous first-time create requests - exactly 1 Wedding row created', async () => {
      const couple = await createFreshCoupleUser('E');
      const weddingPayload = {
        title: `20 Concurrency Wedding ${runId}`,
        description: 'First time creation 20 concurrent requests test',
        location: 'Goa, India',
        category: 'BEACH',
        date: new Date('2027-08-01').toISOString(),
        pricePerGuest: '750',
        capacity: '100',
        mainImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552',
      };

      const promises = Array.from({ length: 20 }, () =>
        userContext.run(couple, async () => {
          return createWedding(weddingPayload);
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(20);
      const firstId = results[0].wedding.id;

      for (const r of results) {
        expect(r.success).toBe(true);
        expect(r.wedding.id).toBe(firstId);
      }

      const dbWeddings = await prisma.wedding.findMany({
        where: { hostCoupleId: couple.coupleProfile.id, deletedAt: null },
      });
      expect(dbWeddings).toHaveLength(1);
      expect(dbWeddings[0].id).toBe(firstId);
    });
  });

  describe('SECTION 7: HOST APPLICATION CONCURRENCY IDEMPOTENCY', () => {
    it('TEST F: 2 simultaneous first-time saveHostApplicationDraftAction requests - exactly 1 HostApplication created', async () => {
      const hostUser = await createFreshCoupleUser('F');
      const hostInput = {
        hostName: `Host F ${runId}`,
        email: hostUser.email,
        coupleNames: `Bride F & Groom F`,
        city: 'Mumbai',
        weddingDate: '2027-09-01',
        durationDays: 3,
        expectedTotalGuests: 250,
        expectedInternationalGuests: 20,
      };

      const promises = [1, 2].map(() =>
        userContext.run(hostUser, async () => {
          return saveHostApplicationDraftAction(hostInput);
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[0].applicationId).toBe(results[1].applicationId);

      const dbApps = await prisma.hostApplication.findMany({
        where: { userId: hostUser.id },
      });
      expect(dbApps).toHaveLength(1);
      expect(dbApps[0].id).toBe(results[0].applicationId);
    });

    it('TEST G: 10 simultaneous first-time saveHostApplicationDraftAction requests - exactly 1 HostApplication created', async () => {
      const hostUser = await createFreshCoupleUser('G');
      const hostInput = {
        hostName: `Host G ${runId}`,
        email: hostUser.email,
        coupleNames: `Bride G & Groom G`,
        city: 'Delhi',
        weddingDate: '2027-10-01',
        durationDays: 3,
        expectedTotalGuests: 300,
        expectedInternationalGuests: 25,
      };

      const promises = Array.from({ length: 10 }, () =>
        userContext.run(hostUser, async () => {
          return saveHostApplicationDraftAction(hostInput);
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      const firstId = results[0].applicationId;

      for (const r of results) {
        expect(r.success).toBe(true);
        expect(r.applicationId).toBe(firstId);
      }

      const dbApps = await prisma.hostApplication.findMany({
        where: { userId: hostUser.id },
      });
      expect(dbApps).toHaveLength(1);
      expect(dbApps[0].id).toBe(firstId);
    });

    it('TEST H: 20 simultaneous first-time saveHostApplicationDraftAction requests - exactly 1 HostApplication created', async () => {
      const hostUser = await createFreshCoupleUser('H');
      const hostInput = {
        hostName: `Host H ${runId}`,
        email: hostUser.email,
        coupleNames: `Bride H & Groom H`,
        city: 'Bengaluru',
        weddingDate: '2027-11-01',
        durationDays: 4,
        expectedTotalGuests: 350,
        expectedInternationalGuests: 30,
      };

      const promises = Array.from({ length: 20 }, () =>
        userContext.run(hostUser, async () => {
          return saveHostApplicationDraftAction(hostInput);
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(20);
      const firstId = results[0].applicationId;

      for (const r of results) {
        expect(r.success).toBe(true);
        expect(r.applicationId).toBe(firstId);
      }

      const dbApps = await prisma.hostApplication.findMany({
        where: { userId: hostUser.id },
      });
      expect(dbApps).toHaveLength(1);
      expect(dbApps[0].id).toBe(firstId);
    });
  });
});
