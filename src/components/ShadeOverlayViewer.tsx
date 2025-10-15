import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudOff } from "lucide-react";

interface ShadeOverlayViewerProps {
  shadeData?: any;
  width?: number;
  height?: number;
}

/**
 * Shade Overlay Viewer
 * Displays shade analysis overlay from solar API
 */
export function ShadeOverlayViewer({
  shadeData,
  width = 500,
  height = 400
}: ShadeOverlayViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CloudOff className="h-5 w-5" />
          <span>Shade Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border"
          style={{ width, height }}
        >
          <div className="text-center p-6">
            <CloudOff className="h-12 w-12 mx-auto mb-3 text-orange-400" />
            <p className="text-gray-700 font-medium">Shade Analysis</p>
            <p className="text-sm text-gray-500 mt-2">
              Analyzing shade patterns for solar installation
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

