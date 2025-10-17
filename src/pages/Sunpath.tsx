import { useState } from "react";
import { SunpathDiagram } from "@/components/SunpathDiagram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SunpathPage() {
  const [lat, setLat] = useState<number>(51.5074); // London default
  const [lng, setLng] = useState<number>(-0.1278);

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sun Path Viewer (Side View)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label htmlFor="lat" className="block text-sm text-muted-foreground mb-1">Latitude (°)</label>
              <Input id="lat" type="number" step="any" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} />
            </div>
            <div>
              <label htmlFor="lng" className="block text-sm text-muted-foreground mb-1">Longitude (°)</label>
              <Input id="lng" type="number" step="any" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} />
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={() => { setLat(51.5074); setLng(-0.1278); }}>London</Button>
              <Button type="button" variant="outline" onClick={() => { setLat(37.7749); setLng(-122.4194); }}>San Francisco</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SunpathDiagram latitude={lat} longitude={lng} />
    </div>
  );
}




