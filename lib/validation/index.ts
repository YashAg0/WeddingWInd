import { z } from "zod";

// Enums
export const UserRoleSchema = z.enum(["TRAVELER", "COUPLE", "AGENT", "ADMIN"]);
export const UserStatusSchema = z.enum(["ACTIVE", "ONBOARDING", "BANNED"]);
export const WeddingStatusSchema = z.enum(["DRAFT", "PUBLISHED", "COMPLETED"]);
export const BookingStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "AWAITING_PAYMENT", "PAID", "COMPLETED", "CANCELLED", "REFUNDED"]);
export const PaymentStatusSchema = z.enum(["PENDING", "PAID", "REFUNDED", "FAILED"]);
export const CommissionStatusSchema = z.enum(["PENDING", "PAID", "VOIDED"]);
export const ReferralStatusSchema = z.enum(["PENDING", "CONVERTED"]);
export const VerificationStatusSchema = z.enum(["NOT_SUBMITTED", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "EXPIRED"]);
export const NotificationTypeSchema = z.enum(["INFO", "SUCCESS", "ALERT", "REQUEST"]);
export const ContactStatusSchema = z.enum(["NEW", "READ", "RESOLVED"]);

// 1. User Schema
export const userSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email("Invalid email format"),
  clerkUserId: z.string().min(1, "Clerk User ID is required"),
  name: z.string().nullable().optional(),
  avatar: z.string().url("Invalid avatar URL").nullable().optional(),
  role: UserRoleSchema.default("TRAVELER"),
  status: UserStatusSchema.default("ONBOARDING"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// 2. Traveler Profile Schema
export const travelerProfileSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid("Invalid User UUID"),
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  country: z.string().min(1, "Country is required"),
  language: z.string().min(1, "Language is required"),
  interests: z.string().nullable().optional(),
  budget: z.string().default("1000"),
  preferences: z.string().default("Traditional"),
  foodPreferences: z.string().default("No Restrictions"),
  accessibility: z.string().default("None")
});

// 3. Couple Profile Schema
export const coupleProfileSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid("Invalid User UUID"),
  weddingDate: z.coerce.date().nullable().optional(),
  weddingLocation: z.string().nullable().optional(),
  expectedGuests: z.number().int().min(1).default(200),
  traditions: z.string().nullable().optional(),
  languagesSpoken: z.string().nullable().optional(),
  photographyRules: z.string().default("Allowed"),
  familyBio: z.string().nullable().optional()
});

// 4. Agent Profile Schema
export const agentProfileSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid("Invalid User UUID"),
  organization: z.string().min(1, "Organization name is required"),
  country: z.string().min(1, "Country is required"),
  experienceYears: z.number().int().nonnegative().default(2),
  targetAudience: z.string().nullable().optional(),
  verifiedChecks: z.boolean().default(false)
});

