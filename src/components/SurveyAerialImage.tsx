import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { API_CONFIG } from '@/lib/config';
import { downloadGeoTIFF } from '@/lib/solar/solar';
import { renderRGB } from '@/lib/solar/visualize';

interface SurveyAerialImageProps {
  latitude: number;
  longitude: number;
  rgbUrl?: string;
  maskUrl?: string;
  imageryQuality?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export function SurveyAerialImage({ 
  latitude, 
  longitude, 
  rgbUrl, 
  maskUrl,
  imageryQuality 
}: SurveyAerialImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMask, setShowMask] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (rgbUrl && maskUrl) {
      loadImage();
    }
  }, [rgbUrl, maskUrl]);

  // Re-render when mask toggle changes
  useEffect(() => {
    if (imageUrl && rgbUrl && maskUrl) {
      loadImage();
    }
  }, [showMask]);

  const loadImage = async () => {
    if (!rgbUrl) return;

    try {
      setIsLoading(true);
      setError(null);

      const rgb = await downloadGeoTIFF(rgbUrl, API_CONFIG.GOOGLE_MAPS_API_KEY);
      
      let canvas: HTMLCanvasElement;
      if (showMask && maskUrl) {
        const mask = await downloadGeoTIFF(maskUrl, API_CONFIG.GOOGLE_MAPS_API_KEY);
        canvas = renderRGB(rgb, mask);
      } else {
        canvas = renderRGB(rgb);
      }
      
      setImageUrl(canvas.toDataURL());
    } catch (err) {
      console.error('Error rendering aerial image:', err);
      setError(err.message || 'Failed to load aerial image');
    } finally {
      setIsLoading(false);
    }
  };

  if (!rgbUrl) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Property Aerial View</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {imageryQuality && (
              <Badge variant={
                imageryQuality === 'HIGH' ? 'default' :
                imageryQuality === 'MEDIUM' ? 'secondary' : 'outline'
              } className="text-xs">
                {imageryQuality === 'HIGH' ? '10' : imageryQuality === 'MEDIUM' ? '25' : '50'} cm/pixel
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded max-w-2xl mx-auto">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading aerial imagery...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64 bg-red-50 rounded border border-red-200 max-w-2xl mx-auto">
              <div className="text-center text-red-600">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
                <Button 
                  onClick={loadImage}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && imageUrl && (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 max-w-2xl mx-auto">
                <img 
                  src={imageUrl} 
                  alt="Property aerial view"
                  className="w-full h-auto max-h-80 object-contain"
                />
              </div>

              <div className="flex items-center justify-between px-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMask}
                    onChange={(e) => setShowMask(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>Show roof area only</span>
                </label>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadImage}
                  className="text-xs"
                >
                  Refresh
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="text-blue-900">
                  <strong>Use this image to:</strong>
                </p>
                <ul className="list-disc list-inside text-blue-800 mt-1 space-y-1">
                  <li>Verify the property location</li>
                  <li>Identify roof sections and obstructions</li>
                  <li>Check surrounding trees and shading</li>
                  <li>Confirm access points for installation</li>
                </ul>
              </div>
            </div>
          )}

          {!isLoading && !error && !imageUrl && (
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded border border-dashed border-gray-300 max-w-2xl mx-auto">
              <Button 
                onClick={loadImage}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Load Aerial Image
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

