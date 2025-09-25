// API Configuration
export const API_CONFIG = {
  // Google Maps API
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDOWxSmOpenhoUNOsnyBmCcQpUWnxIhDCo',
  
  // What3Words API
  WHAT3WORDS_API_KEY: import.meta.env.VITE_WHAT3WORDS_API_KEY || 'HBVGYR3D',
  
  // API Endpoints
  GOOGLE_SOLAR_API_BASE: 'https://solar.googleapis.com/v1',
  GOOGLE_GEOCODING_API_BASE: 'https://maps.googleapis.com/maps/api/geocode/json',
  GOOGLE_PLACES_API_BASE: 'https://maps.googleapis.com/maps/api/place',
  WHAT3WORDS_API_BASE: 'https://api.what3words.com/v3',
  
  // Configuration
  GPS_ACCURACY: import.meta.env.VITE_GPS_ACCURACY || 'high',
} as const;

// Validation function to check if required API keys are present
export function validateApiKeys(): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
    missing.push('Google Maps API Key');
  }
  
  if (!API_CONFIG.WHAT3WORDS_API_KEY) {
    missing.push('What3Words API Key');
  }
  
  return {
    isValid: missing.length === 0,
    missing
  };
}
