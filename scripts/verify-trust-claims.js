const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log(" WeddingWithIndia — Section A: Public Claims Audit");
console.log("==================================================\n");

const SEARCH_DIRS = ["app", "components", "lib"];
const ROOT_DIR = path.resolve(__dirname, "..");

const CLAIM_PATTERNS = [
  /1,400\+/i,
  /12,000\+/i,
  /80\+/i,
  /4\.96/i,
  /98%/i,
  /TripAdvisor/i,
  /Booking\.com/i,
  /official partner/i,
  /award-winning/i,
  /certified by/i,
  /guaranteed booking/i,
  /Verified, curated, and ready/i,
  /luxury standard/i,
  /100% Verified/i,
  /Verified Hosts/i,
];

let totalClaimsFound = 0;
let invalidClaims = 0;
const provenanceTable = [];

function scanFile(filePath) {
  const relPath = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, "utf8");

  for (const pattern of CLAIM_PATTERNS) {
    if (pattern.test(content)) {
      totalClaimsFound++;
      const match = content.match(pattern);
      const claimText = match ? match[0] : pattern.toString();

      let provable = false;
      let classification = "MARKETING_COPY";

      if (claimText.includes("TripAdvisor") || claimText.includes("Booking.com") || claimText.includes("official partner")) {
        classification = "UNVERIFIED_THIRD_PARTY";
        provable = false;
      }

      provenanceTable.push({
        claim: claimText,
        location: relPath,
        classification,
        provable,
      });

      if (!provable) {
        invalidClaims++;
        console.error(`❌ UNPROVABLE CLAIM DETECTED: "${claimText}" in ${relPath}`);
      }
    }
  }
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

console.log("\n--- PUBLIC CLAIM PROVENANCE TABLE ---");
console.table(provenanceTable);

console.log("==================================================");
console.log(`TOTAL CLAIMS SCANNED:   ${totalClaimsFound}`);
console.log(`UNPROVABLE CLAIMS:      ${invalidClaims}`);
console.log("==================================================");

if (invalidClaims > 0) {
  console.error("\n❌ PUBLIC CLAIMS AUDIT FAILED! Remove or reclassify unprovable claims.");
  process.exit(1);
} else {
  console.log("\n✅ PUBLIC CLAIMS AUDIT PASSED CLEANLY! All claims are provable or zeroed.");
}
