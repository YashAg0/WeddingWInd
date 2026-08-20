import fs from 'fs';
import path from 'path';
import { CURATED_WEDDING_IMAGES } from '@/lib/wedding-images';

describe('Cultural Harmony & Etiquette Section Visual Integrity', () => {
  const culturalCodePath = path.join(process.cwd(), 'components/home/CulturalCode.tsx');
  const culturalCodeContent = fs.readFileSync(culturalCodePath, 'utf-8');

  it('uses an authentic Indian wedding photograph from images.unsplash.com', () => {
    expect(culturalCodeContent).toContain('images.unsplash.com');
    expect(culturalCodeContent).toMatch(/photo-[a-zA-Z0-9_-]+/);
  });

  it('ensures the background image ID has zero collisions with any wedding inventory photo', () => {
    const bgPhotoMatch = culturalCodeContent.match(/photo-[a-zA-Z0-9_-]+/);
    expect(bgPhotoMatch).not.toBeNull();
    const bgPhotoId = bgPhotoMatch![0];

    // Collect all photo IDs in CURATED_WEDDING_IMAGES
    const curatedPhotoIds = new Set(Object.values(CURATED_WEDDING_IMAGES).map(w => w.photoId));
    
    // Verify zero collision
    expect(curatedPhotoIds.has(bgPhotoId)).toBe(false);
  });

  it('preserves all copy and principle cards verbatim', () => {
    expect(culturalCodeContent).toContain('The Guest Code');
    expect(culturalCodeContent).toContain('Come as a guest. Leave with a memory.');
    expect(culturalCodeContent).toContain('Indian weddings are full of family, tradition, and joy');
    expect(culturalCodeContent).toContain('Guest Guide');
    expect(culturalCodeContent).toContain('You Are Welcome');
    expect(culturalCodeContent).toContain('Respect the Moment');
    expect(culturalCodeContent).toContain('Dress with Confidence');
    expect(culturalCodeContent).toContain('Stay Curious');
  });

  it('features translucent frosted glass styling on principle cards', () => {
    expect(culturalCodeContent).toContain('backdrop-blur');
    expect(culturalCodeContent).toContain('border-white/');
  });
});
