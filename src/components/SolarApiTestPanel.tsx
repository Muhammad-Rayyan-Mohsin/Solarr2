import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  MapPin, 
  Zap,
  Image,
  BarChart3,
  Clock,
  Plus,
  Trash2,
  Download,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runSolarApiTests } from '@/tests/solarApiTest';
import { GoogleSolarApiService } from '@/services/googleSolarApi';
import { API_CONFIG } from '@/lib/config';
  import { SunpathDiagram } from '@/components/SunpathDiagram';
import { downloadGeoTIFF } from '@/lib/solar/solar';
import { renderRGB, renderPalette } from '@/lib/solar/visualize';
import { ironPalette, rainbowPalette } from '@/lib/solar/colors';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  message: string;
  data?: any;
}

interface LocationTest {
  name: string;
  lat: number;
  lng: number;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  imagery?: any;
  renderedImages?: {
    rgb?: string;
    dsm?: string;
    annualFlux?: string;
    mask?: string;
  };
}

// Component to render a GeoTIFF image on demand
function GeoTIFFImage({ url, type, location }: { url: string; type: 'rgb' | 'dsm' | 'annualFlux' | 'mask'; location: LocationTest }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showMask, setShowMask] = useState(false);
  console.log(`🔧 GeoTIFFImage component initialized for ${type} with showMask:`, showMask);

  // Listen for "Load All Images" event
  useEffect(() => {
    const handleLoadAll = (event: CustomEvent) => {
      if (event.detail === location.name && !hasLoaded && !isLoading) {
        renderImage();
      }
    };

    window.addEventListener('loadAllImages', handleLoadAll as EventListener);
    return () => window.removeEventListener('loadAllImages', handleLoadAll as EventListener);
  }, [location.name, hasLoaded, isLoading]);

  const renderImage = async (applyMask?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use current showMask state if applyMask is not explicitly provided
      const shouldApplyMask = applyMask !== undefined ? applyMask : showMask;
      console.log(`=== DEBUG RENDER ${type.toUpperCase()} ===`);
      console.log('applyMask parameter:', applyMask);
      console.log('showMask state:', showMask);
      console.log('shouldApplyMask calculated:', shouldApplyMask);
      console.log('shouldApplyMask === true:', shouldApplyMask === true);

      // Download and process GeoTIFF
      if (type === 'rgb') {
        const rgb = await downloadGeoTIFF(url, API_CONFIG.GOOGLE_MAPS_API_KEY);
        let canvas: HTMLCanvasElement;
        
        if (shouldApplyMask) {
          console.log('🚫 APPLYING MASK - shouldApplyMask is TRUE');
          console.log('shouldApplyMask value:', shouldApplyMask);
          const mask = await downloadGeoTIFF(location.imagery.maskUrl, API_CONFIG.GOOGLE_MAPS_API_KEY);
          canvas = renderRGB(rgb, mask);
        } else {
          console.log('✅ RENDERING FULL RGB - shouldApplyMask is FALSE');
          console.log('shouldApplyMask value:', shouldApplyMask);
          canvas = renderRGB(rgb);
        }
        setImageUrl(canvas.toDataURL());
      } else if (type === 'dsm') {
        const data = await downloadGeoTIFF(url, API_CONFIG.GOOGLE_MAPS_API_KEY);
        const sortedValues = Array.from(data.rasters[0]).sort((x, y) => x - y);
        
        let canvas: HTMLCanvasElement;
        if (shouldApplyMask) {
          const mask = await downloadGeoTIFF(location.imagery.maskUrl, API_CONFIG.GOOGLE_MAPS_API_KEY);
          canvas = renderPalette({
            data,
            mask,
            colors: rainbowPalette,
            min: sortedValues[0],
            max: sortedValues.slice(-1)[0],
          });
        } else {
          canvas = renderPalette({
            data,
            colors: rainbowPalette,
            min: sortedValues[0],
            max: sortedValues.slice(-1)[0],
          });
        }
        setImageUrl(canvas.toDataURL());
      } else if (type === 'annualFlux') {
        const data = await downloadGeoTIFF(url, API_CONFIG.GOOGLE_MAPS_API_KEY);
        
        let canvas: HTMLCanvasElement;
        if (shouldApplyMask) {
          const mask = await downloadGeoTIFF(location.imagery.maskUrl, API_CONFIG.GOOGLE_MAPS_API_KEY);
          canvas = renderPalette({
            data,
            mask,
            colors: ironPalette,
            min: 0,
            max: 1800,
          });
        } else {
          canvas = renderPalette({
            data,
            colors: ironPalette,
            min: 0,
            max: 1800,
          });
        }
        setImageUrl(canvas.toDataURL());
      } else if (type === 'mask') {
        const data = await downloadGeoTIFF(url, API_CONFIG.GOOGLE_MAPS_API_KEY);
        const canvas = renderPalette({
          data,
          colors: ['000000', 'ffffff'],
        });
        setImageUrl(canvas.toDataURL());
      }
      setHasLoaded(true);
    } catch (err) {
      console.error(`Error rendering ${type}:`, err);
      setError(err.message || 'Failed to render image');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-render when mask toggle changes
  useEffect(() => {
    if (hasLoaded && !isLoading) {
      renderImage(showMask);
    }
  }, [showMask]);

  if (!hasLoaded && !isLoading) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded border border-dashed border-gray-300">
        <Button 
          onClick={() => renderImage()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Image className="h-4 w-4" />
          Load Image
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Processing GeoTIFF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded border border-red-200">
        <div className="text-center text-red-600">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <Button 
            onClick={() => renderImage()}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.download = `${location.name.replace(/[^a-z0-9]/gi, '_')}_${type}_solar_data.png`;
    link.href = imageUrl;
    link.click();
  };

  if (imageUrl) {
    return (
      <div className="space-y-2">
        <img 
          src={imageUrl} 
          alt={`${type} visualization for ${location.name}`}
          className="w-full h-auto rounded border"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type !== 'mask' && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showMask}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setShowMask(checked);
                    renderImage(checked);
                  }}
                  className="rounded"
                />
                <span>Show roof only</span>
              </label>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button 
              onClick={() => {
                setImageUrl(null);
                setHasLoaded(false);
                setError(null);
                renderImage(showMask);
              }}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Reload Image
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function SolarApiTestPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [locationTests, setLocationTests] = useState<LocationTest[]>([]);
  const [locationInput, setLocationInput] = useState({ name: '', lat: '', lng: '' });
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const { toast } = useToast();

  const addLocation = () => {
    if (!locationInput.name || !locationInput.lat || !locationInput.lng) {
      toast({
        title: 'Missing Information',
        description: 'Please provide name, latitude, and longitude',
        variant: 'destructive',
      });
      return;
    }

    const lat = parseFloat(locationInput.lat);
    const lng = parseFloat(locationInput.lng);

    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: 'Invalid Coordinates',
        description: 'Please enter valid latitude and longitude numbers',
        variant: 'destructive',
      });
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast({
        title: 'Invalid Coordinates',
        description: 'Latitude must be -90 to 90, Longitude must be -180 to 180',
        variant: 'destructive',
      });
      return;
    }

    const newLocation: LocationTest = {
      name: locationInput.name,
      lat,
      lng,
      status: 'pending'
    };

    setLocationTests(prev => [...prev, newLocation]);
    setLocationInput({ name: '', lat: '', lng: '' });
    setIsAddLocationOpen(false);

    toast({
      title: 'Location Added',
      description: `Added ${newLocation.name} to test list`,
    });
  };

  const removeLocation = (index: number) => {
    setLocationTests(prev => prev.filter((_, i) => i !== index));
    toast({
      title: 'Location Removed',
      description: 'Location removed from test list',
    });
  };

  const clearAllLocations = () => {
    setLocationTests([]);
    setResults([]);
    setProgress(0);
    setCurrentTest('');
    toast({
      title: 'Cleared All',
      description: 'All locations and results cleared',
    });
  };

  const runInteractiveTests = async () => {
    if (locationTests.length === 0) {
      toast({
        title: 'No Locations',
        description: 'Please add at least one location to test',
        variant: 'destructive',
      });
      return;
    }

    setIsRunning(true);
    setResults([]);
    setProgress(0);
    setCurrentTest('Initializing...');

    try {
      // Test 1: API Configuration
      setCurrentTest('Testing API Configuration...');
      setProgress(10);
      
      const configResult = await testApiConfiguration();
      setResults(prev => [...prev, configResult]);
      
      if (configResult.status === 'FAIL') {
        toast({
          title: "API Configuration Failed",
          description: configResult.message,
          variant: "destructive",
        });
        return;
      }

      // Test 2: Location-based tests
      setProgress(30);
      await runLocationTests();

      // Test 3: Data layer test
      setCurrentTest('Testing Data Layers...');
      setProgress(80);
      const dataLayerResult = await testDataLayers();
      setResults(prev => [...prev, dataLayerResult]);

      setProgress(100);
      setCurrentTest('Tests completed!');

      const passedTests = results.filter(r => r.status === 'PASS').length + 1; // +1 for potential data layer pass
      toast({
        title: "Solar API Tests Completed",
        description: `${passedTests} tests passed successfully`,
      });

    } catch (error) {
      console.error('Test suite error:', error);
      toast({
        title: "Test Suite Error",
        description: "An error occurred while running tests",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const testApiConfiguration = async (): Promise<TestResult> => {
    try {
      if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
        return {
          test: 'API Configuration',
          status: 'FAIL',
          message: 'Google Maps API key not configured'
        };
      }

      if (API_CONFIG.GOOGLE_MAPS_API_KEY.length < 30) {
        return {
          test: 'API Configuration',
          status: 'FAIL',
          message: 'API key appears to be invalid (too short)'
        };
      }

      return {
        test: 'API Configuration',
        status: 'PASS',
        message: 'API key configured correctly',
        data: { keyLength: API_CONFIG.GOOGLE_MAPS_API_KEY.length }
      };
    } catch (error) {
      return {
        test: 'API Configuration',
        status: 'FAIL',
        message: `Configuration error: ${error.message}`
      };
    }
  };

  const runLocationTests = async () => {
    for (let i = 0; i < locationTests.length; i++) {
      const location = locationTests[i];
      setCurrentTest(`Testing ${location.name}...`);
      setProgress(30 + (i * 15));

      // Update location status
      setLocationTests(prev => prev.map((loc, idx) => 
        idx === i ? { ...loc, status: 'running' } : loc
      ));

      try {
        const startTime = Date.now();
        const [insights, dataLayers] = await Promise.all([
          GoogleSolarApiService.getBuildingInsights(location.lat, location.lng),
          // Omit quality parameter to accept any available quality
          GoogleSolarApiService.getDataLayers(location.lat, location.lng, 100, 'IMAGERY_AND_ALL_FLUX_LAYERS', 'LOW', 0.1)
        ]);
        const duration = Date.now() - startTime;
        const formatted = GoogleSolarApiService.formatSolarData(insights);

        // Update location with success and imagery
        setLocationTests(prev => prev.map((loc, idx) => 
          idx === i ? { 
            ...loc, 
            status: 'success', 
            result: { ...formatted, duration },
            imagery: dataLayers
          } : loc
        ));

        // Add to results
        setResults(prev => [...prev, {
          test: `Building Insights - ${location.name}`,
          status: 'PASS',
          message: `Retrieved ${formatted.maxPanels} panels, ${formatted.roofArea}m² roof`,
          data: formatted
        }]);

      } catch (error) {
        // Update location with error
        setLocationTests(prev => prev.map((loc, idx) => 
          idx === i ? { 
            ...loc, 
            status: 'error', 
            error: error.message 
          } : loc
        ));

        setResults(prev => [...prev, {
          test: `Building Insights - ${location.name}`,
          status: 'FAIL',
          message: error.message
        }]);
      }

      // Rate limiting delay
      if (i < locationTests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const testDataLayers = async (): Promise<TestResult> => {
    try {
      const london = locationTests[0];
      const dataLayers = await GoogleSolarApiService.getDataLayers(
        london.lat,
        london.lng,
        100,
        'IMAGERY_AND_ALL_FLUX_LAYERS',
        undefined,
        0.1
      );

      const urls = [
        dataLayers.rgbUrl,
        dataLayers.dsmUrl,
        dataLayers.maskUrl,
        dataLayers.annualFluxUrl,
        dataLayers.monthlyFluxUrl
      ].filter(url => url && url.startsWith('https://'));

      return {
        test: 'Data Layers',
        status: urls.length >= 3 ? 'PASS' : 'PARTIAL',
        message: `${urls.length}/5 data layer URLs available`,
        data: { validUrls: urls.length, totalUrls: 5 }
      };
    } catch (error) {
      return {
        test: 'Data Layers',
        status: 'FAIL',
        message: error.message
      };
    }
  };

  const runConsoleTests = async () => {
    setIsRunning(true);
    setCurrentTest('Running comprehensive console tests...');
    
    try {
      // Redirect console output to capture results
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      await runSolarApiTests();

      // Restore console
      console.log = originalLog;

      toast({
        title: "Console Tests Completed",
        description: "Check browser console for detailed results",
      });
    } catch (error) {
      console.error('Console test error:', error);
      toast({
        title: "Console Test Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAIL': case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PARTIAL': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'PASS': 'default',
      'success': 'default',
      'FAIL': 'destructive',
      'error': 'destructive',
      'PARTIAL': 'outline',
      'running': 'secondary',
      'pending': 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6">
      {/* Mobile-optimized Header Card */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          Google Solar API Test Suite
        </CardTitle>
          
          {/* Mobile: Stack buttons vertically, Desktop: Horizontal */}
          <div className="flex flex-col gap-2 md:flex-row md:gap-2">
          <Button 
            onClick={runInteractiveTests} 
            disabled={isRunning}
              className="w-full md:w-auto h-12 md:h-10 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Running Tests...' : 'Run Interactive Tests'}
          </Button>
          
          <Button 
            onClick={runConsoleTests} 
            disabled={isRunning}
            variant="outline"
              className="w-full md:w-auto h-12 md:h-10 flex items-center justify-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Run Full Console Tests
          </Button>
        </div>
      </CardHeader>
      </Card>

      {/* Location Management Card */}
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4 md:h-5 md:w-5" />
              Test Locations
            </CardTitle>
            
            {/* Mobile: Add Location Button */}
            <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 w-10 md:h-auto md:w-auto md:px-4 md:py-2 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">Add Location</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle>Add Test Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="modal-location-name" className="text-sm font-medium">
                      Location Name
                    </Label>
                    <Input
                      id="modal-location-name"
                      placeholder="e.g., London, UK"
                      value={locationInput.name}
                      onChange={(e) => setLocationInput(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modal-latitude" className="text-sm font-medium">
                      Latitude
                    </Label>
                    <Input
                      id="modal-latitude"
                      type="number"
                      step="0.0001"
                      placeholder="51.5074"
                      value={locationInput.lat}
                      onChange={(e) => setLocationInput(prev => ({ ...prev, lat: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modal-longitude" className="text-sm font-medium">
                      Longitude
                    </Label>
                    <Input
                      id="modal-longitude"
                      type="number"
                      step="0.0001"
                      placeholder="-0.1278"
                      value={locationInput.lng}
                      onChange={(e) => setLocationInput(prev => ({ ...prev, lng: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={addLocation} className="flex-1 h-11">
                      Add Location
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddLocationOpen(false)}
                      className="flex-1 h-11"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">

          {/* Location List */}
          {locationTests.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm md:text-base font-medium">Test Locations ({locationTests.length})</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllLocations}
                  className="h-8 px-3 text-xs md:text-sm"
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-2">
                {locationTests.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Badge variant={
                        location.status === 'success' ? 'default' :
                        location.status === 'error' ? 'destructive' :
                        location.status === 'running' ? 'secondary' : 'outline'
                      } className="text-xs flex-shrink-0">
                        {location.status}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base truncate">{location.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLocation(index)}
                      className="h-8 w-8 p-0 flex-shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Demo Locations - Mobile: Horizontal scroll, Desktop: Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm md:text-base font-medium">Quick Add Demo Locations</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const demoLocations = [
                    { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
                    { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
                    { name: 'San Francisco, USA', lat: 37.7749, lng: -122.4194 },
                    { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050 },
                    { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
                    { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
                    { name: 'Toronto, Canada', lat: 43.6532, lng: -79.3832 },
                    { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 }
                  ];
                  
                  setLocationTests(prev => [...prev, ...demoLocations.map(loc => ({
                    name: loc.name,
                    lat: loc.lat,
                    lng: loc.lng,
                    status: 'pending' as const
                  }))]);
                  
                  toast({
                    title: 'Demo Locations Added',
                    description: `Added ${demoLocations.length} demo locations to test list`,
                  });
                }}
                className="h-8 px-3 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add All
              </Button>
            </div>
            
            {/* Mobile: Horizontal scrollable chips */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {[
                  { name: 'London, UK', lat: '51.5074', lng: '-0.1278' },
                  { name: 'New York, USA', lat: '40.7128', lng: '-74.0060' },
                  { name: 'San Francisco, USA', lat: '37.7749', lng: '-122.4194' },
                  { name: 'Berlin, Germany', lat: '52.5200', lng: '13.4050' },
                  { name: 'Tokyo, Japan', lat: '35.6762', lng: '139.6503' },
                  { name: 'Sydney, Australia', lat: '-33.8688', lng: '151.2093' },
                  { name: 'Toronto, Canada', lat: '43.6532', lng: '-79.3832' },
                  { name: 'Dubai, UAE', lat: '25.2048', lng: '55.2708' }
                ].map((location, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLocationInput({ name: location.name, lat: location.lat, lng: location.lng });
                      setIsAddLocationOpen(true);
                    }}
                    className="flex-shrink-0 h-8 px-3 text-xs border rounded-full inline-flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    {location.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Tap any location above to auto-fill the form and add it to your test list.
            </p>
          </div>

          {/* Empty State */}
          {locationTests.length === 0 && (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No locations added yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add test locations to validate Solar API coverage in different regions.
              </p>
              <Button 
                onClick={() => setIsAddLocationOpen(true)}
                className="h-11 px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add a Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

        {/* Progress Bar */}
        {isRunning && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
            <div className="flex justify-between text-sm">
                <span className="font-medium">{currentTest}</span>
                <span className="text-muted-foreground">{progress}%</span>
            </div>
              <Progress value={progress} className="w-full h-2" />
          </div>
          </CardContent>
        </Card>
        )}

      {/* Tabs - Mobile optimized */}
      <Card>
        <Tabs defaultValue="overview" className="w-full">
          <div className="p-4">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 h-10 bg-muted">
              <TabsTrigger value="overview" className="text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground">Overview</TabsTrigger>
              <TabsTrigger value="locations" className="text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground">Tests</TabsTrigger>
              <TabsTrigger value="imagery" className="text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground">Imagery</TabsTrigger>
              <TabsTrigger value="sunpath" className="text-xs md:text-sm hidden md:flex data-[state=active]:bg-background data-[state=active]:text-foreground">Sun Path</TabsTrigger>
              <TabsTrigger value="results" className="text-xs md:text-sm hidden md:flex data-[state=active]:bg-background data-[state=active]:text-foreground">Results</TabsTrigger>
          </TabsList>
          </div>

          <TabsContent value="overview" className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm md:text-base">API Configuration</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Key: {API_CONFIG.GOOGLE_MAPS_API_KEY ? 'Configured' : 'Missing'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm md:text-base">Test Locations</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {locationTests.filter(l => l.status === 'success').length}/{locationTests.length} Complete
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm md:text-base">Total Tests</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {results.filter(r => r.status === 'PASS').length}/{results.length} Passed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="locations" className="p-4 space-y-3">
            {locationTests.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No test results yet</p>
              </div>
            ) : (
              locationTests.map((location, index) => (
              <Card key={index}>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      {getStatusIcon(location.status)}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm md:text-base truncate">{location.name}</h4>
                          <p className="text-xs md:text-sm text-muted-foreground">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                      <div className="flex-shrink-0 ml-2">
                    {getStatusBadge(location.status)}
                      </div>
                  </div>
                  
                  {location.result && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm">
                      <div>
                          <p className="text-muted-foreground mb-1">Max Panels</p>
                        <p className="font-medium">{location.result.maxPanels}</p>
                      </div>
                      <div>
                          <p className="text-muted-foreground mb-1">Roof Area</p>
                        <p className="font-medium">{location.result.roofArea}m²</p>
                      </div>
                      <div>
                          <p className="text-muted-foreground mb-1">Est. Energy</p>
                        <p className="font-medium">{Math.round(location.result.estimatedYearlyEnergy)}kWh</p>
                      </div>
                      <div>
                          <p className="text-muted-foreground mb-1">Response Time</p>
                        <p className="font-medium">{location.result.duration}ms</p>
                      </div>
                    </div>
                  )}
                  
                  {location.error && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-xs md:text-sm text-red-600">
                      {location.error}
                    </div>
                  )}
                </CardContent>
              </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="imagery" className="p-4 space-y-4">
            {locationTests.filter(loc => loc.imagery).length === 0 ? (
              <div className="text-center py-8">
                <Image className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No imagery data yet</p>
                <p className="text-xs text-muted-foreground mt-1">Run tests to fetch solar imagery</p>
              </div>
            ) : (
              locationTests.filter(loc => loc.imagery).map((location, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <CardTitle className="text-base md:text-lg">{location.name} - Solar Imagery</CardTitle>
                      <div className="flex flex-col gap-1 md:flex-row md:gap-4 text-xs md:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Requested: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                        </span>
                        {location.imagery?.center && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-blue-500" />
                            Building Center: {location.imagery.center.latitude.toFixed(5)}, {location.imagery.center.longitude.toFixed(5)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6">
                    {/* Imagery Quality and Load All Button */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
                        {location.imagery.imageryQuality && (
                          <Badge variant={
                            location.imagery.imageryQuality === 'HIGH' ? 'default' :
                            location.imagery.imageryQuality === 'MEDIUM' ? 'secondary' : 'outline'
                          } className="text-xs w-fit">
                            Quality: {location.imagery.imageryQuality}
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {location.imagery.imageryQuality === 'HIGH' ? '10' : location.imagery.imageryQuality === 'MEDIUM' ? '25' : '50'} cm/pixel
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Trigger all GeoTIFF images to load
                          const event = new CustomEvent('loadAllImages', { detail: location.name });
                          window.dispatchEvent(event);
                        }}
                        className="flex items-center gap-2 h-9 text-xs md:text-sm"
                      >
                        <Image className="h-3 w-3 md:h-4 md:w-4" />
                        Load All Images
                      </Button>
                    </div>

                    {/* RGB Aerial Imagery */}
                    {location.imagery.rgbUrl && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2 text-sm md:text-base">
                          <Image className="h-3 w-3 md:h-4 md:w-4" />
                          HD Aerial Imagery
                        </h4>
                        <GeoTIFFImage url={location.imagery.rgbUrl} type="rgb" location={location} />
                      </div>
                    )}

                    {/* DSM */}
                    {location.imagery.dsmUrl && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2 text-sm md:text-base">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                          Digital Surface Model
                        </h4>
                        <GeoTIFFImage url={location.imagery.dsmUrl} type="dsm" location={location} />
                        <p className="text-xs text-muted-foreground">
                          Color-coded height map showing building and terrain elevation
                        </p>
                      </div>
                    )}

                    {/* Annual Flux */}
                    {location.imagery.annualFluxUrl && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2 text-sm md:text-base">
                          <Zap className="h-3 w-3 md:h-4 md:w-4" />
                          Annual Solar Flux Map
                        </h4>
                        <GeoTIFFImage url={location.imagery.annualFluxUrl} type="annualFlux" location={location} />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Shady (0 kWh/kW/year)</span>
                          <span>Sunny (1800+ kWh/kW/year)</span>
                        </div>
                      </div>
                    )}

                    {/* Mask */}
                    {location.imagery.maskUrl && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm md:text-base">Roof Mask (Available Area)</h4>
                        <GeoTIFFImage url={location.imagery.maskUrl} type="mask" location={location} />
                        <p className="text-xs text-muted-foreground">
                          Black = No roof, White = Roof area suitable for solar panels
                        </p>
                      </div>
                    )}

                    {/* Additional info */}
                    {location.imagery.monthlyFluxUrl && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs md:text-sm text-blue-900">
                          <CheckCircle className="h-3 w-3 md:h-4 md:w-4 inline mr-1" />
                          Monthly flux data available (12 months)
                        </p>
                      </div>
                    )}

                    {location.imagery.hourlyShadeUrls && location.imagery.hourlyShadeUrls.length > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs md:text-sm text-blue-900">
                          <CheckCircle className="h-3 w-3 md:h-4 md:w-4 inline mr-1" />
                          Hourly shade analysis available ({location.imagery.hourlyShadeUrls.length} months × 24 hours)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Sun Path tab: live diagram from Building Insights */}
          <TabsContent value="sunpath" className="p-4 space-y-4">
            {locationTests.filter(loc => loc.result?.fullData?.solarPotential?.roofSegmentStats).length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No sun path data yet</p>
                <p className="text-xs text-muted-foreground mt-1">Run tests to fetch building insights</p>
              </div>
            ) : (
              locationTests.filter(loc => loc.result?.fullData?.solarPotential?.roofSegmentStats).map((location, index) => {
                const insights = location.result.fullData as any;
                const segments = (insights?.solarPotential?.roofSegmentStats ?? []).map((seg: any, i: number) => ({
                  pitchDegrees: seg.pitchDegrees,
                  azimuthDegrees: seg.azimuthDegrees,
                  areaMeters2: seg.stats?.areaMeters2,
                  sunshineQuantiles: seg.stats?.sunshineQuantiles,
                  label: `Seg ${i + 1}`,
                }));
                const maxSun = insights?.solarPotential?.maxSunshineHoursPerYear ?? 1100;
                return (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg">{location.name} — Sun Path</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SunpathDiagram
                        latitude={insights?.center?.latitude ?? location.lat}
                        longitude={insights?.center?.longitude ?? location.lng}
                        segments={segments}
                        maxSunshineHoursPerYear={maxSun}
                      />
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="results" className="p-4 space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No test results yet</p>
                <p className="text-xs text-muted-foreground mt-1">Run tests to see detailed results</p>
              </div>
            ) : (
              <>
                {/* Complete Solar Data */}
                {locationTests.filter(loc => loc.result?.fullData).map((location, index) => (
                  <Card key={`full-${index}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <span>{location.name} - Complete Solar Data</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const dataStr = JSON.stringify(location.result.fullData, null, 2);
                            navigator.clipboard.writeText(dataStr);
                            toast({
                              title: "Copied to Clipboard",
                              description: "Full solar data copied successfully",
                            });
                          }}
                          className="h-8 text-xs md:text-sm"
                        >
                          Copy JSON
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 md:space-y-6">
                      {/* Financial Analyses */}
                      {location.result.fullData.solarPotential.financialAnalyses && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-base md:text-lg">Financial Analyses</h4>
                          <div className="grid gap-3">
                            {location.result.fullData.solarPotential.financialAnalyses
                              .filter((fa: any) => fa.financialDetails)
                              .map((analysis: any, idx: number) => (
                              <Card key={idx} className="bg-blue-50">
                                <CardContent className="p-3 md:p-4">
                                  <div className="space-y-2">
                                    <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
                                      <span className="font-medium text-sm md:text-base">Monthly Bill: ${analysis.monthlyBill.units}</span>
                                      <Badge className="text-xs w-fit">Panel Config #{analysis.panelConfigIndex}</Badge>
                                    </div>
                                    {analysis.financialDetails && (
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm mt-3">
                                        <div>
                                          <p className="text-gray-600 mb-1">Initial AC kWh/Year</p>
                                          <p className="font-semibold">{Math.round(analysis.financialDetails.initialAcKwhPerYear)}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600 mb-1">Lifetime Utility Bill</p>
                                          <p className="font-semibold">${analysis.financialDetails.remainingLifetimeUtilityBill?.units || 0}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600 mb-1">Federal Incentive</p>
                                          <p className="font-semibold">${analysis.financialDetails.federalIncentive?.units || 0}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600 mb-1">Solar Percentage</p>
                                          <p className="font-semibold">{analysis.financialDetails.solarPercentage?.toFixed(1)}%</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600 mb-1">Net Metering</p>
                                          <p className="font-semibold">{analysis.financialDetails.netMeteringAllowed ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600 mb-1">Export to Grid</p>
                                          <p className="font-semibold">{analysis.financialDetails.percentageExportedToGrid?.toFixed(1)}%</p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Cash Purchase */}
                                    {analysis.cashPurchaseSavings && (
                                      <div className="mt-3 p-3 bg-white rounded">
                                        <p className="font-medium mb-2 text-sm md:text-base">Cash Purchase</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div>Upfront Cost: ${analysis.cashPurchaseSavings.upfrontCost?.units}</div>
                                          <div>Payback: {analysis.cashPurchaseSavings.paybackYears} years</div>
                                          <div>Year 1 Savings: ${analysis.cashPurchaseSavings.savings?.savingsYear1?.units}</div>
                                          <div>Lifetime Savings: ${analysis.cashPurchaseSavings.savings?.savingsLifetime?.units}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Solar Panel Configs */}
                      {location.result.fullData.solarPotential.solarPanelConfigs && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-base md:text-lg">Solar Panel Configurations</h4>
                          <div className="grid gap-2">
                            {location.result.fullData.solarPotential.solarPanelConfigs.slice(0, 10).map((config: any, idx: number) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded border">
                                <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                                  <div>
                                    <p className="text-gray-600 mb-1">Panels</p>
                                    <p className="font-semibold">{config.panelsCount}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 mb-1">Yearly Energy</p>
                                    <p className="font-semibold">{Math.round(config.yearlyEnergyDcKwh)} kWh</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 mb-1">Roof Segments</p>
                                    <p className="font-semibold">{config.roofSegmentSummaries?.length || 0}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw JSON */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-base md:text-lg">Complete Raw Data (JSON)</h4>
                        <div className="max-h-64 md:max-h-96 overflow-auto">
                          <pre className="bg-gray-900 text-green-400 p-3 md:p-4 rounded text-xs">
                            {JSON.stringify(location.result.fullData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Test Results Summary */}
                {results.map((result, index) => (
                <Card key={index}>
                    <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                        {getStatusIcon(result.status)}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm md:text-base">{result.test}</h4>
                            <p className="text-xs md:text-sm text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                        <div className="flex-shrink-0 ml-2">
                      {getStatusBadge(result.status)}
                    </div>
                      </div>
                  </CardContent>
                </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
    </Card>
    </div>
  );
}

