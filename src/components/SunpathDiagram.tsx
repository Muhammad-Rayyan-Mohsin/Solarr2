import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun } from "lucide-react";

interface SunpathDiagramProps {
  latitude: number;
  longitude: number;
  date?: Date;
}

/**
 * Sunpath Diagram
 * Displays the path of the sun throughout the day
 */
export function SunpathDiagram({
  latitude,
  longitude,
  date = new Date()
}: SunpathDiagramProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sun className="h-5 w-5 text-yellow-500" />
          <span>Sun Path Diagram</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-80 bg-gradient-to-b from-blue-100 to-yellow-50 rounded-lg border">
          <div className="text-center p-6">
            <Sun className="h-16 w-16 mx-auto mb-4 text-yellow-500 animate-pulse" />
            <p className="text-gray-700 font-medium">Sun Path Analysis</p>
            <p className="text-sm text-gray-600 mt-2">
              Location: {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {date.toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

