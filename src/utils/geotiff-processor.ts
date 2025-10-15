/**
 * GeoTIFF Processing Utilities
 * Helper functions for processing GeoTIFF data
 */

export interface ProcessedGeoTIFF {
  width: number;
  height: number;
  values: number[][];
  metadata: {
    min: number;
    max: number;
    mean: number;
    noDataValue?: number;
  };
}

/**
 * Process raw GeoTIFF data into a usable format
 */
export function processGeoTIFFData(
  data: ArrayBuffer,
  width: number,
  height: number
): ProcessedGeoTIFF {
  const float32Array = new Float32Array(data);
  const values: number[][] = [];
  
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const value = float32Array[index];
      
      row.push(value);
      
      if (!isNaN(value) && isFinite(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
        sum += value;
        count++;
      }
    }
    values.push(row);
  }

  const mean = count > 0 ? sum / count : 0;

  return {
    width,
    height,
    values,
    metadata: {
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
      mean,
    },
  };
}

/**
 * Create a color scale for visualization
 */
export function createColorScale(
  value: number,
  min: number,
  max: number,
  colorScheme: 'heatmap' | 'grayscale' | 'viridis' = 'heatmap'
): { r: number; g: number; b: number; a: number } {
  // Normalize value to 0-1
  const normalized = max > min ? (value - min) / (max - min) : 0;

  if (colorScheme === 'grayscale') {
    const gray = Math.round(normalized * 255);
    return { r: gray, g: gray, b: gray, a: 255 };
  }

  if (colorScheme === 'viridis') {
    // Viridis color scale approximation
    const r = Math.round(255 * (0.267 + 0.005 * normalized));
    const g = Math.round(255 * (0.005 + 0.570 * normalized));
    const b = Math.round(255 * (0.329 + 0.528 * normalized));
    return { r, g, b, a: 255 };
  }

  // Default heatmap: blue -> green -> yellow -> red
  let r, g, b;
  
  if (normalized < 0.25) {
    const t = normalized / 0.25;
    r = 0;
    g = Math.round(255 * t);
    b = 255;
  } else if (normalized < 0.5) {
    const t = (normalized - 0.25) / 0.25;
    r = 0;
    g = 255;
    b = Math.round(255 * (1 - t));
  } else if (normalized < 0.75) {
    const t = (normalized - 0.5) / 0.25;
    r = Math.round(255 * t);
    g = 255;
    b = 0;
  } else {
    const t = (normalized - 0.75) / 0.25;
    r = 255;
    g = Math.round(255 * (1 - t));
    b = 0;
  }

  return { r, g, b, a: 255 };
}

/**
 * Get interpolated value at fractional coordinates
 */
export function getInterpolatedValue(
  data: ProcessedGeoTIFF,
  x: number,
  y: number
): number | null {
  const x1 = Math.floor(x);
  const y1 = Math.floor(y);
  const x2 = Math.ceil(x);
  const y2 = Math.ceil(y);

  if (x1 < 0 || x2 >= data.width || y1 < 0 || y2 >= data.height) {
    return null;
  }

  const dx = x - x1;
  const dy = y - y1;

  const v11 = data.values[y1][x1];
  const v21 = data.values[y1][x2];
  const v12 = data.values[y2][x1];
  const v22 = data.values[y2][x2];

  // Bilinear interpolation
  const v1 = v11 * (1 - dx) + v21 * dx;
  const v2 = v12 * (1 - dx) + v22 * dx;
  const v = v1 * (1 - dy) + v2 * dy;

  return v;
}

/**
 * Extract region from GeoTIFF
 */
export function extractRegion(
  data: ProcessedGeoTIFF,
  startX: number,
  startY: number,
  width: number,
  height: number
): ProcessedGeoTIFF | null {
  if (
    startX < 0 || startY < 0 ||
    startX + width > data.width ||
    startY + height > data.height
  ) {
    return null;
  }

  const regionValues: number[][] = [];
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let count = 0;

  for (let y = startY; y < startY + height; y++) {
    const row: number[] = [];
    for (let x = startX; x < startX + width; x++) {
      const value = data.values[y][x];
      row.push(value);

      if (!isNaN(value) && isFinite(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
        sum += value;
        count++;
      }
    }
    regionValues.push(row);
  }

  return {
    width,
    height,
    values: regionValues,
    metadata: {
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
      mean: count > 0 ? sum / count : 0,
    },
  };
}

