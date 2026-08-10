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
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #6b1026; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Welcome to Wedding With India, ${userName}</h2>
      <p style="line-height: 1.6; color: #44403c;">Thank you for joining our community of global guests and host families.</p>
      <p style="line-height: 1.6; color: #44403c;">Explore sacred cultural celebrations, discover regional customs, and connect directly with verified host families across Rajasthan, Goa, Kerala, and Punjab.</p>
      <div style="margin-top: 32px; text-align: center;">
        <a href="https://weddingwithindia.com/weddings" style="background-color: #6b1026; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Explore Celebrations</a>
      </div>
      <p style="margin-top: 32px; font-size: 13px; color: #78716c; border-top: 1px solid #f3f4f6; pt: 16px;">If you have any questions, reply directly to this email to reach our concierge liaison team.</p>
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
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #6b1026; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Booking Confirmed</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${guestName},</p>
      <p style="line-height: 1.6; color: #44403c;">Your honorary guest pass for <strong>${weddingTitle}</strong> has been successfully reserved.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 14px;">
        <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; font-weight: 600; color: #78716c;">Date:</td><td style="text-align: right; font-weight: 600;">${date}</td></tr>
        <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; font-weight: 600; color: #78716c;">Attendees:</td><td style="text-align: right; font-weight: 600;">${guestsCount} guest(s)</td></tr>
        <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; font-weight: 600; color: #78716c;">Total Paid:</td><td style="text-align: right; font-weight: 700; color: #6b1026;">$${totalAmount.toLocaleString()} USD</td></tr>
      </table>
      <p style="margin-top: 24px; line-height: 1.6; color: #44403c;">You can view your encrypted Guest Pass QR code and dress code guide inside your personal traveler dashboard.</p>
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
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #059669; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Invitation Request Approved</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${travelerName},</p>
      <p style="line-height: 1.6; color: #44403c;">We are honored to inform you that the host family has warmly accepted your request to attend <strong>${weddingTitle}</strong>.</p>
      <p style="line-height: 1.6; color: #44403c;">To finalize your reservation and secure your seat at the celebration, please complete your payment using the secure link below:</p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${paymentUrl}" style="background-color: #6b1026; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Confirm & Complete Reservation</a>
      </div>
      <p style="font-size: 13px; color: #78716c; line-height: 1.5;">This payment link remains reserved for 30 minutes before your slot is released back to our guest waitlist.</p>
      <p style="margin-top: 24px; color: #44403c;">Warm regards,<br/>The Host Family & Concierge Team</p>
    </div>
  `;
  return sendEmail({ to, subject: `Action Required: Confirm your spot for ${weddingTitle}`, html });
}

/**
 * 4. Host Slot Rejection Email Template
 */
export async function sendHostRejectionEmail(to: string, travelerName: string, weddingTitle: string) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #dc2626; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Invitation Request Update</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${travelerName},</p>
      <p style="line-height: 1.6; color: #44403c;">Thank you for your interest in joining <strong>${weddingTitle}</strong>.</p>
      <p style="line-height: 1.6; color: #44403c;">Unfortunately, due to capacity limits, the host family cannot accommodate your request for this specific ceremony. If any pre-authorization hold was placed on your card, it has been fully released.</p>
      <p style="line-height: 1.6; color: #44403c;">We invite you to explore other authentic heritage wedding celebrations on our portal.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Update: Invitation Request for ${weddingTitle}`, html });
}

/**
 * 5. Agent Referral Commission Alert Email Template
 */
