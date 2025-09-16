interface Coordinate {
  latitude: number;
  longitude: number;
}

interface BuildingInsights {
  name: string;
  center: Coordinate;
  boundingBox: {
    sw: Coordinate;
    ne: Coordinate;
  };
  imageryDate: {
    year: number;
    month: number;
    day: number;
  };
  imageryProcessedDate: {
    year: number;
    month: number;
    day: number;
  };
  postalCode: string;
  administrativeArea: string;
  statisticalArea: string;
  regionCode: string;
  solarPotential: {
    maxArrayPanelsCount: number;
    maxArrayAreaMeters2: number;
    maxSunshineHoursPerYear: number;
    carbonOffsetFactorKgPerMwh: number;
    wholeRoofStats: {
      areaMeters2: number;
      sunshineQuantiles: number[];
      groundAreaMeters2: number;
    };
    roofSegmentStats: Array<{
      pitchDegrees: number;
      azimuthDegrees: number;
      stats: {
        areaMeters2: number;
        sunshineQuantiles: number[];
        groundAreaMeters2: number;
      };
      center: Coordinate;
      boundingBox: {
        sw: Coordinate;
        ne: Coordinate;
      };
      planeHeightAtCenterMeters: number;
    }>;
    solarPanels: Array<{
      center: Coordinate;
      orientation: string;
      segmentIndex: number;
      yearlyEnergyDcKwh: number;
    }>;
    financialAnalyses: Array<{
      monthlyBill: {
        currencyCode: string;
        units: number;
      };
      defaultBill: boolean;
      averageKwhPerMonth: number;
      panelConfigIndex: number;
    }>;
    panelCapacityWatts: number;
    panelHeightMeters: number;
    panelWidthMeters: number;
    panelLifetimeYears: number;
    dcToAcDerate: number;
  };
}

interface DataLayersResponse {
  imageryDate: {
    year: number;
    month: number;
    day: number;
  };
  imageryProcessedDate: {
    year: number;
    month: number;
    day: number;
  };
  dsmUrl: string;
  rgbUrl: string;
  maskUrl: string;
  annualFluxUrl: string;
  monthlyFluxUrl: string;
  hourlyShadeUrls: string[];
}

export class GoogleSolarApiService {
  private static readonly BASE_URL = 'https://solar.googleapis.com/v1';
  
  static async getBuildingInsights(
    latitude: number, 
    longitude: number,
    apiKey: string
  ): Promise<BuildingInsights> {
    const url = `${this.BASE_URL}/buildingInsights:findClosest?location.latitude=${latitude}&location.longitude=${longitude}&key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Building insights request failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  static async getDataLayers(
    latitude: number, 
    longitude: number,
    radiusMeters: number = 50,
    view: 'FULL_LAYERS' | 'DSM_LAYER' | 'IMAGERY_LAYER' | 'IMAGERY_AND_ANNUAL_FLUX_LAYERS' | 'IMAGERY_AND_ALL_FLUX_LAYERS' = 'IMAGERY_AND_ALL_FLUX_LAYERS',
    requiredQuality: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH',
    pixelSizeMeters: number = 0.1,
    apiKey: string
  ): Promise<DataLayersResponse> {
    const url = `${this.BASE_URL}/dataLayers:get?location.latitude=${latitude}&location.longitude=${longitude}&radiusMeters=${radiusMeters}&view=${view}&requiredQuality=${requiredQuality}&pixelSizeMeters=${pixelSizeMeters}&key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Data layers request failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  static async getGeoTiff(
    latitude: number, 
    longitude: number,
    radiusMeters: number = 50,
    requiredQuality: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH',
    pixelSizeMeters: number = 0.1,
    apiKey: string
  ): Promise<ArrayBuffer> {
    const url = `${this.BASE_URL}/geoTiff:get?location.latitude=${latitude}&location.longitude=${longitude}&radiusMeters=${radiusMeters}&requiredQuality=${requiredQuality}&pixelSizeMeters=${pixelSizeMeters}&key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GeoTIFF request failed: ${response.statusText}`);
    }
    
    return response.arrayBuffer();
  }

  static formatSolarData(insights: BuildingInsights) {
    const { solarPotential } = insights;
    return {
      maxPanels: solarPotential.maxArrayPanelsCount,
      maxArea: Math.round(solarPotential.maxArrayAreaMeters2),
      roofArea: Math.round(solarPotential.wholeRoofStats.areaMeters2),
      maxSunshineHours: Math.round(solarPotential.maxSunshineHoursPerYear),
      carbonOffset: solarPotential.carbonOffsetFactorKgPerMwh,
      imageryDate: `${insights.imageryDate.day}/${insights.imageryDate.month}/${insights.imageryDate.year}`,
      roofSegments: solarPotential.roofSegmentStats.length,
      totalPanels: solarPotential.solarPanels.length,
      estimatedYearlyEnergy: solarPotential.solarPanels.reduce((sum, panel) => sum + panel.yearlyEnergyDcKwh, 0)
    };
  }
}