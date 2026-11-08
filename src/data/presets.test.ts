import { describe, it, expect } from 'vitest';
import { PRESET_ARTWORKS } from './presets';

describe('Masterpiece Presets', () => {
  it('contains at least 5 classic masterpieces', () => {
    expect(PRESET_ARTWORKS.length).toBeGreaterThanOrEqual(5);
  });

  it('includes Mona Lisa, Girl with a Pearl Earring, The Starry Night, The Scream, and The Great Wave', () => {
    const titles = PRESET_ARTWORKS.map(p => p.title.toLowerCase());
    expect(titles.some(t => t.includes('mona lisa'))).toBe(true);
    expect(titles.some(t => t.includes('pearl earring'))).toBe(true);
    expect(titles.some(t => t.includes('starry night'))).toBe(true);
    expect(titles.some(t => t.includes('scream'))).toBe(true);
    expect(titles.some(t => t.includes('great wave'))).toBe(true);
  });

  it('has non-empty identifiers, artists, and valid image sources for every preset', () => {
    for (const preset of PRESET_ARTWORKS) {
      expect(preset.id).toBeTruthy();
      expect(preset.title).toBeTruthy();
      expect(preset.artist).toBeTruthy();
      expect(preset.year).toBeTruthy();
      expect(preset.src).toBeTruthy();
      expect(typeof preset.src).toBe('string');
      expect(preset.description).toBeTruthy();
      expect(preset.focusTip).toBeTruthy();
    }
  });

  it('has unique IDs for each preset', () => {
    const ids = PRESET_ARTWORKS.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
