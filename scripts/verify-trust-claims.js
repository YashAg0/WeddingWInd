const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log(" PUBLIC TRUST CLAIM AUDIT — WeddingWithIndia");
console.log("==================================================\n");

const SEARCH_DIRS = ["app", "components", "lib"];
const ROOT_DIR = path.resolve(__dirname, "..");

// Unprovable/Forbidden claims that MUST fail the audit
const UNSUPPORTED_PATTERNS = [
  { pattern: /1,400\+/i, label: "Unbacked guest count metric (1,400+)" },
  { pattern: /12,000\+/i, label: "Unbacked guest count metric (12,000+)" },
  { pattern: /80\+/i, label: "Unbacked wedding count metric (80+)" },
  { pattern: /4\.96/i, label: "Unbacked aggregate rating (4.96)" },
  { pattern: /98%/i, label: "Unbacked satisfaction rate (98%)" },
  { pattern: /99\.4%/i, label: "Unbacked satisfaction rate (99.4%)" },
  { pattern: /TripAdvisor/i, label: "Unverified third-party partnership (TripAdvisor)" },
  { pattern: /Booking\.com/i, label: "Unverified third-party partnership (Booking.com)" },
  { pattern: /official partner/i, label: "Unverified official partnership claim" },
  { pattern: /award-winning/i, label: "Unbacked award claim" },
  { pattern: /certified by/i, label: "Unbacked certification claim" },
  { pattern: /guaranteed booking/i, label: "Unbacked booking guarantee" },
  { pattern: /100% Verified/i, label: "Unbacked 100% verified badge" },
  { pattern: /100% verified hosts/i, label: "Unbacked verified hosts claim" },
  { pattern: /Verified Hosts/i, label: "Unbacked verified hosts claim" },
  { pattern: /Verified Experiences/i, label: "Unbacked verified experiences claim" },
  { pattern: /Every listing meets our luxury standard/i, label: "Unbacked luxury standard claim" },
  { pattern: /Every family personally vetted/i, label: "Unbacked vetting guarantee" },
  { pattern: /escrow protected/i, label: "Unbacked escrow financial claim" },
  { pattern: /\b\d+\s+(seats|spots)\s+remaining\b/i, label: "Fake seat scarcity claim" },
  { pattern: /\b\d+\s+guests booked\b/i, label: "Fake guest attendance count" },
];

// Supported database/platform-backed patterns
const SUPPORTED_PATTERNS = [
  { pattern: /22\+\s+Curated Experiences/i, label: "Backed by DB published wedding count", evidence: "Prisma DB count: 23 published weddings" },
  { pattern: /18\s+Partner Cities/i, label: "Backed by DB venue locations", evidence: "Prisma DB locations count: 18 cities" },
  { pattern: /12\+\s+Cultural Regions/i, label: "Backed by DB state/region data", evidence: "Prisma DB regions count: 12 regions" },
  { pattern: /AES-256/i, label: "Backed by platform SSL/Stripe encryption", evidence: "Stripe API & TLS encryption" },
  { pattern: /Fully Booked/i, label: "Supported availability state for showcase inventory", evidence: "Database demo flag / non-bookable state" },
];

// Approved editorial marketing copy patterns
const EDITORIAL_PATTERNS = [
  { pattern: /Handpicked Celebrations/i, label: "Approved editorial header" },
  { pattern: /Handpicked wedding experiences from across India, thoughtfully curated for international guests/i, label: "Approved editorial subtitle" },
  { pattern: /Explore All Weddings/i, label: "Approved navigation CTA" },
  { pattern: /Cultural Wedding Traditions/i, label: "Approved cultural framing" },
  { pattern: /Thoughtfully curated for guests/i, label: "Approved editorial narrative" },
  { pattern: /Guest Guidance/i, label: "Approved capability statement" },
  { pattern: /Helpful information for your wedding experience/i, label: "Approved capability statement" },
  { pattern: /Discover Celebrations/i, label: "Approved editorial tag" },
  { pattern: /Attend an authentic Indian wedding as an honored guest/i, label: "Approved value proposition" },
  { pattern: /Explore Wedding Celebrations/i, label: "Approved page title" },
];

let claimsDetected = 0;
let supportedClaims = 0;
let editorialClaims = 0;
const manualClaims = 0;
let unsupportedClaims = 0;

const claimsTable = [];

function scanFile(filePath) {
  const relPath = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  lines.forEach((lineText, lineIdx) => {
    const lineNum = lineIdx + 1;

    // 1. Check for Unsupported / Forbidden claims
    for (const item of UNSUPPORTED_PATTERNS) {
      if (item.pattern.test(lineText)) {
        claimsDetected++;
        unsupportedClaims++;
        const match = lineText.match(item.pattern);
        const claimStr = match ? match[0] : item.label;

        claimsTable.push({
          file: relPath,
          line: lineNum,
          claim: claimStr,
          classification: "UNSUPPORTED",
          evidence: item.label,
          status: "FAIL",
        });
        console.error(`❌ UNSUPPORTED CLAIM: "${claimStr}" at ${relPath}:${lineNum} (${item.label})`);
      }
    }

    // 2. Check for Supported claims
    for (const item of SUPPORTED_PATTERNS) {
      if (item.pattern.test(lineText)) {
        claimsDetected++;
        supportedClaims++;
        const match = lineText.match(item.pattern);
        const claimStr = match ? match[0] : item.label;

        claimsTable.push({
          file: relPath,
          line: lineNum,
          claim: claimStr,
          classification: "SUPPORTED",
          evidence: item.evidence,
          status: "PASS",
        });
      }
    }

    // 3. Check for Editorial claims
    for (const item of EDITORIAL_PATTERNS) {
      if (item.pattern.test(lineText)) {
        claimsDetected++;
        editorialClaims++;
        const match = lineText.match(item.pattern);
        const claimStr = match ? match[0] : item.label;

        claimsTable.push({
          file: relPath,
          line: lineNum,
          claim: claimStr,
          classification: "EDITORIAL",
          evidence: "Approved brand copy",
          status: "PASS",
        });
      }
    }
  });
}

function traverseDirectory(dir) {
  const fullPath = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(fullPath)) return;

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.join(fullPath, entry.name);
    if (entry.isDirectory()) {
      traverseDirectory(path.relative(ROOT_DIR, res));
    } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
      scanFile(res);
    }
  }
}

for (const d of SEARCH_DIRS) {
  traverseDirectory(d);
}

console.log("\n==================================================");
console.log(" PUBLIC TRUST CLAIM AUDIT SUMMARY");
console.log("==================================================");
console.log(`Claims detected:              ${claimsDetected}`);
console.log(`Supported claims:             ${supportedClaims}`);
console.log(`Editorial claims:             ${editorialClaims}`);
console.log(`Manual verification required: ${manualClaims}`);
console.log(`Unsupported claims:           ${unsupportedClaims}`);
console.log("==================================================\n");

if (claimsTable.length > 0) {
  console.log("--- DETECTED PUBLIC CLAIMS TABLE ---");
  console.table(claimsTable.slice(0, 50)); // Print up to 50 entries
}

if (unsupportedClaims > 0) {
  console.error("\n❌ PUBLIC CLAIMS AUDIT FAILED! Unsupported trust claims detected.");
  process.exit(1);
} else if (claimsDetected === 0) {
  console.error("\n❌ AUDIT WARNING: 0 claims were scanned! Check scanner patterns and directory coverage.");
  process.exit(1);
} else {
  console.log("\n✅ PUBLIC CLAIMS AUDIT PASSED CLEANLY!");
}
