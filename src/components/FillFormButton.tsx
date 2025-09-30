import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TestImageGenerator } from '@/utils/test-image-generator';

interface FillFormButtonProps {
  onFillForm: (data: any) => void;
}

export function FillFormButton({ onFillForm }: FillFormButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fillFormWithTestData = () => {
    setIsLoading(true);
    
    // Generate test survey ID
    const testSurveyId = `test-survey-${Date.now()}`;
    
    // Generate test images
    const testImages = TestImageGenerator.generateAllTestImages(testSurveyId);
    
    // Comprehensive test data that fills all required fields
    const testData = {
      // Section 0 - General & Contact
      surveyDate: new Date().toISOString(),
      surveyorInfo: {
        name: "John Smith",
        telephone: "+44 7123 456789",
        email: "surveyor@example.com"
      },
      customerName: "Jane Doe",
      siteAddress: "123 Solar Street, Green City, London",
      postcode: "SW1A 1AA",
      gridReference: "TQ301797",
      what3words: "///test.words.here",
      phone: "+44 7987 654321",
      email: "customer@example.com",
      secondaryContactName: "Bob Smith",
      secondaryContactPhone: "+44 7456 123789",

      // Section 1 - Electricity Baseline
      annualConsumption: "4000",
      annualConsumptionPhoto: TestImageGenerator.getImagePaths(testImages.annualConsumptionPhoto),
      smartMeterPresent: "yes" as const,

      // Section 2 - Property Overview
      propertyType: "detached",
      propertyAge: "1980-2000",
      occupancyStatus: "owner-occupied",
      listedBuilding: "no" as const,
      conservationArea: "no" as const,
      newBuild: "no" as const,
      sharedRoof: "no" as const,
      scaffoldAccess: "yes" as const,
      scaffoldAccessPhoto: TestImageGenerator.getImagePaths(testImages.scaffoldAccessPhoto),
      storageArea: "yes" as const,
      storageAreaPhoto: TestImageGenerator.getImagePaths(testImages.storageAreaPhoto),
      restrictedParking: "None",

      // Section 3 - Roof Inspection (complete roof face data with all 13 fields + photos)
      roofFaces: [{
        id: "roof-1",
        label: "Main Roof",
        orientation: 180,
        pitch: 35,
        width: "8.5",
        length: "12.0",
        area: "102",
        covering: "concrete-tiles",
        coveringCondition: "good",
        obstructions: ["chimney", "vent"],
        shading: ["tree-morning", "neighbor-building"],
        gutterHeight: "2.5",
        rafterSpacing: "600",
        rafterDepth: "150",
        rafterWidth: "50",
        membraneType: "breathable",
        membraneCondition: "good",
        structuralDefects: "None",
        plannedPanelCount: "12",
        photos: TestImageGenerator.getImagePaths(
          TestImageGenerator.generateTestImages(testSurveyId, 'roof_faces', 'roof_face_0_photos', 4)
        ),
      }],

      // Section 4 - Loft / Attic
      loftHatchWidth: "0.6",
      loftHatchHeight: "0.5",
      loftAccessType: "easy",
      loftHeadroom: "2.1",
      loftBoardsInPlace: "yes" as const,
      roofTimberCondition: "good",
      roofTimberPhoto: TestImageGenerator.getImagePaths(testImages.roofTimberPhoto),
      roofTimberNotes: "All timbers in good condition",
      wallSpaceInverter: "yes" as const,
      wallSpaceInverterPhoto: TestImageGenerator.getImagePaths(testImages.wallSpaceInverterPhoto),
      wallSpaceInverterNotes: "Space available near consumer unit",
      wallSpaceBattery: "no" as const,
      wallSpaceBatteryPhoto: TestImageGenerator.getImagePaths(testImages.wallSpaceBatteryPhoto),
      wallSpaceBatteryNotes: "No suitable wall space",
      loftInsulationThickness: "300",
      loftLighting: "LED",
      loftPowerSocket: "yes" as const,

      // Section 5 - Electrical Supply
      supplyType: "single-phase",
      mainFuseRating: "100A",
      mainFusePhoto: TestImageGenerator.getImagePaths(testImages.mainFusePhoto),
      consumerUnitMake: "Hager",
      consumerUnitLocation: "Garage",
      consumerUnitLocationPhoto: TestImageGenerator.getImagePaths(testImages.consumerUnitLocationPhoto),
      spareFuseWays: "4",
      spareFuseWaysPhoto: TestImageGenerator.getImagePaths(testImages.spareFuseWaysPhoto),
      existingSurgeProtection: "no" as const,
      existingSurgeProtectionPhoto: TestImageGenerator.getImagePaths(testImages.existingSurgeProtectionPhoto),
      earthBondingVerified: "yes" as const,
      earthBondingPhoto: TestImageGenerator.getImagePaths(testImages.earthBondingPhoto),
      earthingSystemType: "TN-S",
      earthingSystemPhoto: TestImageGenerator.getImagePaths(testImages.earthingSystemPhoto),
      cableRouteToRoof: ["Through loft", "External conduit"],
      cableRouteToBattery: ["Through garage wall"],
      dnoNotificationRequired: true,
      evChargerInstalled: "no" as const,
      evChargerLoad: "7.4",

      // Section 6 - Battery & Storage Preferences
      batteryRequired: "yes",
      preferredInstallLocation: "garage",
      distanceFromCU: "2.5",
      mountingSurface: "wall",
      ventilationAdequate: "yes" as const,
      ventilationPhoto: TestImageGenerator.getImagePaths(testImages.ventilationPhoto),

      // Section 7 - Health, Safety & Hazards
      asbestosPresence: "no",
      asbestosPhoto: TestImageGenerator.getImagePaths(testImages.asbestosPhoto),
      workingAtHeightDifficulties: "None",
      fragileRoofAreas: TestImageGenerator.getImagePaths(testImages.fragileRoofAreas),
      livestockPetsOnSite: "no" as const,
      livestockPetsNotes: "No pets",
      specialAccessInstructions: "Standard access",

      // Section 8 - Customer Preferences & Next Steps
      preferredContactMethod: "email",
      installationStartDate: "2024-02-01",
      installationEndDate: "2024-02-15",
      customerAway: false,
      customerAwayNotes: "",
      budgetRange: "8k-12k",
      interestedInEvCharger: "yes" as const,
      interestedInEnergyMonitoring: "yes" as const,
      additionalNotes: "Customer very interested in battery storage",
      
      // Section 9 - Customer Signature
      customerSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" // Mock signature data
    };

    // Simulate loading delay for better UX
    setTimeout(() => {
      onFillForm(testData);
      setIsLoading(false);
      
      toast({
        title: "Form Filled Successfully",
        description: "All required fields have been populated with test data",
      });
    }, 1000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Fill Form with Test Data
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click the button below to automatically fill all required fields with realistic test data including multiple sample images to test upload and storage functionality
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Contact Information</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Property Details</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Safety & Preferences</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">What gets filled:</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Customer and surveyor contact details</li>
                  <li>• Property address and location data</li>
                  <li>• Property type, age, and occupancy status</li>
                  <li>• Complete roof face data (all 13 fields + 4 roof photos)</li>
                  <li>• Electrical supply and safety information</li>
                  <li>• Multiple test images for each photo field (2-4 images per field)</li>
                  <li>• Realistic file paths for Supabase storage testing</li>
                  <li>• Customer preferences and installation dates</li>
                  <li>• Mock customer signature for testing</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={fillFormWithTestData}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Filling Form...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Fill All Required Fields
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            This will populate all required fields with realistic test data including multiple sample images to test upload and storage functionality for development and testing purposes
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
