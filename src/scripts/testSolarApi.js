// Simple test runner for Google Solar API
// Run this with: node src/scripts/testSolarApi.js

const API_KEY = 'AIzaSyDOWxSmOpenhoUNOsnyBmCcQpUWnxIhDCo';
const BASE_URL = 'https://solar.googleapis.com/v1';

// Test locations
const TEST_LOCATIONS = [
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Manchester, UK', lat: 53.4808, lng: -2.2426 },
  { name: 'Bristol, UK', lat: 51.4545, lng: -2.5879 }
];

async function testSolarApi() {
  console.log('🌞 Testing Google Solar API...');
  console.log('API Key:', API_KEY ? 'Configured ✅' : 'Missing ❌');
  console.log('='.repeat(60));

  for (const location of TEST_LOCATIONS) {
    console.log(`\n🏠 Testing: ${location.name}`);
    
    try {
      const startTime = Date.now();
      
      // Test Building Insights
      const buildingUrl = `${BASE_URL}/buildingInsights:findClosest?location.latitude=${location.lat}&location.longitude=${location.lng}&key=${API_KEY}`;
      
      const response = await fetch(buildingUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      // Extract key metrics
      const solarPotential = data.solarPotential;
      const maxPanels = solarPotential?.maxArrayPanelsCount || 0;
      const roofArea = Math.round(solarPotential?.wholeRoofStats?.areaMeters2 || 0);
      const maxSunshine = Math.round(solarPotential?.maxSunshineHoursPerYear || 0);
      const roofSegments = solarPotential?.roofSegmentStats?.length || 0;
      
      // Calculate estimated energy
      const estimatedEnergy = solarPotential?.solarPanels?.reduce(
        (sum, panel) => sum + (panel.yearlyEnergyDcKwh || 0), 0
      ) || 0;
      
      console.log(`✅ Success (${duration}ms)`);
      console.log(`   Max Panels: ${maxPanels}`);
      console.log(`   Roof Area: ${roofArea}m²`);
      console.log(`   Estimated Energy: ${Math.round(estimatedEnergy)}kWh/year`);
      console.log(`   Sunshine Hours: ${maxSunshine}h/year`);
      console.log(`   Roof Segments: ${roofSegments}`);
      
      // Test Data Layers
      console.log(`   Testing data layers...`);
      const dataLayerUrl = `${BASE_URL}/dataLayers:get?location.latitude=${location.lat}&location.longitude=${location.lng}&radiusMeters=100&view=IMAGERY_AND_ALL_FLUX_LAYERS&requiredQuality=HIGH&pixelSizeMeters=0.1&key=${API_KEY}`;
      
      const dataResponse = await fetch(dataLayerUrl);
      if (dataResponse.ok) {
        const dataLayers = await dataResponse.json();
        const urls = [
          dataLayers.rgbUrl,
          dataLayers.dsmUrl,
          dataLayers.maskUrl,
          dataLayers.annualFluxUrl,
          dataLayers.monthlyFluxUrl
        ].filter(url => url && url.startsWith('https://'));
        
        console.log(`   Data Layers: ${urls.length}/5 URLs available ✅`);
      } else {
        console.log(`   Data Layers: Failed ❌`);
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      
      // Check common error scenarios
      if (error.message.includes('403')) {
        console.log('   💡 Tip: Check if Solar API is enabled in Google Cloud Console');
      } else if (error.message.includes('400')) {
        console.log('   💡 Tip: Invalid coordinates or API request format');
      } else if (error.message.includes('429')) {
        console.log('   💡 Tip: Rate limit exceeded, slow down requests');
      }
    }
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Solar API testing completed!');
  console.log('💡 Run this script again if you see any failures');
}

// Error handling for invalid API configuration
if (!API_KEY || API_KEY === 'your_api_key_here') {
  console.error('❌ Error: Please configure a valid Google Maps API key');
  console.error('Update the API_KEY variable in this script or your environment variables');
  process.exit(1);
}

// Run the tests
testSolarApi().catch(console.error);
