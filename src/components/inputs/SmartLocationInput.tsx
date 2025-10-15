/**
 * Smart Location Input
 * Enter ANY location data (address, postcode, coordinates, what3words)
 * and automatically enriches all other location fields
 */

import { useState } from 'react';
import { MapPin, Loader2, CheckCircle2, Search, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LocationEnrichmentService, type LocationData } from '@/services/locationEnrichmentService';
import { useToast } from '@/hooks/use-toast';

interface SmartLocationInputProps {
  onLocationEnriched: (data: LocationData) => void;
  className?: string;
}

export function SmartLocationInput({ onLocationEnriched, className }: SmartLocationInputProps) {
  const [input, setInput] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichedData, setEnrichedData] = useState<LocationData | null>(null);
  const { toast } = useToast();

  const handleEnrich = async () => {
    if (!input.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter an address, postcode, coordinates, or What3Words',
        variant: 'destructive',
      });
      return;
    }

    setIsEnriching(true);

    try {
      const result = await LocationEnrichmentService.smartEnrich(input);

      if (result.success && result.data) {
        setEnrichedData(result.data);
        onLocationEnriched(result.data);
        
        toast({
          title: 'Location Enriched!',
          description: `Successfully enriched from ${result.source}`,
        });
      } else {
        toast({
          title: 'Enrichment Failed',
          description: result.error || 'Could not find location data',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while enriching location',
        variant: 'destructive',
      });
    } finally {
      setIsEnriching(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'GPS Not Available',
        description: 'Geolocation is not supported by this browser',
        variant: 'destructive',
      });
      return;
    }

    setIsEnriching(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setInput(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        
        try {
          const result = await LocationEnrichmentService.enrichFromCoordinates(latitude, longitude);
          
          if (result.success && result.data) {
            setEnrichedData(result.data);
            onLocationEnriched(result.data);
            
            toast({
              title: 'Location Captured!',
              description: 'GPS location enriched successfully',
            });
          }
        } catch (error: any) {
          toast({
            title: 'Error',
            description: 'Failed to enrich GPS location',
            variant: 'destructive',
          });
        } finally {
          setIsEnriching(false);
        }
      },
      (error) => {
        setIsEnriching(false);
        toast({
          title: 'GPS Error',
          description: error.message || 'Could not get current location',
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Input */}
      <div className="space-y-2">
        <Label htmlFor="smart-location" className="text-sm font-medium">
          Enter Location
          <span className="text-muted-foreground ml-2 text-xs">
            (Address, Postcode, Coordinates, or What3Words)
          </span>
        </Label>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="smart-location"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEnrich()}
              placeholder="e.g., 123 Main St, SW1A 1AA, 51.5074,-0.1278, or ///filled.count.soap"
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          <Button
            type="button"
            onClick={handleEnrich}
            disabled={isEnriching || !input.trim()}
            className="px-4"
          >
            {isEnriching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enriching...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Enrich
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleGetCurrentLocation}
            disabled={isEnriching}
            className="px-3"
          >
            <Navigation className={cn(
              'h-4 w-4',
              isEnriching && 'animate-spin'
            )} />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Enter any location format and we'll automatically fill all related fields
        </p>
      </div>

      {/* Enriched Data Preview */}
      {enrichedData && (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200 space-y-3">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Location Data Enriched</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {enrichedData.address && (
              <div>
                <p className="text-muted-foreground text-xs">Address</p>
                <p className="font-medium">{enrichedData.address}</p>
              </div>
            )}
            {enrichedData.postcode && (
              <div>
                <p className="text-muted-foreground text-xs">Postcode</p>
                <p className="font-medium">{enrichedData.postcode}</p>
              </div>
            )}
            {enrichedData.gridReference && (
              <div>
                <p className="text-muted-foreground text-xs">Coordinates</p>
                <p className="font-medium">{enrichedData.gridReference}</p>
              </div>
            )}
            {enrichedData.what3words && (
              <div>
                <p className="text-muted-foreground text-xs">What3Words</p>
                <p className="font-medium">{enrichedData.what3words}</p>
              </div>
            )}
          </div>

          {enrichedData.solarData && (
            <Badge variant="default" className="mt-2">
              Solar Data Available
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

