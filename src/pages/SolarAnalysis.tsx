import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SunPathDiagram } from '@/components/SunPathDiagram';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SolarAnalysis() {
  const navigate = useNavigate();
  const [location, setLocation] = useState({
    latitude: 51.5074,
    longitude: -0.1278,
  });
  const [obstructions, setObstructions] = useState(['Chimney', 'TV Aerial', 'Tree']);
  const [sunshineQuantiles, setSunshineQuantiles] = useState([75, 80, 85, 82, 78]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-2">Solar Path Analysis</h1>
          <p className="text-muted-foreground">
            Visualize how the sun moves across your property throughout the year
          </p>
        </div>

        {/* Input Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Location Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  value={location.latitude}
                  onChange={(e) => setLocation(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  value={location.longitude}
                  onChange={(e) => setLocation(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation({ latitude: 51.5074, longitude: -0.1278 })}
              >
                London
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation({ latitude: 40.7128, longitude: -74.0060 })}
              >
                New York
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation({ latitude: 37.7749, longitude: -122.4194 })}
              >
                San Francisco
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation({ latitude: -33.8688, longitude: 151.2093 })}
              >
                Sydney
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sun Path Diagram */}
        <SunPathDiagram
          latitude={location.latitude}
          longitude={location.longitude}
          obstructions={obstructions}
          sunshineQuantiles={sunshineQuantiles}
          imageryQuality="HIGH"
        />

        {/* Information Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Understanding Your Sun Path Diagram</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What Does This Show?</h3>
              <p className="text-sm text-muted-foreground">
                The sun path diagram illustrates how the sun moves across the sky at your specific location throughout the year. 
                This helps determine optimal solar panel placement and expected energy generation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Key Elements:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li><strong>Concentric Circles:</strong> Represent altitude angles (0° at horizon, 90° directly overhead)</li>
                <li><strong>Radial Lines:</strong> Show compass directions (N, S, E, W, etc.)</li>
                <li><strong>Curved Lines:</strong> Display the sun's path on different dates (summer, equinox, winter)</li>
                <li><strong>Gray Shaded Areas:</strong> Indicate obstructions that may block sunlight</li>
                <li><strong>Sun Icons:</strong> Mark hours of the day from sunrise to sunset</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How to Use This Information:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Areas with more sun exposure (less gray shading) are better for solar panels</li>
                <li>Summer paths (higher curves) show maximum solar potential</li>
                <li>Winter paths (lower curves) show minimum solar potential</li>
                <li>Consider the full year range when planning panel placement</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

