import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cube } from "lucide-react";

interface SimpleSolar3DViewerProps {
  solarData?: any;
  width?: number;
  height?: number;
}

/**
 * Simple Solar 3D Viewer
 * Placeholder for 3D solar visualization
 * TODO: Implement actual 3D rendering with Three.js or similar
 */
export function SimpleSolar3DViewer({
  solarData,
  width = 600,
  height = 400
}: SimpleSolar3DViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cube className="h-5 w-5" />
          <span>3D Solar Visualization</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300"
          style={{ width, height }}
        >
          <div className="text-center p-8">
            <Cube className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-medium">3D Visualization</p>
            <p className="text-sm text-gray-500 mt-2">
              3D rendering features coming soon
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

