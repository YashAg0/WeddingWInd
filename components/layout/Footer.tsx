import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Globe2,
} from "lucide-react";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { InstallButton } from "@/components/pwa/InstallButton";

/* ===============================================================
   FOOTER NAVIGATION
=============================================================== */

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Founder: Tanishq Gupta", href: "/founder/tanishq-gupta" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "For Travelers", href: "/for-travelers" },
    { label: "Contact Us", href: "/contact" },
  ],

  explore: [
    { label: "Browse Weddings", href: "/weddings" },
    { label: "Become a Host Family", href: "/list-wedding" },
    { label: "Become a Partner", href: "/for-agents" },
    { label: "Become a Coordinator", href: "/coordinators" },
  ],

  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Cancellation Policy", href: "/cancellation-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Copyright & IP", href: "/copyright" },
    { label: "Trademark & Brand", href: "/trademark" },
  ],

  agreements: [
    { label: "Traveler Agreement", href: "/traveler-agreement" },
    { label: "Host Agreement", href: "/host-agreement" },
    { label: "Partner Agreement", href: "/agent-agreement" },
    { label: "Coordinator Agreement", href: "/coordinator-agreement" },
    { label: "DPDP Act (India)", href: "/dpdp" },
    { label: "GDPR & EU Privacy", href: "/gdpr" },
  ],
};

/* ===============================================================
   GLOBAL PRESENCE
   IMPORTANT:
   Use "Remote" / "Operating Location" unless the location is
   legally a registered office of the business.
=============================================================== */

const globalLocations = [
  {
    country: "United States",
    city: "United States",
    status: "Remote",
  },
  {
    country: "United Kingdom",
    city: "United Kingdom",
    status: "Remote",
  },
  {
    country: "Australia",
    city: "Australia",
    status: "Remote",
  },
  {
    country: "India",
    city: "Jaipur, Rajasthan",
    status: "Operating Location",
  },
  {
    country: "India",
    city: "Jaipur, Rajasthan",
    status: "Operating Location",
  },
];

/* ===============================================================
   SOCIAL LINKS
   IMPORTANT:
   Keep only accounts that are actually owned/operated by
   Wedding With India.
=============================================================== */

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/weddingwithindia",
    icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://facebook.com/weddingwithindia",
    icon: Facebook,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@weddingwithindia",
    icon: Youtube,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/weddingwithindia",
    icon: Linkedin,
  },
];

