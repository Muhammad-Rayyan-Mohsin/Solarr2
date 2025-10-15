/**
 * Location Enrichment Service
 * Handles auto-filling location fields from various inputs:
 * - Address → Coordinates, Postcode, What3Words
 * - Postcode → Address, Coordinates, What3Words
 * - Coordinates → Address, Postcode, What3Words
 * - What3Words → Address, Postcode, Coordinates
 */

import { GoogleGeocodingApiService } from './googleGeocodingApi';
import { What3WordsApiService } from './what3wordsApi';
import { GoogleSolarApiService } from './googleSolarApi';
import { API_CONFIG } from '@/lib/config';

export interface LocationData {
  address?: string;
  postcode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  gridReference?: string;
  what3words?: string;
  country?: string;
  city?: string;
  county?: string;
  solarData?: any;
}

export interface EnrichmentResult {
  success: boolean;
  data?: LocationData;
  error?: string;
  source: 'address' | 'postcode' | 'coordinates' | 'what3words';
}

export class LocationEnrichmentService {
  /**
   * Enrich from full address
   */
  static async enrichFromAddress(address: string): Promise<EnrichmentResult> {
    try {
      console.log('Enriching from address:', address);
      
      // Geocode the address
      const geocodeResult = await GoogleGeocodingApiService.geocodeAddress(address);
      
      if (!geocodeResult.results || geocodeResult.results.length === 0) {
        return {
          success: false,
          error: 'Address not found',
          source: 'address',
        };
      }

      const result = geocodeResult.results[0];
      const { lat, lng } = result.geometry.location;

      // Extract address components
      const addressComponents = result.address_components;
      const postcode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name;
      const city = addressComponents.find(c => c.types.includes('locality') || c.types.includes('postal_town'))?.long_name;
      const county = addressComponents.find(c => c.types.includes('administrative_area_level_2'))?.long_name;
      const country = addressComponents.find(c => c.types.includes('country'))?.long_name;

      // Get What3Words
      let what3words: string | undefined;
      try {
        const w3wResult = await What3WordsApiService.convertCoordinates(lat, lng);
        if (w3wResult.words) {
          what3words = `///${w3wResult.words}`;
        }
      } catch (error) {
        console.warn('What3Words conversion failed:', error);
      }

      // Try to get solar data (optional, may not be available for all regions)
      let solarData: any = undefined;
      try {
        const insights = await GoogleSolarApiService.getBuildingInsights(lat, lng);
        const dataLayers = await GoogleSolarApiService.getDataLayers(lat, lng, 100, 'IMAGERY_AND_ALL_FLUX_LAYERS');
        solarData = {
          insights: GoogleSolarApiService.formatSolarData(insights),
          rawInsights: insights,
          rawDataLayers: dataLayers,
        };
      } catch (error) {
        console.warn('Solar data not available for this location');
      }

      return {
        success: true,
        data: {
          address: result.formatted_address,
          postcode,
          coordinates: { lat, lng },
          gridReference: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          what3words,
          city,
          county,
          country,
          solarData,
        },
        source: 'address',
      };
    } catch (error: any) {
      console.error('Address enrichment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to enrich from address',
        source: 'address',
      };
    }
  }

  /**
   * Enrich from postcode (UK-focused)
   */
  static async enrichFromPostcode(postcode: string): Promise<EnrichmentResult> {
    try {
      console.log('Enriching from postcode:', postcode);
      
      // For UK postcodes, we can use Google Geocoding
      const geocodeResult = await GoogleGeocodingApiService.geocodeAddress(postcode);
      
      if (!geocodeResult.results || geocodeResult.results.length === 0) {
        return {
          success: false,
          error: 'Postcode not found',
          source: 'postcode',
        };
      }

      const result = geocodeResult.results[0];
      const { lat, lng } = result.geometry.location;

      // Extract address components
      const addressComponents = result.address_components;
      const city = addressComponents.find(c => c.types.includes('locality') || c.types.includes('postal_town'))?.long_name;
      const county = addressComponents.find(c => c.types.includes('administrative_area_level_2'))?.long_name;
      const country = addressComponents.find(c => c.types.includes('country'))?.long_name;

      // Get What3Words
      let what3words: string | undefined;
      try {
        const w3wResult = await What3WordsApiService.convertCoordinates(lat, lng);
        if (w3wResult.words) {
          what3words = `///${w3wResult.words}`;
        }
      } catch (error) {
        console.warn('What3Words conversion failed:', error);
      }

      // Try to get solar data
      let solarData: any = undefined;
      try {
        const insights = await GoogleSolarApiService.getBuildingInsights(lat, lng);
        const dataLayers = await GoogleSolarApiService.getDataLayers(lat, lng, 100, 'IMAGERY_AND_ALL_FLUX_LAYERS');
        solarData = {
          insights: GoogleSolarApiService.formatSolarData(insights),
          rawInsights: insights,
          rawDataLayers: dataLayers,
        };
      } catch (error) {
        console.warn('Solar data not available for this location');
      }

      return {
        success: true,
        data: {
          address: result.formatted_address,
          postcode: postcode.toUpperCase(),
          coordinates: { lat, lng },
          gridReference: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          what3words,
          city,
          county,
          country,
          solarData,
        },
        source: 'postcode',
      };
    } catch (error: any) {
      console.error('Postcode enrichment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to enrich from postcode',
        source: 'postcode',
      };
    }
  }

