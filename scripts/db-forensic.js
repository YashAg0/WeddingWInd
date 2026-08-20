const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const total = await prisma.wedding.count();
    const published = await prisma.wedding.count({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      }
    });
    const drafts = await prisma.wedding.count({
      where: {
        status: 'DRAFT',
        deletedAt: null,
      }
    });
    const completed = await prisma.wedding.count({
      where: {
        status: 'COMPLETED',
        deletedAt: null,
      }
    });
    const unpublished = drafts + completed;
    const deleted = await prisma.wedding.count({
      where: {
        deletedAt: { not: null },
      }
    });

    const suspendedWeddings = await prisma.wedding.count({
      where: {
        suspended: true,
      }
    });

    const discoverable = await prisma.wedding.count({
      where: {
        status: 'PUBLISHED',
        suspended: false,
        deletedAt: null,
      }
    });

    const sponsorships = await prisma.sponsorshipRequest.findMany({
      include: {
        wedding: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        }
      }
    });

    const weddings = await prisma.wedding.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        suspended: true,
        deletedAt: true,
        sponsored: true,
        featured: true,
        pricePerGuest: true,
        category: true,
        hostCouple: {
          select: {
            user: {
              select: { status: true, name: true, email: true }
            }
          }
        },
        sponsorshipRequests: {
          select: {
            id: true,
            promotionType: true,
            status: true,
            paymentStatus: true,
            startsAt: true,
            endsAt: true,
            revokedAt: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const now = new Date();
    let sponsoredCount = 0;
    let featuredCount = 0;
    let normalCount = 0;

    for (const w of weddings) {
      if (w.status !== 'PUBLISHED' || w.suspended || w.deletedAt !== null) continue;

      const activeSponsor = (w.sponsored && (!w.sponsorshipEnd || new Date(w.sponsorshipEnd) > now)) ||
        w.sponsorshipRequests.some(s => 
          s.promotionType === 'SPONSORED' && 
          (s.status === 'ACTIVE' || s.status === 'PAID') && 
          (s.paymentStatus === 'VERIFIED' || s.paymentStatus === 'CHECKOUT_COMPLETED' || s.paymentStatus === 'WAIVED') &&
          !s.revokedAt &&
          (!s.startsAt || new Date(s.startsAt) <= now) && 
          (!s.endsAt || new Date(s.endsAt) > now)
        );

      const activeFeature = (!w.sponsored && w.featured && (!w.featuredEnd || new Date(w.featuredEnd) > now)) ||
        w.sponsorshipRequests.some(s => 
          s.promotionType === 'FEATURED' && 
          (s.status === 'ACTIVE' || s.status === 'PAID') && 
          (s.paymentStatus === 'VERIFIED' || s.paymentStatus === 'CHECKOUT_COMPLETED' || s.paymentStatus === 'WAIVED') &&
          !s.revokedAt &&
          (!s.startsAt || new Date(s.startsAt) <= now) && 
          (!s.endsAt || new Date(s.endsAt) > now)
        );

      if (activeSponsor) {
        sponsoredCount++;
      } else if (activeFeature) {
        featuredCount++;
      } else {
        normalCount++;
      }
    }

    console.log(JSON.stringify({
      total,
      published,
      unpublished,
      drafts,
      completed,
      suspendedWeddings,
      deleted,
      discoverable,
      sponsoredCount,
      featuredCount,
      normalCount,
      sponsorshipsTotal: sponsorships.length,
      sponsorshipsList: sponsorships.map(s => ({
        id: s.id,
        weddingId: s.weddingId,
        weddingSlug: s.wedding?.slug,
        promotionType: s.promotionType,
        status: s.status,
        paymentStatus: s.paymentStatus,
        startsAt: s.startsAt,
        endsAt: s.endsAt
      })),
      weddingsList: weddings.map(w => ({
        id: w.id,
        slug: w.slug,
        title: w.title,
        status: w.status,
        suspended: w.suspended,
        deletedAt: w.deletedAt,
        sponsored: w.sponsored,
        featured: w.featured,
        pricePerGuest: w.pricePerGuest,
        category: w.category,
        sponsorshipsCount: w.sponsorshipRequests.length
      }))
    }, null, 2));
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
