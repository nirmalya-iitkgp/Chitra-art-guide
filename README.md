# 🎨 Chitra: The Art Guide

**Chitra** (चित्रा) is a drawing studio and visual analysis guide that deconstructs complex artworks into fundamental learning layers: **Geometry**, **Blueprint**, **Contours**, **Flat Values**, and **Nuance**.

---

## Unified Home Page & Masterpiece Presets

The app opens directly to the **Home Page Gallery**, unifying preset masterpiece selection and custom image upload:
- **Masterpiece Presets**: Mona Lisa, Girl with a Pearl Earring, The Starry Night, The Scream, and The Great Wave off Kanagawa.
- **Custom Image Upload**: Direct drag-and-drop or file browsing for personal reference photos.
- **Navigation**: Switch between the Home Page and Drawing Studio via the sidebar navigation or top bar "Artworks Home" button.


---

## Analysis Phases

- **Geometry**: Low-opacity reference to sketch fundamental axes, gesture, and proportion.
- **Blueprint**: Inverted threshold contours for line-art transfer and boundary tracing.
- **Contours**: Real-time edge detection algorithms (Sobel gradient, Laplacian, Binary thresholding).
- **Flat Values**: Posterization and plane simplification using K-Means color clustering and bilateral smoothing.
- **Nuance**: High-fidelity full-color view to evaluate surface highlights and micro-contrast.

---

## Technical Architecture

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Canvas Engine**: Fabric.js
- **Image Processing**: Dedicated Web Worker (`imageProcessor.worker.ts`) executing off-thread Sobel, Laplacian, K-Means clustering, and bilateral filters without UI blocking.
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
