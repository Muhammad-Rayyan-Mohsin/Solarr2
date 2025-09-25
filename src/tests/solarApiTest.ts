import { GoogleSolarApiService } from '@/services/googleSolarApi';
import { API_CONFIG } from '@/lib/config';

// Test coordinates for known locations
const TEST_LOCATIONS = {
  london: { lat: 51.5074, lng: -0.1278, name: "London, UK" },
  manchester: { lat: 53.4808, lng: -2.2426, name: "Manchester, UK" },
  bristol: { lat: 51.4545, lng: -2.5879, name: "Bristol, UK" },
  birmingham: { lat: 52.4862, lng: -1.8904, name: "Birmingham, UK" },
  // Test location with poor solar data
  arctic: { lat: 71.0486, lng: -8.0120, name: "Svalbard, Norway" }
};

export class SolarApiTester {
  private static results: any[] = [];
  
  static async runAllTests(): Promise<void> {
    console.log('🌞 Starting Google Solar API Tests...');
    console.log(`API Key: ${API_CONFIG.GOOGLE_MAPS_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
    console.log('=' .repeat(60));
    
    this.results = [];
    
    // Test 1: API Key Validation
    await this.testApiKeyValidation();
    
    // Test 2: Building Insights for each location
    for (const [key, location] of Object.entries(TEST_LOCATIONS)) {
      await this.testBuildingInsights(location, key);
      await this.delay(1000); // Rate limiting
    }
    
    // Test 3: Data Layers
    await this.testDataLayers(TEST_LOCATIONS.london);
    
    // Test 4: Data Formatting
    await this.testDataFormatting();
    
    // Test 5: Error Handling
    await this.testErrorHandling();
    
    // Display Results Summary
    this.displayResults();
  }
  
  static async testApiKeyValidation(): Promise<void> {
    const testName = 'API Key Validation';
    console.log(`\n🔑 Testing: ${testName}`);
    
    try {
      if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
        throw new Error('API key not configured');
      }
      
      if (API_CONFIG.GOOGLE_MAPS_API_KEY.length < 30) {
        throw new Error('API key appears to be invalid (too short)');
      }
      
      console.log('✅ API Key appears valid');
      this.results.push({ test: testName, status: 'PASS', message: 'API key configured correctly' });
    } catch (error) {
      console.log(`❌ ${error}`);
      this.results.push({ test: testName, status: 'FAIL', message: error.message });
    }
  }
  
  static async testBuildingInsights(location: any, locationKey: string): Promise<void> {
    const testName = `Building Insights - ${location.name}`;
    console.log(`\n🏠 Testing: ${testName}`);
    
    try {
      const startTime = Date.now();
      const insights = await GoogleSolarApiService.getBuildingInsights(
        location.lat, 
        location.lng
      );
      const duration = Date.now() - startTime;
      
      // Validate response structure
      this.validateBuildingInsights(insights);
      
      const formatted = GoogleSolarApiService.formatSolarData(insights);
      
      console.log(`✅ Success (${duration}ms)`);
      console.log(`   Max Panels: ${formatted.maxPanels}`);
      console.log(`   Roof Area: ${formatted.roofArea}m²`);
      console.log(`   Estimated Energy: ${Math.round(formatted.estimatedYearlyEnergy)}kWh/year`);
      console.log(`   Sunshine Hours: ${formatted.maxSunshineHours}h/year`);
      console.log(`   Roof Segments: ${formatted.roofSegments}`);
      console.log(`   Imagery Date: ${formatted.imageryDate}`);
      
      this.results.push({ 
        test: testName, 
        status: 'PASS', 
        message: `Retrieved data successfully`,
        data: {
          duration,
          maxPanels: formatted.maxPanels,
          roofArea: formatted.roofArea,
          estimatedEnergy: Math.round(formatted.estimatedYearlyEnergy)
        }
      });
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      this.results.push({ 
        test: testName, 
        status: 'FAIL', 
        message: error.message,
        location: `${location.lat}, ${location.lng}`
      });
    }
  }
  
  static async testDataLayers(location: any): Promise<void> {
    const testName = `Data Layers - ${location.name}`;
    console.log(`\n🗺️ Testing: ${testName}`);
    
    try {
      const startTime = Date.now();
      const dataLayers = await GoogleSolarApiService.getDataLayers(
        location.lat,
        location.lng,
        100, // radius
        'IMAGERY_AND_ALL_FLUX_LAYERS',
        'HIGH',
        0.1
      );
      const duration = Date.now() - startTime;
      
      // Validate URLs
      const urls = {
        rgb: dataLayers.rgbUrl,
        dsm: dataLayers.dsmUrl,
        mask: dataLayers.maskUrl,
        annualFlux: dataLayers.annualFluxUrl,
        monthlyFlux: dataLayers.monthlyFluxUrl
      };
      
      let validUrls = 0;
      for (const [type, url] of Object.entries(urls)) {
        if (url && url.startsWith('https://')) {
          validUrls++;
          console.log(`   ${type}: ✅ Valid URL`);
        } else {
          console.log(`   ${type}: ❌ Invalid/Missing URL`);
        }
      }
      
      console.log(`✅ Success (${duration}ms) - ${validUrls}/5 URLs valid`);
      
      this.results.push({ 
        test: testName, 
        status: validUrls >= 3 ? 'PASS' : 'PARTIAL', 
        message: `${validUrls}/5 data layer URLs valid`,
        data: { duration, validUrls, totalUrls: 5 }
      });
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      this.results.push({ test: testName, status: 'FAIL', message: error.message });
    }
  }
  
  static async testDataFormatting(): Promise<void> {
    const testName = 'Data Formatting';
    console.log(`\n📊 Testing: ${testName}`);
    
    try {
      // Test with London data
      const insights = await GoogleSolarApiService.getBuildingInsights(
        TEST_LOCATIONS.london.lat,
        TEST_LOCATIONS.london.lng
      );
      
      const formatted = GoogleSolarApiService.formatSolarData(insights);
      
      // Validate formatted data structure
      const requiredFields = [
        'maxPanels', 'maxArea', 'roofArea', 'maxSunshineHours',
        'carbonOffset', 'imageryDate', 'roofSegments', 'totalPanels', 'estimatedYearlyEnergy'
      ];
      
      const missingFields = requiredFields.filter(field => 
        formatted[field] === undefined || formatted[field] === null
      );
      
      if (missingFields.length > 0) {
        throw new Error(`Missing formatted fields: ${missingFields.join(', ')}`);
      }
      
      // Validate data types
      if (typeof formatted.maxPanels !== 'number' || formatted.maxPanels < 0) {
        throw new Error('maxPanels should be a positive number');
      }
      
      if (typeof formatted.roofArea !== 'number' || formatted.roofArea < 0) {
        throw new Error('roofArea should be a positive number');
      }
      
      console.log('✅ Data formatting validation passed');
      console.log(`   All ${requiredFields.length} required fields present`);
      console.log(`   Data types validated`);
      
      this.results.push({ 
        test: testName, 
        status: 'PASS', 
        message: 'Data formatting working correctly',
        data: { fieldsValidated: requiredFields.length }
      });
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      this.results.push({ test: testName, status: 'FAIL', message: error.message });
    }
  }
  
  static async testErrorHandling(): Promise<void> {
    const testName = 'Error Handling';
    console.log(`\n⚠️ Testing: ${testName}`);
    
    const errorTests = [
      {
        name: 'Invalid Coordinates',
        test: () => GoogleSolarApiService.getBuildingInsights(999, 999),
        expectedError: true
      },
      {
        name: 'Ocean Coordinates',
        test: () => GoogleSolarApiService.getBuildingInsights(0, 0),
        expectedError: false // Should handle gracefully
      },
      {
        name: 'Invalid API Key',
        test: () => GoogleSolarApiService.getBuildingInsights(51.5074, -0.1278, 'invalid_key'),
        expectedError: true
      }
    ];
    
    let passedTests = 0;
    
    for (const errorTest of errorTests) {
      try {
        console.log(`   Testing: ${errorTest.name}`);
        await errorTest.test();
        
        if (errorTest.expectedError) {
          console.log(`   ❌ Expected error but succeeded`);
        } else {
          console.log(`   ✅ Handled gracefully`);
          passedTests++;
        }
      } catch (error) {
        if (errorTest.expectedError) {
          console.log(`   ✅ Correctly threw error: ${error.message.substring(0, 50)}...`);
          passedTests++;
        } else {
          console.log(`   ❌ Unexpected error: ${error.message}`);
        }
      }
    }
    
    this.results.push({ 
      test: testName, 
      status: passedTests === errorTests.length ? 'PASS' : 'PARTIAL', 
      message: `${passedTests}/${errorTests.length} error handling tests passed`
    });
  }
  
  static validateBuildingInsights(insights: any): void {
    if (!insights.solarPotential) {
      throw new Error('Missing solarPotential data');
    }
    
    if (!insights.solarPotential.maxArrayPanelsCount) {
      throw new Error('Missing maxArrayPanelsCount');
    }
    
    if (!insights.solarPotential.wholeRoofStats) {
      throw new Error('Missing wholeRoofStats');
    }
    
    if (!Array.isArray(insights.solarPotential.roofSegmentStats)) {
      throw new Error('Missing or invalid roofSegmentStats');
    }
  }
  
  static displayResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 SOLAR API TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const partial = this.results.filter(r => r.status === 'PARTIAL').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Partial: ${partial}`);
    console.log(`📊 Total: ${this.results.length}`);
    
    console.log('\nDetailed Results:');
    this.results.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${index + 1}. ${icon} ${result.test}: ${result.message}`);
    });
    
    if (failed === 0) {
      console.log('\n🎉 All critical tests passed! Solar API is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Check API configuration and network connectivity.');
    }
  }
  
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export test runner function
export const runSolarApiTests = () => SolarApiTester.runAllTests();
