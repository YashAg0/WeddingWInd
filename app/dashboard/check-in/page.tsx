import React from "react";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { ScanLine } from "lucide-react";
import ClientCheckInScanner from "./ClientCheckInScanner";

export const dynamic = "force-dynamic";

export default async function CheckInScannerPage() {
  const user = await requireAuth();

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: user.id },
  });
  const coordinator = await prisma.coordinatorProfile.findUnique({
    where: { userId: user.id },
  });
  const isAdmin = user.role === UserRole.ADMIN;
  const isCoordinator = !!coordinator || user.role === UserRole.COORDINATOR;

  if (!couple && !isCoordinator && !isAdmin) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        Unauthorized: Scanner access restricted to host couples, event coordinators, and administrators.
      </div>
    );
  }

  // Fetch weddings available for check-in scanning
  let whereClause: any = {};
  if (isAdmin) {
    whereClause = {};
  } else if (couple) {
    whereClause = { hostCoupleId: couple.id };
  } else if (coordinator?.assignedWeddingId) {
    whereClause = { id: coordinator.assignedWeddingId };
  } else {
    whereClause = {
      OR: [
        { coordinators: { some: { userId: user.id } } },
        coordinator?.assignedEventTitle ? { title: coordinator.assignedEventTitle } : { id: "no-match" },
      ],
    };
  }

  const weddings = await prisma.wedding.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      location: true,
    },
  });

  return (
    <div className="space-y-8 p-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-maroon-50 rounded-full flex items-center justify-center text-maroon-800 shadow-sm">
          <ScanLine size={24} />
        </div>
        <h1 className="font-display font-bold text-xl text-charcoal-900">
          Gate Check-In Scanner
        </h1>
        <p className="text-[10px] text-charcoal-500 max-w-xs mx-auto">
          Scan guest passes or enter manual verification tokens to check-in travelers at the entrance gate.
        </p>
      </div>

      <ClientCheckInScanner weddings={weddings} />
    </div>
  );
}
