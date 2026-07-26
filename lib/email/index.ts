import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

interface MailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends a transactional email using the Resend API.
 */
export async function sendEmail({ to, subject, html }: MailPayload) {
  try {
    const data = await resend.emails.send({
      from: "Wedding With India <noreply@weddingwithindia.com>",
      to,
      subject,
      html
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send transactional email via Resend:", error);
    return { success: false, error };
  }
}

/**
 * 1. Welcome Email Template
 */
export async function sendWelcomeEmail(to: string, userName: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6b1026;">Welcome to Wedding With India, ${userName}!</h2>
      <p>Thank you for joining the world's first cultural wedding discovery marketplace.</p>
      <p>Explore real celebrations, experience local customs, and connect directly with host families or travel partners.</p>
      <div style="margin-top: 30px; text-align: center;">
        <a href="https://weddingwithindia.com/weddings" style="background-color: #6b1026; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Weddings</a>
      </div>
      <p style="margin-top: 30px; font-size: 0.8em; color: #777;">If you have any questions, reply directly to this email support channel.</p>
    </div>
  `;
  return sendEmail({ to, subject: "Welcome to Wedding With India", html });
}

/**
 * 2. Booking Confirmation Email Template
 */
export async function sendBookingConfirmationEmail(
  to: string,
  guestName: string,
  weddingTitle: string,
  date: string,
  guestsCount: number,
  totalAmount: number
) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6b1026;">Booking Confirmed</h2>
      <p>Hello ${guestName},</p>
      <p>Your guest pass request for <strong>${weddingTitle}</strong> has been successfully booked.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Date:</td><td>${date}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Attendees:</td><td>${guestsCount} guest(s)</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Paid Total:</td><td>$${totalAmount.toLocaleString()} USD</td></tr>
      </table>
      <p style="margin-top: 20px;">Prepare your dress code, print tickets inside your dashboard, and read cultural etiquettes on the portal.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Booking Confirmed: ${weddingTitle}`, html });
}

/**
 * 3. Host Slot Approval with Payment Link Email Template
 */
export async function sendHostApprovalWithPaymentLinkEmail(
  to: string,
  travelerName: string,
  weddingTitle: string,
  paymentUrl: string
) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #10b981;">Application Approved! ✅</h2>
      <p>Hello ${travelerName},</p>
      <p>We are delighted to inform you that the host family has approved your application to attend <strong>${weddingTitle}</strong>.</p>
      <p>To finalize your reservation and secure your spot, please complete your payment using the secure Stripe Checkout link below:</p>
      <div style="margin: 25px 0; text-align: center;">
        <a href="${paymentUrl}" style="background-color: #6b1026; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Pay & Confirm Spot</a>
      </div>
      <p style="font-size: 0.85em; color: #666;">Note: This payment link will expire in 30 minutes. If unpaid, your reservation request may be released to other travelers.</p>
      <p>Warm regards,<br/>The Host Family & Support Liaison Team</p>
    </div>
  `;
  return sendEmail({ to, subject: `Action Required: Pay & Confirm Spot for ${weddingTitle}`, html });
}

/**
 * 4. Host Slot Rejection Email Template
 */
export async function sendHostRejectionEmail(to: string, travelerName: string, weddingTitle: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #ef4444;">Application Status Update</h2>
      <p>Hello ${travelerName},</p>
      <p>Thank you for your interest in attending <strong>${weddingTitle}</strong>.</p>
      <p>Unfortunately, the host family cannot accommodate your application at this time due to capacity limits. We have processed a full refund to your payment card if any fees were held.</p>
      <p>We invite you to browse other heritage wedding listings on our marketplace.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Update: Application to attend ${weddingTitle}`, html });
}

/**
 * 5. Agent Referral Commission Alert Email Template
 */
