import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VerificationForm from "@/components/dashboard/VerificationForm";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const user = await requireAuth();

  const verification = await prisma.verification.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          Trust & Identity Verification
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Submit and manage your official identity documentation, government credentials, and security compliance files.
        </p>
      </div>

      <VerificationForm
        initialVerification={verification ? JSON.parse(JSON.stringify(verification)) : null}
        userRole={user.role}
        userEmail={user.email}
      />
    </div>
  );
}
