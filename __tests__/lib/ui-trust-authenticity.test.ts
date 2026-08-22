import fs from "fs";
import path from "path";
import { featuredWeddings, countries } from "@/lib/data";

describe("UI Trust, Authenticity, Sponsored Hierarchy & Image Verification", () => {
  const weddingCardContent = fs.readFileSync(
    path.join(process.cwd(), "components/wedding/WeddingCard.tsx"),
    "utf8"
  );
  const ctaContent = fs.readFileSync(
    path.join(process.cwd(), "components/home/CTASection.tsx"),
    "utf8"
  );
  const countriesContent = fs.readFileSync(
    path.join(process.cwd(), "components/home/Countries.tsx"),
    "utf8"
  );
  const featuredWeddingsContent = fs.readFileSync(
    path.join(process.cwd(), "components/home/FeaturedWeddings.tsx"),
    "utf8"
  );
  const detailPageContent = fs.readFileSync(
    path.join(process.cwd(), "app/weddings/[slug]/page.tsx"),
    "utf8"
  );

  it("ensures WeddingCard has no intrusive 'Photo: Unsplash' overlay strip", () => {
    expect(weddingCardContent).not.toContain("Photo: {visualProfile.photographerName}");
    expect(weddingCardContent).not.toContain("Photo by ");
  });

  it("ensures WeddingCard renders premium luxuryGoldSweep border animation, sponsored-luxury-frame, and dedicated SPONSORED badge", () => {
    expect(weddingCardContent).toContain("✦ SPONSORED");
    expect(weddingCardContent).toContain("luxuryGoldSweep");
    expect(weddingCardContent).toContain("sponsored-luxury-frame");
    expect(weddingCardContent).toContain("prefers-reduced-motion");
  });

  it("ensures FeaturedWeddings strictly sorts SPONSORED listings first", () => {
    expect(featuredWeddingsContent).toContain("sortWeddingsByDiscoveryPriority");
  });

  it("ensures Rajasthan destination does NOT use Taj Mahal / Agra imagery and uses authentic Rajasthan image URL", () => {
    // photo-1524492412937-b28074a5d7da and photo-1609137144813-7d9921338f24 are outdated/Agra photos
    expect(countriesContent).not.toContain("photo-1524492412937-b28074a5d7da");
    expect(countriesContent).not.toContain("photo-1609137144813-7d9921338f24");

    const rajasthanData = countries.find((c) => c.code === "RJ" || c.name === "Rajasthan");
    expect(rajasthanData).toBeDefined();
    expect(rajasthanData?.imageUrl).not.toContain("photo-1524492412937-b28074a5d7da");
    expect(rajasthanData?.imageUrl).not.toContain("photo-1609137144813-7d9921338f24");
    expect(countriesContent).toContain("photo-1603262110263-fb0112e7cc33");
    expect(rajasthanData?.imageUrl).toContain("photo-1603262110263-fb0112e7cc33");
  });

  it("ensures CTA section features a dedicated Indian wedding couple photo with visible opacity and fallback", () => {
    expect(ctaContent).toContain("Come for the Celebration.");
    expect(ctaContent).toContain("Leave with Cherished Memories.");
    expect(ctaContent).toContain("photo-1735052712489-f45220126a0c");
    expect(ctaContent).toContain("opacity-80");
  });

  it("ensures wedding detail page only renders reviews when completed with authentic reviews", () => {
    expect(detailPageContent).toContain("wedding.experienceCompleted && Array.isArray(wedding.reviews) && wedding.reviews.length > 0");
    expect(detailPageContent).not.toContain("Be the first to review");
  });

  it("ensures the first 2 listings in featured discovery data are sponsored", () => {
    expect(featuredWeddings[0].sponsored).toBe(true);
    expect(featuredWeddings[1].sponsored).toBe(true);
  });

  it("ensures the whole WeddingCard is clickable via an absolute stretched Link with accessible label", () => {
    expect(weddingCardContent).toContain("href={`/weddings/${wedding.slug}`}");
    expect(weddingCardContent).toContain("absolute inset-0 z-10 rounded-2xl focus:outline-none focus:ring-2");
    expect(weddingCardContent).toContain("aria-label={`View ${wedding.title} celebration in ${locationDisplay}`}");
  });

  it("ensures the Wishlist Heart button is on z-20 and stops propagation independently without navigating", () => {
    expect(weddingCardContent).toContain("relative z-20");
    expect(weddingCardContent).toContain("e.stopPropagation()");
    expect(weddingCardContent).toContain("toggleWishlist(wedding.id)");
    expect(weddingCardContent).toContain("Remove ${wedding.title} from wishlist");
    expect(weddingCardContent).toContain("Add ${wedding.title} to wishlist");
  });

  it("ensures WeddingCard footer CTA buttons are styled pointer-events-none elements preventing nested anchor traps", () => {
    expect(weddingCardContent).toContain("pointer-events-none group-hover/card:bg-maroon-800");
  });

  it("ensures WeddingCard uses high-density responsive image sizes and explicit aspect ratio to eliminate CLS", () => {
    expect(weddingCardContent).toContain('sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"');
    expect(weddingCardContent).toContain('style={{ aspectRatio: "16/10" }}');
    expect(weddingCardContent).toContain('loading="lazy"');
  });

  it("ensures the global contact email policy defines exactly the 4 official customer-facing addresses", () => {
    const contactPageContent = fs.readFileSync(
      path.join(process.cwd(), "app/contact/page.tsx"),
      "utf8"
    );
    const faqPageContent = fs.readFileSync(
      path.join(process.cwd(), "components/home/FAQ.tsx"),
      "utf8"
    );

    // Single source of truth check
    expect(contactPageContent).toContain("CONTACT_EMAILS.CONTACT");
    expect(contactPageContent).toContain("CONTACT_EMAILS.BOOKINGS");
    expect(contactPageContent).toContain("CONTACT_EMAILS.CAREERS");
    expect(contactPageContent).toContain("CONTACT_EMAILS.FOUNDER");

    expect(faqPageContent).toContain("CONTACT_EMAILS.CONTACT");
    expect(faqPageContent).not.toContain("namaste@weddingwithindia.com");
    expect(contactPageContent).not.toContain("partners@weddingwithindia.com");
    expect(contactPageContent).not.toContain("privacy@weddingwithindia.com");
  });
});
