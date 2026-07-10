"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Calendar, Heart, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
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

export function Hero({ stats }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      aria-label="Hero — Attend Authentic Indian Weddings"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1920&q=90')",
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/70 via-charcoal-950/50 to-charcoal-950/80" />
        {/* Gold bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-warm-50)] to-transparent" />
      </div>

      {/* Floating ornament particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[
          { top: "15%", left: "8%", delay: 0 },
          { top: "20%", right: "12%", delay: 0.8 },
          { top: "60%", left: "5%", delay: 1.6 },
          { top: "65%", right: "6%", delay: 0.4 },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute text-3xl opacity-30 animate-float"
            style={{ ...pos, animationDelay: `${pos.delay}s` }}
          >
            🪔
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container-luxury pt-32 pb-24 flex flex-col items-center text-center">
        {/* Label */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-secondary)] animate-pulse" aria-hidden="true" />
          The World&apos;s First Wedding Experience Marketplace
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-display font-bold text-white leading-[1.08] tracking-tight mb-6 max-w-4xl"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
        >
          Be a Guest at a{" "}
          <span
            className="relative inline-block"
            style={{
              background: "linear-gradient(135deg, #fcd34d 0%, #c9972a 60%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Real Indian Wedding
          </span>
        </motion.h1>

        {/* Sub headline */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-white/75 text-lg sm:text-xl leading-relaxed max-w-2xl mb-10"
        >
          Travel beyond tourism. Celebrate alongside real families in Rajasthan,
          Goa, Punjab, and beyond — an experience no guidebook can offer.
        </motion.p>

        {/* Search bar */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-3xl mb-10"
        >
          <div className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-[0_16px_64px_0_rgba(0,0,0,0.25)]">
            {/* Destination */}
            <div className="flex-1 flex items-center gap-3 bg-white/90 rounded-xl px-4 py-3">
              <MapPin
                size={18}
                className="text-[var(--color-brand-primary)] flex-shrink-0"
                aria-hidden="true"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <label
                  htmlFor="hero-destination"
                  className="text-[0.6875rem] font-semibold text-charcoal-500 uppercase tracking-wide"
                >
                  Where
                </label>
                <input
                  id="hero-destination"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rajasthan, Goa, Kerala…"
                  className="text-sm text-charcoal-900 placeholder:text-charcoal-400 bg-transparent outline-none font-medium"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px self-stretch bg-warm-200" aria-hidden="true" />

            {/* Category */}
            <div className="flex-1 flex items-center gap-3 bg-white/90 rounded-xl px-4 py-3">
              <span className="text-lg flex-shrink-0" aria-hidden="true">🪔</span>
              <div className="flex flex-col min-w-0 flex-1">
                <label
                  htmlFor="hero-category"
                  className="text-[0.6875rem] font-semibold text-charcoal-500 uppercase tracking-wide"
                >
                  Wedding Style
                </label>
                <select
                  id="hero-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-sm text-charcoal-900 bg-transparent outline-none font-medium appearance-none cursor-pointer"
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

            {/* Divider */}
            <div className="hidden sm:block w-px self-stretch bg-warm-200" aria-hidden="true" />

            {/* Date */}
            <div className="flex-1 flex items-center gap-3 bg-white/90 rounded-xl px-4 py-3">
              <Calendar
                size={18}
                className="text-[var(--color-brand-primary)] flex-shrink-0"
                aria-hidden="true"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <label
                  htmlFor="hero-date"
                  className="text-[0.6875rem] font-semibold text-charcoal-500 uppercase tracking-wide"
                >
                  When
                </label>
                <input
                  id="hero-date"
                  type="month"
                  className="text-sm text-charcoal-700 bg-transparent outline-none font-medium"
                  aria-label="Select month"
                />
              </div>
            </div>

            {/* Search CTA */}
            <Link
              href="/weddings"
              className="btn btn-primary flex-shrink-0 gap-2 px-6 rounded-xl"
              aria-label="Search weddings"
            >
              <Search size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </Link>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <Link
            href="/weddings"
            className="btn btn-secondary btn-lg group"
          >
            <Heart size={18} aria-hidden="true" />
            Attend a Wedding
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/list-wedding"
            className="btn btn-ghost-white btn-lg"
          >
            List Your Wedding
          </Link>
          <button
            className="flex items-center gap-2.5 text-white/80 hover:text-white transition-colors text-sm font-medium group"
            aria-label="Watch how it works video"
          >
            <span className="w-11 h-11 rounded-full bg-white/15 border border-white/30 flex items-center justify-center group-hover:bg-white/25 transition-all duration-200">
              <Play size={15} className="translate-x-0.5" aria-hidden="true" />
            </span>
            Watch how it works
          </button>
        </motion.div>

        {/* Stats cards */}
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
              className="glass rounded-2xl px-5 py-4 text-center"
              role="listitem"
            >
              <div
                className="font-display font-bold text-2xl leading-none mb-1"
                style={{
                  background: "linear-gradient(135deg, #fcd34d 0%, #c9972a 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </div>
              <div className="text-white text-sm font-semibold mb-0.5">
                {stat.label}
              </div>
              <div className="text-white/60 text-xs">{stat.description}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <div className="w-5 h-8 rounded-full border-2 border-white/40 flex items-start justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-1 h-2 rounded-full bg-white/60"
          />
        </div>
        <span className="text-white/40 text-[0.625rem] uppercase tracking-widest">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
