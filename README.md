# 🎨 Chitra: The Art Guide

**Chitra** (चित्रा) is an interactive visual analysis studio and drawing guide that deconstructs classical and modern artworks into fundamental learning layers: **Geometry**, **Blueprint**, **Contours**, **Flat Values**, and **Nuance**.

---

## 15 Masterpiece Presets Included

The collection features 15 world-renowned public domain masterpieces across multiple periods and movements:

1. **Mona Lisa** — *Leonardo da Vinci (c. 1503)* [High Renaissance]: Sfumato gradations and renaissance atmospheric depth.
2. **Girl with a Pearl Earring** — *Johannes Vermeer (1665)* [Dutch Golden Age]: Minimalist chiaroscuro and single-point specular reflection.
3. **The Starry Night** — *Vincent van Gogh (1889)* [Post-Impressionism]: Rhythmic directional impasto brush arcs.
4. **The Scream** — *Edvard Munch (1893)* [Expressionism]: Steep diagonal perspective and emotional warm/cool color clash.
5. **The Great Wave off Kanagawa** — *Katsushika Hokusai (1831)* [Edo Ukiyo-e]: Fractal wave claws framing Mount Fuji.
6. **The Kiss** — *Gustav Klimt (1907)* [Vienna Secession]: Shimmering decorative gold leaf planes and geometric ornamentation.
7. **Café Terrace at Night** — *Vincent van Gogh (1888)* [Post-Impressionism]: Lantern illumination opposing nocturnal cobblestone blues.
8. **The Birth of Venus** — *Sandro Botticelli (c. 1485)* [Early Renaissance]: Calligraphic undulating line weight and classical balance.
9. **The Night Watch** — *Rembrandt van Rijn (1642)* [Dutch Baroque]: Monumental militia portrait with selective spotlight chiaroscuro.
10. **A Sunday on La Grande Jatte** — *Georges Seurat (1884)* [Pointillism]: Columnar human geometry and optical color division.
11. **Water Lilies** — *Claude Monet (1906)* [Impressionism]: Pure color vibration and horizonless water reflections.
12. **Liberty Leading the People** — *Eugène Delacroix (1830)* [Romanticism]: Pyramidal narrative composition anchoring battlefield energy.
13. **The Swing** — *Jean-Honoré Fragonard (1767)* [Rococo]: Triangular diagonal flight through lush dappled forest foliage.
14. **Fine Wind, Clear Morning (Red Fuji)** — *Katsushika Hokusai (1830)* [Edo Ukiyo-e]: Minimalist 3–4 tonal plane color division.
15. **The Creation of Adam** — *Michelangelo Buonarroti (c. 1512)* [High Renaissance]: Anatomical contours and structural gesture.

Users can also upload custom reference images at any time.

---

## Analysis Phases & Studio Tools

- **Geometry**: Reference at low opacity to sketch fundamental axes, gesture lines, and proportion.
- **Blueprint**: High-contrast boundary contours inverted into clean line-art for structural tracing.
- **Contours**: Real-time edge detection algorithms (Sobel gradient, Laplacian, Binary thresholding).
- **Flat Values**: Posterization and plane simplification using K-Means color clustering and smoothing.
- **Nuance**: Full-fidelity lighting reference to evaluate surface highlights and micro-contrast.
- **Interactive Sketch & Trace Pen**: Artists can draw directly on the canvas with customizable colors (White, Charcoal, Crimson, Cyan, Gold) and stroke widths.
- **Opacity Crossfade Comparison**: Adjust layer opacity from 10% to 100% to evaluate line-work and tonal accuracy against the original painting.

---

## Technical Architecture

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Canvas Engine**: Fabric.js v7 (interactive freehand drawing, responsive viewport scaling, and multi-layer composition)
- **Computer Vision Worker**: Dedicated Web Worker (`imageProcessor.worker.ts`) executing off-thread Sobel, Laplacian, K-Means clustering, and bilateral smoothing in <200ms.
- **Testing**: Vitest test runner (`npm test`)
- **Deployment**: Configured for GitHub Pages via `.github/workflows/deploy.yml` with automated build and artifact deployment.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit tests
npm test

# Build for production
npm run build
```
