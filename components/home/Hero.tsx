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
  stats?: Stat[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const, delay: i * 0.1 },
  }),
};

/** Floating ornament particles */
const PARTICLES = [
  { top: "15%", left: "8%", delay: 0, duration: 7, drift: 14, size: 22, opacity: 0.35, blur: 0 },
  { top: "20%", right: "12%", delay: 0.8, duration: 8.5, drift: -10, size: 14, opacity: 0.22, blur: 1 },
  { top: "60%", left: "5%", delay: 1.6, duration: 6.5, drift: 12, size: 26, opacity: 0.32, blur: 0 },
  { top: "65%", right: "6%", delay: 0.4, duration: 9, drift: -16, size: 12, opacity: 0.2, blur: 1.5 },
] as const;

/** Curated one-tap searches */
const TRENDING_SEARCHES = [
  "Rajasthan Royal Wedding",
  "Goa Beach Wedding",
  "Punjabi Wedding",
  "South Indian Temple Wedding",
] as const;

function FieldChevron() {
  return (
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-charcoal-400"
      aria-hidden="true"
    />
  );
}

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

function currentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

export function Hero({ stats: _stats }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isReducedMotion = mounted ? prefersReducedMotion : false;

  const motionInitial = (variantName: string) =>
    !mounted || isReducedMotion ? false : variantName;

  const searchHref = (() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("destination", searchQuery.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedMonth) params.set("month", selectedMonth);
    const qs = params.toString();
    return qs ? `/weddings?${qs}` : "/weddings";
  })();

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

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const particlesY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "3%"]);

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
        <motion.div
          className="absolute inset-0 z-0"
          animate={isReducedMotion ? { scale: 1.08 } : { scale: [1.08, 1.14, 1.08] }}
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
            className="object-cover opacity-85"
          />
        </motion.div>

        {/* Localized layered overlay: translucent dark at top, subtle mid-tone, warm maroon-tint at bottom */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,3,10,0.58) 0%, rgba(8,3,10,0.22) 32%, rgba(10,3,12,0.45) 68%, rgba(10,3,12,0.72) 100%)",
          }}
        />

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
        {/* Localized text scrim behind eyebrow + headline block for high contrast */}
        <div
          className="pointer-events-none absolute left-1/2 top-[8%] -translate-x-1/2 w-[min(56rem,92vw)] h-[26rem] sm:h-[30rem] -z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 72% 65% at 50% 40%, rgba(3,7,18,0.72) 0%, rgba(3,7,18,0.48) 45%, rgba(3,7,18,0) 80%)",
          }}
          aria-hidden="true"
        />

        {/* EYEBROW — category pill */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial={motionInitial("hidden")}
          animate="visible"
          className="relative inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/25 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6 shadow-sm"
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
          className="relative font-display font-bold leading-[1.06] tracking-tight mb-4 max-w-4xl [text-wrap:balance] drop-shadow-[0_4px_30px_rgba(0,0,0,0.80)]"
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
          className="relative text-white/95 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mb-10 [text-wrap:balance] drop-shadow-[0_2px_14px_rgba(0,0,0,0.70)]"
        >
          Join Us & Feel Our Preserved Indian Cultures And Traditons
        </motion.p>

        {/* SEARCH CARD */}
        <motion.div
          custom={2.6}
          variants={fadeUp}
          initial={motionInitial("hidden")}
          animate="visible"
          className="relative w-full max-w-3xl mb-8"
          style={{ perspective: 1200 }}
        >
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

        {/* Hairline divider */}
        <motion.div
          initial={!mounted || isReducedMotion ? false : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.1, ease: "easeOut" }}
          className="h-px w-16 mb-6 origin-center bg-gradient-to-r from-transparent via-gold-400/60 to-transparent"
          aria-hidden="true"
        />

        {/* Trust bar */}
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
