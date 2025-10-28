import { useState, useEffect } from "react";
import { ModernSurveyHeader } from "@/components/ModernSurveyHeader";
import ModernHeroSection from "@/components/ModernHeroSection";
import { SurveySection } from "@/components/SurveySection";
import { RedFlagsSummary } from "@/components/RedFlagsSummary";
import { TextInput } from "@/components/inputs/TextInput";
import { What3WordsInput } from "@/components/inputs/What3WordsInput";
import { NumberInput } from "@/components/inputs/NumberInput";
import { FillFormButton } from "@/components/FillFormButton";
import { DropdownSelect } from "@/components/inputs/DropdownSelect";
import { YesNoNADropdown } from "@/components/inputs/YesNoNADropdown";
import { TextWithPhotoInput } from "@/components/inputs/TextWithPhotoInput";
import { SurveyorInfoInput } from "@/components/inputs/SurveyorInfoInput";
import { LocationInput } from "@/components/inputs/LocationInput";
import { PhotoUpload } from "@/components/inputs/PhotoUpload";
import { GPSInput } from "@/components/inputs/GPSInput";
import { SignatureInput } from "@/components/inputs/SignatureInput";
import { RoofSection } from "@/components/RoofSection";
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { DateRangeInput } from "@/components/inputs/DateRangeInput";
import { ToggleInput } from "@/components/inputs/ToggleInput";
import { TemperatureRangeInput } from "@/components/inputs/TemperatureRangeInput";
import { SummaryDisplay } from "@/components/inputs/SummaryDisplay";
import { ExportButtons } from "@/components/ExportButtons";
import { DatePickerInput } from "@/components/inputs/DatePickerInput";
import { PhoneInputComponent } from "@/components/inputs/PhoneInput";
import { SimplePhoneInput } from "@/components/inputs/SimplePhoneInput";
import { EnhancedSliderInput } from "@/components/inputs/EnhancedSliderInput";
import { EnhancedPhotoUpload } from "@/components/inputs/EnhancedPhotoUpload";
import { SurveyAerialImage } from "@/components/SurveyAerialImage";
import { SmartLocationInput } from "@/components/inputs/SmartLocationInput";
import { AbstractProgressIndicator } from "@/components/AbstractProgressIndicator";
import { UserFeedbackModal } from "@/components/UserFeedbackModal";
import { BudgetRangeSlider } from "@/components/inputs/BudgetRangeSlider";
import { Button } from "@/components/ui/button";
import { OfflineStatusIndicator } from "@/components/OfflineStatusIndicator";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useOffline } from "@/hooks/use-offline";
import { offlineStorage } from "@/services/offlineStorage";
import { useToast } from "@/hooks/use-toast";
import { SupabaseService } from "@/services/supabaseService";
import { SubmitSurveyButton } from "@/components/SubmitSurveyButton";
import { syncService } from "@/services/syncService";
import { useSearchParams } from "react-router-dom";
import { FormDataMapper } from "@/utils/form-data-mapper";
import { PhotoUploadHandler } from "@/utils/photo-upload-handler";
import { DataTypeFixes } from "@/utils/data-type-fixes";

interface RoofFace {
  id: string;
  label: string;
  orientation: number;
  pitch: number;
  width: string;
  length: string;
  area: string;
  covering: string;
  coveringCondition: string;
  obstructions: string[];
  shading: string[];
  gutterHeight: string;
  rafterSpacing: string;
  rafterDepth: string;
  rafterWidth: string;
  membraneType: string;
  membraneCondition: string;
  structuralDefects: string;
  plannedPanelCount: string;
  photos: string[];
  sunpathDiagram?: string; // Base64 encoded annotated sunpath diagram
}

interface FormData {
  // Section 0 - General & Contact
  surveyDate: string;
  surveyorInfo: {
    name: string;
    telephone: string;
    email: string;
  };
  customerName: string;
  siteAddress: string;
  postcode: string;
  gridReference: string;
  what3words: string;
  phone: string;
  email: string;
  secondaryContactName: string;
  secondaryContactPhone: string;

  // Section 1 - Electricity Baseline
  annualConsumption: string;
  annualConsumptionPhoto: string[];
  smartMeterPresent: "yes" | "no" | "na" | null;

  // Section 2 - Property Overview
  propertyType: string;
  propertyAge: string;
  occupancyStatus: string;
  listedBuilding: "yes" | "no" | "na" | null;
  conservationArea: "yes" | "no" | "na" | null;
  newBuild: "yes" | "no" | "na" | null;
  sharedRoof: "yes" | "no" | "na" | null;
  scaffoldAccess: "yes" | "no" | "na" | null;
  scaffoldAccessPhoto: string[];
  storageArea: "yes" | "no" | "na" | null;
  storageAreaPhoto: string[];
  restrictedParking: string;

  // Section 3 - Roof Inspection
  roofFaces: RoofFace[];

  // Section 4 - Loft / Attic
  loftHatchWidth: string;
  loftHatchHeight: string;
  loftAccessType: string; // quantity/restriction/none
  loftHeadroom: string;
  loftBoardsInPlace: "yes" | "no" | "na" | null;
  roofTimberCondition: string;
  roofTimberPhoto: string[];
  roofTimberNotes: string;
  wallSpaceInverter: "yes" | "no" | "na" | null;
  wallSpaceInverterPhoto: string[];
  wallSpaceInverterNotes: string;
  wallSpaceBattery: "yes" | "no" | "na" | null;
  wallSpaceBatteryPhoto: string[];
  wallSpaceBatteryNotes: string;
  loftInsulationThickness: string;
  loftLighting: string;
  loftPowerSocket: "yes" | "no" | "na" | null;

  // Section 5 - Electrical Supply
  supplyType: string;
  mainFuseRating: string;
  mainFusePhoto: string[];
  consumerUnitMake: string;
  consumerUnitLocation: string;
  consumerUnitLocationPhoto: string[];
  spareFuseWays: string;
  spareFuseWaysPhoto: string[];
  existingSurgeProtection: "yes" | "no" | "na" | null;
  existingSurgeProtectionPhoto: string[];
  earthBondingVerified: "yes" | "no" | "na" | null;
  earthBondingPhoto: string[];
  earthingSystemType: string;
  earthingSystemPhoto: string[];
  cableRouteToRoof: string[];
  cableRouteToBattery: string[];
  dnoNotificationRequired: boolean;
  evChargerInstalled: "yes" | "no" | "na" | null;
  evChargerLoad: string;

  // Section 6 - Battery & Storage Preferences
  batteryRequired: string;
  preferredInstallLocation: string;
  distanceFromCU: string;
  mountingSurface: string;
  ventilationAdequate: "yes" | "no" | "na" | null;
  ventilationPhoto: string[];

  // Section 7 - Health, Safety & Hazards
  asbestosPresence: string;
  asbestosPhoto: string[];
  workingAtHeightDifficulties: string;
  fragileRoofAreas: string[];
  livestockPetsOnSite: "yes" | "no" | "na" | null;
  livestockPetsNotes: string;
  specialAccessInstructions: string;

  // Section 8 - Customer Preferences & Next Steps
  preferredContactMethod: string;
  installationStartDate: string;
  installationEndDate: string;
  customerAway: boolean;
  customerAwayNotes: string;
  budgetRange: string;
  interestedInEvCharger: "yes" | "no" | "na" | null;
  interestedInEnergyMonitoring: "yes" | "no" | "na" | null;
  additionalNotes: string;
  
  // Section 9 - Customer Signature
  customerSignature: string; // base64 signature data
}

const propertyTypeOptions = [
  { value: "detached", label: "Detached" },
  { value: "semi", label: "Semi-detached" },
  { value: "terrace", label: "Terraced" },
  { value: "bungalow", label: "Bungalow" },
  { value: "flat", label: "Flat" },
  { value: "commercial", label: "Commercial Unit" },
  { value: "other", label: "Other" },
];

const propertyAgeOptions = [
  { value: "pre-1980", label: "Pre 1980" },
  { value: "1980-2000", label: "1980-2000" },
  { value: "2000-2010", label: "2000-2010" },
  { value: "2010-2023", label: "2010-2023" },
];

const occupancyStatusOptions = [
  { value: "owner-occupied", label: "Owner Occupied" },
  { value: "tenant-occupied", label: "Tenant Occupied" },
  { value: "vacant", label: "Vacant" },
  { value: "under-renovation", label: "Under Renovation" },
  { value: "holiday-home", label: "Holiday Home" },
];

const loftAccessTypeOptions = [
  { value: "easy", label: "Easy Access" },
  { value: "restricted", label: "Restricted Access" },
  { value: "none", label: "No Access" },
];

const roofTimberConditionOptions = [
  { value: "good", label: "Good" },
  { value: "minor-rot", label: "Minor Rot" },
  { value: "major-rot", label: "Major Rot" },
  { value: "unknown", label: "Unknown" },
];

const loftLightingOptions = [
  { value: "none", label: "None" },
  { value: "single-bulb", label: "Single Bulb" },
  { value: "strip-led", label: "Strip LED" },
];

// Section 5 - Electrical Supply Options
const supplyTypeOptions = [
  { value: "single-phase", label: "Single-phase" },
  { value: "three-phase", label: "Three-phase" },
];

const mainFuseRatingOptions = [
  { value: "60", label: "60A" },
  { value: "80", label: "80A" },
  { value: "100", label: "100A" },
  { value: "125", label: "125A" },
  { value: "other", label: "Other" },
];

const earthingSystemOptions = [
  { value: "tn-s", label: "TN-S" },
  { value: "tn-c-s", label: "TN-C-S" },
  { value: "tt", label: "TT" },
  { value: "unknown", label: "Unknown" },
];

// Section 6 - Battery & Storage Options
const batteryRequiredOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "later", label: "Later" },
];

const installLocationOptions = [
  { value: "loft", label: "Loft" },
  { value: "garage", label: "Garage" },
  { value: "utility-room", label: "Utility Room" },
  { value: "external-box", label: "External Box" },
  { value: "other", label: "Other" },
];

const mountingSurfaceOptions = [
  { value: "brick", label: "Brick" },
  { value: "plasterboard", label: "Plasterboard" },
  { value: "concrete", label: "Concrete" },
  { value: "wood", label: "Wood" },
];

const ipRatingOptions = [
  { value: "ip54", label: "IP54" },
  { value: "ip65", label: "IP65" },
  { value: "ip66", label: "IP66" },
];

// Section 7 - Health & Safety Options
const asbestosPresenceOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Unknown" },
];

const livestockPetsOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

// Section 8 - Customer Preferences Options
const contactMethodOptions = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
];

const budgetRangeOptions = [
  { value: "under-5k", label: "< £5k" },
  { value: "5k-8k", label: "£5-8k" },
  { value: "8k-12k", label: "£8-12k" },
  { value: "over-12k", label: "> £12k" },
  { value: "open", label: "Open" },
];

// Default form data (empty form)
const DEFAULT_FORM_DATA: FormData = {
  // Section 0 - General & Contact
  surveyDate: new Date().toISOString(),
  surveyorInfo: {
    name: "",
    telephone: "",
    email: ""
  },
  customerName: "",
  siteAddress: "",
  postcode: "",
  gridReference: "",
  what3words: "",
  phone: "",
  email: "",
  secondaryContactName: "",
  secondaryContactPhone: "",

  // Section 1 - Electricity Baseline
  annualConsumption: "",
  annualConsumptionPhoto: [],
  smartMeterPresent: null,

  // Section 2 - Property Overview
  propertyType: "",
  propertyAge: "",
  occupancyStatus: "",
  listedBuilding: null,
  conservationArea: null,
  newBuild: null,
  sharedRoof: null,
  scaffoldAccess: null,
  scaffoldAccessPhoto: [],
  storageArea: null,
  storageAreaPhoto: [],
  restrictedParking: "",

  // Section 3 - Roof Inspection
  roofFaces: [
    {
      id: "roof-1",
      label: "Roof-1",
      orientation: 0,
      pitch: 30,
      width: "",
      length: "",
      area: "",
      covering: "",
      coveringCondition: "",
      obstructions: [],
      shading: [],
      gutterHeight: "",
      rafterSpacing: "",
      rafterDepth: "",
      rafterWidth: "",
      membraneType: "",
      membraneCondition: "",
      structuralDefects: "",
      plannedPanelCount: "",
      photos: [],
    },
  ],

  // Section 4 - Loft / Attic
  loftHatchWidth: "",
  loftHatchHeight: "",
  loftAccessType: "",
  loftHeadroom: "",
  loftBoardsInPlace: null,
  roofTimberCondition: "",
  roofTimberPhoto: [],
  roofTimberNotes: "",
  wallSpaceInverter: null,
  wallSpaceInverterPhoto: [],
  wallSpaceInverterNotes: "",
  wallSpaceBattery: null,
  wallSpaceBatteryPhoto: [],
  wallSpaceBatteryNotes: "",
  loftInsulationThickness: "",
  loftLighting: "",
  loftPowerSocket: null,

  // Section 5 - Electrical Supply
  supplyType: "",
  mainFuseRating: "",
  mainFusePhoto: [],
  consumerUnitMake: "",
  consumerUnitLocation: "",
  consumerUnitLocationPhoto: [],
  spareFuseWays: "",
  spareFuseWaysPhoto: [],
  existingSurgeProtection: null,
  existingSurgeProtectionPhoto: [],
  earthBondingVerified: null,
  earthBondingPhoto: [],
  earthingSystemType: "",
  earthingSystemPhoto: [],
  cableRouteToRoof: [],
  cableRouteToBattery: [],
  dnoNotificationRequired: false,
  evChargerInstalled: null,
  evChargerLoad: "",

  // Section 6 - Battery & Storage Preferences
  batteryRequired: "",
  preferredInstallLocation: "",
  distanceFromCU: "",
  mountingSurface: "",
  ventilationAdequate: null,
  ventilationPhoto: [],

  // Section 7 - Health, Safety & Hazards
  asbestosPresence: "",
  asbestosPhoto: [],
  workingAtHeightDifficulties: "",
  fragileRoofAreas: [],
  livestockPetsOnSite: null,
  livestockPetsNotes: "",
  specialAccessInstructions: "",

  // Section 8 - Customer Preferences & Next Steps
  preferredContactMethod: "",
  installationStartDate: "",
  installationEndDate: "",
  customerAway: false,
  customerAwayNotes: "",
  budgetRange: "",
  interestedInEvCharger: null,
  interestedInEnergyMonitoring: null,
  additionalNotes: "",
  
  // Section 9 - Customer Signature
  customerSignature: "",
};

