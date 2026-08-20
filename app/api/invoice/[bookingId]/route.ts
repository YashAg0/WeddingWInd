import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

const escapeHtml = (value: string | number) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#39;");

const formatCurrency = (amount: number, currency: string = "USD") => {
  if (currency === "INR") {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const user = await requireAuth();
    const { bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        traveler: { include: { user: true } },
        wedding: { include: { hostCouple: { include: { user: true } } } },
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking invoice not found." }, { status: 404 });
    }

    // Invoices contain personal billing data. Host operations receive the
    // privacy-minimized guest register instead, so only the traveler or an
    // administrator may download an invoice.
    if (
      user.role !== UserRole.ADMIN &&
      booking.traveler.userId !== user.id
    ) {
      return NextResponse.json({ error: "Forbidden: You do not own this invoice." }, { status: 403 });
    }

    const paidPayment = booking.payments.find((p) => p.status === "PAID") || booking.payments[0];

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${escapeHtml(booking.id)}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #faf8f5; color: #2b2627; margin: 0; padding: 40px; }
        .invoice-card { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid #e8e2d9; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f2ece4; padding-bottom: 24px; margin-bottom: 32px; }
        .brand { font-size: 24px; font-weight: 800; color: #6b1026; text-transform: uppercase; tracking: 1px; }
        .badge { background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 6px 12px; border-radius: 12px; border: 1px solid #a7f3d0; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
        .section-title { font-size: 11px; font-weight: 700; color: #8f8585; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .meta-val { font-size: 14px; font-weight: 600; color: #1c1819; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
        th { text-align: left; font-size: 11px; font-weight: 700; color: #8f8585; text-transform: uppercase; padding: 12px 16px; border-bottom: 1px solid #e8e2d9; background: #faf8f5; }
        td { padding: 16px; font-size: 14px; border-bottom: 1px solid #f2ece4; }
        .total-row td { font-size: 18px; font-weight: 800; color: #6b1026; border-bottom: none; border-top: 2px solid #6b1026; }
        .footer { text-align: center; font-size: 12px; color: #8f8585; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f2ece4; }
        @media print { body { background: #ffffff; padding: 0; } .invoice-card { border: none; box-shadow: none; } }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <div>
            <div class="brand">Wedding With India</div>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #8f8585;">Official Tax Invoice & Guest Reservation Pass</p>
          </div>
          <div>
            <span class="badge">${escapeHtml(booking.status)}</span>
          </div>
        </div>

        <div class="details-grid">
          <div>
            <div class="section-title">Billed To (Honored Guest)</div>
            <div class="meta-val">${escapeHtml(booking.traveler.fullName)}</div>
            <div style="font-size: 13px; color: #574f50; margin-top: 4px;">${escapeHtml(booking.traveler.user.email)}</div>
          </div>
          <div>
            <div class="section-title">Invoice Meta</div>
            <div><strong>Invoice ID:</strong> INV-${escapeHtml(booking.id.slice(0, 8).toUpperCase())}</div>
            <div><strong>Date Issued:</strong> ${new Date(booking.createdAt).toLocaleDateString()}</div>
            <div><strong>Transaction Ref:</strong> ${escapeHtml(paidPayment?.transactionId || paidPayment?.stripePaymentIntentId || "TXN-" + booking.id.slice(0, 10))}</div>
          </div>
        </div>

        <div style="margin-bottom: 32px; padding: 20px; background: #fdfaf7; border-radius: 16px; border: 1px solid #f2ece4;">
          <div class="section-title">Wedding Celebration</div>
          <div style="font-size: 16px; font-weight: 700; color: #6b1026;">${escapeHtml(booking.wedding.title)}</div>
          <div style="font-size: 13px; color: #574f50; margin-top: 4px;">Venue: ${escapeHtml(booking.wedding.location)} | Date: ${new Date(booking.wedding.date).toLocaleDateString()}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Rate</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Guest Reservation Pass</strong><br/><span style="font-size: 12px; color: #8f8585;">Full ceremonial access, feasts, welcome gifts & liaison</span></td>
              <td>${booking.guestsCount} Guest(s)</td>
              <td>${formatCurrency(booking.pricePerGuest, booking.currency || "USD")}</td>
              <td style="text-align: right;">${formatCurrency(booking.guestsCount * booking.pricePerGuest, booking.currency || "USD")}</td>
            </tr>
            <tr>
              <td><strong>Platform Concierge & Safety Hold Fee</strong></td>
              <td>1</td>
              <td>Included</td>
              <td style="text-align: right;">$0.00 USD</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">Total Amount Paid</td>
              <td style="text-align: right;">${formatCurrency(booking.totalAmount, booking.currency || "USD")}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for celebrating with us. For inquiries, email concierge@weddingwithindia.com</p>
          <button onclick="window.print()" style="padding: 10px 20px; background: #6b1026; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; margin-top: 10px;">Print / Save PDF</button>
        </div>
      </div>
    </body>
    </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate invoice." }, { status: 500 });
  }
}
