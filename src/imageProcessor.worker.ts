import skmeans from 'skmeans';

type WorkerMessage = {
  type: 'edges' | 'kmeans' | 'difference' | 'blueprint';
  imageData: ImageData;
  params: any;
};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, imageData, params } = e.data;

  try {
    switch (type) {
      case 'edges': {
        const edged = processEdges(imageData, params);
        self.postMessage({ type: 'edges', result: edged });
        break;
      }
      case 'kmeans': {
        const kmeaned = processKMeans(imageData, params);
        self.postMessage({ type: 'kmeans', result: kmeaned });
        break;
      }
      case 'difference': {
        const diffed = processDifference(imageData, params);
        self.postMessage({ type: 'difference', result: diffed });
        break;
      }
      case 'blueprint': {
        const blueprint = processBlueprint(imageData, params);
        self.postMessage({ type: 'blueprint', result: blueprint });
        break;
      }
    }
  } catch (err) {
    console.error('Image processing worker error:', err);
  }
};

// Fast separable smoothing filter for noise reduction before contour/clustering
function fastSmooth(imageData: ImageData, radius = 2): ImageData {
  const { data, width, height } = imageData;
  const temp = new Uint8ClampedArray(data.length);
  const output = new Uint8ClampedArray(data.length);

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, count = 0;
      for (let kx = -radius; kx <= radius; kx++) {
        const nx = x + kx;
        if (nx >= 0 && nx < width) {
          const idx = (y * width + nx) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          count++;
        }
      }
      const outIdx = (y * width + x) * 4;
      temp[outIdx] = r / count;
      temp[outIdx + 1] = g / count;
      temp[outIdx + 2] = b / count;
      temp[outIdx + 3] = data[outIdx + 3];
    }
  }

  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, count = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        const ny = y + ky;
        if (ny >= 0 && ny < height) {
          const idx = (ny * width + x) * 4;
          r += temp[idx];
          g += temp[idx + 1];
          b += temp[idx + 2];
          count++;
        }
      }
      const outIdx = (y * width + x) * 4;
      output[outIdx] = r / count;
      output[outIdx + 1] = g / count;
      output[outIdx + 2] = b / count;
      output[outIdx + 3] = temp[outIdx + 3];
    }
  }

  return new ImageData(output, width, height);
}

function processEdges(imageData: ImageData, params: { algorithm?: string; threshold?: number }) {
  const { data, width, height } = imageData;
  const output = new ImageData(width, height);
  const greyScale = new Uint8ClampedArray(width * height);
  const threshold = params.threshold ?? 40;

  for (let i = 0; i < data.length; i += 4) {
    greyScale[i / 4] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }

  const resultData = new Uint8ClampedArray(width * height);
  const algorithm = params.algorithm || 'sobel';

  if (algorithm === 'threshold') {
    for (let i = 0; i < greyScale.length; i++) {
      resultData[i] = greyScale[i] > threshold ? 255 : 0;
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
        resultData[y * width + x] = Math.abs(sum) > threshold ? 255 : 0;
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
        resultData[idx] = mag > threshold ? 255 : 0;
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

function processKMeans(imageData: ImageData, params: { algorithm?: string; clusters?: number; smoothing?: boolean }) {
  const clustersCount = Math.max(2, Math.min(params.clusters ?? 6, 24));
  let sourceImage = imageData;

  if (params.smoothing || params.algorithm === 'bilateral') {
    sourceImage = fastSmooth(imageData, 2);
  }

  const { data, width, height } = sourceImage;
  const totalPixels = width * height;
  const output = new ImageData(width, height);

  // Subsample up to 10,000 pixels to find representative color clusters quickly
  const maxSamples = 10000;
  const step = Math.max(1, Math.floor(totalPixels / maxSamples));
  const samples: number[][] = [];

  for (let i = 0; i < totalPixels; i += step) {
    const idx = i * 4;
    samples.push([data[idx], data[idx + 1], data[idx + 2]]);
  }

  const res = (skmeans as any)(samples, clustersCount, 'kmpp');
  const centroids: number[][] = res.centroids;

  // Map all pixels in image to nearest cluster centroid
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    let bestDist = Infinity;
    let bestCluster = 0;

    for (let c = 0; c < centroids.length; c++) {
      const cr = centroids[c][0];
      const cg = centroids[c][1];
      const cb = centroids[c][2];
      const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        bestCluster = c;
      }
    }

    const assigned = centroids[bestCluster];
    output.data[idx] = Math.round(assigned[0]);
    output.data[idx + 1] = Math.round(assigned[1]);
    output.data[idx + 2] = Math.round(assigned[2]);
    output.data[idx + 3] = 255;
  }

  return output;
}

function processBlueprint(imageData: ImageData, params: { clusters?: number }) {
  // 1. Fast Smooth
  const smoothed = fastSmooth(imageData, 2);

  // 2. Posterize into tonal planes
  const kmeaned = processKMeans(smoothed, { clusters: params.clusters ?? 5 });

  // 3. Extract boundary contours
  const edged = processEdges(kmeaned, { algorithm: 'sobel', threshold: 25 });

  // 4. Invert edges into crisp blueprint line-art
  const { data, width, height } = edged;
  const output = new ImageData(width, height);

  for (let i = 0; i < data.length; i += 4) {
    const inverted = 255 - data[i];
    output.data[i] = inverted;
    output.data[i + 1] = inverted;
    output.data[i + 2] = inverted;
    output.data[i + 3] = 255;
  }

  return output;
}

function processDifference(imageData: ImageData, params: { drawingData?: ImageData; sensitivity?: number }) {
  const { data, width, height } = imageData;
  const output = new ImageData(width, height);
  const drawingData = params.drawingData?.data;
  const sensitivity = params.sensitivity ?? 30;

  if (!drawingData) {
    return output;
  }

  for (let i = 0; i < data.length; i += 4) {
    if (drawingData[i + 3] > 10) {
      const diffR = Math.abs(data[i] - drawingData[i]);
      const diffG = Math.abs(data[i + 1] - drawingData[i + 1]);
      const diffB = Math.abs(data[i + 2] - drawingData[i + 2]);
      const diff = (diffR + diffG + diffB) / 3;

      if (diff > sensitivity) {
        output.data[i] = 240;
        output.data[i + 1] = 60;
        output.data[i + 2] = 60;
        output.data[i + 3] = 200;
      } else {
        output.data[i] = 50;
        output.data[i + 1] = 200;
        output.data[i + 2] = 120;
        output.data[i + 3] = 120;
      }
    } else {
      output.data[i + 3] = 0;
    }
  }

  return output;
}
