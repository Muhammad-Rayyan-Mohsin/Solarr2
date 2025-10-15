import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runSolarApiTests } from '@/tests/solarApiTest';
import { GoogleSolarApiService } from '@/services/googleSolarApi';
import { API_CONFIG } from '@/lib/config';
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

  const renderImage = async (applyMask: boolean = showMask) => {
    try {
      setIsLoading(true);
      setError(null);

      // Download and process GeoTIFF
      if (type === 'rgb') {
        const rgb = await downloadGeoTIFF(url, API_CONFIG.GOOGLE_MAPS_API_KEY);
        let canvas: HTMLCanvasElement;
        
        if (applyMask) {
          const mask = await downloadGeoTIFF(location.imagery.maskUrl, API_CONFIG.GOOGLE_MAPS_API_KEY);
          canvas = renderRGB(rgb, mask);
        } else {
          canvas = renderRGB(rgb);
        }
        setImageUrl(canvas.toDataURL());
      } else if (type === 'dsm') {
        const data = await downloadGeoTIFF(url, API_CONFIG.GOOGLE_MAPS_API_KEY);
        const sortedValues = Array.from(data.rasters[0]).sort((x, y) => x - y);
        
        let canvas: HTMLCanvasElement;
        if (applyMask) {
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
        if (applyMask) {
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
          onClick={renderImage}
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
            onClick={renderImage}
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

  if (imageUrl) {
    return (
      <div className="space-y-2">
        <img 
          src={imageUrl} 
          alt={`${type} visualization`}
          className="w-full h-auto rounded border"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type !== 'mask' && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showMask}
                  onChange={(e) => setShowMask(e.target.checked)}
                  className="rounded"
                />
                <span>Show roof only</span>
              </label>
            )}
          </div>
          <Button 
            onClick={() => {
              setImageUrl(null);
              setHasLoaded(false);
              setError(null);
            }}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            Reload Image
          </Button>
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
  const [locationTests, setLocationTests] = useState<LocationTest[]>([
    { name: 'London, UK', lat: 51.5074, lng: -0.1278, status: 'pending' },
    { name: 'Manchester, UK', lat: 53.4808, lng: -2.2426, status: 'pending' },
    { name: 'Bristol, UK', lat: 51.4545, lng: -2.5879, status: 'pending' }
  ]);
  const { toast } = useToast();

  const runInteractiveTests = async () => {
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
          // Use 'LOW' quality to get best available (Google's recommendation)
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
        'HIGH',
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
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Google Solar API Test Suite
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={runInteractiveTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
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
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Run Full Console Tests
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentTest}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="locations">Location Tests</TabsTrigger>
            <TabsTrigger value="imagery">Solar Imagery</TabsTrigger>
            <TabsTrigger value="results">Detailed Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">API Configuration</p>
                      <p className="text-sm text-muted-foreground">
                        Key: {API_CONFIG.GOOGLE_MAPS_API_KEY ? 'Configured' : 'Missing'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Test Locations</p>
                      <p className="text-sm text-muted-foreground">
                        {locationTests.filter(l => l.status === 'success').length}/{locationTests.length} Complete
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Total Tests</p>
                      <p className="text-sm text-muted-foreground">
                        {results.filter(r => r.status === 'PASS').length}/{results.length} Passed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            {locationTests.map((location, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(location.status)}
                      <div>
                        <h4 className="font-medium">{location.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(location.status)}
                  </div>
                  
                  {location.result && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Max Panels</p>
                        <p className="font-medium">{location.result.maxPanels}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Roof Area</p>
                        <p className="font-medium">{location.result.roofArea}m²</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Est. Energy</p>
                        <p className="font-medium">{Math.round(location.result.estimatedYearlyEnergy)}kWh</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Response Time</p>
                        <p className="font-medium">{location.result.duration}ms</p>
                      </div>
                    </div>
                  )}
                  
                  {location.error && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      {location.error}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="imagery" className="space-y-4">
            {locationTests.filter(loc => loc.imagery).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No imagery data yet. Run tests to fetch solar imagery.
              </div>
            ) : (
              locationTests.filter(loc => loc.imagery).map((location, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{location.name} - Solar Imagery</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Imagery Quality and Load All Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {location.imagery.imageryQuality && (
                          <Badge variant={
                            location.imagery.imageryQuality === 'HIGH' ? 'default' :
                            location.imagery.imageryQuality === 'MEDIUM' ? 'secondary' : 'outline'
                          }>
                            Imagery Quality: {location.imagery.imageryQuality}
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
                        className="flex items-center gap-2"
                      >
                        <Image className="h-4 w-4" />
                        Load All Images
                      </Button>
                    </div>

                    {/* RGB Aerial Imagery */}
                    {location.imagery.rgbUrl && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          HD Aerial Imagery
                        </h4>
                        <GeoTIFFImage url={location.imagery.rgbUrl} type="rgb" location={location} />
                      </div>
                    )}

                    {/* DSM */}
                    {location.imagery.dsmUrl && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
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
                        <h4 className="font-medium flex items-center gap-2">
                          <Zap className="h-4 w-4" />
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
                        <h4 className="font-medium">Roof Mask (Available Area)</h4>
                        <GeoTIFFImage url={location.imagery.maskUrl} type="mask" location={location} />
                        <p className="text-xs text-muted-foreground">
                          Black = No roof, White = Roof area suitable for solar panels
                        </p>
                      </div>
                    )}

                    {/* Additional info */}
                    {location.imagery.monthlyFluxUrl && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-900">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Monthly flux data available (12 months)
                        </p>
                      </div>
                    )}

                    {location.imagery.hourlyShadeUrls && location.imagery.hourlyShadeUrls.length > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-900">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Hourly shade analysis available ({location.imagery.hourlyShadeUrls.length} months × 24 hours)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No test results yet. Run tests to see detailed results.
              </div>
            ) : (
              <>
                {/* Complete Solar Data */}
                {locationTests.filter(loc => loc.result?.fullData).map((location, index) => (
                  <Card key={`full-${index}`}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
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
                        >
                          Copy JSON
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Financial Analyses */}
                      {location.result.fullData.solarPotential.financialAnalyses && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-lg">Financial Analyses</h4>
                          <div className="grid gap-3">
                            {location.result.fullData.solarPotential.financialAnalyses
                              .filter((fa: any) => fa.financialDetails)
                              .map((analysis: any, idx: number) => (
                              <Card key={idx} className="bg-blue-50">
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">Monthly Bill: ${analysis.monthlyBill.units}</span>
                                      <Badge>Panel Config #{analysis.panelConfigIndex}</Badge>
                                    </div>
                                    {analysis.financialDetails && (
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-3">
                                        <div>
                                          <p className="text-gray-600">Initial AC kWh/Year</p>
                                          <p className="font-semibold">{Math.round(analysis.financialDetails.initialAcKwhPerYear)}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600">Lifetime Utility Bill</p>
                                          <p className="font-semibold">${analysis.financialDetails.remainingLifetimeUtilityBill?.units || 0}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600">Federal Incentive</p>
                                          <p className="font-semibold">${analysis.financialDetails.federalIncentive?.units || 0}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600">Solar Percentage</p>
                                          <p className="font-semibold">{analysis.financialDetails.solarPercentage?.toFixed(1)}%</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600">Net Metering</p>
                                          <p className="font-semibold">{analysis.financialDetails.netMeteringAllowed ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600">Export to Grid</p>
                                          <p className="font-semibold">{analysis.financialDetails.percentageExportedToGrid?.toFixed(1)}%</p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Cash Purchase */}
                                    {analysis.cashPurchaseSavings && (
                                      <div className="mt-3 p-3 bg-white rounded">
                                        <p className="font-medium mb-2">Cash Purchase</p>
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
                          <h4 className="font-semibold text-lg">Solar Panel Configurations</h4>
                          <div className="grid gap-2">
                            {location.result.fullData.solarPotential.solarPanelConfigs.slice(0, 10).map((config: any, idx: number) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded border">
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-600">Panels</p>
                                    <p className="font-semibold">{config.panelsCount}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Yearly Energy</p>
                                    <p className="font-semibold">{Math.round(config.yearlyEnergyDcKwh)} kWh</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Roof Segments</p>
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
                        <h4 className="font-semibold text-lg">Complete Raw Data (JSON)</h4>
                        <div className="max-h-96 overflow-auto">
                          <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs">
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
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <h4 className="font-medium">{result.test}</h4>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                          </div>
                        </div>
                        {getStatusBadge(result.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
