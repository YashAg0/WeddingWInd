import { UserRole, VerificationStatus, WeddingStatus } from "@prisma/client";

// Setup comprehensive in-memory mock DB
const mockDB = {
  users: new Map<string, any>(),
  coupleProfiles: new Map<string, any>(),
  hostApplications: new Map<string, any>(),
  hostApplicationDays: new Map<string, any>(),
  hostApplicationEvents: new Map<string, any>(),
  hostDocumentRequests: new Map<string, any>(),
  hostDocuments: new Map<string, any>(),
  hostApplicationAuditLogs: new Map<string, any>(),
  verifications: new Map<string, any>(),
  weddings: new Map<string, any>(),
  weddingEvents: new Map<string, any>(),
  notifications: new Map<string, any>(),
  auditLogs: new Map<string, any>(),
  reputationProfiles: new Map<string, any>(),
  qualityBadges: new Map<string, any>(),
};

function resetMockDB() {
  mockDB.users.clear();
  mockDB.coupleProfiles.clear();
  mockDB.hostApplications.clear();
  mockDB.hostApplicationDays.clear();
  mockDB.hostApplicationEvents.clear();
  mockDB.hostDocumentRequests.clear();
  mockDB.hostDocuments.clear();
  mockDB.hostApplicationAuditLogs.clear();
  mockDB.verifications.clear();
  mockDB.weddings.clear();
  mockDB.weddingEvents.clear();
  mockDB.notifications.clear();
  mockDB.auditLogs.clear();
  mockDB.reputationProfiles.clear();
  mockDB.qualityBadges.clear();
}

