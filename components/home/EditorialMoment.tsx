"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from 'next/image';

export function EditorialMoment() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative h-[480px] sm:h-[600px] overflow-hidden" aria-hidden="false">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={inView ? { scale: 1 } : { scale: 1.08 }}
        transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Image
          src="https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1600&q=90"
          alt="Bride and groom in traditional Indian ceremony"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
      {/* No full image gradient overlay to comply with "No gradients over text-over-imagery" rule. */}
      {/* We will instead use a solid/semi-solid panel behind the text itself. */}

      {/* Subtle decorative texture overlay (kept for aesthetics) */}
      <div 
        className="absolute inset-0 opacity-[0.04] max-sm:opacity-[0.03] pointer-events-none z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='25' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='15' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='5' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3Cpath d='M30 5 L30 55 M5 30 L55 30 M12 12 L48 48 M48 12 L12 48' stroke='%23ffffff' stroke-width='0.3' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
        aria-hidden="true"
      />

      {/* Editorial copy — inside a solid panel to comply with design standards */}
      <motion.div
        className="absolute bottom-8 left-8 right-8 sm:bottom-16 sm:left-16 md:bottom-24 md:left-24 max-w-2xl z-20"
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
        transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bg-charcoal-950/90 backdrop-blur-md border border-white/10 rounded-3xl p-8 sm:p-12">
          <p className="font-display italic text-2xl sm:text-3xl md:text-4xl text-white leading-snug mb-5">
            &ldquo;You are not a tourist here. You are family.&rdquo;
          </p>
          <p className="text-white/80 text-sm sm:text-base font-medium">
            — Priya &amp; Arjun, hosts of The Grand Maharaja Wedding, Jodhpur
          </p>
        </div>
      </motion.div>
    </section>
  );
}
