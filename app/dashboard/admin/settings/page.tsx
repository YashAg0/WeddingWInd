import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireRole([UserRole.ADMIN]);
  redirect("/dashboard/admin/founder");
}
