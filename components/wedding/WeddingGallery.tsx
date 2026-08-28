"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid2x2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface WeddingGalleryProps {
  images: string[];
  title: string;
}

export function WeddingGallery({ images, title }: WeddingGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [heroImgSrc, setHeroImgSrc] = useState(
    images[0] || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=85"
  );

  // Take first 5 images for the desktop grid, fallback to placeholder if none
  const _gridImages = images.slice(0, 5);

  const handleOpenModal = (index: number) => {
    setActiveImageIndex(index);
    setIsModalOpen(true);
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="relative" aria-label="Photo gallery">
      <div className="mt-4">
        {/* Mobile: edge-to-edge hero. Desktop: rounded card */}
        <div className="relative overflow-hidden
          h-[52vw] sm:h-[44vw] md:h-[500px] min-h-[220px] md:min-h-[400px]
          rounded-none sm:rounded-3xl
          shadow-none sm:shadow-lg
          border-0 sm:border sm:border-warm-200/50
          bg-warm-100
          -mx-4 sm:mx-0"
        >
          <Image
            src={heroImgSrc}
            alt={`${title} main photo`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            onError={() => {
              const fallback = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=85";
              if (heroImgSrc !== fallback) setHeroImgSrc(fallback);
            }}
          />
          {/* Photo count overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          {/* View all button — 44px min touch target */}
          <button
            onClick={() => handleOpenModal(0)}
            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white/90 backdrop-blur-sm text-charcoal-900 text-xs sm:text-sm font-semibold px-4 py-2.5 sm:px-5 rounded-xl shadow-md hover:bg-white transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <Grid2x2 size={15} />
            {images.length} photos
          </button>
          {/* Image dots indicator on mobile */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
              {images.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleOpenModal(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === 0 ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  )}
                  aria-label={`View photo ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Photo Modal (inspired by Apple Photos layout) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal-950 flex flex-col justify-between"
            role="dialog"
            aria-modal="true"
          >
            {/* Header / Actions */}
            <div className="flex justify-between items-center p-4 sm:p-5 text-white bg-gradient-to-b from-black/50 to-transparent">
              <span className="font-display font-medium text-sm tracking-wide line-clamp-1 flex-1 mr-4">
                {title} — Photo {activeImageIndex + 1} of {images.length}
              </span>
              {/* Close: 48px touch target */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Close gallery"
              >
                <X size={22} />
              </button>
            </div>

            {/* Slider Center Area */}
            <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4">
              {/* Prev Button — 48px */}
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-90 transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft size={26} />
              </button>

              {/* Active Image */}
              <div className="relative w-full max-w-5xl h-[60dvh] sm:h-[70vh]">
                <Image
                  src={images[activeImageIndex]}
                  alt={`${title} enlarged image ${activeImageIndex + 1}`}
                  fill
                  className="object-contain"
                  quality={95}
                />
              </div>

              {/* Next Button — 48px */}
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-90 transition-all"
                aria-label="Next image"
              >
                <ChevronRight size={26} />
              </button>
            </div>

            {/* Footer / Image Counter & Thumbnail Track */}
            <div
              className="p-4 sm:p-6 bg-gradient-to-t from-black/50 to-transparent flex flex-col items-center gap-3"
              style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
            >
              {/* Dot indicators (mobile-friendly) */}
              <div className="flex gap-1.5 sm:hidden">
                {images.slice(0, 8).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === activeImageIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"
                    )}
                    aria-label={`Go to photo ${i + 1}`}
                  />
                ))}
              </div>
              
              {/* Small horizontal thumbnails (desktop) */}
              <div className="hidden sm:flex gap-2 overflow-x-auto max-w-full py-2 px-4 scrollbar-thin scrollbar-thumb-white/20">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={cn(
                      "relative w-14 h-10 rounded-md overflow-hidden flex-shrink-0 border transition-all duration-300",
                      i === activeImageIndex ? "border-[var(--color-brand-secondary)] scale-105 shadow-md" : "border-transparent opacity-50"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${title} photo thumbnail ${i + 1}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
