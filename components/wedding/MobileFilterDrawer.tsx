"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterSidebar } from "./FilterSidebar";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFilterDrawer({ isOpen, onClose }: MobileFilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 lg:hidden flex items-end"
          role="dialog"
          aria-modal="true"
          aria-label="Filter celebrations"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-charcoal-950/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom Sheet Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative w-full bg-white rounded-t-3xl shadow-2xl flex flex-col z-10"
            style={{
              maxHeight: "75dvh",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-warm-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-warm-200 flex-shrink-0">
              <span className="font-display font-bold text-charcoal-900 text-base">
                Refine Search
              </span>
              <button
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-charcoal-100 transition-colors text-charcoal-500"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="flex-1 overflow-y-auto p-5 overscroll-contain">
              <FilterSidebar />
            </div>

            {/* Sticky Apply button */}
            <div className="p-4 border-t border-warm-200 bg-warm-50/80 flex-shrink-0">
              <button
                onClick={onClose}
                className="btn btn-primary w-full justify-center rounded-2xl py-3.5 text-sm font-bold"
              >
                Show Results
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
