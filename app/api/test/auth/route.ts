import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isE2ETestAuthEnabled, createE2ETestSessionToken } from "@/lib/test-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isE2ETestAuthEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const role = searchParams.get("role");
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  let user = null;
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
  } else if (role) {
    user = await prisma.user.findFirst({ where: { role: role as any } });
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = createE2ETestSessionToken(user.id, user.role, user.email);

  const response = NextResponse.redirect(new URL(redirectUrl, req.url));
  response.cookies.set("__wwi_e2e_session", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  return response;
}

export async function POST(req: NextRequest) {
  if (!isE2ETestAuthEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { email, role } = body;

  let user = null;
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
  } else if (role) {
    user = await prisma.user.findFirst({ where: { role: role as any } });
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = createE2ETestSessionToken(user.id, user.role, user.email);

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role },
    token,
  });

  response.cookies.set("__wwi_e2e_session", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  return response;
}
