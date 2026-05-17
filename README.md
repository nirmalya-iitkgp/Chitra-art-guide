# 🎨 Chitra: The art guide

**Chitra** (चित्रा) is an advanced drawing studio that deconstructs complex visuals into logical learning layers. It helps artists master the "Arty Eye" by isolating geometry, contours, and tonal values.

---

## 🚀 Technical Core

### 🧠 Computer Vision Engine
- **OpenCV.js Integration**: Real-time image processing directly in the browser.
- **Edge Detection**: Custom Sobel and Laplacian kernels for contour extraction.
- **Tonal Decomposition**: K-Means clustering and Bilateral filtering for value mapping.
- **Dynamic Thresholding**: Real-time adjustment of visual deconstruction intensity.

### 🖌️ Creative Suite
- **Fabric.js Canvas**: A powerful object-based canvas for non-destructive drawing.
- **Multi-Phase Workflow**:
  - `GEOMETRY`: Establishing the skeleton and perspective.
  - `CONTOURS`: Defining the boundaries of form.
  - `FLAT VALUES`: Mapping light regions.
  - `NUANCE`: Polished rendering and subtle transitions.
- **Precision Interaction**: Smooth zoom (mouse wheel + UI) and responsive brush physics.

### 🎨 Design System
- **Typography**: `Montserrat` (Sans) for UI precision & `Cormorant Garamond` (Serif) for artistic elegance.
- **Aesthetic**: Minimalist Dark Mode (`#0e0e10`) with Indigo accents.
- **Responsiveness**: Fluid layout that adapts from Ultra-Wide monitors to Mobile viewports.

---

## 🛠️ Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4
- **Animation**: Motion (framer-motion)
- **Icons**: Lucide React
- **Canvas**: Fabric.js v6
- **ML/CV**: OpenCV.js

---

## 🗺️ Logical Learning Path

Chitra isn't just a tool; it's a teacher. By following the sidebar phases, users are forced to ignore detail and focus on **Structure → Boundary → Value**.

1. **Upload Subject**: Start with any master painting or photograph.
2. **Phase 1 (Geometry)**: Fade the original and draw the basic shapes.
3. **Phase 2 (Contours)**: Use the edge-map to find the "line."
4. **Phase 3 (Values)**: Use the painterly abstraction to see blocks of light/dark.
5. **Phase 4 (Nuance)**: Finalize the piece with the original at full opacity.

---

*Built with ❤️ in AI Studio*
