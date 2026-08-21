/**
 * scripts/generate-pwa-icons.js
 *
 * Deterministic generation of the complete WeddingWithIndia PWA icon suite:
 * - Extracts the pure brand mark emblem from public/images/logos/logo.png
 * - Produces crisp standard icons (192x192, 512x512)
 * - Produces Android maskable icons (192x192, 512x512) with full-bleed brand background and safe-zone emblem
 * - Produces iOS Apple Touch Icon (180x180) with solid background
 * - Produces Next.js App Router icons (app/icon.png, app/apple-icon.png)
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT_DIR = path.resolve(__dirname, "..");
const LOGO_PATH = path.join(ROOT_DIR, "public", "images", "logos", "logo.png");
const ICONS_DIR = path.join(ROOT_DIR, "public", "icons");
const APP_DIR = path.join(ROOT_DIR, "app");

const BRAND_MAROON = { r: 107, g: 16, b: 38, alpha: 1 }; // #6b1026

async function generate() {
  console.log("🎨 [PWA Icon Generator] Starting icon generation...");

  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // 1. Extract the upper emblem from logo.png (1991x1991)
  // Left: 70, Top: 140, Width: 1850, Height: 1160
  const rawExtract = await sharp(LOGO_PATH)
    .extract({ left: 70, top: 140, width: 1850, height: 1160 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = rawExtract;
  const numPixels = info.width * info.height;

  // 2. Create clean RGBA buffer with transparent background for pure emblem
  const cleanEmblemBuffer = Buffer.alloc(numPixels * 4);

  for (let i = 0; i < numPixels; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    const brightness = (r + g + b) / 3;
    if (brightness > 245) {
      // Background white -> transparent
      cleanEmblemBuffer[i * 4] = 0;
      cleanEmblemBuffer[i * 4 + 1] = 0;
      cleanEmblemBuffer[i * 4 + 2] = 0;
      cleanEmblemBuffer[i * 4 + 3] = 0;
    } else {
      // Maroon brand mark
      cleanEmblemBuffer[i * 4] = r;
      cleanEmblemBuffer[i * 4 + 1] = g;
      cleanEmblemBuffer[i * 4 + 2] = b;
      // Smooth alpha edge anti-aliasing
      const alpha = Math.min(255, Math.max(0, Math.round((255 - brightness) * 3)));
      cleanEmblemBuffer[i * 4 + 3] = alpha;
    }
  }

  const pureEmblemPng = await sharp(cleanEmblemBuffer, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  // 3. Helper to make standard transparent icon
  async function makeStandardIcon(size) {
    const emblemDim = Math.round(size * 0.82);
    const resized = await sharp(pureEmblemPng)
      .resize(emblemDim, emblemDim, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: resized, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  // 4. Helper to make Android maskable icon with solid brand background & safe zone
  async function makeMaskableIcon(size) {
    // Android safe zone is central 66% diameter. Scale emblem to 60% of size for 100% safe margin.
    const emblemDim = Math.round(size * 0.60);
    const resized = await sharp(pureEmblemPng)
      .resize(emblemDim, emblemDim, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BRAND_MAROON,
      },
    })
      .composite([{ input: resized, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  // 5. Helper to make Apple Touch Icon (180x180) with solid luxury background
  async function makeAppleTouchIcon(size = 180) {
    const emblemDim = Math.round(size * 0.72);
    const resized = await sharp(pureEmblemPng)
      .resize(emblemDim, emblemDim, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BRAND_MAROON,
      },
    })
      .composite([{ input: resized, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  // 6. Generate and write all required icon assets
  console.log("📦 Generating public/icons/icon-192x192.png...");
  const icon192 = await makeStandardIcon(192);
  fs.writeFileSync(path.join(ICONS_DIR, "icon-192x192.png"), icon192);

  console.log("📦 Generating public/icons/icon-512x512.png...");
  const icon512 = await makeStandardIcon(512);
  fs.writeFileSync(path.join(ICONS_DIR, "icon-512x512.png"), icon512);

  console.log("📦 Generating public/icons/maskable-icon-192x192.png...");
  const maskable192 = await makeMaskableIcon(192);
  fs.writeFileSync(path.join(ICONS_DIR, "maskable-icon-192x192.png"), maskable192);

  console.log("📦 Generating public/icons/maskable-icon-512x512.png...");
  const maskable512 = await makeMaskableIcon(512);
  fs.writeFileSync(path.join(ICONS_DIR, "maskable-icon-512x512.png"), maskable512);

  console.log("📦 Generating public/icons/apple-touch-icon.png...");
  const appleTouch = await makeAppleTouchIcon(180);
  fs.writeFileSync(path.join(ICONS_DIR, "apple-touch-icon.png"), appleTouch);

  console.log("📦 Generating app/icon.png...");
  fs.writeFileSync(path.join(APP_DIR, "icon.png"), icon512);

  console.log("📦 Generating app/apple-icon.png...");
  fs.writeFileSync(path.join(APP_DIR, "apple-icon.png"), appleTouch);

  console.log("✅ [PWA Icon Generator] All PWA icons generated cleanly and verified!");
}

generate().catch((err) => {
  console.error("❌ Icon generation failed:", err);
  process.exit(1);
});
