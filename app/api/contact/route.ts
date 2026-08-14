import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous-contact";
    const { success } = await rateLimit("contact-form", ip, { limit: 5, window: 600 });
    if (!success) {
      return NextResponse.json(
        { message: "Too many contact submissions. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
    }

    const { name, email, subject, message, role, privacyConsent, website } = body;

    // Honeypot check: silently accept automated submissions
    if (website && typeof website === "string" && website.trim() !== "") {
      return NextResponse.json({ success: true, message: "Message received." });
    }

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ message: "Please provide a valid full name." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ message: "Please provide a valid email address." }, { status: 400 });
    }

    if (!subject || typeof subject !== "string" || subject.trim().length < 2) {
      return NextResponse.json({ message: "Please enter a message subject." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json({ message: "Please enter a message of at least 10 characters." }, { status: 400 });
    }

    if (!privacyConsent) {
      return NextResponse.json({ message: "You must confirm our Privacy Policy before submitting." }, { status: 400 });
    }

    const fullSubject = role ? `[${String(role).toUpperCase()}] ${subject.trim()}` : subject.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();

    // Idempotency check: if identical message from same email was submitted within last 60 seconds, return existing
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const existing = await prisma.contactSubmission.findFirst({
      where: {
        email: cleanEmail,
        subject: fullSubject,
        message: cleanMessage,
        createdAt: { gte: oneMinuteAgo },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Message received successfully.",
        id: existing.id,
      });
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        subject: fullSubject,
        message: cleanMessage,
        status: "NEW",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Message received successfully.",
      id: submission.id,
    });
  } catch (error) {
    console.error("Error handling contact submission:", error);
    return NextResponse.json(
      { message: "Failed to save message. Please try again or email support@weddingwithindia.com." },
      { status: 500 }
    );
  }
}