export async function sendAgentReferralEmail(to: string, agentName: string, referredName: string, amount: number) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6b1026;">New Referral Commission Registered! 💰</h2>
      <p>Hello ${agentName},</p>
      <p>Your referred user <strong>${referredName}</strong> has completed their wedding booking checkout.</p>
      <p>A new referral commission of <strong>$${amount.toLocaleString()}</strong> has been credited to your agent profile account, pending payout release.</p>
      <p>Log in to your agent workspace dashboard to review clicks, conversions, and totals.</p>
    </div>
  `;
  return sendEmail({ to, subject: "Referral Commission Earn5!", html });
}

/**
 * 6. Payment Invoice Email Template
 */
export async function sendInvoiceEmail(
  to: string,
  travelerName: string,
  weddingTitle: string,
  invoiceId: string,
  amount: number,
  guestsCount: number,
  date: string
) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6b1026;">Payment Invoice</h2>
      <p>Hello ${travelerName},</p>
      <p>Thank you for your payment. Your booking is now confirmed. Below is your transaction invoice summary:</p>
      <div style="background-color: #fcf8f9; border: 1px solid #f5e6e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; font-size: 0.9em; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; font-weight: bold;">Invoice ID:</td><td style="text-align: right;">${invoiceId}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: bold;">Wedding:</td><td style="text-align: right;">${weddingTitle}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: bold;">Date:</td><td style="text-align: right;">${date}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: bold;">Guests:</td><td style="text-align: right;">${guestsCount}</td></tr>
          <tr style="border-top: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold; font-size: 1.1em;">Total Paid:</td><td style="text-align: right; font-weight: bold; font-size: 1.1em; color: #6b1026;">$${amount.toLocaleString()} USD</td></tr>
        </table>
      </div>
      <p>We look forward to hosting you. You can download this receipt directly from your traveler dashboard.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Invoice for ${weddingTitle} Booking`, html });
}

/**
 * 7. Refund Confirmation Email Template
 */
export async function sendRefundConfirmationEmail(
  to: string,
  travelerName: string,
  weddingTitle: string,
  refundId: string,
  amount: number
) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #ef4444;">Refund Processed</h2>
      <p>Hello ${travelerName},</p>
      <p>This email confirms that a refund has been successfully processed for your reservation at <strong>${weddingTitle}</strong>.</p>
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; font-size: 0.9em; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; font-weight: bold;">Refund ID:</td><td style="text-align: right;">${refundId}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: bold;">Wedding:</td><td style="text-align: right;">${weddingTitle}</td></tr>
          <tr style="border-top: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold; font-size: 1.1em;">Amount Refunded:</td><td style="text-align: right; font-weight: bold; font-size: 1.1em; color: #ef4444;">$${amount.toLocaleString()} USD</td></tr>
        </table>
      </div>
      <p>The funds will be credited back to your original payment card within 5-10 business days.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Refund Confirmed: ${weddingTitle}`, html });
}

/**
 * 8. Verification Submitted Email Template
 */
export async function sendVerificationSubmittedEmail(to: string, userName: string, role: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6b1026;">Verification Documents Received! 📄</h2>
      <p>Hello ${userName},</p>
      <p>Thank you for submitting your verification details as a <strong>${role.toUpperCase()}</strong>.</p>
      <p>Our Trust & Safety team is currently auditing your documents. This review typically takes 24 to 48 hours.</p>
      <p>We will email you as soon as your profile status is updated.</p>
      <p>Warm regards,<br/>The Trust & Safety liaison Team</p>
    </div>
  `;
  return sendEmail({ to, subject: "Trust & Safety: Documents Under Review", html });
}

/**
 * 9. Verification Approved Email Template
 */