  /**
   * Enrich from coordinates (lat, lng)
   */
  static async enrichFromCoordinates(lat: number, lng: number): Promise<EnrichmentResult> {
    try {
      console.log('Enriching from coordinates:', { lat, lng });
      
      // Reverse geocode to get address
      const geocodeResult = await GoogleGeocodingApiService.reverseGeocode(lat, lng);
      
      if (!geocodeResult.results || geocodeResult.results.length === 0) {
        return {
          success: false,
          error: 'Location not found',
          source: 'coordinates',
        };
      }

      const result = geocodeResult.results[0];
      
      // Extract address components
      const addressComponents = result.address_components;
      const postcode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name;
      const city = addressComponents.find(c => c.types.includes('locality') || c.types.includes('postal_town'))?.long_name;
      const county = addressComponents.find(c => c.types.includes('administrative_area_level_2'))?.long_name;
      const country = addressComponents.find(c => c.types.includes('country'))?.long_name;

      // Get What3Words
      let what3words: string | undefined;
      try {
        const w3wResult = await What3WordsApiService.convertCoordinates(lat, lng);
        if (w3wResult.words) {
          what3words = `///${w3wResult.words}`;
        }
      } catch (error) {
        console.warn('What3Words conversion failed:', error);
      }

      // Try to get solar data
      let solarData: any = undefined;
      try {
        const insights = await GoogleSolarApiService.getBuildingInsights(lat, lng);
        const dataLayers = await GoogleSolarApiService.getDataLayers(lat, lng, 100, 'IMAGERY_AND_ALL_FLUX_LAYERS');
        solarData = {
          insights: GoogleSolarApiService.formatSolarData(insights),
          rawInsights: insights,
          rawDataLayers: dataLayers,
        };
      } catch (error) {
        console.warn('Solar data not available for this location');
      }

      return {
        success: true,
        data: {
          address: result.formatted_address,
          postcode,
          coordinates: { lat, lng },
          gridReference: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          what3words,
          city,
          county,
          country,
          solarData,
        },
        source: 'coordinates',
      };
    } catch (error: any) {
      console.error('Coordinates enrichment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to enrich from coordinates',
        source: 'coordinates',
      };
    }
  }

  /**
   * Enrich from What3Words address
   */
  static async enrichFromWhat3Words(what3words: string): Promise<EnrichmentResult> {
    try {
      console.log('Enriching from What3Words:', what3words);
      
      // Clean the what3words input (remove /// if present)
      const cleanWords = what3words.replace(/^\/\/\//, '');
      
      // Convert What3Words to coordinates
      const w3wResult = await What3WordsApiService.convertToCoordinates(cleanWords);
      
      if (!w3wResult.coordinates) {
        return {
          success: false,
          error: 'Invalid What3Words address',
          source: 'what3words',
        };
      }

      const { lat, lng } = w3wResult.coordinates;

      // Now use coordinates to get other data
      const coordResult = await this.enrichFromCoordinates(lat, lng);
      
      if (!coordResult.success || !coordResult.data) {
        return coordResult;
      }

      // Ensure what3words is properly formatted
      coordResult.data.what3words = `///${cleanWords}`;
      coordResult.source = 'what3words';

      return coordResult;
    } catch (error: any) {
      console.error('What3Words enrichment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to enrich from What3Words',
        source: 'what3words',
      };
    }
  }

  /**
   * Smart detect and enrich from any input
   */
  static async smartEnrich(input: string): Promise<EnrichmentResult> {
    // Detect input type and route to appropriate method
    const trimmedInput = input.trim();

    // Check if it's What3Words (///word.word.word)
    if (trimmedInput.match(/^\/\/\/[\w.]+\.[\w.]+\.[\w.]+$/)) {
      return this.enrichFromWhat3Words(trimmedInput);
    }

    // Check if it's coordinates (lat, lng)
    const coordMatch = trimmedInput.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return this.enrichFromCoordinates(lat, lng);
      }
    }

    // Check if it's a UK postcode pattern
    const ukPostcodePattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    if (ukPostcodePattern.test(trimmedInput)) {
      return this.enrichFromPostcode(trimmedInput);
    }

    // Default to address search
    return this.enrichFromAddress(trimmedInput);
  }
}
