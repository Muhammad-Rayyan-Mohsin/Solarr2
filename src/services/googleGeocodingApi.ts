import { API_CONFIG } from '@/lib/config';

export interface GeocodingResult {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  place_id: string;
  plus_code?: {
    compound_code: string;
    global_code: string;
  };
  types: string[];
}

export interface GeocodingResponse {
  results: GeocodingResult[];
  status: string;
}

export class GoogleGeocodingApiService {
  private static readonly BASE_URL = API_CONFIG.GOOGLE_GEOCODING_API_BASE;
  private static readonly API_KEY = API_CONFIG.GOOGLE_MAPS_API_KEY;

  /**
   * Convert address to coordinates
   */
  static async geocodeAddress(address: string): Promise<GeocodingResponse> {
    const url = `${this.BASE_URL}?address=${encodeURIComponent(address)}&key=${this.API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Geocoding API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Convert coordinates to address (reverse geocoding)
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResponse> {
    const url = `${this.BASE_URL}?latlng=${latitude},${longitude}&key=${this.API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Reverse geocoding API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Extract postcode from geocoding result
   */
  static extractPostcode(result: GeocodingResult): string | null {
    const postcodeComponent = result.address_components.find(
      component => component.types.includes('postal_code')
    );
    return postcodeComponent?.long_name || null;
  }

  /**
   * Extract country from geocoding result
   */
  static extractCountry(result: GeocodingResult): string | null {
    const countryComponent = result.address_components.find(
      component => component.types.includes('country')
    );
    return countryComponent?.long_name || null;
  }

  /**
   * Get formatted address components
   */
  static getAddressComponents(result: GeocodingResult) {
    const components: Record<string, string> = {};
    
    result.address_components.forEach(component => {
      component.types.forEach(type => {
        components[type] = component.long_name;
      });
    });
    
    return {
      streetNumber: components['street_number'] || '',
      streetName: components['route'] || '',
      city: components['locality'] || components['administrative_area_level_2'] || '',
      county: components['administrative_area_level_2'] || '',
      postcode: components['postal_code'] || '',
      country: components['country'] || '',
      formattedAddress: result.formatted_address
    };
  }
}
