/**
 * Solar Map Viewer - Based on Google's official js-solar-potential implementation
 * https://github.com/googlemaps-samples/js-solar-potential
 */

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Sun, Layers, Home, Github } from 'lucide-react';
import { API_CONFIG } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';
import {
  findClosestBuilding,
  getDataLayerUrls,
  type BuildingInsightsResponse,
  type DataLayersResponse,
  type LayerId,
  showDate,
  showLatLng,
} from '@/lib/solar/solar';
import { getLayer, type Layer } from '@/lib/solar/layer';
import { showNumber, findSolarConfig } from '@/lib/solar/utils';
import { createPalette, rgbToColor, normalize } from '@/lib/solar/visualize';
import { panelsPalette } from '@/lib/solar/colors';

const defaultPlace = {
  name: 'Rinconada Library',
  address: '1213 Newell Rd, Palo Alto, CA 94303',
};

const dataLayerOptions: Record<LayerId | 'none', string> = {
  none: 'No layer',
  mask: 'Roof mask',
  dsm: 'Digital Surface Model',
  rgb: 'Aerial image',
  annualFlux: 'Annual sunshine',
  monthlyFlux: 'Monthly sunshine',
  hourlyShade: 'Hourly shade',
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SolarMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [location, setLocation] = useState<google.maps.LatLng | null>(null);
  const [searchQuery, setSearchQuery] = useState(defaultPlace.name);
  
  // Building Insights state
  const [buildingInsights, setBuildingInsights] = useState<BuildingInsightsResponse | null>(null);
  const [isLoadingBuilding, setIsLoadingBuilding] = useState(false);
  const [solarPanels, setSolarPanels] = useState<google.maps.Polygon[]>([]);
  const [showPanels, setShowPanels] = useState(true);
  const [panelCapacityWatts, setPanelCapacityWatts] = useState(250);
  const [configId, setConfigId] = useState<number>(0);
  
  // Data Layers state
  const [dataLayersResponse, setDataLayersResponse] = useState<DataLayersResponse | null>(null);
  const [layerId, setLayerId] = useState<LayerId | 'none'>('monthlyFlux');
  const [layer, setLayer] = useState<Layer | null>(null);
  const [isLoadingLayer, setIsLoadingLayer] = useState(false);
  const [overlays, setOverlays] = useState<google.maps.GroundOverlay[]>([]);
  const [showRoofOnly, setShowRoofOnly] = useState(false);
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(14);
  const [hour, setHour] = useState(5);
  const [playAnimation, setPlayAnimation] = useState(true);
  const [tick, setTick] = useState(0);
  
  // Expanded section state
  const [expandedSection, setExpandedSection] = useState('');
  
  const { toast } = useToast();

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        // Load Google Maps script
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${API_CONFIG.GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
          script.async = true;
          script.defer = true;
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (mapRef.current && window.google) {
          // Geocode default location
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({ address: defaultPlace.address });
          
          if (result.results[0]) {
            const loc = result.results[0].geometry.location;
            
            // Initialize map
            const mapInstance = new google.maps.Map(mapRef.current, {
              center: loc,
              zoom: 19,
              tilt: 0,
              mapTypeId: 'satellite',
              mapTypeControl: false,
              fullscreenControl: false,
              rotateControl: false,
              streetViewControl: false,
              zoomControl: false,
            });

            setMap(mapInstance);
            setLocation(loc);
          }
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          title: 'Map Error',
          description: 'Failed to initialize Google Maps',
          variant: 'destructive',
        });
      }
    };

    initMap();
  }, [toast]);

  // Fetch building insights when location changes
  useEffect(() => {
    if (!location || !map) return;

    const fetchBuildingInsights = async () => {
      setIsLoadingBuilding(true);
      setBuildingInsights(null);
      
      // Clear existing panels
      solarPanels.forEach(panel => panel.setMap(null));
      setSolarPanels([]);

      try {
        const insights = await findClosestBuilding(location, API_CONFIG.GOOGLE_MAPS_API_KEY);
        setBuildingInsights(insights);
        
        // Create solar panels on the map
        const solarPotential = insights.solarPotential;
        const palette = createPalette(panelsPalette).map(rgbToColor);
        const minEnergy = solarPotential.solarPanels.slice(-1)[0].yearlyEnergyDcKwh;
        const maxEnergy = solarPotential.solarPanels[0].yearlyEnergyDcKwh;
        
        const newPanels = solarPotential.solarPanels.map((panel) => {
          const [w, h] = [solarPotential.panelWidthMeters / 2, solarPotential.panelHeightMeters / 2];
          const points = [
            { x: +w, y: +h }, // top right
            { x: +w, y: -h }, // bottom right
            { x: -w, y: -h }, // bottom left
            { x: -w, y: +h }, // top left
            { x: +w, y: +h }, //  top right
          ];
          const orientation = panel.orientation == 'PORTRAIT' ? 90 : 0;
          const azimuth = solarPotential.roofSegmentStats[panel.segmentIndex].azimuthDegrees;
          const colorIndex = Math.round(normalize(panel.yearlyEnergyDcKwh, maxEnergy, minEnergy) * 255);
          
          return new google.maps.Polygon({
            paths: points.map(({ x, y }) =>
              google.maps.geometry.spherical.computeOffset(
                { lat: panel.center.latitude, lng: panel.center.longitude },
                Math.sqrt(x * x + y * y),
                Math.atan2(y, x) * (180 / Math.PI) + orientation + azimuth,
              ),
            ),
            strokeColor: '#B0BEC5',
            strokeOpacity: 0.9,
            strokeWeight: 1,
            fillColor: palette[colorIndex],
            fillOpacity: 0.9,
          });
        });
        
        setSolarPanels(newPanels);
        
        // Find default config
        const defaultPanelCapacity = insights.solarPotential.panelCapacityWatts;
        const panelCapacityRatio = panelCapacityWatts / defaultPanelCapacity;
        const defaultConfigId = findSolarConfig(
          insights.solarPotential.solarPanelConfigs,
          (300 / 0.31) * 12, // Default monthly bill $300 / energy cost per kWh 0.31
          panelCapacityRatio,
          0.85,
        );
        setConfigId(defaultConfigId);
        
      } catch (error) {
        console.error('Error fetching building insights:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch building insights',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingBuilding(false);
      }
    };

    fetchBuildingInsights();
  }, [location, map]);

  // Update panel visibility
  useEffect(() => {
    if (!buildingInsights) return;
    
    const panelConfig = buildingInsights.solarPotential.solarPanelConfigs[configId];
    if (panelConfig) {
      solarPanels.forEach((panel, i) => {
        panel.setMap(showPanels && i < panelConfig.panelsCount ? map : null);
      });
    }
  }, [showPanels, configId, solarPanels, buildingInsights, map]);

  // Handle search
  const handleSearch = async () => {
    if (!map || !searchQuery.trim()) return;

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: searchQuery });
      
      if (result.results[0]) {
        const newLocation = result.results[0].geometry.location;
        setLocation(newLocation);
        map.setCenter(newLocation);
      }
    } catch (error) {
      toast({
        title: 'Search Error',
        description: 'Could not find location',
        variant: 'destructive',
      });
    }
  };

  // Fetch data layers
  useEffect(() => {
    if (!buildingInsights || layerId === 'none' || !map) return;

    const fetchDataLayers = async () => {
      setIsLoadingLayer(true);
      setLayer(null);
      
      // Clear existing overlays
      overlays.forEach(overlay => overlay.setMap(null));
      setOverlays([]);

      try {
        const center = buildingInsights.center;
        const ne = buildingInsights.boundingBox.ne;
        const sw = buildingInsights.boundingBox.sw;
        const diameter = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(ne.latitude, ne.longitude),
          new google.maps.LatLng(sw.latitude, sw.longitude),
        );
        const radius = Math.ceil(diameter / 2);
        
        const dataLayers = await getDataLayerUrls(center, radius, API_CONFIG.GOOGLE_MAPS_API_KEY);
        setDataLayersResponse(dataLayers);
        
        const newLayer = await getLayer(layerId, dataLayers, API_CONFIG.GOOGLE_MAPS_API_KEY);
        setLayer(newLayer);
        
        // Render layer
        const bounds = newLayer.bounds;
        const canvases = newLayer.render(showRoofOnly, month, day);
        const newOverlays = canvases.map(
          canvas => new google.maps.GroundOverlay(canvas.toDataURL(), bounds)
        );
        setOverlays(newOverlays);
        
        // Show first overlay (or specific one for monthly/hourly)
        if (!['monthlyFlux', 'hourlyShade'].includes(layerId)) {
          newOverlays[0]?.setMap(map);
        }
        
      } catch (error) {
        console.error('Error fetching data layers:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch data layers',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingLayer(false);
      }
    };

    fetchDataLayers();
  }, [buildingInsights, layerId, showRoofOnly, month, day]);

  // Handle monthly flux display
  useEffect(() => {
    if (layer?.id === 'monthlyFlux') {
      overlays.forEach((overlay, i) => overlay.setMap(i === month ? map : null));
    }
  }, [layer, month, overlays, map]);

  // Handle hourly shade display
  useEffect(() => {
    if (layer?.id === 'hourlyShade') {
      overlays.forEach((overlay, i) => overlay.setMap(i === hour ? map : null));
    }
  }, [layer, hour, overlays, map]);

  // Animation tick
  useEffect(() => {
    if (!playAnimation) return;
    
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [playAnimation]);

  // Update month/hour from tick
  useEffect(() => {
    if (layer?.id === 'monthlyFlux' && playAnimation) {
      setMonth(tick % 12);
    } else if (layer?.id === 'hourlyShade' && playAnimation) {
      setHour(tick % 24);
    }
  }, [tick, layer, playAnimation]);

  const panelConfig = buildingInsights?.solarPotential.solarPanelConfigs[configId];

  return (
    <div className="flex flex-row h-screen">
      {/* Main map */}
      <div ref={mapRef} className="w-full" />

      {/* Side bar */}
      <aside className="flex-none w-96 p-4 pt-6 overflow-auto bg-background border-l">
        <div className="flex flex-col space-y-4 h-full">
          {/* Search bar */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for a location..."
              />
              <Button onClick={handleSearch} size="icon">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Info Card */}
          <Card className="p-4 space-y-3">
            <p className="text-sm">
              <a
                className="text-primary hover:underline"
                href="https://developers.google.com/maps/documentation/solar/overview?hl=en"
                target="_blank"
                rel="noopener noreferrer"
              >
                Two distinct endpoints of the <b>Solar API</b>
              </a>{' '}
              offer many benefits to solar marketplace websites, solar installers, and solar SaaS designers.
            </p>
            <p className="text-sm">
              <b>Click on an area below</b> to see what type of information the Solar API can provide.
            </p>
          </Card>

          {/* Building Insights Section */}
          {isLoadingBuilding ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : buildingInsights && panelConfig ? (
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  <h3 className="font-semibold">Building Insights</h3>
                </div>
                <Badge>{((panelConfig.yearlyEnergyDcKwh / 1000).toFixed(2))} MWh/yr</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Panel Count: {panelConfig.panelsCount}</Label>
                  <Slider
                    value={[configId]}
                    onValueChange={([value]) => setConfigId(value)}
                    max={buildingInsights.solarPotential.solarPanelConfigs.length - 1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Panel Capacity (Watts)</Label>
                  <Input
                    type="number"
                    value={panelCapacityWatts}
                    onChange={(e) => setPanelCapacityWatts(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show Panels</Label>
                  <Switch checked={showPanels} onCheckedChange={setShowPanels} />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Annual Sunshine</p>
                    <p className="text-lg font-semibold flex items-center gap-1">
                      <Sun className="h-4 w-4" />
                      {showNumber(buildingInsights.solarPotential.maxSunshineHoursPerYear)} hr
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Roof Area</p>
                    <p className="text-lg font-semibold">
                      {showNumber(buildingInsights.solarPotential.wholeRoofStats.areaMeters2)} m²
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Max Panels</p>
                    <p className="text-lg font-semibold">
                      {showNumber(buildingInsights.solarPotential.solarPanels.length)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">CO₂ Savings</p>
                    <p className="text-lg font-semibold">
                      {showNumber(buildingInsights.solarPotential.carbonOffsetFactorKgPerMwh)} Kg/MWh
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Data Layers Section */}
          {buildingInsights && (
            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                <h3 className="font-semibold">Data Layers</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Layer Type</Label>
                  <Select value={layerId} onValueChange={(value) => setLayerId(value as LayerId | 'none')}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(dataLayerOptions).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isLoadingLayer && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}

                {layer && (
                  <>
                    {layer.id === 'hourlyShade' && (
                      <div className="space-y-2">
                        <Label>Month: {monthNames[month]}</Label>
                        <Slider
                          value={[month]}
                          onValueChange={([value]) => setMonth(value)}
                          max={11}
                          step={1}
                          className="mt-2"
                        />
                        <Label>Day: {day}</Label>
                        <Slider
                          value={[day]}
                          onValueChange={([value]) => setDay(value)}
                          min={1}
                          max={31}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    )}

                    {dataLayersResponse && (
                      <div className="text-sm text-muted-foreground">
                        {dataLayersResponse.imageryQuality === 'HIGH' && (
                          <p><b>Low altitude aerial imagery</b> available. Processed at <b>10 cm/pixel</b>.</p>
                        )}
                        {dataLayersResponse.imageryQuality === 'MEDIUM' && (
                          <p><b>AI augmented aerial imagery</b> available. Processed at <b>25 cm/pixel</b>.</p>
                        )}
                        {dataLayersResponse.imageryQuality === 'LOW' && (
                          <p><b>AI augmented aerial/satellite imagery</b> available. Processed at <b>50 cm/pixel</b>.</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label>Roof Only</Label>
                      <Switch checked={showRoofOnly} onCheckedChange={setShowRoofOnly} />
                    </div>

                    {['monthlyFlux', 'hourlyShade'].includes(layerId) && (
                      <div className="flex items-center justify-between">
                        <Label>Play Animation</Label>
                        <Switch checked={playAnimation} onCheckedChange={setPlayAnimation} />
                      </div>
                    )}

                    {layer.palette && (
                      <div className="space-y-2">
                        <div
                          className="h-3 rounded-sm border"
                          style={{
                            background: `linear-gradient(to right, ${layer.palette.colors.map(hex => '#' + hex).join(', ')})`,
                          }}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{layer.palette.min}</span>
                          <span>{layer.palette.max}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          )}

          <div className="grow" />

          <div className="flex flex-col items-center space-y-2">
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://github.com/googlemaps-samples/js-solar-potential"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                View code on GitHub
              </a>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              This is not an officially supported Google product.
            </p>
          </div>
        </div>
      </aside>

      {/* Bottom overlay for month/hour display */}
      {layer && ['monthlyFlux', 'hourlyShade'].includes(layer.id) && (
        <div className="absolute bottom-6 left-0 right-96 flex justify-center">
          <Card className="px-4 py-2 flex items-center gap-3">
            {layer.id === 'monthlyFlux' && (
              <>
                <Slider
                  value={[month]}
                  onValueChange={([value]) => {
                    setMonth(value);
                    setPlayAnimation(false);
                  }}
                  max={11}
                  step={1}
                  className="w-64"
                />
                <span className="w-12 text-sm font-medium">{monthNames[month]}</span>
              </>
            )}
            {layer.id === 'hourlyShade' && (
              <>
                <Slider
                  value={[hour]}
                  onValueChange={([value]) => {
                    setHour(value);
                    setPlayAnimation(false);
                  }}
                  max={23}
                  step={1}
                  className="w-64"
                />
                <span className="w-32 text-sm font-medium whitespace-nowrap">
                  {monthNames[month]} {day},{' '}
                  {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
                </span>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
