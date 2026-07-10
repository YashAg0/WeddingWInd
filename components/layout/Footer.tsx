import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

// Inline SVG social icons (brand icons not in lucide-react)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Our Story", href: "/about#story" },
    { label: "Press & Media", href: "/press" },
    { label: "Careers", href: "/careers" },
  ],
  forGuests: [
    { label: "Browse Weddings", href: "/weddings" },
    { label: "Wedding Categories", href: "/weddings#categories" },
    { label: "Guest Guide", href: "/guide/guests" },
    { label: "Cultural Tips", href: "/guide/culture" },
    { label: "Safety & Trust", href: "/safety" },
  ],
  forHosts: [
    { label: "List Your Wedding", href: "/list-wedding" },
    { label: "Host Guidelines", href: "/guide/hosts" },
    { label: "Pricing & Fees", href: "/pricing" },
    { label: "Host Stories", href: "/stories" },
    { label: "Partner Program", href: "/partners" },
  ],
  support: [
    { label: "Help Centre", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Cancellation Policy", href: "/policies/cancellation" },
    { label: "Privacy Policy", href: "/policies/privacy" },
    { label: "Terms of Service", href: "/policies/terms" },
  ],
};

const socialLinks = [
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
  { icon: TwitterIcon, label: "Twitter / X", href: "https://twitter.com" },
  { icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-[var(--color-charcoal-900)] text-white"
      role="contentinfo"
    >
      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="container-luxury py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Never miss a celebration
              </h2>
              <p className="text-charcoal-300 text-sm leading-relaxed">
                Get curated wedding listings, cultural guides, and exclusive
                early access delivered to your inbox.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="container-luxury py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-10 xl:gap-8">
          {/* Brand column */}
          <div className="md:col-span-2 xl:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 mb-6 group"
              aria-label="Wedding With India — Home"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)] flex items-center justify-center text-xl">
                🪔
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-white text-base">
                  Wedding With India
                </span>
                <span className="text-[0.625rem] font-medium uppercase tracking-widest text-[var(--color-brand-secondary)] mt-0.5">
                  Attend Authentic Weddings
                </span>
              </div>
            </Link>

            <p className="text-charcoal-400 text-sm leading-relaxed mb-6 max-w-xs">
              The world's first marketplace to attend real Indian weddings.
              Connecting global travellers with authentic cultural celebrations
              since 2024.
            </p>

            {/* Contact */}
            <address className="not-italic space-y-3 mb-8">
              <a
                href="mailto:hello@weddingwithindia.com"
                className="flex items-center gap-3 text-sm text-charcoal-400 hover:text-[var(--color-brand-secondary)] transition-colors group"
              >
                <Mail
                  size={16}
                  className="text-[var(--color-brand-secondary)] flex-shrink-0"
                  aria-hidden="true"
                />
                hello@weddingwithindia.com
              </a>
              <a
                href="tel:+917001234567"
                className="flex items-center gap-3 text-sm text-charcoal-400 hover:text-[var(--color-brand-secondary)] transition-colors"
              >
                <Phone
                  size={16}
                  className="text-[var(--color-brand-secondary)] flex-shrink-0"
                  aria-hidden="true"
                />
                +91 70 0123 4567
              </a>
              <div className="flex items-start gap-3 text-sm text-charcoal-400">
                <MapPin
                  size={16}
                  className="text-[var(--color-brand-secondary)] flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>New Delhi, India · Remote-first</span>
              </div>
            </address>

            {/* Socials */}
            <div className="flex items-center gap-3" role="list" aria-label="Social media">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  role="listitem"
                  className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-charcoal-400 hover:text-white hover:bg-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)] transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {(
            [
              { title: "Company", links: footerLinks.company },
              { title: "For Guests", links: footerLinks.forGuests },
              { title: "For Hosts", links: footerLinks.forHosts },
              { title: "Support", links: footerLinks.support },
            ] as const
          ).map(({ title, links }) => (
            <div key={title} className="xl:col-span-1">
              <h3 className="text-white font-semibold text-sm mb-5 tracking-wide">
                {title}
              </h3>
              <ul className="space-y-3" role="list">
                {links.map(({ label, href }) => (
                  <li key={label} role="listitem">
                    <Link
                      href={href}
                      className="text-charcoal-400 text-sm hover:text-[var(--color-brand-secondary)] transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-luxury py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-charcoal-500">
            <p>
              © {currentYear} Wedding With India. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/policies/privacy"
                className="hover:text-charcoal-300 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/policies/terms"
                className="hover:text-charcoal-300 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/policies/cookies"
                className="hover:text-charcoal-300 transition-colors"
              >
                Cookies
              </Link>
              <span className="flex items-center gap-1.5">
                Made with{" "}
                <span className="text-[var(--color-brand-secondary)]" aria-label="love">
                  ♥
                </span>{" "}
                in India
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
