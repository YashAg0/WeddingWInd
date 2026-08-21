import fs from "fs";
import path from "path";

describe("God-Level Technical SEO, GEO & Entity Authority Regression Suite", () => {
  const rootDir = path.resolve(__dirname, "..", "..");

  describe("1. Robots.txt Master Crawler Policy", () => {
    const robotsPath = path.join(rootDir, "app", "robots.ts");
    let robotsContent: string;

    beforeAll(() => {
      robotsContent = fs.readFileSync(robotsPath, "utf8");
    });

    test("robots.ts exists and declares sitemap and host", () => {
      expect(fs.existsSync(robotsPath)).toBe(true);
      expect(robotsContent).toContain("https://weddingwithindia.com/sitemap.xml");
      expect(robotsContent).toContain("https://weddingwithindia.com");
    });

    test("allows major AI search engines and crawler user agents", () => {
      const crawlers = [
        "Googlebot",
        "Bingbot",
        "OAI-SearchBot",
        "OAI-AdsBot",
        "ClaudeBot",
        "Claude-SearchBot",
        "Claude-User",
        "PerplexityBot",
        "Perplexity-User",
      ];
      crawlers.forEach((bot) => {
        expect(robotsContent).toContain(bot);
      });
    });

    test("disallows private and internal dashboard routes", () => {
      const privateRoutes = [
        "/dashboard/",
        "/admin/",
        "/account/",
        "/onboarding/",
        "/api/",
      ];
      privateRoutes.forEach((route) => {
        expect(robotsContent).toContain(route);
      });
    });
  });

  describe("2. Knowledge Graph Entity Schema Integrity", () => {
    test("layout.tsx establishes Organization and WebSite entity @ids without hyperbole", () => {
      const layoutContent = fs.readFileSync(path.join(rootDir, "app", "layout.tsx"), "utf8");
      expect(layoutContent).toContain('"@id": `${APP_URL}/#organization`');
      expect(layoutContent).toContain('"@id": `${APP_URL}/#website`');
      expect(layoutContent).toContain('"@id": `${APP_URL}/founder/tanishq-gupta#person`');
      expect(layoutContent).not.toContain("world's first");
    });

    test("founder page connects Person entity to Organization entity", () => {
      const founderContent = fs.readFileSync(
        path.join(rootDir, "app", "founder", "tanishq-gupta", "page.tsx"),
        "utf8"
      );
      expect(founderContent).toContain('"@id": "https://weddingwithindia.com/founder/tanishq-gupta#person"');
      expect(founderContent).toContain('"@id": "https://weddingwithindia.com/#organization"');
    });
  });

  describe("3. Machine-Readable LLM Discovery", () => {
    test("public/llms.txt and public/llms-full.txt exist and are well-formed", () => {
      const llmsPath = path.join(rootDir, "public", "llms.txt");
      const llmsFullPath = path.join(rootDir, "public", "llms-full.txt");

      expect(fs.existsSync(llmsPath)).toBe(true);
      expect(fs.existsSync(llmsFullPath)).toBe(true);

      const llmsText = fs.readFileSync(llmsPath, "utf8");
      expect(llmsText).toContain("https://weddingwithindia.com");
      expect(llmsText).toContain("/learn/can-foreigners-attend-indian-weddings");
      expect(llmsText).toContain("/destinations/rajasthan");
    });
  });

  describe("4. Educational Answer Guides & Destination Clusters", () => {
    const answerGuides = [
      "can-foreigners-attend-indian-weddings",
      "how-to-attend-an-indian-wedding",
      "indian-wedding-etiquette-for-foreigners",
      "what-to-wear-to-an-indian-wedding",
      "indian-wedding-rituals-explained",
      "indian-wedding-food-guide",
      "indian-wedding-tourism",
      "indian-wedding-experience-cost",
    ];

    test.each(answerGuides)("Answer Guide %s exists with FAQPage and canonical", (slug) => {
      const pagePath = path.join(rootDir, "app", "learn", slug, "page.tsx");
      expect(fs.existsSync(pagePath)).toBe(true);
      const code = fs.readFileSync(pagePath, "utf8");
      expect(code).toContain("FAQPage");
      expect(code).toContain("BreadcrumbList");
      expect(code).toContain("canonical");
    });

    const destinations = ["rajasthan", "goa", "punjab", "kerala", "delhi-ncr", "mumbai"];

    test.each(destinations)("Destination Page %s exists with Place schema and canonical", (slug) => {
      const pagePath = path.join(rootDir, "app", "destinations", slug, "page.tsx");
      expect(fs.existsSync(pagePath)).toBe(true);
      const code = fs.readFileSync(pagePath, "utf8");
      expect(code).toContain("Place");
      expect(code).toContain("BreadcrumbList");
      expect(code).toContain("canonical");
    });
  });
});