// 5. Wedding Schema
export const weddingSchema = z.object({
  id: z.string().uuid().optional(),
  hostCoupleId: z.string().uuid("Invalid Couple Profile UUID"),
  slug: z.string().min(1, "Slug is required"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  date: z.coerce.date(),
  pricePerGuest: z.number().positive("Price must be greater than zero"),
  capacity: z.number().int().positive("Capacity must be positive"),
  requiredGuests: z.number().int().nonnegative().default(0),
  theme: z.string().nullable().optional(),
  dressCode: z.string().nullable().optional(),
  ethnicity: z.string().nullable().optional(),
  mainImageUrl: z.string().url("Invalid image URL"),
  status: WeddingStatusSchema.default("DRAFT")
});

// 6. Wedding Gallery Schema
export const weddingGallerySchema = z.object({
  id: z.string().uuid().optional(),
  weddingId: z.string().uuid("Invalid Wedding UUID"),
  imageUrl: z.string().url("Invalid image URL"),
  order: z.number().int().nonnegative().default(0)
});

// 7. Wedding Event Schema
export const weddingEventSchema = z.object({
  id: z.string().uuid().optional(),
  weddingId: z.string().uuid("Invalid Wedding UUID"),
  name: z.string().min(1, "Event name is required"),
  description: z.string().nullable().optional(),
  date: z.coerce.date(),
  startTime: z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  location: z.string().min(1, "Location is required"),
  dressCode: z.string().nullable().optional()
});

// 8. Wedding Tradition Schema
export const weddingTraditionSchema = z.object({
  id: z.string().uuid().optional(),
  weddingId: z.string().uuid("Invalid Wedding UUID"),
  name: z.string().min(1, "Tradition name is required"),
  description: z.string().min(1, "Description is required")
});

// 9. Booking Schema
export const bookingSchema = z.object({
  id: z.string().uuid().optional(),
  travelerId: z.string().uuid("Invalid Traveler Profile UUID"),
  weddingId: z.string().uuid("Invalid Wedding UUID"),
  date: z.coerce.date(),
  guestsCount: z.number().int().min(1, "Guests count must be at least 1"),
  pricePerGuest: z.number().positive(),
  totalAmount: z.number().positive(),
  status: BookingStatusSchema.default("PENDING")
});

// 10. Booking Guest Schema
export const bookingGuestSchema = z.object({
  id: z.string().uuid().optional(),
  bookingId: z.string().uuid("Invalid Booking UUID"),
  fullName: z.string().min(2, "Full Name is required"),
  email: z.string().email().nullable().optional(),
  age: z.number().int().positive().nullable().optional(),
  gender: z.string().nullable().optional(),
  foodPreference: z.string().default("No Restrictions"),
  accessibilityNeed: z.string().default("None")
});

// 11. Wishlist Schema
export const wishlistSchema = z.object({
  id: z.string().uuid().optional(),
  travelerId: z.string().uuid("Invalid Traveler Profile UUID"),
  weddingId: z.string().uuid("Invalid Wedding UUID")
});

// 12. Review Schema
export const reviewSchema = z.object({
  id: z.string().uuid().optional(),
  bookingId: z.string().uuid("Invalid Booking UUID"),
  travelerId: z.string().uuid("Invalid Traveler Profile UUID"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
  reply: z.string().nullable().optional(),
  status: z.string().default("APPROVED")
});

// 13. Notification Schema
export const notificationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid("Invalid User UUID"),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: NotificationTypeSchema.default("INFO"),
  read: z.boolean().default(false)
});

// 14. Payment Schema
export const paymentSchema = z.object({
  id: z.string().uuid().optional(),
  bookingId: z.string().uuid("Invalid Booking UUID"),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  stripePaymentIntentId: z.string().nullable().optional(),
  stripeChargeId: z.string().nullable().optional(),
  status: PaymentStatusSchema.default("PENDING")
});

// 15. Commission Schema
export const commissionSchema = z.object({
  id: z.string().uuid().optional(),
  paymentId: z.string().uuid("Invalid Payment UUID"),
  agentId: z.string().uuid("Invalid Agent Profile UUID"),
  amount: z.number().positive(),
  status: CommissionStatusSchema.default("PENDING")
});

// 16. Agent Referral Schema
export const agentReferralSchema = z.object({
  id: z.string().uuid().optional(),
  agentId: z.string().uuid("Invalid Agent Profile UUID"),
  referredUserId: z.string().uuid("Invalid User UUID"),
  status: ReferralStatusSchema.default("PENDING"),
  points: z.number().int().nonnegative().default(0)
});

// 17. Verification Schema
export const verificationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid("Invalid User UUID"),
  status: VerificationStatusSchema.default("NOT_SUBMITTED"),
  passportUrl: z.string().url().nullable().optional(),
  govtIdUrl: z.string().url().nullable().optional(),
  selfieUrl: z.string().url().nullable().optional(),
  phoneVerified: z.boolean().default(false),
  emailVerified: z.boolean().default(false),
  invitationUrl: z.string().url().nullable().optional(),
  venueConfirmUrl: z.string().url().nullable().optional(),
  socialLinks: z.string().nullable().optional(),
  orgDetails: z.string().nullable().optional(),
  businessRegUrl: z.string().url().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  submissionDate: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  expiryDate: z.coerce.date().nullable().optional(),
  reviewedBy: z.string().nullable().optional()
});

// 18. Country Schema
export const countrySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  code: z.string().min(2).max(5)
});

// 19. State Schema
export const stateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  countryId: z.string().uuid()
});

// 20. City Schema
export const citySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  stateId: z.string().uuid()
});

// 21. Language Schema
export const languageSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  code: z.string().min(2).max(5)
});

// 22. FAQ Schema
export const faqSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(5),
  answer: z.string().min(10),
  category: z.string().min(1),
  order: z.number().int().nonnegative().default(0)
});

// 23. Contact Submission Schema
export const contactSubmissionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  status: ContactStatusSchema.default("NEW")
});

// 24. Newsletter Subscriber Schema
export const newsletterSubscriberSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email("Invalid email format"),
  active: z.boolean().default(true)
});
