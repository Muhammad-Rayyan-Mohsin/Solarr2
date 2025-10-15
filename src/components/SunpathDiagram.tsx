import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, CloudOff } from 'lucide-react';

interface SunPathDiagramProps {
  latitude: number;
  longitude: number;
  obstructions?: string[];
  sunshineQuantiles?: number[];
  imageryQuality?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export function SunPathDiagram({
  latitude,
  longitude,
  obstructions = [],
  sunshineQuantiles = [],
  imageryQuality
}: SunPathDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = Math.min(canvas.parentElement?.clientWidth || 600, 600);
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, size, size);

    // Draw concentric circles (altitude lines)
    const altitudes = [0, 15, 30, 45, 60, 75, 90];
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    altitudes.forEach((alt) => {
      const r = radius * (1 - alt / 90);
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
      ctx.stroke();

      // Label altitude
      if (alt > 0 && alt < 90) {
        ctx.fillStyle = '#9e9e9e';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${alt}°`, centerX + r + 15, centerY);
      }
    });

    // Draw azimuth lines (compass directions)
    const directions = [
      { angle: 0, label: 'N' },
      { angle: 45, label: 'NE' },
      { angle: 90, label: 'E' },
      { angle: 135, label: 'SE' },
      { angle: 180, label: 'S' },
      { angle: 225, label: 'SW' },
      { angle: 270, label: 'W' },
      { angle: 315, label: 'NW' }
    ];

    directions.forEach(({ angle, label }) => {
      const rad = (angle - 90) * Math.PI / 180;
      const x1 = centerX;
      const y1 = centerY;
      const x2 = centerX + radius * Math.cos(rad);
      const y2 = centerY + radius * Math.sin(rad);

      ctx.strokeStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Label direction
      const labelX = centerX + (radius + 25) * Math.cos(rad);
      const labelY = centerY + (radius + 25) * Math.sin(rad);
      ctx.fillStyle = '#424242';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, labelX, labelY);
    });

    // Draw sun path curves for different months
    const months = [
      { month: 'Jun 21', altitude: 90 - Math.abs(latitude - 23.5), color: '#FFD700' },
      { month: 'Mar/Sep 21', altitude: 90 - Math.abs(latitude), color: '#FFA500' },
      { month: 'Dec 21', altitude: 90 - Math.abs(latitude + 23.5), color: '#FF8C00' }
    ];

    months.forEach(({ month, altitude: maxAlt, color }) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Calculate sun path arc
      const sunriseAzimuth = latitude > 0 ? 90 : 270;
      const sunsetAzimuth = latitude > 0 ? 270 : 90;

      for (let az = sunriseAzimuth; az <= sunsetAzimuth; az += 5) {
        const hourAngle = (az - 180) / 15;
        const alt = Math.max(0, maxAlt * Math.sin(hourAngle * Math.PI / 12));
        const r = radius * (1 - alt / 90);
        const rad = (az - 90) * Math.PI / 180;
        const x = centerX + r * Math.cos(rad);
        const y = centerY + r * Math.sin(rad);

        if (az === sunriseAzimuth) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Label month
      const labelAz = 180;
      const labelAlt = maxAlt * 0.8;
      const labelR = radius * (1 - labelAlt / 90);
      const labelRad = (labelAz - 90) * Math.PI / 180;
      const labelX = centerX + labelR * Math.cos(labelRad);
      const labelY = centerY + labelR * Math.sin(labelRad);
      
      ctx.fillStyle = color;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(month, labelX, labelY);
    });

    // Draw obstruction zones (simplified representation)
    if (obstructions.length > 0) {
      ctx.fillStyle = 'rgba(60, 60, 60, 0.6)';
      
      // Draw sample obstruction areas based on common obstruction positions
      obstructions.forEach((obs, idx) => {
        const baseAngle = (idx * 60) - 90; // Distribute around compass
        const angleSpread = 30;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        
        for (let angle = baseAngle; angle <= baseAngle + angleSpread; angle += 2) {
          const rad = angle * Math.PI / 180;
          const obstHeight = 15 + Math.random() * 20; // Random height between 15-35°
          const r = radius * (1 - obstHeight / 90);
          const x = centerX + r * Math.cos(rad);
          const y = centerY + r * Math.sin(rad);
          ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.fill();

        // Label obstruction
        const labelRad = (baseAngle + angleSpread / 2) * Math.PI / 180;
        const labelR = radius * 0.7;
        const labelX = centerX + labelR * Math.cos(labelRad);
        const labelY = centerY + labelR * Math.sin(labelRad);
        
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obs.substring(0, 8), labelX, labelY);
      });
    }

    // Draw hour markers around the perimeter
    for (let hour = 6; hour <= 18; hour++) {
      const angle = ((hour - 6) / 12) * 180;
      const rad = (angle - 90) * Math.PI / 180;
      
      // Draw sun icon
      const sunX = centerX + (radius + 35) * Math.cos(rad);
      const sunY = centerY + (radius + 35) * Math.sin(rad);
      
      ctx.fillStyle = '#FDB813';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw sun rays
      for (let i = 0; i < 8; i++) {
        const rayAngle = (i * 45) * Math.PI / 180;
        const x1 = sunX + 10 * Math.cos(rayAngle);
        const y1 = sunY + 10 * Math.sin(rayAngle);
        const x2 = sunX + 14 * Math.cos(rayAngle);
        const y2 = sunY + 14 * Math.sin(rayAngle);
        
        ctx.strokeStyle = '#FDB813';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw hour label
      const hourX = centerX + (radius + 55) * Math.cos(rad);
      const hourY = centerY + (radius + 55) * Math.sin(rad);
      ctx.fillStyle = '#424242';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${hour}:00`, hourX, hourY);
    }

    // Draw center point
    ctx.fillStyle = '#424242';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Add title text
    ctx.fillStyle = '#424242';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sun Path Diagram', centerX, 25);
    
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(`Location: ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`, centerX, 45);

  }, [latitude, longitude, obstructions, sunshineQuantiles]);

  const avgSunshine = sunshineQuantiles.length > 0 
    ? Math.round(sunshineQuantiles.reduce((a, b) => a + b, 0) / sunshineQuantiles.length)
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-500" />
            Solar Path Analysis
          </CardTitle>
          {imageryQuality && (
            <Badge variant={imageryQuality === 'HIGH' ? 'default' : 'secondary'}>
              {imageryQuality} Quality
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas */}
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef} 
            className="border border-gray-200 rounded-lg shadow-sm"
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              Sun Path Lines
            </h4>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-yellow-400"></div>
                <span>Summer Solstice (Jun 21)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-orange-400"></div>
                <span>Equinox (Mar/Sep 21)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-orange-600"></div>
                <span>Winter Solstice (Dec 21)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <CloudOff className="h-4 w-4 text-gray-600" />
              Shading Information
            </h4>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-600 opacity-60 rounded"></div>
                <span>Obstructed Areas</span>
              </div>
              {avgSunshine > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">
                    Avg. Daily Sunshine: {avgSunshine}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Obstructions List */}
        {obstructions.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-sm mb-2">Detected Obstructions:</h4>
            <div className="flex flex-wrap gap-2">
              {obstructions.map((obs, idx) => (
                <Badge key={idx} variant="outline">
                  {obs}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          <p>
            <strong>Reading the Diagram:</strong> The center represents directly overhead (90°). 
            Concentric circles show altitude angles. Curved lines show the sun's path across the 
            sky throughout the year. Gray areas indicate obstructions that may cast shadows on your roof.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
