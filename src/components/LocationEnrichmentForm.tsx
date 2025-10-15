import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EnhancedLocationInput } from "@/components/inputs/EnhancedLocationInput";
import { LocationData } from "@/services/locationEnrichmentService";
import { validateLocationApis } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Info, Zap, MapPin, Hash, Globe, Navigation } from "lucide-react";

interface LocationEnrichmentFormProps {
  onLocationDataReceived?: (data: LocationData) => void;
  onCoordinatesReceived?: (lat: number, lng: number) => void;
  initialData?: Partial<LocationData>;
}

export function LocationEnrichmentForm({
  onLocationDataReceived,
  onCoordinatesReceived,
  initialData,
}: LocationEnrichmentFormProps) {
  const [locationData, setLocationData] = useState<LocationData | null>(
    initialData ? {
      siteAddress: initialData.siteAddress || '',
      postcode: initialData.postcode || '',
      coordinates: initialData.coordinates || '',
      gridReference: initialData.gridReference || '',
      what3Words: initialData.what3Words || '',
      country: initialData.country || '',
      county: initialData.county || '',
      city: initialData.city || '',
    } : null
  );
  
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const apiStatus = validateLocationApis();

  const handleLocationDataReceived = (data: LocationData) => {
    setLocationData(data);
    onLocationDataReceived?.(data);
  };

  const handleCoordinatesReceived = (lat: number, lng: number) => {
    onCoordinatesReceived?.(lat, lng);
  };

  const handleManualEnrich = async () => {
    if (!locationData?.siteAddress && !locationData?.coordinates && !locationData?.postcode) {
      toast({
        title: "No Data to Enrich",
        description: "Please enter some location data first",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    
    try {
      // Try to enrich from the most complete data available
      const input = locationData.siteAddress || locationData.coordinates || locationData.postcode || '';
      
      if (input) {
        // Import the service dynamically to avoid circular imports
        const { LocationEnrichmentService } = await import('@/services/locationEnrichmentService');
        const enrichedData = await LocationEnrichmentService.enrichLocation(input);
        
        if (enrichedData) {
          setLocationData(enrichedData);
          onLocationDataReceived?.(enrichedData);
          
          toast({
            title: "Location Enriched Successfully",
            description: "All location fields have been updated",
          });
        }
      }
    } catch (error) {
      console.error('Manual enrichment failed:', error);
      toast({
        title: "Enrichment Failed",
        description: error instanceof Error ? error.message : "Could not enrich location data",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (hasValue: boolean) => {
    return hasValue ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-gray-400" />
    );
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
        return <MapPin className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Location Enrichment APIs</span>
          </CardTitle>
          <CardDescription>
            Available location data sources and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Available APIs:</span>
              <div className="flex flex-wrap gap-2">
                {apiStatus.available.map((api) => (
                  <Badge key={api} variant="default" className="text-xs">
                    {api}
                  </Badge>
                ))}
              </div>
            </div>
            
            {apiStatus.missing.length > 0 && (
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Missing API Keys:</p>
                  <ul className="list-disc list-inside mt-1">
                    {apiStatus.missing.map((missing) => (
                      <li key={missing}>{missing}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Location Input */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Location Input</CardTitle>
          <CardDescription>
            Enter any location format - address, postcode, coordinates, or What3Words. 
            The system will automatically detect the format and enrich all related fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedLocationInput
            id="smart-location"
            label="Location"
            value={locationData?.siteAddress || ''}
            onChange={(value) => {
              setLocationData(prev => prev ? { ...prev, siteAddress: value } : {
                siteAddress: value,
                postcode: '',
                coordinates: '',
                country: '',
              } as LocationData);
            }}
            placeholder="Enter address, postcode, coordinates, or What3Words"
            required
            onLocationDataReceived={handleLocationDataReceived}
            onCoordinatesReceived={handleCoordinatesReceived}
            showSuggestions
            autoEnrich
            enableGPS
            showInputType
          />
        </CardContent>
      </Card>

      {/* Enriched Data Display */}
      {locationData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Enriched Location Data</span>
            </CardTitle>
            <CardDescription>
              All location fields have been automatically populated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(!!locationData.siteAddress)}
                    <span className="text-sm font-medium">Site Address</span>
                  </div>
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {locationData.siteAddress || 'Not available'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(!!locationData.postcode)}
                    <span className="text-sm font-medium">Postcode</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {locationData.postcode || 'Not available'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(!!locationData.coordinates)}
                    <span className="text-sm font-medium">Coordinates</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {locationData.coordinates || 'Not available'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(!!locationData.country)}
                    <span className="text-sm font-medium">Country</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {locationData.country || 'Not available'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(!!locationData.county)}
                    <span className="text-sm font-medium">County</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {locationData.county || 'Not available'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(!!locationData.city)}
                    <span className="text-sm font-medium">City</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {locationData.city || 'Not available'}
                  </span>
                </div>
              </div>
            </div>

            {locationData.what3Words && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(!!locationData.what3Words)}
                    <span className="text-sm font-medium">What3Words</span>
                  </div>
                  <span className="text-sm text-muted-foreground font-mono">
                    {locationData.what3Words}
                  </span>
                </div>
              </>
            )}

            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleManualEnrich}
                disabled={isValidating}
                variant="outline"
                size="sm"
              >
                {isValidating ? 'Enriching...' : 'Re-enrich Location'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Input Formats</CardTitle>
          <CardDescription>
            Examples of different location formats you can enter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Address Examples</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• "10 Downing Street, Westminster, London"</p>
                <p>• "123 Main Street, New York, NY"</p>
                <p>• "42 Clifton Down Road, Bristol"</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Other Formats</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• <strong>UK Postcode:</strong> "SW1A 1AA"</p>
                <p>• <strong>Coordinates:</strong> "51.5074, -0.1278"</p>
                <p>• <strong>What3Words:</strong> "///filled.count.soap"</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
