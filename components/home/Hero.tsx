"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Check,
  Star,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
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

/** Curated one-tap searches for the highest-intent destinations. Clicking one
 *  fills the "Where" field and carries focus to it, so the choice is visibly
 *  confirmed — a first-time visitor sees exactly what will be searched
 *  before committing, rather than a silent state change off-screen. */
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
 *  so the hero reads as confident rather than empty. Rendered as a slim,
 *  single-line trust bar (icon + claim) rather than heavy cards — the goal
 *  is a quiet, editorial confirmation of credibility, not a second visual
 *  centerpiece competing with the search card. Once real metrics exist
 *  these should be replaced with live data from BUSINESS_METRICS. */
const TRUST_STATS = [
  {
    icon: <ShieldCheck size={15} strokeWidth={2} aria-hidden="true" />,
    value: "Cultural",
    label: "Wedding Traditions",
    description: "Thoughtfully curated for guests",
  },
  {
    icon: <Star size={15} strokeWidth={2} aria-hidden="true" />,
    value: "Curated",
    label: "Celebrations Only",
    description: "Every wedding hand-selected",
  },
  {
    icon: <Check size={15} strokeWidth={2} aria-hidden="true" />,
    value: "Secure",
    label: "Transparent Payments",
    description: "AES-256 encrypted & protected",
  },
];

/** This month in "YYYY-MM" form, for the date field's floor — a wedding
 *  search shouldn't let anyone pick a month that's already passed. */
function currentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

