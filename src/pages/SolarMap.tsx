/**
 * Solar Map Viewer - Standalone Interactive Map Page
 * Based on Google's official js-solar-potential implementation
 * https://github.com/googlemaps-samples/js-solar-potential
 * 
 * This is a full-screen, standalone page that displays an interactive Google Map
 * with Solar API overlays, exactly as implemented in the official Google demo.
 * Features:
 * - Building Insights: Solar panels, energy production, roof statistics
 * - Data Layers: RGB aerial imagery, DSM, annual/monthly flux, hourly shade
 * - Interactive Controls: Panel count slider, layer selection, animation
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
import { Loader2, MapPin, Sun, Layers, Home, ArrowLeft, Menu, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
          // Determine initial center: URL lat/lng or geocoded default
          let initialCenter: google.maps.LatLng | null = null;

          const latParam = searchParams.get('lat');
          const lngParam = searchParams.get('lng');
          if (latParam && lngParam && !Number.isNaN(Number(latParam)) && !Number.isNaN(Number(lngParam))) {
            initialCenter = new google.maps.LatLng(Number(latParam), Number(lngParam));
          } else {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ address: defaultPlace.address });
            if (result.results[0]) {
              initialCenter = result.results[0].geometry.location;
            }
          }

          if (initialCenter) {
            // Initialize map
            const mapInstance = new google.maps.Map(mapRef.current, {
              center: initialCenter,
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
            setLocation(initialCenter);
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
        
      } catch (error: any) {
        console.error('Error fetching building insights:', error);
        
        // Check error type
        const is404 = error?.error?.code === 404 || error?.error?.status === 'NOT_FOUND';
        const errorMessage = error?.error?.message || error?.message || 'Unknown error';
        
        toast({
          title: is404 ? 'No Solar Data Available' : 'Error Loading Solar Data',
          description: is404 
            ? 'Solar data is not available for this location. Try a different address or major city.'
            : `Failed to fetch building insights: ${errorMessage}`,
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

  // Handle search (accepts address or "lat,lng")
  const handleSearch = async () => {
    if (!map || !searchQuery.trim()) return;

    try {
      // Check for "lat,lng" input
      const coordMatch = searchQuery.trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
      if (coordMatch) {
        const lat = Number(coordMatch[1]);
        const lng = Number(coordMatch[2]);
        const newLocation = new google.maps.LatLng(lat, lng);
        setLocation(newLocation);
        map.setCenter(newLocation);
        return;
      }

      // Fallback: geocode address
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
        description: 'Enter an address or coordinates like "52.06290, -1.33977"',
        variant: 'destructive',
      });
    }
  };

  // Fetch data layers (network) WHEN: buildingInsights changes or layer type changes
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
  }, [buildingInsights, layerId, map]);

  // Re-render overlays (no network) WHEN: mask toggle changes
  useEffect(() => {
    if (!layer || !map) return;

    // Clear existing overlays
    overlays.forEach(overlay => overlay.setMap(null));
    setOverlays([]);

    // Re-render canvases with current options
    const bounds = layer.bounds;
    const canvases = layer.render(showRoofOnly, month, day);
    const newOverlays = canvases.map(
      canvas => new google.maps.GroundOverlay(canvas.toDataURL(), bounds)
    );
    setOverlays(newOverlays);

    // Show appropriate overlay(s)
    if (!['monthlyFlux', 'hourlyShade'].includes(layer.id)) {
      newOverlays[0]?.setMap(map);
    } else if (layer.id === 'monthlyFlux') {
      newOverlays[month]?.setMap(map);
    } else if (layer.id === 'hourlyShade') {
      newOverlays[hour]?.setMap(map);
    }
  }, [layer, showRoofOnly, month, day, hour, map]);

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
    <div className="flex flex-col h-screen md:flex-row">
      {/* Back button - Mobile optimized */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/')}
        className="fixed top-2 left-2 md:top-4 md:left-4 z-50 bg-background/95 backdrop-blur-lg border shadow-lg text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
      >
        <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden">Back</span>
      </Button>

      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-2 right-2 md:hidden z-50 bg-background/95 backdrop-blur-lg border shadow-lg text-xs px-3 py-2"
      >
        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="ml-1">Controls</span>
      </Button>

      {/* Main map - Mobile gets full height when sidebar closed */}
      <div ref={mapRef} className={`flex-1 w-full md:w-auto transition-all duration-300 ${isSidebarOpen ? 'h-1/2 md:h-auto' : 'h-full md:h-auto'}`} />

      {/* Side bar - Mobile optimized with collapsible functionality */}
      <aside className={`flex-none w-full md:w-96 p-2 md:p-4 pt-8 md:pt-6 overflow-auto bg-background border-t md:border-t-0 md:border-l transition-all duration-300 md:max-h-none ${
        isSidebarOpen ? 'max-h-1/2 block' : 'max-h-0 hidden md:block'
      }`}>
        <div className="flex flex-col space-y-2 md:space-y-4 h-full">
          {/* Search bar - Mobile optimized */}
          <div className="space-y-2">
            <div className="flex gap-1 md:gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search address or coordinates (e.g., 52.06290, -1.33977)"
                className="text-sm md:text-base flex-1"
              />
              <Button onClick={handleSearch} size="icon" className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10">
                <MapPin className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

          {/* Info Card - Mobile optimized */}
          <Card className="p-2 md:p-4 space-y-2 md:space-y-3">
            <p className="text-xs md:text-sm">
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
            <p className="text-xs md:text-sm">
              <b>Search for a location</b> to see solar potential data. 
            </p>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-2 text-xs">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">ℹ️ Solar API Info</p>
              <p className="text-blue-800 dark:text-blue-200">
                Coverage includes 320M+ buildings in 40+ countries. Imagery quality varies by region (HIGH/MEDIUM/LOW).
              </p>
            </div>
          </Card>

          {/* Building Insights Section - Mobile optimized */}
          {isLoadingBuilding ? (
            <div className="flex items-center justify-center py-4 md:py-8">
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
            </div>
          ) : buildingInsights && panelConfig ? (
            <Card className="p-2 md:p-4 space-y-2 md:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 md:gap-2">
                  <Home className="h-4 w-4 md:h-5 md:w-5" />
                  <h3 className="font-semibold text-sm md:text-base">Building Insights</h3>
                </div>
                <Badge className="text-xs">{((panelConfig.yearlyEnergyDcKwh / 1000).toFixed(2))} MWh/yr</Badge>
              </div>

              <div className="space-y-2 md:space-y-3">
                <div>
                  <Label className="text-xs md:text-sm">Panel Count: {panelConfig.panelsCount}</Label>
                  <Slider
                    value={[configId]}
                    onValueChange={([value]) => setConfigId(value)}
                    max={buildingInsights.solarPotential.solarPanelConfigs.length - 1}
                    step={1}
                    className="mt-1 md:mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs md:text-sm">Panel Capacity (Watts)</Label>
                  <Input
                    type="number"
                    value={panelCapacityWatts}
                    onChange={(e) => setPanelCapacityWatts(Number(e.target.value))}
                    className="mt-1 md:mt-2 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-md border bg-background/70">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs md:text-sm font-semibold">Show Panels</Label>
                    <Badge className={`${showPanels ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : 'bg-muted text-foreground'} text-[10px] md:text-xs`}`}>{showPanels ? 'On' : 'Off'}</Badge>
                  </div>
                  <Switch checked={showPanels} onCheckedChange={setShowPanels} />
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-3 pt-1 md:pt-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Annual Sunshine</p>
                    <p className="text-sm md:text-lg font-semibold flex items-center gap-1">
                      <Sun className="h-3 w-3 md:h-4 md:w-4" />
                      {showNumber(buildingInsights.solarPotential.maxSunshineHoursPerYear)} hr
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Roof Area</p>
                    <p className="text-sm md:text-lg font-semibold">
                      {showNumber(buildingInsights.solarPotential.wholeRoofStats.areaMeters2)} m²
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Max Panels</p>
                    <p className="text-sm md:text-lg font-semibold">
                      {showNumber(buildingInsights.solarPotential.solarPanels.length)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">CO₂ Savings</p>
                    <p className="text-sm md:text-lg font-semibold">
                      {showNumber(buildingInsights.solarPotential.carbonOffsetFactorKgPerMwh)} Kg/MWh
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Data Layers Section - Mobile optimized */}
          {buildingInsights && (
            <Card className="p-2 md:p-4 space-y-2 md:space-y-4">
              <div className="flex items-center gap-1 md:gap-2">
                <Layers className="h-4 w-4 md:h-5 md:w-5" />
                <h3 className="font-semibold text-sm md:text-base">Data Layers</h3>
              </div>

              <div className="space-y-2 md:space-y-3">
                <div>
                  <Label className="text-xs md:text-sm">Layer Type</Label>
                  <Select value={layerId} onValueChange={(value) => setLayerId(value as LayerId | 'none')}>
                    <SelectTrigger className="mt-1 md:mt-2 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(dataLayerOptions).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="text-sm">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isLoadingLayer && (
                  <div className="flex items-center justify-center py-2 md:py-4">
                    <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
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

                    <div className="flex items-center justify-between p-2 rounded-md border bg-background/70">
                      <div className="flex items-center gap-2">
                        <Label className="font-semibold">Roof Only</Label>
                        <Badge className={`${showRoofOnly ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : 'bg-muted text-foreground'} text-[10px] md:text-xs`}`}>{showRoofOnly ? 'On' : 'Off'}</Badge>
                      </div>
                      <Switch checked={showRoofOnly} onCheckedChange={setShowRoofOnly} />
                    </div>

                    {['monthlyFlux', 'hourlyShade'].includes(layerId) && (
                      <div className="flex items-center justify-between p-2 rounded-md border bg-background/70">
                        <div className="flex items-center gap-2">
                          <Label className="font-semibold">Play Animation</Label>
                          <Badge className={`${playAnimation ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : 'bg-muted text-foreground'} text-[10px] md:text-xs`}`}>{playAnimation ? 'On' : 'Off'}</Badge>
                        </div>
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
        </div>
      </aside>

      {/* Bottom overlay for month/hour display - Mobile optimized */}
      {layer && ['monthlyFlux', 'hourlyShade'].includes(layer.id) && (
        <div className={`absolute bottom-2 md:bottom-6 left-2 md:left-0 right-2 md:right-96 flex justify-center transition-all duration-300 ${
          isSidebarOpen ? 'bottom-2 md:bottom-6' : 'bottom-2 md:bottom-6'
        }`}>
          <Card className="px-2 md:px-4 py-1 md:py-2 flex items-center gap-2 md:gap-3">
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
                  className="w-32 md:w-64"
                />
                <span className="w-8 md:w-12 text-xs md:text-sm font-medium">{monthNames[month]}</span>
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
                  className="w-32 md:w-64"
                />
                <span className="w-20 md:w-32 text-xs md:text-sm font-medium whitespace-nowrap">
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
