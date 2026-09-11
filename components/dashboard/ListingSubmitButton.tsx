"use client";

import { useFormStatus } from "react-dom";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListingSubmitButtonProps {
  isEdit: boolean;
}

export function ListingSubmitButton({ isEdit }: ListingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2",
        pending ? "opacity-60 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"
      )}
    >
      {pending ? (
        <>
          <RefreshCw size={14} className="animate-spin" />
          <span>{isEdit ? "Saving Changes..." : "Publishing Celebration..."}</span>
        </>
      ) : (
        <span>{isEdit ? "Save Changes" : "Publish Wedding"}</span>
      )}
    </button>
  );
}
