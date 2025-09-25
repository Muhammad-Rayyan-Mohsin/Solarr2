import { API_CONFIG } from '@/lib/config';

export interface What3WordsLocation {
  words: string;
  map: string;
  language: string;
  country: string;
  square: {
    southwest: {
      lng: number;
      lat: number;
    };
    northeast: {
      lng: number;
      lat: number;
    };
  };
  nearestPlace: string;
  coordinates: {
    lng: number;
    lat: number;
  };
}

export interface What3WordsConvertResponse {
  country: string;
  square: {
    southwest: {
      lng: number;
      lat: number;
    };
    northeast: {
      lng: number;
      lat: number;
    };
  };
  nearestPlace: string;
  coordinates: {
    lng: number;
    lat: number;
  };
  words: string;
  language: string;
  map: string;
}

export class What3WordsApiService {
  private static readonly BASE_URL = API_CONFIG.WHAT3WORDS_API_BASE;
  private static readonly API_KEY = API_CONFIG.WHAT3WORDS_API_KEY;

  /**
   * Convert coordinates to what3words address
   */
  static async convertToWords(
    latitude: number,
    longitude: number,
    language: string = 'en'
  ): Promise<What3WordsConvertResponse> {
    const url = `${this.BASE_URL}/convert-to-3wa?coordinates=${latitude},${longitude}&key=${this.API_KEY}&language=${language}&format=json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `What3Words API request failed: ${response.status} ${response.statusText}${
          errorData?.error?.message ? ` - ${errorData.error.message}` : ''
        }`
      );
    }
    
    return response.json();
  }

  /**
   * Convert what3words address to coordinates
   */
  static async convertToCoordinates(
    words: string,
    language: string = 'en'
  ): Promise<What3WordsConvertResponse> {
    const url = `${this.BASE_URL}/convert-to-coordinates?words=${encodeURIComponent(words)}&key=${this.API_KEY}&language=${language}&format=json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `What3Words API request failed: ${response.status} ${response.statusText}${
          errorData?.error?.message ? ` - ${errorData.error.message}` : ''
        }`
      );
    }
    
    return response.json();
  }

  /**
   * Get available languages
   */
  static async getAvailableLanguages(): Promise<{ languages: Array<{ code: string; name: string; nativeName: string }> }> {
    const url = `${this.BASE_URL}/available-languages?key=${this.API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`What3Words API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Validate a what3words address format
   */
  static validateWords(words: string): boolean {
    // what3words format: ///word.word.word
    const regex = /^\/\/\/[^.\s]+\.[^.\s]+\.[^.\s]+$/;
    return regex.test(words);
  }

  /**
   * Format words to ensure proper what3words format
   */
  static formatWords(words: string): string {
    // Remove existing slashes and add proper prefix
    const cleanWords = words.replace(/^\/+/, '');
    return `///${cleanWords}`;
  }
}
