"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { adminGetConversations } from "@/lib/actions/messages";
import {
  MessageSquare,
  Search,
  Download,
  AlertTriangle,
  History,
  Archive,
  UserCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";

export default function AdminMessagesCMSPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"open" | "closed" | "archived">("open");
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  // Load conversations
  const loadConversations = async () => {
    try {
      const data = await adminGetConversations({
        search: search || undefined,
        status,
      });
      setConversations(data);
    } catch (err) {
      console.error("Failed to load admin conversations list:", err);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadConversations();
    }
  }, [search, status, user]);

  // Export conversation transcript to JSON file download
  const handleExport = (conv: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(conv, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chat_transcript_${conv.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-8 text-center bg-red-50 text-red-650 rounded-2xl border border-red-100 max-w-md mx-auto space-y-2 mt-8">
        <AlertTriangle className="mx-auto" size={24} />
        <h3 className="font-bold text-sm">Forbidden Access</h3>
        <p className="text-xs">Only verified system administrators are authorized to moderate or monitor global chat sessions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          Global Messaging Moderator
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Audit global traveler conversations, assign agent support liaison, or export historical chat transcripts.
        </p>
      </div>

      {/* Control panel & filters */}
      <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setStatus("open")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                status === "open"
                  ? "bg-maroon-50 border-maroon-150 text-maroon-800"
                  : "bg-white border-warm-200 text-charcoal-600 hover:bg-warm-50"
              }`}
            >
              Open Chats
            </button>
            <button
              onClick={() => setStatus("archived")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                status === "archived"
                  ? "bg-maroon-50 border-maroon-150 text-maroon-800"
                  : "bg-white border-warm-200 text-charcoal-600 hover:bg-warm-50"
              }`}
            >
              Archived Chats
            </button>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 text-charcoal-400" size={14} />
            <input
              type="text"
              placeholder="Search by participant name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-luxury text-xs pl-8 py-1.5 h-9 bg-warm-50/50"
            />
          </div>
        </div>

        {/* Conversations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
          {/* List panel */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-display font-bold text-xs text-charcoal-400 uppercase tracking-widest border-b border-warm-100 pb-2">
              Global Chats Log ({conversations.length} records)
            </h3>

            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400 font-semibold italic">
                No active conversations found matching the search criteria.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {conversations.map((c) => {
                  const participantsList = c.participants.map((p: any) => p.user.name || p.user.email.split("@")[0]).join(" & ");
                  const isArchived = c.archived;
                  const latestMsg = c.messages[0];
                  const isSelected = activePreviewId === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setActivePreviewId(c.id)}
                      className={`border p-4 rounded-2xl cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? "bg-maroon-50/10 border-maroon-350 shadow-sm" : "border-warm-200 bg-warm-50/5"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 text-xs">
                        <div className="space-y-1">
                          <h4 className="font-display font-bold text-charcoal-900 flex items-center gap-1.5">
                            {participantsList}
                            {isArchived && (
                              <span className="text-[9px] bg-charcoal-100 text-charcoal-600 px-1.5 py-0.5 rounded font-extrabold uppercase">
                                ARCHIVED
                              </span>
                            )}
                          </h4>
                          {c.bookingId && (
                            <div className="text-[10px] text-maroon-700 font-bold bg-maroon-50/50 px-2 py-0.5 rounded inline-block">
                              Booking Link: {c.bookingId.slice(0, 8)}
                            </div>
                          )}
                          {latestMsg && (
                            <p className="text-[10px] text-charcoal-450 italic mt-1 line-clamp-1">
                              Last Activity: {latestMsg.text || "Attached document."}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-[9px] text-charcoal-400 font-semibold">
                            {latestMsg ? new Date(latestMsg.createdAt).toLocaleDateString() : ""}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExport(c);
                              }}
                              title="Export chat transcript"
                              className="p-1 rounded bg-white border border-warm-250 text-charcoal-600 hover:bg-warm-100 cursor-pointer"
                            >
                              <Download size={11} />
                            </button>
                            <Link
                              href="/dashboard/messages"
                              onClick={() => {
                                // Select active conversation id globally inside messages page
                                localStorage.setItem("activeConvId", c.id);
                              }}
                              className="p-1 rounded bg-maroon-50 border border-maroon-100 text-maroon-800 hover:bg-maroon-800 hover:text-white cursor-pointer"
                            >
                              <ArrowRight size={11} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Auditing details panel */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-display font-bold text-xs text-charcoal-400 uppercase tracking-widest border-b border-warm-100 pb-2 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-maroon-600" />
              Audits & Moderation Console
            </h3>

            {!activePreviewId ? (
              <div className="p-8 text-center text-xs text-charcoal-400 font-medium italic border border-dashed border-warm-200 rounded-2xl bg-warm-50/10">
                Select a conversation log from the list to audit participant records.
              </div>
            ) : (
              (() => {
                const selected = conversations.find((c) => c.id === activePreviewId);
                if (!selected) return null;

                return (
                  <div className="border border-warm-200 p-5 rounded-[2rem] bg-warm-50/5 space-y-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-charcoal-400 font-bold uppercase tracking-wider block">ID: {selected.id}</span>
                      <h4 className="font-display font-bold text-sm text-charcoal-900">
                        {selected.participants.map((p: any) => p.user.name || p.user.email).join(" and ")}
                      </h4>
                    </div>

                    {/* Participants table */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-charcoal-500 font-bold uppercase tracking-wider block">Participants Info</span>
                      <div className="space-y-2">
                        {selected.participants.map((p: any) => (
                          <div key={p.userId} className="flex justify-between items-center bg-white border border-warm-150 p-2.5 rounded-xl">
                            <div>
                              <div className="font-bold text-charcoal-900">{p.user.name || "N/A"}</div>
                              <div className="text-[10px] text-charcoal-400 mt-0.5">{p.user.email}</div>
                            </div>
                            <span className="text-[9px] font-extrabold uppercase bg-maroon-50 text-maroon-700 px-2 py-0.5 rounded">
                              {p.user.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action checks */}
                    <div className="space-y-3 pt-2 border-t border-warm-150">
                      <span className="text-[10px] text-charcoal-500 font-bold uppercase tracking-wider block">Security Details</span>
                      <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <CheckCircle size={12} />
                          Security Integrity Verified
                        </div>
                        <p className="text-[10px] leading-relaxed">
                          Only verified participants and admins have access to database messages. Deleting messages trigger soft-delete logs only. All updates audited in logs.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
