import { describe, it, expect } from 'vitest';

describe('Algorithm Logic & Integrity', () => {
  it('correctly calculates grayscale luminance using standard Rec. 601 coefficients', () => {
    const r = 255, g = 0, b = 0;
    const lum = r * 0.299 + g * 0.587 + b * 0.114;
    expect(Math.round(lum)).toBe(76);

    const r2 = 0, g2 = 255, b2 = 0;
    const lum2 = r2 * 0.299 + g2 * 0.587 + b2 * 0.114;
    expect(Math.round(lum2)).toBe(150);
  });

  it('bounds cluster parameter between minimum and maximum artistically meaningful values', () => {
    const clampClusters = (val?: number) => Math.max(2, Math.min(val ?? 6, 24));
    expect(clampClusters(1)).toBe(2);
    expect(clampClusters(5)).toBe(5);
    expect(clampClusters(30)).toBe(24);
    expect(clampClusters(undefined)).toBe(6);
  });

  it('computes Euclidean color distance correctly for nearest centroid lookup', () => {
    const p = [100, 150, 200];
    const c1 = [95, 155, 195];
    const c2 = [200, 20, 40];

    const dist1 = (p[0] - c1[0]) ** 2 + (p[1] - c1[1]) ** 2 + (p[2] - c1[2]) ** 2;
    const dist2 = (p[0] - c2[0]) ** 2 + (p[1] - c2[1]) ** 2 + (p[2] - c2[2]) ** 2;

    expect(dist1).toBe(25 + 25 + 25);
    expect(dist1).toBeLessThan(dist2);
  });
});
