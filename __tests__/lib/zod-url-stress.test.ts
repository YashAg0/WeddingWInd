/**
 * __tests__/lib/zod-url-stress.test.ts
 *
 * Empirical stress test for Zod URL preprocessing across:
 * - verificationSchema
 * - userSchema
 * - weddingSchema
 * - weddingGallerySchema
 */

import {
  verificationSchema,
  userSchema,
  weddingSchema,
  weddingGallerySchema,
} from "@/lib/validation";

describe("Empirical Zod URL Preprocessing Stress Test", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  describe("1. verificationSchema URL preprocessing & validation", () => {
    const basePayload = {
      userId: validUUID,
      status: "PENDING" as const,
    };

    const urlFields = [
      "govtIdUrl",
      "passportUrl",
      "selfieUrl",
      "travelInsuranceUrl",
      "panUrl",
      "aadhaarUrl",
      "addressProofUrl",
      "weddingProofUrl",
      "venueConfirmUrl",
      "invitationUrl",
      "bankVerificationUrl",
      "gstUrl",
      "businessRegUrl",
      "linkedinUrl",
      "portfolioUrl",
    ] as const;

    it("handles empty strings '' by converting all URL fields to null", () => {
      const payload: Record<string, any> = { ...basePayload };
      urlFields.forEach((field) => {
        payload[field] = "";
      });

      const res = verificationSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        urlFields.forEach((field) => {
          expect(res.data[field]).toBeNull();
        });
      }
    });

    it("handles whitespace strings '   ' by converting all URL fields to null", () => {
      const payload: Record<string, any> = { ...basePayload };
      urlFields.forEach((field) => {
        payload[field] = "   ";
      });

      const res = verificationSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        urlFields.forEach((field) => {
          expect(res.data[field]).toBeNull();
        });
      }
    });

    it("preserves valid HTTP and HTTPS URLs", () => {
      const payload = {
        ...basePayload,
        govtIdUrl: "https://uploadthing.com/f/govt.pdf",
        panUrl: "http://example.com/pan.png",
      };

      const res = verificationSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.govtIdUrl).toBe("https://uploadthing.com/f/govt.pdf");
        expect(res.data.panUrl).toBe("http://example.com/pan.png");
      }
    });

    it("rejects invalid non-empty string URLs with error message", () => {
      const invalidValues = ["not-a-url", "ftp://invalid domain", "http://", "www.missing-protocol.com"];
      invalidValues.forEach((invalidUrl) => {
        const payload = {
          ...basePayload,
          govtIdUrl: invalidUrl,
        };
        const res = verificationSchema.safeParse(payload);
        expect(res.success).toBe(false);
        if (!res.success) {
          expect(res.error.issues[0].message).toBe("Invalid URL format");
        }
      });
    });

    it("accepts null for optional URL fields", () => {
      const payload = {
        ...basePayload,
        govtIdUrl: null,
        passportUrl: null,
      };
      const res = verificationSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.govtIdUrl).toBeNull();
        expect(res.data.passportUrl).toBeNull();
      }
    });

    it("accepts undefined for optional URL fields", () => {
      const payload = {
        ...basePayload,
      };
      const res = verificationSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.govtIdUrl).toBeUndefined();
      }
    });
  });

  describe("2. userSchema URL preprocessing & validation", () => {
    const baseUser = {
      email: "testuser@example.com",
      clerkUserId: "user_2pX0abc123",
    };

    it("converts empty string '' avatar to null", () => {
      const res = userSchema.safeParse({ ...baseUser, avatar: "" });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.avatar).toBeNull();
      }
    });

    it("converts whitespace string '   ' avatar to null", () => {
      const res = userSchema.safeParse({ ...baseUser, avatar: "   " });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.avatar).toBeNull();
      }
    });

    it("preserves valid avatar URL", () => {
      const validUrl = "https://img.clerk.com/avatar.jpg";
      const res = userSchema.safeParse({ ...baseUser, avatar: validUrl });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.avatar).toBe(validUrl);
      }
    });

    it("rejects invalid avatar URL", () => {
      const res = userSchema.safeParse({ ...baseUser, avatar: "invalid-avatar-path" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe("Invalid URL format");
      }
    });

    it("accepts null and undefined avatar", () => {
      const nullRes = userSchema.safeParse({ ...baseUser, avatar: null });
      expect(nullRes.success).toBe(true);
      if (nullRes.success) expect(nullRes.data.avatar).toBeNull();

      const undefRes = userSchema.safeParse({ ...baseUser, avatar: undefined });
      expect(undefRes.success).toBe(true);
      if (undefRes.success) expect(undefRes.data.avatar).toBeUndefined();
    });
  });

  describe("3. weddingSchema mainImageUrl preprocessing & validation", () => {
    const baseWedding = {
      hostCoupleId: validUUID,
      slug: "udaipur-palace-wedding",
      title: "Udaipur Palace Wedding",
      description: "A luxury heritage palace wedding experience in Rajasthan.",
      location: "Udaipur, Rajasthan",
      category: "Heritage",
      date: new Date(),
      pricePerGuest: 25000,
      capacity: 200,
    };

    it("preprocesses empty string '' mainImageUrl to default Unsplash fallback URL", () => {
      const res = weddingSchema.safeParse({ ...baseWedding, mainImageUrl: "" });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.mainImageUrl).toBe("https://images.unsplash.com/photo-1519741497674-611481863552");
      }
    });

    it("preprocesses whitespace string '   ' mainImageUrl to default Unsplash fallback URL", () => {
      const res = weddingSchema.safeParse({ ...baseWedding, mainImageUrl: "   " });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.mainImageUrl).toBe("https://images.unsplash.com/photo-1519741497674-611481863552");
      }
    });

    it("retains valid mainImageUrl string", () => {
      const validUrl = "https://cdn.weddingwithindia.com/weddings/udaipur.jpg";
      const res = weddingSchema.safeParse({ ...baseWedding, mainImageUrl: validUrl });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.mainImageUrl).toBe(validUrl);
      }
    });

    it("rejects invalid non-empty mainImageUrl string", () => {
      const res = weddingSchema.safeParse({ ...baseWedding, mainImageUrl: "not-a-valid-url" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe("Invalid image URL");
      }
    });

    it("rejects null mainImageUrl as required string field", () => {
      const res = weddingSchema.safeParse({ ...baseWedding, mainImageUrl: null });
      expect(res.success).toBe(false);
    });

    it("rejects undefined mainImageUrl as required field", () => {
      const res = weddingSchema.safeParse({ ...baseWedding });
      expect(res.success).toBe(false);
    });
  });

  describe("4. weddingGallerySchema imageUrl preprocessing & validation", () => {
    const baseGallery = {
      weddingId: validUUID,
    };

    it("preprocesses empty string '' imageUrl to default Unsplash fallback URL", () => {
      const res = weddingGallerySchema.safeParse({ ...baseGallery, imageUrl: "" });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.imageUrl).toBe("https://images.unsplash.com/photo-1519741497674-611481863552");
      }
    });

    it("preprocesses whitespace string '   ' imageUrl to default Unsplash fallback URL", () => {
      const res = weddingGallerySchema.safeParse({ ...baseGallery, imageUrl: "   " });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.imageUrl).toBe("https://images.unsplash.com/photo-1519741497674-611481863552");
      }
    });

    it("retains valid imageUrl string", () => {
      const validUrl = "https://cdn.weddingwithindia.com/gallery/photo1.jpg";
      const res = weddingGallerySchema.safeParse({ ...baseGallery, imageUrl: validUrl });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.imageUrl).toBe(validUrl);
      }
    });

    it("rejects invalid non-empty imageUrl string", () => {
      const res = weddingGallerySchema.safeParse({ ...baseGallery, imageUrl: "invalid-url-string" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe("Invalid image URL");
      }
    });

    it("rejects null imageUrl as required string field", () => {
      const res = weddingGallerySchema.safeParse({ ...baseGallery, imageUrl: null });
      expect(res.success).toBe(false);
    });

    it("rejects undefined imageUrl as required field", () => {
      const res = weddingGallerySchema.safeParse({ ...baseGallery });
      expect(res.success).toBe(false);
    });
  });
});
