import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface InteractiveSolarMapOverlayProps {
  latitude: number;
  longitude: number;
  solarData?: any;
  onMarkerClick?: (data: any) => void;
}

/**
 * Interactive Solar Map Overlay
 * Displays solar data as an interactive map overlay
 */
export function InteractiveSolarMapOverlay({
  latitude,
  longitude,
  solarData,
  onMarkerClick
}: InteractiveSolarMapOverlayProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-center h-64 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-blue-500" />
            <p className="text-gray-600">Interactive Map Overlay</p>
            <p className="text-sm text-gray-500 mt-1">
              Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