// Mock Prisma
const mockPrisma: any = {
  user: {
    findUnique: jest.fn(async ({ where }) => {
      if (where.id) return mockDB.users.get(where.id) || null;
      if (where.clerkUserId) {
        for (const u of mockDB.users.values()) {
          if (u.clerkUserId === where.clerkUserId) return u;
        }
      }
      return null;
    }),
    findMany: jest.fn(async ({ where }: any = {}) => {
      const all = Array.from(mockDB.users.values());
      if (!where) return all;
      return all.filter((u) => {
        if (where.role && u.role !== where.role) return false;
        return true;
      });
    }),
    update: jest.fn(async ({ where, data }) => {
      const u = mockDB.users.get(where.id);
      if (!u) throw new Error("User not found");
      Object.assign(u, data);
      return u;
    }),
  },
  coupleProfile: {
    findUnique: jest.fn(async ({ where }) => {
      if (where.id) return mockDB.coupleProfiles.get(where.id) || null;
      if (where.userId) {
        for (const cp of mockDB.coupleProfiles.values()) {
          if (cp.userId === where.userId) return cp;
        }
      }
      return null;
    }),
    create: jest.fn(async ({ data }) => {
      const id = data.id || `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      mockDB.coupleProfiles.set(id, record);
      return record;
    }),
    update: jest.fn(async ({ where, data }) => {
      const cp = mockDB.coupleProfiles.get(where.id);
      if (!cp) throw new Error("CoupleProfile not found");
      Object.assign(cp, data, { updatedAt: new Date() });
      return cp;
    }),
  },
  hostApplication: {
    findUnique: jest.fn(async ({ where }) => {
      const app = mockDB.hostApplications.get(where.id);
      if (!app) return null;
      return {
        ...app,
        days: Array.from(mockDB.hostApplicationDays.values())
          .filter((d) => d.applicationId === app.id)
          .map((d) => ({
            ...d,
            events: Array.from(mockDB.hostApplicationEvents.values()).filter((e) => e.dayId === d.id),
          })),
        documentRequests: Array.from(mockDB.hostDocumentRequests.values())
          .filter((r) => r.applicationId === app.id)
          .map((r) => ({
            ...r,
            documents: Array.from(mockDB.hostDocuments.values()).filter((doc) => doc.requestId === r.id),
          })),
        documents: Array.from(mockDB.hostDocuments.values()).filter((doc) => doc.applicationId === app.id),
        auditLogs: Array.from(mockDB.hostApplicationAuditLogs.values()).filter((l) => l.applicationId === app.id),
        wedding: app.weddingId ? mockDB.weddings.get(app.weddingId) || null : null,
        user: mockDB.users.get(app.userId) || null,
      };
    }),
    findFirst: jest.fn(async ({ where }: any = {}) => {
      for (const app of mockDB.hostApplications.values()) {
        if (where.userId && app.userId !== where.userId) continue;
        if (where.id && app.id !== where.id) continue;
        if (where.weddingId && app.weddingId !== where.weddingId) continue;
        if (where.coupleProfileId && app.coupleProfileId !== where.coupleProfileId) continue;
        if (where.OR && Array.isArray(where.OR)) {
          const matchOr = where.OR.some((cond: any) => {
            if (cond.weddingId && app.weddingId === cond.weddingId) return true;
            if (cond.coupleProfileId && app.coupleProfileId === cond.coupleProfileId) return true;
            if (cond.userId && app.userId === cond.userId) return true;
            return false;
          });
          if (!matchOr) continue;
        }

        return {
          ...app,
          days: Array.from(mockDB.hostApplicationDays.values())
            .filter((d) => d.applicationId === app.id)
            .map((d) => ({
              ...d,
              events: Array.from(mockDB.hostApplicationEvents.values()).filter((e) => e.dayId === d.id),
            })),
          documentRequests: Array.from(mockDB.hostDocumentRequests.values())
            .filter((r) => r.applicationId === app.id)
            .map((r) => ({
              ...r,
              documents: Array.from(mockDB.hostDocuments.values()).filter((doc) => doc.requestId === r.id),
            })),
          documents: Array.from(mockDB.hostDocuments.values()).filter((doc) => doc.applicationId === app.id),
          auditLogs: Array.from(mockDB.hostApplicationAuditLogs.values()).filter((l) => l.applicationId === app.id),
          wedding: app.weddingId ? mockDB.weddings.get(app.weddingId) || null : null,
          user: mockDB.users.get(app.userId) || null,
        };
      }
      return null;
    }),
    findMany: jest.fn(async () => {
      return Array.from(mockDB.hostApplications.values()).map((app) => ({
        ...app,
        days: Array.from(mockDB.hostApplicationDays.values())
          .filter((d) => d.applicationId === app.id)
          .map((d) => ({
            ...d,
            events: Array.from(mockDB.hostApplicationEvents.values()).filter((e) => e.dayId === d.id),
          })),
        documentRequests: Array.from(mockDB.hostDocumentRequests.values())
          .filter((r) => r.applicationId === app.id)
          .map((r) => ({
            ...r,
            documents: Array.from(mockDB.hostDocuments.values()).filter((doc) => doc.requestId === r.id),
          })),
        documents: Array.from(mockDB.hostDocuments.values()).filter((doc) => doc.applicationId === app.id),
        wedding: app.weddingId ? mockDB.weddings.get(app.weddingId) || null : null,
        user: mockDB.users.get(app.userId) || null,
      }));
    }),
    create: jest.fn(async ({ data }) => {
      const id = data.id || `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      mockDB.hostApplications.set(id, record);
      return record;
    }),
    update: jest.fn(async ({ where, data }) => {
      const app = mockDB.hostApplications.get(where.id);
      if (!app) throw new Error("HostApplication not found");
      Object.assign(app, data, { updatedAt: new Date() });
      return app;
    }),
  },
  hostApplicationDay: {
    upsert: jest.fn(async ({ where, create, update }) => {
      const key = `${where.applicationId_dayNumber.applicationId}_${where.applicationId_dayNumber.dayNumber}`;
      let day = mockDB.hostApplicationDays.get(key);
      if (day) {
        Object.assign(day, update, { updatedAt: new Date() });
      } else {
        day = { id: `day-${key}`, ...create, createdAt: new Date(), updatedAt: new Date() };
        mockDB.hostApplicationDays.set(key, day);
      }
      return day;
    }),
  },
  hostApplicationEvent: {
    deleteMany: jest.fn(async ({ where }) => {
      for (const [k, ev] of mockDB.hostApplicationEvents.entries()) {
        if (ev.dayId === where.dayId) {
          mockDB.hostApplicationEvents.delete(k);
        }
      }
      return { count: 1 };
    }),
    create: jest.fn(async ({ data }) => {
      const id = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      mockDB.hostApplicationEvents.set(id, record);
      return record;
    }),
  },
  hostDocumentRequest: {
    findUnique: jest.fn(async ({ where, include }) => {
      const req = mockDB.hostDocumentRequests.get(where.id);
      if (!req) return null;
      const res: any = { ...req };
      if (include?.application) {
        res.application = mockDB.hostApplications.get(req.applicationId);
      }
      if (include?.documents) {
        res.documents = Array.from(mockDB.hostDocuments.values()).filter((d) => d.requestId === req.id);
      }
      return res;
    }),
    findMany: jest.fn(async ({ where }: any = {}) => {
      return Array.from(mockDB.hostDocumentRequests.values()).filter((r) => {
        if (where.applicationId && r.applicationId !== where.applicationId) return false;
        if (where.isRequired !== undefined && r.isRequired !== where.isRequired) return false;
        if (where.status && r.status !== where.status) return false;
        return true;
      });
    }),
    create: jest.fn(async ({ data }) => {
      const id = data.id || `docreq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const record = { id, ...data, requestedAt: new Date(), createdAt: new Date() };
      mockDB.hostDocumentRequests.set(id, record);
      return record;
    }),
    update: jest.fn(async ({ where, data }) => {
      const req = mockDB.hostDocumentRequests.get(where.id);
      if (!req) throw new Error("HostDocumentRequest not found");
      Object.assign(req, data);
      return req;
    }),
  },
  hostDocument: {
    findUnique: jest.fn(async ({ where, include }) => {
      const doc = mockDB.hostDocuments.get(where.id);
      if (!doc) return null;
      const res: any = { ...doc };
      if (include?.request) res.request = mockDB.hostDocumentRequests.get(doc.requestId);
      if (include?.application) res.application = mockDB.hostApplications.get(doc.applicationId);
      return res;
    }),
    create: jest.fn(async ({ data }) => {
      const id = data.id || `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const record = { id, ...data, uploadedAt: new Date() };
      mockDB.hostDocuments.set(id, record);
      return record;
    }),
    update: jest.fn(async ({ where, data }) => {
      const doc = mockDB.hostDocuments.get(where.id);
      if (!doc) throw new Error("HostDocument not found");
      Object.assign(doc, data);
      return doc;
    }),
  },
  hostApplicationAuditLog: {
    create: jest.fn(async ({ data }) => {
      const id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const record = { id, ...data, createdAt: new Date() };
      mockDB.hostApplicationAuditLogs.set(id, record);
      return record;
    }),
  },
  verification: {
    findUnique: jest.fn(async ({ where }) => {
      return mockDB.verifications.get(where.userId) || null;
    }),
    upsert: jest.fn(async ({ where, create, update }) => {
      let v = mockDB.verifications.get(where.userId);
      if (v) {
        Object.assign(v, update, { updatedAt: new Date() });
      } else {
        v = { id: `ver-${where.userId}`, ...create, createdAt: new Date(), updatedAt: new Date() };
        mockDB.verifications.set(where.userId, v);
      }
      return v;
    }),
  },
  wedding: {
    findUnique: jest.fn(async ({ where, include }) => {
      const w = mockDB.weddings.get(where.id);
      if (!w) return null;
      const res: any = { ...w };
      if (include?.hostCouple) {
        res.hostCouple = mockDB.coupleProfiles.get(w.hostCoupleId);
        if (res.hostCouple && include.hostCouple.include?.user) {
          res.hostCouple.user = mockDB.users.get(res.hostCouple.userId);
        }
      }
      return res;
    }),
    findFirst: jest.fn(async ({ where }) => {
      for (const w of mockDB.weddings.values()) {
        if (where.hostCoupleId && w.hostCoupleId !== where.hostCoupleId) continue;
        if (where.status && w.status !== where.status) continue;
        return w;
      }
      return null;
    }),
    findMany: jest.fn(async () => {
      return Array.from(mockDB.weddings.values());
    }),
    create: jest.fn(async ({ data }) => {
      const id = data.id || `wedding-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      mockDB.weddings.set(id, record);
      return record;
    }),
    update: jest.fn(async ({ where, data }) => {
      const w = mockDB.weddings.get(where.id);
      if (!w) throw new Error("Wedding not found");
      Object.assign(w, data, { updatedAt: new Date() });
      return w;
    }),
  },
  weddingEvent: {
    create: jest.fn(async ({ data }) => {
      const id = `wev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      mockDB.weddingEvents.set(id, record);
      return record;
    }),
  },
  notification: {
    create: jest.fn(async ({ data }) => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const record = { id, ...data, createdAt: new Date() };
      mockDB.notifications.set(id, record);
      return record;
    }),
  },
  auditLog: {
    create: jest.fn(async ({ data }) => {
      const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const record = { id, ...data, createdAt: new Date() };
      mockDB.auditLogs.set(id, record);
      return record;
    }),
  },
  qualityBadge: {
    upsert: jest.fn().mockResolvedValue({}),
    findUnique: jest.fn().mockResolvedValue(null),
  },
  reputationProfile: {
    findUnique: jest.fn().mockResolvedValue(null),
  },
  $transaction: jest.fn(async (cb) => {
    if (typeof cb === "function") return cb(mockPrisma);
    return cb;
  }),
};

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Mock next/cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// Mock auth module
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

