/**
 * scripts/safe-database-cleanup.js
 * 
 * Forensically safe database cleanup:
 * 1. Identifies proven synthetic E2E and unit test records
 * 2. Deletes synthetic dependencies in strict topological order
 * 3. Deduplicates real host drafts (preserving canonical originals for Dilip & Karishma and Gaurav Kumar)
 * 4. Preserves 100% of real user accounts and the 21 curated showcase weddings
 * 5. Reports before and after counts
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runCleanup() {
  console.log('====================================================');
  console.log('  FORENSIC DATA CLEANUP — WEDDINGWITHINDIA');
  console.log('====================================================\n');

  // 1. Snapshot Before Counts
  const beforeWeddings = await prisma.wedding.count();
  const beforeUsers = await prisma.user.count();
  const beforeBookings = await prisma.booking.count();
  const beforePayments = await prisma.payment.count();

  console.log('BEFORE CLEANUP:');
  console.log(`  Total Weddings: ${beforeWeddings}`);
  console.log(`  Total Users:    ${beforeUsers}`);
  console.log(`  Total Bookings: ${beforeBookings}`);
  console.log(`  Total Payments: ${beforePayments}\n`);

  // 2. Identify Synthetic Weddings
  const syntheticWeddings = await prisma.wedding.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'e2e-' } },
        { slug: { startsWith: 'capacity-' } },
        { slug: { startsWith: 'double-click-' } },
        { slug: { startsWith: 'rapid-clicks-' } },
        { slug: { startsWith: '20-concurrency-' } },
        { slug: { contains: 'test_pp' } },
        { slug: { contains: 'deleted-secret' } },
      ]
    },
    select: { id: true, slug: true, title: true }
  });

  const syntheticWeddingIds = syntheticWeddings.map(w => w.id);
  console.log(`Identified ${syntheticWeddingIds.length} synthetic test weddings.`);

  // 3. Identify Duplicate Host Drafts to remove (keeping canonical originals)
  // Dilip: keep 'dilip-karishma-a-promise-sealed-with-love-dil-ka-rishta' (id: '61a0a501-c4ed-405a-8ba0-d5a7051ea024')
  const dilipDuplicates = await prisma.wedding.findMany({
    where: {
      slug: { startsWith: 'dilip-karishma-' },
      id: { not: '61a0a501-c4ed-405a-8ba0-d5a7051ea024' }
    },
    select: { id: true, slug: true }
  });
  const dilipDuplicateIds = dilipDuplicates.map(w => w.id);
  console.log(`Identified ${dilipDuplicateIds.length} duplicate draft weddings for Dilip & Karishma.`);

  // Gaurav: keep 'bihari-traditional-wedding' (id: '142b58da-faa2-4eac-bf31-c9b2980f4167')
  const gauravDuplicates = await prisma.wedding.findMany({
    where: {
      slug: 'bihari-traditional-wedding-6378',
      id: { not: '142b58da-faa2-4eac-bf31-c9b2980f4167' }
    },
    select: { id: true, slug: true }
  });
  const gauravDuplicateIds = gauravDuplicates.map(w => w.id);
  console.log(`Identified ${gauravDuplicateIds.length} duplicate draft weddings for Gaurav Kumar.`);

  const allWeddingsToDelete = [...syntheticWeddingIds, ...dilipDuplicateIds, ...gauravDuplicateIds];
  console.log(`Total weddings to remove: ${allWeddingsToDelete.length}\n`);

  // 4. Identify Synthetic Test Users
  const syntheticUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { startsWith: 'host.e2e.' } },
        { email: { startsWith: 'traveler.e2e.' } },
        { email: { startsWith: 'lifecycle.traveler.' } },
        { email: { startsWith: 'couple_stage9_' } },
        { email: { contains: 'test_pp_' } },
      ]
    },
    select: { id: true, email: true }
  });
  const syntheticUserIds = syntheticUsers.map(u => u.id);
  console.log(`Found ${syntheticUserIds.length} synthetic test user accounts.`);

  // 5. Safe Topological Deletion
  // A. Find bookings associated with synthetic weddings OR synthetic users
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { weddingId: { in: allWeddingsToDelete } },
        { traveler: { userId: { in: syntheticUserIds } } }
      ]
    },
    select: { id: true }
  });
  const bookingIds = bookings.map(b => b.id);
  console.log(`Found ${bookingIds.length} bookings on target weddings/synthetic users.`);

  if (bookingIds.length > 0) {
    // Delete child relations of payments and bookings in strict topological order
    await prisma.commission.deleteMany({
      where: {
        OR: [
          { bookingId: { in: bookingIds } },
          { payment: { bookingId: { in: bookingIds } } }
        ]
      }
    });
    await prisma.transaction.deleteMany({ where: { payment: { bookingId: { in: bookingIds } } } });
    await prisma.refund.deleteMany({ where: { payment: { bookingId: { in: bookingIds } } } });
    await prisma.payout.deleteMany({ where: { payment: { bookingId: { in: bookingIds } } } });
    await prisma.paymentIntent.deleteMany({ where: { payment: { bookingId: { in: bookingIds } } } });
    await prisma.payment.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.guestPass.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.cancellationRequest.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.review.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.bookingGuest.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.emergencyContact.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.safetyCase.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.travelDetail.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.travelerPreparation.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.conversation.deleteMany({ where: { bookingId: { in: bookingIds } } });

    // Delete the bookings
    const deletedBookings = await prisma.booking.deleteMany({
      where: { id: { in: bookingIds } }
    });
    console.log(`  ✓ Deleted ${deletedBookings.count} synthetic bookings and their relations.`);
  }

  // B. Delete child relations of weddings
  await prisma.weddingEvent.deleteMany({ where: { weddingId: { in: allWeddingsToDelete } } });
  await prisma.weddingTradition.deleteMany({ where: { weddingId: { in: allWeddingsToDelete } } });
  await prisma.weddingGallery.deleteMany({ where: { weddingId: { in: allWeddingsToDelete } } });
  await prisma.weddingItineraryItem.deleteMany({ where: { weddingId: { in: allWeddingsToDelete } } });
  await prisma.weddingQualityBadge.deleteMany({ where: { weddingId: { in: allWeddingsToDelete } } });
  await prisma.weddingAnnouncement.deleteMany({ where: { weddingId: { in: allWeddingsToDelete } } });
  await prisma.eventContact.deleteMany({ where: { weddingId: { in: allWeddingsToDelete } } });
  await prisma.recentlyViewed.deleteMany({ where: { weddingId: { in: allWeddingsToDelete } } });
  await prisma.wishlist.deleteMany({ where: { weddingId: { in: allWeddingsToDelete } } });
  await prisma.sponsorshipRequest.deleteMany({ where: { weddingId: { in: allWeddingsToDelete } } });
  await prisma.auditLog.deleteMany({ where: { entityId: { in: allWeddingsToDelete } } });

  // C. Delete the weddings
  const deletedWeddings = await prisma.wedding.deleteMany({
    where: { id: { in: allWeddingsToDelete } }
  });
  console.log(`  ✓ Deleted ${deletedWeddings.count} contaminated wedding records.`);

  // D. Delete synthetic test users and their remaining profiles
  if (syntheticUserIds.length > 0) {
    await prisma.travelerProfile.deleteMany({ where: { userId: { in: syntheticUserIds } } });
    await prisma.coupleProfile.deleteMany({ where: { userId: { in: syntheticUserIds } } });
    await prisma.agentProfile.deleteMany({ where: { userId: { in: syntheticUserIds } } });
    await prisma.coordinatorProfile.deleteMany({ where: { userId: { in: syntheticUserIds } } });
    await prisma.verification.deleteMany({ where: { userId: { in: syntheticUserIds } } });
    await prisma.auditLog.deleteMany({ where: { userId: { in: syntheticUserIds } } });
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: syntheticUserIds } }
    });
    console.log(`  ✓ Deleted ${deletedUsers.count} synthetic test users.`);
  }

  // 5. Update showcase demo wedding dates so they are current/future (Nov 2026 - Mar 2027)
  console.log('\nUpdating 21 curated showcase wedding dates to active season (Nov 2026)...');
  const demoWeddings = await prisma.wedding.findMany({
    where: { isDemo: true }
  });

  // Base future date: 2026-11-15
  const baseFutureDate = new Date('2026-11-15T10:00:00.000Z');
  for (let i = 0; i < demoWeddings.length; i++) {
    const w = demoWeddings[i];
    const eventDate = new Date(baseFutureDate.getTime() + i * 3 * 86400000);
    await prisma.wedding.update({
      where: { id: w.id },
      data: { date: eventDate }
    });
  }
  console.log(`  ✓ Updated ${demoWeddings.length} showcase wedding dates to active future schedule.`);

  // 6. Snapshot After Counts
  const afterWeddings = await prisma.wedding.count();
  const afterUsers = await prisma.user.count();
  const afterBookings = await prisma.booking.count();
  const afterPayments = await prisma.payment.count();

  console.log('\nAFTER CLEANUP:');
  console.log(`  Total Weddings: ${afterWeddings} (Removed ${beforeWeddings - afterWeddings})`);
  console.log(`  Total Users:    ${afterUsers} (Removed ${beforeUsers - afterUsers})`);
  console.log(`  Total Bookings: ${afterBookings} (Removed ${beforeBookings - afterBookings})`);
  console.log(`  Total Payments: ${afterPayments} (Removed ${beforePayments - afterPayments})`);

  // 7. Verify Integrity
  const remainingSynthetic = await prisma.wedding.count({
    where: {
      OR: [
        { slug: { startsWith: 'e2e-' } },
        { slug: { startsWith: 'capacity-' } },
        { slug: { contains: 'test_pp' } },
        { slug: { contains: 'deleted-secret' } },
      ]
    }
  });
  console.log(`\nRemaining Synthetic Weddings: ${remainingSynthetic} (Expected: 0)`);

  const remainingDilip = await prisma.wedding.count({
    where: { slug: { startsWith: 'dilip-karishma' } }
  });
  console.log(`Remaining Dilip & Karishma Weddings: ${remainingDilip} (Expected: 1 canonical original)`);

  const remainingGaurav = await prisma.wedding.count({
    where: { slug: { startsWith: 'bihari-traditional' } }
  });
  console.log(`Remaining Gaurav Kumar Weddings: ${remainingGaurav} (Expected: 1 canonical original)`);

  const remainingDemo = await prisma.wedding.count({
    where: { isDemo: true }
  });
  console.log(`Remaining Showcase Demo Weddings: ${remainingDemo} (Expected: 21)`);

  console.log('\n✅ FORENSIC DATABASE CLEANUP COMPLETED SUCCESSFULLY!\n');
}

runCleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
