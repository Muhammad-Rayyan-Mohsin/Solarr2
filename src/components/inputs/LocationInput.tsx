import { useState } from "react";
import { MapPin, Satellite, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SolarImageryViewer } from "@/components/SolarImageryViewer";
import { What3WordsApiService } from "@/services/what3wordsApi";
import { GoogleGeocodingApiService } from "@/services/googleGeocodingApi";
import { GoogleSolarApiService } from "@/services/googleSolarApi";
import { useToast } from "@/hooks/use-toast";

interface LocationInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  showGridRef?: boolean;
  showWhat3Words?: boolean;
  showSolarAnalysis?: boolean;
  onSolarDataReceived?: (solarData: any) => void;
  onCoordinatesReceived?: (lat: number, lng: number) => void;
}

export function LocationInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  isFlagged = false,
  flagMessage,
  showGridRef = true,
  showWhat3Words = true,
  showSolarAnalysis = true,
  onSolarDataReceived,
  onCoordinatesReceived,
}: LocationInputProps) {
  const [gridRef, setGridRef] = useState("");
  const [what3Words, setWhat3Words] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showSolarData, setShowSolarData] = useState(false);
  const { toast } = useToast();

  const calculateSuitability = (azimuth: number, pitch: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    // South-facing (150-210°) with 30-45° pitch = excellent
    // East/West-facing (60-150°, 210-300°) with 20-50° pitch = good  
    // North-facing or extreme pitches = fair/poor
    if (azimuth >= 150 && azimuth <= 210 && pitch >= 30 && pitch <= 45) return 'excellent';
    if (((azimuth >= 60 && azimuth < 150) || (azimuth > 210 && azimuth <= 300)) && pitch >= 20 && pitch <= 50) return 'good';
    if (pitch >= 15 && pitch <= 60) return 'fair';
    return 'poor';
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Store coordinates for solar analysis
          setCoordinates({ lat: latitude, lng: longitude });
          
          // Generate grid reference (simplified UK grid reference format)
          const gridReference = `TQ${Math.floor(latitude * 1000).toString().padStart(3, '0')}${Math.floor(longitude * 1000).toString().padStart(3, '0')}`;
          setGridRef(gridReference);
          
          // Get What3Words address using the API
          try {
            const what3wordsResult = await What3WordsApiService.convertToWords(latitude, longitude);
            setWhat3Words(what3wordsResult.words);
          } catch (error) {
            console.error('What3Words API error:', error);
            // Fallback to mock words if API fails
            const words = ['solar', 'panel', 'survey', 'green', 'energy', 'roof', 'home', 'power'];
            const fallbackWhat3Words = `///${words[Math.floor(Math.random() * words.length)]}.${words[Math.floor(Math.random() * words.length)]}.${words[Math.floor(Math.random() * words.length)]}`;
            setWhat3Words(fallbackWhat3Words);
            
            toast({
              title: "What3Words API Error",
              description: "Using fallback location format. Check your API key configuration.",
              variant: "destructive",
            });
          }
          
          // Get formatted address using Google Geocoding API
          try {
            const geocodingResult = await GoogleGeocodingApiService.reverseGeocode(latitude, longitude);
            if (geocodingResult.results.length > 0) {
              const formattedAddress = geocodingResult.results[0].formatted_address;
              onChange(formattedAddress);
            } else {
              // Fallback to coordinates
              onChange(`${value} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`);
            }
          } catch (error) {
            console.error('Geocoding API error:', error);
            // Fallback to coordinates
            onChange(`${value} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`);
            
            toast({
              title: "Geocoding API Error",
              description: "Using coordinate format. Check your Google API key configuration.",
              variant: "destructive",
            });
          }
          
          // Notify parent of coordinates
          onCoordinatesReceived?.(latitude, longitude);

          // Fetch Solar API data
          try {
            const startTime = Date.now();
            const [buildingInsights, dataLayers] = await Promise.all([
              GoogleSolarApiService.getBuildingInsights(latitude, longitude),
              GoogleSolarApiService.getDataLayers(latitude, longitude, 100, 'IMAGERY_AND_ALL_FLUX_LAYERS', 'HIGH', 0.1)
            ]);

            const formattedData = GoogleSolarApiService.formatSolarData(buildingInsights);
            
            // Process solar data for form integration
            const solarFormData = {
              // Key metrics
              maxPanels: formattedData.maxPanels,
              usableRoofArea: Math.round(buildingInsights.solarPotential.maxArrayAreaMeters2),
              totalRoofArea: Math.round(buildingInsights.solarPotential.wholeRoofStats.areaMeters2),
              estimatedYearlyEnergy: formattedData.estimatedYearlyEnergy,
              maxSunshineHours: formattedData.maxSunshineHours,
              carbonOffset: buildingInsights.solarPotential.carbonOffsetFactorKgPerMwh,
              imageryDate: formattedData.imageryDate,
              
              // Roof segment analysis
              roofSegments: buildingInsights.solarPotential.roofSegmentStats.map((segment: any, index: number) => ({
                id: `roof-${index + 1}`,
                pitch: Math.round(segment.pitchDegrees),
                azimuth: Math.round(segment.azimuthDegrees),
                area: Math.round(segment.stats.areaMeters2),
                suitability: calculateSuitability(segment.azimuthDegrees, segment.pitchDegrees),
                suggestedPanels: Math.floor(segment.stats.areaMeters2 / 3), // ~3m² per panel
                orientation: segment.azimuthDegrees < 45 || segment.azimuthDegrees >= 315 ? 'North' :
                           segment.azimuthDegrees < 135 ? 'East' :
                           segment.azimuthDegrees < 225 ? 'South' : 'West'
              })),
              
              // Obstruction analysis
              obstructions: {
                shadingPercentage: Math.round(((buildingInsights.solarPotential.wholeRoofStats.areaMeters2 - buildingInsights.solarPotential.maxArrayAreaMeters2) / buildingInsights.solarPotential.wholeRoofStats.areaMeters2) * 100),
                usablePercentage: Math.round((buildingInsights.solarPotential.maxArrayAreaMeters2 / buildingInsights.solarPotential.wholeRoofStats.areaMeters2) * 100)
              },
              
              // API metadata
              apiResponseTime: Date.now() - startTime,
              dataQuality: 'high',
              lastUpdated: new Date().toISOString(),
              
              // Raw data for advanced analysis
              rawBuildingInsights: buildingInsights,
              rawDataLayers: dataLayers
            };

            // Pass solar data to parent form
            onSolarDataReceived?.(solarFormData);

            toast({
              title: "Location & Solar Analysis Complete",
              description: `Found ${solarFormData.maxPanels} potential panels on ${solarFormData.roofSegments.length} roof faces`,
            });

          } catch (solarError) {
            console.error('Solar API error:', solarError);
            toast({
              title: "Solar Analysis Unavailable",
              description: "Location captured successfully, but solar analysis failed. Manual assessment required.",
              variant: "destructive",
            });
          }

          toast({
            title: "Location Captured",
            description: `GPS coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          });
          
          console.log(`Location captured: ${latitude}, ${longitude}`);
        } catch (error) {
          console.error('Error processing location:', error);
          toast({
            title: "Location Processing Error",
            description: "Failed to process location data. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Failed to get current location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Geolocation Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  return (
    <div className={cn("space-y-4", isFlagged && "flag-indicator")}>
      <Label htmlFor={id} className="text-base font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="space-y-3">
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-11 text-base rounded-lg",
            isFlagged && "border-destructive focus:ring-destructive/50"
          )}
        />

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="text-sm h-9 px-3"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {isGettingLocation ? "Getting location..." : "Get Location"}
          </Button>

          {coordinates && showSolarAnalysis && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSolarData(!showSolarData)}
              className="text-sm h-9 px-3"
            >
              <Satellite className="h-4 w-4 mr-2" />
              {showSolarData ? "Hide" : "Show"} Solar Analysis
            </Button>
          )}
        </div>

        {showGridRef && gridRef && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Grid Reference</Label>
            <Input
              value={gridRef}
              onChange={(e) => setGridRef(e.target.value)}
              placeholder="e.g., TQ123456"
              className="h-9 text-sm"
            />
          </div>
        )}

        {showWhat3Words && what3Words && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              What3Words (1m accuracy)
            </Label>
            <Input
              value={what3Words}
              onChange={(e) => setWhat3Words(e.target.value)}
              placeholder="///e.g.solar.panel.location"
              className="h-9 text-sm"
            />
          </div>
        )}

        {coordinates && showSolarData && showSolarAnalysis && (
          <div className="mt-6">
            <SolarImageryViewer 
              latitude={coordinates.lat} 
              longitude={coordinates.lng}
              address={value}
            />
          </div>
        )}
      </div>

      {isFlagged && flagMessage && (
        <div className="flex items-center space-x-2 text-base text-destructive">
          <span>⚠</span>
          <span>{flagMessage}</span>
          <button className="underline hover:no-underline">
            Click to resolve
          </button>
        </div>
      )}
    </div>
  );
}