const {
  submitHostApplicationAction,
  uploadHostRequestedDocumentAction,
  resolveHostApplicationState,
} = require("@/lib/actions/host-application");

const {
  adminGetHostApplicationsAction,
  adminGetHostApplicationByIdAction,
  adminCreateDocumentRequestAction,
  adminReviewDocumentAction,
  adminVerifyHostApplicationAction,
} = require("@/lib/actions/admin");

const { requireAuth: mockRequireAuth, requireRole: mockRequireRole } = require("@/lib/auth");

describe("End-to-End Host Submission Workflow Audit & Verification Suite", () => {
  const hostUser = {
    id: "user-host-401",
    email: "host.sharma@example.com",
    name: "Aakash Sharma",
    role: UserRole.TRAVELER,
    status: "ONBOARDING",
  };

  const adminUser = {
    id: "user-admin-901",
    email: "verifier@weddingwithindia.com",
    name: "Senior Verifier",
    role: UserRole.ADMIN,
    status: "ACTIVE",
  };

  const unauthorizedUser = {
    id: "user-attacker-666",
    email: "intruder@example.com",
    name: "Intruder",
    role: UserRole.TRAVELER,
    status: "ACTIVE",
  };

  beforeEach(() => {
    resetMockDB();
    jest.clearAllMocks();

    mockDB.users.set(hostUser.id, { ...hostUser });
    mockDB.users.set(adminUser.id, { ...adminUser });
    mockDB.users.set(unauthorizedUser.id, { ...unauthorizedUser });

    mockRequireAuth.mockResolvedValue(mockDB.users.get(hostUser.id));
    mockRequireRole.mockImplementation(async (roles: UserRole[]) => {
      if (roles.includes(UserRole.ADMIN)) {
        return mockDB.users.get(adminUser.id);
      }
      return mockDB.users.get(hostUser.id);
    });
  });

  describe("Path A — Direct Approval Workflow", () => {
    it("Executes end-to-end: Host submits -> Admin reviews -> Admin approves & publishes immediately", async () => {
      // 1. Host Submits Application
      mockRequireAuth.mockResolvedValue(mockDB.users.get(hostUser.id));

      const submitRes = await submitHostApplicationAction({
        hostName: "Aakash Sharma",
        email: hostUser.email,
        phone: "+919876543210",
        coupleNames: "Aakash & Sneha Celebration",
        city: "Jaipur",
        state: "Rajasthan",
        venueName: "Rambagh Palace",
        weddingDate: "2027-03-20",
        durationDays: 3,
        tradition: "Hindu",
        requestedTier: "ROYAL",
        expectedTotalGuests: 300,
        expectedInternationalGuests: 25,
        story: "A royal Jaipur wedding celebrating traditional rituals.",
        days: [
          {
            dayNumber: 1,
            date: "2027-03-20",
            title: "Welcome & Sangeet",
            events: [{ name: "Sangeet Night", startTime: "18:00", endTime: "23:00" }],
          },
          {
            dayNumber: 2,
            date: "2027-03-21",
            title: "Haldi & Wedding Ceremony",
            events: [{ name: "Pheras", startTime: "17:00", endTime: "20:00" }],
          },
          {
            dayNumber: 3,
            date: "2027-03-22",
            title: "Grand Royal Reception",
            events: [{ name: "Reception Dinner", startTime: "19:00", endTime: "23:30" }],
          },
        ],
      });

      expect(submitRes.success).toBe(true);
      expect(submitRes.status).toBe("SUBMITTED");

      const savedApp = mockDB.hostApplications.get(submitRes.applicationId);
      expect(savedApp).toBeDefined();
      expect(savedApp.status).toBe("SUBMITTED");
      expect(savedApp.coupleNames).toBe("Aakash & Sneha Celebration");

      // Verify user was upgraded to COUPLE and verification record is PENDING
      const updatedHostUser = mockDB.users.get(hostUser.id);
      expect(updatedHostUser.role).toBe(UserRole.COUPLE);
      const hostVerif = mockDB.verifications.get(hostUser.id);
      expect(hostVerif.status).toBe(VerificationStatus.PENDING);

      // 2. Admin retrieves applications queue
      mockRequireRole.mockResolvedValue(mockDB.users.get(adminUser.id));
      const queue = await adminGetHostApplicationsAction();
      expect(queue.hostApps).toHaveLength(1);
      expect(queue.hostApps[0].id).toBe(savedApp.id);
      expect(queue.hostApps[0].status).toBe("SUBMITTED");

      // 3. Admin inspects application details
      const detail = await adminGetHostApplicationByIdAction(savedApp.id);
      expect(detail).toBeDefined();
      expect(detail.hostApp.coupleNames).toBe("Aakash & Sneha Celebration");
      expect(detail.hostApp.days).toHaveLength(3);

      // 4. Admin Approves and Publishes
      const verifyRes = await adminVerifyHostApplicationAction({
        applicationId: savedApp.id,
        verifiedTier: "ROYAL",
        verifiedDurationDays: 3,
        status: "APPROVED_FOR_LISTING",
        adminNotesHostFacing: "Approved! Welcome to WeddingWithIndia.",
        publishImmediately: true,
      });

      expect(verifyRes.success).toBe(true);
      expect(verifyRes.application.status).toBe("APPROVED_FOR_LISTING");
      expect(verifyRes.wedding).toBeDefined();
      expect(verifyRes.wedding.status).toBe(WeddingStatus.PUBLISHED);
      expect(verifyRes.wedding.tier).toBe("ROYAL");
      expect(verifyRes.wedding.pricePerGuest).toBe(649); // Royal 3-day USD rate from pricing engine

      // Verify User status set to ACTIVE and Verification set to APPROVED
      expect(mockDB.users.get(hostUser.id).status).toBe("ACTIVE");
      expect(mockDB.verifications.get(hostUser.id).status).toBe(VerificationStatus.APPROVED);

      // Verify Wedding ceremonies were created
      expect(mockDB.weddingEvents.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Path B — Document Request & Re-upload Lifecycle", () => {
    it("Executes: Submit -> Admin Requests Docs -> Host Sees Docs Required -> Host Uploads -> Admin Rejects one doc -> Host Re-uploads -> Admin Approves -> Listing Publishes", async () => {
      // 1. Host Submits
      mockRequireAuth.mockResolvedValue(mockDB.users.get(hostUser.id));
      const submitRes = await submitHostApplicationAction({
        hostName: "Aakash Sharma",
        email: hostUser.email,
        coupleNames: "Aakash & Sneha Celebration",
        city: "Jaipur",
        weddingDate: "2027-03-20",
        durationDays: 3,
        requestedTier: "ROYAL",
      });

      const appId = submitRes.applicationId;

      // 2. Admin requests 2 documents: Venue Contract & ID Proof
      mockRequireRole.mockResolvedValue(mockDB.users.get(adminUser.id));

      const docReq1 = await adminCreateDocumentRequestAction({
        applicationId: appId,
        requestType: "VENUE_PROOF",
        title: "Official Venue Contract",
        description: "Please upload official venue booking receipt.",
        isRequired: true,
      });

      const docReq2 = await adminCreateDocumentRequestAction({
        applicationId: appId,
        requestType: "IDENTITY_VERIFICATION",
        title: "Host Government ID",
        description: "Please upload Passport or Aadhaar.",
        isRequired: true,
      });

      expect(docReq1.success).toBe(true);
      expect(docReq2.success).toBe(true);

      // Verify application transitioned to ACTION_REQUIRED and verification to NEED_MORE_DOCUMENTS
      expect(mockDB.hostApplications.get(appId).status).toBe("ACTION_REQUIRED");
      expect(mockDB.verifications.get(hostUser.id).status).toBe(VerificationStatus.NEED_MORE_DOCUMENTS);

      // 3. Host resolves application state and sees document requests
      mockRequireAuth.mockResolvedValue(mockDB.users.get(hostUser.id));
      const hostState = await resolveHostApplicationState();
      expect(hostState.application?.appStatus).toBe("ACTION_REQUIRED");
      expect(hostState.application?.documentRequests).toHaveLength(2);

      // 4. Host uploads 1st Document (Venue Contract)
      const upload1 = await uploadHostRequestedDocumentAction({
        requestId: docReq1.documentRequest.id,
        fileUrl: "https://storage.weddingwithindia.com/docs/venue_receipt.pdf",
        fileName: "venue_receipt.pdf",
        fileSize: 512000,
        mimeType: "application/pdf",
      });

      expect(upload1.success).toBe(true);
      // 1 required request remains pending, so app should still be ACTION_REQUIRED
      expect(mockDB.hostApplications.get(appId).status).toBe("ACTION_REQUIRED");

      // 5. Host uploads 2nd Document (Host ID)
      const upload2 = await uploadHostRequestedDocumentAction({
        requestId: docReq2.documentRequest.id,
        fileUrl: "https://storage.weddingwithindia.com/docs/passport_scan.jpg",
        fileName: "passport_scan.jpg",
        fileSize: 1024000,
        mimeType: "image/jpeg",
      });

      expect(upload2.success).toBe(true);
      // All required requests fulfilled -> App & Verification transition to UNDER_REVIEW
      expect(mockDB.hostApplications.get(appId).status).toBe("UNDER_REVIEW");
      expect(mockDB.verifications.get(hostUser.id).status).toBe(VerificationStatus.UNDER_REVIEW);

      // 6. Admin inspects and reviews documents: Approves ID, but Rejects Venue receipt due to blur
      mockRequireRole.mockResolvedValue(mockDB.users.get(adminUser.id));

      const reviewId = await adminReviewDocumentAction({
        documentId: upload2.document.id,
        status: "APPROVED",
        adminFeedback: "Clear ID verified.",
      });
      expect(reviewId.success).toBe(true);

      const reviewVenue = await adminReviewDocumentAction({
        documentId: upload1.document.id,
        status: "REJECTED",
        adminFeedback: "Receipt is too blurry to read stamp.",
      });
      expect(reviewVenue.success).toBe(true);

      // Rejection must put application back into ACTION_REQUIRED & NEED_MORE_DOCUMENTS
      expect(mockDB.hostApplications.get(appId).status).toBe("ACTION_REQUIRED");
      expect(mockDB.verifications.get(hostUser.id).status).toBe(VerificationStatus.NEED_MORE_DOCUMENTS);

      // 7. Host re-uploads a clear Venue Contract
      mockRequireAuth.mockResolvedValue(mockDB.users.get(hostUser.id));
      const reuploadVenue = await uploadHostRequestedDocumentAction({
        requestId: docReq1.documentRequest.id,
        fileUrl: "https://storage.weddingwithindia.com/docs/venue_receipt_hd.pdf",
        fileName: "venue_receipt_hd.pdf",
        fileSize: 850000,
        mimeType: "application/pdf",
      });
      expect(reuploadVenue.success).toBe(true);
      expect(mockDB.hostApplications.get(appId).status).toBe("UNDER_REVIEW");

      // 8. Admin approves clear document and publishes celebration
      mockRequireRole.mockResolvedValue(mockDB.users.get(adminUser.id));
      await adminReviewDocumentAction({
        documentId: reuploadVenue.document.id,
        status: "APPROVED",
        adminFeedback: "Clear copy approved.",
      });

      const finalApprove = await adminVerifyHostApplicationAction({
        applicationId: appId,
        verifiedTier: "ROYAL",
        verifiedDurationDays: 3,
        status: "APPROVED_FOR_LISTING",
        publishImmediately: true,
      });

      expect(finalApprove.success).toBe(true);
      expect(finalApprove.wedding.status).toBe(WeddingStatus.PUBLISHED);
      expect(mockDB.users.get(hostUser.id).status).toBe("ACTIVE");
    });
  });

  describe("Path C — Security, RBAC & Idempotency", () => {
    it("Rejects document upload when an unauthorized user attempts to upload to another host's request", async () => {
      // Create request for Host 1
      mockRequireAuth.mockResolvedValue(mockDB.users.get(hostUser.id));
      const sub = await submitHostApplicationAction({
        hostName: "Aakash",
        email: hostUser.email,
        coupleNames: "Aakash Celebration",
        city: "Delhi",
        weddingDate: "2027-05-10",
        durationDays: 2,
      });

      mockRequireRole.mockResolvedValue(mockDB.users.get(adminUser.id));
      const req = await adminCreateDocumentRequestAction({
        applicationId: sub.applicationId,
        requestType: "VENUE_PROOF",
        title: "Venue Proof",
        description: "Upload venue contract",
      });

      // Attacker attempts upload
      mockRequireAuth.mockResolvedValue(mockDB.users.get(unauthorizedUser.id));
      const attackRes = await uploadHostRequestedDocumentAction({
        requestId: req.documentRequest.id,
        fileUrl: "https://evil.com/malicious.pdf",
        fileName: "malicious.pdf",
      });

      expect(attackRes.success).toBe(false);
      expect(attackRes.error).toMatch(/Forbidden/i);
    });

    it("Rejects non-admin attempting admin document request or verification actions", async () => {
      mockRequireRole.mockRejectedValue(new Error("Unauthorized: Admin role required"));

      await expect(
        adminCreateDocumentRequestAction({
          applicationId: "app-1",
          requestType: "VENUE_PROOF",
          title: "Test",
          description: "Test",
        })
      ).rejects.toThrow(/Unauthorized/);

      await expect(
        adminVerifyHostApplicationAction({
          applicationId: "app-1",
          verifiedTier: "ROYAL",
          verifiedDurationDays: 3,
          status: "APPROVED_FOR_LISTING",
        })
      ).rejects.toThrow(/Unauthorized/);
    });

    it("Handles idempotent repeated verification/publish calls safely without creating duplicate weddings", async () => {
      mockRequireAuth.mockResolvedValue(mockDB.users.get(hostUser.id));
      const sub = await submitHostApplicationAction({
        hostName: "Aakash",
        email: hostUser.email,
        coupleNames: "Aakash & Sneha",
        city: "Jaipur",
        weddingDate: "2027-03-20",
        durationDays: 3,
        requestedTier: "ROYAL",
      });

      mockRequireRole.mockResolvedValue(mockDB.users.get(adminUser.id));

      // Call 1
      const call1 = await adminVerifyHostApplicationAction({
        applicationId: sub.applicationId,
        verifiedTier: "ROYAL",
        verifiedDurationDays: 3,
        status: "APPROVED_FOR_LISTING",
        publishImmediately: true,
      });

      // Call 2 (duplicate/retry)
      const call2 = await adminVerifyHostApplicationAction({
        applicationId: sub.applicationId,
        verifiedTier: "ROYAL",
        verifiedDurationDays: 3,
        status: "APPROVED_FOR_LISTING",
        publishImmediately: true,
      });

      expect(call1.success).toBe(true);
      expect(call2.success).toBe(true);
      expect(call1.wedding.id).toBe(call2.wedding.id);
      expect(mockDB.weddings.size).toBe(1);
    });
  });
});
