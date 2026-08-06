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

  // Find the last occurrence of </section>
  const lastSectionIndex = content.lastIndexOf('</section>');
  if (lastSectionIndex !== -1) {
    // Only add if not already added to avoid double adding
    const beforeSection = content.substring(lastSectionIndex - 20, lastSectionIndex);
    if (!beforeSection.includes('</div>')) {
      content = content.substring(0, lastSectionIndex) + '      </div>\n      </div>\n    </section>' + content.substring(lastSectionIndex + 10);
      fs.writeFileSync(filePath, content);
      console.log('Fixed', file);
    } else {
      console.log('Already fixed', file);
    }
  }
}
