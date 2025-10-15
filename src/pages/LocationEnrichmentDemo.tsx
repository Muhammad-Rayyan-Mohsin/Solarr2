import { useState } from "react";
import { LocationEnrichmentForm } from "@/components/LocationEnrichmentForm";
import { LocationData } from "@/services/locationEnrichmentService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Zap, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function LocationEnrichmentDemo() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  const handleLocationDataReceived = (data: LocationData) => {
    setLocationData(data);
    toast({
      title: "Location Data Enriched",
      description: "All location fields have been automatically populated",
    });
  };

  const handleCoordinatesReceived = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
  };

  const handleUseInSurvey = () => {
    // In a real app, this would navigate to the survey with the enriched data
    toast({
      title: "Ready for Survey",
      description: "Location data has been prepared for the solar assessment survey",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Survey
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Smart Location Enrichment
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enter any location format and watch as our system automatically detects the type 
              and enriches all related location fields. Perfect for solar assessment surveys.
            </p>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Multi-Format Support</h3>
              <p className="text-sm text-muted-foreground">
                Supports addresses, postcodes, coordinates, and What3Words
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Auto-Enrichment</h3>
              <p className="text-sm text-muted-foreground">
                Automatically detects format and populates all related fields
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Verified Data</h3>
              <p className="text-sm text-muted-foreground">
                Uses multiple APIs to ensure accurate and complete location data
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Form */}
          <div>
            <LocationEnrichmentForm
              onLocationDataReceived={handleLocationDataReceived}
              onCoordinatesReceived={handleCoordinatesReceived}
            />
          </div>

          {/* Results Summary */}
          <div className="space-y-6">
            {locationData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Enrichment Complete</span>
                  </CardTitle>
                  <CardDescription>
                    All location fields have been automatically populated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Address:</span>
                        <p className="text-muted-foreground truncate">
                          {locationData.siteAddress}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Postcode:</span>
                        <p className="text-muted-foreground">
                          {locationData.postcode}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Country:</span>
                        <p className="text-muted-foreground">
                          {locationData.country}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">City:</span>
                        <p className="text-muted-foreground">
                          {locationData.city}
                        </p>
                      </div>
                    </div>

                    {coordinates && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-blue-800">GPS Coordinates</span>
                        </div>
                        <div className="text-sm text-blue-700">
                          <p>Latitude: {coordinates.lat.toFixed(6)}</p>
                          <p>Longitude: {coordinates.lng.toFixed(6)}</p>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={handleUseInSurvey}
                      className="w-full"
                      size="lg"
                    >
                      Use This Location in Survey
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Information */}
            <Card>
              <CardHeader>
                <CardTitle>Powered by Multiple APIs</CardTitle>
                <CardDescription>
                  Our enrichment system uses the best available APIs for accurate results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Google Maps Geocoding</span>
                    <Badge variant="secondary">Global</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">What3Words</span>
                    <Badge variant="secondary">Precise</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ideal Postcodes</span>
                    <Badge variant="secondary">UK Focused</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Test Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Test Locations</CardTitle>
                <CardDescription>
                  Try these examples to see the enrichment in action
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setLocationData({
                      siteAddress: "10 Downing Street, Westminster, London SW1A 2AA, UK",
                      postcode: "SW1A 2AA",
                      coordinates: "51.5034, -0.1278",
                      country: "United Kingdom",
                      county: "Greater London",
                      city: "London"
                    })}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    10 Downing Street, London
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setLocationData({
                      siteAddress: "Times Square, New York, NY 10036, USA",
                      postcode: "10036",
                      coordinates: "40.7589, -73.9851",
                      country: "United States",
                      county: "New York",
                      city: "New York"
                    })}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Times Square, New York
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setLocationData({
                      siteAddress: "///filled.count.soap",
                      postcode: "",
                      coordinates: "51.5074, -0.1278",
                      what3Words: "///filled.count.soap",
                      country: "United Kingdom",
                      city: "London"
                    })}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    What3Words: ///filled.count.soap
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
