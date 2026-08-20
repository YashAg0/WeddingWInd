import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Camera,
  Shirt,
  Eye,
} from "lucide-react";

export function CulturalCode() {
  const principles = [
    {
      icon: HeartHandshake,
      title: "You Are Welcome",
      description:
        "Every wedding is different. Your hosts will help you understand the moments you can join, while you enjoy the celebration at your own pace.",
    },
    {
      icon: Camera,
      title: "Respect the Moment",
      description:
        "Some moments are private or sacred. Follow your hosts' wishes around photos and enjoy being part of the celebration.",
    },
    {
      icon: Shirt,
      title: "Dress with Confidence",
      description:
        "Not sure what to wear? Your host or coordinator can share simple guidance for the celebration you're attending.",
    },
    {
      icon: Eye,
      title: "Stay Curious",
      description:
        "You don't need to know every ritual. Ask, listen, and enjoy discovering the traditions as they happen.",
    },
  ];

  return (
    <section
      id="cultural-code"
      className="section-padding relative overflow-hidden bg-white border-t border-warm-200/50"
      aria-labelledby="cultural-code-heading"
    >
      <div className="container-luxury relative z-10">
        <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl min-h-[460px] lg:min-h-[500px]">
          {/* Background */}
          <Image
            src="https://images.unsplash.com/photo-1735052712464-9d24b69be5f5?auto=format&fit=crop&w=1920&q=80"
            alt="Indian wedding couple celebrating in traditional attire"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 95vw, 1280px"
            className="object-cover object-[62%_50%] sm:object-[68%_52%]"
            quality={85}
          />

          {/* Readability overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 max-w-5xl">
            {/* Header */}
            <div className="max-w-2xl mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/15 text-white backdrop-blur-md border border-white/25 mb-4 shadow-sm">
                <Sparkles
                  className="w-3.5 h-3.5 text-amber-300"
                  aria-hidden="true"
                />
                <span>The Guest Code</span>
              </div>

              <h2
                id="cultural-code-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white mb-3 tracking-tight drop-shadow-md"
              >
                Come as a guest. Leave with a memory.
              </h2>

              <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-4 drop-shadow-sm max-w-xl">
                Indian weddings are full of family, tradition, and joy. You
                don&apos;t need to know everything beforehand. Just come with
                curiosity, respect, and an open heart.
              </p>

              <Link
                href="/safety"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 hover:text-amber-200 transition-colors drop-shadow-sm group"
              >
                <span>Guest Guide</span>
                <ArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>

            {/* Guest Principles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {principles.map((item, index) => {
                const IconComponent = item.icon;

                return (
                  <div
                    key={index}
                    className="p-4 sm:p-5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 hover:border-amber-400/50 transition-all duration-300 shadow-md group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center mb-3 text-amber-300 group-hover:bg-amber-400/20 group-hover:scale-105 transition-all">
                      <IconComponent
                        className="w-[18px] h-[18px]"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="font-serif text-base font-semibold text-white mb-1.5 drop-shadow-sm">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-white/85 leading-relaxed drop-shadow-sm">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CulturalCode;