import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

/**
 * Our UploadThing FileRouter definition.
 * Configures endpoints for profile pictures, wedding gallery photos, and verification documents.
 */
export const ourFileRouter = {
  // Upload profile pictures (max 2MB, image file)
  profileImage: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session?.userId) throw new Error("UNAUTHORIZED");
      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.info(`Profile image upload completed for user: ${metadata.userId}`);
      console.info(`File URL: ${file.url}`);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Upload main or gallery images for weddings (max 4MB, images)
  weddingImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 6,
    },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session?.userId) throw new Error("UNAUTHORIZED");
      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Upload verification documents (max 8MB, pdf/image)
  verificationDocument: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 2 },
    image: { maxFileSize: "8MB", maxFileCount: 2 },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session?.userId) throw new Error("UNAUTHORIZED");
      
      const verification = await prisma.verification.findUnique({
        where: { userId: session.userId }
      });
      if (!verification) {
        throw new Error("UNAUTHORIZED_NO_VERIFICATION_REQUEST");
      }
      if (verification.status === "APPROVED" || verification.status === "UNDER_REVIEW") {
        throw new Error("UNAUTHORIZED_VERIFICATION_LOCKED");
      }

      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Upload chat images (max 4MB)
  chatImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session?.userId) throw new Error("UNAUTHORIZED");
      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Upload chat PDFs (max 8MB)
  chatPdf: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session?.userId) throw new Error("UNAUTHORIZED");
      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Upload passport / government ID (max 8MB)
  passport: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session?.userId) throw new Error("UNAUTHORIZED");
      
      const verification = await prisma.verification.findUnique({
        where: { userId: session.userId }
      });
      if (!verification) {
        throw new Error("UNAUTHORIZED_NO_VERIFICATION_REQUEST");
      }
      if (verification.status === "APPROVED" || verification.status === "UNDER_REVIEW") {
        throw new Error("UNAUTHORIZED_VERIFICATION_LOCKED");
      }

      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Upload general documents (max 16MB)
  documents: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 2 },
    image: { maxFileSize: "16MB", maxFileCount: 2 },
    blob: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session?.userId) throw new Error("UNAUTHORIZED");
      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Upload voice notes (max 4MB)
  voiceNote: f({
    audio: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session?.userId) throw new Error("UNAUTHORIZED");
      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
