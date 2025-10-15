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
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [gridRef, setGridRef] = useState("");
  const [what3Words, setWhat3Words] = useState("");
  const [solarData, setSolarData] = useState<any>(null);
  const [showSolarData, setShowSolarData] = useState(false);
  const [isLoadingSolar, setIsLoadingSolar] = useState(false);
  
  const { toast } = useToast();

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS Not Available",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      setCoordinates({ lat: latitude, lng: longitude });
      setGridRef(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);

      // Reverse geocode to get address
      try {
        const geocodeResult = await GoogleGeocodingApiService.reverseGeocode(latitude, longitude);
        if (geocodeResult.results && geocodeResult.results.length > 0) {
          onChange(geocodeResult.results[0].formatted_address);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }

      // Get What3Words
      if (showWhat3Words) {
        try {
          const w3wResult = await What3WordsApiService.convertCoordinates(latitude, longitude);
          if (w3wResult.words) {
            setWhat3Words(`///${w3wResult.words}`);
          }
        } catch (error) {
          console.error("What3Words error:", error);
        }
      }

      // Get Solar Data
      if (showSolarAnalysis) {
        await fetchSolarData(latitude, longitude);
      }

      if (onCoordinatesReceived) {
        onCoordinatesReceived(latitude, longitude);
      }

      toast({
        title: "Location Captured",
        description: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    } catch (error) {
      console.error("Geolocation error:", error);
      toast({
        title: "Location Error",
        description: error instanceof Error ? error.message : "Could not get your location",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const fetchSolarData = async (lat: number, lng: number) => {
    setIsLoadingSolar(true);
    try {
      const data = await GoogleSolarApiService.getBuildingInsights(lat, lng);
      setSolarData(data);
      if (onSolarDataReceived) {
        onSolarDataReceived(data);
      }
    } catch (error) {
      console.error("Solar API error:", error);
      toast({
        title: "Solar Data Unavailable",
        description: "Could not fetch solar analysis for this location",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSolar(false);
    }
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
            <Label className="text-sm font-medium text-muted-foreground">What3Words</Label>
            <Input
              value={what3Words}
              onChange={(e) => setWhat3Words(e.target.value)}
              placeholder="///word.word.word"
              className="h-9 text-sm"
            />
          </div>
        )}

        {isLoadingSolar && (
          <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-blue-700">Loading solar analysis...</span>
          </div>
        )}

        {showSolarData && solarData && coordinates && (
          <SolarImageryViewer
            latitude={coordinates.lat}
            longitude={coordinates.lng}
            solarData={solarData}
          />
        )}
      </div>

      {isFlagged && flagMessage && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <span>{flagMessage}</span>
        </div>
      )}
    </div>
  );
}
