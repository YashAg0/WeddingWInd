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
  PlayCircle,
  ShieldCheck,
  Check,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  animate,
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

export function Hero({ stats }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const prefersReducedMotion = useReducedMotion();

  // The search card previously linked to a static "/weddings" regardless of
  // what was typed — none of the three fields actually did anything. This
  // builds the real query string, using "destination" as the param name to
  // match the SearchAction URL template already declared in layout.tsx's
  // WebSite JSON-LD (so Google Sitelinks Search and this button agree).
  // NOTE: "category" and "month" aren't confirmed against the /weddings
  // page's actual param names — verify those once that file is available.
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
  // (reads as "farther away"), foreground content barely moves at all. This
  // relative-speed difference is what actually creates a sense of depth —
  // a single moving background layer alone doesn't.
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const particlesY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "3%"]);

  // Subtle, tasteful tilt on the search card only — driven by pointer
  // position, capped to a few degrees, and fully inert on touch devices and
  // for anyone with prefers-reduced-motion set.
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
      aria-label="Hero — Attend Authentic Indian Weddings"
    >
      {/* Background image layer — moves most on scroll (appears closest to
          the "camera" of the parallax stack, farthest in actual depth) */}
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
        {/* Base gradient — deliberately darker than before at every stop.
            IMPORTANT: this alone is NOT relied on for text contrast anymore.
            A positional gradient assumes even photo brightness at each
            height, which this specific photo violates (a bright white dress
            sits right where the headline lands) — so text contrast below is
            guaranteed via its own local scrim (see headlineScrim), not by
            tuning these percentages against one photo's content. */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/90 via-charcoal-950/72 to-charcoal-950/94" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-warm-50)] to-transparent" />
      </motion.div>

      {/* Floating ornament particles — own parallax speed, distinct sizes and
          blur amounts for genuine depth-of-field rather than four identical dots */}
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

      {/* Foreground content — barely moves on scroll, staying "closest" and
          stable while the layers behind it drift, which is what actually
          reads as depth rather than the whole scene moving uniformly */}
      <motion.div
        style={{ y: prefersReducedMotion ? 0 : contentY }}
        className="relative z-10 container-luxury pt-32 pb-24 flex flex-col items-center text-center"
      >
        {/* Deterministic text scrim: a soft, feathered dark ellipse sized to
            roughly cover the eyebrow + headline + subtitle block, independent
            of what's in the photo behind it. This is the actual fix for
            contrast — not the base gradient above, which cannot guarantee
            darkness at one specific point in an unpredictable photo. The
            radial falloff keeps the effect invisible at the edges, so the
            photo still reads as full-bleed everywhere outside the text zone. */}
        <div
          className="pointer-events-none absolute left-1/2 top-[8%] -translate-x-1/2 w-[min(56rem,92vw)] h-[26rem] sm:h-[30rem] -z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 70% 65% at 50% 40%, rgba(3,7,18,0.7) 0%, rgba(3,7,18,0.5) 45%, rgba(3,7,18,0) 78%)",
          }}
          aria-hidden="true"
        />

        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-4"
        >
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand-secondary)] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-brand-secondary)]" />
          </span>
          The World&apos;s First Wedding Experience Marketplace
        </motion.div>

        {/* Secondary CTA for the not-ready-to-search visitor — someone who
            doesn't yet trust the premise ("wait, I can really attend a
            stranger's wedding?") needs a low-commitment next step before
            they'll type into the search bar. */}
        <motion.div custom={0.6} variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
          <Link
            href="/#how-it-works"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium underline-offset-4 hover:underline transition-colors duration-200"
          >
            <PlayCircle size={16} aria-hidden="true" />
            See how attending works
          </Link>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative font-display font-bold leading-[1.06] tracking-tight mb-6 max-w-4xl text-balance [text-wrap:balance] drop-shadow-[0_3px_30px_rgba(0,0,0,0.65)]"
          style={{ fontSize: "clamp(2.5rem, 6.5vw, 5.5rem)" }}
        >
          <span
            className="relative inline bg-[length:200%_auto] animate-shimmer"
            style={{
              backgroundImage:
                "linear-gradient(110deg, #c9972a 0%, #fcd34d 30%, #fff4d6 45%, #ffffff 50%, #fff4d6 55%, #fcd34d 70%, #c9972a 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "#fcd34d",
              textShadow: "0 2px 20px rgba(0,0,0,0.35)",
            }}
          >
            Be a Guest at an Indian Wedding
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative text-white/95 text-lg sm:text-xl leading-relaxed max-w-2xl mb-10 text-balance drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]"
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

        {/* Booking-policy trust line, placed at the exact decision point
            (right under the search card) rather than buried in a footer —
            this is what a hesitant first-time visitor checks before typing
            anything in. */}
        <motion.div
          custom={3.4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-white/70 text-xs sm:text-sm mb-6"
        >
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-gold-400 flex-shrink-0" aria-hidden="true" />
            Verified local hosts
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check size={14} className="text-gold-400 flex-shrink-0" aria-hidden="true" />
            Free to browse, no hidden fees
          </span>
        </motion.div>

        {/* Trending destination quick-searches — a first-time visitor with
            no fixed destination in mind gets a fast path into real results
            instead of staring at an empty "Where" field. */}
        <motion.div
          custom={3.7}
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

        <motion.div
          custom={4.3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl"
          role="list"
          aria-label="Platform statistics"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.12, ease: "easeOut" }}
              className="rounded-2xl px-5 py-4 text-center transition-transform duration-300 hover:-translate-y-1 flex flex-col items-center justify-center bg-charcoal-950/40 backdrop-blur-md border border-white/15 hover:bg-charcoal-950/50"
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
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

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