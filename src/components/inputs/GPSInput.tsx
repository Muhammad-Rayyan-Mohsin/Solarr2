import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GoogleSolarApiService } from "@/services/googleSolarApi";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG } from "@/lib/config";

interface GPSInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  onSolarDataReceived?: (solarData: any) => void;
  onCoordinatesReceived?: (lat: number, lng: number) => void;
}

export function GPSInput({
  id,
  label,
  value,
  onChange,
  placeholder = "e.g., 51.5074, -0.1278",
  required = false,
  isFlagged = false,
  flagMessage,
  onSolarDataReceived,
  onCoordinatesReceived
}: GPSInputProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  // Sample UK coordinates for testing Solar API
  const sampleUKCoordinates = [
    { name: "London (Big Ben)", lat: 51.4994, lng: -0.1245 },
    { name: "Manchester", lat: 53.4808, lng: -2.2426 },
    { name: "Birmingham", lat: 52.4862, lng: -1.8904 },
    { name: "Bristol", lat: 51.4545, lng: -2.5879 },
    { name: "Edinburgh", lat: 55.9533, lng: -3.1883 }
  ];

  const useSampleUKLocation = (coords: { lat: number; lng: number }) => {
    const gpsString = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    onChange(gpsString);
    onCoordinatesReceived?.(coords.lat, coords.lng);
    
    // Automatically fetch solar data for UK coordinates
    fetchSolarDataForCoordinates(coords.lat, coords.lng);
  };

  const fetchSolarDataForCoordinates = async (latitude: number, longitude: number) => {
    try {
      console.log('Starting Solar API calls for coordinates:', { latitude, longitude });
      const startTime = Date.now();
      
      // Try building insights first
      console.log('Calling getBuildingInsights...');
      const buildingInsights = await GoogleSolarApiService.getBuildingInsights(latitude, longitude);
      console.log('Building insights received:', buildingInsights);
      
      // Try data layers separately
      console.log('Calling getDataLayers...');
      const dataLayers = await GoogleSolarApiService.getDataLayers(latitude, longitude, 100, 'IMAGERY_AND_ALL_FLUX_LAYERS', undefined, 0.1);
      console.log('Data layers received:', dataLayers);

      const formattedData = GoogleSolarApiService.formatSolarData(buildingInsights);

      const solarFormData = {
        maxPanels: formattedData.maxPanels,
        usableRoofArea: Math.round(buildingInsights.solarPotential.maxArrayAreaMeters2),
        totalRoofArea: Math.round(buildingInsights.solarPotential.wholeRoofStats.areaMeters2),
        estimatedYearlyEnergy: formattedData.estimatedYearlyEnergy,
        maxSunshineHours: formattedData.maxSunshineHours,
        carbonOffset: buildingInsights.solarPotential.carbonOffsetFactorKgPerMwh,
        imageryDate: formattedData.imageryDate,
        roofSegments: buildingInsights.solarPotential.roofSegmentStats.map((segment: any, index: number) => ({
          id: `roof-${index + 1}`,
          pitch: Math.round(segment.pitchDegrees),
          azimuth: Math.round(segment.azimuthDegrees),
          area: Math.round(segment.stats.areaMeters2),
          suitability: calculateSuitability(segment.azimuthDegrees, segment.pitchDegrees),
          suggestedPanels: Math.floor(segment.stats.areaMeters2 / 3),
          orientation: segment.azimuthDegrees < 45 || segment.azimuthDegrees >= 315 ? 'North' :
                     segment.azimuthDegrees < 135 ? 'East' :
                     segment.azimuthDegrees < 225 ? 'South' : 'West'
        })),
        obstructions: {
          shadingPercentage: Math.round(((buildingInsights.solarPotential.wholeRoofStats.areaMeters2 - buildingInsights.solarPotential.maxArrayAreaMeters2) / buildingInsights.solarPotential.wholeRoofStats.areaMeters2) * 100),
          usablePercentage: Math.round((buildingInsights.solarPotential.maxArrayAreaMeters2 / buildingInsights.solarPotential.wholeRoofStats.areaMeters2) * 100)
        },
        apiResponseTime: Date.now() - startTime,
        dataQuality: 'high',
        lastUpdated: new Date().toISOString(),
        rawBuildingInsights: buildingInsights,
        rawDataLayers: dataLayers
      };

      onSolarDataReceived?.(solarFormData);

      toast({
        title: "Location & Solar Analysis Complete",
        description: `Google Solar API found ${solarFormData.maxPanels} potential panels on ${solarFormData.roofSegments.length} roof faces`,
      });
    } catch (error: any) {
      console.error('Solar API error:', error);
      console.error('API Key:', API_CONFIG.GOOGLE_MAPS_API_KEY);
      console.error('Coordinates:', { latitude, longitude });
      console.error('Error details:', error.message, error.stack);
      
      // Check if it's a geographic limitation (404 error)
      const isGeographicLimit = error.message.includes('404') || error.message.includes('Not Found');
      
      if (isGeographicLimit) {
        toast({
          title: "Solar Analysis Not Available",
          description: "Google Solar API is not available in this region. Please manually enter roof information.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Solar Analysis Unavailable",
          description: `Location captured, but solar analysis failed: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  function calculateSuitability(azimuth: number, pitch: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (azimuth >= 150 && azimuth <= 210 && pitch >= 30 && pitch <= 45) return 'excellent';
    if (((azimuth >= 60 && azimuth < 150) || (azimuth > 210 && azimuth <= 300)) && pitch >= 20 && pitch <= 50) return 'good';
    if (pitch >= 15 && pitch <= 60) return 'fair';
    return 'poor';
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const gpsString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          onChange(gpsString);
          onCoordinatesReceived?.(latitude, longitude);

          // Use the shared function for solar data fetching
          fetchSolarDataForCoordinates(latitude, longitude);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
          // In a real app, you'd show a toast notification here
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setIsGettingLocation(false);
      // In a real app, you'd show a toast notification here
    }
  };

  return (
    <div className={cn("space-y-2", isFlagged && "flag-indicator")}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "survey-input pr-10",
              isFlagged && "border-destructive focus:ring-destructive/50"
            )}
          />
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="px-3 h-10 text-sm"
        >
          <Navigation className={cn(
            "h-4 w-4 mr-1",
            isGettingLocation && "animate-spin"
          )} />
          GPS
        </Button>
      </div>
      
      {/* Sample UK Coordinates for Testing */}
      <div className="mt-3">
        <Label className="text-xs font-medium text-muted-foreground mb-2 block">
          Test Solar API with UK Locations:
        </Label>
        <div className="flex flex-wrap gap-2">
          {sampleUKCoordinates.map((location, index) => (
            <Button
              key={index}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => useSampleUKLocation(location)}
              className="text-xs h-8 px-2"
            >
              {location.name}
            </Button>
          ))}
        </div>
      </div>
      
      {isFlagged && flagMessage && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
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