export async function sendVerificationApprovedEmail(to: string, userName: string, _role: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #10b981;">Verification Approved! ✅</h2>
      <p>Hello ${userName},</p>
      <p>Congratulations! Your trust verification profile has been reviewed and successfully approved.</p>
      <p>A verification badge has been added to your profile card. You now have full platform privileges.</p>
      <p>Explore listings, send bookings, or manage guest portals with absolute confidence.</p>
    </div>
  `;
  return sendEmail({ to, subject: "Trust & Safety: Verification Approved", html });
}

/**
 * 10. Verification Rejected Email Template
 */
export async function sendVerificationRejectedEmail(to: string, userName: string, reason: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #ef4444;">Verification Status Update</h2>
      <p>Hello ${userName},</p>
      <p>We have reviewed your trust verification documents, and unfortunately, we cannot approve your submission at this time.</p>
      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; color: #991b1b;">
        <strong>Audit Notes / Reason:</strong><br/>
        ${reason || "Uploaded documents are blurred or invalid."}
      </div>
      <p>Please open your profile dashboard, review the requirements, and re-submit a set of clear documents.</p>
    </div>
  `;
  return sendEmail({ to, subject: "Action Required: Trust Verification Declined", html });
}

export async function sendNewMessageEmail(to: string, senderName: string, conversationTitle: string, messageText: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6b1026;">New Message Received 💬</h2>
      <p>Hello,</p>
      <p>You received a new message from <strong>${senderName}</strong> in <strong>${conversationTitle || "your chat"}</strong>:</p>
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 15px 0; font-style: italic;">
        "${messageText}"
      </div>
      <p>Click the link below to view the conversation and reply:</p>
      <div style="margin: 25px 0; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/messages" style="background-color: #6b1026; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View & Reply</a>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: `New message from ${senderName}`, html });
}

export async function sendBookingUpdateEmail(to: string, userName: string, weddingTitle: string, status: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6b1026;">Booking Status Update 📅</h2>
      <p>Hello ${userName},</p>
      <p>Your booking request status for <strong>${weddingTitle}</strong> has been updated to: <strong>${status.toUpperCase()}</strong>.</p>
      <p>Please log in to your dashboard to review changes or check next steps.</p>
      <div style="margin: 25px 0; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/bookings" style="background-color: #6b1026; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Booking</a>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: `Booking update: ${weddingTitle}`, html });
}

export async function sendPaymentReminderEmail(to: string, userName: string, weddingTitle: string, amount: number) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6b1026;">Action Required: Payment Pending 💳</h2>
      <p>Hello ${userName},</p>
      <p>This is a reminder that payment is required for your booking at <strong>${weddingTitle}</strong>.</p>
      <p>Pending amount: <strong>$${amount.toLocaleString()} USD</strong></p>
      <p>Complete the payment immediately to finalize your ticket reservation.</p>
      <div style="margin: 25px 0; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/bookings" style="background-color: #6b1026; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Pay Invoice Now</a>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: `Action Required: Payment reminder for ${weddingTitle}`, html });
}

export async function sendVerificationReminderEmail(to: string, userName: string, currentStatus: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6b1026;">Trust Verification Audit Update 📄</h2>
      <p>Hello ${userName},</p>
      <p>Your trust verification status is currently: <strong>${currentStatus.toUpperCase()}</strong>.</p>
      <p>Please make sure you have uploaded high-quality copies of your passport and government registration documents to secure full platform privileges.</p>
      <div style="margin: 25px 0; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/profile" style="background-color: #6b1026; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Complete Verification</a>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: "Trust & Safety: Complete Verification", html });
}

export async function sendUnreadConversationReminderEmail(to: string, userName: string, count: number) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6b1026;">Unread Conversations Pending 💬</h2>
      <p>Hello ${userName},</p>
      <p>You have <strong>${count} unread conversation(s)</strong> waiting for your response on Wedding With India.</p>
      <p>Log in to chat and stay connected with your travel hosts or partners.</p>
      <div style="margin: 25px 0; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/messages" style="background-color: #6b1026; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Open Inbox</a>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: `Unread Messages Reminder (${count})`, html });
}

export { resend };
