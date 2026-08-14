import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Please provide a valid email address.").trim().toLowerCase(),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous-newsletter";
    const { success: rateOk } = await rateLimit("newsletter-subscribe", ip, { limit: 10, window: 600 });
    if (!rateOk) {
      return NextResponse.json(
        { message: "Too many subscription requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ message: "Invalid JSON request payload." }, { status: 400 });
    }

    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid email address." },
        { status: 400 }
      );
    }

    const email = parsed.data.email;

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        active: true,
      },
      update: {
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to the WeddingWithIndia newsletter.",
      subscriberId: subscriber.id,
    });
  } catch (error: any) {
    console.error("[API /api/newsletter POST] Subscription error:", error);
    return NextResponse.json(
      { message: "Unable to process subscription right now. Please try again shortly." },
      { status: 500 }
    );
  }
}
