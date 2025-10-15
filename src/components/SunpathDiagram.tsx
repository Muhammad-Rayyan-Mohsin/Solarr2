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

    // Set canvas size - rectangular for side view
    const width = Math.min(canvas.parentElement?.clientWidth || 700, 700);
    const height = width * 0.75;
    canvas.width = width;
    canvas.height = height;

    const margin = 60;
    const plotWidth = width - (margin * 2);
    const plotHeight = height - (margin * 2);
    const originX = margin;
    const originY = height - margin;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines (horizontal - altitude)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    const altitudeSteps = [0, 15, 30, 45, 60, 75, 90];
    
    altitudeSteps.forEach(alt => {
      const y = originY - (alt / 90) * plotHeight;
      
      // Solid line for major angles
      if (alt % 30 === 0) {
        ctx.strokeStyle = '#bdbdbd';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
      }
      
      ctx.beginPath();
      ctx.moveTo(originX, y);
      ctx.lineTo(originX + plotWidth, y);
      ctx.stroke();
      
      // Label altitude
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${alt}°`, originX - 10, y);
    });

    // Draw grid lines (vertical - azimuth/time)
    const azimuthSteps = [-90, -60, -45, -30, 0, 30, 45, 60, 90]; // degrees from south
    const directions = ['East', '', '', 'SE', 'South', 'SW', '', '', 'West'];
    
    azimuthSteps.forEach((az, idx) => {
      const x = originX + ((az + 90) / 180) * plotWidth;
      
      // Dashed line for minor angles
      if (az % 45 === 0) {
        ctx.strokeStyle = '#bdbdbd';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
      }
      
      ctx.beginPath();
      ctx.moveTo(x, originY);
      ctx.lineTo(x, originY - plotHeight);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Label direction
      if (directions[idx]) {
        ctx.fillStyle = '#424242';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(directions[idx], x, originY + 25);
      }
    });

    // Draw axes
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + plotWidth, originY);
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, originY - plotHeight);
    ctx.stroke();

    // Helper function to convert azimuth/altitude to x/y
    const azAltToXY = (azimuth: number, altitude: number) => {
      const x = originX + ((azimuth + 90) / 180) * plotWidth;
      const y = originY - (altitude / 90) * plotHeight;
      return { x, y };
    };

    // Calculate solar declination and sun paths
    const calculateSunPath = (declination: number) => {
      const points: { az: number; alt: number }[] = [];
      
      // Calculate sun position throughout the day
      for (let hour = -6; hour <= 6; hour += 0.25) {
        const hourAngle = hour * 15; // degrees
        
        // Calculate altitude
        const latRad = latitude * Math.PI / 180;
        const decRad = declination * Math.PI / 180;
        const haRad = hourAngle * Math.PI / 180;
        
        const sinAlt = Math.sin(latRad) * Math.sin(decRad) + 
                       Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
        const altitude = Math.asin(sinAlt) * 180 / Math.PI;
        
        if (altitude > 0) {
          // Calculate azimuth
          const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / 
                        (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)));
          let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180 / Math.PI;
          
          if (hour > 0) azimuth = -azimuth;
          
          points.push({ az: azimuth, alt: altitude });
        }
      }
      
      return points;
    };

    // Draw sun path curves for different seasons
    const seasons = [
      { name: 'Jun 21', declination: 23.5, color: '#FFD700', lineWidth: 2.5 },
      { name: 'Mar/Sep 21', declination: 0, color: '#FFA500', lineWidth: 2 },
      { name: 'Dec 21', declination: -23.5, color: '#FF8C00', lineWidth: 2 }
    ];

    seasons.forEach(({ name, declination, color, lineWidth }) => {
      const points = calculateSunPath(declination);
      
      if (points.length > 0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        
        points.forEach((point, idx) => {
          const { x, y } = azAltToXY(point.az, point.alt);
          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();
        
        // Label the curve
        const midPoint = points[Math.floor(points.length / 2)];
        const { x, y } = azAltToXY(midPoint.az, midPoint.alt);
        ctx.fillStyle = color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name, x, y - 10);
      }
    });

    // Draw obstruction zones
    if (obstructions.length > 0) {
      ctx.fillStyle = 'rgba(60, 60, 60, 0.7)';
      
      obstructions.forEach((obs, idx) => {
        // Distribute obstructions across the diagram
        const baseAz = -60 + (idx * 40);
        const azSpread = 25;
        const maxHeight = 20 + Math.random() * 25;
        
        ctx.beginPath();
        const startPoint = azAltToXY(baseAz, 0);
        ctx.moveTo(startPoint.x, startPoint.y);
        
        // Draw obstruction profile
        for (let az = baseAz; az <= baseAz + azSpread; az += 2) {
          const height = maxHeight * Math.sin(((az - baseAz) / azSpread) * Math.PI);
          const point = azAltToXY(az, height);
          ctx.lineTo(point.x, point.y);
        }
        
        const endPoint = azAltToXY(baseAz + azSpread, 0);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.closePath();
        ctx.fill();
        
        // Label obstruction
        const labelPoint = azAltToXY(baseAz + azSpread / 2, maxHeight * 0.7);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obs.substring(0, 10), labelPoint.x, labelPoint.y);
      });
      
      // Add "Do not build" text on obstructions
      ctx.fillStyle = 'rgba(60, 60, 60, 0.9)';
      ctx.font = 'italic 10px sans-serif';
      ctx.textAlign = 'center';
      obstructions.forEach((obs, idx) => {
        const baseAz = -60 + (idx * 40);
        const azSpread = 25;
        const maxHeight = 20 + Math.random() * 25;
        const labelPoint = azAltToXY(baseAz + azSpread / 2, maxHeight * 0.3);
        ctx.fillText('Do not build', labelPoint.x, labelPoint.y);
      });
    }

    // Draw sun icons around the perimeter
    for (let hour = 6; hour <= 18; hour += 2) {
      const hourAngle = (hour - 12) * 15;
      const declinationMid = 11.75; // Average declination
      
      const latRad = latitude * Math.PI / 180;
      const decRad = declinationMid * Math.PI / 180;
      const haRad = hourAngle * Math.PI / 180;
      
      const sinAlt = Math.sin(latRad) * Math.sin(decRad) + 
                     Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
      const altitude = Math.asin(sinAlt) * 180 / Math.PI;
      
      if (altitude > -5) {
        const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / 
                      (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)));
        let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180 / Math.PI;
        
        if (hour > 12) azimuth = -azimuth;
        
        // Place sun icon at bottom perimeter
        const iconPoint = azAltToXY(azimuth, -8);
        
        // Draw sun icon
        ctx.fillStyle = '#FDB813';
        ctx.beginPath();
        ctx.arc(iconPoint.x, iconPoint.y, 7, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw sun rays
        for (let i = 0; i < 8; i++) {
          const rayAngle = (i * 45) * Math.PI / 180;
          const x1 = iconPoint.x + 9 * Math.cos(rayAngle);
          const y1 = iconPoint.y + 9 * Math.sin(rayAngle);
          const x2 = iconPoint.x + 13 * Math.cos(rayAngle);
          const y2 = iconPoint.y + 13 * Math.sin(rayAngle);
          
          ctx.strokeStyle = '#FDB813';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    // Draw title
    ctx.fillStyle = '#424242';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sun Path Diagram (Side View)', width / 2, 25);
    
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(`Location: ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`, width / 2, 45);

    // Y-axis label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#424242';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Angle Above Horizon', 0, 0);
    ctx.restore();

    // X-axis label  
    ctx.fillStyle = '#424242';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sun Position (Azimuth)', width / 2, height - 10);

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
            Solar Path Analysis (Cartesian View)
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
            className="border border-gray-200 rounded-lg shadow-sm bg-white"
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
                <span>Obstructed Areas (Do not build)</span>
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
            <strong>Reading the Diagram:</strong> This side-view shows the sun's path from East (left) to West (right). 
            The vertical axis shows altitude above the horizon (0° to 90°). Curved lines represent different seasons. 
            Gray shaded areas indicate obstructions that block sunlight - solar panels should not be installed in these zones.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