/* ===============================================================
   FOOTER
=============================================================== */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-[var(--color-charcoal-900)] text-white"
      role="contentinfo"
    >

      {/* =========================================================
          NEWSLETTER
      ========================================================= */}

      <div className="border-b border-white/10">
        <div className="container-luxury py-12 sm:py-14">

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

            <div className="max-w-xl">

              <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--color-brand-secondary)] mb-3">
                Stay Connected
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                Discover India beyond the itinerary.
              </h2>

              <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-md">
                Get new wedding experiences, cultural guides and Wedding With
                India updates delivered to your inbox.
              </p>

            </div>

            <div className="w-full lg:w-auto">
              <NewsletterForm />
            </div>

          </div>

        </div>
      </div>

      {/* =========================================================
          MAIN FOOTER
      ========================================================= */}

      <div className="container-luxury py-14 sm:py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">

          {/* =====================================================
              BRAND / CONTACT
          ===================================================== */}

          <div className="md:col-span-2 lg:col-span-2">

            <Link
              href="/"
              className="inline-flex items-center gap-3 mb-6 group"
              aria-label="WeddingWithIndia — Home"
            >

              <div className="w-11 h-11 rounded-xl bg-[var(--color-brand-primary)] flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/images/logos/logo.png"
                  alt="WeddingWithIndia"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="flex flex-col leading-none">

                <span className="font-display font-bold text-white text-base">
                  WeddingWithIndia
                </span>

                <span className="text-[0.58rem] font-medium uppercase tracking-[0.14em] text-[var(--color-brand-secondary)] mt-1">
                  Experience India Differently
                </span>

              </div>

            </Link>

            <p className="text-white/60 text-sm leading-relaxed mb-7 max-w-sm">
              A platform connecting international travelers with participating
              Indian wedding experiences and the families who choose to welcome
              them.
            </p>

            {/* =================================================
                CONTACT
            ================================================= */}

            <address className="not-italic space-y-3 mb-7">

              <a
                href="mailto:contact@weddingwithindia.com"
                className="flex items-start gap-3 text-sm text-white/65 hover:text-[var(--color-brand-secondary)] transition-colors"
              >

                <Mail
                  size={16}
                  className="text-[var(--color-brand-secondary)] shrink-0 mt-0.5"
                  aria-hidden="true"
                />

                <span>
                  contact@weddingwithindia.com
                </span>

              </a>

              <a
                href="tel:+919116734675"
                className="flex items-start gap-3 text-sm text-white/65 hover:text-[var(--color-brand-secondary)] transition-colors"
              >

                <Phone
                  size={16}
                  className="text-[var(--color-brand-secondary)] shrink-0 mt-0.5"
                  aria-hidden="true"
                />

                <span>
                  +91 91 1673 4675
                </span>

              </a>

            </address>

            {/* =================================================
                GLOBAL PRESENCE
            ================================================= */}

            <div className="flex items-start gap-3 mb-7">

              <Globe2
                size={17}
                className="text-[var(--color-brand-secondary)] shrink-0 mt-0.5"
                aria-hidden="true"
              />

              <div className="min-w-0">

                <div className="text-white font-semibold text-sm mb-3">
                  Global Presence
                </div>

                <div className="space-y-2">

                  {globalLocations.map((location, index) => (
                    <div
                      key={`${location.city}-${index}`}
                      className="flex items-center justify-between gap-4"
                    >

                      <div className="flex items-center gap-2 min-w-0">

                        <MapPin
                          size={12}
                          className="text-white/30 shrink-0"
                          aria-hidden="true"
                        />

                        <span className="text-xs text-white/60 truncate">
                          {location.city}
                        </span>

                      </div>

                      <span className="text-[0.6rem] uppercase tracking-wider text-white/30 whitespace-nowrap">
                        {location.status}
                      </span>

                    </div>
                  ))}

                </div>

              </div>

            </div>

            {/* =================================================
                SOCIAL MEDIA
            ================================================= */}

            <div
              className="flex items-center gap-2.5"
              aria-label="Wedding With India social media"
            >

              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Wedding With India on ${label}`}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)] transition-all duration-200"
                >
                  <Icon
                    size={16}
                    aria-hidden="true"
                  />
                </a>
              ))}

            </div>

            {/* PWA App Download Link */}
            <div className="pt-4 border-t border-white/10 mt-6">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--color-brand-secondary)] mb-2">
                Mobile Experience
              </div>
              <InstallButton variant="footer" />
            </div>

          </div>

          {/* =====================================================
              COMPANY
          ===================================================== */}

          <FooterColumn
            title="Company"
            links={footerLinks.company}
          />

          {/* =====================================================
              EXPLORE
          ===================================================== */}

          <FooterColumn
            title="Explore"
            links={footerLinks.explore}
          />

          {/* =====================================================
              LEGAL
          ===================================================== */}

          <FooterColumn
            title="Legal"
            links={footerLinks.legal}
          />

          {/* =====================================================
              AGREEMENTS
          ===================================================== */}

          <FooterColumn
            title="Agreements"
            links={footerLinks.agreements}
          />

        </div>

      </div>

      {/* =========================================================
          GLOBAL PRESENCE TRUST BAR
      ========================================================= */}

      <div className="border-t border-white/10">

        <div className="container-luxury py-8">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            <TrustItem
              title="Global Reach"
              description="Supporting travelers and partners across international markets."
            />

            <TrustItem
              title="India Operations"
              description="Operating presence in Jaipur, Rajasthan."
            />

            <TrustItem
              title="Built Around Trust"
              description="Clear policies, agreements and responsible cultural participation."
            />

          </div>

        </div>

      </div>

      {/* =========================================================
          DISCLOSURE
      ========================================================= */}

      <div className="border-t border-white/10">

        <div className="container-luxury py-7">

          <p className="text-xs leading-relaxed text-white/40 max-w-5xl">
            Wedding With India is a platform for discovering and coordinating
            participating wedding experiences. Availability, host
            participation, verification, services, pricing and other
            experience details may vary by listing. Experience participation
            is subject to applicable booking terms, host approval and
            applicable laws and regulations. Locations shown above represent
            remote or operating presence and should not be interpreted as
            registered offices unless expressly identified as such.
          </p>

        </div>

      </div>

      {/* =========================================================
          COPYRIGHT / BOTTOM NAV
      ========================================================= */}

      <div className="border-t border-white/10">

        <div className="container-luxury py-6">

          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

            <p className="text-xs sm:text-sm text-white/40 text-center lg:text-left">
              © {currentYear} WeddingWithIndia. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-white/40">

              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>

              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms
              </Link>

              <Link
                href="/cookies"
                className="hover:text-white transition-colors"
              >
                Cookies
              </Link>

              <Link
                href="/contact"
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>

              <span className="hidden sm:inline text-white/15">
                |
              </span>

              <span className="flex items-center gap-1.5">
                Made with
                <span
                  className="text-[var(--color-brand-secondary)]"
                  aria-label="love"
                >
                  ♥
                </span>
                in India
              </span>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}

/* ===============================================================
   FOOTER COLUMN COMPONENT
=============================================================== */

type FooterColumnProps = {
  title: string;
  links: readonly {
    label: string;
    href: string;
  }[];
};

function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  return (
    <div className="lg:col-span-1">

      <h3 className="text-white font-semibold text-sm mb-5 tracking-wide">
        {title}
      </h3>

      <ul className="space-y-3.5" role="list">

        {links.map(({ label, href }) => (
          <li key={label} role="listitem">

            <Link
              href={href}
              className="text-white/55 text-sm hover:text-[var(--color-brand-secondary)] transition-colors duration-150"
            >
              {label}
            </Link>

          </li>
        ))}

      </ul>

    </div>
  );
}

/* ===============================================================
   TRUST ITEM
=============================================================== */

function TrustItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="w-2 h-2 rounded-full bg-[var(--color-brand-secondary)] mt-2 shrink-0" />

      <div>
        <h3 className="text-sm font-semibold text-white mb-1">
          {title}
        </h3>

        <p className="text-xs text-white/40 leading-relaxed">
          {description}
        </p>
      </div>

    </div>
  );
}