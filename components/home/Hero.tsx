"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Check,
  Star,
  ArrowRight,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
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

// AnimatedStatValue removed — Hero now uses qualitative TRUST_STATS
// rather than animating numeric metrics that are 0 pre-launch.

/** Floating ornament particles — each has a genuinely distinct size and blur,
 *  so nearer/larger particles read as closer and farther/smaller ones recede,
 *  giving real depth-of-field rather than four identical dots. */
const PARTICLES = [
  { top: "15%", left: "8%", delay: 0, duration: 7, drift: 14, size: 22, opacity: 0.35, blur: 0 },
  { top: "20%", right: "12%", delay: 0.8, duration: 8.5, drift: -10, size: 14, opacity: 0.22, blur: 1 },
  { top: "60%", left: "5%", delay: 1.6, duration: 6.5, drift: 12, size: 26, opacity: 0.32, blur: 0 },
  { top: "65%", right: "6%", delay: 0.4, duration: 9, drift: -16, size: 12, opacity: 0.2, blur: 1.5 },
] as const;

/** Curated one-tap searches for the highest-intent destinations. These fill
 *  the "Where" field directly rather than linking out, so a first-time
 *  visitor with no fixed destination in mind still has a fast path into
 *  results instead of staring at an empty search bar. */
const TRENDING_SEARCHES = [
  "Rajasthan Royal Wedding",
  "Goa Beach Wedding",
  "Punjabi Wedding",
  "South Indian Temple Wedding",
] as const;

/** A select styled with `appearance-none` needs its own arrow — this restores
 *  a real, visible dropdown indicator instead of leaving the control looking
 *  like plain text with no affordance. */
function FieldChevron() {
  return (
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-charcoal-400"
      aria-hidden="true"
    />
  );
}

/** Pre-launch trust stats — qualitative trust signals rather than zeroes,
 *  so the hero reads as confident rather than empty. Once real metrics exist
 *  these should be replaced with live data from BUSINESS_METRICS. */
const TRUST_STATS = [
  {
    icon: <ShieldCheck size={22} strokeWidth={1.75} aria-hidden="true" />,
    value: "100%",
    label: "Verified Hosts",
    description: "Every family personally vetted",
  },
  {
    icon: <Star size={22} strokeWidth={1.75} aria-hidden="true" />,
    value: "Curated",
    label: "Celebrations Only",
    description: "Every wedding hand-selected",
  },
  {
    icon: <Check size={22} strokeWidth={1.75} aria-hidden="true" />,
    value: "Secure",
    label: "Transparent Payments",
    description: "AES-256 encrypted & protected",
  },
];

