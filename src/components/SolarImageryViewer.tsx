import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleSolarApiService } from "@/services/googleSolarApi";
import { Loader2, MapPin, Zap, TreePine, Home, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG } from "@/lib/config";

interface SolarImageryViewerProps {
  latitude: number;
  longitude: number;
  address?: string;
}

interface SolarData {
  buildingInsights: any;
  dataLayers: any;
  formattedData: any;
}

export function SolarImageryViewer({ latitude, longitude, address }: SolarImageryViewerProps) {
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(API_CONFIG.GOOGLE_MAPS_API_KEY);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Auto-fetch solar data when component loads if API key is available
  useEffect(() => {
    if (apiKey.trim() && latitude && longitude) {
      fetchSolarData();
    }
  }, [latitude, longitude, apiKey]);

  const fetchSolarData = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please configure your Google Solar API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [buildingInsights, dataLayers] = await Promise.all([
        GoogleSolarApiService.getBuildingInsights(latitude, longitude, apiKey),
        GoogleSolarApiService.getDataLayers(latitude, longitude, 100, 'IMAGERY_AND_ALL_FLUX_LAYERS', 'HIGH', 0.1, apiKey)
      ]);

      const formattedData = GoogleSolarApiService.formatSolarData(buildingInsights);

      setSolarData({
        buildingInsights,
        dataLayers,
        formattedData
      });

      toast({
        title: "Solar Data Loaded",
        description: `Found ${formattedData.maxPanels} potential solar panels`,
      });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch solar data";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-primary" />
          Solar Analysis for {address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Google Solar API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google Solar API key"
              className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
            />
            <Button 
              onClick={fetchSolarData} 
              disabled={isLoading || !apiKey.trim()}
              className="px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get your API key from the <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a>
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {solarData && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="imagery">Imagery</TabsTrigger>
              <TabsTrigger value="panels">Panels</TabsTrigger>
              <TabsTrigger value="shading">Shading</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5 border">
                  <div className="text-2xl font-bold text-primary">{solarData.formattedData.maxPanels}</div>
                  <div className="text-sm text-muted-foreground">Max Panels</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50 border">
                  <div className="text-2xl font-bold text-green-600">{solarData.formattedData.roofArea}m²</div>
                  <div className="text-sm text-muted-foreground">Roof Area</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-50 border">
                  <div className="text-2xl font-bold text-yellow-600">{solarData.formattedData.maxSunshineHours}h</div>
                  <div className="text-sm text-muted-foreground">Annual Sun</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 border">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(solarData.formattedData.estimatedYearlyEnergy)}kWh</div>
                  <div className="text-sm text-muted-foreground">Est. Annual</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Imagery Date:</span>
                  <Badge variant="secondary">{solarData.formattedData.imageryDate}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Roof Segments:</span>
                  <Badge variant="outline">{solarData.formattedData.roofSegments}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Carbon Offset:</span>
                  <Badge variant="secondary">{solarData.formattedData.carbonOffset} kg/MWh</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="imagery" className="space-y-4">
              <div className="grid gap-4">
                {solarData.dataLayers.rgbUrl && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      HD Aerial Imagery (2cm accuracy)
                    </h4>
                    <div className="relative rounded-lg overflow-hidden border">
                      <img 
                        src={solarData.dataLayers.rgbUrl} 
                        alt="HD Aerial view of property"
                        className="w-full h-auto max-h-96 object-contain bg-gray-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {solarData.dataLayers.dsmUrl && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Digital Surface Model
                    </h4>
                    <div className="relative rounded-lg overflow-hidden border">
                      <img 
                        src={solarData.dataLayers.dsmUrl} 
                        alt="Digital surface model"
                        className="w-full h-auto max-h-96 object-contain bg-gray-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {solarData.dataLayers.annualFluxUrl && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Annual Solar Flux
                    </h4>
                    <div className="relative rounded-lg overflow-hidden border">
                      <img 
                        src={solarData.dataLayers.annualFluxUrl} 
                        alt="Annual solar flux map"
                        className="w-full h-auto max-h-96 object-contain bg-gray-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="panels" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Solar Panel Configuration
                  </h4>
                  <Badge variant="default">{solarData.formattedData.totalPanels} panels</Badge>
                </div>

                <div className="grid gap-4">
                  {solarData.buildingInsights.solarPotential.roofSegmentStats.map((segment: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg border bg-card">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Segment:</span>
                          <div className="font-medium">#{index + 1}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Area:</span>
                          <div className="font-medium">{Math.round(segment.stats.areaMeters2)}m²</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pitch:</span>
                          <div className="font-medium">{Math.round(segment.pitchDegrees)}°</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Azimuth:</span>
                          <div className="font-medium">{Math.round(segment.azimuthDegrees)}°</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shading" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <TreePine className="h-4 w-4" />
                  Shading Analysis
                </h4>

                {solarData.dataLayers.maskUrl && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Roof Mask (Available Area)</h5>
                    <div className="relative rounded-lg overflow-hidden border">
                      <img 
                        src={solarData.dataLayers.maskUrl} 
                        alt="Roof mask showing available area"
                        className="w-full h-auto max-h-96 object-contain bg-gray-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {solarData.dataLayers.hourlyShadeUrls && solarData.dataLayers.hourlyShadeUrls.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Hourly Shade Analysis</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {solarData.dataLayers.hourlyShadeUrls.slice(0, 6).map((url: string, index: number) => (
                        <div key={index} className="relative rounded overflow-hidden border">
                          <img 
                            src={url} 
                            alt={`Shade analysis ${index + 1}`}
                            className="w-full h-24 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                            Hour {index * 2 + 8}:00
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-blue-50 border">
                  <h5 className="text-sm font-medium mb-2">Shading Report Summary</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Total roof area: {solarData.formattedData.roofArea}m²</li>
                    <li>• Usable area after shading: {solarData.formattedData.maxArea}m²</li>
                    <li>• Efficiency: {Math.round((solarData.formattedData.maxArea / solarData.formattedData.roofArea) * 100)}%</li>
                    <li>• Peak sun hours: {Math.round(solarData.formattedData.maxSunshineHours / 365)} hours/day</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}