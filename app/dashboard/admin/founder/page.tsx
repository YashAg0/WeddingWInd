import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { getSystemConfigAction, getSiteCMSAction, getCouponsAction } from "@/lib/actions/founder";
import FounderControlPanel from "@/components/dashboard/FounderControlPanel";
import { Sliders } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FounderControlPanelPage() {
  await requireRole([UserRole.ADMIN]);

  const config = await getSystemConfigAction();
  const cms = await getSiteCMSAction();
  const coupons = await getCouponsAction();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2">
          <Sliders className="text-maroon-600 w-8 h-8" />
          Founder Control Panel
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          No code required after launch. Complete zero-code control over homepage content, hero buttons, pricing rules, platform fees, verification switches, promo coupons, legal policies, and maintenance locks.
        </p>
      </div>

      <FounderControlPanel
        initialConfig={config}
        initialCMS={cms}
        initialCoupons={coupons}
      />
    </div>
  );
}
