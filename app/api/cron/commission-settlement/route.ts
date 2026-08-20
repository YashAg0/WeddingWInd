import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { settleMaturedCommissionsAction } from "@/lib/actions/referrals";

export const dynamic = "force-dynamic";

/**
 * Scheduled Cron Job for Commission Maturity Settlement.
 * Transitions commissions past the 14-day hold period from PENDING to APPROVED.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      logger.error("[cron/commission-settlement] CRON_SECRET is not configured");
      return new NextResponse("Service unavailable", { status: 503 });
    }
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await settleMaturedCommissionsAction();
    logger.info("[cron/commission-settlement] Successfully processed matured commissions", { result });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    logger.error("[cron/commission-settlement] Execution error", {}, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
