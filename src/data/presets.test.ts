import { describe, it, expect } from 'vitest';
import { PRESET_ARTWORKS } from './presets';

describe('Masterpiece Presets', () => {
  it('contains 15 classic masterpieces', () => {
    expect(PRESET_ARTWORKS.length).toBe(15);
  });

  it('includes core masterpieces plus newly added classic masterworks', () => {
    const titles = PRESET_ARTWORKS.map(p => p.title.toLowerCase());
    expect(titles.some(t => t.includes('mona lisa'))).toBe(true);
    expect(titles.some(t => t.includes('pearl earring'))).toBe(true);
    expect(titles.some(t => t.includes('starry night'))).toBe(true);
    expect(titles.some(t => t.includes('the scream'))).toBe(true);
    expect(titles.some(t => t.includes('great wave'))).toBe(true);
    expect(titles.some(t => t.includes('the kiss'))).toBe(true);
    expect(titles.some(t => t.includes('café terrace') || t.includes('cafe terrace'))).toBe(true);
    expect(titles.some(t => t.includes('birth of venus'))).toBe(true);
    expect(titles.some(t => t.includes('night watch'))).toBe(true);
    expect(titles.some(t => t.includes('sunday on la grande jatte'))).toBe(true);
    expect(titles.some(t => t.includes('water lilies'))).toBe(true);
    expect(titles.some(t => t.includes('liberty leading'))).toBe(true);
    expect(titles.some(t => t.includes('the swing'))).toBe(true);
    expect(titles.some(t => t.includes('red fuji'))).toBe(true);
    expect(titles.some(t => t.includes('creation of adam'))).toBe(true);
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
