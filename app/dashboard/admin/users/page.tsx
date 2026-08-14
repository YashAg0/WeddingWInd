"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  User,
  Shield,
  Trash2,
  ShieldCheck,
  Search,
  UserPlus,
  Eye,
  RefreshCw,
  X,
  Mail
} from "lucide-react";
import {
  adminGetUsersAction,
  adminUpdateUserRoleAction,
  adminUpdateUserStatusAction,
  adminInviteUserAction,
  adminDeleteUserAction,
  adminRequestVerificationAction
} from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  
  // Modals & Action States
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("ADMIN");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);

  const [inspectUser, setInspectUser] = useState<any>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminGetUsersAction();
      setUsers(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load user directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleUpdate = async (userId: string, role: any) => {
    setProcessingId(userId);
    try {
      const res = await adminUpdateUserRoleAction(userId, role);
      if (res?.success) {
        toast.success(`User role updated to ${role}`);
        await loadUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Role update failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusUpdate = async (userId: string, status: any) => {
    setProcessingId(userId);
    try {
      const res = await adminUpdateUserStatusAction(userId, status, `Admin updated status to ${status}`);
      if (res?.success) {
        toast.success(`User status updated to ${status}`);
        await loadUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Status update failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user account?")) return;
    setProcessingId(userId);
    try {
      const res = await adminDeleteUserAction(userId);
      if (res?.success) {
        toast.success("User account deleted.");
        await loadUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Deletion failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await adminInviteUserAction(inviteEmail, inviteRole as any, inviteName);
      if (res?.success) {
        toast.success(`Invitation created for ${inviteEmail} with role ${inviteRole}!`);
        setInviteModalOpen(false);
        setInviteEmail("");
        setInviteName("");
        await loadUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Invitation failed.");
    } finally {
      setInviting(false);
    }
  };

  const handleRequestVerification = async (userId: string, defaultDocs: string) => {
    const requiredDocs = prompt("Enter required verification documents:", defaultDocs);
    if (!requiredDocs) return;
    setProcessingId(userId);
    try {
      const res = await adminRequestVerificationAction(userId, requiredDocs);
      if (res?.success) {
        toast.success("Verification request sent to user.");
        await loadUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Request failed.");
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const name = u.name || "";
    const email = u.email || "";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedRoleFilter === "ALL") return true;
    if (selectedRoleFilter === "ADMINS") return u.role === "ADMIN";
    if (selectedRoleFilter === "TRAVELERS") return u.role === "TRAVELER";
    if (selectedRoleFilter === "COUPLES") return u.role === "COUPLE";
    if (selectedRoleFilter === "AGENTS") return u.role === "AGENT";
    if (selectedRoleFilter === "SUSPENDED") return u.status === "SUSPENDED" || u.status === "BANNED";

    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-maroon-100/50 mb-2">
            <User size={13} />
            User & Admin Directory
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Account & Security Control Center
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm mt-1">
            Manage global travelers, couples, local referral agents, and authorized system administrators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setInviteModalOpen(true)}
            className="btn btn-primary text-xs font-bold py-2.5 px-4 flex items-center gap-2"
          >
            <UserPlus size={15} />
            Invite Administrator / User
          </button>

          <button
            onClick={loadUsers}
            disabled={loading}
            className="btn btn-secondary text-xs font-bold py-2.5 px-4 flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-warm-200/60 p-4 sm:p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search by user name, email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-luxury pl-10 w-full text-xs sm:text-sm bg-warm-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none text-xs font-bold">
          {["ALL", "ADMINS", "TRAVELERS", "COUPLES", "AGENTS", "SUSPENDED"].map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setSelectedRoleFilter(tabKey)}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                selectedRoleFilter === tabKey
                  ? "bg-maroon-800 text-white shadow-sm"
                  : "bg-warm-100/70 text-charcoal-600 hover:bg-warm-200/60"
              }`}
            >
              {tabKey === "ALL" ? "All Accounts" : tabKey}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white border border-warm-200/60 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <RefreshCw size={28} className="animate-spin text-[var(--color-brand-primary)] mx-auto" />
          <p className="text-xs font-bold text-charcoal-500">Loading user directory from database...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-warm-200/60 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <User size={36} className="text-charcoal-300 mx-auto" />
          <h3 className="font-display font-bold text-lg text-charcoal-900">No Matching Users Found</h3>
          <p className="text-xs text-charcoal-500">No accounts matched your search or role criteria.</p>
        </div>
      ) : (
        <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-warm-50/80 border-b border-warm-200 text-charcoal-500 font-bold uppercase tracking-wider text-[0.6875rem]">
                  <th className="py-4 px-6">User & Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Verification</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 font-medium text-charcoal-700">
                {filteredUsers.map((u) => {
                  const isFounder = u.email === "founder@weddingwithindia.com";
                  const verStatus = u.verification?.status || "NOT_SUBMITTED";

                  return (
                    <tr key={u.id} className="hover:bg-warm-50/40 transition-colors">
                      {/* Avatar & Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-warm-200 flex-shrink-0 relative">
                            <Image
                              src={u.avatar || "https://i.pravatar.cc/80?img=5"}
                              alt={u.name || "User Avatar"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
                              {u.name || "N/A"}
                              {isFounder && (
                                <span className="bg-amber-100 text-amber-800 text-[0.5625rem] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-200">
                                  System Owner
                                </span>
                              )}
                            </div>
                            <span className="text-charcoal-500 text-[0.6875rem] font-mono block">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Selector */}
                      <td className="py-4 px-6">
                        {isFounder ? (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-bold text-[0.625rem] uppercase">
                            <Shield size={11} /> ADMIN
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            disabled={processingId === u.id}
                            onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                            className="input-luxury text-xs py-1 px-2.5 bg-warm-50/50 border border-warm-200 rounded-xl font-bold cursor-pointer"
                          >
                            <option value="TRAVELER">TRAVELER</option>
                            <option value="COUPLE">COUPLE</option>
                            <option value="AGENT">AGENT</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-6">
                        {isFounder ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[0.625rem] uppercase">
                            ACTIVE
                          </span>
                        ) : (
                          <select
                            value={u.status}
                            disabled={processingId === u.id}
                            onChange={(e) => handleStatusUpdate(u.id, e.target.value)}
                            className={`input-luxury text-xs py-1 px-2 rounded-xl font-bold cursor-pointer ${
                              u.status === "ACTIVE"
                                ? "text-emerald-700 bg-emerald-50/60"
                                : u.status === "SUSPENDED" || u.status === "BANNED"
                                ? "text-red-700 bg-red-50/60"
                                : "text-amber-700 bg-amber-50/60"
                            }`}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="ONBOARDING">ONBOARDING</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                            <option value="BANNED">BANNED</option>
                          </select>
                        )}
                      </td>

                      {/* Verification Status */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.625rem] font-bold uppercase tracking-wider ${
                              verStatus === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : verStatus === "REJECTED"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            <ShieldCheck size={11} />
                            {verStatus.replace(/_/g, " ")}
                          </span>

                          {(verStatus === "NOT_SUBMITTED" || verStatus === "NEED_MORE_DOCUMENTS") && !isFounder && (
                            <button
                              onClick={() => handleRequestVerification(u.id, "Passport + Government ID")}
                              disabled={processingId === u.id}
                              className="text-[0.625rem] font-bold uppercase text-sky-700 hover:underline"
                            >
                              Request
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-charcoal-500 text-[0.6875rem]">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectUser(u)}
                            className="btn btn-secondary text-[0.6875rem] font-bold py-1.5 px-3 flex items-center gap-1"
                          >
                            <Eye size={13} />
                            Inspect
                          </button>

                          {!isFounder && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={processingId === u.id}
                              className="p-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-xl border border-red-200 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-warm-200 rounded-3xl shadow-luxury max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-warm-100 pb-3">
              <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <UserPlus size={18} className="text-[var(--color-brand-primary)]" />
                Invite / Pre-Provision Account
              </h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-charcoal-400 hover:text-charcoal-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteAdmin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-charcoal-700 block">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Sharma"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="input-luxury w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-700 block">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@weddingwithindia.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input-luxury w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-700 block">Assigned Platform Role *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="input-luxury w-full text-xs font-bold"
                >
                  <option value="ADMIN">ADMIN — Full Operational Access</option>
                  <option value="AGENT">AGENT — Referral Partner</option>
                  <option value="COUPLE">COUPLE — Host Account</option>
                  <option value="TRAVELER">TRAVELER — Guest Account</option>
                </select>
              </div>

              <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200 text-[0.6875rem] text-charcoal-600 leading-relaxed">
                Pre-provisioning registers this email in PostgreSQL. When the user completes Clerk sign-up, the system automatically links their authentication and grants their assigned role.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="btn btn-secondary text-xs py-2.5 px-4 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="btn btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2"
                >
                  <Mail size={14} />
                  {inviting ? "Provisioning..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Inspect Modal */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-warm-200 rounded-3xl shadow-luxury max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-warm-100 pb-3">
              <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <User size={18} className="text-maroon-700" />
                User Profile Inspection
              </h3>
              <button onClick={() => setInspectUser(null)} className="text-charcoal-400 hover:text-charcoal-800">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4 bg-warm-50/60 p-4 rounded-2xl border border-warm-200/60">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-warm-200 flex-shrink-0 relative">
                  <Image
                    src={inspectUser.avatar || "https://i.pravatar.cc/80?img=5"}
                    alt={inspectUser.name || "Avatar"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-base text-charcoal-900">{inspectUser.name || "N/A"}</h4>
                  <span className="text-charcoal-500 font-mono block">{inspectUser.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-warm-50 p-3 rounded-xl border border-warm-200/50">
                  <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block">User ID</span>
                  <span className="font-mono text-charcoal-800 truncate block">{inspectUser.id}</span>
                </div>

                <div className="bg-warm-50 p-3 rounded-xl border border-warm-200/50">
                  <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block">Role & Status</span>
                  <span className="font-bold text-charcoal-800 block uppercase">
                    {inspectUser.role} · {inspectUser.status}
                  </span>
                </div>

                <div className="bg-warm-50 p-3 rounded-xl border border-warm-200/50">
                  <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block">Verification</span>
                  <span className="font-bold text-emerald-700 block uppercase">
                    {inspectUser.verification?.status || "NOT_SUBMITTED"}
                  </span>
                </div>

                <div className="bg-warm-50 p-3 rounded-xl border border-warm-200/50">
                  <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block">Registered Date</span>
                  <span className="font-semibold text-charcoal-800 block">
                    {formatDate(inspectUser.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectUser(null)}
                className="btn btn-secondary text-xs py-2 px-5 font-bold"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
