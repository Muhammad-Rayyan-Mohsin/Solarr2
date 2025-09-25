import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, MapPin, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestLocation {
  name: string;
  address: string;
  postcode: string;
  gridRef: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  expectedPanels: number;
  expectedRoofArea: number;
  expectedEnergy: number;
  expectedSunshine: number;
}

export function SolarTestInputs({ onFillForm }: { onFillForm: (data: any) => void }) {
  const [selectedTest, setSelectedTest] = useState<TestLocation | null>(null);
  const { toast } = useToast();

  const testLocations: TestLocation[] = [
    {
      name: "London Residential (Central)",
      address: "10 Downing Street, Westminster, London",
      postcode: "SW1A 2AA",
      gridRef: "TQ301797",
      lat: 51.5034,
      lng: -0.1276,
      phone: "+44 7123 456789",
      email: "test.london@email.com",
      expectedPanels: 28,
      expectedRoofArea: 157,
      expectedEnergy: 10234,
      expectedSunshine: 1054
    },
    {
      name: "Manchester Semi-Detached",
      address: "15 Oak Avenue, Didsbury, Manchester",
      postcode: "M20 2RN", 
      gridRef: "SJ835905",
      lat: 53.4283,
      lng: -2.2264,
      phone: "+44 7987 654321",
      email: "test.manchester@email.com",
      expectedPanels: 22,
      expectedRoofArea: 125,
      expectedEnergy: 7890,
      expectedSunshine: 786
    },
    {
      name: "Bristol Large Property",
      address: "42 Clifton Down Road, Clifton, Bristol",
      postcode: "BS8 3HJ",
      gridRef: "ST565735", 
      lat: 51.4645,
      lng: -2.6089,
      phone: "+44 7456 123789",
      email: "test.bristol@email.com",
      expectedPanels: 68,
      expectedRoofArea: 343,
      expectedEnergy: 24567,
      expectedSunshine: 1030
    },
    {
      name: "Edinburgh Terraced House",
      address: "25 Royal Mile, Edinburgh",
      postcode: "EH1 1PW",
      gridRef: "NT267735",
      lat: 55.9506,
      lng: -3.1883,
      phone: "+44 7321 987654",
      email: "test.edinburgh@email.com",
      expectedPanels: 18,
      expectedRoofArea: 89,
      expectedEnergy: 5234,
      expectedSunshine: 896
    }
  ];

  const fillFormWithTestData = (location: TestLocation) => {
    const testData = {
      // Section 0 - General & Contact
      customerName: `${location.name.split(' ')[0]} Test Customer`,
      siteAddress: location.address,
      postcode: location.postcode,
      gridReference: location.gridRef,
      phone: location.phone,
      email: location.email,
      
      // Auto-captured GPS data (simulated)
      coordinates: {
        lat: location.lat,
        lng: location.lng
      }
    };

    onFillForm(testData);
    setSelectedTest(location);
    
    toast({
      title: "Test Data Loaded",
      description: `${location.name} data filled into form`,
    });
  };

  const copyCoordinates = (location: TestLocation) => {
    navigator.clipboard.writeText(`${location.lat}, ${location.lng}`);
    toast({
      title: "Coordinates Copied",
      description: `${location.lat}, ${location.lng} copied to clipboard`,
    });
  };

  const copyAddress = (location: TestLocation) => {
    navigator.clipboard.writeText(location.address);
    toast({
      title: "Address Copied", 
      description: "Address copied to clipboard",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Solar API Test Inputs
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Use these test locations to verify Solar API integration in your survey form
        </p>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="locations">Test Locations</TabsTrigger>
            <TabsTrigger value="verification">Expected Results</TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="space-y-4">
            <div className="grid gap-4">
              {testLocations.map((location, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-medium">{location.name}</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>📍 {location.address}</p>
                          <p>📮 {location.postcode}</p>
                          <p>🗺️ {location.gridRef}</p>
                          <p>📞 {location.phone}</p>
                          <p>✉️ {location.email}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span className="font-mono">
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCoordinates(location)}
                            className="h-6 px-2"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => fillFormWithTestData(location)}
                          size="sm"
                          className="whitespace-nowrap"
                        >
                          Fill Form
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyAddress(location)}
                          className="whitespace-nowrap"
                        >
                          Copy Address
                        </Button>
                      </div>
                    </div>

                    {selectedTest?.name === location.name && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Form filled with this data</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            {selectedTest ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedTest.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Expected Solar API output for verification
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Max Panels</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedTest.expectedPanels}</Badge>
                        <span className="text-xs text-muted-foreground">panels</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Roof Area</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedTest.expectedRoofArea}</Badge>
                        <span className="text-xs text-muted-foreground">m²</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Est. Energy</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedTest.expectedEnergy.toLocaleString()}</Badge>
                        <span className="text-xs text-muted-foreground">kWh/year</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Sunshine Hours</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedTest.expectedSunshine}</Badge>
                        <span className="text-xs text-muted-foreground">h/year</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Verification Checklist:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>Solar Imagery Viewer appears automatically</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>Panel count is approximately {selectedTest.expectedPanels} ± 10%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>Roof area is approximately {selectedTest.expectedRoofArea}m² ± 15%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>Energy estimate is approximately {selectedTest.expectedEnergy.toLocaleString()}kWh ± 20%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>HD aerial imagery loads successfully</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>Roof segments are detected (2-4 typical)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>No error messages in console</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <h5 className="font-medium text-blue-900 mb-2">Manual Verification:</h5>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. Fill form with test data using "Fill Form" button</li>
                      <li>2. Navigate to Location section and click "Get Current Location"</li>
                      <li>3. Verify Solar Imagery Viewer appears with data</li>
                      <li>4. Check values match expected ranges above</li>
                      <li>5. Verify aerial imagery loads in Imagery tab</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a test location to see expected results</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
