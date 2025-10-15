import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, Navigation, Globe, Hash, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LocationEnrichmentService, LocationData } from "@/services/locationEnrichmentService";
import { useToast } from "@/hooks/use-toast";

interface EnhancedLocationInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  onLocationDataReceived?: (data: LocationData) => void;
  onCoordinatesReceived?: (lat: number, lng: number) => void;
  showSuggestions?: boolean;
  autoEnrich?: boolean;
  enableGPS?: boolean;
  showInputType?: boolean;
}

export function EnhancedLocationInput({
  id,
  label,
  value,
  onChange,
  placeholder = "Enter address, postcode, coordinates, or What3Words",
  required = false,
  isFlagged = false,
  flagMessage,
  onLocationDataReceived,
  onCoordinatesReceived,
  showSuggestions = true,
  autoEnrich = true,
  enableGPS = true,
  showInputType = true,
}: EnhancedLocationInputProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [detectedType, setDetectedType] = useState<string>("");
  const [lastEnrichedData, setLastEnrichedData] = useState<LocationData | null>(null);
  
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Detect input type and update UI
  useEffect(() => {
    if (value.trim()) {
      const inputType = LocationEnrichmentService.detectInputType(value);
      setDetectedType(inputType);
      
      // Auto-enrich if enabled and input is complete enough
      if (autoEnrich && shouldAutoEnrich(value, inputType)) {
        debouncedEnrich(value);
      }
    } else {
      setDetectedType("");
      setSuggestions([]);
      setShowSuggestionsList(false);
    }
  }, [value, autoEnrich]);

  // Handle clicks outside suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestionsList(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shouldAutoEnrich = (input: string, type: string): boolean => {
    switch (type) {
      case 'coordinates':
        return input.match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/) !== null;
      case 'postcode':
        return input.match(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i) !== null;
      case 'what3words':
        return input.match(/^\/\/\/[a-z]+\.[a-z]+\.[a-z]+$/i) !== null;
      case 'address':
        return input.length > 10; // Only auto-enrich longer addresses
      default:
        return false;
    }
  };

  const debouncedEnrich = (input: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      enrichLocation(input);
    }, 1000); // 1 second delay
  };

  const enrichLocation = async (input: string) => {
    if (!input.trim() || isEnriching) return;

    setIsEnriching(true);
    
    try {
      const enrichedData = await LocationEnrichmentService.enrichLocation(input);
      
      if (enrichedData) {
        setLastEnrichedData(enrichedData);
        
        // Update the main input with the formatted address
        onChange(enrichedData.siteAddress);
        
        // Notify parent components
        onLocationDataReceived?.(enrichedData);
        
        if (enrichedData.coordinates) {
          const [lat, lng] = enrichedData.coordinates.split(',').map(Number);
          onCoordinatesReceived?.(lat, lng);
        }

        toast({
          title: "Location Enriched",
          description: `Found: ${enrichedData.siteAddress}`,
        });
      }
    } catch (error) {
      console.error('Location enrichment failed:', error);
      toast({
        title: "Enrichment Failed",
        description: error instanceof Error ? error.message : "Could not enrich location data",
        variant: "destructive",
      });
    } finally {
      setIsEnriching(false);
    }
  };

  const getSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const inputType = LocationEnrichmentService.detectInputType(query);
      
      if (inputType === 'postcode') {
        const postcodeSuggestions = await LocationEnrichmentService.getPostcodeSuggestions(query);
        setSuggestions(postcodeSuggestions);
      } else {
        const addressSuggestions = await LocationEnrichmentService.getAddressSuggestions(query);
        setSuggestions(addressSuggestions);
      }
      
      setShowSuggestionsList(true);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Get suggestions with debounce
    if (showSuggestions && newValue.length >= 3) {
      debounceRef.current = setTimeout(() => {
        getSuggestions(newValue);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestionsList(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestionsList(false);
    setSuggestions([]);
    
    // Auto-enrich the selected suggestion
    if (autoEnrich) {
      enrichLocation(suggestion);
    }
  };

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
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;
      const coordinates = `${latitude}, ${longitude}`;
      
      onChange(coordinates);
      
      // Auto-enrich from coordinates
      if (autoEnrich) {
        enrichLocation(coordinates);
      }

      toast({
        title: "Location Captured",
        description: `GPS coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    } catch (error) {
      console.error('GPS error:', error);
      toast({
        title: "GPS Failed",
        description: error instanceof Error ? error.message : "Could not get current location",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const getInputTypeIcon = (type: string) => {
    switch (type) {
      case 'coordinates':
        return <Navigation className="h-4 w-4 text-blue-500" />;
      case 'postcode':
        return <Hash className="h-4 w-4 text-green-500" />;
      case 'what3words':
        return <Globe className="h-4 w-4 text-purple-500" />;
      case 'address':
        return <MapPin className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getInputTypeLabel = (type: string) => {
    switch (type) {
      case 'coordinates':
        return 'Coordinates';
      case 'postcode':
        return 'Postcode';
      case 'what3words':
        return 'What3Words';
      case 'address':
        return 'Address';
      default:
        return '';
    }
  };

  return (
    <div className={cn("space-y-3", isFlagged && "flag-indicator")}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        {showInputType && detectedType && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {getInputTypeIcon(detectedType)}
            <span>{getInputTypeLabel(detectedType)}</span>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              id={id}
              type="text"
              value={value}
              onChange={handleInputChange}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestionsList(true);
                }
              }}
              placeholder={placeholder}
              className={cn(
                "pr-10",
                isFlagged && "border-warning focus:border-warning focus:ring-warning",
                isEnriching && "bg-blue-50 border-blue-200"
              )}
              required={required}
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {isEnriching && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => enrichLocation(value)}
              disabled={isEnriching || !value.trim()}
              className="px-3"
              title="Enrich Location Data"
            >
              {isEnriching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
            </Button>

            {enableGPS && (
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="px-3"
                title="Get Current Location"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestionsList && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enriched Data Preview */}
      {lastEnrichedData && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="text-sm font-medium text-green-800 mb-2">Enriched Location Data:</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
            <div><strong>Address:</strong> {lastEnrichedData.siteAddress}</div>
            <div><strong>Postcode:</strong> {lastEnrichedData.postcode}</div>
            <div><strong>Coordinates:</strong> {lastEnrichedData.coordinates}</div>
            <div><strong>Country:</strong> {lastEnrichedData.country}</div>
            {lastEnrichedData.what3Words && (
              <div className="col-span-2"><strong>What3Words:</strong> {lastEnrichedData.what3Words}</div>
            )}
          </div>
        </div>
      )}

      {isFlagged && flagMessage && (
        <p className="text-sm text-warning font-medium">{flagMessage}</p>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>Supported formats:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Address:</strong> "123 Main Street, London"</li>
          <li><strong>Postcode:</strong> "SW1A 1AA" (UK)</li>
          <li><strong>Coordinates:</strong> "51.5074, -0.1278"</li>
          <li><strong>What3Words:</strong> "///filled.count.soap"</li>
        </ul>
      </div>
    </div>
  );
}
