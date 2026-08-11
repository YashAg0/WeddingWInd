const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "seed-complete.js");

const content = fs.readFileSync(filePath, "utf8");
const updatedContent = content.replace(
  `qrCodeData: "WWI-PASS-DEMO-1-booking-demo-1",\n          `,
  ``
);

fs.writeFileSync(filePath, updatedContent, "utf8");
console.log("Removed qrCodeData from GuestPass create block in scripts/seed-complete.js");
