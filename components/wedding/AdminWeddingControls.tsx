"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Trash2, Edit2, AlertTriangle, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { adminDeleteWeddingAction } from "@/lib/actions/admin";

interface AdminWeddingControlsProps {
  weddingId: string;
  weddingTitle: string;
  weddingSlug: string;
  status: string;
  isDemo?: boolean;
}

export function AdminWeddingControls({
  weddingId,
  weddingTitle,
  weddingSlug: _weddingSlug,
  status,
  isDemo,
}: AdminWeddingControlsProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await adminDeleteWeddingAction(weddingId);
      if (res.success) {
        toast.success(`"${weddingTitle}" was deleted successfully.`);
        setShowModal(false);
        router.push("/weddings");
        router.refresh();
      } else {
        toast.error("Failed to delete wedding listing.");
      }
    } catch (err: any) {
      console.error("[AdminWeddingControls] Delete error:", err);
      toast.error(err?.message || "An error occurred while deleting the wedding.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {/* Admin Bar */}
      <aside aria-label="Administrator controls" className="bg-charcoal-900 text-white border-b border-gold-500/30 px-4 py-2.5 rounded-2xl shadow-lg mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-rose-600/90 text-white text-[0.625rem] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md">
              <ShieldAlert size={12} />
              Admin Mode
            </span>
            <span className="text-xs text-warm-200 font-medium">
              ID: <code className="font-mono text-gold-300 text-[0.6875rem]">{weddingId}</code>
            </span>
            <span className="text-warm-400">•</span>
            <span
              className={`text-[0.625rem] font-bold uppercase px-2 py-0.5 rounded ${
                status === "PUBLISHED"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-warm-600 text-warm-200"
              }`}
            >
              {status}
            </span>
            {isDemo && (
              <span className="text-[0.625rem] font-bold uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                Demo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              href={`/dashboard/admin/weddings?action=edit&id=${weddingId}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-warm-800 hover:bg-warm-700 text-warm-100 text-xs font-bold transition-colors"
            >
              <Edit2 size={13} />
              <span>Edit in Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Trash2 size={13} />
              <span>Delete Listed Wedding</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-warm-200 space-y-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setShowModal(false)}
                disabled={isDeleting}
                className="text-charcoal-400 hover:text-charcoal-600 p-1 cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 id="delete-modal-title" className="font-display font-bold text-lg text-charcoal-900">
                Delete Listed Wedding?
              </h3>
              <p className="text-charcoal-600 text-xs leading-relaxed">
                Are you sure you want to delete <strong className="text-charcoal-900">&quot;{weddingTitle}&quot;</strong>?
              </p>
              <p className="text-charcoal-500 text-[0.6875rem] bg-warm-50 p-3 rounded-xl border border-warm-200/60 leading-normal">
                This will immediately remove the celebration from the public marketplace. If active bookings exist, it will be securely archived to preserve financial records.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-warm-200 text-charcoal-700 text-xs font-bold hover:bg-warm-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
