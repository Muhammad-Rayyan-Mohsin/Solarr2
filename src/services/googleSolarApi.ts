// Based on Google's official Solar API implementation:
// https://github.com/googlemaps-samples/js-solar-potential

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface LatLngBox {
  sw: LatLng;
  ne: LatLng;
}

export interface Date {
  year: number;
  month: number;
  day: number;
}

export interface SizeAndSunshineStats {
  areaMeters2: number;
  sunshineQuantiles: number[];
  groundAreaMeters2: number;
}

export interface RoofSegmentSizeAndSunshineStats {
  pitchDegrees: number;
  azimuthDegrees: number;
  stats: SizeAndSunshineStats;
  center: LatLng;
  boundingBox: LatLngBox;
  planeHeightAtCenterMeters: number;
}

export interface SolarPanel {
  center: LatLng;
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  segmentIndex: number;
  yearlyEnergyDcKwh: number;
}

export interface SolarPanelConfig {
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  roofSegmentSummaries: RoofSegmentSummary[];
}

export interface RoofSegmentSummary {
  pitchDegrees: number;
  azimuthDegrees: number;
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  segmentIndex: number;
}

export interface SolarPotential {
  maxArrayPanelsCount: number;
  panelCapacityWatts: number;
  panelHeightMeters: number;
  panelWidthMeters: number;
  panelLifetimeYears: number;
  maxArrayAreaMeters2: number;
  maxSunshineHoursPerYear: number;
  carbonOffsetFactorKgPerMwh: number;
  wholeRoofStats: SizeAndSunshineStats;
  buildingStats: SizeAndSunshineStats;
  roofSegmentStats: RoofSegmentSizeAndSunshineStats[];
  solarPanels: SolarPanel[];
  solarPanelConfigs: SolarPanelConfig[];
  financialAnalyses: any[]; // Complex structure with multiple financial options
}

export interface BuildingInsightsResponse {
  name: string;
  center: LatLng;
  boundingBox: LatLngBox;
  imageryDate: Date;
  imageryProcessedDate: Date;
  postalCode: string;
  administrativeArea: string;
  statisticalArea: string;
  regionCode: string;
  solarPotential: SolarPotential;
  imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW';
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

import { API_CONFIG } from '@/lib/config';

export class GoogleSolarApiService {
  private static readonly BASE_URL = API_CONFIG.GOOGLE_SOLAR_API_BASE;
  
  /**
   * Fetches the building insights information from the Solar API.
   * Based on Google's official implementation:
   * https://developers.google.com/maps/documentation/solar/building-insights
   *
   * @param  {number} latitude      Latitude coordinate
   * @param  {number} longitude     Longitude coordinate  
   * @param  {string} apiKey        Google Cloud API key
   * @return {Promise<BuildingInsightsResponse>}  Building Insights response
   */
  static async getBuildingInsights(
    latitude: number, 
    longitude: number,
    apiKey: string = API_CONFIG.GOOGLE_MAPS_API_KEY
  ): Promise<BuildingInsightsResponse> {
    const args = {
      'location.latitude': latitude.toFixed(5),
      'location.longitude': longitude.toFixed(5),
    };
    console.log('GET buildingInsights', args);
    const params = new URLSearchParams({ ...args, key: apiKey });
    const url = `${this.BASE_URL}/buildingInsights:findClosest?${params}`;
    
    const response = await fetch(url);
    const content = await response.json();
    
    if (response.status !== 200) {
      console.error('findClosestBuilding error:', content);
      throw new Error(content.error?.message || `Building insights request failed: ${response.statusText}`);
    }
    
    console.log('buildingInsightsResponse', content);
    return content;
  }

  /**
   * Fetches the data layers information from the Solar API.
   * Based on Google's official implementation:
   * https://developers.google.com/maps/documentation/solar/data-layers
   *
   * @param  {number} latitude      Latitude coordinate
   * @param  {number} longitude     Longitude coordinate
   * @param  {number} radiusMeters  Radius of the data layer size in meters
   * @param  {string} view          Which data layers to return
   * @param  {string} requiredQuality  Minimum quality level (use 'LOW' to get best available)
   * @param  {number} pixelSizeMeters  Resolution of data layers
   * @param  {string} apiKey        Google Cloud API key
   * @return {Promise<DataLayersResponse>}  Data Layers response
   */
  static async getDataLayers(
    latitude: number, 
    longitude: number,
    radiusMeters: number = 50,
    view: 'FULL_LAYERS' | 'DSM_LAYER' | 'IMAGERY_LAYER' | 'IMAGERY_AND_ANNUAL_FLUX_LAYERS' | 'IMAGERY_AND_ALL_FLUX_LAYERS' = 'IMAGERY_AND_ALL_FLUX_LAYERS',
    requiredQuality: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW',  // Use LOW to get best available quality
    pixelSizeMeters: number = 0.1,
    apiKey: string = API_CONFIG.GOOGLE_MAPS_API_KEY
  ): Promise<DataLayersResponse> {
    const args = {
      'location.latitude': latitude.toFixed(5),
      'location.longitude': longitude.toFixed(5),
      'radiusMeters': radiusMeters.toString(),
      'view': view,
      // Google's recommendation: Use LOW to get at least LOW quality
      // If higher quality is available, the API returns the highest quality
      'requiredQuality': requiredQuality,
      'pixelSizeMeters': pixelSizeMeters.toString(),
    };
    console.log('GET dataLayers', args);
    const params = new URLSearchParams({ ...args, key: apiKey });
    const url = `${this.BASE_URL}/dataLayers:get?${params}`;
    
    const response = await fetch(url);
    const content = await response.json();
    
    if (response.status !== 200) {
      console.error('getDataLayers error:', content);
      throw new Error(content.error?.message || `Data layers request failed: ${response.statusText}`);
    }
    
    console.log('dataLayersResponse', content);
    return content;
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

  static formatSolarData(insights: BuildingInsightsResponse) {
    const { solarPotential } = insights;
    return {
      // Summary data
      maxPanels: solarPotential.maxArrayPanelsCount,
      maxArea: Math.round(solarPotential.maxArrayAreaMeters2),
      roofArea: Math.round(solarPotential.wholeRoofStats.areaMeters2),
      maxSunshineHours: Math.round(solarPotential.maxSunshineHoursPerYear),
      carbonOffset: solarPotential.carbonOffsetFactorKgPerMwh,
      imageryDate: this.showDate(insights.imageryDate),
      imageryQuality: insights.imageryQuality,
      roofSegments: solarPotential.roofSegmentStats.length,
      totalPanels: solarPotential.solarPanels.length,
      estimatedYearlyEnergy: solarPotential.solarPanels.reduce((sum, panel) => sum + panel.yearlyEnergyDcKwh, 0),
      
      // Full raw data
      fullData: insights
    };
  }

  /**
   * Utility: Format LatLng for display
   */
  static showLatLng(point: LatLng): string {
    return `(${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)})`;
  }

  /**
   * Utility: Format Date for display
   */
  static showDate(date: Date): string {
    return `${date.month}/${date.day}/${date.year}`;
  }
}