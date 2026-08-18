const fs = require("fs");
const path = require("path");

const seedFilePath = path.join(__dirname, "seed-complete.js");
const content = fs.readFileSync(seedFilePath, "utf8");

const dataStartIndex = content.indexOf("    const demoWeddingsData = [");
const dataEndIndex = content.indexOf("    ];\n\n        // ------------------------------------------------------------------------");

if (dataStartIndex === -1 || dataEndIndex === -1) {
  console.error("Could not find demoWeddingsData array!");
  process.exit(1);
}

const sec3Start = content.indexOf("    console.log(\"\\n3. Seeding Connected Demo Weddings & Events...\");");
const sec4Start = content.indexOf("    console.log(\"\\n4. Seeding Demo Bookings, Passes & Preparations...\");");

const demoWeddingsArrayCode = content.slice(dataStartIndex, dataEndIndex + 6);

const loopCode = `

    for (const wData of demoWeddingsData) {
      // Find or create host user & couple profile
      const hUser = await prisma.user.upsert({
        where: { email: wData.hostEmail },
        update: { role: "COUPLE", status: "ACTIVE" },
        create: {
          clerkUserId: \`user_host_\${wData.id}_seed\`,
          email: wData.hostEmail,
          name: wData.hostCoupleName,
          role: "COUPLE",
          status: "ACTIVE",
          avatar: wData.hostAvatar,
        },
      });

      const hProfile = await prisma.coupleProfile.upsert({
        where: { userId: hUser.id },
        update: {
          weddingDate: wData.date,
          weddingLocation: wData.location,
          familyBio: \`\${wData.hostCoupleName} welcome global travelers to experience authentic \${wData.ethnicity} wedding traditions.\`,
        },
        create: {
          userId: hUser.id,
          weddingDate: wData.date,
          weddingLocation: wData.location,
          expectedGuests: 200,
          languagesSpoken: "English, Hindi",
          photographyRules: "Allowed",
          familyBio: \`\${wData.hostCoupleName} welcome global travelers to experience authentic \${wData.ethnicity} wedding traditions.\`,
        },
      });

      // Match existing wedding by slug or ID to prevent P2002 slug collision
      const existingBySlug = await prisma.wedding.findUnique({ where: { slug: wData.slug } });
      const targetId = existingBySlug ? existingBySlug.id : wData.id;

      // Clear old events and traditions to guarantee zero stale generic events
      await prisma.weddingEvent.deleteMany({ where: { weddingId: targetId } });
      await prisma.weddingTradition.deleteMany({ where: { weddingId: targetId } });

      const wedding = await prisma.wedding.upsert({
        where: { id: targetId },
        update: {
          title: wData.title,
          slug: wData.slug,
          description: wData.description,
          location: wData.location,
          category: wData.category,
          religion: wData.religion || "Hindu",
          region: wData.region || null,
          community: wData.community || null,
          foodContext: wData.foodContext || null,
          dressExpectations: wData.dressExpectations || null,
          guestRules: wData.guestRules || null,
          etiquetteNotes: wData.etiquetteNotes || null,
          date: wData.date,
          pricePerGuest: wData.pricePerGuest,
          mainImageUrl: wData.mainImageUrl,
          status: wData.status,
          featured: wData.featured,
          sponsored: wData.sponsored ?? false,
          isDemo: true,
          capacity: 20,
          theme: wData.theme,
          dressCode: wData.dressCode,
          ethnicity: wData.ethnicity,
          events: {
            create: (wData.events || []).map((e) => ({
              name: e.name,
              description: e.description,
              date: wData.date,
              startTime: e.startTime || "17:00",
              endTime: e.endTime || "22:00",
              location: wData.location,
            })),
          },
          traditions: {
            create: (wData.traditions || []).map((t) => ({
              name: t.name,
              description: t.description,
            })),
          },
        },
        create: {
          id: targetId,
          hostCoupleId: hProfile.id,
          slug: wData.slug,
          title: wData.title,
          description: wData.description,
          location: wData.location,
          category: wData.category,
          religion: wData.religion || "Hindu",
          region: wData.region || null,
          community: wData.community || null,
          foodContext: wData.foodContext || null,
          dressExpectations: wData.dressExpectations || null,
          guestRules: wData.guestRules || null,
          etiquetteNotes: wData.etiquetteNotes || null,
          date: wData.date,
          pricePerGuest: wData.pricePerGuest,
          capacity: 20,
          mainImageUrl: wData.mainImageUrl,
          status: wData.status,
          featured: wData.featured,
          sponsored: wData.sponsored ?? false,
          isDemo: true,
          theme: wData.theme,
          dressCode: wData.dressCode,
          ethnicity: wData.ethnicity,
          gallery: {
            create: [
              { imageUrl: wData.mainImageUrl, order: 0 },
            ],
          },
          events: {
            create: (wData.events || []).map((e) => ({
              name: e.name,
              description: e.description,
              date: wData.date,
              startTime: e.startTime || "17:00",
              endTime: e.endTime || "22:00",
              location: wData.location,
            })),
          },
          traditions: {
            create: (wData.traditions || []).map((t) => ({
              name: t.name,
              description: t.description,
            })),
          },
        },
      });

      console.log(\`   ✓ Curated Wedding Created/Updated: "\${wedding.title}" (\${wedding.slug}) — religion: \${wedding.religion}, region: \${wedding.region}\`);
    }\n\n`;

const beforeSec3 = content.slice(0, sec3Start);
const afterSec3 = content.slice(sec4Start);

const finalSeedContent = beforeSec3 + "    console.log(\"\\n3. Seeding Connected Demo Weddings & Events...\");\n\n" + demoWeddingsArrayCode + loopCode + afterSec3;

fs.writeFileSync(seedFilePath, finalSeedContent, "utf8");
console.log("Successfully updated fix-seed-loop.js and rebuilt seed-complete.js!");
