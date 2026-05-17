import skmeans from 'skmeans';

// Simple types for the worker
type WorkerMessage = {
  type: 'edges' | 'kmeans' | 'difference' | 'blueprint';
  imageData: ImageData;
  params: any;
};

ctx: self as any;

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, imageData, params } = e.data;

  switch (type) {
    case 'edges':
      const edged = processEdges(imageData, params);
      self.postMessage({ type: 'edges', result: edged });
      break;
    case 'kmeans':
      const kmeaned = processKMeans(imageData, params);
      self.postMessage({ type: 'kmeans', result: kmeaned });
      break;
    case 'difference':
      const diffed = processDifference(imageData, params);
      self.postMessage({ type: 'difference', result: diffed });
      break;
    case 'blueprint':
      const blueprint = processBlueprint(imageData, params);
      self.postMessage({ type: 'blueprint', result: blueprint });
      break;
  }
};

function bilateralFilter(imageData: ImageData, d: number, sigmaColor: number, sigmaSpace: number) {
  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data.length);
  const radius = Math.floor(d / 2);

  const sigmaColor2 = 2 * sigmaColor * sigmaColor;
  const sigmaSpace2 = 2 * sigmaSpace * sigmaSpace;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let sumR = 0, sumG = 0, sumB = 0, weightSum = 0;
      const r1 = data[idx], g1 = data[idx + 1], b1 = data[idx + 2];

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const ny = y + ky;
          const nx = x + kx;

          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const nidx = (ny * width + nx) * 4;
            const r2 = data[nidx], g2 = data[nidx + 1], b2 = data[nidx + 2];

            const dist2 = kx * kx + ky * ky;
            const colorDist2 = (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;

            const weight = Math.exp(-dist2 / sigmaSpace2) * Math.exp(-colorDist2 / sigmaColor2);

            sumR += r2 * weight;
            sumG += g2 * weight;
            sumB += b2 * weight;
            weightSum += weight;
          }
        }
      }

      output[idx] = sumR / weightSum;
      output[idx + 1] = sumG / weightSum;
      output[idx + 2] = sumB / weightSum;
      output[idx + 3] = data[idx + 3];
    }
  }

  return new ImageData(output, width, height);
}

function processEdges(imageData: ImageData, params: { algorithm: string; threshold: number }) {
  const { data, width, height } = imageData;
  const output = new ImageData(width, height);
  const greyScale = new Uint8ClampedArray(width * height);

  for (let i = 0; i < data.length; i += 4) {
    greyScale[i / 4] = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
  }

  const resultData = new Uint8ClampedArray(width * height);
  const algorithm = params.algorithm || 'sobel';

  if (algorithm === 'threshold') {
    for (let i = 0; i < greyScale.length; i++) {
      resultData[i] = greyScale[i] > params.threshold ? 255 : 0;
    }
  } else if (algorithm === 'laplacian') {
    const kernel = [
      0,  1, 0,
      1, -4, 1,
      0,  1, 0
    ];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            sum += greyScale[(y + ky) * width + (x + kx)] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        resultData[y * width + x] = Math.abs(sum) > params.threshold ? 255 : 0;
      }
    }
  } else {
    // Default Sobel
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const gx =
          -1 * greyScale[idx - width - 1] + 1 * greyScale[idx - width + 1] +
          -2 * greyScale[idx - 1] + 2 * greyScale[idx + 1] +
          -1 * greyScale[idx + width - 1] + 1 * greyScale[idx + width + 1];

        const gy =
          -1 * greyScale[idx - width - 1] - 2 * greyScale[idx - width] - 1 * greyScale[idx - width + 1] +
          1 * greyScale[idx + width - 1] + 2 * greyScale[idx + width] + 1 * greyScale[idx + width + 1];

        const mag = Math.sqrt(gx * gx + gy * gy);
        resultData[idx] = mag > params.threshold ? 255 : 0;
      }
    }
  }

  for (let i = 0; i < resultData.length; i++) {
    const val = resultData[i];
    output.data[i * 4] = val;
    output.data[i * 4 + 1] = val;
    output.data[i * 4 + 2] = val;
    output.data[i * 4 + 3] = 255;
  }

  return output;
}

function processKMeans(imageData: ImageData, params: { algorithm: string; clusters: number; smoothing?: boolean }) {
  let processedImage = imageData;
  if (params.smoothing) {
    processedImage = bilateralFilter(imageData, 5, 50, 50); // Faster d=5
  }

  const { data, width, height } = processedImage;
  const output = new ImageData(width, height);
  
  if (params.algorithm === 'bilateral' && !params.smoothing) {
    return bilateralFilter(imageData, 9, 75, 75);
  }

  const points: number[][] = [];
  for (let i = 0; i < data.length; i += 4) {
    points.push([data[i], data[i + 1], data[i + 2]]);
  }

  const res = (skmeans as any)(points, params.clusters, 'kmpp');
  const clusters = res.centroids;
  const assignments = res.idxs;

  for (let i = 0; i < assignments.length; i++) {
    const clusterIdx = assignments[i];
    const color = clusters[clusterIdx];
    output.data[i * 4] = color[0];
    output.data[i * 4 + 1] = color[1];
    output.data[i * 4 + 2] = color[2];
    output.data[i * 4 + 3] = 255;
  }

  return output;
}

function processBlueprint(imageData: ImageData, params: { clusters: number }) {
  // 1. Bilateral Filter
  const smoothed = bilateralFilter(imageData, 7, 60, 60);

  // 2. K-Means
  const kmeaned = processKMeans(smoothed, { algorithm: 'kmeans', clusters: params.clusters });

  // 3. Edge Detection (Sobel as proxy for Canny)
  const edged = processEdges(kmeaned, { algorithm: 'sobel', threshold: 15 });

  // 4. Invert Edges
  const { data, width, height } = edged;
  const output = new ImageData(width, height);
  for (let i = 0; i < data.length; i += 4) {
    const val = 255 - data[i]; // Invert
    output.data[i] = val;
    output.data[i + 1] = val;
    output.data[i + 2] = val;
    output.data[i + 3] = 255;
  }

  return output;
}

function processDifference(imageData: ImageData, params: { drawingData: ImageData, sensitivity: number }) {
  const { data, width, height } = imageData;
  const drawingData = params.drawingData.data;
  const output = new ImageData(width, height);

  for (let i = 0; i < data.length; i += 4) {
    // Only compare if user has drawn something (alpha > 0)
    if (drawingData[i + 3] > 10) {
      const diffR = Math.abs(data[i] - drawingData[i]);
      const diffG = Math.abs(data[i + 1] - drawingData[i + 1]);
      const diffB = Math.abs(data[i + 2] - drawingData[i + 2]);
      const diff = (diffR + diffG + diffB) / 3;

      if (diff > params.sensitivity) {
        output.data[i] = 255; // Red for difference
        output.data[i + 1] = 0;
        output.data[i + 2] = 0;
        output.data[i + 3] = 200;
      } else {
        output.data[i] = 0;
        output.data[i + 1] = 255; // Green for matches
        output.data[i + 2] = 0;
        output.data[i + 3] = 100;
      }
    } else {
      output.data[i + 3] = 0;
    }
  }

  return output;
}
