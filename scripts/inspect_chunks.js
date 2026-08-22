const fs = require("fs");
const path = require("path");

function getFiles(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) results = results.concat(getFiles(p));
    else results.push({ name: file, path: p, sizeKb: parseFloat((stat.size / 1024).toFixed(1)) });
  });
  return results;
}

const files = getFiles(".next/static/chunks")
  .filter(f => f.name.endsWith(".js"))
  .sort((a, b) => b.sizeKb - a.sizeKb)
  .slice(0, 15);

console.log("=== TOP 15 LARGEST JAVASCRIPT CHUNKS IN PRODUCTION BUILD ===");
files.forEach(f => {
  const content = fs.readFileSync(f.path, "utf8");
  const markers = [];
  if (content.includes("@clerk")) markers.push("@clerk");
  if (content.includes("framer-motion")) markers.push("framer-motion");
  if (content.includes("lucide-react") || content.includes("createLucideIcon")) markers.push("lucide-react");
  if (content.includes("sonner")) markers.push("sonner");
  if (content.includes("tailwind-merge")) markers.push("tailwind-merge");
  if (content.includes("next/dist/compiled/react-dom")) markers.push("react-dom");
  if (content.includes("next/dist/client")) markers.push("next/client");
  if (content.includes("zod")) markers.push("zod");
  if (content.includes("canvas-confetti")) markers.push("canvas-confetti");

  console.log(`- ${f.name.padEnd(24)}: ${f.sizeKb.toFixed(1)} KB [${markers.join(", ") || "app code"}]`);
});
