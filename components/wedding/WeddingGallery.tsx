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
        {/* Unified View: Single Hero Image */}
        <div className="relative rounded-3xl overflow-hidden h-[40vh] md:h-[500px] min-h-[400px] shadow-lg border border-warm-200/50 bg-warm-100">
          <Image
            src={heroImgSrc}
            alt={`${title} main photo`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            onError={() => setHeroImgSrc("https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=85")}
          />
          <button
            onClick={() => handleOpenModal(0)}
            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-white/90 backdrop-blur-sm text-charcoal-900 text-sm font-semibold px-4 py-2 md:px-5 md:py-2.5 rounded-xl shadow-md hover:bg-white transition-colors flex items-center gap-2"
          >
            <Grid2x2 size={16} />
            View all {images.length} photos
          </button>
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
            <div className="flex justify-between items-center p-5 text-white bg-gradient-to-b from-black/50 to-transparent">
              <span className="font-display font-medium text-sm md:text-base tracking-wide">
                {title} — Guest View
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close gallery"
              >
                <X size={20} />
              </button>
            </div>

            {/* Slider Center Area */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              {/* Prev Button */}
              <button
                onClick={handlePrev}
                className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-90 transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Active Image */}
              <div className="relative w-full max-w-5xl h-[50vh] md:h-[70vh]">
                <Image
                  src={images[activeImageIndex]}
                  alt={`${title} enlarged image ${activeImageIndex + 1}`}
                  fill
                  className="object-contain"
                  quality={95}
                />
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-90 transition-all"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Footer / Image Counter & Thumbnail Track */}
            <div className="p-6 bg-gradient-to-t from-black/50 to-transparent flex flex-col items-center gap-4">
              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                {activeImageIndex + 1} / {images.length}
              </span>
              
              {/* Small horizontal thumbnails for jumping */}
              <div className="flex gap-2 overflow-x-auto max-w-full py-2 px-4 scrollbar-thin scrollbar-thumb-white/20">
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
