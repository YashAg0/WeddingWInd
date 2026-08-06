/**
 * WeddingWithIndia — Role-Based Access Control (RBAC) Engine
 * Defines granular permissions, role hierarchies, and enforcement helpers across:
 * - GUEST (Unauthenticated Traveler)
 * - TRAVELER (Registered Guest)
 * - COUPLE (Wedding Host)
 * - AGENT (Referral Partner)
 * - COORDINATOR (On-Site Operations Lead)
 * - ADMIN (Platform Operations Lead)
 * - SUPER_ADMIN (Platform Founder / System Administrator)
 */

import { UserRole } from "@prisma/client";
import { requireAuth } from "./auth";

export type ExtendedRole = 
  | "GUEST"
  | "TRAVELER"
  | "COUPLE"
  | "AGENT"
  | "COORDINATOR"
  | "ADMIN"
  | "SUPER_ADMIN";

export type Permission =
  // Public / Traveler Capabilities
  | "VIEW_PUBLIC_LISTINGS"
  | "BOOK_WEDDING"
  | "MANAGE_WISHLIST"
  | "SUBMIT_REVIEW"
  | "VIEW_GUEST_PASS"
  
  // Host (Couple) Capabilities
  | "CREATE_WEDDING"
  | "EDIT_OWN_WEDDING"
  | "MANAGE_WEDDING_TIMELINE"
  | "VIEW_HOST_EARNINGS"
  | "REPLY_TO_REVIEWS"
  
  // Agent Capabilities
  | "VIEW_AGENT_REFERRALS"
  | "GENERATE_REFERRAL_CODE"
  | "REQUEST_COMMISSION_PAYOUT"
  
  // Coordinator Capabilities
  | "CHECKIN_GUEST_QR"
  | "VIEW_OPERATIONS_ROSTER"
  | "SUBMIT_INCIDENT_REPORT"
  
  // Admin Capabilities
  | "VERIFY_HOST_LISTING"
  | "APPROVE_AGENT_APPLICATION"
  | "VIEW_ADMIN_FINANCIAL_LEDGER"
  | "TRIAGE_SAFETY_CASES"
  | "MANAGE_CMS_CONTENT"
  
  // Super Admin Capabilities
  | "PROMOTES_ADMIN_ROLES"
  | "OVERRIDE_SAFETY_CASES"
  | "EXECUTE_SYSTEM_BOOTSTRAP"
  | "VIEW_AUDIT_LOGS";

/**
 * Master Role to Permission Mapping Matrix
 */
export const ROLE_PERMISSIONS: Record<ExtendedRole, Permission[]> = {
  GUEST: [
    "VIEW_PUBLIC_LISTINGS",
  ],
  TRAVELER: [
    "VIEW_PUBLIC_LISTINGS",
    "BOOK_WEDDING",
    "MANAGE_WISHLIST",
    "SUBMIT_REVIEW",
    "VIEW_GUEST_PASS",
  ],
  COUPLE: [
    "VIEW_PUBLIC_LISTINGS",
    "CREATE_WEDDING",
    "EDIT_OWN_WEDDING",
    "MANAGE_WEDDING_TIMELINE",
    "VIEW_HOST_EARNINGS",
    "REPLY_TO_REVIEWS",
  ],
  AGENT: [
    "VIEW_PUBLIC_LISTINGS",
    "VIEW_AGENT_REFERRALS",
    "GENERATE_REFERRAL_CODE",
    "REQUEST_COMMISSION_PAYOUT",
  ],
  COORDINATOR: [
    "VIEW_PUBLIC_LISTINGS",
    "CHECKIN_GUEST_QR",
    "VIEW_OPERATIONS_ROSTER",
    "SUBMIT_INCIDENT_REPORT",
  ],
  ADMIN: [
    "VIEW_PUBLIC_LISTINGS",
    "VERIFY_HOST_LISTING",
    "APPROVE_AGENT_APPLICATION",
    "VIEW_ADMIN_FINANCIAL_LEDGER",
    "TRIAGE_SAFETY_CASES",
    "MANAGE_CMS_CONTENT",
    "CHECKIN_GUEST_QR",
    "VIEW_OPERATIONS_ROSTER",
  ],
  SUPER_ADMIN: [
    "VIEW_PUBLIC_LISTINGS",
    "BOOK_WEDDING",
    "MANAGE_WISHLIST",
    "SUBMIT_REVIEW",
    "VIEW_GUEST_PASS",
    "CREATE_WEDDING",
    "EDIT_OWN_WEDDING",
    "MANAGE_WEDDING_TIMELINE",
    "VIEW_HOST_EARNINGS",
    "REPLY_TO_REVIEWS",
    "VIEW_AGENT_REFERRALS",
    "GENERATE_REFERRAL_CODE",
    "REQUEST_COMMISSION_PAYOUT",
    "CHECKIN_GUEST_QR",
    "VIEW_OPERATIONS_ROSTER",
    "SUBMIT_INCIDENT_REPORT",
    "VERIFY_HOST_LISTING",
    "APPROVE_AGENT_APPLICATION",
    "VIEW_ADMIN_FINANCIAL_LEDGER",
    "TRIAGE_SAFETY_CASES",
    "MANAGE_CMS_CONTENT",
    "PROMOTES_ADMIN_ROLES",
    "OVERRIDE_SAFETY_CASES",
    "EXECUTE_SYSTEM_BOOTSTRAP",
    "VIEW_AUDIT_LOGS",
  ],
};

/**
 * Resolves full ExtendedRole for a database user object.
 */
export function resolveUserRole(user: any): ExtendedRole {
  if (!user) return "GUEST";
  if (user.email === "superadmin@weddingwithindia.com" || user.clerkUserId === "user_superadmin_seed") {
    return "SUPER_ADMIN";
  }
  if (user.role === UserRole.ADMIN) {
    if (user.email?.includes("coordinator") || user.clerkUserId?.includes("coordinator")) {
      return "COORDINATOR";
    }
    return "ADMIN";
  }
  if (user.role === UserRole.COUPLE) return "COUPLE";
  if (user.role === UserRole.AGENT) return "AGENT";
  return "TRAVELER";
}

/**
 * Checks whether a given role possesses a specific permission.
 */
export function hasPermission(role: ExtendedRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Enforces permission requirement on current authenticated user.
 * Throws an explicit error if unauthorized or missing permission.
 */
export async function requirePermission(permission: Permission) {
  const user = await requireAuth();
  const role = resolveUserRole(user);
  
  if (!hasPermission(role, permission)) {
    throw new Error(`FORBIDDEN: Role '${role}' lacks required permission '${permission}'.`);
  }
  return { user, role };
}

/**
 * Helper predicates
 */
export function isSuperAdminRole(role: ExtendedRole): boolean {
  return role === "SUPER_ADMIN";
}

export function isAdminRole(role: ExtendedRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isHostRole(role: ExtendedRole): boolean {
  return role === "COUPLE" || role === "SUPER_ADMIN";
}

export function isAgentRole(role: ExtendedRole): boolean {
  return role === "AGENT" || role === "SUPER_ADMIN";
}

export function isCoordinatorRole(role: ExtendedRole): boolean {
  return role === "COORDINATOR" || role === "ADMIN" || role === "SUPER_ADMIN";
}
