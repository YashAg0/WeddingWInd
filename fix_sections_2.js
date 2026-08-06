const fs = require('fs');
const path = require('path');

const filesToFix = [
  'FeaturedWeddings.tsx',
  'HowItWorks.tsx',
  'Testimonials.tsx',
  'Countries.tsx',
  'FAQ.tsx'
];

for (const file of filesToFix) {
  const filePath = path.join('components/home', file);
  let content = fs.readFileSync(filePath, 'utf8');

  // We accidentally inserted '\n' literally into the JSX source code last time.
  // We should remove it.
  content = content.replace(/\\n\s*style={{/g, '\n          style={{');
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed', file);
}
