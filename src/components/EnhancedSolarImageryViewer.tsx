import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SolarImageryViewer } from "@/components/SolarImageryViewer";

interface EnhancedSolarImageryViewerProps {
  latitude: number;
  longitude: number;
  solarData?: any;
}

/**
 * Enhanced Solar Imagery Viewer
 * Displays solar imagery with additional interactive features
 */
export function EnhancedSolarImageryViewer({
  latitude,
  longitude,
  solarData
}: EnhancedSolarImageryViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Solar Imagery Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <SolarImageryViewer
          latitude={latitude}
          longitude={longitude}
          solarData={solarData}
        />
      </CardContent>
    </Card>
  );
}

