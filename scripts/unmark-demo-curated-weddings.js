/**
 * scripts/unmark-demo-curated-weddings.js
 *
 * Sets isDemo: false on the 21 authentic curated showcase wedding experiences
 * so they are recognized by isWeddingIndexable as public, indexable weddings,
 * included in sitemap.xml, and served with robots: { index: true, follow: true }.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CURATED_SLUGS = [
  "grand-maharaja-wedding",
  "shimla-himalayan-pine-royal-wedding",
  "punjabi-amritsar-golden-wedding",
  "hyderabad-nizam-wedding",
  "uttarakhand-himalayan-meadow-wedding",
  "mumbai-skyline-rooftop-wedding",
  "ladakh-monastery-mountain-wedding",
  "kerala-coastal-christian-matrimony",
  "coorg-coffee-plantation-wedding",
  "andaman-island-tropical-wedding",
  "goan-sunset-beach-nuptials",
  "ahmedabad-heritage-pol-wedding",
  "tamil-brahmin-wedding-madurai",
  "lakeside-rajput-celebration",
  "varanasi-ganges-spiritual-wedding",
  "kolkata-bengali-heritage-wedding",
  "kashmir-dal-lake-houseboat-wedding",
  "ooty-nilgiris-tea-garden-wedding",
  "rajasthan-desert-camp-wedding",
  "pondicherry-french-quarter-wedding",
  "mughal-garden-wedding-agra"
];

async function main() {
  console.log("Updating curated showcase weddings to isDemo: false...");
  
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const result = await prisma.wedding.updateMany({
        where: {
          slug: { in: CURATED_SLUGS }
        },
        data: {
          isDemo: false,
          status: "PUBLISHED"
        }
      });

      console.log(`Successfully updated ${result.count} curated weddings to isDemo: false, status: PUBLISHED.`);

      const verified = await prisma.wedding.findMany({
        where: {
          slug: { in: CURATED_SLUGS }
        },
        select: {
          slug: true,
          title: true,
          isDemo: true,
          status: true
        }
      });

      console.log("\nVerified Updated Weddings:");
      verified.forEach((w, idx) => {
        console.log(`  ${idx + 1}. [${w.status}] isDemo: ${w.isDemo} — ${w.slug} (${w.title})`);
      });

      break;
    } catch (err) {
      console.log(`[Attempt ${attempt}/5] Connection failed: ${err.message}. Retrying in 2s...`);
      if (attempt === 5) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
