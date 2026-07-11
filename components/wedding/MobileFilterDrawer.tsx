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
          className="fixed inset-0 z-50 lg:hidden flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-charcoal-950/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-warm-200">
              <span className="font-display font-bold text-charcoal-900 text-base">
                Refine Search
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-charcoal-100 transition-colors text-charcoal-500"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="flex-1 overflow-y-auto p-5">
              <FilterSidebar />
            </div>

            {/* Sticky Actions */}
            <div className="p-5 border-t border-warm-200 bg-warm-50/50">
              <button
                onClick={onClose}
                className="btn btn-primary w-full justify-center rounded-2xl py-3.5"
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
