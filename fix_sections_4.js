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

  // Match the section tag until the container-luxury div
  const sectionRegex = /(<section[^>]*>)\s*<div className="container-luxury">/;
  const match = content.match(sectionRegex);
  
  if (match) {
    let sectionTag = match[1];
    
    // Extract id and aria-labelledby
    const idMatch = sectionTag.match(/id="([^"]+)"/);
    const ariaMatch = sectionTag.match(/aria-labelledby="([^"]+)"/);
    
    const idAttr = idMatch ? `id="${idMatch[1]}"` : '';
    const ariaAttr = ariaMatch ? `aria-labelledby="${ariaMatch[1]}"` : '';
    
    // Extract className from section
    const classMatch = sectionTag.match(/className="([^"]+)"/);
    let originalClasses = classMatch ? classMatch[1] : '';
    
    // Ensure section-padding is kept, but moved
    if (!originalClasses.includes('section-padding')) {
      originalClasses = 'section-padding ' + originalClasses;
    }
    
    // Also ensure rounded-[2.5rem] is added
    if (!originalClasses.includes('rounded-[2.5rem]')) {
      originalClasses += ' rounded-[2.5rem]';
    }
    
    // Extract style attribute
    const styleMatch = sectionTag.match(/style={{[^}]+}}/);
    const styleAttr = styleMatch ? styleMatch[0] : '';
    
    const newOuterSection = `<section
      ${idAttr}
      className="relative"
      ${ariaAttr}
    >
      <div className="px-5 sm:px-8 lg:px-12 xl:px-16">
        <div 
          className="${originalClasses}"
          ${styleAttr ? '\n          ' + styleAttr : ''}
        >
          <div className="container-luxury">`;
    
    content = content.replace(sectionRegex, newOuterSection);
    
    // Find the last occurrence of </section> and prepend the two closing divs
    const lastSectionIndex = content.lastIndexOf('</section>');
    if (lastSectionIndex !== -1) {
      content = content.substring(0, lastSectionIndex) + '      </div>\n      </div>\n    </section>' + content.substring(lastSectionIndex + 10);
      fs.writeFileSync(filePath, content);
      console.log('Fixed', file);
    }
  } else {
    console.log('Could not match', file);
  }
}