export function Hero({ stats: _stats }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();

  // Hydration guard: Framer Motion's `initial="hidden"` (opacity:0, y:32) is
  // rendered by the server, but Framer Motion on the client immediately
  // calculates the `animate="visible"` state before the first paint, causing
  // React 19's strict hydration check to fail.
  //
  // Fix: render all motion elements with `initial={false}` on first paint
  // (SSR HTML and first client HTML are identical — both show visible state).
  // After hydration, `mounted` becomes true and subsequent renders use the
  // real `initial="hidden"` so the animation plays on fresh page loads.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isReducedMotion = mounted ? prefersReducedMotion : false;

  // Helper: suppress initial variant before hydration to prevent SSR mismatch
  const motionInitial = (variantName: string) =>
    !mounted || isReducedMotion ? false : variantName;

  // The search card builds a real query string using "destination" as the param name to
  // match the SearchAction URL template declared in layout.tsx's WebSite JSON-LD.
  const searchHref = (() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("destination", searchQuery.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedMonth) params.set("month", selectedMonth);
    const qs = params.toString();
    return qs ? `/weddings?${qs}` : "/weddings";
  })();

  // Pressing Enter in any field should search, matching the muscle memory
  // every visitor already has from every other search bar on the web.
  // The visible action stays a real <Link> (good for SEO/right-click/open
  // in new tab); this just adds the keyboard shortcut on top of it.
  function handleFieldKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      router.push(searchHref);
    }
  }

  const destinationInputRef = useRef<HTMLInputElement>(null);

  function handleTrendingClick(label: string) {
    setSearchQuery(label);
    const el = destinationInputRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: isReducedMotion ? "auto" : "smooth", block: "center" });
    el.focus();
  }

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
    if (isReducedMotion) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setTiltEnabled(canHover);
  }, [isReducedMotion]);

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
        className="absolute inset-0 z-0 will-change-transform overflow-hidden"
        style={{ y: isReducedMotion ? 0 : bgY }}
        aria-hidden="true"
      >
        {/* Ambient Ken Burns drift — a slow, near-imperceptible 26s breathing
            zoom that keeps the frame alive without ever calling attention to
            itself. This is the one place continuous motion is justified: a
            static hero photo behind a luxury travel brand reads as a stock
            photo, a barely-moving one reads as a living moment. */}
        <motion.div
          className="absolute inset-0 z-0"
          animate={isReducedMotion ? { scale: 1.1 } : { scale: [1.1, 1.17, 1.1] }}
          transition={
            isReducedMotion
              ? { duration: 0 }
              : { duration: 26, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <Image
            src="https://images.unsplash.com/photo-1735415899585-12e3cde91d31?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Indian Wedding Celebration"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover filter blur-[2px] opacity-75"
          />
        </motion.div>
        {/* Rich layered overlay: translucent dark at top for text legibility, maroon at bottom for brand warmth */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-charcoal-950/65 via-charcoal-950/45 to-maroon-950/70" />
        {/* Warm brand fade into the next section */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-32 bg-gradient-to-t from-[var(--color-warm-50)] via-[var(--color-warm-50)]/40 to-transparent" />
      </motion.div>

      {/* Floating ornament particles */}
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none will-change-transform"
        style={{ y: isReducedMotion ? 0 : particlesY }}
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
              isReducedMotion
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
        style={{ y: isReducedMotion ? 0 : contentY }}
        className="relative z-10 container-luxury pt-32 pb-20 flex flex-col items-center text-center will-change-transform"
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
          initial={motionInitial("hidden")}
          animate="visible"
          className="relative inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
        >
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0" aria-hidden="true">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-secondary)] opacity-75",
                !isReducedMotion && "animate-ping"
              )}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-brand-secondary)]" />
          </span>
          The World&apos;s Most Trusted Indian Wedding Platform
        </motion.div>

        {/* H1 — FIRST, commanding, emotional */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial={motionInitial("hidden")}
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
              animation: isReducedMotion ? "none" : "shimmer 3.5s linear infinite",
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
          initial={motionInitial("hidden")}
          animate="visible"
          className="relative text-white/95 text-lg sm:text-xl leading-relaxed max-w-2xl mb-10 [text-wrap:balance] drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]"
        >
          Join Host Families in Rajasthan, Goa, and Kerala as an honored guest.
          Beyond travel lies belonging — become part of the celebration.
        </motion.p>

        {/* SEARCH CARD — the single, focused path into the site. No competing
            buttons above it: one confident action reads as more considered
            than a wall of choices, and every field feeds it directly. */}
        <motion.div
          custom={2.6}
          variants={fadeUp}
          initial={motionInitial("hidden")}
          animate="visible"
          className="relative w-full max-w-3xl mb-8"
          style={{ perspective: 1200 }}
        >
          {/* Soft ambient glow behind the card — reads as a quiet spotlight
              rather than a hard drop-shadow, reinforcing the card as the
              hero's one deliberate focal point. */}
          <div
            className="pointer-events-none absolute -inset-4 -z-[1] rounded-[2rem] opacity-60 blur-2xl"
            style={{
              background:
                "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(201,151,42,0.25) 0%, rgba(201,151,42,0) 72%)",
            }}
            aria-hidden="true"
          />
          <motion.div
            ref={cardRef}
            onPointerMove={handleCardPointerMove}
            onPointerLeave={handleCardPointerLeave}
            style={{
              rotateX: tiltEnabled ? rotateX : 0,
              rotateY: tiltEnabled ? rotateY : 0,
              transformStyle: "preserve-3d",
            }}
            className="relative overflow-hidden glass rounded-2xl p-2 flex flex-col sm:flex-row sm:items-stretch gap-2 shadow-[0_20px_70px_0_rgba(0,0,0,0.32)] border border-white/20"
          >
            {/* One-time gleam across the glass on arrival — a single,
                non-repeating reveal rather than a loop, so it reads as
                "this card just unlocked" instead of a nervous tic. */}
            {!isReducedMotion && (
              <motion.div
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 z-20"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.4) 45%, transparent 90%)",
                }}
                initial={{ x: "-120%" }}
                animate={{ x: "420%" }}
                transition={{ duration: 1.1, delay: 1.5, ease: "easeInOut" }}
                aria-hidden="true"
              />
            )}

            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 min-w-0 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/40">
              <MapPin size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" aria-hidden="true" />
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <label htmlFor="hero-destination" className="text-[0.6875rem] font-semibold text-charcoal-500 uppercase tracking-wide">
                  Where
                </label>
                <input
                  id="hero-destination"
                  ref={destinationInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleFieldKeyDown}
                  placeholder="Rajasthan, Goa, Kerala…"
                  className="w-full text-sm text-charcoal-900 placeholder:text-charcoal-400 bg-transparent outline-none font-medium"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="hidden sm:block w-px my-1 bg-warm-200" aria-hidden="true" />

            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 min-w-0 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/40">
              <Sparkles size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" aria-hidden="true" />
              <div className="relative flex flex-col min-w-0 flex-1 text-left">
                <label htmlFor="hero-category" className="text-[0.6875rem] font-semibold text-charcoal-500 uppercase tracking-wide">
                  Wedding Style
                </label>
                <select
                  id="hero-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  onKeyDown={handleFieldKeyDown}
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

            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 min-w-0 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/40">
              <Calendar size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" aria-hidden="true" />
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <label htmlFor="hero-date" className="text-[0.6875rem] font-semibold text-charcoal-500 uppercase tracking-wide">
                  When
                </label>
                <input
                  id="hero-date"
                  type="month"
                  min={currentMonthValue()}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  onKeyDown={handleFieldKeyDown}
                  className="w-full text-sm text-charcoal-700 bg-transparent outline-none font-medium"
                  aria-label="Select month"
                />
              </div>
            </div>

            <Link
              href={searchHref}
              className="group btn btn-primary flex-shrink-0 gap-2 px-6 rounded-xl transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center"
              aria-label="Search weddings"
            >
              <Search
                size={18}
                className="transition-transform duration-200 group-hover:rotate-12"
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Search</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Trending quick-searches */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial={motionInitial("hidden")}
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 text-xs sm:text-sm mb-8"
        >
          <span className="text-white/50 uppercase tracking-widest mr-1.5">Trending</span>
          {TRENDING_SEARCHES.map((label, i) => (
            <span key={label} className="flex items-center">
              <button
                type="button"
                onClick={() => handleTrendingClick(label)}
                aria-pressed={searchQuery === label}
                aria-label={`Search ${label}`}
                className={cn(
                  "rounded-sm font-medium underline-offset-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950",
                  searchQuery === label
                    ? "text-gold-300 underline"
                    : "text-white/85 hover:text-gold-300 hover:underline"
                )}
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

        {/* Hairline divider — draws itself in as a quiet transition from
            "explore" content above to "trust" content below, without the
            visual weight of another card or rule. */}
        <motion.div
          initial={!mounted || isReducedMotion ? false : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.1, ease: "easeOut" }}
          className="h-px w-16 mb-6 origin-center bg-gradient-to-r from-transparent via-gold-400/60 to-transparent"
          aria-hidden="true"
        />

        {/* Trust bar — a slim, single-line row of credibility signals.
            Deliberately not a second set of cards: three quiet claims in
            one line read as an editorial footnote of confidence rather
            than a competing visual block. Each claim settles in with a
            slight stagger, echoing the deliberate pace of the rest of the
            reveal rather than arriving as one flat block. */}
        <div
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          role="list"
          aria-label="Platform trust signals"
        >
          {TRUST_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={!mounted || isReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 + i * 0.12, ease: "easeOut" }}
              className="flex items-center gap-2.5"
              role="listitem"
            >
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-gold-400/30 bg-white/5"
                style={{ color: "#fde68a" }}
                aria-hidden="true"
              >
                {stat.icon}
              </span>
              <div className="text-left leading-tight whitespace-nowrap">
                <div className="text-white text-xs sm:text-[0.8125rem] font-semibold">
                  <span
                    style={{
                      background: "linear-gradient(135deg, #fde68a 0%, #d4a336 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      color: "#fde68a",
                    }}
                  >
                    {stat.value}
                  </span>{" "}
                  {stat.label}
                </div>
                <div className="text-white/60 text-[0.6875rem]">{stat.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
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
            animate={isReducedMotion ? {} : { y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-1 h-2 rounded-full bg-white/70"
          />
        </div>
        <span className="text-white/60 text-[0.625rem] uppercase tracking-widest">Scroll</span>
      </motion.div>
    </section>
  );
}
