/**
 * Data Type Fixes
 * Ensures proper data type conversions between form and database
 */

export class DataTypeFixes {
  /**
   * Convert string to number safely
   */
  static toNumber(value: string | number | null | undefined): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Convert string to integer safely
   */
  static toInteger(value: string | number | null | undefined): number {
    if (typeof value === 'number') return Math.floor(value);
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Convert number to string safely
   */
  static toString(value: number | string | null | undefined): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return '';
  }

  /**
   * Fix roof face data types
   */
  static fixRoofFaceData(roofFace: any): any {
    return {
      ...roofFace,
      width: this.toNumber(roofFace.width),
      length: this.toNumber(roofFace.length),
      area: this.toNumber(roofFace.area),
      plannedPanelCount: this.toInteger(roofFace.plannedPanelCount),
    };
  }

  /**
   * Fix form data types before submission
   */
  static fixFormDataTypes(formData: any): any {
    const fixed = { ...formData };

    // Fix roof faces
    if (fixed.roofFaces && Array.isArray(fixed.roofFaces)) {
      fixed.roofFaces = fixed.roofFaces.map((face: any) => this.fixRoofFaceData(face));
    }

    // Fix numeric fields
    if (fixed.loftHatchWidth) {
      fixed.loftHatchWidth = this.toString(this.toNumber(fixed.loftHatchWidth));
    }
    if (fixed.loftHatchHeight) {
      fixed.loftHatchHeight = this.toString(this.toNumber(fixed.loftHatchHeight));
    }
    if (fixed.loftInsulationThickness) {
      fixed.loftInsulationThickness = this.toString(this.toNumber(fixed.loftInsulationThickness));
    }
    if (fixed.spareFuseWays) {
      fixed.spareFuseWays = this.toString(this.toInteger(fixed.spareFuseWays));
    }
    if (fixed.evChargerLoad) {
      fixed.evChargerLoad = this.toString(this.toNumber(fixed.evChargerLoad));
    }
    if (fixed.annualConsumption) {
      fixed.annualConsumption = this.toString(this.toNumber(fixed.annualConsumption));
    }

    return fixed;
  }

  /**
   * Fix data when loading from database
   */
  static fixDatabaseData(dbData: any): any {
    const fixed = { ...dbData };

    // Fix roof faces from database
    if (fixed.roof_faces && Array.isArray(fixed.roof_faces)) {
      fixed.roof_faces = fixed.roof_faces.map((face: any) => ({
        ...face,
        width: this.toNumber(face.width),
        length: this.toNumber(face.length),
        area: this.toNumber(face.area),
        planned_panel_count: this.toInteger(face.planned_panel_count),
      }));
    }

    return fixed;
  }

  /**
   * Validate and fix form data before validation
   */
  static validateAndFixFormData(formData: any): { data: any; errors: string[] } {
    const errors: string[] = [];
    const fixed = this.fixFormDataTypes(formData);

    // Validate required numeric fields
    if (fixed.roofFaces && Array.isArray(fixed.roofFaces)) {
      fixed.roofFaces.forEach((face: any, index: number) => {
        if (face.width <= 0) {
          errors.push(`Roof face ${index + 1}: Width must be greater than 0`);
        }
        if (face.length <= 0) {
          errors.push(`Roof face ${index + 1}: Length must be greater than 0`);
        }
        if (face.area <= 0) {
          errors.push(`Roof face ${index + 1}: Area must be greater than 0`);
        }
        if (face.plannedPanelCount < 0) {
          errors.push(`Roof face ${index + 1}: Planned panel count cannot be negative`);
        }
      });
    }

    return { data: fixed, errors };
  }
}

