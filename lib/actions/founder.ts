"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { requireRole } from "../auth";
import { UserRole } from "@prisma/client";
import { createAuditLog } from "./admin";

const db = prisma as any;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Singleton System Config (Fees, Commissions, Verification, Features)
// ─────────────────────────────────────────────────────────────────────────────

export async function getSystemConfigAction() {
  await requireRole([UserRole.ADMIN]);

  const config = await db.systemConfig.upsert({
    where: { id: "global" },
    create: { id: "global" },
    update: {},
  });

  return JSON.parse(JSON.stringify(config));
}

export async function updateSystemConfigAction(data: {
  platformFeePercent?: number;
  agentCommissionPercent?: number;
  referralRewardPercent?: number;
  taxPercent?: number;
  currencyCode?: string;
  secondaryCurrencies?: string;
  requireTravelerVerification?: boolean;
  requireHostVerification?: boolean;
  requireAgentVerification?: boolean;
  autoApproveVerifiedHosts?: boolean;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  enableCoupons?: boolean;
  enablePushNotifications?: boolean;
}) {
  await requireRole([UserRole.ADMIN]);

  const updated = await db.systemConfig.upsert({
    where: { id: "global" },
    create: { id: "global", ...data },
    update: { ...data },
  });

  await createAuditLog("UPDATE_SYSTEM_CONFIG", "SystemConfig", "global", `Updated founder financial & operational settings: platformFee=${updated.platformFeePercent}%, agentComm=${updated.agentCommissionPercent}%`);

  revalidatePath("/");
  revalidatePath("/weddings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard/admin/founder");
  return { success: true, config: JSON.parse(JSON.stringify(updated)) };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Singleton Site CMS (Homepage Hero, SEO, Legal, Contact)
// ─────────────────────────────────────────────────────────────────────────────

export async function getSiteCMSAction() {
  const cms = await db.siteCMS.upsert({
    where: { id: "global" },
    create: { id: "global" },
    update: {},
  });

  return JSON.parse(JSON.stringify(cms));
}

export async function updateSiteCMSAction(data: {
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroPrimaryCtaText?: string;
  heroPrimaryCtaUrl?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaUrl?: string;
  heroBgImageUrl?: string;
  heroBgVideoUrl?: string;
  siteTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  twitterHandle?: string;
  termsOfServiceContent?: string;
  privacyPolicyContent?: string;
  cookiePolicyContent?: string;
  supportContactEmail?: string;
  supportContactPhone?: string;
}) {
  await requireRole([UserRole.ADMIN]);

  const updated = await db.siteCMS.upsert({
    where: { id: "global" },
    create: { id: "global", ...data },
    update: { ...data },
  });

  await createAuditLog("UPDATE_SITE_CMS", "SiteCMS", "global", `Updated Founder CMS Content: heroTitle="${updated.heroTitle}"`);

  revalidatePath("/");
  revalidatePath("/terms");
  revalidatePath("/privacy");
  revalidatePath("/cookies");
  revalidatePath("/contact");
  revalidatePath("/dashboard/admin/cms");
  revalidatePath("/dashboard/admin/founder");
  return { success: true, cms: JSON.parse(JSON.stringify(updated)) };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Coupon & Promo Management
// ─────────────────────────────────────────────────────────────────────────────

export async function getCouponsAction() {
  await requireRole([UserRole.ADMIN]);

  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return JSON.parse(JSON.stringify(coupons));
}

export async function createCouponAction(data: {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minSpend?: number;
  maxDiscount?: number;
  expiresAt?: string;
  maxUses?: number;
}) {
  await requireRole([UserRole.ADMIN]);

  const code = data.code.toUpperCase().trim();
  const existing = await db.coupon.findUnique({ where: { code } });
  if (existing) {
    throw new Error(`Coupon code "${code}" already exists.`);
  }

  const coupon = await db.coupon.create({
    data: {
      code,
      discountPercent: data.discountPercent ? Number(data.discountPercent) : null,
      discountAmount: data.discountAmount ? Number(data.discountAmount) : null,
      minSpend: data.minSpend ? Number(data.minSpend) : 0,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      maxUses: data.maxUses ? Number(data.maxUses) : null,
    },
  });

  await createAuditLog("CREATE_COUPON", "Coupon", coupon.id, `Created promo coupon "${coupon.code}"`);

  revalidatePath("/dashboard/admin/founder");
  return { success: true, coupon: JSON.parse(JSON.stringify(coupon)) };
}

export async function toggleCouponAction(couponId: string, active: boolean) {
  await requireRole([UserRole.ADMIN]);

  const updated = await db.coupon.update({
    where: { id: couponId },
    data: { active },
  });

  await createAuditLog("TOGGLE_COUPON", "Coupon", couponId, `Toggled coupon "${updated.code}" active state to ${active}`);

  revalidatePath("/dashboard/admin/founder");
  return { success: true };
}

export async function deleteCouponAction(couponId: string) {
  await requireRole([UserRole.ADMIN]);

  const deleted = await db.coupon.delete({
    where: { id: couponId },
  });

  await createAuditLog("DELETE_COUPON", "Coupon", couponId, `Deleted coupon "${deleted.code}"`);

  revalidatePath("/dashboard/admin/founder");
  return { success: true };
}
