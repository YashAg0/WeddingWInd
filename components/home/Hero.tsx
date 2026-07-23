"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Calendar, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform, animate, useReducedMotion } from "framer-motion";
import type { Stat } from "@/types";

interface HeroProps {
  stats: Stat[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const, delay: i * 0.1 },
  }),
};

/** Animates a stat's numeric value counting up into view, preserving any
 *  non-numeric prefix/suffix (e.g. "500+", "4.9★", "$2.3M"). */
function AnimatedStatValue({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const match = value.match(/^([^\d]*)([\d,]+\.?\d*)(.*)$/);

  useEffect(() => {
    if (!match || !ref.current) return;
    const [, prefix, numStr, suffix] = match;

    if (prefersReducedMotion) {
      ref.current.textContent = value;
      return;
    }

    const target = parseFloat(numStr.replace(/,/g, ""));
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
    const node = ref.current;

    const controls = animate(0, target, {
      duration: 1.4,
      delay: 0.3,
      ease: "easeOut",
      onUpdate(v) {
        const formatted = decimals
          ? v.toFixed(decimals)
          : Math.round(v).toLocaleString();
        node.textContent = `${prefix}${formatted}${suffix}`;
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, prefersReducedMotion]);

  if (!match) return <>{value}</>;
  return <div ref={ref}>{value}</div>;
}

export function Hero({ stats }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const prefersReducedMotion = useReducedMotion();

  // Lightweight parallax: transform-only (translateY), no scale, no opacity
  // fade tied to scroll. Scale/opacity-on-scroll forces repaint of the full
  // viewport image on every frame and was the source of scroll jank.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      aria-label="Hero — Attend Authentic Indian Weddings"
    >
      {/* Background image with gentle parallax drift (transform-only, GPU-composited) */}
      <motion.div
        className="absolute inset-0 z-0 will-change-transform"
        style={{ y: prefersReducedMotion ? 0 : bgY }}
        aria-hidden="true"
      >
        <Image
          src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1920&q=90"
          alt="Indian Wedding Celebration"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/85 via-charcoal-950/55 to-charcoal-950/92" />
        <div className="absolute inset-0 bg-charcoal-950/20" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--color-warm-50)] to-transparent" />
      </motion.div>

      {/* Floating ornament particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[
          { top: "15%", left: "8%", delay: 0, duration: 7, drift: 14, size: "text-3xl" },
          { top: "20%", right: "12%", delay: 0.8, duration: 8.5, drift: -10, size: "text-2xl" },
          { top: "60%", left: "5%", delay: 1.6, duration: 6.5, drift: 12, size: "text-3xl" },
          { top: "65%", right: "6%", delay: 0.4, duration: 9, drift: -16, size: "text-2xl" },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className={`absolute ${pos.size} opacity-30 will-change-transform`}
            style={{ top: pos.top, left: pos.left, right: pos.right }}
            animate={
              prefersReducedMotion
                ? {}
                : {
                    y: [0, -18, 0],
                    x: [0, pos.drift, 0],
                    rotate: [0, pos.drift > 0 ? 6 : -6, 0],
                  }
            }
            transition={{
              duration: pos.duration,
              delay: pos.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles size={12} className="text-gold-400/60" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container-luxury pt-32 pb-24 flex flex-col items-center text-center">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8"
        >
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand-secondary)] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-brand-secondary)]" />
          </span>
          The World&apos;s First Wedding Experience Marketplace
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-display font-bold leading-[1.08] tracking-tight mb-6 max-w-4xl text-balance [text-wrap:balance] drop-shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
        >
          <span
            className="relative inline-block bg-[length:200%_auto] animate-shimmer"
            style={{
              backgroundImage:
                "linear-gradient(110deg, #d4a336 0%, #fef08a 25%, #ffffff 50%, #fef08a 75%, #d4a336 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "#fde68a",
            }}
          >
            Be a Guest at a Real Indian Wedding
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-white/95 text-lg sm:text-xl leading-relaxed max-w-2xl mb-10 text-balance drop-shadow-[0_1px_12px_rgba(0,0,0,0.3)]"
        >
          Travel beyond tourism. Celebrate alongside real families in Rajasthan,
          Goa, Punjab, and beyond — an experience no guidebook can offer.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-3xl mb-10"
        >
          <div className="glass rounded-2xl p-2 flex flex-col sm:flex-row sm:items-stretch gap-2 shadow-[0_16px_64px_0_rgba(0,0,0,0.28)]">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3 min-w-0 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/40">
              <MapPin size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" aria-hidden="true" />
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <label htmlFor="hero-destination" className="text-[0.6875rem] font-semibold text-charcoal-500 uppercase tracking-wide">
                  Where
                </label>
                <input
                  id="hero-destination"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rajasthan, Goa, Kerala…"
                  className="w-full text-sm text-charcoal-900 placeholder:text-charcoal-400 bg-transparent outline-none font-medium"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="hidden sm:block w-px my-1 bg-warm-200" aria-hidden="true" />

            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3 min-w-0 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/40">
              <Sparkles size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" aria-hidden="true" />
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <label htmlFor="hero-category" className="text-[0.6875rem] font-semibold text-charcoal-500 uppercase tracking-wide">
                  Wedding Style
                </label>
                <select
                  id="hero-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm text-charcoal-900 bg-transparent outline-none font-medium appearance-none cursor-pointer"
                  aria-label="Select wedding style"
                >
                  <option value="">All styles</option>
                  <option value="royal">Royal</option>
                  <option value="punjabi">Punjabi</option>
                  <option value="south-indian">South Indian</option>
                  <option value="beach">Beach</option>
                  <option value="destination">Destination</option>
                  <option value="traditional">Traditional</option>
                </select>
              </div>
            </div>

            <div className="hidden sm:block w-px my-1 bg-warm-200" aria-hidden="true" />

            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3 min-w-0 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/40">
              <Calendar size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" aria-hidden="true" />
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <label htmlFor="hero-date" className="text-[0.6875rem] font-semibold text-charcoal-500 uppercase tracking-wide">
                  When
                </label>
                <input
                  id="hero-date"
                  type="month"
                  className="w-full text-sm text-charcoal-700 bg-transparent outline-none font-medium"
                  aria-label="Select month"
                />
              </div>
            </div>

            <Link
              href="/weddings"
              className="btn btn-primary flex-shrink-0 gap-2 px-6 rounded-xl transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center"
              aria-label="Search weddings"
            >
              <Search size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl"
          role="list"
          aria-label="Platform statistics"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl px-5 py-4 text-center transition-transform duration-300 hover:-translate-y-1 hover:bg-white/20 flex flex-col items-center justify-center"
              role="listitem"
            >
              <div
                className="font-display font-bold text-2xl leading-none mb-1 tabular-nums"
                style={{
                  background: "linear-gradient(135deg, #fde68a 0%, #d4a336 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "#fde68a",
                }}
              >
                <AnimatedStatValue value={stat.value} />
              </div>
              <div className="text-white text-sm font-semibold mb-0.5">{stat.label}</div>
              <div className="text-white/75 text-xs">{stat.description}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <div className="w-5 h-8 rounded-full border-2 border-white/50 flex items-start justify-center pt-1.5">
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-1 h-2 rounded-full bg-white/70"
          />
        </div>
        <span className="text-white/60 text-[0.625rem] uppercase tracking-widest">Scroll</span>
      </motion.div>
    </section>
  );
}