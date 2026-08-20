import {
  CURATED_WEDDING_IMAGES,
  CANONICAL_COUPLE_NAMES,
} from "@/lib/wedding-images";
import { featuredWeddings } from "@/lib/data";
import { toWeddingDTO } from "@/lib/wedding-dto";
import fs from "fs";
import path from "path";

describe("Wedding Visual Profile & Canonical Image Consistency", () => {
  const entries = Object.entries(CURATED_WEDDING_IMAGES);

  test("CURATED_WEDDING_IMAGES contains at least 21 distinct celebration visual profiles", () => {
    expect(entries.length).toBeGreaterThanOrEqual(21);
  });

  test("Exact 9 canonical image URLs and photo IDs match user specifications verbatim", () => {
    const expectedCanonical9 = [
      {
        slug: "rajasthan-royal-family-celebration",
        couple: "Devika & Kaber Singhania",
        photoId: "premium_photo-1691030255435-c1f4c3f5542e",
        imageUrl: "https://plus.unsplash.com/premium_photo-1691030255435-c1f4c3f5542e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        slug: "shimla-himalayan-meadow-celebration",
        couple: "Vikramaditya & Gayatri",
        photoId: "photo-1694712282503-0d6dc921cfdd",
        imageUrl: "https://images.unsplash.com/photo-1694712282503-0d6dc921cfdd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        slug: "punjabi-sikh-anand-karaj-experience",
        couple: "Gurpreet & Harleen Dhillon",
        photoId: "photo-1671531776382-f32dff368120",
        imageUrl: "https://images.unsplash.com/photo-1671531776382-f32dff368120?q=80&w=734&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        slug: "hyderabad-nizam-wedding",
        couple: "Zaid & Nusrat Farooqui",
        photoId: "photo-1726694064556-c9565e8e81c9",
        imageUrl: "https://images.unsplash.com/photo-1726694064556-c9565e8e81c9?q=80&w=696&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        slug: "kerala-coastal-christian-matrimony",
        couple: "Karan & Meera Nambiar",
        photoId: "photo-1581704723043-70c2216277de",
        imageUrl: "https://images.unsplash.com/photo-1581704723043-70c2216277de?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        slug: "goan-sunset-beach-nuptials",
        couple: "Rohan & Alisha D'Souza",
        photoId: "photo-1728348471845-c7ffa602161a",
        imageUrl: "https://images.unsplash.com/photo-1728348471845-c7ffa602161a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        slug: "kashmir-dal-lake-houseboat-wedding",
        couple: "Tariq & Bushra Dar",
        photoId: "photo-1719857646787-38c9c5f79312",
        imageUrl: "https://images.unsplash.com/photo-1719857646787-38c9c5f79312?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        slug: "uttarakhand-himalayan-meadow-wedding",
        couple: "Devendra & Smriti Rawat",
        photoId: "photo-1648724145806-2dd46cd02ea6",
        imageUrl: "https://images.unsplash.com/photo-1648724145806-2dd46cd02ea6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        slug: "coorg-coffee-plantation-wedding",
        couple: "Bopanna & Thanusha Muttappa",
        photoId: "photo-1515766024017-689e434ef22b",
        imageUrl: "https://images.unsplash.com/photo-1515766024017-689e434ef22b?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ];

    for (const item of expectedCanonical9) {
      const profile = CURATED_WEDDING_IMAGES[item.slug];
      expect(profile).toBeDefined();
      expect(profile.photoId).toBe(item.photoId);
      expect(profile.imageUrl).toBe(item.imageUrl);
      expect(CANONICAL_COUPLE_NAMES[item.slug]).toBe(item.couple);
    }
  });

  test("All unique slugs map to distinct photo IDs without duplicate imagery across different listings", () => {
    const photoIdToSlugs = new Map<string, string[]>();

    const knownAliases: Record<string, string> = {
      "rajasthan-royal-family-celebration": "grand-maharaja-wedding",
      "shimla-himalayan-meadow-celebration": "shimla-himalayan-pine-royal-wedding",
      "punjabi-sikh-anand-karaj-experience": "punjabi-amritsar-golden-wedding",
      "kerala-coastal-christian-celebration": "kerala-coastal-christian-matrimony",
      "goa-coastal-family-wedding": "goan-sunset-beach-nuptials",
      "gujarat-jain-family-matrimony": "ahmedabad-heritage-pol-wedding",
    };

    for (const [slug, profile] of entries) {
      const existing = photoIdToSlugs.get(profile.photoId) || [];
      existing.push(slug);
      photoIdToSlugs.set(profile.photoId, existing);
    }

    const conflicts: string[] = [];
    for (const [photoId, slugs] of photoIdToSlugs.entries()) {
      const canonicals = new Set(slugs.map((s) => knownAliases[s] || s));
      if (canonicals.size > 1) {
        conflicts.push(`Duplicate photoId ${photoId} used across distinct celebrations: ${Array.from(canonicals).join(", ")}`);
      }
    }

    expect(conflicts).toEqual([]);
  });

  test("All primary image URLs are unique across distinct celebrations", () => {
    const knownAliases: Record<string, string> = {
      "rajasthan-royal-family-celebration": "grand-maharaja-wedding",
      "shimla-himalayan-meadow-celebration": "shimla-himalayan-pine-royal-wedding",
      "punjabi-sikh-anand-karaj-experience": "punjabi-amritsar-golden-wedding",
      "kerala-coastal-christian-celebration": "kerala-coastal-christian-matrimony",
      "goa-coastal-family-wedding": "goan-sunset-beach-nuptials",
      "gujarat-jain-family-matrimony": "ahmedabad-heritage-pol-wedding",
    };

    const urlToSlugs = new Map<string, string[]>();
    for (const [slug, profile] of entries) {
      const existing = urlToSlugs.get(profile.imageUrl) || [];
      existing.push(slug);
      urlToSlugs.set(profile.imageUrl, existing);
    }

    const conflicts: string[] = [];
    for (const [url, slugs] of urlToSlugs.entries()) {
      const canonicals = new Set(slugs.map((s) => knownAliases[s] || s));
      if (canonicals.size > 1) {
        conflicts.push(`Duplicate imageUrl ${url} used across distinct celebrations: ${Array.from(canonicals).join(", ")}`);
      }
    }

    expect(conflicts).toEqual([]);
  });

  test("Every visual profile contains complete photographer attribution & metadata", () => {
    for (const [, profile] of entries) {
      expect(profile.photoId).toBeTruthy();
      expect(profile.photoId.startsWith("photo-") || profile.photoId.startsWith("premium_photo-")).toBe(true);
      expect(profile.imageUrl).toBeTruthy();
      expect(profile.imageUrl.startsWith("https://images.unsplash.com/") || profile.imageUrl.startsWith("https://plus.unsplash.com/")).toBe(true);
      expect(profile.photographerName).toBeTruthy();
      expect(profile.photographerUrl).toBeTruthy();
      expect(profile.photographerUrl.includes("unsplash.com") || profile.photographerUrl.includes("weddingwithindia.com")).toBe(true);
      expect(profile.unsplashUrl).toBeTruthy();
      expect(profile.altText).toBeTruthy();
      expect(profile.searchContext).toBeTruthy();
    }
  });

  test("Static featured weddings in lib/data.ts have 100% unique primary image URLs", () => {
    const urls = featuredWeddings.map((w) => w.imageUrl);
    const uniqueUrls = new Set(urls);
    expect(uniqueUrls.size).toBe(featuredWeddings.length);
  });

  test("Database seed DEMO_WEDDINGS in scripts/seed-complete.js have 100% unique primary images", () => {
    const seedPath = path.join(process.cwd(), "scripts/seed-complete.js");
    const seedContent = fs.readFileSync(seedPath, "utf-8");
    const start = seedContent.indexOf("const DEMO_WEDDINGS = [");
    const end = seedContent.indexOf("async function seedMasterData()");
    const code = seedContent.slice(start, end).trim();

    const fn = new Function(`${code}; return DEMO_WEDDINGS;`);
    const demoWeddings: any[] = fn();

    const imageMap = new Map<string, string>();
    const duplicates: string[] = [];

    for (const w of demoWeddings) {
      const existing = imageMap.get(w.mainImageUrl);
      if (existing) {
        duplicates.push(`Image ${w.mainImageUrl} shared between "${existing}" and "${w.title}"`);
      } else {
        imageMap.set(w.mainImageUrl, w.title);
      }
    }

    expect(duplicates).toEqual([]);
    expect(demoWeddings.length).toBe(21);
  });

  test("toWeddingDTO guarantees 100% coverImage === coupleImage === imageUrl and hostName === coupleName", () => {
    const rawMock = {
      id: "mock-w1",
      slug: "grand-maharaja-wedding",
      title: "Rajasthan Royal Heritage Celebration",
      location: "Jodhpur, Rajasthan",
      isDemo: true,
    };

    const dto = toWeddingDTO(rawMock);
    const expectedImage = CURATED_WEDDING_IMAGES["grand-maharaja-wedding"].imageUrl;
    const expectedCouple = CANONICAL_COUPLE_NAMES["grand-maharaja-wedding"];

    expect(dto.imageUrl).toBe(expectedImage);
    expect(dto.coupleImage).toBe(expectedImage);
    expect(dto.hostAvatar).toBe(expectedImage);
    expect(dto.gallery[0]).toBe(expectedImage);
    expect(dto.coupleName).toBe(expectedCouple);
    expect(dto.hostName).toBe(expectedCouple);
    expect(dto.imageMeta.photoId).toBe(CURATED_WEDDING_IMAGES["grand-maharaja-wedding"].photoId);
  });

  test("Verified real wedding photography overrides curated stock fallback", () => {
    const verifiedMock = {
      id: "verified-real-w1",
      slug: "grand-maharaja-wedding",
      title: "Verified Real Wedding",
      mainImageUrl: "https://cdn.weddingwithindia.com/hosts/couple-real-upload-123.jpg",
      isVerified: true,
      status: "VERIFIED",
      isDemo: false,
    };

    const dto = toWeddingDTO(verifiedMock);
    expect(dto.imageUrl).toBe("https://cdn.weddingwithindia.com/hosts/couple-real-upload-123.jpg");
    expect(dto.coupleImage).toBe("https://cdn.weddingwithindia.com/hosts/couple-real-upload-123.jpg");
  });

  test("next.config.ts configures all external image hosts used by canonical profiles including plus.unsplash.com", () => {
    const nextConfigPath = path.join(process.cwd(), "next.config.ts");
    const nextConfigContent = fs.readFileSync(nextConfigPath, "utf-8");

    // Extract remotePatterns hostnames from next.config.ts
    const hostnameMatches = [...nextConfigContent.matchAll(/hostname:\s*["']([^"']+)["']/g)].map(m => m[1]);
    const allowedHosts = new Set(hostnameMatches);

    expect(allowedHosts.has("images.unsplash.com")).toBe(true);
    expect(allowedHosts.has("plus.unsplash.com")).toBe(true);

    // Verify all canonical images in CURATED_WEDDING_IMAGES belong to configured hosts
    for (const [slug, profile] of Object.entries(CURATED_WEDDING_IMAGES)) {
      const url = new URL(profile.imageUrl);
      expect(allowedHosts.has(url.hostname)).toBe(true);
    }

    // Verify CSP img-src contains both images.unsplash.com and plus.unsplash.com
    expect(nextConfigContent).toContain("https://images.unsplash.com");
    expect(nextConfigContent).toContain("https://plus.unsplash.com");
  });
});
