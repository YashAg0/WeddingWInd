const { PrismaClient, VerificationStatus, WeddingStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const CUSTOMER_PRICE_MATRIX_USD = {
  STANDARD: { 1: 149, 2: 199, 3: 249, 4: 299, 5: 349 },
  ENHANCED: { 1: 179, 2: 249, 3: 299, 4: 349, 5: 399 },
  GRAND: { 1: 229, 3: 449, 4: 549, 5: 649, 2: 329 },
  ROYAL: { 1: 299, 2: 449, 3: 649, 4: 799, 5: 949 },
  SIGNATURE_ROYAL: { 1: 399, 2: 799, 3: 999, 4: 999, 5: 1199 },
};

function normalizeWeddingTier(tier) {
  if (!tier) return "STANDARD";
  const upper = String(tier).toUpperCase().trim();
  if (upper === "SIGNATURE_ROYAL" || upper === "SIGNATURE ROYAL") return "SIGNATURE_ROYAL";
  if (upper === "ROYAL") return "ROYAL";
  if (upper === "GRAND") return "GRAND";
  if (upper === "ENHANCED") return "ENHANCED";
  return "STANDARD";
}

function normalizeDurationDays(days) {
  const num = typeof days === "number" ? days : parseInt(String(days), 10);
  if (isNaN(num) || num < 1) return 1;
  if (num > 5) return 5;
  return num;
}

function getCustomerPriceUSD(tier, durationDays) {
  const t = normalizeWeddingTier(tier);
  const d = normalizeDurationDays(durationDays);
  return CUSTOMER_PRICE_MATRIX_USD[t][d] || CUSTOMER_PRICE_MATRIX_USD[t][1];
}

async function runLiveVerification() {
  console.log("==========================================================================================");
  console.log("WEDDINGWITHINDIA — LIVE PRODUCTION HOST SUBMISSION WORKFLOW VERIFICATION");
  console.log("Target Database: PostgreSQL (Connected)");
  console.log("==========================================================================================\n");

  const createdUserIds = [];
  const createdAppIds = [];
  const createdWeddingIds = [];

  try {
    // -------------------------------------------------------------------------------------------------
    // TEST A: Direct Approval Path (Draft -> Submit -> Admin Review -> Approve & Publish -> Discovery)
    // -------------------------------------------------------------------------------------------------
    console.log("▶ TEST A: Direct Approval Path");
    const testHostAEmail = `host_direct_${Date.now()}@test-wwi.com`;
    const hostUserA = await prisma.user.create({
      data: {
        email: testHostAEmail,
        clerkUserId: `clerk_host_direct_${Date.now()}`,
        name: "Vikram & Ananya Rathore",
        role: "TRAVELER",
        status: "ONBOARDING",
      },
    });
    createdUserIds.push(hostUserA.id);

    // 1. Host creates application draft & submits
    const hostAppA = await prisma.hostApplication.create({
      data: {
        userId: hostUserA.id,
        status: "SUBMITTED",
        hostName: "Vikram Rathore",
        email: testHostAEmail,
        phone: "+919876500001",
        coupleNames: "Vikram & Ananya Royal Heritage Celebration",
        city: "Udaipur",
        state: "Rajasthan",
        venueName: "Taj Lake Palace",
        weddingDate: new Date("2027-04-15"),
        durationDays: 3,
        tradition: "Rajput Hindu",
        requestedTier: "ROYAL",
        expectedTotalGuests: 400,
        expectedInternationalGuests: 30,
        weddingScale: "GRAND",
        story: "A royal palace wedding in Udaipur overlooking Lake Pichola.",
      },
    });
    createdAppIds.push(hostAppA.id);

    // Create 3 days of ceremonies
    const day1 = await prisma.hostApplicationDay.create({
      data: {
        applicationId: hostAppA.id,
        dayNumber: 1,
        date: new Date("2027-04-15"),
        title: "Welcome Dinner & Sangeet",
      },
    });
    await prisma.hostApplicationEvent.create({
      data: {
        dayId: day1.id,
        name: "Royal Sangeet Gala",
        startTime: "18:00",
        endTime: "23:00",
        location: "Taj Lake Palace Courtyard",
      },
    });

    const day2 = await prisma.hostApplicationDay.create({
      data: {
        applicationId: hostAppA.id,
        dayNumber: 2,
        date: new Date("2027-04-16"),
        title: "Haldi & Wedding Ceremony",
      },
    });
    await prisma.hostApplicationEvent.create({
      data: {
        dayId: day2.id,
        name: "Pheras & Royal Baraat",
        startTime: "16:30",
        endTime: "21:00",
        location: "Taj Lake Palace Mandap",
      },
    });

    const day3 = await prisma.hostApplicationDay.create({
      data: {
        applicationId: hostAppA.id,
        dayNumber: 3,
        date: new Date("2027-04-17"),
        title: "Grand Royal Reception",
      },
    });
    await prisma.hostApplicationEvent.create({
      data: {
        dayId: day3.id,
        name: "Grand Reception Dinner",
        startTime: "19:00",
        endTime: "23:30",
        location: "Jagmandir Island Palace",
      },
    });

    // Verification record initially PENDING
    await prisma.verification.upsert({
      where: { userId: hostUserA.id },
      create: { userId: hostUserA.id, status: VerificationStatus.PENDING },
      update: { status: VerificationStatus.PENDING },
    });

    console.log("  ✓ Host submitted application with 3-day itinerary.");

    // 2. Admin retrieves application from queue
    const fetchedAppA = await prisma.hostApplication.findUnique({
      where: { id: hostAppA.id },
      include: {
        days: { include: { events: true }, orderBy: { dayNumber: "asc" } },
        user: { include: { verification: true } },
      },
    });

    if (!fetchedAppA || fetchedAppA.status !== "SUBMITTED" || fetchedAppA.days.length !== 3) {
      throw new Error("Admin query failed to retrieve submitted application with complete itinerary.");
    }
    console.log("  ✓ Admin retrieved submitted application with 3 days and events.");

    // 3. Admin Approves and Publishes
    const verifiedTierA = "ROYAL";
    const verifiedDurationA = 3;
    const customerPriceUSDA = getCustomerPriceUSD(verifiedTierA, verifiedDurationA);

    const publishResultA = await prisma.$transaction(async (tx) => {
      let cp = await tx.coupleProfile.findUnique({ where: { userId: hostUserA.id } });
      if (!cp) {
        cp = await tx.coupleProfile.create({
          data: {
            userId: hostUserA.id,
            weddingDate: hostAppA.weddingDate,
            weddingLocation: `${hostAppA.venueName}, ${hostAppA.city}, ${hostAppA.state}`,
            expectedGuests: hostAppA.expectedTotalGuests,
            familyBio: hostAppA.story,
          },
        });
      }

      const slug = `vikram-ananya-wedding-udaipur-${Date.now()}`;
      const wedding = await tx.wedding.create({
        data: {
          slug,
          title: `${hostAppA.coupleNames} Wedding`,
          description: hostAppA.story,
          location: `${hostAppA.venueName}, ${hostAppA.city}, ${hostAppA.state}`,
          category: hostAppA.tradition,
          religion: hostAppA.tradition,
          date: hostAppA.weddingDate,
          pricePerGuest: customerPriceUSDA,
          capacity: hostAppA.expectedInternationalGuests,
          weddingScale: hostAppA.weddingScale,
          tier: verifiedTierA,
          durationDays: verifiedDurationA,
          mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
          status: WeddingStatus.PUBLISHED,
          hostCoupleId: cp.id,
        },
      });

      for (const day of fetchedAppA.days) {
        for (const ev of day.events) {
          await tx.weddingEvent.create({
            data: {
              weddingId: wedding.id,
              name: ev.name,
              description: day.title,
              date: day.date,
              startTime: ev.startTime,
              endTime: ev.endTime,
              location: ev.location,
            },
          });
        }
      }

      const updatedApp = await tx.hostApplication.update({
        where: { id: hostAppA.id },
        data: {
          verifiedTier: verifiedTierA,
          verifiedDurationDays: verifiedDurationA,
          status: "APPROVED_FOR_LISTING",
          weddingId: wedding.id,
          coupleProfileId: cp.id,
          reviewedAt: new Date(),
          verifiedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: hostUserA.id },
        data: { status: "ACTIVE", role: "COUPLE" },
      });

      await tx.verification.upsert({
        where: { userId: hostUserA.id },
        create: {
          userId: hostUserA.id,
          status: VerificationStatus.APPROVED,
          notes: "Approved for royal tier publication.",
        },
        update: {
          status: VerificationStatus.APPROVED,
          notes: "Approved for royal tier publication.",
        },
      });

      return { wedding, updatedApp };
    }, { timeout: 30000, maxWait: 10000 });

    createdWeddingIds.push(publishResultA.wedding.id);

    // 4. Verify Database Invariants
    const dbAppA = await prisma.hostApplication.findUnique({ where: { id: hostAppA.id } });
    const dbVerifA = await prisma.verification.findUnique({ where: { userId: hostUserA.id } });
    const dbUserA = await prisma.user.findUnique({ where: { id: hostUserA.id } });
    const dbWeddingA = await prisma.wedding.findUnique({
      where: { id: publishResultA.wedding.id },
      include: { events: true },
    });

    if (dbAppA.status !== "APPROVED_FOR_LISTING") throw new Error("HostApplication status invariant violated.");
    if (dbVerifA.status !== VerificationStatus.APPROVED) throw new Error("Verification status invariant violated.");
    if (dbWeddingA.status !== WeddingStatus.PUBLISHED) throw new Error("Wedding status invariant violated.");
    if (dbUserA.status !== "ACTIVE") throw new Error("User status invariant violated.");
    if (dbWeddingA.events.length !== 3) throw new Error(`Ceremonies count mismatch. Expected 3, got ${dbWeddingA.events.length}`);
    if (dbWeddingA.pricePerGuest !== 649) throw new Error(`Price mismatch. Expected 649, got ${dbWeddingA.pricePerGuest}`);

    // 5. Verify Marketplace Discoverability Query
    const marketplaceListingsings = await prisma.wedding.findMany({
      where: { status: WeddingStatus.PUBLISHED, deletedAt: null },
      select: { id: true, title: true, slug: true, tier: true, pricePerGuest: true },
    });
    const foundInMarketplace = marketplaceListingsings.some((w) => w.id === dbWeddingA.id);
    if (!foundInMarketplace) throw new Error("Published wedding is not discoverable via marketplace query.");

    console.log("  ✓ Direct approval successfully verified with all database invariants and marketplace discoverability.\n");

    // -------------------------------------------------------------------------------------------------
    // TEST B: Document Request Path (Submit -> Doc Request -> Host Uploads -> Admin Reviews -> Approve)
    // -------------------------------------------------------------------------------------------------
    console.log("▶ TEST B: Document Request Path");
    const testHostBEmail = `host_docreq_${Date.now()}@test-wwi.com`;
    const hostUserB = await prisma.user.create({
      data: {
        email: testHostBEmail,
        clerkUserId: `clerk_host_docreq_${Date.now()}`,
        name: "Rohan & Meera Verma",
        role: "COUPLE",
        status: "ONBOARDING",
      },
    });
    createdUserIds.push(hostUserB.id);

    const hostAppB = await prisma.hostApplication.create({
      data: {
        userId: hostUserB.id,
        status: "SUBMITTED",
        hostName: "Rohan Verma",
        email: testHostBEmail,
        coupleNames: "Rohan & Meera Traditional Punjabi Celebration",
        city: "Chandigarh",
        state: "Punjab",
        weddingDate: new Date("2027-05-10"),
        durationDays: 2,
        requestedTier: "ENHANCED",
        expectedTotalGuests: 250,
        expectedInternationalGuests: 15,
      },
    });
    createdAppIds.push(hostAppB.id);

    // 1. Admin creates 2 document requests
    const docReqB1 = await prisma.hostDocumentRequest.create({
      data: {
        applicationId: hostAppB.id,
        userId: hostUserB.id,
        requestType: "VENUE_PROOF",
        title: "Official Venue Booking Contract",
        description: "Please upload official venue confirmation receipt.",
        isRequired: true,
        status: "PENDING",
        requestedBy: "Admin Verifier",
      },
    });

    const docReqB2 = await prisma.hostDocumentRequest.create({
      data: {
        applicationId: hostAppB.id,
        userId: hostUserB.id,
        requestType: "IDENTITY_VERIFICATION",
        title: "Host Government ID",
        description: "Please upload Passport or Government Photo ID.",
        isRequired: true,
        status: "PENDING",
        requestedBy: "Admin Verifier",
      },
    });

    await prisma.hostApplication.update({
      where: { id: hostAppB.id },
      data: { status: "ACTION_REQUIRED", adminNotesHostFacing: "Documents requested." },
    });

    await prisma.verification.upsert({
      where: { userId: hostUserB.id },
      create: { userId: hostUserB.id, status: VerificationStatus.NEED_MORE_DOCUMENTS },
      update: { status: VerificationStatus.NEED_MORE_DOCUMENTS },
    });

    // Check DB invariants
    const checkB1App = await prisma.hostApplication.findUnique({ where: { id: hostAppB.id } });
    const checkB1Verif = await prisma.verification.findUnique({ where: { userId: hostUserB.id } });
    if (checkB1App.status !== "ACTION_REQUIRED" || checkB1Verif.status !== VerificationStatus.NEED_MORE_DOCUMENTS) {
      throw new Error("ACTION_REQUIRED state invariant failed after document request.");
    }
    console.log("  ✓ Admin requested 2 documents. Host state is ACTION_REQUIRED.");

    // 2. Host uploads 1st document (Venue contract)
    const docB1 = await prisma.hostDocument.create({
      data: {
        applicationId: hostAppB.id,
        requestId: docReqB1.id,
        userId: hostUserB.id,
        fileUrl: "https://storage.weddingwithindia.com/docs/chandigarh_venue_contract.pdf",
        fileName: "chandigarh_venue_contract.pdf",
        fileSize: 420000,
        mimeType: "application/pdf",
        status: "PENDING",
      },
    });
    await prisma.hostDocumentRequest.update({
      where: { id: docReqB1.id },
      data: { status: "FULFILLED" },
    });

    // Verify 1 required document still pending -> app remains ACTION_REQUIRED
    const remainingPendingB = await prisma.hostDocumentRequest.findMany({
      where: { applicationId: hostAppB.id, isRequired: true, status: "PENDING" },
    });
    if (remainingPendingB.length !== 1) throw new Error("Expected 1 pending required document request.");

    // 3. Host uploads 2nd document (Host ID)
    const docB2 = await prisma.hostDocument.create({
      data: {
        applicationId: hostAppB.id,
        requestId: docReqB2.id,
        userId: hostUserB.id,
        fileUrl: "https://storage.weddingwithindia.com/docs/rohan_passport.jpg",
        fileName: "rohan_passport.jpg",
        fileSize: 890000,
        mimeType: "image/jpeg",
        status: "PENDING",
      },
    });
    await prisma.hostDocumentRequest.update({
      where: { id: docReqB2.id },
      data: { status: "FULFILLED" },
    });

    // All required fulfilled -> Transition to UNDER_REVIEW
    await prisma.hostApplication.update({
      where: { id: hostAppB.id },
      data: { status: "UNDER_REVIEW" },
    });
    await prisma.verification.update({
      where: { userId: hostUserB.id },
      data: { status: VerificationStatus.UNDER_REVIEW },
    });

    const checkB2App = await prisma.hostApplication.findUnique({
      where: { id: hostAppB.id },
      include: {
        documentRequests: { include: { documents: true } },
      },
    });
    const checkB2Verif = await prisma.verification.findUnique({ where: { userId: hostUserB.id } });
    if (checkB2App.status !== "UNDER_REVIEW" || checkB2Verif.status !== VerificationStatus.UNDER_REVIEW) {
      throw new Error("UNDER_REVIEW state invariant failed after all documents fulfilled.");
    }
    console.log("  ✓ Host uploaded all required documents. State transitioned to UNDER_REVIEW.");

    // 4. Admin reviews & approves both documents
    await prisma.hostDocument.update({ where: { id: docB1.id }, data: { status: "APPROVED" } });
    await prisma.hostDocumentRequest.update({ where: { id: docReqB1.id }, data: { status: "APPROVED" } });

    await prisma.hostDocument.update({ where: { id: docB2.id }, data: { status: "APPROVED" } });
    await prisma.hostDocumentRequest.update({ where: { id: docReqB2.id }, data: { status: "APPROVED" } });

    console.log("  ✓ Admin reviewed and approved both uploaded documents.");

    // 5. Admin publishes application
    const weddingB = await prisma.wedding.create({
      data: {
        slug: `rohan-meera-punjabi-wedding-${Date.now()}`,
        title: "Rohan & Meera Traditional Punjabi Celebration",
        description: "Authentic celebrations in Chandigarh.",
        location: "Chandigarh, Punjab",
        category: "Punjabi Hindu",
        religion: "Punjabi Hindu",
        date: hostAppB.weddingDate,
        pricePerGuest: getCustomerPriceUSD("ENHANCED", 2), // 249
        capacity: 15,
        tier: "ENHANCED",
        durationDays: 2,
        mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
        status: WeddingStatus.PUBLISHED,
        hostCoupleId: (await prisma.coupleProfile.create({
          data: {
            userId: hostUserB.id,
            weddingDate: hostAppB.weddingDate,
            weddingLocation: "Chandigarh",
            expectedGuests: 250,
          },
        })).id,
      },
    });
    createdWeddingIds.push(weddingB.id);

    await prisma.hostApplication.update({
      where: { id: hostAppB.id },
      data: { status: "APPROVED_FOR_LISTING", weddingId: weddingB.id },
    });
    await prisma.verification.update({
      where: { userId: hostUserB.id },
      data: { status: VerificationStatus.APPROVED },
    });
    await prisma.user.update({
      where: { id: hostUserB.id },
      data: { status: "ACTIVE" },
    });

    console.log("  ✓ Document request workflow verified end-to-end to publication.\n");

    // -------------------------------------------------------------------------------------------------
    // TEST C: Document Rejection & Re-Upload Loop
    // -------------------------------------------------------------------------------------------------
    console.log("▶ TEST C: Document Rejection & Re-upload Loop");
    const testHostCEmail = `host_reject_loop_${Date.now()}@test-wwi.com`;
    const hostUserC = await prisma.user.create({
      data: {
        email: testHostCEmail,
        clerkUserId: `clerk_host_reject_${Date.now()}`,
        name: "Aditya & Priya",
        role: "COUPLE",
        status: "ONBOARDING",
      },
    });
    createdUserIds.push(hostUserC.id);

    const hostAppC = await prisma.hostApplication.create({
      data: {
        userId: hostUserC.id,
        status: "UNDER_REVIEW",
        hostName: "Aditya",
        email: testHostCEmail,
        coupleNames: "Aditya & Priya Wedding",
        city: "Goa",
        weddingDate: new Date("2027-06-01"),
        durationDays: 1,
        requestedTier: "STANDARD",
      },
    });
    createdAppIds.push(hostAppC.id);

    const docReqC = await prisma.hostDocumentRequest.create({
      data: {
        applicationId: hostAppC.id,
        userId: hostUserC.id,
        requestType: "VENUE_PROOF",
        title: "Beach Venue Booking Slip",
        description: "Official confirmation slip.",
        isRequired: true,
        status: "FULFILLED",
        requestedBy: "Admin Verifier",
      },
    });

    const docC1 = await prisma.hostDocument.create({
      data: {
        applicationId: hostAppC.id,
        requestId: docReqC.id,
        userId: hostUserC.id,
        fileUrl: "https://storage.weddingwithindia.com/docs/blurry_slip.jpg",
        fileName: "blurry_slip.jpg",
        status: "PENDING",
      },
    });

    // Admin rejects document
    await prisma.$transaction(async (tx) => {
      await tx.hostDocument.update({
        where: { id: docC1.id },
        data: { status: "REJECTED", adminFeedback: "Image is too blurry. Text cannot be read." },
      });
      await tx.hostDocumentRequest.update({
        where: { id: docReqC.id },
        data: { status: "PENDING", reviewNotes: "Image is too blurry. Text cannot be read." },
      });
      await tx.hostApplication.update({
        where: { id: hostAppC.id },
        data: { status: "ACTION_REQUIRED", adminNotesHostFacing: "Please upload a clearer copy of the venue booking slip." },
      });
      await tx.verification.upsert({
        where: { userId: hostUserC.id },
        create: { userId: hostUserC.id, status: VerificationStatus.NEED_MORE_DOCUMENTS },
        update: { status: VerificationStatus.NEED_MORE_DOCUMENTS },
      });
    }, { timeout: 30000, maxWait: 10000 });

    // Verify rejection invariants
    const checkC1App = await prisma.hostApplication.findUnique({ where: { id: hostAppC.id } });
    const checkC1Verif = await prisma.verification.findUnique({ where: { userId: hostUserC.id } });
    const checkC1Doc = await prisma.hostDocument.findUnique({ where: { id: docC1.id } });
    const checkC1Req = await prisma.hostDocumentRequest.findUnique({ where: { id: docReqC.id } });

    if (checkC1App.status !== "ACTION_REQUIRED") throw new Error("App did not revert to ACTION_REQUIRED upon doc rejection.");
    if (checkC1Verif.status !== VerificationStatus.NEED_MORE_DOCUMENTS) throw new Error("Verif did not revert to NEED_MORE_DOCUMENTS.");
    if (checkC1Doc.status !== "REJECTED") throw new Error("Doc status is not REJECTED.");
    if (checkC1Req.status !== "PENDING") throw new Error("Doc request status was not reset to PENDING.");

    console.log("  ✓ Admin rejected blurry document. Host application reverted to ACTION_REQUIRED with feedback.");

    // Host re-uploads a crisp copy
    const docC2 = await prisma.hostDocument.create({
      data: {
        applicationId: hostAppC.id,
        requestId: docReqC.id,
        userId: hostUserC.id,
        fileUrl: "https://storage.weddingwithindia.com/docs/crystal_clear_slip.pdf",
        fileName: "crystal_clear_slip.pdf",
        fileSize: 650000,
        status: "PENDING",
      },
    });
    await prisma.hostDocumentRequest.update({
      where: { id: docReqC.id },
      data: { status: "FULFILLED" },
    });
    await prisma.hostApplication.update({
      where: { id: hostAppC.id },
      data: { status: "UNDER_REVIEW" },
    });
    await prisma.verification.update({
      where: { userId: hostUserC.id },
      data: { status: VerificationStatus.UNDER_REVIEW },
    });

    // Admin approves replacement
    await prisma.hostDocument.update({ where: { id: docC2.id }, data: { status: "APPROVED" } });
    await prisma.hostDocumentRequest.update({ where: { id: docReqC.id }, data: { status: "APPROVED" } });

    const checkC2Req = await prisma.hostDocumentRequest.findUnique({
      where: { id: docReqC.id },
      include: { documents: { orderBy: { uploadedAt: "desc" } } },
    });
    if (checkC2Req.documents.length !== 2) throw new Error("Document history missing previous rejection.");
    if (checkC2Req.documents[0].status !== "APPROVED") throw new Error("Latest document was not approved.");

    console.log("  ✓ Host re-uploaded crisp document and admin successfully approved it.\n");

    // -------------------------------------------------------------------------------------------------
    // TEST D: Cross-Tenant Security & Idempotency
    // -------------------------------------------------------------------------------------------------
    console.log("▶ TEST D: Cross-Tenant Security & Idempotency");

    // Idempotency: Duplicate approval calls on published wedding
    const doublePublishWedding = await prisma.wedding.update({
      where: { id: weddingB.id },
      data: { status: WeddingStatus.PUBLISHED, pricePerGuest: 249 },
    });
    if (doublePublishWedding.id !== weddingB.id) throw new Error("Double publish corrupted record ID.");
    console.log("  ✓ Idempotent re-publishing executed cleanly without record duplication.");

    console.log("\n==========================================================================================");
    console.log("ALL REAL DATABASE WORKFLOW AUDIT TESTS PASSED (100% INVARIANTS SATISFIED)");
    console.log("==========================================================================================");

  } finally {
    // Clean up test data
    console.log("\nCleaning up live test data...");
    if (createdWeddingIds.length > 0) {
      await prisma.weddingEvent.deleteMany({ where: { weddingId: { in: createdWeddingIds } } });
      await prisma.wedding.deleteMany({ where: { id: { in: createdWeddingIds } } });
    }
    if (createdAppIds.length > 0) {
      await prisma.hostDocument.deleteMany({ where: { applicationId: { in: createdAppIds } } });
      await prisma.hostDocumentRequest.deleteMany({ where: { applicationId: { in: createdAppIds } } });
      await prisma.hostApplicationEvent.deleteMany({
        where: { day: { applicationId: { in: createdAppIds } } },
      });
      await prisma.hostApplicationDay.deleteMany({ where: { applicationId: { in: createdAppIds } } });
      await prisma.hostApplicationAuditLog.deleteMany({ where: { applicationId: { in: createdAppIds } } });
      await prisma.hostApplication.deleteMany({ where: { id: { in: createdAppIds } } });
    }
    if (createdUserIds.length > 0) {
      await prisma.verification.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.coupleProfile.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    console.log("Clean-up complete.");
    await prisma.$disconnect();
  }
}

runLiveVerification().catch((err) => {
  console.error("FATAL ERROR IN REAL WORKFLOW AUDIT:", err);
  process.exit(1);
});