// Test form data (pre-filled for testing)
const TEST_FORM_DATA: FormData = {
  // Section 0 - General & Contact
  surveyDate: new Date().toISOString(),
  surveyorInfo: {
    name: "John Smith",
    telephone: "07123 456789",
    email: "john.smith@surveyor.com"
  },
  customerName: "Sarah Johnson",
  siteAddress: "123 Solar Street, Green City, GC1 2AB",
  postcode: "GC1 2AB",
  gridReference: "TQ123456",
  what3words: "///solar.panel.survey",
  phone: "07123 456789",
  email: "sarah.johnson@email.com",
  secondaryContactName: "Mike Johnson",
  secondaryContactPhone: "07987 654321",

  // Section 1 - Electricity Baseline
  annualConsumption: "4200",
  annualConsumptionPhoto: [],
  smartMeterPresent: "yes",

  // Section 2 - Property Overview
  propertyType: "semi",
  propertyAge: "1980-2000",
  occupancyStatus: "owner-occupied",
  listedBuilding: "no",
  conservationArea: "no",
  newBuild: "no",
  sharedRoof: "no",
  scaffoldAccess: "yes",
  scaffoldAccessPhoto: [],
  storageArea: "yes",
  storageAreaPhoto: [],
  restrictedParking: "Narrow driveway but accessible",

  // Section 3 - Roof Inspection
  roofFaces: [
    {
      id: "roof-1",
      label: "Roof-1",
      orientation: 180,
      pitch: 35,
      width: "8.5",
      length: "6.2",
      area: "52.7",
      covering: "Concrete tiles",
      coveringCondition: "good",
      obstructions: ["Chimney", "TV aerial"],
      shading: ["Tree to south", "Neighbor's extension"],
      gutterHeight: "2.1",
      rafterSpacing: "600",
      rafterDepth: "150",
      rafterWidth: "50",
      membraneType: "Bituminous felt",
      membraneCondition: "good",
      structuralDefects: "Minor wear on ridge tiles",
      plannedPanelCount: "12",
      photos: [],
    },
    {
      id: "roof-2",
      label: "Roof-2",
      orientation: 90,
      pitch: 30,
      width: "4.2",
      length: "5.8",
      area: "24.4",
      covering: "Concrete tiles",
      coveringCondition: "good",
      obstructions: ["Vent pipe"],
      shading: ["Minimal"],
      gutterHeight: "2.1",
      rafterSpacing: "600",
      rafterDepth: "150",
      rafterWidth: "50",
      membraneType: "Bituminous felt",
      membraneCondition: "good",
      structuralDefects: "None",
      plannedPanelCount: "6",
      photos: [],
    },
  ],

  // Section 4 - Loft / Attic
  loftHatchWidth: "60",
  loftHatchHeight: "60",
  loftAccessType: "easy",
  loftHeadroom: "2.4",
  loftBoardsInPlace: "yes",
  roofTimberCondition: "good",
  roofTimberPhoto: [],
  roofTimberNotes: "Timber in good condition, no signs of rot",
  wallSpaceInverter: "yes",
  wallSpaceInverterPhoto: [],
  wallSpaceInverterNotes: "Plenty of wall space available",
  wallSpaceBattery: "yes",
  wallSpaceBatteryPhoto: [],
  wallSpaceBatteryNotes: "Good space for battery installation",
  loftInsulationThickness: "270",
  loftLighting: "single-bulb",
  loftPowerSocket: "no",

  // Section 5 - Electrical Supply
  supplyType: "single-phase",
  mainFuseRating: "100",
  mainFusePhoto: [],
  consumerUnitMake: "Wylex NHRS",
  consumerUnitLocation: "Garage",
  consumerUnitLocationPhoto: [],
  spareFuseWays: "4",
  spareFuseWaysPhoto: [],
  existingSurgeProtection: "no",
  existingSurgeProtectionPhoto: [],
  earthBondingVerified: "yes",
  earthBondingPhoto: [],
  earthingSystemType: "tn-c-s",
  earthingSystemPhoto: [],
  cableRouteToRoof: ["Garage wall", "External conduit", "Roof penetration"],
  cableRouteToBattery: ["Garage wall", "Internal routing"],
  dnoNotificationRequired: false,
  evChargerInstalled: "no",
  evChargerLoad: "",

  // Section 6 - Battery & Storage Preferences
  batteryRequired: "yes",
  preferredInstallLocation: "garage",
  distanceFromCU: "2.5",
  mountingSurface: "brick",
  ventilationAdequate: "yes",
  ventilationPhoto: [],

  // Section 7 - Health, Safety & Hazards
  asbestosPresence: "no",
  asbestosPhoto: [],
  workingAtHeightDifficulties: "Standard safety measures required",
  fragileRoofAreas: [],
  livestockPetsOnSite: "yes",
  livestockPetsNotes: "2 dogs - will need to be secured during installation",
  specialAccessInstructions: "Side gate access preferred, avoid front door",

  // Section 8 - Customer Preferences & Next Steps
  preferredContactMethod: "email",
  installationStartDate: "2024-06-01",
  installationEndDate: "2024-06-30",
  customerAway: false,
  customerAwayNotes: "",
  budgetRange: "8k-12k",
  interestedInEvCharger: "yes",
  interestedInEnergyMonitoring: "yes",
  additionalNotes:
    "Customer prefers morning installations. Has existing solar thermal system that needs assessment.",
  
  // Section 9 - Customer Signature
  customerSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // Mock signature data
};

// Toggle this to switch between test and default data
const USE_TEST_DATA = false; // Change to false to use empty form

