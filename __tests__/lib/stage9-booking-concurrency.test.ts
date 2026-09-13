import { AsyncLocalStorage } from 'async_hooks';

// Setup AsyncLocalStorage for real DB user authentication context
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

import { createBookingAction } from '@/lib/actions/index';
import { prisma } from '@/lib/prisma';
import { UserRole, WeddingStatus } from '@prisma/client';

// Extend timeout for DB operations
jest.setTimeout(300000);

describe('SECTION 5: REAL BOOKING APPLICATION-PATH CONCURRENCY', () => {
  const runId = `stage9_${Date.now()}`;
  let coupleUser: any;
  let wedding: any;

  beforeAll(async () => {
    coupleUser = await prisma.user.create({
      data: {
        email: `couple_${runId}@disposable.test`,
        clerkUserId: `clerk_c_${runId}`,
        role: UserRole.COUPLE,
        status: 'ACTIVE',
        coupleProfile: { create: {} },
      },
      include: { coupleProfile: true },
    });

    wedding = await prisma.wedding.create({
      data: {
        hostCoupleId: coupleUser.coupleProfile!.id,
        title: `Capacity 1 Wedding ${runId}`,
        slug: `capacity-1-wedding-${runId}`,
        description: 'Stage 9 Real Path Concurrency Verification',
        location: 'Jaipur, Rajasthan',
        category: 'HERITAGE',
        tier: 'ROYAL',
        durationDays: 2,
        date: new Date(Date.now() + 86400000 * 30),
        capacity: 1, // STRICTLY CAPACITY = 1
        pricePerGuest: 500,
        mainImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552',
        status: WeddingStatus.PUBLISHED,
        isDemo: false,
      },
    });
  });

  afterAll(async () => {
    try {
      if (coupleUser) {
        const bookings = await prisma.booking.findMany({ where: { weddingId: wedding.id }, select: { id: true } });
        for (const b of bookings) {
          await prisma.payment.deleteMany({ where: { bookingId: b.id } });
          await prisma.bookingGuest.deleteMany({ where: { bookingId: b.id } });
        }
        await prisma.notification.deleteMany({ where: { userId: coupleUser.id } });
        await prisma.booking.deleteMany({ where: { weddingId: wedding.id } });
        await prisma.wedding.delete({ where: { id: wedding.id } });
        await prisma.coupleProfile.deleteMany({ where: { userId: coupleUser.id } });
        await prisma.user.delete({ where: { id: coupleUser.id } });
      }

      const usersToDelete = await prisma.user.findMany({
        where: { email: { contains: runId } },
        select: { id: true },
      });
      for (const u of usersToDelete) {
        await prisma.travelerProfile.deleteMany({ where: { userId: u.id } });
        await prisma.user.delete({ where: { id: u.id } });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  async function createTestTraveler(suffix: string) {
    return prisma.user.create({
      data: {
        email: `traveler_${runId}_${suffix}@disposable.test`,
        clerkUserId: `clerk_t_${runId}_${suffix}`,
        role: UserRole.TRAVELER,
        status: 'ACTIVE',
        travelerProfile: {
          create: {
            fullName: `Traveler ${suffix}`,
            country: 'India',
            language: 'English',
          },
        },
      },
      include: { travelerProfile: true },
    });
  }

  async function batchCreateTravelers(prefix: string, count: number) {
    const results: any[] = [];
    for (let i = 0; i < count; i += 10) {
      const batchSize = Math.min(10, count - i);
      const batch = await Promise.all(
        Array.from({ length: batchSize }, (_, j) => createTestTraveler(`${prefix}_${i + j}`))
      );
      results.push(...batch);
    }
    return results;
  }

  it('TEST A: 2 simultaneous booking requests (Double-click) - exactly 1 succeeds', async () => {
    const travelerA = await createTestTraveler('A');
    const promisesA = [1, 2].map(() =>
      userContext.run(travelerA, async () => {
        try {
          const res = await createBookingAction({
            weddingId: wedding.id,
            date: wedding.date.toISOString(),
            guestsCount: 1,
            attendanceSide: 'BRIDE_SIDE',
          });
          return { success: true, bookingId: res.booking.id };
        } catch (err: any) {
          return { success: false, error: err.message };
        }
      })
    );
    const results = await Promise.all(promisesA);
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    console.log(`Test A results: ${successes.length} successes, ${failures.length} failures`);
    if (failures.length > 0) {
      console.log('Test A sample failure:', failures[0].error);
    }
    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);

    const activeBookings = await prisma.booking.findMany({
      where: { weddingId: wedding.id, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    });
    expect(activeBookings).toHaveLength(1);

    // Clean up before next test
    await prisma.notification.deleteMany({ where: { userId: coupleUser.id } });
    await prisma.booking.deleteMany({ where: { weddingId: wedding.id } });
  });

  it('TEST B: 10 simultaneous booking requests (Rapid clicks) - exactly 1 succeeds', async () => {
    const travelerB = await createTestTraveler('B');
    const promisesB = Array.from({ length: 10 }, () =>
      userContext.run(travelerB, async () => {
        try {
          const res = await createBookingAction({
            weddingId: wedding.id,
            date: wedding.date.toISOString(),
            guestsCount: 1,
            attendanceSide: 'BRIDE_SIDE',
          });
          return { success: true, bookingId: res.booking.id };
        } catch (err: any) {
          return { success: false, error: err.message };
        }
      })
    );
    const results = await Promise.all(promisesB);
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    console.log(`Test B results: ${successes.length} successes, ${failures.length} failures`);
    if (failures.length > 0) {
      console.log('Test B sample failure:', failures[0].error);
    }
    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(9);

    const activeBookings = await prisma.booking.findMany({
      where: { weddingId: wedding.id, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    });
    expect(activeBookings).toHaveLength(1);

    // Clean up before next test
    await prisma.notification.deleteMany({ where: { userId: coupleUser.id } });
    await prisma.booking.deleteMany({ where: { weddingId: wedding.id } });
  });

  it('TEST C: 20 simultaneous booking requests from 20 distinct travelers - exactly 1 succeeds', async () => {
    const travelersC = await batchCreateTravelers('C', 20);

    const promisesC = travelersC.map((t) =>
      userContext.run(t, async () => {
        try {
          const res = await createBookingAction({
            weddingId: wedding.id,
            date: wedding.date.toISOString(),
            guestsCount: 1,
            attendanceSide: 'BRIDE_SIDE',
          });
          return { success: true, travelerId: t.id, bookingId: res.booking.id };
        } catch (err: any) {
          return { success: false, travelerId: t.id, error: err.message };
        }
      })
    );
    const results = await Promise.all(promisesC);
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    console.log(`Test C results: ${successes.length} successes, ${failures.length} failures`);
    if (failures.length > 0) {
      console.log('Test C sample failure:', failures[0].error);
    }
    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(19);

    const activeBookings = await prisma.booking.findMany({
      where: { weddingId: wedding.id, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    });
    expect(activeBookings).toHaveLength(1);

    // Clean up before next test
    await prisma.notification.deleteMany({ where: { userId: coupleUser.id } });
    await prisma.booking.deleteMany({ where: { weddingId: wedding.id } });
  });

  it('TEST D: 50 simultaneous booking requests from 50 distinct travelers (capacity = 1) - exactly 1 succeeds', async () => {
    const travelersD = await batchCreateTravelers('D', 50);

    const promisesD = travelersD.map((t) =>
      userContext.run(t, async () => {
        try {
          const res = await createBookingAction({
            weddingId: wedding.id,
            date: wedding.date.toISOString(),
            guestsCount: 1,
            attendanceSide: 'BRIDE_SIDE',
          });
          return { success: true, travelerId: t.id, bookingId: res.booking.id };
        } catch (err: any) {
          return { success: false, travelerId: t.id, error: err.message };
        }
      })
    );
    const results = await Promise.all(promisesD);
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    console.log(`Test D results: ${successes.length} successes, ${failures.length} failures`);
    if (failures.length > 0) {
      console.log('Test D sample failure:', failures[0].error);
    }
    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(49);

    for (const f of failures) {
      expect(f.error).toMatch(/capacity|connection pool|timeout/i);
    }

    const activeBookings = await prisma.booking.findMany({
      where: { weddingId: wedding.id, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    });
    expect(activeBookings).toHaveLength(1);
  });
});
