import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, VerificationStatus } from "@prisma/client";
import { adminReviewVerificationAction } from "@/lib/actions/admin";
import { FileText, User, Mail, ShieldCheck, Building, CreditCard, Globe } from "lucide-react";
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

  // Server Actions for Form submissions
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
    await adminReviewVerificationAction(vId, VerificationStatus.NEED_MORE_DOCUMENTS, notes || "Please provide clearer scans or missing credentials.");
    redirect("/dashboard/admin/verifications");
  }

  async function handleMarkUnderReview(formData: FormData) {
    "use server";
    const vId = formData.get("id") as string;
    const notes = formData.get("notes") as string;
    await adminReviewVerificationAction(vId, VerificationStatus.UNDER_REVIEW, notes || "Verification files are under manual audit.");
    redirect("/dashboard/admin/verifications");
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2">
          <ShieldCheck className="text-maroon-600 w-8 h-8" />
          Trust & Identity Verification Management
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Audit passports, government IDs, PAN/Aadhaar cards, travel insurance policies, venue confirmations, and business credentials across all platform roles.
        </p>
      </div>

      {/* Verification Queue List */}
      <div className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-warm-100 pb-4 gap-4">
          <h3 className="font-display font-bold text-lg text-charcoal-900">
            Verification Queue ({verifications.length})
          </h3>

          <div className="flex gap-2 text-xs font-semibold">
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl">
              Pending: {verifications.filter(v => v.status === "PENDING").length}
            </span>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl">
              Review: {verifications.filter(v => v.status === "UNDER_REVIEW").length}
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
              Approved: {verifications.filter(v => v.status === "APPROVED").length}
            </span>
          </div>
        </div>

        {verifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-400 font-semibold bg-warm-50/50 rounded-2xl border border-warm-150">
            No identity verification submissions logged in database.
          </div>
        ) : (
          <div className="space-y-6">
            {verifications.map((v) => {
              let badgeColor = "text-amber-600 bg-amber-50 border-amber-200";
              if (v.status === VerificationStatus.APPROVED) {
                badgeColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
              } else if (v.status === VerificationStatus.REJECTED) {
                badgeColor = "text-rose-600 bg-rose-50 border-rose-200";
              } else if (v.status === VerificationStatus.UNDER_REVIEW) {
                badgeColor = "text-purple-650 bg-purple-50 border-purple-200";
              } else if (v.status === VerificationStatus.NEED_MORE_DOCUMENTS) {
                badgeColor = "text-amber-700 bg-amber-100 border-amber-300";
              }

              return (
                <div key={v.id} className="border border-warm-200/80 rounded-3xl p-6 space-y-6 bg-white shadow-sm hover:border-warm-300 transition-colors">
                  
                  {/* User Profile Summary */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-4 border-b border-warm-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-base text-charcoal-950">
                          {v.user.name || v.user.email.split("@")[0]}
                        </h4>
                        <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-600 bg-warm-100 border border-warm-200 px-2 py-0.5 rounded-lg">
                          Role: {v.user.role}
                        </span>
                      </div>

                      <p className="text-xs text-charcoal-500 flex items-center gap-1.5 pt-0.5">
                        <Mail size={14} className="text-maroon-600 flex-shrink-0" />
                        {v.user.email}
                      </p>

                      {v.submissionDate && (
                        <p className="text-[0.6875rem] text-charcoal-400 font-medium pt-0.5">
                          Submitted on: {new Date(v.submissionDate).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 self-start sm:self-auto">
                      <span className={`inline-block text-[0.6875rem] font-bold uppercase tracking-wider px-3 py-1 rounded-xl border ${badgeColor}`}>
                        {v.status}
                      </span>
                      {v.reviewedBy && (
                        <span className="text-[0.625rem] text-charcoal-400 font-medium">
                          Audited by: {v.reviewedBy}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Role Specific Document Scans & Data Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    
                    {/* Left Column: Uploaded Documents */}
                    <div className="space-y-3">
                      <span className="text-[0.6875rem] font-bold text-charcoal-800 uppercase tracking-wider block">
                        Uploaded Document Scans & Files
                      </span>

                      <div className="flex gap-2 flex-wrap">
                        {v.passportUrl && (
                          <a
                            href={v.passportUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-700 bg-maroon-50 border border-maroon-200 px-3 py-1.5 rounded-xl hover:bg-maroon-100 transition-colors"
                          >
                            <FileText size={14} /> Passport Scan
                          </a>
                        )}

                        {v.govtIdUrl && (
                          <a
                            href={v.govtIdUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-700 bg-maroon-50 border border-maroon-200 px-3 py-1.5 rounded-xl hover:bg-maroon-100 transition-colors"
                          >
                            <FileText size={14} /> Govt ID Scan
                          </a>
                        )}

                        {v.selfieUrl && (
                          <a
                            href={v.selfieUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-700 bg-maroon-50 border border-maroon-200 px-3 py-1.5 rounded-xl hover:bg-maroon-100 transition-colors"
                          >
                            <User size={14} /> Live Selfie Photo
                          </a>
                        )}

                        {v.travelInsuranceUrl && (
                          <a
                            href={v.travelInsuranceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-700 bg-maroon-50 border border-maroon-200 px-3 py-1.5 rounded-xl hover:bg-maroon-100 transition-colors"
                          >
                            <Globe size={14} /> Travel Insurance Policy
                          </a>
                        )}

                        {v.panUrl && (
                          <a
                            href={v.panUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-700 bg-maroon-50 border border-maroon-200 px-3 py-1.5 rounded-xl hover:bg-maroon-100 transition-colors"
                          >
                            <CreditCard size={14} /> PAN Card Document
                          </a>
                        )}

                        {v.aadhaarUrl && (
                          <a
                            href={v.aadhaarUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-700 bg-maroon-50 border border-maroon-200 px-3 py-1.5 rounded-xl hover:bg-maroon-100 transition-colors"
                          >
                            <FileText size={14} /> Aadhaar Card
                          </a>
                        )}

                        {v.venueConfirmUrl && (
                          <a
                            href={v.venueConfirmUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-700 bg-maroon-50 border border-maroon-200 px-3 py-1.5 rounded-xl hover:bg-maroon-100 transition-colors"
                          >
                            <Building size={14} /> Venue Confirmation Receipt
                          </a>
                        )}

                        {v.weddingProofUrl || v.invitationUrl ? (
                          <a
                            href={v.weddingProofUrl || v.invitationUrl || ""}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-700 bg-maroon-50 border border-maroon-200 px-3 py-1.5 rounded-xl hover:bg-maroon-100 transition-colors"
                          >
                            <FileText size={14} /> Wedding Invitation
                          </a>
                        ) : null}

                        {v.businessRegUrl && (
                          <a
                            href={v.businessRegUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-700 bg-maroon-50 border border-maroon-200 px-3 py-1.5 rounded-xl hover:bg-maroon-100 transition-colors"
                          >
                            <Building size={14} /> Business Registration
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Structured Data Breakdown */}
                    <div className="space-y-2.5 bg-warm-50/60 p-4 rounded-2xl border border-warm-150">
                      <span className="text-[0.6875rem] font-bold text-charcoal-800 uppercase tracking-wider block border-b border-warm-200 pb-1">
                        Declared Verification Details
                      </span>

                      {v.nationality && (
                        <div><strong>Nationality:</strong> {v.nationality}</div>
                      )}
                      {v.visaStatus && (
                        <div><strong>Visa Status:</strong> {v.visaStatus}</div>
                      )}
                      {v.emergencyContact && (
                        <div><strong>Emergency Contact:</strong> {v.emergencyContact}</div>
                      )}
                      {v.panNumber && (
                        <div><strong>PAN Number:</strong> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-warm-200">{v.panNumber}</code></div>
                      )}
                      {v.aadhaarNumber && (
                        <div><strong>Aadhaar Number:</strong> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-warm-200">{v.aadhaarNumber}</code></div>
                      )}
                      {v.gstNumber && (
                        <div><strong>GST Number:</strong> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-warm-200">{v.gstNumber}</code></div>
                      )}
                      {v.bankName && (
                        <div><strong>Bank Details:</strong> {v.bankName} | A/C: {v.bankAccountNo} | IFSC: {v.bankIfsc}</div>
                      )}
                      {v.socialLinks && (
                        <div><strong>Social Links:</strong> {v.socialLinks}</div>
                      )}
                      {v.medicalDeclaration && (
                        <div><strong>Medical Declaration:</strong> &quot;{v.medicalDeclaration}&quot;</div>
                      )}
                      {v.references && (
                        <div><strong>References:</strong> &quot;{v.references}&quot;</div>
                      )}
                    </div>
                  </div>

                  {/* Audit Decision Section */}
                  <div className="pt-4 border-t border-warm-150 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[0.6875rem] font-bold text-charcoal-800 uppercase tracking-wider">
                        Admin Audit Assessment & Action
                      </span>
                      {v.notes && (
                        <span className="text-xs text-charcoal-500 italic">
                          Last Note: &quot;{v.notes}&quot;
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          name="notes"
                          id={`notes-${v.id}`}
                          defaultValue={v.notes || ""}
                          placeholder="Provide audit assessment notes or reason for document request..."
                          className="input-luxury text-xs py-2 h-10 w-full bg-white"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end">
                        {/* Under Review */}
                        <form
                          action={handleMarkUnderReview}
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
                            className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 font-bold uppercase tracking-wider text-[0.625rem] cursor-pointer transition-colors"
                          >
                            Under Review
                          </button>
                        </form>

                        {/* Request Info / Need More Docs */}
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
                            className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white border border-amber-200 font-bold uppercase tracking-wider text-[0.625rem] cursor-pointer transition-colors"
                          >
                            Need More Docs
                          </button>
                        </form>

                        {/* Reject */}
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
                            className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 font-bold uppercase tracking-wider text-[0.625rem] cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                        </form>

                        {/* Approve */}
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
                            className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 font-bold uppercase tracking-wider text-[0.625rem] cursor-pointer transition-colors"
                          >
                            Approve Profile
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
