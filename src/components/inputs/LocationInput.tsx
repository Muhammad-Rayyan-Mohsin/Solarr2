import { useState } from "react";
import { MapPin, Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SolarImageryViewer } from "@/components/SolarImageryViewer";

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
}: LocationInputProps) {
  const [gridRef, setGridRef] = useState("");
  const [what3Words, setWhat3Words] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showSolarData, setShowSolarData] = useState(false);

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Store coordinates for solar analysis
        setCoordinates({ lat: latitude, lng: longitude });
        
        // Generate grid reference (simplified UK grid reference format)
        const gridReference = `TQ${Math.floor(latitude * 1000).toString().padStart(3, '0')}${Math.floor(longitude * 1000).toString().padStart(3, '0')}`;
        setGridRef(gridReference);
        
        // For what3words, in a real implementation you'd call their API
        // For now, we'll generate a mock what3words address
        const words = ['solar', 'panel', 'survey', 'green', 'energy', 'roof', 'home', 'power'];
        const mockWhat3Words = `///${words[Math.floor(Math.random() * words.length)]}.${words[Math.floor(Math.random() * words.length)]}.${words[Math.floor(Math.random() * words.length)]}`;
        setWhat3Words(mockWhat3Words);
        
        // Update the main address field with coordinates for reference
        onChange(`${value} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`);
        
        console.log(`Location captured: ${latitude}, ${longitude}`);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
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