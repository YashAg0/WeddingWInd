import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, VerificationStatus } from "@prisma/client";
import { adminReviewVerificationAction } from "@/lib/actions/admin";
import { Check, X, FileText, User, Mail, ShieldAlert, Award } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage() {
  // 1. Authorize Admin
  await requireRole([UserRole.ADMIN]);

  // 2. Fetch all verifications
  const verifications = await prisma.verification.findMany({
    include: { user: true },
    orderBy: { submissionDate: "desc" },
  });

  // 3. Define Server Actions for Form submissions
  async function handleApprove(formData: FormData) {
    "use server";
    const vId = formData.get("id") as string;
    const notes = formData.get("notes") as string;
    await adminReviewVerificationAction(vId, VerificationStatus.APPROVED, notes || "Audited and verified successfully.");
    redirect("/dashboard/admin/verifications");
  }

  async function handleReject(formData: FormData) {
    "use server";
    const vId = formData.get("id") as string;
    const notes = formData.get("notes") as string;
    await adminReviewVerificationAction(vId, VerificationStatus.REJECTED, notes || "Uploaded documents are blurred or invalid.");
    redirect("/dashboard/admin/verifications");
  }

  async function handleRequestMoreDocs(formData: FormData) {
    "use server";
    const vId = formData.get("id") as string;
    const notes = formData.get("notes") as string;
    await adminReviewVerificationAction(vId, VerificationStatus.UNDER_REVIEW, notes || "Please provide clearer scans or additional credentials.");
    redirect("/dashboard/admin/verifications");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          Identity Verification Audits
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Audit uploaded passports, government IDs, and other host certifications.
        </p>
      </div>

      {/* Grid of Verifications */}
      <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3">
          Pending & Historical Audits ({verifications.length})
        </h3>

        {verifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
            No identity verification submissions logged.
          </div>
        ) : (
          <div className="space-y-6">
            {verifications.map((v) => {
              let badgeColor = "text-amber-600 bg-amber-50 border-amber-100";
              if (v.status === VerificationStatus.APPROVED) {
                badgeColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
              } else if (v.status === VerificationStatus.REJECTED) {
                badgeColor = "text-rose-600 bg-rose-50 border-rose-100";
              } else if (v.status === VerificationStatus.UNDER_REVIEW) {
                badgeColor = "text-purple-650 bg-purple-50 border-purple-100";
              }

              return (
                <div key={v.id} className="border border-warm-200 rounded-2xl p-5 sm:p-6 space-y-4 bg-warm-50/10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-sm text-charcoal-950 flex items-center gap-2">
                        {v.user.name || v.user.email.split("@")[0]}
                        <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 border border-warm-200 px-1.5 py-0.5 rounded">
                          {v.user.role}
                        </span>
                      </h4>
                      <p className="text-[0.6875rem] text-charcoal-400 flex items-center gap-1">
                        <Mail size={12} className="text-maroon-600" />
                        {v.user.email}
                      </p>
                      {v.submissionDate && (
                        <p className="text-[0.625rem] text-charcoal-400 font-medium">
                          Submitted on: {new Date(v.submissionDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className={`inline-block text-[0.625rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${badgeColor} self-start`}>
                      {v.status}
                    </span>
                  </div>

                  {/* Document URLs */}
                  <div className="space-y-2">
                    <span className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">Uploaded Documents</span>
                    <div className="flex gap-2 flex-wrap">
                      {v.passportUrl && (
                        <a
                          href={v.passportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-600 bg-maroon-50 border border-maroon-100/50 px-3 py-1 rounded-xl hover:bg-maroon-100 hover:underline transition-colors"
                        >
                          <FileText size={12} />
                          Passport Scan
                        </a>
                      )}
                      {v.govtIdUrl && (
                        <a
                          href={v.govtIdUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-600 bg-maroon-50 border border-maroon-100/50 px-3 py-1 rounded-xl hover:bg-maroon-100 hover:underline transition-colors"
                        >
                          <FileText size={12} />
                          Govt ID Scan
                        </a>
                      )}
                      {v.selfieUrl && (
                        <a
                          href={v.selfieUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-600 bg-maroon-50 border border-maroon-100/50 px-3 py-1 rounded-xl hover:bg-maroon-100 hover:underline transition-colors"
                        >
                          <User size={12} />
                          Selfie Photo
                        </a>
                      )}
                      {v.invitationUrl && (
                        <a
                          href={v.invitationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-600 bg-maroon-50 border border-maroon-100/50 px-3 py-1 rounded-xl hover:bg-maroon-100 hover:underline transition-colors"
                        >
                          <FileText size={12} />
                          Wedding Invite
                        </a>
                      )}
                      {v.venueConfirmUrl && (
                        <a
                          href={v.venueConfirmUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-600 bg-maroon-50 border border-maroon-100/50 px-3 py-1 rounded-xl hover:bg-maroon-100 hover:underline transition-colors"
                        >
                          <FileText size={12} />
                          Venue Booking Confirmation
                        </a>
                      )}
                      {v.businessRegUrl && (
                        <a
                          href={v.businessRegUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-600 bg-maroon-50 border border-maroon-100/50 px-3 py-1 rounded-xl hover:bg-maroon-100 hover:underline transition-colors"
                        >
                          <FileText size={12} />
                          Business Registration
                        </a>
                      )}
                    </div>
                  </div>

                  {v.orgDetails && (
                    <div className="p-3 bg-warm-50 rounded-xl text-charcoal-600 text-xs leading-relaxed italic border border-warm-150">
                      <strong>Organization Details:</strong> &quot;{v.orgDetails}&quot;
                    </div>
                  )}

                  {/* Audit Decision Forms */}
                  {v.status === VerificationStatus.PENDING || v.status === VerificationStatus.UNDER_REVIEW ? (
                    <div className="pt-3 border-t border-warm-150 space-y-3">
                      <div className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider">Audit Decision</div>
                      <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center justify-between">
                        <div className="w-full sm:max-w-md">
                          <input
                            type="text"
                            name="notes"
                            id={`notes-${v.id}`}
                            placeholder="Add audit assessment or document request comments..."
                            className="input-luxury text-xs py-1 h-9 w-full bg-white"
                          />
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                          <form
                            action={handleRequestMoreDocs}
                            onSubmit={(e) => {
                              const input = document.getElementById(`notes-${v.id}`) as HTMLInputElement;
                              const hidden = e.currentTarget.querySelector("input[name='notes']") as HTMLInputElement;
                              hidden.value = input?.value || "";
                            }}
                          >
                            <input type="hidden" name="id" value={v.id} />
                            <input type="hidden" name="notes" value="" />
                            <button
                              type="submit"
                              className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-650 hover:bg-purple-600 hover:text-white border border-purple-100 font-bold uppercase tracking-wider text-[0.625rem] cursor-pointer"
                            >
                              Request Info
                            </button>
                          </form>

                          <form
                            action={handleReject}
                            onSubmit={(e) => {
                              const input = document.getElementById(`notes-${v.id}`) as HTMLInputElement;
                              const hidden = e.currentTarget.querySelector("input[name='notes']") as HTMLInputElement;
                              hidden.value = input?.value || "";
                            }}
                          >
                            <input type="hidden" name="id" value={v.id} />
                            <input type="hidden" name="notes" value="" />
                            <button
                              type="submit"
                              className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-650 hover:bg-rose-600 hover:text-white border border-rose-100 font-bold uppercase tracking-wider text-[0.625rem] cursor-pointer"
                            >
                              Reject
                            </button>
                          </form>

                          <form
                            action={handleApprove}
                            onSubmit={(e) => {
                              const input = document.getElementById(`notes-${v.id}`) as HTMLInputElement;
                              const hidden = e.currentTarget.querySelector("input[name='notes']") as HTMLInputElement;
                              hidden.value = input?.value || "";
                            }}
                          >
                            <input type="hidden" name="id" value={v.id} />
                            <input type="hidden" name="notes" value="" />
                            <button
                              type="submit"
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100 font-bold uppercase tracking-wider text-[0.625rem] cursor-pointer"
                            >
                              Approve
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ) : (
                    v.notes && (
                      <div className="pt-2 text-xs text-charcoal-400 font-medium">
                        <strong>Audit Review Notes:</strong> &quot;{v.notes}&quot; (by {v.reviewedBy || "System Admin"})
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
