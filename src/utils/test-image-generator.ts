/**
 * Test Image Generator
 * Generates realistic test image data for testing upload and storage functionality
 */

export interface TestImageData {
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  content: string; // Base64 encoded test image
}

export class TestImageGenerator {
  /**
   * Generate a simple test image as base64
   */
  private static generateTestImage(width: number = 800, height: number = 600, text: string = "Test Image"): string {
    // Create a simple SVG image as base64
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="white" stroke="#ddd" stroke-width="2"/>
        <text x="${width/2}" y="${height/2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#333">
          ${text}
        </text>
        <text x="${width/2}" y="${height/2 + 30}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#666">
          ${width}x${height} - Test Upload
        </text>
      </svg>
    `;
    
    return btoa(svg);
  }

  /**
   * Generate test image data for a specific field
   */
  static generateTestImages(
    surveyId: string,
    section: string,
    field: string,
    count: number = 2
  ): TestImageData[] {
    const images: TestImageData[] = [];
    
    for (let i = 0; i < count; i++) {
      const filename = `${field}-${i + 1}.jpg`;
      const path = `surveys/${surveyId}/${section}/${field}/${filename}`;
      
      images.push({
        filename,
        path,
        mimeType: 'image/jpeg',
        size: 1024 * (i + 1), // Varying sizes
        content: this.generateTestImage(800 + (i * 200), 600 + (i * 100), `${section} - ${field} - ${i + 1}`)
      });
    }
    
    return images;
  }

  /**
   * Generate all test images for a survey
   */
  static generateAllTestImages(surveyId: string): { [key: string]: TestImageData[] } {
    const testImages: { [key: string]: TestImageData[] } = {};

    // Electricity baseline
    testImages.annualConsumptionPhoto = this.generateTestImages(surveyId, 'electricity_baseline', 'annual_consumption', 2);

    // Property overview
    testImages.scaffoldAccessPhoto = this.generateTestImages(surveyId, 'property_overview', 'scaffold_access', 2);
    testImages.storageAreaPhoto = this.generateTestImages(surveyId, 'property_overview', 'storage_area', 2);

    // Loft/attic
    testImages.roofTimberPhoto = this.generateTestImages(surveyId, 'loft_attic', 'roof_timber', 2);
    testImages.wallSpaceInverterPhoto = this.generateTestImages(surveyId, 'loft_attic', 'wall_space_inverter', 2);
    testImages.wallSpaceBatteryPhoto = this.generateTestImages(surveyId, 'loft_attic', 'wall_space_battery', 0);

    // Electrical supply
    testImages.mainFusePhoto = this.generateTestImages(surveyId, 'electrical_supply', 'main_fuse', 2);
    testImages.consumerUnitLocationPhoto = this.generateTestImages(surveyId, 'electrical_supply', 'consumer_unit_location', 2);
    testImages.spareFuseWaysPhoto = this.generateTestImages(surveyId, 'electrical_supply', 'spare_fuse_ways', 2);
    testImages.existingSurgeProtectionPhoto = this.generateTestImages(surveyId, 'electrical_supply', 'existing_surge_protection', 0);
    testImages.earthBondingPhoto = this.generateTestImages(surveyId, 'electrical_supply', 'earth_bonding', 2);
    testImages.earthingSystemPhoto = this.generateTestImages(surveyId, 'electrical_supply', 'earthing_system', 2);

    // Battery storage
    testImages.ventilationPhoto = this.generateTestImages(surveyId, 'battery_storage', 'ventilation', 2);

    // Health and safety
    testImages.asbestosPhoto = this.generateTestImages(surveyId, 'health_safety', 'asbestos', 2);
    testImages.fragileRoofAreas = this.generateTestImages(surveyId, 'health_safety', 'fragile_roof_areas', 3);

    return testImages;
  }

  /**
   * Convert test images to file objects for upload
   */
  static convertToFiles(testImages: TestImageData[]): File[] {
    return testImages.map(image => {
      // Create a blob from the base64 content
      const byteCharacters = atob(image.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: image.mimeType });
      
      return new File([blob], image.filename, { type: image.mimeType });
    });
  }

  /**
   * Get just the file paths for form data
   */
  static getImagePaths(testImages: TestImageData[]): string[] {
    return testImages.map(image => image.path);
  }
}