export function Hero({ stats: _stats }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const prefersReducedMotion = useReducedMotion();

  // The search card previously linked to a static "/weddings" regardless of
  // what was typed — none of the three fields actually did anything. This
  // builds the real query string, using "destination" as the param name to
  // match the SearchAction URL template already declared in layout.tsx's
  // WebSite JSON-LD (so Google Sitelinks Search and this button agree).
  const searchHref = (() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("destination", searchQuery.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedMonth) params.set("month", selectedMonth);
    const qs = params.toString();
    return qs ? `/weddings?${qs}` : "/weddings";
  })();

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Layered parallax: background drifts most, particles drift a little less
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const particlesY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "3%"]);

  // Subtle, tasteful tilt on the search card only
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(rawRotateY, { stiffness: 200, damping: 20 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setTiltEnabled(canHover);
  }, [prefersReducedMotion]);

  function handleCardPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!tiltEnabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const MAX_DEG = 3.5;
    rawRotateY.set(px * MAX_DEG * 2);
    rawRotateX.set(-py * MAX_DEG * 2);
  }

  function handleCardPointerLeave() {
    rawRotateX.set(0);
    rawRotateY.set(0);
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      aria-label="Hero — Experience Our Indian Weddings"
    >
      {/* Background image layer */}
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
          quality={90}
          sizes="100vw"
          className="object-cover scale-110"
        />
        {/* Rich layered overlay: dark at top for text, deep maroon at bottom for brand warmth */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/88 via-charcoal-950/68 to-maroon-950/92" />
        {/* Warm brand fade into the next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-warm-50)] to-transparent" />
      </motion.div>

      {/* Floating ornament particles */}
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none will-change-transform"
        style={{ y: prefersReducedMotion ? 0 : particlesY }}
        aria-hidden="true"
      >
        {PARTICLES.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: pos.top,
              left: "left" in pos ? pos.left : undefined,
              right: "right" in pos ? pos.right : undefined,
              opacity: pos.opacity,
              filter: pos.blur ? `blur(${pos.blur}px)` : undefined,
            }}
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
            <Sparkles size={pos.size} className="text-gold-400" />
          </motion.div>
        ))}
      </motion.div>

      {/* Foreground content */}
      <motion.div
        style={{ y: prefersReducedMotion ? 0 : contentY }}
        className="relative z-10 container-luxury pt-32 pb-24 flex flex-col items-center text-center"
      >
        {/* Deterministic text scrim behind eyebrow + headline block */}
        <div
          className="pointer-events-none absolute left-1/2 top-[8%] -translate-x-1/2 w-[min(56rem,92vw)] h-[26rem] sm:h-[30rem] -z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 70% 65% at 50% 40%, rgba(3,7,18,0.7) 0%, rgba(3,7,18,0.5) 45%, rgba(3,7,18,0) 78%)",
          }}
          aria-hidden="true"
        />

        {/* EYEBROW — trust/category pill */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
        >
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand-secondary)] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-brand-secondary)]" />
          </span>
          The World&apos;s Most Trusted Indian Wedding Platform
        </motion.div>

        {/* H1 — FIRST, commanding, emotional */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative font-display font-bold leading-[1.06] tracking-tight mb-4 max-w-4xl [text-wrap:balance] drop-shadow-[0_3px_30px_rgba(0,0,0,0.65)]"
          style={{ fontSize: "clamp(2.75rem, 6.5vw, 5.5rem)" }}
        >
          <span
            className="relative inline bg-[length:200%_auto]"
            style={{
              backgroundImage:
                "linear-gradient(110deg, #c9972a 0%, #fcd34d 30%, #fff4d6 45%, #ffffff 50%, #fff4d6 55%, #fcd34d 70%, #c9972a 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "#fcd34d",
              animation: "shimmer 3.5s linear infinite",
              backgroundSize: "200% auto",
            }}
          >
            Experience Our Indian Weddings
          </span>
        </motion.h1>

        {/* Supporting copy */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative text-white/95 text-lg sm:text-xl leading-relaxed max-w-2xl mb-8 [text-wrap:balance] drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]"
        >
          Join Host Families in Rajasthan, Goa, and Kerala as an honored guest.
          Beyond travel lies belonging — become part of the celebration.
        </motion.p>

        {/* PRIMARY CTA — most prominent action above the search */}
        <motion.div
          custom={2.5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center gap-3 mb-8"
        >
          <Link
            href="/weddings"
            className="btn btn-secondary btn-lg group"
            aria-label="Explore all Indian wedding celebrations"
          >
            <span>Explore Celebrations</span>
            <ArrowRight
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/#how-it-works"
            className="btn btn-ghost-white group"
            aria-label="Learn how Wedding With India works"
          >
            How It Works
          </Link>
        </motion.div>

        {/* SEARCH CARD — discovery tool */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-3xl mb-6"
          style={{ perspective: 1200 }}
        >
          <motion.div
            ref={cardRef}
            onPointerMove={handleCardPointerMove}
            onPointerLeave={handleCardPointerLeave}
            style={{
              rotateX: tiltEnabled ? rotateX : 0,
              rotateY: tiltEnabled ? rotateY : 0,
              transformStyle: "preserve-3d",
            }}
            className="glass rounded-2xl p-2 flex flex-col sm:flex-row sm:items-stretch gap-2 shadow-[0_20px_70px_0_rgba(0,0,0,0.32)] border border-white/20"
          >
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
              <div className="relative flex flex-col min-w-0 flex-1 text-left">
                <label htmlFor="hero-category" className="text-[0.6875rem] font-semibold text-charcoal-500 uppercase tracking-wide">
                  Wedding Style
                </label>
                <select
                  id="hero-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm text-charcoal-900 bg-transparent outline-none font-medium appearance-none cursor-pointer pr-6"
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
                <FieldChevron />
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
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full text-sm text-charcoal-700 bg-transparent outline-none font-medium"
                  aria-label="Select month"
                />
              </div>
            </div>

            <Link
              href={searchHref}
              className="btn btn-primary flex-shrink-0 gap-2 px-6 rounded-xl transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center"
              aria-label="Search weddings"
            >
              <Search size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Trending quick-searches */}
        <motion.div
          custom={3.4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 text-xs sm:text-sm mb-10"
        >
          <span className="text-white/50 uppercase tracking-widest mr-1.5">Trending</span>
          {TRENDING_SEARCHES.map((label, i) => (
            <span key={label} className="flex items-center">
              <button
                type="button"
                onClick={() => setSearchQuery(label)}
                className="text-white/85 hover:text-gold-300 font-medium underline-offset-4 hover:underline transition-colors duration-200"
              >
                {label}
              </button>
              {i < TRENDING_SEARCHES.length - 1 && (
                <span className="text-white/30 mx-2" aria-hidden="true">
                  ·
                </span>
              )}
            </span>
          ))}
        </motion.div>

        {/* Trust stats — qualitative signals that don't display as zeroes */}
        <motion.div
          custom={4.3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl"
          role="list"
          aria-label="Platform trust signals"
        >
          {TRUST_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.12, ease: "easeOut" }}
              className="rounded-2xl px-5 py-4 text-center transition-transform duration-300 hover:-translate-y-1 flex flex-col items-center justify-center bg-charcoal-950/40 backdrop-blur-md border border-white/15 hover:bg-charcoal-950/50"
              role="listitem"
            >
              <div
                className="mb-2 flex items-center justify-center"
                style={{
                  color: "#fde68a",
                  filter: "drop-shadow(0 0 8px rgba(201,151,42,0.4))",
                }}
                aria-hidden="true"
              >
                {stat.icon}
              </div>
              <div
                className="font-display font-bold text-xl leading-none mb-1 tabular-nums"
                style={{
                  background: "linear-gradient(135deg, #fde68a 0%, #d4a336 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "#fde68a",
                }}
              >
                {stat.value}
              </div>
              <div className="text-white text-sm font-semibold mb-0.5">{stat.label}</div>
              <div className="text-white/75 text-xs">{stat.description}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
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