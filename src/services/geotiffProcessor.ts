/**
 * GeoTIFF Processor Service
 * Processes GeoTIFF data from Google Solar API
 */

export interface GeoTIFFData {
    width: number;
    height: number;
  data: Float32Array | Uint8Array;
    bounds: {
    north: number;
      south: number;
      east: number;
    west: number;
  };
  pixelSize: {
    x: number;
    y: number;
  };
}

export class GeoTIFFProcessor {
  /**
   * Parse GeoTIFF data from base64 encoded string
   */
  static async parseGeoTIFF(base64Data: string): Promise<GeoTIFFData> {
    try {
      // Decode base64
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // For now, return mock data structure
      // In production, you would use a library like geotiff.js
      return {
        width: 256,
        height: 256,
        data: new Float32Array(256 * 256),
        bounds: {
          north: 0,
          south: 0,
          east: 0,
          west: 0
        },
        pixelSize: {
          x: 0.00001,
          y: 0.00001
        }
      };
    } catch (error) {
      console.error('GeoTIFF parsing error:', error);
      throw new Error('Failed to parse GeoTIFF data');
    }
  }

  /**
   * Extract pixel value at specific coordinates
   */
  static getPixelValue(
    geoTIFF: GeoTIFFData,
    lat: number,
    lng: number
  ): number | null {
    try {
      // Calculate pixel coordinates
      const x = Math.floor(
        ((lng - geoTIFF.bounds.west) / (geoTIFF.bounds.east - geoTIFF.bounds.west)) *
          geoTIFF.width
      );
      const y = Math.floor(
        ((geoTIFF.bounds.north - lat) / (geoTIFF.bounds.north - geoTIFF.bounds.south)) *
          geoTIFF.height
      );

      if (x < 0 || x >= geoTIFF.width || y < 0 || y >= geoTIFF.height) {
        return null;
      }

      const index = y * geoTIFF.width + x;
      return geoTIFF.data[index];
    } catch (error) {
      console.error('Pixel value extraction error:', error);
      return null;
    }
  }

  /**
   * Convert GeoTIFF to image data URL for visualization
   */
  static toImageDataURL(
    geoTIFF: GeoTIFFData,
    colorScale: (value: number) => { r: number; g: number; b: number; a: number }
  ): string {
    const canvas = document.createElement('canvas');
    canvas.width = geoTIFF.width;
    canvas.height = geoTIFF.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const imageData = ctx.createImageData(geoTIFF.width, geoTIFF.height);

    for (let i = 0; i < geoTIFF.data.length; i++) {
      const value = geoTIFF.data[i];
      const color = colorScale(value);
      const pixelIndex = i * 4;
      
      imageData.data[pixelIndex] = color.r;
      imageData.data[pixelIndex + 1] = color.g;
      imageData.data[pixelIndex + 2] = color.b;
      imageData.data[pixelIndex + 3] = color.a;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  /**
   * Calculate statistics for GeoTIFF data
   */
  static calculateStatistics(geoTIFF: GeoTIFFData): {
    min: number;
    max: number;
    mean: number;
    median: number;
    std: number;
  } {
    const values = Array.from(geoTIFF.data).filter(v => !isNaN(v) && isFinite(v));
    
    if (values.length === 0) {
      return { min: 0, max: 0, mean: 0, median: 0, std: 0 };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);

    return { min, max, mean, median, std };
  }
}

