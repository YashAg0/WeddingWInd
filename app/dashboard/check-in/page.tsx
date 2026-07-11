"use server";

import React from "react";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { Ticket, ScanLine } from "lucide-react";
import ClientCheckInScanner from "./ClientCheckInScanner";

export default async function CheckInScannerPage() {
  const user = await requireAuth();

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: user.id },
  });
  const isAdmin = user.role === UserRole.ADMIN;

  if (!couple && !isAdmin) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        Unauthorized: Scanner access restricted.
      </div>
    );
  }

  // Fetch weddings available for check-in scanning
  const weddings = await prisma.wedding.findMany({
    where: isAdmin ? {} : { hostCoupleId: couple?.id },
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