export async function sendAgentReferralEmail(to: string, agentName: string, referredName: string, amount: number) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #6b1026; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Referral Credit Registered</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${agentName},</p>
      <p style="line-height: 1.6; color: #44403c;">Your referred client <strong>${referredName}</strong> has completed their reservation checkout.</p>
      <p style="line-height: 1.6; color: #44403c;">A referral credit of <strong>$${amount.toLocaleString()} USD</strong> has been logged to your agent account balance.</p>
      <p style="line-height: 1.6; color: #44403c;">Log in to your agent workspace dashboard to review your active referrals and payout history.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Referral Credit Registered: $${amount} USD`, html });
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
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #6b1026; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Payment Invoice</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${travelerName},</p>
      <p style="line-height: 1.6; color: #44403c;">Thank you for your payment. Below is your formal transaction receipt summary:</p>
      <div style="background-color: #fafaf9; border: 1px solid #f5f5f4; padding: 20px; border-radius: 12px; margin: 24px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: 600; color: #78716c;">Invoice ID:</td><td style="text-align: right; font-weight: 600;">${invoiceId}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 600; color: #78716c;">Wedding:</td><td style="text-align: right; font-weight: 600;">${weddingTitle}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 600; color: #78716c;">Date:</td><td style="text-align: right; font-weight: 600;">${date}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 600; color: #78716c;">Guests:</td><td style="text-align: right; font-weight: 600;">${guestsCount}</td></tr>
          <tr style="border-top: 1px solid #e7e5e4;"><td style="padding: 10px 0; font-weight: 700; font-size: 16px;">Total Paid:</td><td style="text-align: right; font-weight: 700; font-size: 16px; color: #6b1026;">$${amount.toLocaleString()} USD</td></tr>
        </table>
      </div>
      <p style="line-height: 1.6; color: #44403c;">You can view and download this invoice directly from your dashboard.</p>
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
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #dc2626; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Refund Confirmed</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${travelerName},</p>
      <p style="line-height: 1.6; color: #44403c;">This email confirms that a refund has been processed for your reservation at <strong>${weddingTitle}</strong>.</p>
      <div style="background-color: #fafaf9; border: 1px solid #f5f5f4; padding: 20px; border-radius: 12px; margin: 24px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: 600; color: #78716c;">Refund ID:</td><td style="text-align: right; font-weight: 600;">${refundId}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 600; color: #78716c;">Wedding:</td><td style="text-align: right; font-weight: 600;">${weddingTitle}</td></tr>
          <tr style="border-top: 1px solid #e7e5e4;"><td style="padding: 10px 0; font-weight: 700; font-size: 16px;">Amount Refunded:</td><td style="text-align: right; font-weight: 700; font-size: 16px; color: #dc2626;">$${amount.toLocaleString()} USD</td></tr>
        </table>
      </div>
      <p style="line-height: 1.6; color: #44403c;">The funds will be credited to your original payment card within 5 to 10 business days depending on your financial institution.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Refund Confirmed: ${weddingTitle}`, html });
}

/**
 * 8. Verification Submitted Email Template
 */
export async function sendVerificationSubmittedEmail(to: string, userName: string, role: string) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #6b1026; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Verification Documents Received</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${userName},</p>
      <p style="line-height: 1.6; color: #44403c;">Thank you for submitting your verification details for your <strong>${role.toUpperCase()}</strong> profile.</p>
      <p style="line-height: 1.6; color: #44403c;">Our Trust & Safety team is reviewing your documents to maintain our high safety standard. This review typically takes 24 to 48 hours.</p>
      <p style="line-height: 1.6; color: #44403c;">We will notify you immediately once your verification status is updated.</p>
    </div>
  `;
  return sendEmail({ to, subject: "Trust & Safety: Documents Under Review", html });
}

/**
 * 9. Verification Approved Email Template
 */
export async function sendVerificationApprovedEmail(to: string, userName: string, _role: string) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #059669; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Verification Approved</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${userName},</p>
      <p style="line-height: 1.6; color: #44403c;">Your identity and verification profile have been reviewed and successfully approved.</p>
      <p style="line-height: 1.6; color: #44403c;">A verified badge is now active on your profile card, granting you full access to all platform features.</p>
    </div>
  `;
  return sendEmail({ to, subject: "Trust & Safety: Verification Approved", html });
}

