// Test Solar API directly in browser environment
const API_KEY = "AIzaSyDOWxSmOpenhoUNOsnyBmCcQpUWnxIhDCo";

async function testSolarAPI() {
  const lat = 51.5074;
  const lng = -0.1278;
  
  console.log("Testing Solar API in browser...");
  console.log("API Key:", API_KEY);
  console.log("Coordinates:", { lat, lng });
  
  try {
    const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${API_KEY}`;
    console.log("Request URL:", url);
    
    const response = await fetch(url);
    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Success! Data:", data);
    
  } catch (error) {
    console.error("Failed:", error);
  }
}

// Run the test
testSolarAPI();
