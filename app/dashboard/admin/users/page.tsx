import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, VerificationStatus } from "@prisma/client";
import { adminUpdateUserRoleAction, adminDeleteUserAction, adminRequestVerificationAction } from "@/lib/actions/admin";
import { User, Shield, Briefcase, Heart, Trash2, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // 1. Authorize Admin
  const admin = await requireRole([UserRole.ADMIN]);

  // 2. Fetch all users with verification status
  const users = await prisma.user.findMany({
    include: {
      travelerProfile: true,
      coupleProfile: true,
      agentProfile: true,
      verification: { select: { id: true, status: true, submissionDate: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. Server Actions for form submissions inside component
  async function handleRoleChange(formData: FormData) {
    "use server";
    const uId = formData.get("id") as string;
    const role = formData.get("role") as UserRole;
    await adminUpdateUserRoleAction(uId, role);
    redirect("/dashboard/admin/users");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const uId = formData.get("id") as string;
    await adminDeleteUserAction(uId);
    redirect("/dashboard/admin/users");
  }

  async function handleRequestVerification(formData: FormData) {
    "use server";
    const uId = formData.get("userId") as string;
    const requiredDocs = formData.get("requiredDocs") as string;
    await adminRequestVerificationAction(uId, requiredDocs || "Government ID + Selfie");
    redirect("/dashboard/admin/users");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          User Account Directory
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Overview and configuration of global travelers, couples, local agents, and system admins.
        </p>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3">
          Global Directory ({users.length} Users)
        </h3>

        {users.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
            No registered users in the database yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-warm-200 text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-widest bg-warm-50">
                  <th className="p-3 pl-4 rounded-tl-xl">Avatar & Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Profile Info</th>
                  <th className="p-3">Current Role</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3 text-right pr-4 rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 text-xs text-charcoal-600">
                {users.map((u) => {
                  let roleIcon = User;
                  let roleColor = "text-sky-600 bg-sky-50";
                  if (u.role === UserRole.COUPLE) {
                    roleIcon = Heart;
                    roleColor = "text-rose-600 bg-rose-50";
                  } else if (u.role === UserRole.AGENT) {
                    roleIcon = Briefcase;
                    roleColor = "text-emerald-600 bg-emerald-50";
                  } else if (u.role === UserRole.ADMIN) {
                    roleIcon = Shield;
                    roleColor = "text-purple-650 bg-purple-50 border border-purple-100";
                  }
                  const Icon = roleIcon;

                  // Resolve profile summary
                  let profileSummary = "N/A";
                  if (u.role === UserRole.TRAVELER && u.travelerProfile) {
                    profileSummary = `${u.travelerProfile.fullName} (${u.travelerProfile.country})`;
                  } else if (u.role === UserRole.COUPLE && u.coupleProfile) {
                    profileSummary = `Hosts (Guests: ${u.coupleProfile.expectedGuests})`;
                  } else if (u.role === UserRole.AGENT && u.agentProfile) {
                    profileSummary = `${u.agentProfile.organization} (${u.agentProfile.country})`;
                  }

                  const isSelf = u.id === admin.id;

                  return (
                    <tr key={u.id} className="hover:bg-warm-50/20">
                      {/* Avatar & Name */}
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-warm-200 flex-shrink-0 relative">
                            <Image
                               fill
                               src={u.avatar || "https://i.pravatar.cc/80?img=5"}
                               alt={u.name || "Avatar"}
                               className="object-cover"
                               unoptimized
                             />
                          </div>
                          <div className="font-semibold text-charcoal-850">
                            {u.name || "N/A"}
                            {isSelf && <span className="text-[0.625rem] text-purple-600 bg-purple-50 px-1 py-0.5 rounded ml-2 font-bold uppercase">You</span>}
                          </div>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td className="p-3 font-medium text-charcoal-500">{u.email}</td>

                      {/* Profile Info */}
                      <td className="p-3 text-charcoal-500 font-medium">{profileSummary}</td>

                      {/* Current Role */}
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-[0.6875rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${roleColor}`}>
                          <Icon size={11} />
                          {u.role}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="p-3">
                        {u.verification ? (
                          <div className="space-y-1.5">
                            <span className={`inline-flex items-center gap-1 text-[0.6875rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                              u.verification.status === VerificationStatus.APPROVED ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                              u.verification.status === VerificationStatus.REJECTED ? 'text-rose-700 bg-rose-50 border-rose-200' :
                              u.verification.status === VerificationStatus.PENDING ? 'text-amber-700 bg-amber-50 border-amber-200' :
                              u.verification.status === VerificationStatus.UNDER_REVIEW ? 'text-purple-700 bg-purple-50 border-purple-200' :
                              u.verification.status === VerificationStatus.NEED_MORE_DOCUMENTS ? 'text-orange-700 bg-orange-50 border-orange-200' :
                              'text-charcoal-500 bg-charcoal-50 border-charcoal-200'
                            }`}>
                              <ShieldCheck size={10} />
                              {u.verification.status.replace(/_/g, ' ')}
                            </span>
                            {/* Request Verification button for NOT_SUBMITTED or NEED_MORE_DOCS */}
                            {(u.verification.status === VerificationStatus.NOT_SUBMITTED ||
                              u.verification.status === VerificationStatus.NEED_MORE_DOCUMENTS) && !isSelf && (
                              <form action={handleRequestVerification} className="flex gap-1">
                                <input type="hidden" name="userId" value={u.id} />
                                <input
                                  type="text"
                                  name="requiredDocs"
                                  defaultValue={u.role === 'TRAVELER' ? 'Passport + Government ID' : u.role === 'COUPLE' ? 'Wedding Invitation + Venue Confirmation' : 'Business Registration + LinkedIn'}
                                  className="input-luxury text-[0.625rem] h-6 py-0 px-2 bg-white rounded-md border border-warm-200 w-28"
                                  placeholder="Required docs..."
                                />
                                <button type="submit" className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-600 hover:text-white text-[0.5625rem] font-bold uppercase tracking-wider cursor-pointer transition-colors whitespace-nowrap">
                                  Request
                                </button>
                              </form>
                            )}
                          </div>
                        ) : (
                          !isSelf && (
                            <form action={handleRequestVerification} className="flex gap-1 items-center">
                              <input type="hidden" name="userId" value={u.id} />
                              <input
                                type="text"
                                name="requiredDocs"
                                defaultValue={u.role === 'TRAVELER' ? 'Passport + Government ID' : u.role === 'COUPLE' ? 'Wedding Invitation + Venue Confirmation' : 'Business Registration + LinkedIn'}
                                className="input-luxury text-[0.625rem] h-6 py-0 px-2 bg-white rounded-md border border-warm-200 w-28"
                                placeholder="Required docs..."
                              />
                              <button type="submit" className="px-2 py-0.5 rounded-md bg-maroon-50 text-maroon-700 border border-maroon-200 hover:bg-maroon-600 hover:text-white text-[0.5625rem] font-bold uppercase tracking-wider cursor-pointer transition-colors whitespace-nowrap">
                                Request Verification
                              </button>
                            </form>
                          )
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right pr-4">
                        <div className="flex gap-2 justify-end items-center">
                          {/* Role Change Form */}
                          {!isSelf && (
                            <form action={handleRoleChange} className="flex gap-1 items-center">
                              <input type="hidden" name="id" value={u.id} />
                              <select
                                name="role"
                                defaultValue={u.role}
                                className="input-luxury text-[0.6875rem] h-8 py-0.5 px-2 bg-white rounded-lg border border-warm-200 select-reset text-charcoal-700 cursor-pointer focus:ring-[1px] focus:ring-maroon-300"
                              >
                                <option value="TRAVELER">Traveler</option>
                                <option value="COUPLE">Couple</option>
                                <option value="AGENT">Agent</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                              <button
                                type="submit"
                                title="Update Role"
                                className="p-1 rounded-lg border border-warm-200 text-charcoal-600 hover:bg-warm-50 text-[0.6875rem] font-bold cursor-pointer px-2 h-8"
                              >
                                Save
                              </button>
                            </form>
                          )}

                          {/* Delete Form */}
                          {!isSelf && (
                            <form action={handleDelete}>
                              <input type="hidden" name="id" value={u.id} />
                              <button
                                type="submit"
                                title="Delete Account"
                                className="p-1.5 rounded-lg border border-rose-100 bg-rose-50 text-rose-650 hover:bg-rose-500 hover:text-white cursor-pointer h-8 flex items-center justify-center"
                              >
                                <Trash2 size={13} />
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