// Ensure a stable draftId per session
function ensureDraftId(): string {
  try {
    const existing = localStorage.getItem("draftId");
    if (existing) return existing;
    const newId = `draft_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    localStorage.setItem("draftId", newId);
    return newId;
  } catch {
    return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(
    "general"
  );
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { toast } = useToast();

  // Offline functionality
  const { isOnline, isSyncing, pendingSync, triggerSync } = useOffline();

  // Initialize draftId on mount
  useEffect(() => {
    ensureDraftId();
  }, []);

  const [formData, setFormData] = useState<FormData>(
    USE_TEST_DATA ? TEST_FORM_DATA : DEFAULT_FORM_DATA
  );
  
  // Solar API data state
  const [solarData, setSolarData] = useState<any>(null);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const surveyId = searchParams.get("survey");

  // Validate required DB fields before submit/queue
  function getMissingRequiredFields(): string[] {
    const missing: string[] = [];
    const checks: Array<{ key: keyof FormData; label: string }> = [
      // Section 0 - Contact Information
      { key: "customerName", label: "Customer Name" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      
      // Section 1 - Address (using existing fields in FormData)
      { key: "siteAddress", label: "Site Address" },
      { key: "postcode", label: "Postcode" },
      { key: "gridReference", label: "Grid Reference" },
      { key: "what3words", label: "What3Words Address" },
      
      // Section 2 - Property Overview
      { key: "propertyType", label: "Property Type" },
      { key: "propertyAge", label: "Property Age" },
      { key: "occupancyStatus", label: "Occupancy Status" },
      
      // Section 7 - Health & Safety
      { key: "asbestosPresence", label: "Asbestos Presence" },
      { key: "workingAtHeightDifficulties", label: "Working at Height Difficulties" },
      { key: "livestockPetsOnSite", label: "Livestock/Pets on Site" },
      { key: "specialAccessInstructions", label: "Special Access Instructions" },
      
      // Section 8 - Customer Preferences
      { key: "preferredContactMethod", label: "Preferred Contact Method" },
      { key: "installationStartDate", label: "Installation Start Date" },
      { key: "installationEndDate", label: "Installation End Date" },
      { key: "budgetRange", label: "Budget Range" },
      { key: "interestedInEvCharger", label: "Interested in EV Charger" },
      { key: "interestedInEnergyMonitoring", label: "Interested in Energy Monitoring" },
    ];

    for (const { key, label } of checks) {
      const v = formData[key];
      // Handle different types of values
      if (v === null || v === undefined) {
        missing.push(label);
      } else if (typeof v === "string" && v.trim().length === 0) {
        missing.push(label);
      } else if (typeof v === "boolean") {
        // Boolean fields are considered filled if they have any value
        continue;
      }
    }
    
    // Check Section 3 - Roof Inspection (at least one roof face with complete data)
    if (!formData.roofFaces || formData.roofFaces.length === 0) {
      missing.push("Roof Faces (at least one required)");
    } else {
      const hasCompleteRoofFace = formData.roofFaces.some((face) => {
        return (
          face.width && face.width.trim() !== "" &&
          face.length && face.length.trim() !== "" &&
          face.area && face.area.trim() !== "" &&
          face.orientation !== null && face.orientation !== undefined &&
          face.pitch !== null && face.pitch !== undefined &&
          face.covering && face.covering.trim() !== "" &&
          face.coveringCondition && face.coveringCondition.trim() !== "" &&
          face.gutterHeight && face.gutterHeight.trim() !== "" &&
          face.rafterSpacing && face.rafterSpacing.trim() !== "" &&
          face.rafterDepth && face.rafterDepth.trim() !== "" &&
          face.rafterWidth && face.rafterWidth.trim() !== "" &&
          face.membraneType && face.membraneType.trim() !== "" &&
          face.membraneCondition && face.membraneCondition.trim() !== "" &&
          Array.isArray(face.photos) && face.photos.length > 0
        );
      });
      
      if (!hasCompleteRoofFace) {
        missing.push("Complete Roof Face Data (all 13 fields + photos required)");
      }
    }
    
    // Check Section 5 - Electrical Supply photo arrays
    const photoChecks: Array<{ key: keyof FormData; label: string }> = [
      { key: "earthingSystemPhoto", label: "Earthing System Photo" },
    ];
    
    for (const { key, label} of photoChecks) {
      const v = formData[key];
      if (!Array.isArray(v) || v.length === 0) {
        missing.push(label);
      }
    }
    
    // Check Section 6 - Battery & Storage (all 6 fields required)
    const batteryChecks: Array<{ key: keyof FormData; label: string }> = [
      { key: "batteryRequired", label: "Battery Required" },
      { key: "preferredInstallLocation", label: "Preferred Install Location" },
      { key: "distanceFromCU", label: "Distance From Consumer Unit" },
      { key: "mountingSurface", label: "Mounting Surface" },
      { key: "ventilationAdequate", label: "Ventilation Adequate" },
    ];
    
    for (const { key, label } of batteryChecks) {
      const v = formData[key];
      if (v === null || v === undefined) {
        missing.push(label);
      } else if (typeof v === "string" && v.trim().length === 0) {
        missing.push(label);
      }
    }
    
    // Check ventilationPhoto (photo array)
    if (!Array.isArray(formData.ventilationPhoto) || formData.ventilationPhoto.length === 0) {
      missing.push("Ventilation Photo");
    }
    
    // Check Section 7 - Health & Safety photo arrays
    if (!Array.isArray(formData.asbestosPhoto) || formData.asbestosPhoto.length === 0) {
      missing.push("Asbestos Photo");
    }
    if (!Array.isArray(formData.fragileRoofAreas) || formData.fragileRoofAreas.length === 0) {
      missing.push("Fragile Roof Areas Photo");
    }
    
    return missing;
  }

  // Validate phone number format
  function validatePhoneNumber(phone: string): boolean {
    // UK phone number regex - matches various formats
    // e.g., 01234 567890, 07123 456789, +44 7123 456789, (01234) 567890
    const phoneRegex = /^(?:(?:\+44\s?|0)(?:\d\s?){9,10})$/;
    const cleanPhone = phone.replace(/[\s()-]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10 && cleanPhone.length <= 13;
  }

  // Validate UK postcode format
  function validateUKPostcode(postcode: string): boolean {
    // UK postcode regex - comprehensive pattern
    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    return postcodeRegex.test(postcode.trim());
  }

  // Validate field formats
  function getInvalidFormatFields(): string[] {
    const invalid: string[] = [];
    
    // Validate phone format
    if (formData.phone && formData.phone.trim().length > 0) {
      if (!validatePhoneNumber(formData.phone)) {
        invalid.push("Phone (invalid UK phone format)");
      }
    }

    // Validate secondary phone if provided
    if (formData.secondaryContactPhone && formData.secondaryContactPhone.trim().length > 0) {
      if (!validatePhoneNumber(formData.secondaryContactPhone)) {
        invalid.push("Secondary Contact Phone (invalid UK phone format)");
      }
    }

    // Validate postcode format
    if (formData.postcode && formData.postcode.trim().length > 0) {
      if (!validateUKPostcode(formData.postcode)) {
        invalid.push("Postcode (invalid UK postcode format)");
      }
    }

    // Validate survey date format
    if (formData.surveyDate && formData.surveyDate.trim().length > 0) {
      const date = new Date(formData.surveyDate);
      if (isNaN(date.getTime())) {
        invalid.push("Survey Date (invalid date format)");
      }
    }

    return invalid;
  }

  // Basic guard: prevent empty submissions
  function hasAnyInputFilled(): boolean {
    const entries = Object.entries(formData);
    for (const [key, value] of entries) {
      if (key === "roofFaces") {
        // Check if any roof face has any entered data or photos
        if (Array.isArray(value)) {
          const anyFaceFilled = value.some((face) => {
            return (
              (face.width && face.width.trim().length > 0) ||
              (face.length && face.length.trim().length > 0) ||
              (face.area && face.area.trim().length > 0) ||
              (face.covering && face.covering.trim().length > 0) ||
              (face.coveringCondition &&
                face.coveringCondition.trim().length > 0) ||
              (face.gutterHeight && face.gutterHeight.trim().length > 0) ||
              (face.rafterSpacing && face.rafterSpacing.trim().length > 0) ||
              (face.rafterDepth && face.rafterDepth.trim().length > 0) ||
              (face.battenDepth && face.battenDepth.trim().length > 0) ||
              (face.membraneType && face.membraneType.trim().length > 0) ||
              (face.membraneCondition &&
                face.membraneCondition.trim().length > 0) ||
              (face.structuralDefects &&
                face.structuralDefects.trim().length > 0) ||
              (face.plannedPanelCount &&
                face.plannedPanelCount.trim().length > 0) ||
              (Array.isArray(face.photos) && face.photos.length > 0) ||
              (Array.isArray(face.obstructions) &&
                face.obstructions.length > 0) ||
              (Array.isArray(face.shading) && face.shading.length > 0)
            );
          });
          if (anyFaceFilled) return true;
        }
        continue;
      }

      if (typeof value === "string" && value.trim().length > 0) return true;
      if (typeof value === "number" && !Number.isNaN(value)) return true;
      if (typeof value === "boolean" && value === true) return true;
      if (Array.isArray(value) && value.length > 0) return true;
    }
    return false;
  }

  // Auto-save functionality
  const { isSaving, lastSaved, saveStatus } = useAutoSave(formData, {
    delay: 1000,
    enabled: true,
    onSave: (data) => {
      console.log("Auto-saved survey data");
    },
    onError: (error) => {
      console.error("Auto-save failed:", error);
      toast({
        title: "Auto-save Failed",
        description: "Your data is still safe locally",
        variant: "destructive",
      });
    },
  });

  // Submit survey to Supabase (with offline queueing)
  const handleSubmitSurvey = async () => {
    // Prevent submitting an empty form
    if (!hasAnyInputFilled()) {
      toast({
        title: "Nothing to submit",
        description: "Please fill in at least one field before submitting.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    // Check if we're in edit mode
    const isEditMode = surveyId !== null;
    
    // Fix data types and map form data to database-compatible format
    const { data: fixedFormData, errors: dataErrors } = DataTypeFixes.validateAndFixFormData(formData);
    
    if (dataErrors.length > 0) {
      toast({
        title: "Data validation errors",
        description: dataErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    // The RPC function expects form data format, not database format
    const surveyData = {
      ...fixedFormData,
      status: "completed" as const,
    };

    try {
      // Enforce DB-like constraints locally before submit/queue
      const missing = getMissingRequiredFields();
      if (missing.length > 0) {
        toast({
          title: "Missing required fields",
          description: `Please fill: ${missing.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      // Validate field formats
      const invalidFormats = getInvalidFormatFields();
      if (invalidFormats.length > 0) {
        toast({
          title: "Invalid field formats",
          description: `Please correct: ${invalidFormats.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      const draftId = (() => {
        try {
          return localStorage.getItem("draftId") || undefined;
        } catch {
          return undefined;
        }
      })();

      // If offline, queue for sync and exit early
      if (!isOnline) {
        const stored = await offlineStorage.getStoredFormData();
        await offlineStorage.addToSyncQueue({
          type: "CREATE",
          section: "surveys",
          field: "survey",
          value: {
            payload: surveyData,
            draftLastModified: stored?.lastModified ?? null,
            draftId,
          },
          maxRetries: 3,
        });

        toast({
          title: "Saved Offline",
          description:
            "Your survey will sync automatically when you're online.",
        });

        // Keep draft saved; do not clear form while offline
        return;
      }

      // Double-check online status before submission
      if (!isOnline) {
        throw new Error("Lost internet connection before submission");
      }

      // Submit to Supabase when online
      let result;
      try {
        if (isEditMode && surveyId) {
          result = await SupabaseService.updateSurvey(surveyId, surveyData);
          if (!result?.id) {
            throw new Error("Failed to update survey in Supabase");
          }

          toast({
            title: "Survey Updated!",
            description: `Survey ID: ${result.id}`,
          });
        } else {
          result = await SupabaseService.createSurvey(surveyData);
          if (!result?.id) {
            throw new Error("Failed to get survey ID from Supabase");
          }

          toast({
            title: "Survey Submitted!",
            description: `Survey ID: ${result.id}`,
          });
        }
      } catch (submitError) {
        console.error("Supabase submission error:", submitError);
        throw submitError; // Re-throw to be caught by outer catch block
      }

      // Handle photo uploads and asset creation
      try {
        if (result?.id) {
          console.log("Processing photos for survey:", result.id);
          
          // Upload all photos and create asset records
          const { assets, errors } = await PhotoUploadHandler.uploadAllPhotos(formData, result.id);
          
          if (assets.length > 0) {
            const { success, errors: assetErrors } = await PhotoUploadHandler.createAssetRecords(assets);
            if (!success) {
              console.error("Asset creation errors:", assetErrors);
            }
          }
          
          if (errors.length > 0) {
            console.warn("Photo upload errors:", errors);
            toast({
              title: "Survey Submitted",
              description: "Survey saved, but some photos may need to be re-uploaded.",
              variant: "destructive",
            });
          } else {
            console.log("All photos processed successfully");
          }
        }
      } catch (photoError) {
        console.error("Photo processing error:", photoError);
        // Don't fail the entire submission for photo issues
        toast({
          title: "Survey Submitted",
          description: "Survey saved, but some photos may need to be re-uploaded.",
          variant: "destructive",
        });
      }

      // Clear local draft
      await offlineStorage.clearDraft();

      // Show confirmation dialog for next action
      const shouldClearForm = window.confirm(
        "Survey submitted successfully! Would you like to:\n\n" +
          "• Click 'OK' to clear the form and start a new survey\n" +
          "• Click 'Cancel' to continue editing this survey"
      );

      if (shouldClearForm) {
        // Reset form to initial state
        setFormData(USE_TEST_DATA ? TEST_FORM_DATA : DEFAULT_FORM_DATA);

        toast({
          title: "Form Cleared",
          description: "Ready for a new survey",
        });
        // Rotate draftId for new survey session
        ensureDraftId();
      } else {
        toast({
          title: "Continue Editing",
          description: "You can continue editing this survey",
        });
      }

      // Keep current form data to avoid UI reset issues after submit
    } catch (error) {
      const err: any = error;
      console.error("Failed to submit survey:", err?.message || err, err);
      // Queue for later sync if submission failed while seemingly online
      try {
        const stored = await offlineStorage.getStoredFormData();
        const draftId = (() => {
          try {
            return localStorage.getItem("draftId") || undefined;
          } catch {
            return undefined;
          }
        })();
        await offlineStorage.addToSyncQueue({
          type: "CREATE",
          section: "surveys",
          field: "survey",
          value: {
            payload: surveyData,
            draftLastModified: stored?.lastModified ?? null,
            draftId,
          },
          maxRetries: 3,
        });
        toast({
          title: "Saved to Sync Queue",
          description: err?.message
            ? `Backend error: ${err.message}`
            : "Will retry automatically when connection stabilizes.",
        });
      } catch (queueError) {
        console.error(
          "Failed to queue survey after submission error:",
          queueError
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to start a new survey
  const startNewSurvey = () => {
    setFormData(USE_TEST_DATA ? TEST_FORM_DATA : DEFAULT_FORM_DATA);
    // Remove any editing state
    window.history.pushState({}, "", "/");
    toast({
      title: "New Survey Started",
      description: "Form has been cleared for a new survey",
    });
  };

  // Helper function to convert yes/no/na values
  const convertYesNoNa = (value: any): "yes" | "no" | "na" | null => {
    if (value === "yes" || value === "no" || value === "na") {
      return value;
    }
    return null;
  };

  // Load saved data or editing data on app start
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Check if we're in edit mode via URL parameter
        if (surveyId) {
          try {
            const fullSurvey = await SupabaseService.getFullSurvey(surveyId);
            if (!fullSurvey) {
              throw new Error("Survey not found");
            }
            
            // Reconstruct form data from full survey with all sections and images
            const reconstructedFormData: FormData = {
              ...DEFAULT_FORM_DATA,
              
              // Basic info
              surveyDate: fullSurvey.surveyDate || "",
              surveyorInfo: fullSurvey.surveyorInfo || DEFAULT_FORM_DATA.surveyorInfo,
              customerName: fullSurvey.customerName || "",
              siteAddress: fullSurvey.siteAddress || "",
              postcode: fullSurvey.postcode || "",
              gridReference: fullSurvey.gridReference || "",
              what3words: fullSurvey.what3words || "",
              phone: fullSurvey.phone || "",
              email: fullSurvey.email || "",
              secondaryContactName: fullSurvey.secondaryContactName || "",
              secondaryContactPhone: fullSurvey.secondaryContactPhone || "",

              // Electricity baseline
              annualConsumption: fullSurvey.electricity_baseline?.annual_consumption?.toString() || "",
              smartMeterPresent: fullSurvey.electricity_baseline?.smart_meter_present as any,

              // Property overview
              propertyType: fullSurvey.property_overview?.property_type || "",
              propertyAge: fullSurvey.property_overview?.property_age || "",
              occupancyStatus: fullSurvey.property_overview?.occupancy_status || "",
              listedBuilding: fullSurvey.property_overview?.listed_building as any,
              conservationArea: fullSurvey.property_overview?.conservation_area as any,
              newBuild: fullSurvey.property_overview?.new_build as any,
              sharedRoof: fullSurvey.property_overview?.shared_roof as any,
              scaffoldAccess: fullSurvey.property_overview?.scaffold_access as any,
              storageArea: fullSurvey.property_overview?.storage_area as any,
              restrictedParking: fullSurvey.property_overview?.restricted_parking || "",

              // Roof faces
              roofFaces: (fullSurvey.roof_faces || []).map((rf: any) => ({
                id: rf.id,
                label: rf.label || "",
                orientation: rf.orientation || 0,
                pitch: rf.pitch || 30,
                width: rf.width?.toString() || "",
                length: rf.length?.toString() || "",
                area: rf.area?.toString() || "",
                covering: rf.covering || "",
                coveringCondition: rf.covering_condition || "",
                obstructions: rf.obstructions || [],
                shading: rf.shading || [],
                gutterHeight: rf.gutter_height || "",
                rafterSpacing: rf.rafter_spacing || "",
                rafterDepth: rf.rafter_depth || "",
                rafterWidth: rf.rafter_width || "",
                membraneType: rf.membrane_type || "",
                membraneCondition: rf.membrane_condition || "",
                structuralDefects: rf.structural_defects || "",
                plannedPanelCount: rf.planned_panel_count?.toString() || "",
                photos: (rf.assets || []).filter((a: any) => a.kind === 'photo').map((a: any) => a.storagePath) || []
              })),

              // Loft/attic
              loftHatchWidth: fullSurvey.loft_attic?.loft_hatch_width?.toString() || "",
              loftHatchHeight: fullSurvey.loft_attic?.loft_hatch_height?.toString() || "",
              loftAccessType: fullSurvey.loft_attic?.loft_access_type || "",
              loftHeadroom: fullSurvey.loft_attic?.loft_headroom || "",
              loftBoardsInPlace: fullSurvey.loft_attic?.loft_boards_in_place as any,
              roofTimberCondition: fullSurvey.loft_attic?.roof_timber_condition || "",
              roofTimberNotes: fullSurvey.loft_attic?.roof_timber_notes || "",
              wallSpaceInverter: fullSurvey.loft_attic?.wall_space_inverter as any,
              wallSpaceInverterNotes: fullSurvey.loft_attic?.wall_space_inverter_notes || "",
              wallSpaceBattery: fullSurvey.loft_attic?.wall_space_battery as any,
              wallSpaceBatteryNotes: fullSurvey.loft_attic?.wall_space_battery_notes || "",
              loftInsulationThickness: fullSurvey.loft_attic?.loft_insulation_thickness?.toString() || "",
              loftLighting: fullSurvey.loft_attic?.loft_lighting || "",
              loftPowerSocket: fullSurvey.loft_attic?.loft_power_socket as any,

              // Electrical supply
              supplyType: fullSurvey.electrical_supply?.supply_type || "",
              mainFuseRating: fullSurvey.electrical_supply?.main_fuse_rating || "",
              consumerUnitMake: fullSurvey.electrical_supply?.consumer_unit_make || "",
              consumerUnitLocation: fullSurvey.electrical_supply?.consumer_unit_location || "",
              spareFuseWays: fullSurvey.electrical_supply?.spare_fuse_ways?.toString() || "",
              existingSurgeProtection: fullSurvey.electrical_supply?.existing_surge_protection as any,
              earthBondingVerified: fullSurvey.electrical_supply?.earth_bonding_verified as any,
              earthingSystemType: fullSurvey.electrical_supply?.earthing_system_type || "",
              cableRouteToRoof: fullSurvey.electrical_supply?.cable_route_to_roof || [],
              cableRouteToBattery: fullSurvey.electrical_supply?.cable_route_to_battery || [],
              dnoNotificationRequired: fullSurvey.electrical_supply?.dno_notification_required || false,
              evChargerInstalled: fullSurvey.electrical_supply?.ev_charger_installed as any,
              evChargerLoad: fullSurvey.electrical_supply?.ev_charger_load?.toString() || "",

              // Battery storage
              batteryRequired: fullSurvey.battery_storage?.battery_required || "",
              preferredInstallLocation: fullSurvey.battery_storage?.preferred_install_location || "",
              distanceFromCU: fullSurvey.battery_storage?.distance_from_cu || "",
              mountingSurface: fullSurvey.battery_storage?.mounting_surface || "",
              ventilationAdequate: fullSurvey.battery_storage?.ventilation_adequate as any,

              // Health & safety
              asbestosPresence: fullSurvey.health_safety?.asbestos_presence || "",
              workingAtHeightDifficulties: fullSurvey.health_safety?.working_at_height_difficulties || "",
              fragileRoofAreas: fullSurvey.health_safety?.fragile_roof_areas || [],
              livestockPetsOnSite: fullSurvey.health_safety?.livestock_pets_on_site as any,
              livestockPetsNotes: fullSurvey.health_safety?.livestock_pets_notes || "",
              specialAccessInstructions: fullSurvey.health_safety?.special_access_instructions || "",

              // Customer preferences
              preferredContactMethod: fullSurvey.customer_preferences?.preferred_contact_method || "",
              installationStartDate: fullSurvey.customer_preferences?.installation_start_date || "",
              installationEndDate: fullSurvey.customer_preferences?.installation_end_date || "",
              customerAway: fullSurvey.customer_preferences?.customer_away || false,
              customerAwayNotes: fullSurvey.customer_preferences?.customer_away_notes || "",
              budgetRange: fullSurvey.customer_preferences?.budget_range || "",
              interestedInEvCharger: fullSurvey.customer_preferences?.interested_in_ev_charger as any,
              interestedInEnergyMonitoring: fullSurvey.customer_preferences?.interested_in_energy_monitoring as any,
              additionalNotes: fullSurvey.customer_preferences?.additional_notes || "",

              // Add images from assets array
              annualConsumptionPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'annualConsumption' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              scaffoldAccessPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'scaffoldAccess' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              storageAreaPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'storageArea' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              roofTimberPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'roofTimber' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              wallSpaceInverterPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'wallSpaceInverter' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              wallSpaceBatteryPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'wallSpaceBattery' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              mainFusePhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'mainFuse' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              consumerUnitLocationPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'consumerUnitLocation' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              spareFuseWaysPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'spareFuseWays' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              existingSurgeProtectionPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'existingSurgeProtection' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              earthBondingPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'earthBonding' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              earthingSystemPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'earthingSystem' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              ventilationPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'ventilation' && a.kind === 'photo').map((a: any) => a.storagePath) || [],
              asbestosPhoto: (fullSurvey.assets || []).filter((a: any) => a.field === 'asbestos' && a.kind === 'photo').map((a: any) => a.storagePath) || []
            };

            setFormData(reconstructedFormData);
            toast({
              title: "Survey Loaded",
              description: "Complete survey data including all images has been loaded for editing.",
            });
            return;
          } catch (error) {
            console.error("Failed to load survey:", error);
            toast({
              title: "Error",
              description: "Failed to load survey for editing",
              variant: "destructive",
            });
            return;
          }
        }

        // If not editing, load saved draft data
        const savedData = await offlineStorage.loadFormData();
        if (savedData) {
          const stored = await offlineStorage.getStoredFormData();
          if (stored?.isDraft) {
            setFormData(savedData);
            toast({
              title: "Draft Loaded",
              description: "Your previous survey data has been restored",
            });
          } else {
            setFormData(USE_TEST_DATA ? TEST_FORM_DATA : DEFAULT_FORM_DATA);
          }
        }
      } catch (error) {
        console.error("Failed to load saved data:", error);
        toast({
          title: "Error",
          description: "Failed to load survey data",
          variant: "destructive",
        });
      }
    };

    loadSavedData();
  }, [toast]);

  // Mock red flags for demonstration
  const redFlags = [
    {
      id: "mpan-photo",
      section: "Electricity",
      field: "MPAN Photo",
      message: "MPAN photo required for verification",
      severity: "high" as const,
    },
    {
      id: "customer-permission",
      section: "Electricity",
      field: "Customer Permission",
      message: "Customer permission needed for DNO contact",
      severity: "high" as const,
    },
    {
      id: "roof-condition",
      section: "Roof",
      field: "Roof Condition",
      message: "Roof may require repairs before installation",
      severity: "medium" as const,
    },
  ];

  // Track online/offline status
  useEffect(() => {
    // The useOffline hook handles online/offline status automatically
    // No need for manual event listeners
  }, []);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const updateFormData = (
    field: keyof FormData,
    value: FormData[keyof FormData]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestDataFill = (testData: any) => {
    setFormData(prev => ({
      ...prev,
      ...testData
    }));
  };

  // Handle location enrichment from SmartLocationInput
  const handleLocationEnrichment = (locationData: any) => {
    // Update all location fields
    if (locationData.address) {
      updateFormData("siteAddress", locationData.address);
    }
    if (locationData.postcode) {
      updateFormData("postcode", locationData.postcode);
    }
    if (locationData.gridReference) {
      updateFormData("gridReference", locationData.gridReference);
    }
    if (locationData.what3words) {
      updateFormData("what3words", locationData.what3words);
    }

    // If solar data is available, process it
    if (locationData.solarData) {
      const solarApiData = {
        ...locationData.solarData.insights,
        rawBuildingInsights: locationData.solarData.rawInsights,
        rawDataLayers: locationData.solarData.rawDataLayers,
      };
      handleSolarDataReceived(solarApiData);
    }
  };

  // Handle solar data from LocationInput
  const handleSolarDataReceived = (solarApiData: any) => {
    setSolarData(solarApiData);
    
    // Auto-populate roof faces based on solar API data
    if (solarApiData.roofSegments && solarApiData.roofSegments.length > 0) {
      const autoRoofFaces = solarApiData.roofSegments.map((segment: any) => ({
        id: segment.id,
        label: `${segment.id} (Auto-detected ${segment.orientation})`,
        orientation: segment.azimuth,
        pitch: segment.pitch,
        width: "", // Manual input still required
        length: "", // Manual input still required  
        area: segment.area.toString(),
        covering: "", // Manual input required
        coveringCondition: "", // Manual input required
        obstructions: [], // Based on Solar API analysis
        shading: [], // Based on Solar API shadow analysis
        gutterHeight: "", // Manual input required
        rafterSpacing: "", // Manual input required
        rafterDepth: "", // Manual input required
        battenDepth: "", // Manual input required
        membraneType: "", // Manual input required
        membraneCondition: "", // Manual input required
        structuralDefects: "", // Manual input required
        plannedPanelCount: segment.suggestedPanels.toString(),
        photos: []
      }));
      
      setFormData(prev => ({
        ...prev,
        roofFaces: autoRoofFaces
      }));
      
      toast({
        title: "Roof Analysis Complete",
        description: `Auto-populated ${solarApiData.roofSegments.length} roof faces with ${solarApiData.maxPanels} potential panels`,
      });
    }
  };

  const toggleSection = (section: string) => {
    setCurrentSection(currentSection === section ? null : section);
  };

  const calculateProgress = () => {
    interface SectionConfig {
      fields: string[];
      total: number;
      customCheck?: (value: any) => boolean;
    }

    const sections: Record<string, SectionConfig> = {
      general: {
        fields: [
          "surveyDate",
          "surveyorInfo",
          "customerName",
          "siteAddress",
          "postcode",
          "gridReference",
          "what3words",
          "phone",
          "email",
          "secondaryContactName",
          "secondaryContactPhone",
        ],
        total: 11,
      },
      electricity: {
        fields: [
          "annualConsumption",
          "annualConsumptionPhoto",
          "mpanNumber",
          "mpanPhoto",
          "electricityProvider",
          "networkOperator",
          "daytimeImportRate",
          "nighttimeImportRate",
          "standingCharge",
          "tariffType",
          "smartMeterPresent",
          "segTariffAvailable",
          "segTariffExplanation",
          "smartTariffAvailable",
        ],
        total: 14,
      },
      property: {
        fields: [
          "propertyType",
          "propertyAge",
          "listedBuilding",
          "conservationArea",
          "newBuild",
          "sharedRoof",
          "scaffoldAccess",
          "scaffoldAccessPhoto",
          "storageArea",
          "storageAreaPhoto",
          "restrictedParking",
        ],
        total: 11,
      },
      roof: {
        fields: ["roofFaces"],
        total: 18,
        customCheck: (value: any) =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.some(
            (face) =>
              face.width ||
              face.length ||
              face.area ||
              face.covering ||
              face.photos.length > 0
          ),
      },
      loft: {
        fields: [
          "loftHatchWidth",
          "loftHatchHeight",
          "loftAccessType",
          "loftHeadroom",
          "loftBoardsInPlace",
          "roofTimberCondition",
          "roofTimberNotes",
          "roofTimberPhoto",
          "wallSpaceInverter",
          "wallSpaceBattery",
          "wallSpaceInverterNotes",
          "wallSpaceInverterPhoto",
          "wallSpaceBatteryNotes",
          "wallSpaceBatteryPhoto",
          "loftInsulationThickness",
          "loftLighting",
          "loftPowerSocket",
        ],
        total: 17,
      },
      electrical: {
        fields: [
          "supplyType",
          "mainFuseRating",
          "mainFusePhoto",
          "consumerUnitMake",
          "consumerUnitLocation",
          "consumerUnitLocationPhoto",
          "spareFuseWays",
          "spareFuseWaysPhoto",
          "existingSurgeProtection",
          "existingSurgeProtectionPhoto",
          "earthBondingVerified",
          "earthBondingPhoto",
          "earthingSystemType",
          "earthingSystemPhoto",
          "dnoNotificationRequired",
          "evChargerInstalled",
          "evChargerLoad",
          "cableRouteToRoof",
          "cableRouteToBattery",
        ],
        total: 19,
      },
      battery: {
        fields: [
          "batteryRequired",
          "preferredInstallLocation",
          "distanceFromCU",
          "mountingSurface",
          "ventilationAdequate",
          "ventilationPhoto",
        ],
        total: 6,
      },
      safety: {
        fields: [
          "asbestosPresence",
          "asbestosPhoto",
          "workingAtHeightDifficulties",
          "fragileRoofAreas",
          "livestockPetsOnSite",
          "livestockPetsNotes",
          "specialAccessInstructions",
        ],
        total: 7,
      },
      preferences: {
        fields: [
          "preferredContactMethod",
          "installationStartDate",
          "installationEndDate",
          "customerAway",
          "customerAwayNotes",
          "budgetRange",
          "interestedInEvCharger",
          "additionalNotes",
        ],
        total: 8,
      },
      signature: {
        fields: [
          "customerSignature",
        ],
        total: 1,
      },
    };

    const calculateSectionProgress = (section: keyof typeof sections) => {
      const sectionConfig = sections[section];
      let completed = 0;

      if (sectionConfig.customCheck) {
        // For sections with custom validation (like roof faces)
        const value = formData[sectionConfig.fields[0] as keyof FormData];
        completed = sectionConfig.customCheck(value) ? 1 : 0;
      } else {
        // For regular sections
        completed = sectionConfig.fields.filter((field) => {
          const value = formData[field as keyof FormData];
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return (
            value !== "" &&
            value !== null &&
            value !== undefined &&
            value !== false
          );
        }).length;
      }

      return {
        completed,
        total: sectionConfig.total,
      };
    };

    // Calculate progress for each section
    const sectionProgress = {
      general: calculateSectionProgress("general"),
      electricity: calculateSectionProgress("electricity"),
      property: calculateSectionProgress("property"),
      roof: calculateSectionProgress("roof"),
      loft: calculateSectionProgress("loft"),
      electrical: calculateSectionProgress("electrical"),
      battery: calculateSectionProgress("battery"),
      safety: calculateSectionProgress("safety"),
      preferences: calculateSectionProgress("preferences"),
      signature: calculateSectionProgress("signature"),
    };

    // Calculate total progress
    const totalCompleted = Object.values(sectionProgress).reduce(
      (sum, section) => sum + section.completed,
      0
    );
    const totalFields = Object.values(sectionProgress).reduce(
      (sum, section) => sum + section.total,
      0
    );

    return {
      completed: totalCompleted,
      total: totalFields,
      overall: totalFields > 0 ? (totalCompleted / totalFields) * 100 : 0,
      completedSteps: totalCompleted >= totalFields / 2 ? [1] : [],
      sections: sectionProgress,
    };
  };

  const progress = calculateProgress();

  const jumpToField = (fieldId: string) => {
    console.log("Jumping to field:", fieldId);

    if (fieldId.includes("mpan")) {
      setCurrentSection("electricity");
    } else if (fieldId.includes("permission")) {
      setCurrentSection("electricity");
    } else if (fieldId.includes("roof")) {
      setCurrentSection("roof");
    }
  };

  const calculateTotalPvCapacity = () => {
    // Calculate total PV capacity based on roof faces and planned panel count
    let totalCapacity = 0;
    formData.roofFaces.forEach((face) => {
      if (face.plannedPanelCount && face.plannedPanelCount.trim() !== "") {
        // Assuming average panel capacity of 400W
        const panelCount = parseInt(face.plannedPanelCount);
        const faceCapacity = (panelCount * 400) / 1000; // Convert to kW
        totalCapacity += faceCapacity;
      }
    });
    return totalCapacity.toFixed(2);
  };

  const calculateTotalRoofArea = () => {
    // Calculate total roof area from all roof faces
    let totalArea = 0;
    formData.roofFaces.forEach((face) => {
      if (face.area && face.area.trim() !== "") {
        totalArea += parseFloat(face.area);
      }
    });
    return totalArea.toFixed(2);
  };

  const generateRecommendedActions = () => {
    const actions = [];

    // Check for asbestos presence
    if (formData.asbestosPresence === "yes") {
      actions.push("Arrange asbestos survey before installation");
    }

    // Check for electrical issues
    if (
      formData.supplyType === "single-phase" &&
      parseFloat(formData.annualConsumption || "0") > 5000
    ) {
      actions.push("Consider three-phase upgrade for high consumption");
    }

    // Check for roof condition
    const roofFacesWithIssues = formData.roofFaces.filter(
      (face) => face.coveringCondition === "poor" || face.structuralDefects
    );
    if (roofFacesWithIssues.length > 0) {
      actions.push("Arrange roof repairs before solar installation");
    }

    // Check for access issues
    if (formData.scaffoldAccess === "no") {
      actions.push("Resolve scaffold access issues");
    }

    // Check for storage space
    if (formData.storageArea === "no") {
      actions.push("Identify suitable storage area for equipment");
    }

    return actions;
  };

  const handleExport = async (type: "pdf" | "csv") => {
    // Mock export functionality - in a real app, this would generate actual files
    console.log(`Exporting ${type} for customer:`, formData.customerName);

    if (type === "pdf") {
      // Mock PDF generation
      const pdfData = {
        customerName: formData.customerName,
        surveyDate: formData.surveyDate,
        totalPvCapacity: calculateTotalPvCapacity(),
        totalRoofArea: calculateTotalRoofArea(),
        flaggedIssues: redFlags.length,
        sections: {
          general: {
            completed: true,
            fields: Object.keys(formData).slice(0, 10),
          },
          electricity: {
            completed: true,
            fields: Object.keys(formData).slice(10, 22),
          },
          property: {
            completed: true,
            fields: Object.keys(formData).slice(22, 33),
          },
          roof: { completed: true, faces: formData.roofFaces.length },
          loft: {
            completed: true,
            fields: Object.keys(formData).slice(33, 46),
          },
          electrical: {
            completed: true,
            fields: Object.keys(formData).slice(46, 66),
          },
          battery: {
            completed: true,
            fields: Object.keys(formData).slice(66, 77),
          },
          safety: {
            completed: true,
            fields: Object.keys(formData).slice(77, 84),
          },
          preferences: {
            completed: true,
            fields: Object.keys(formData).slice(84, 93),
          },
        },
      };

      console.log("PDF Data:", pdfData);

      // Simulate file download
      const blob = new Blob([JSON.stringify(pdfData, null, 2)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `solar-survey-${formData.customerName.replace(
        /\s+/g,
        "-"
      )}-${formData.surveyDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (type === "csv") {
      // Mock CSV generation
      const csvData = [
        ["Field", "Value", "Section"],
        ["Customer Name", formData.customerName, "General"],
        ["Survey Date", formData.surveyDate, "General"],
        ["Site Address", formData.siteAddress, "General"],
        ["Postcode", formData.postcode, "General"],
        ["Annual Consumption", formData.annualConsumption, "Electricity"],
        ["Property Type", formData.propertyType, "Property"],
        ["Total PV Capacity", calculateTotalPvCapacity(), "Summary"],
        ["Total Roof Area", calculateTotalRoofArea(), "Summary"],
        ["Flagged Issues", redFlags.length, "Summary"],
      ];

      const csvContent = csvData.map((row) => row.join(",")).join("\n");

      // Simulate file download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `solar-survey-${formData.customerName.replace(
        /\s+/g,
        "-"
      )}-${formData.surveyDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  return (
    <div className="min-h-screen bg-background font-system mono-background bg-red-50">
      <div className="relative">
        <ModernSurveyHeader
          customerName={formData.customerName}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          backTo="/"
          backTooltip="Back to Home"
          onJumpToSection={(key) => setCurrentSection(key)}
          autoSaveStatus={saveStatus}
          isSaving={isSaving}
          offlineIndicator={<OfflineStatusIndicator />}
        />
      </div>

      <ModernHeroSection 
        overallProgress={progress.overall}
        completedSections={Object.values(progress.sections).filter(s => s.completed === s.total).length}
        totalSections={Object.keys(progress.sections).length}
        showProgress={progress.overall > 0}
        showStartButton={false}
      />

      {/* Fill Form Button - Development Only */}
      <div className="container mx-auto px-6 mb-8">
        <FillFormButton onFillForm={handleTestDataFill} />
      </div>

      {/* Abstract Progress Indicator - Desktop Only */}
      <div className="container mx-auto mobile-spacing-sm hidden md:block">
        <div className="max-w-7xl mx-auto">
          <AbstractProgressIndicator
            sections={[
              {
                id: "general",
                title: "General & Contact",
                completed: progress.sections.general.completed,
                total: progress.sections.general.total,
                status: currentSection === "general" ? "in-progress" : 
                       progress.sections.general.completed === progress.sections.general.total ? "completed" : "pending",
                estimatedTime: "5 min"
              },
              {
                id: "electricity",
                title: "Electricity Baseline",
                completed: progress.sections.electricity.completed,
                total: progress.sections.electricity.total,
                status: currentSection === "electricity" ? "in-progress" : 
                       progress.sections.electricity.completed === progress.sections.electricity.total ? "completed" : "pending",
                estimatedTime: "8 min"
              },
              {
                id: "property",
                title: "Property Overview",
                completed: progress.sections.property.completed,
                total: progress.sections.property.total,
                status: currentSection === "property" ? "in-progress" : 
                       progress.sections.property.completed === progress.sections.property.total ? "completed" : "pending",
                estimatedTime: "6 min"
              },
              {
                id: "roof",
                title: "Roof Inspection",
                completed: progress.sections.roof.completed,
                total: progress.sections.roof.total,
                status: currentSection === "roof" ? "in-progress" : 
                       progress.sections.roof.completed === progress.sections.roof.total ? "completed" : "pending",
                estimatedTime: "12 min"
              },
              {
                id: "loft",
                title: "Loft / Attic",
                completed: progress.sections.loft.completed,
                total: progress.sections.loft.total,
                status: currentSection === "loft" ? "in-progress" : 
                       progress.sections.loft.completed === progress.sections.loft.total ? "completed" : "pending",
                estimatedTime: "7 min"
              },
              {
                id: "electrical",
                title: "Electrical Supply",
                completed: progress.sections.electrical.completed,
                total: progress.sections.electrical.total,
                status: currentSection === "electrical" ? "in-progress" : 
                       progress.sections.electrical.completed === progress.sections.electrical.total ? "completed" : "pending",
                estimatedTime: "10 min"
              },
              {
                id: "battery",
                title: "Battery & Storage",
                completed: progress.sections.battery.completed,
                total: progress.sections.battery.total,
                status: currentSection === "battery" ? "in-progress" : 
                       progress.sections.battery.completed === progress.sections.battery.total ? "completed" : "pending",
                estimatedTime: "8 min"
              },
              {
                id: "safety",
                title: "Health & Safety",
                completed: progress.sections.safety.completed,
                total: progress.sections.safety.total,
                status: currentSection === "safety" ? "in-progress" : 
                       progress.sections.safety.completed === progress.sections.safety.total ? "completed" : "pending",
                estimatedTime: "6 min"
              },
              {
                id: "preferences",
                title: "Preferences & Next Steps",
                completed: progress.sections.preferences.completed,
                total: progress.sections.preferences.total,
                status: currentSection === "preferences" ? "in-progress" : 
                       progress.sections.preferences.completed === progress.sections.preferences.total ? "completed" : "pending",
                estimatedTime: "5 min"
              }
            ]}
            currentSection={currentSection || undefined}
            overallProgress={Math.round((progress.completed / progress.total) * 100)}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto mobile-spacing section-spacing pb-32 sm:pb-36">
        <div className="max-w-7xl mx-auto hierarchy-spacing">
          {/* Section 0 - General & Contact */}
          <SurveySection
            title="Section 0 - General & Contact"
            isOpen={currentSection === "general"}
            onToggle={() => toggleSection("general")}
            completedFields={progress.sections.general.completed}
            totalFields={progress.sections.general.total}
            flaggedFields={0}
          >
            <div className="space-y-8">
              {/* Surveyor Information - Grouped together */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Surveyor Information
                </h3>
                <div className="space-y-6">
              <SurveyorInfoInput
                id="surveyor-info"
                    label="Surveyor Details"
                value={formData.surveyorInfo}
                onChange={(value) => updateFormData("surveyorInfo", value)}
                required
              />
                  <DatePickerInput
                    id="survey-date"
                    label="Survey Date"
                    value={formData.surveyDate}
                    onChange={(value) => updateFormData("surveyDate", value)}
                    required
                    minDate={new Date(2020, 0, 1)}
                    maxDate={new Date(2030, 11, 31)}
                  />
                </div>
              </div>

              {/* Customer Information - Grouped together */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                id="customer-name"
                    label="Customer Full Name"
                value={formData.customerName}
                onChange={(value) => updateFormData("customerName", value)}
                placeholder="Enter customer's full name..."
                required
              />
                </div>
              </div>

              {/* Location Information - Grouped together */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Location Information
                </h3>

                {/* Smart Location Enrichment */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
                  <SmartLocationInput onLocationEnriched={handleLocationEnrichment} />
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Or enter location details manually below:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <TextInput
                id="site-address"
                    label="Site Address"
                value={formData.siteAddress}
                onChange={(value) => updateFormData("siteAddress", value)}
                placeholder="Enter full site address..."
                required
              />
              <TextInput
                id="postcode"
                    label="Postcode"
                value={formData.postcode}
                onChange={(value) => updateFormData("postcode", value)}
                placeholder="Enter postcode..."
                required
              />
              <GPSInput
                id="grid-reference"
                    label="Grid Reference"
                value={formData.gridReference}
                onChange={(value) => updateFormData("gridReference", value)}
                onSolarDataReceived={handleSolarDataReceived}
                required
              />
              <What3WordsInput
                    id="what3words"
                    label="What3Words"
                    value={formData.what3words}
                    onChange={(value) => updateFormData("what3words", value)}
                    placeholder="///word.word.word"
                  />
                </div>
              </div>

              {/* Aerial Image Display */}
              {solarData?.rawDataLayers?.rgbUrl && (
                <div className="mt-6">
                  <SurveyAerialImage
                    latitude={parseFloat(formData.gridReference.split(',')[0]) || 0}
                    longitude={parseFloat(formData.gridReference.split(',')[1]) || 0}
                    rgbUrl={solarData.rawDataLayers.rgbUrl}
                    maskUrl={solarData.rawDataLayers.maskUrl}
                    imageryQuality={solarData.rawDataLayers.imageryQuality}
                    imageryDate={solarData.rawDataLayers.imageryDate}
                    imageryProcessedDate={solarData.rawDataLayers.imageryProcessedDate}
                    pixelSizeMeters={0.1}
                  />
                </div>
              )}

              {/* Solar API Insights Display */}
              {solarData && (
                <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
          🌞 Solar Potential Analysis (Google Solar API)
        </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Max Panels</p>
                        <p className="text-2xl font-bold text-green-600">{solarData.maxPanels || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Usable Roof Area</p>
                        <p className="text-2xl font-bold text-green-600">{solarData.usableRoofArea || 0}m²</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Est. Annual Energy</p>
                        <p className="text-2xl font-bold text-green-600">{solarData.estimatedYearlyEnergy ? Math.round(solarData.estimatedYearlyEnergy).toLocaleString() : 0}kWh</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Roof Suitability</p>
                        <p className="text-2xl font-bold text-green-600">{solarData.obstructions?.usablePercentage || 'N/A'}{solarData.obstructions?.usablePercentage ? '%' : ''}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-green-700">
                      {solarData.obstructions && (
                        <p><strong>Shading Analysis:</strong> {solarData.obstructions.shadingPercentage}% of roof affected by shadows/obstructions</p>
                      )}
                      {solarData.apiResponseTime && solarData.dataQuality && (
                        <p><strong>Response Time:</strong> {solarData.apiResponseTime}ms | <strong>Data Quality:</strong> {solarData.dataQuality}</p>
                      )}
                      {solarData.roofSegments && (
                        <p><strong>Detected Roof Faces:</strong> {solarData.roofSegments.length} segments automatically identified</p>
                      )}
                    </div>
                    
                    {/* Debug data for development */}
          {/* Solar Imagery Display */}
          {solarData.rawDataLayers && (
            <div className="mt-4 space-y-4">
              <h4 className="font-medium text-sm text-green-700">📸 Solar Analysis Images</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {solarData.rawDataLayers.rgbUrl && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-green-600">🏠 Aerial View</h5>
                    <img 
                      src={solarData.rawDataLayers.rgbUrl} 
                      alt="High-resolution aerial view of property"
                      className="w-full h-auto rounded border max-h-48 object-contain bg-gray-50"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {solarData.rawDataLayers.dsmUrl && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-green-600">🗺️ 3D Elevation Map</h5>
                    <img 
                      src={solarData.rawDataLayers.dsmUrl} 
                      alt="Digital surface model showing roof height"
                      className="w-full h-auto rounded border max-h-48 object-contain bg-gray-50"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {solarData.rawDataLayers.annualFluxUrl && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-green-600">☀️ Solar Flux Map</h5>
                    <img 
                      src={solarData.rawDataLayers.annualFluxUrl} 
                      alt="Annual solar flux showing sun exposure"
                      className="w-full h-auto rounded border max-h-48 object-contain bg-gray-50"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {solarData.rawDataLayers.maskUrl && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-green-600">🎯 Available Roof Area</h5>
                    <img 
                      src={solarData.rawDataLayers.maskUrl} 
                      alt="Roof mask showing usable area for solar panels"
                      className="w-full h-auto rounded border max-h-48 object-contain bg-gray-50"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <details className="mt-4">
            <summary className="text-xs cursor-pointer text-green-600 hover:text-green-800">
              📊 View Raw Solar API Data (Developer)
            </summary>
            <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(solarData, null, 2)}
            </pre>
          </details>
                  </div>
                </div>
              )}

              {/* Contact Information - Grouped together */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <SimplePhoneInput
                id="phone"
                    label="Primary Phone"
                value={formData.phone}
                onChange={(value) => updateFormData("phone", value)}
                placeholder="Enter phone number..."
                required
              />
              <TextInput
                id="email"
                    label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => updateFormData("email", value)}
                placeholder="Enter email address..."
                required
              />
              <TextInput
                id="secondary-contact-name"
                    label="Secondary Contact Name"
                value={formData.secondaryContactName}
                onChange={(value) =>
                  updateFormData("secondaryContactName", value)
                }
                placeholder="Enter secondary contact name..."
              />
                  <SimplePhoneInput
                id="secondary-contact-phone"
                    label="Secondary Contact Phone"
                value={formData.secondaryContactPhone}
                onChange={(value) =>
                  updateFormData("secondaryContactPhone", value)
                }
                placeholder="Enter secondary contact phone..."
              />
                </div>
              </div>
            </div>
          </SurveySection>

          {/* Section 1 - Electricity Baseline */}
          <SurveySection
            title="Section 1 - Electricity Baseline"
            isOpen={currentSection === "electricity"}
            onToggle={() => toggleSection("electricity")}
            completedFields={progress.sections.electricity.completed}
            totalFields={progress.sections.electricity.total}
            flaggedFields={2}
          >
            <div className="space-y-8">
              {/* Electricity Usage - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Electricity Usage
                </h3>
                <TextWithPhotoInput
                  id="annual-consumption"
                  label="Annual Consumption"
                  textValue={formData.annualConsumption}
                  onTextChange={(value) => updateFormData("annualConsumption", value)}
                  photos={formData.annualConsumptionPhoto}
                  onPhotosChange={(photos) => updateFormData("annualConsumptionPhoto", photos)}
                  placeholder="Enter annual consumption in kWh..."
                  required
                  maxPhotos={2}
                  photoGuidelines={[
                    {
                      title: "Bill or Statement",
                      description: "Photo of recent electricity bill or annual statement",
                      icon: "•"
                    },
                    {
                      title: "Clear Text",
                      description: "Ensure all text and numbers are clearly readable",
                      icon: "•"
                    },
                    {
                      title: "Annual Usage",
                      description: "Highlight the annual consumption figure",
                      icon: "•"
                    }
                  ]}
                />

                <YesNoNADropdown
                  id="smart-meter-present"
                  label="Smart Meter Present"
                  value={formData.smartMeterPresent}
                  onChange={(value) =>
                    updateFormData("smartMeterPresent", value)
                  }
                  required
                  description="Is a smart meter currently installed?"
                />
              </div>
            </div>
          </SurveySection>

          {/* Section 2 - Property Overview */}
          <SurveySection
            title="Section 2 - Property Overview"
            isOpen={currentSection === "property"}
            onToggle={() => toggleSection("property")}
            completedFields={progress.sections.property.completed}
            totalFields={progress.sections.property.total}
            flaggedFields={0}
          >
            <div className="space-y-8">
              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Property Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DropdownSelect
                  id="property-type"
                    label="Property Type"
                  value={formData.propertyType}
                  onChange={(value) => updateFormData("propertyType", value)}
                  options={propertyTypeOptions}
                  placeholder="Select property type..."
                  required
                />

                <DropdownSelect
                  id="property-age"
                    label="Property Age"
                  value={formData.propertyAge}
                  onChange={(value) => updateFormData("propertyAge", value)}
                  options={propertyAgeOptions}
                  placeholder="Select age range..."
                  required
                />

                <DropdownSelect
                  id="occupancy-status"
                    label="Occupancy Status"
                  value={formData.occupancyStatus}
                  onChange={(value) => updateFormData("occupancyStatus", value)}
                  options={occupancyStatusOptions}
                  placeholder="Select occupancy status..."
                  required
                />
                </div>
              </div>

              {/* Property Status & Restrictions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Property Status & Restrictions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <YesNoNADropdown
                  id="listed-building"
                    label="Listed Building"
                  value={formData.listedBuilding}
                  onChange={(value) => updateFormData("listedBuilding", value)}
                  required
                    description="Is the property a listed building?"
                />

                <YesNoNADropdown
                  id="conservation-area"
                    label="Conservation Area"
                  value={formData.conservationArea}
                  onChange={(value) =>
                    updateFormData("conservationArea", value)
                  }
                  required
                    description="Is the property in a conservation area?"
                />

                <YesNoNADropdown
                  id="new-build"
                    label="New-Build or Under Construction"
                  value={formData.newBuild}
                  onChange={(value) => updateFormData("newBuild", value)}
                  required
                    description="Is this a new build or under construction?"
                />

                <YesNoNADropdown
                  id="shared-roof"
                    label="Shared Roof / Party Wall"
                  value={formData.sharedRoof}
                  onChange={(value) => updateFormData("sharedRoof", value)}
                  required
                    description="Does the property share a roof or party wall?"
                  />
                </div>
              </div>

              {/* Access & Storage */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Access & Storage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <YesNoNADropdown
                  id="scaffold-access"
                    label="Clear, Safe Access for Scaffold"
                  value={formData.scaffoldAccess}
                  onChange={(value) => updateFormData("scaffoldAccess", value)}
                  required
                    description="Is there clear and safe access for scaffolding?"
                />

                <YesNoNADropdown
                  id="storage-area"
                    label="Suitable Storage Area for Panels & Battery"
                  value={formData.storageArea}
                  onChange={(value) => updateFormData("storageArea", value)}
                  required
                    description="Is there suitable storage area for panels and battery?"
                />
                </div>
              </div>

              {/* Storage Area - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Storage Area Details
                </h3>
                <TextWithPhotoInput
                  id="storage-area"
                  label="Storage Area Information"
                  textValue={formData.restrictedParking}
                  onTextChange={(value) => updateFormData("restrictedParking", value)}
                  photos={formData.storageAreaPhoto}
                  onPhotosChange={(photos) => updateFormData("storageAreaPhoto", photos)}
                  placeholder="Describe storage area, parking restrictions, or access issues..."
                  multiline
                maxPhotos={3}
                  photoGuidelines={[
                    {
                      title: "Storage Space",
                      description: "Show available storage space for panels and equipment",
                      icon: "•"
                    },
                    {
                      title: "Access Routes",
                      description: "Document access routes and any restrictions",
                      icon: "•"
                    },
                    {
                      title: "Parking Areas",
                      description: "Show parking areas and any limitations",
                      icon: "•"
                    }
                  ]}
                />
              </div>

              {/* Scaffold Access - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Scaffold Access Details
                </h3>
                <TextWithPhotoInput
                  id="scaffold-access"
                  label="Scaffold Access Information"
                  textValue=""
                  onTextChange={() => {}}
                  photos={formData.scaffoldAccessPhoto}
                  onPhotosChange={(photos) => updateFormData("scaffoldAccessPhoto", photos)}
                  placeholder="Describe scaffold access requirements or restrictions..."
                  multiline
                maxPhotos={3}
                  photoGuidelines={[
                    {
                      title: "Access Routes",
                      description: "Show clear access routes for scaffolding",
                      icon: "•"
                    },
                    {
                      title: "Obstructions",
                      description: "Document any obstructions or restrictions",
                      icon: "•"
                    },
                    {
                      title: "Ground Conditions",
                      description: "Show ground conditions and stability",
                      icon: "•"
                    }
                  ]}
                />
              </div>
            </div>
          </SurveySection>

          {/* Section 3 - Roof Inspection */}
          <SurveySection
            title="Section 3 - Roof Inspection"
            isOpen={currentSection === "roof"}
            onToggle={() => toggleSection("roof")}
            completedFields={progress.sections.roof.completed}
            totalFields={progress.sections.roof.total}
            flaggedFields={1}
          >
            <RoofSection
              roofFaces={formData.roofFaces}
              onRoofFacesChange={(faces) => updateFormData("roofFaces", faces)}
            />
          </SurveySection>

          {/* Section 4 - Loft / Attic */}
          <SurveySection
            title="Section 4 - Loft / Attic"
            isOpen={currentSection === "loft"}
            onToggle={() => toggleSection("loft")}
            completedFields={progress.sections.loft.completed}
            totalFields={progress.sections.loft.total}
            flaggedFields={0}
          >
            <div className="space-y-8">
              {/* Loft Access & Dimensions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Loft Access & Dimensions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <NumberInput
                  id="loft-hatch-width"
                    label="Loft Hatch Width"
                  value={formData.loftHatchWidth}
                  onChange={(value) => updateFormData("loftHatchWidth", value)}
                  min={0}
                  max={200}
                  step={1}
                  unit="cm"
                  required
                />

                <NumberInput
                  id="loft-hatch-height"
                    label="Loft Hatch Height"
                  value={formData.loftHatchHeight}
                  onChange={(value) => updateFormData("loftHatchHeight", value)}
                  min={0}
                  max={200}
                  step={1}
                  unit="cm"
                  required
                />

                <DropdownSelect
                    id="loft-access-type"
                    label="Loft Access Type"
                    value={formData.loftAccessType}
                  onChange={(value) =>
                      updateFormData("loftAccessType", value)
                  }
                    options={loftAccessTypeOptions}
                    placeholder="Select access type..."
                  required
                />

                <NumberInput
                  id="loft-headroom"
                    label="Loft Headroom"
                  value={formData.loftHeadroom}
                  onChange={(value) => updateFormData("loftHeadroom", value)}
                  min={0}
                  max={10}
                  step={0.1}
                  unit="m"
                  required
                />

                  <YesNoNADropdown
                    id="loft-boards-in-place"
                    label="Loft Boards in Place"
                    value={formData.loftBoardsInPlace}
                    onChange={(value) => updateFormData("loftBoardsInPlace", value)}
                    required
                    description="Are loft boards already installed?"
                  />
                </div>
              </div>

              {/* Roof Timber Condition - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Roof Timber Condition
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DropdownSelect
                  id="roof-timber-condition"
                    label="Timber Condition"
                  value={formData.roofTimberCondition}
                  onChange={(value) =>
                    updateFormData("roofTimberCondition", value)
                  }
                  options={roofTimberConditionOptions}
                  placeholder="Select timber condition..."
                  required
                />
                </div>
                <TextWithPhotoInput
                  id="roof-timber"
                  label="Roof Timber Assessment"
                  textValue={formData.roofTimberNotes}
                  onTextChange={(value) => updateFormData("roofTimberNotes", value)}
                  photos={formData.roofTimberPhoto}
                  onPhotosChange={(photos) => updateFormData("roofTimberPhoto", photos)}
                  placeholder="Describe timber condition, any issues, or additional notes..."
                  multiline
                  maxPhotos={3}
                  photoGuidelines={[
                    {
                      title: "Timber Structure",
                      description: "Document overall timber structure and condition",
                      icon: "•"
                    },
                    {
                      title: "Damage Areas",
                      description: "Show any areas of damage or concern",
                      icon: "•"
                    },
                    {
                      title: "Access Points",
                      description: "Document access points and clearances",
                      icon: "•"
                    }
                  ]}
                />
              </div>

              {/* Wall Space for Equipment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Wall Space for Equipment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <YesNoNADropdown
                  id="wall-space-inverter"
                    label="Wall Space for Inverter"
                  value={formData.wallSpaceInverter}
                  onChange={(value) =>
                    updateFormData("wallSpaceInverter", value)
                  }
                  required
                    description="Space for inverter (500×400×200 mm)"
                />

                <YesNoNADropdown
                  id="wall-space-battery"
                    label="Wall Space for Battery"
                  value={formData.wallSpaceBattery}
                  onChange={(value) =>
                    updateFormData("wallSpaceBattery", value)
                  }
                  required
                    description="Space for battery installation"
                  />
                </div>
              </div>

              {/* Inverter Space - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Inverter Space Assessment
                </h3>
                <TextWithPhotoInput
                  id="wall-space-inverter"
                  label="Inverter Space Details"
                  textValue={formData.wallSpaceInverterNotes}
                  onTextChange={(value) => updateFormData("wallSpaceInverterNotes", value)}
                  photos={formData.wallSpaceInverterPhoto}
                  onPhotosChange={(photos) => updateFormData("wallSpaceInverterPhoto", photos)}
                  placeholder="Describe available space, mounting options, or any restrictions..."
                  multiline
                  maxPhotos={2}
                  photoGuidelines={[
                    {
                      title: "Wall Space",
                      description: "Show available wall space for inverter mounting",
                      icon: "🧱"
                    },
                    {
                      title: "Access Routes",
                      description: "Document cable access routes",
                      icon: "🔌"
                    }
                  ]}
                />
              </div>

              {/* Battery Space - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🔋 Battery Space Assessment
                </h3>
                <TextWithPhotoInput
                  id="wall-space-battery"
                  label="Battery Space Details"
                  textValue={formData.wallSpaceBatteryNotes}
                  onTextChange={(value) => updateFormData("wallSpaceBatteryNotes", value)}
                  photos={formData.wallSpaceBatteryPhoto}
                  onPhotosChange={(photos) => updateFormData("wallSpaceBatteryPhoto", photos)}
                  placeholder="Describe available space, mounting options, or any restrictions..."
                  multiline
                  maxPhotos={2}
                  photoGuidelines={[
                    {
                      title: "Wall Space",
                      description: "Show available wall space for battery mounting",
                      icon: "🧱"
                    },
                    {
                      title: "Access Routes",
                      description: "Document cable access routes",
                      icon: "🔌"
                    }
                  ]}
                />
              </div>

              {/* Loft Infrastructure */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🏠 Loft Infrastructure
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <NumberInput
                  id="loft-insulation-thickness"
                    label="Loft Insulation Thickness"
                  value={formData.loftInsulationThickness}
                  onChange={(value) =>
                    updateFormData("loftInsulationThickness", value)
                  }
                  min={0}
                  max={500}
                  step={10}
                  unit="mm"
                  required
                />

                <DropdownSelect
                  id="loft-lighting"
                    label="Existing Loft Lighting"
                  value={formData.loftLighting}
                  onChange={(value) => updateFormData("loftLighting", value)}
                  options={loftLightingOptions}
                  placeholder="Select lighting type..."
                  required
                />

                <YesNoNADropdown
                  id="loft-power-socket"
                    label="Existing Loft Power Socket"
                  value={formData.loftPowerSocket}
                  onChange={(value) => updateFormData("loftPowerSocket", value)}
                  required
                    description="Is there an existing power socket in the loft?"
                />
              </div>
              </div>
            </div>
          </SurveySection>

          {/* Section 5 - Electrical Supply */}
          <SurveySection
            title="Section 5 - Electrical Supply"
            isOpen={currentSection === "electrical"}
            onToggle={() => toggleSection("electrical")}
            completedFields={progress.sections.electrical.completed}
            totalFields={progress.sections.electrical.total}
            flaggedFields={0}
          >
            <div className="space-y-8">
              {/* Supply & Main Fuse - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  ⚡ Supply & Main Fuse
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DropdownSelect
                  id="supply-type"
                    label="Supply Type"
                  value={formData.supplyType}
                  onChange={(value) => updateFormData("supplyType", value)}
                  options={supplyTypeOptions}
                  placeholder="Select supply type..."
                  required
                />

                <DropdownSelect
                  id="main-fuse-rating"
                    label="Main Fuse Rating"
                  value={formData.mainFuseRating}
                  onChange={(value) => updateFormData("mainFuseRating", value)}
                  options={mainFuseRatingOptions}
                  placeholder="Select fuse rating..."
                  required
                />
                </div>
                <TextWithPhotoInput
                  id="main-fuse"
                  label="Main Fuse Assessment"
                  textValue=""
                  onTextChange={() => {}}
                  photos={formData.mainFusePhoto}
                  onPhotosChange={(photos) => updateFormData("mainFusePhoto", photos)}
                  placeholder="Describe main fuse condition, any issues, or additional notes..."
                  multiline
                  maxPhotos={2}
                  photoGuidelines={[
                    {
                      title: "Fuse Rating",
                      description: "Show the main fuse rating clearly visible",
                      icon: "🔌"
                    },
                    {
                      title: "Fuse Condition",
                      description: "Document overall condition of the fuse",
                      icon: "•"
                    }
                  ]}
                />
              </div>

              {/* Consumer Unit Details - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🏠 Consumer Unit Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  id="consumer-unit-make"
                    label="Consumer Unit Make & Model"
                  value={formData.consumerUnitMake}
                  onChange={(value) =>
                    updateFormData("consumerUnitMake", value)
                  }
                  placeholder="e.g., Wylex, Hager, etc."
                  required
                />

                <TextInput
                  id="consumer-unit-location"
                    label="Consumer Unit Location"
                  value={formData.consumerUnitLocation}
                  onChange={(value) =>
                    updateFormData("consumerUnitLocation", value)
                  }
                  placeholder="e.g., Garage, Utility room, etc."
                  required
                />
                </div>
                <TextWithPhotoInput
                  id="consumer-unit-location"
                  label="Consumer Unit Assessment"
                  textValue=""
                  onTextChange={() => {}}
                  photos={formData.consumerUnitLocationPhoto}
                  onPhotosChange={(photos) => updateFormData("consumerUnitLocationPhoto", photos)}
                  placeholder="Describe consumer unit condition, any issues, or additional notes..."
                  multiline
                  maxPhotos={3}
                  photoGuidelines={[
                    {
                      title: "Full Unit View",
                      description: "Show the complete consumer unit with all circuits visible",
                      icon: "🏠"
                    },
                    {
                      title: "Circuit Labels",
                      description: "Ensure circuit labels are clearly readable",
                      icon: "🏷️"
                    },
                    {
                      title: "Spare Ways",
                      description: "Document available spare ways for new circuits",
                      icon: "🔧"
                    }
                  ]}
                />
              </div>

              {/* Fuse Ways & Protection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🔧 Fuse Ways & Protection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <NumberInput
                  id="spare-fuse-ways"
                    label="Spare Fuse-ways Available"
                  value={formData.spareFuseWays}
                  onChange={(value) => updateFormData("spareFuseWays", value)}
                  min={0}
                  max={20}
                  step={1}
                  required
                />

                <YesNoNADropdown
                  id="existing-surge-protection"
                    label="Existing Surge Protection"
                  value={formData.existingSurgeProtection}
                  onChange={(value) =>
                    updateFormData("existingSurgeProtection", value)
                  }
                  required
                    description="Is surge protection already installed?"
                  />

                  <DropdownSelect
                    id="earthing-system-type"
                    label="Earthing System Type"
                    value={formData.earthingSystemType}
                    onChange={(value) =>
                      updateFormData("earthingSystemType", value)
                    }
                    options={earthingSystemOptions}
                    placeholder="Select earthing system..."
                    required
                  />
                </div>
                <TextWithPhotoInput
                  id="spare-fuse-ways"
                  label="Spare Fuse-ways Assessment"
                  textValue=""
                  onTextChange={() => {}}
                  photos={formData.spareFuseWaysPhoto}
                  onPhotosChange={(photos) => updateFormData("spareFuseWaysPhoto", photos)}
                  placeholder="Describe available spare ways, any issues, or additional notes..."
                  multiline
                  maxPhotos={2}
                  photoGuidelines={[
                    {
                      title: "Spare Ways",
                      description: "Show available spare ways clearly",
                      icon: "🔧"
                    },
                    {
                      title: "Circuit Layout",
                      description: "Document overall circuit layout",
                      icon: "📋"
                    }
                  ]}
                />
              </div>

              {/* Surge Protection - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🛡️ Surge Protection Assessment
                </h3>
                <TextWithPhotoInput
                  id="existing-surge-protection"
                  label="Surge Protection Details"
                  textValue=""
                  onTextChange={() => {}}
                  photos={formData.existingSurgeProtectionPhoto}
                  onPhotosChange={(photos) => updateFormData("existingSurgeProtectionPhoto", photos)}
                  placeholder="Describe existing surge protection, any issues, or additional notes..."
                  multiline
                  maxPhotos={2}
                  photoGuidelines={[
                    {
                      title: "Surge Protection Device",
                      description: "Show the surge protection device if present",
                      icon: "🛡️"
                    },
                    {
                      title: "Installation Quality",
                      description: "Document installation quality and condition",
                      icon: "•"
                    }
                  ]}
                />
              </div>

              {/* Earth Bonding - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🔗 Earth Bonding Assessment
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <YesNoNADropdown
                  id="earth-bonding-verified"
                    label="Earth Bonding Verified"
                  value={formData.earthBondingVerified}
                  onChange={(value) =>
                    updateFormData("earthBondingVerified", value)
                  }
                  required
                    description="Is proper earth bonding verified and in place?"
                  />
                </div>
                <TextWithPhotoInput
                  id="earth-bonding"
                  label="Earth Bonding Details"
                  textValue=""
                  onTextChange={() => {}}
                  photos={formData.earthBondingPhoto}
                  onPhotosChange={(photos) => updateFormData("earthBondingPhoto", photos)}
                  placeholder="Describe earth bonding condition, any issues, or additional notes..."
                  multiline
                  maxPhotos={2}
                  photoGuidelines={[
                    {
                      title: "Bonding Points",
                      description: "Show main earth bonding connections",
                      icon: "🔗"
                    },
                    {
                      title: "Bonding Condition",
                      description: "Document condition of bonding conductors",
                      icon: "•"
                    }
                  ]}
                />
              </div>

              {/* Earthing System - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  ⚡ Earthing System Assessment
                </h3>
                <TextWithPhotoInput
                  id="earthing-system"
                  label="Earthing System Details"
                  textValue=""
                  onTextChange={() => {}}
                  photos={formData.earthingSystemPhoto}
                  onPhotosChange={(photos) => updateFormData("earthingSystemPhoto", photos)}
                  placeholder="Describe earthing system condition, any issues, or additional notes..."
                  multiline
                  maxPhotos={2}
                  photoGuidelines={[
                    {
                      title: "Earthing Arrangement",
                      description: "Show the earthing arrangement and connections",
                      icon: "⚡"
                    },
                    {
                      title: "Earthing Condition",
                      description: "Document condition of earthing conductors",
                      icon: "•"
                    }
                  ]}
                />
              </div>

              {/* DNO Notification & EV Charger */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  📋 DNO Notification & EV Charger
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ToggleInput
                  id="dno-notification-required"
                    label="DNO Notification Required"
                  value={formData.dnoNotificationRequired}
                  onChange={(value) =>
                    updateFormData("dnoNotificationRequired", value)
                  }
                  readOnly
                  description="Auto-calculated based on inverter size"
                />

                <YesNoNADropdown
                  id="ev-charger-installed"
                    label="EV Charger Already Installed"
                  value={formData.evChargerInstalled}
                  onChange={(value) =>
                    updateFormData("evChargerInstalled", value)
                  }
                  required
                    description="Is an EV charger already installed?"
                />
                </div>

                {formData.evChargerInstalled === "yes" && (
                  <NumberInput
                    id="ev-charger-load"
                    label="EV Charger Load"
                    value={formData.evChargerLoad}
                    onChange={(value) => updateFormData("evChargerLoad", value)}
                    min={0}
                    max={50}
                    step={0.1}
                    unit="kW"
                    required
                  />
                )}
              </div>

              {/* Cable Routes - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🔌 Cable Routes
                </h3>
                <TextWithPhotoInput
                id="cable-route-to-roof"
                  label="Cable Route from CU to Roof"
                  textValue=""
                  onTextChange={() => {}}
                photos={formData.cableRouteToRoof}
                  onPhotosChange={(photos) => updateFormData("cableRouteToRoof", photos)}
                  placeholder="Describe cable route from consumer unit to roof, any issues, or additional notes..."
                  multiline
                maxPhotos={5}
                  photoGuidelines={[
                    {
                      title: "Route Planning",
                      description: "Show planned cable route with arrows",
                      icon: "•"
                    },
                    {
                      title: "Obstructions",
                      description: "Document any obstructions or restrictions",
                      icon: "•"
                    },
                    {
                      title: "Access Points",
                      description: "Show access points and penetrations",
                      icon: "•"
                    }
                  ]}
                />

                <TextWithPhotoInput
                id="cable-route-to-battery"
                  label="Cable Route from CU to Battery"
                  textValue=""
                  onTextChange={() => {}}
                photos={formData.cableRouteToBattery}
                  onPhotosChange={(photos) => updateFormData("cableRouteToBattery", photos)}
                  placeholder="Describe cable route from consumer unit to battery, any issues, or additional notes..."
                  multiline
                maxPhotos={5}
                  photoGuidelines={[
                    {
                      title: "Route Planning",
                      description: "Show planned cable route with arrows",
                      icon: "•"
                    },
                    {
                      title: "Obstructions",
                      description: "Document any obstructions or restrictions",
                      icon: "•"
                    },
                    {
                      title: "Access Points",
                      description: "Show access points and penetrations",
                      icon: "•"
                    }
                  ]}
                />
              </div>
            </div>
          </SurveySection>

          {/* Section 6 - Battery & Storage Preferences */}
          <SurveySection
            title="Section 6 - Battery & Storage Preferences"
            isOpen={currentSection === "battery"}
            onToggle={() => toggleSection("battery")}
            completedFields={progress.sections.battery.completed}
            totalFields={progress.sections.battery.total}
            flaggedFields={0}
          >
            <div className="space-y-8">
              {/* Battery Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🔋 Battery Requirements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DropdownSelect
                  id="battery-required"
                    label="Battery Required"
                  value={formData.batteryRequired}
                  onChange={(value) => updateFormData("batteryRequired", value)}
                  options={batteryRequiredOptions}
                  placeholder="Select battery preference..."
                  required
                />

                <DropdownSelect
                  id="preferred-install-location"
                    label="Preferred Install Location"
                  value={formData.preferredInstallLocation}
                  onChange={(value) =>
                    updateFormData("preferredInstallLocation", value)
                  }
                  options={installLocationOptions}
                  placeholder="Select location..."
                  required
                />
                </div>
              </div>

              {/* Installation Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🏗️ Installation Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <NumberInput
                  id="distance-from-cu"
                    label="Distance from CU to Battery"
                  value={formData.distanceFromCU}
                  onChange={(value) => updateFormData("distanceFromCU", value)}
                  min={0}
                  max={100}
                  step={0.1}
                  unit="m"
                  required
                    description="Distance from Consumer Unit (CU)"
                />

                <DropdownSelect
                  id="mounting-surface"
                    label="Mounting Surface"
                  value={formData.mountingSurface}
                  onChange={(value) => updateFormData("mountingSurface", value)}
                  options={mountingSurfaceOptions}
                  placeholder="Select surface type..."
                  required
                />
                </div>
              </div>

              {/* Environmental Conditions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🌡️ Environmental Conditions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <YesNoNADropdown
                  id="ventilation-adequate"
                    label="Ventilation Adequate"
                  value={formData.ventilationAdequate}
                  onChange={(value) =>
                    updateFormData("ventilationAdequate", value)
                  }
                  required
                    description="Is adequate ventilation available for battery cooling?"
                />
                </div>
              </div>

              {/* Ventilation Assessment - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  💨 Ventilation Assessment
                </h3>
                <TextWithPhotoInput
                  id="ventilation"
                  label="Ventilation Details"
                  textValue=""
                  onTextChange={() => {}}
                photos={formData.ventilationPhoto}
                  onPhotosChange={(photos) => updateFormData("ventilationPhoto", photos)}
                  placeholder="Describe ventilation conditions, any issues, or additional notes..."
                  multiline
                maxPhotos={3}
                  photoGuidelines={[
                    {
                      title: "Ventilation Openings",
                      description: "Show existing ventilation openings and airflow",
                      icon: "💨"
                    },
                    {
                      title: "Air Flow",
                      description: "Document air flow patterns and circulation",
                      icon: "🌪️"
                    },
                    {
                      title: "Ventilation Requirements",
                      description: "Show any additional ventilation requirements",
                      icon: "📋"
                    }
                  ]}
                />
              </div>
            </div>
          </SurveySection>

          {/* Section 7 - Health, Safety & Hazards */}
          <SurveySection
            title="Section 7 - Health, Safety & Hazards"
            isOpen={currentSection === "safety"}
            onToggle={() => toggleSection("safety")}
            completedFields={progress.sections.safety.completed}
            totalFields={progress.sections.safety.total}
            flaggedFields={0}
          >
            <div className="space-y-8">
              {/* Asbestos Assessment - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  ⚠️ Asbestos Assessment
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DropdownSelect
                  id="asbestos-presence"
                    label="Asbestos Presence"
                  value={formData.asbestosPresence}
                  onChange={(value) =>
                    updateFormData("asbestosPresence", value)
                  }
                  options={asbestosPresenceOptions}
                  placeholder="Select asbestos status..."
                  required
                />
                </div>
                <TextWithPhotoInput
                  id="asbestos"
                  label="Asbestos Assessment Details"
                  textValue=""
                  onTextChange={() => {}}
                  photos={formData.asbestosPhoto}
                  onPhotosChange={(photos) => updateFormData("asbestosPhoto", photos)}
                  placeholder="Describe asbestos assessment findings, any issues, or additional notes..."
                  multiline
                  maxPhotos={3}
                  photoGuidelines={[
                    {
                      title: "Asbestos Materials",
                      description: "Document any suspected asbestos materials",
                      icon: "•"
                    },
                    {
                      title: "Material Condition",
                      description: "Show condition of materials and any damage",
                      icon: "•"
                    },
                    {
                      title: "Access Points",
                      description: "Document access points and restrictions",
                      icon: "•"
                    }
                  ]}
                />
              </div>

              {/* Working at Height Assessment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🪜 Working at Height Assessment
                </h3>
              <TextareaInput
                id="working-at-height-difficulties"
                  label="Working at Height Difficulties"
                value={formData.workingAtHeightDifficulties}
                onChange={(value) =>
                  updateFormData("workingAtHeightDifficulties", value)
                }
                placeholder="Describe any difficulties or special considerations..."
                rows={3}
                required
              />
              </div>

              {/* Fragile Roof Areas - Text + Photo grouped */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🏠 Fragile Roof Areas
                </h3>
                <TextWithPhotoInput
                id="fragile-roof-areas"
                  label="Fragile Roof Areas Assessment"
                  textValue=""
                  onTextChange={() => {}}
                photos={formData.fragileRoofAreas}
                  onPhotosChange={(photos) => updateFormData("fragileRoofAreas", photos)}
                  placeholder="Describe fragile roof areas, any issues, or additional notes..."
                  multiline
                maxPhotos={5}
                  photoGuidelines={[
                    {
                      title: "Fragile Areas",
                      description: "Document fragile roof areas with annotations",
                      icon: "•"
                    },
                    {
                      title: "Roof Condition",
                      description: "Show overall roof condition and any concerns",
                      icon: "•"
                    },
                    {
                      title: "Safety Measures",
                      description: "Document required safety measures",
                      icon: "🛡️"
                    }
                  ]}
                />
              </div>

              {/* Livestock & Pets Assessment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🐕 Livestock & Pets Assessment
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <YesNoNADropdown
                    id="livestock-pets-on-site"
                    label="Livestock / Pets on Site"
                    value={formData.livestockPetsOnSite}
                    onChange={(value) =>
                      updateFormData("livestockPetsOnSite", value)
                    }
                    required
                    description="Are there livestock or pets on site that need consideration?"
                  />
                </div>

              {formData.livestockPetsOnSite === "yes" && (
                <TextInput
                  id="livestock-pets-notes"
                    label="Livestock / Pets Notes"
                  value={formData.livestockPetsNotes}
                  onChange={(value) =>
                    updateFormData("livestockPetsNotes", value)
                  }
                  placeholder="Describe pets/livestock and any special considerations..."
                    description="Include details about securing pets during installation"
                />
              )}
              </div>

              {/* Special Access Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  🚪 Special Access Instructions
                </h3>
              <TextareaInput
                id="special-access-instructions"
                  label="Special Access Instructions"
                value={formData.specialAccessInstructions}
                onChange={(value) =>
                  updateFormData("specialAccessInstructions", value)
                }
                placeholder="Any special access requirements or instructions..."
                rows={3}
                required
                  description="Include any special access requirements, gate codes, or restrictions"
                />
              </div>
            </div>
          </SurveySection>

          {/* Section 8 - Customer Preferences & Next Steps */}
          <SurveySection
            title="Section 8 - Customer Preferences & Next Steps"
            isOpen={currentSection === "preferences"}
            onToggle={() => toggleSection("preferences")}
            completedFields={progress.sections.preferences.completed}
            totalFields={progress.sections.preferences.total}
            flaggedFields={0}
          >
            <div className="space-y-8">
              {/* Contact Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  📞 Contact Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DropdownSelect
                  id="preferred-contact-method"
                    label="Preferred Contact Method"
                  value={formData.preferredContactMethod}
                  onChange={(value) =>
                    updateFormData("preferredContactMethod", value)
                  }
                  options={contactMethodOptions}
                  placeholder="Select contact method..."
                  required
                />
                </div>
              </div>

              {/* Installation Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  📅 Installation Timeline
                </h3>
                <DateRangeInput
                  id="installation-month"
                  label="Preferred Installation Month"
                  startDate={formData.installationStartDate}
                  endDate={formData.installationEndDate}
                  onStartDateChange={(value) =>
                    updateFormData("installationStartDate", value)
                  }
                  onEndDateChange={(value) =>
                    updateFormData("installationEndDate", value)
                  }
                  customerAway={formData.customerAway}
                  onCustomerAwayChange={(value) =>
                    updateFormData("customerAway", value)
                  }
                  awayNotes={formData.customerAwayNotes}
                  onAwayNotesChange={(value) =>
                    updateFormData("customerAwayNotes", value)
                  }
                  required
                />
              </div>

              {/* Budget & Additional Services */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  💰 Budget & Additional Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BudgetRangeSlider
                  id="budget-range"
                    label="Budget Range"
                  value={formData.budgetRange}
                  onChange={(value) => updateFormData("budgetRange", value)}
                  required
                />

                <YesNoNADropdown
                  id="interested-in-ev-charger"
                    label="Interested in EV Charger"
                  value={formData.interestedInEvCharger}
                  onChange={(value) =>
                    updateFormData("interestedInEvCharger", value)
                  }
                  required
                    description="Would you like to include an EV charger in the installation?"
                  />

                  <YesNoNADropdown
                    id="interested-in-energy-monitoring"
                    label="Interested in Energy Monitoring"
                    value={formData.interestedInEnergyMonitoring}
                    onChange={(value) =>
                      updateFormData("interestedInEnergyMonitoring", value)
                    }
                    required
                    description="Would you like to include energy monitoring in the installation?"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  📝 Additional Notes & Requirements
                </h3>
              <TextareaInput
                id="additional-notes"
                  label="Additional Notes"
                value={formData.additionalNotes}
                onChange={(value) => updateFormData("additionalNotes", value)}
                placeholder="Any additional notes, preferences, or special requirements..."
                rows={4}
                  description="Include any special requirements, preferences, or additional information"
              />
              </div>
            </div>
          </SurveySection>

          {/* Section 9 - Customer Signature */}
          <SurveySection
            title="Section 9 - Customer Signature"
            isOpen={currentSection === "signature"}
            onToggle={() => toggleSection("signature")}
            completedFields={formData.customerSignature ? 1 : 0}
            totalFields={1}
            flaggedFields={0}
          >
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  ✍️ Digital Signature Required
                </h3>
                <p className="text-sm text-blue-800">
                  Please provide your digital signature to confirm the accuracy of the information provided in this survey.
                </p>
              </div>
              
              <SignatureInput
                id="customer-signature"
                label="Customer Signature"
                value={formData.customerSignature}
                onChange={(value) => updateFormData("customerSignature", value)}
                required={true}
                description="Click and drag to sign in the box below. This signature confirms the accuracy of the survey information."
              />
            </div>
          </SurveySection>

          {/* Section 10 - Auto-Generated Summary */}
          <SurveySection
            title="Section 10 - Auto-Generated Summary"
            isOpen={currentSection === "summary"}
            onToggle={() => toggleSection("summary")}
            completedFields={progress.completed}
            totalFields={progress.total}
            flaggedFields={redFlags.length}
          >
            <div className="space-y-6">
              <SummaryDisplay
                totalPvCapacity={calculateTotalPvCapacity()}
                totalRoofArea={calculateTotalRoofArea()}
                flaggedIssuesCount={redFlags.length}
                flaggedIssues={redFlags}
                recommendedActions={generateRecommendedActions()}
                onJumpToIssue={jumpToField}
                completionStatus={{
                  completed: progress.completed,
                  total: progress.total,
                  percentage: Math.round((progress.completed / progress.total) * 100)
                }}
                incompleteSections={Object.entries(progress.sections)
                  .filter(([_, section]) => section.completed < section.total)
                  .map(([key, _]) => {
                    const sectionNames: { [key: string]: string } = {
                      general: "General & Contact",
                      electricity: "Electricity Baseline",
                      property: "Property Overview",
                      roof: "Roof Inspection",
                      loft: "Loft / Attic",
                      electrical: "Electrical Supply",
                      battery: "Battery & Storage",
                      safety: "Health & Safety",
                      preferences: "Preferences & Next Steps",
                      signature: "Customer Signature"
                    };
                    return sectionNames[key] || key;
                  })
                }
              />

              <div className="flex justify-center pt-6 border-t">
                <ExportButtons formData={formData} onExport={handleExport} />
              </div>

              {/* Submit Survey Button */}
              <div className="flex justify-center pt-6 border-t">
                <SubmitSurveyButton
                  formData={formData}
                  onSubmit={handleSubmitSurvey}
                  isSubmitting={isSubmitting}
                  missingFields={getMissingRequiredFields()}
                  invalidFields={getInvalidFormatFields()}
                />
              </div>
            </div>
          </SurveySection>
        </div>
      </main>

      {/* Red Flags Summary */}
      <div className="pb-32 sm:pb-36">
        <RedFlagsSummary flags={redFlags} onJumpToField={jumpToField} />
      </div>

      {/* Sticky Submit Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground truncate">
            {!isOnline && "Offline: submit to save locally and sync later"}
          </div>
          <div className="flex gap-3">
            <Button
              variant="default"
              size="default"
              onClick={() => setShowFeedbackModal(true)}
              className="hidden sm:flex min-w-[140px] h-9 sm:h-10 text-sm"
            >
              Feedback
            </Button>
            
            {!!surveyId && (
              <Button variant="outline" size="default" onClick={startNewSurvey} className="h-10 sm:h-11 text-sm">
                New Survey
              </Button>
            )}

            {pendingSync > 0 && (
              <Button
                variant="outline"
                size="default"
                className="h-10 sm:h-11 text-sm"
                onClick={async () => {
                  const confirmed = window.confirm(
                    `Clear ${pendingSync} pending sync items? This will permanently delete queued data.`
                  );
                  if (confirmed) {
                    try {
                      await offlineStorage.clearAllData();
                      toast({
                        title: "Sync Queue Cleared",
                        description: `${pendingSync} items removed`,
                      });
                    } catch (error) {
                      console.error("Failed to clear sync queue:", error);
                      toast({
                        title: "Failed to Clear Queue",
                        description: "Please try again",
                        variant: "destructive",
                      });
                    }
                  }
                }}
              >
                Clear Queue ({pendingSync})
              </Button>
            )}
            <Button
              onClick={handleSubmitSurvey}
              disabled={isSubmitting}
              variant="default"
              size="default"
              className="min-w-[160px] h-10 sm:h-11 text-sm"
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </Button>
          </div>
        </div>
      </div>

      {/* User Feedback Modal */}
      <UserFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={async (feedback) => {
          // Here you would typically send the feedback to your backend
          console.log("User feedback:", feedback);
          toast({
            title: "Feedback Submitted",
            description: "Thank you for your feedback! We'll use it to improve the survey experience.",
          });
        }}
      />

    </div>
  );
};

export default Index;
