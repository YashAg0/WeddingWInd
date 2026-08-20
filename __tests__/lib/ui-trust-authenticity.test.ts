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
    expect(ctaContent).toContain("Leave with a Story.");
    expect(ctaContent).toContain("photo-1735052712489-f45220126a0c");
    expect(ctaContent).toContain("opacity-80");
    expect(ctaContent).toContain("onError");
  });

  it("ensures wedding detail page only renders reviews when completed with authentic reviews", () => {
    expect(detailPageContent).toContain("wedding.experienceCompleted && Array.isArray(wedding.reviews) && wedding.reviews.length > 0");
    expect(detailPageContent).not.toContain("Be the first to review");
  });

  it("ensures the first 2 listings in featured discovery data are sponsored", () => {
    expect(featuredWeddings[0].sponsored).toBe(true);
    expect(featuredWeddings[1].sponsored).toBe(true);
  });
});
