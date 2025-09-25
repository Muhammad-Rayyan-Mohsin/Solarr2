import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleSolarApiService } from "@/services/googleSolarApi";
import { API_CONFIG } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

export function SolarApiTestButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testSolarAPI = async () => {
    setIsLoading(true);
    
    try {
      console.log("Testing Solar API with test coordinates...");
      console.log("API Key:", API_CONFIG.GOOGLE_MAPS_API_KEY);
      
      // Test with London coordinates
      const lat = 51.5074;
      const lng = -0.1278;
      
      const buildingInsights = await GoogleSolarApiService.getBuildingInsights(lat, lng);
      console.log("Success! Building insights:", buildingInsights);
      
      toast({
        title: "Solar API Test Successful",
        description: `Found ${buildingInsights.solarPotential.maxArrayPanelsCount} potential panels`,
      });
      
    } catch (error: any) {
      console.error("Solar API test failed:", error);
      console.error("Error details:", error.message, error.stack);
      
      let errorMessage = "Unknown error";
      if (error.message.includes("403")) {
        errorMessage = "API key doesn't have Solar API access. Enable Solar API in Google Cloud Console.";
      } else if (error.message.includes("400")) {
        errorMessage = "Invalid request parameters";
      } else if (error.message.includes("404") || error.message.includes("Not Found")) {
        errorMessage = "Solar API not available in this region. Currently only available in select countries (US, UK, etc.)";
      } else if (error.message.includes("CORS")) {
        errorMessage = "CORS error - check API key permissions";
      } else {
        errorMessage = error.message;
      }
      
      toast({
        title: "Solar API Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={testSolarAPI}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? "Testing..." : "Test Solar API"}
    </Button>
  );
}