/**
 * 10. Verification Rejected Email Template
 */
export async function sendVerificationRejectedEmail(to: string, userName: string, reason: string) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #dc2626; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Verification Status Update</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${userName},</p>
      <p style="line-height: 1.6; color: #44403c;">We have reviewed your submitted verification documents, but we require additional clarity before approving your profile.</p>
      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 16px; border-radius: 8px; margin: 20px 0; color: #991b1b; font-size: 14px;">
        <strong>Details:</strong><br/>
        ${reason || "Uploaded documents were unclear or unreadable."}
      </div>
      <p style="line-height: 1.6; color: #44403c;">Please access your account settings to upload clear document copies for review.</p>
    </div>
  `;
  return sendEmail({ to, subject: "Action Required: Verification Update", html });
}

export async function sendNewMessageEmail(to: string, senderName: string, conversationTitle: string, messageText: string) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #6b1026; font-size: 22px; font-weight: 700; margin-bottom: 16px;">New Message</h2>
      <p style="line-height: 1.6; color: #44403c;">You received a message from <strong>${senderName}</strong> in <strong>${conversationTitle || "your conversation"}</strong>:</p>
      <div style="background-color: #fafaf9; border: 1px solid #f5f5f4; padding: 16px; border-radius: 8px; margin: 20px 0; font-style: italic; color: #44403c;">
        "${messageText}"
      </div>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://weddingwithindia.com"}/dashboard/messages" style="background-color: #6b1026; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reply in Dashboard</a>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: `New message from ${senderName}`, html });
}

export async function sendBookingUpdateEmail(to: string, userName: string, weddingTitle: string, status: string) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #6b1026; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Booking Status Update</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${userName},</p>
      <p style="line-height: 1.6; color: #44403c;">Your reservation status for <strong>${weddingTitle}</strong> has been updated to: <strong>${status.toUpperCase()}</strong>.</p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://weddingwithindia.com"}/dashboard/bookings" style="background-color: #6b1026; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">View Reservation</a>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: `Reservation Update: ${weddingTitle}`, html });
}

export async function sendPaymentReminderEmail(to: string, userName: string, weddingTitle: string, amount: number) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #6b1026; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Action Required: Complete Reservation</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${userName},</p>
      <p style="line-height: 1.6; color: #44403c;">This is a reminder to complete your reservation for <strong>${weddingTitle}</strong>.</p>
      <p style="line-height: 1.6; color: #44403c;">Amount pending: <strong>$${amount.toLocaleString()} USD</strong></p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://weddingwithindia.com"}/dashboard/bookings" style="background-color: #6b1026; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Complete Payment</a>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: `Reminder: Complete your reservation for ${weddingTitle}`, html });
}

export async function sendVerificationReminderEmail(to: string, userName: string, currentStatus: string) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #6b1026; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Trust Verification Reminder</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${userName},</p>
      <p style="line-height: 1.6; color: #44403c;">Your verification profile status is currently: <strong>${currentStatus.toUpperCase()}</strong>.</p>
      <p style="line-height: 1.6; color: #44403c;">Please upload clear document copies to unlock full platform access.</p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://weddingwithindia.com"}/dashboard/profile" style="background-color: #6b1026; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Complete Verification</a>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: "Trust & Safety: Complete Verification", html });
}

export async function sendUnreadConversationReminderEmail(to: string, userName: string, count: number) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1c1917; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #6b1026; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Unread Messages</h2>
      <p style="line-height: 1.6; color: #44403c;">Dear ${userName},</p>
      <p style="line-height: 1.6; color: #44403c;">You have <strong>${count} unread conversation(s)</strong> waiting for your reply on Wedding With India.</p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://weddingwithindia.com"}/dashboard/messages" style="background-color: #6b1026; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Open Inbox</a>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: `Unread Messages (${count})`, html });
}

export { resend };
