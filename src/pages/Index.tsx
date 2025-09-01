import { useState, useEffect } from "react";
import { SurveyHeader } from "@/components/SurveyHeader";
import { Hero } from "@/components/Hero";
import { SurveySection } from "@/components/SurveySection";
import { RedFlagsSummary } from "@/components/RedFlagsSummary";
import { TextInput } from "@/components/inputs/TextInput";
import { NumberInput } from "@/components/inputs/NumberInput";
import { DropdownSelect } from "@/components/inputs/DropdownSelect";
import { SegmentedControl } from "@/components/inputs/SegmentedControl";
import { PhotoUpload } from "@/components/inputs/PhotoUpload";
import { VoiceNote } from "@/components/inputs/VoiceNote";
import { GPSInput } from "@/components/inputs/GPSInput";
import { SignatureInput } from "@/components/inputs/SignatureInput";
import { RoofSection } from "@/components/RoofSection";
import { CheckboxInput } from "@/components/inputs/CheckboxInput";
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { DateRangeInput } from "@/components/inputs/DateRangeInput";
import { ToggleInput } from "@/components/inputs/ToggleInput";
import { TemperatureRangeInput } from "@/components/inputs/TemperatureRangeInput";
import { SummaryDisplay } from "@/components/inputs/SummaryDisplay";
import { ExportButtons } from "@/components/ExportButtons";
import { Button } from "@/components/ui/button";
import { OfflineStatusIndicator } from "@/components/OfflineStatusIndicator";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useOffline } from "@/hooks/use-offline";
import { offlineStorage } from "@/services/offlineStorage";
import { useToast } from "@/hooks/use-toast";
import { SupabaseService } from "@/services/supabaseService";
import { SubmitSurveyButton } from "@/components/SubmitSurveyButton";
import { syncPhotosForDraft } from "@/services/syncService";

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
  battenDepth: string;
  membraneType: string;
  membraneCondition: string;
  structuralDefects: string;
  plannedPanelCount: string;
  photos: string[];
}

interface FormData {
  // Section 0 - General & Contact
  surveyDate: string;
  surveyorName: string;
  customerName: string;
  siteAddress: string;
  postcode: string;
  gridReference: string;
  phone: string;
  email: string;
  secondaryContactName: string;
  secondaryContactPhone: string;
  
  // Section 1 - Electricity Baseline
  annualConsumption: string;
  mpanNumber: string;
  mpanPhoto: string[];
  electricityProvider: string;
  networkOperator: string;
  customerPermissionGranted: boolean;
  daytimeImportRate: string;
  nighttimeImportRate: string;
  standingCharge: string;
  tariffType: string;
  smartMeterPresent: "yes" | "no" | "na" | null;
  exportTariffAvailable: "yes" | "no" | "na" | null;
  
  // Section 2 - Property Overview
  propertyType: string;
  propertyAge: string;
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
  loftAccessQuality: string;
  loftHeadroom: string;
  roofTimberCondition: string;
  roofTimberPhoto: string[];
  wallSpaceInverter: "yes" | "no" | "na" | null;
  wallSpaceInverterPhoto: string[];
  wallSpaceBattery: "yes" | "no" | "na" | null;
  wallSpaceBatteryPhoto: string[];
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
  fireEgressCompliance: "yes" | "no" | "na" | null;
  fireEgressPhoto: string[];
  ambientTempMin: string;
  ambientTempMax: string;
  ipRatingRequired: string;
  
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
}

const electricityProviderOptions = [
  { value: "british-gas", label: "British Gas" },
  { value: "edf-energy", label: "EDF Energy" },
  { value: "eon", label: "E.ON" },
  { value: "npower", label: "npower" },
  { value: "scottish-power", label: "Scottish Power" },
  { value: "sse", label: "SSE" },
  { value: "octopus-energy", label: "Octopus Energy" },
  { value: "ovo-energy", label: "OVO Energy" },
  { value: "bulb", label: "Bulb" },
  { value: "shell-energy", label: "Shell Energy" },
  { value: "utilita", label: "Utilita" },
  { value: "green-network-energy", label: "Green Network Energy" },
  { value: "outfox-the-market", label: "Outfox the Market" },
  { value: "pure-planet", label: "Pure Planet" },
  { value: "people-energy", label: "People's Energy" },
  { value: "avro-energy", label: "Avro Energy" },
  { value: "green", label: "Green" },
  { value: "utility-warehouse", label: "Utility Warehouse" },
  { value: "so-energy", label: "So Energy" },
  { value: "other", label: "Other" }
];

const networkOperatorOptions = [
  { value: "ukpn", label: "UK Power Networks" },
  { value: "western-power", label: "Western Power Distribution" },
  { value: "northern-powergrid", label: "Northern Powergrid" },
  { value: "sp-energy-networks", label: "SP Energy Networks" },
  { value: "ssen", label: "Scottish and Southern Electricity Networks" },
  { value: "electricity-northwest", label: "Electricity North West" },
  { value: "northern-ireland-electricity", label: "Northern Ireland Electricity" }
];

const tariffTypeOptions = [
  { value: "fixed", label: "Fixed" },
  { value: "variable", label: "Variable" },
  { value: "ev", label: "EV" },
  { value: "agile", label: "Agile" }
];

const propertyTypeOptions = [
  { value: "detached", label: "Detached" },
  { value: "semi", label: "Semi-detached" },
  { value: "terrace", label: "Terraced" },
  { value: "bungalow", label: "Bungalow" },
  { value: "flat", label: "Flat" },
  { value: "commercial", label: "Commercial Unit" },
  { value: "other", label: "Other" }
];

const propertyAgeOptions = [
  { value: "pre-1980", label: "Pre 1980" },
  { value: "1980-2000", label: "1980-2000" },
  { value: "2000-2010", label: "2000-2010" },
  { value: "2010-2023", label: "2010-2023" }
];

const loftAccessQualityOptions = [
  { value: "easy", label: "Easy" },
  { value: "restricted", label: "Restricted" },
  { value: "none", label: "None" }
];

const roofTimberConditionOptions = [
  { value: "sound", label: "Sound" },
  { value: "minor-rot", label: "Minor Rot" },
  { value: "major-rot", label: "Major Rot" },
  { value: "unknown", label: "Unknown" }
];

const loftLightingOptions = [
  { value: "none", label: "None" },
  { value: "single-bulb", label: "Single Bulb" },
  { value: "strip-led", label: "Strip LED" }
];

// Section 5 - Electrical Supply Options
const supplyTypeOptions = [
  { value: "single-phase", label: "Single-phase" },
  { value: "three-phase", label: "Three-phase" }
];

const mainFuseRatingOptions = [
  { value: "60", label: "60A" },
  { value: "80", label: "80A" },
  { value: "100", label: "100A" },
  { value: "125", label: "125A" },
  { value: "other", label: "Other" }
];

const earthingSystemOptions = [
  { value: "tn-s", label: "TN-S" },
  { value: "tn-c-s", label: "TN-C-S" },
  { value: "tt", label: "TT" },
  { value: "unknown", label: "Unknown" }
];

// Section 6 - Battery & Storage Options
const batteryRequiredOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "later", label: "Later" }
];

const installLocationOptions = [
  { value: "loft", label: "Loft" },
  { value: "garage", label: "Garage" },
  { value: "utility-room", label: "Utility Room" },
  { value: "external-box", label: "External Box" },
  { value: "other", label: "Other" }
];

const mountingSurfaceOptions = [
  { value: "brick", label: "Brick" },
  { value: "plasterboard", label: "Plasterboard" },
  { value: "concrete", label: "Concrete" },
  { value: "wood", label: "Wood" }
];

const ipRatingOptions = [
  { value: "ip54", label: "IP54" },
  { value: "ip65", label: "IP65" },
  { value: "ip66", label: "IP66" }
];

// Section 7 - Health & Safety Options
const asbestosPresenceOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Unknown" }
];

const livestockPetsOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" }
];

// Section 8 - Customer Preferences Options
const contactMethodOptions = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" }
];

const budgetRangeOptions = [
  { value: "under-5k", label: "< £5k" },
  { value: "5k-8k", label: "£5-8k" },
  { value: "8k-12k", label: "£8-12k" },
  { value: "over-12k", label: "> £12k" },
  { value: "open", label: "Open" }
];

// Ensure a stable draftId per session
function ensureDraftId(): string {
  try {
    const existing = localStorage.getItem('draftId');
    if (existing) return existing;
    const newId = `draft_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
    localStorage.setItem('draftId', newId);
    return newId;
  } catch {
    return `draft_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
  }
}

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>("general");
  const { toast } = useToast();
  
  // Offline functionality
  const { isOnline, isSyncing, pendingSync, triggerSync } = useOffline();
  
  // Initialize draftId on mount
  useEffect(() => {
    ensureDraftId();
  }, []);

  const [formData, setFormData] = useState<FormData>({
    // Section 0 - General & Contact
    surveyDate: new Date().toISOString().split('T')[0],
    surveyorName: "",
    customerName: "",
    siteAddress: "",
    postcode: "",
    gridReference: "",
    phone: "",
    email: "",
    secondaryContactName: "",
    secondaryContactPhone: "",
    
    // Section 1 - Electricity Baseline
    annualConsumption: "",
    mpanNumber: "",
    mpanPhoto: [],
    electricityProvider: "",
    networkOperator: "",
    customerPermissionGranted: false,
    daytimeImportRate: "",
    nighttimeImportRate: "",
    standingCharge: "",
    tariffType: "",
    smartMeterPresent: null,
    exportTariffAvailable: null,
    
    // Section 2 - Property Overview
    propertyType: "",
    propertyAge: "",
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
    roofFaces: [{
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
      battenDepth: "",
      membraneType: "",
      membraneCondition: "",
      structuralDefects: "",
      plannedPanelCount: "",
      photos: []
    }],
    
    // Section 4 - Loft / Attic
    loftHatchWidth: "",
    loftHatchHeight: "",
    loftAccessQuality: "",
    loftHeadroom: "",
    roofTimberCondition: "",
    roofTimberPhoto: [],
    wallSpaceInverter: null,
    wallSpaceInverterPhoto: [],
    wallSpaceBattery: null,
    wallSpaceBatteryPhoto: [],
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
    fireEgressCompliance: null,
    fireEgressPhoto: [],
    ambientTempMin: "",
    ambientTempMax: "",
    ipRatingRequired: "",
    
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
    additionalNotes: ""
  });

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate required DB fields before submit/queue
  function getMissingRequiredFields(): string[] {
    const missing: string[] = [];
    const checks: Array<{ key: keyof FormData; label: string }> = [
      { key: 'surveyorName', label: 'Surveyor Name' },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'siteAddress', label: 'Site Address' },
      { key: 'postcode', label: 'Postcode' },
      { key: 'gridReference', label: 'Grid Reference' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'surveyDate', label: 'Survey Date' },
    ];

    for (const { key, label } of checks) {
      const v = formData[key];
      if (typeof v !== 'string' || v.trim().length === 0) missing.push(label);
    }
    return missing;
  }

  // Basic guard: prevent empty submissions
  function hasAnyInputFilled(): boolean {
    const entries = Object.entries(formData);
    for (const [key, value] of entries) {
      if (key === 'roofFaces') {
        // Check if any roof face has any entered data or photos
        if (Array.isArray(value)) {
          const anyFaceFilled = value.some((face) => {
            return (
              (face.width && face.width.trim().length > 0) ||
              (face.length && face.length.trim().length > 0) ||
              (face.area && face.area.trim().length > 0) ||
              (face.covering && face.covering.trim().length > 0) ||
              (face.coveringCondition && face.coveringCondition.trim().length > 0) ||
              (face.gutterHeight && face.gutterHeight.trim().length > 0) ||
              (face.rafterSpacing && face.rafterSpacing.trim().length > 0) ||
              (face.rafterDepth && face.rafterDepth.trim().length > 0) ||
              (face.battenDepth && face.battenDepth.trim().length > 0) ||
              (face.membraneType && face.membraneType.trim().length > 0) ||
              (face.membraneCondition && face.membraneCondition.trim().length > 0) ||
              (face.structuralDefects && face.structuralDefects.trim().length > 0) ||
              (face.plannedPanelCount && face.plannedPanelCount.trim().length > 0) ||
              (Array.isArray(face.photos) && face.photos.length > 0) ||
              (Array.isArray(face.obstructions) && face.obstructions.length > 0) ||
              (Array.isArray(face.shading) && face.shading.length > 0)
            );
          });
          if (anyFaceFilled) return true;
        }
        continue;
      }

      if (typeof value === 'string' && value.trim().length > 0) return true;
      if (typeof value === 'number' && !Number.isNaN(value)) return true;
      if (typeof value === 'boolean' && value === true) return true;
      if (Array.isArray(value) && value.length > 0) return true;
    }
    return false;
  }

  // Auto-save functionality
  const { isSaving, lastSaved, saveStatus } = useAutoSave(formData, {
    delay: 1000,
    enabled: true,
    onSave: (data) => {
      console.log('Auto-saved survey data');
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
      toast({
        title: "Auto-save Failed",
        description: "Your data is still safe locally",
        variant: "destructive",
      });
    }
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
    // Convert form data to match Supabase schema (only core fields that exist)
    const surveyData = {
        surveyor_name: formData.surveyorName || null,
        customer_name: formData.customerName || null,
        site_address: formData.siteAddress || null,
        postcode: formData.postcode || null,
        grid_reference: formData.gridReference || null,
        phone: formData.phone || null,
        email: formData.email || null,
        secondary_contact_name: formData.secondaryContactName || null,
        secondary_contact_phone: formData.secondaryContactPhone || null,
        survey_date: formData.surveyDate || null,
        current_electricity_supplier: formData.electricityProvider || null,
        current_electricity_tariff: formData.tariffType || null,
        current_electricity_usage: parseFloat(formData.annualConsumption) || null,
        mpan_number: formData.mpanNumber || null,
        main_fuse_rating: formData.mainFuseRating || null,
        earthing_system: formData.earthingSystemType || null,
        roof_type: formData.propertyType || null,
        electrical_supply_type: formData.supplyType || null,
        ev_charger_load: parseFloat(formData.evChargerLoad) || null,
        battery_required: formData.batteryRequired === 'yes',
        install_location: formData.preferredInstallLocation || null,
        mounting_surface: formData.mountingSurface || null,
        ip_rating: formData.ipRatingRequired || null,
        temperature_range_min: parseFloat(formData.ambientTempMin) || null,
        temperature_range_max: parseFloat(formData.ambientTempMax) || null,
        asbestos_presence: formData.asbestosPresence === 'yes',
        livestock_pets: formData.livestockPetsOnSite || null,
        contact_method: formData.preferredContactMethod || null,
        budget_range: formData.budgetRange || null,
        additional_notes: formData.additionalNotes || null,
        status: 'completed' as const
      };

    try {
      // Enforce DB-like constraints locally before submit/queue
      const missing = getMissingRequiredFields();
      if (missing.length > 0) {
        toast({
          title: 'Missing required fields',
          description: `Please fill: ${missing.join(', ')}`,
          variant: 'destructive',
        });
        return;
      }

      const draftId = (() => { try { return localStorage.getItem('draftId') || undefined; } catch { return undefined; } })();

      // If offline, queue for sync and exit early
      if (!isOnline) {
        const stored = await offlineStorage.getStoredFormData();
        await offlineStorage.addToSyncQueue({
          type: 'CREATE',
          section: 'surveys',
          field: 'survey',
          value: { payload: surveyData, draftLastModified: stored?.lastModified ?? null, draftId },
          maxRetries: 3
        });

        toast({
          title: "Saved Offline",
          description: "Your survey will sync automatically when you're online.",
        });

        // Keep draft saved; do not clear form while offline
        return;
      }

      // Submit to Supabase when online
      const result = await SupabaseService.createSurvey(surveyData);
      
      toast({
        title: "Survey Submitted!",
        description: `Survey ID: ${result.id}`,
      });

      // After online create, sync photos for this draft
      try {
        const currentDraftId = draftId || localStorage.getItem('draftId') || undefined;
        if (currentDraftId && result.id) {
          await syncPhotosForDraft(currentDraftId, result.id);
        }
      } catch (e) {
        console.error('Post-submit photo sync failed:', e);
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
        setFormData({
          // Section 0 - General & Contact
          surveyDate: new Date().toISOString().split('T')[0],
          surveyorName: "",
          customerName: "",
          siteAddress: "",
          postcode: "",
          gridReference: "",
          phone: "",
          email: "",
          secondaryContactName: "",
          secondaryContactPhone: "",
          
          // Section 1 - Electricity Baseline
          annualConsumption: "",
          mpanNumber: "",
          mpanPhoto: [],
          electricityProvider: "",
          networkOperator: "",
          customerPermissionGranted: false,
          daytimeImportRate: "",
          nighttimeImportRate: "",
          standingCharge: "",
          tariffType: "",
          smartMeterPresent: null,
          exportTariffAvailable: null,
          
          // Section 2 - Property Overview
          propertyType: "",
          propertyAge: "",
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
          roofFaces: [{
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
            battenDepth: "",
            membraneType: "",
            membraneCondition: "",
            structuralDefects: "",
            plannedPanelCount: "",
            photos: []
          }],
          
          // Section 4 - Loft / Attic
          loftHatchWidth: "",
          loftHatchHeight: "",
          loftAccessQuality: "",
          loftHeadroom: "",
          roofTimberCondition: "",
          roofTimberPhoto: [],
          wallSpaceInverter: null,
          wallSpaceInverterPhoto: [],
          wallSpaceBattery: null,
          wallSpaceBatteryPhoto: [],
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
          fireEgressCompliance: null,
          fireEgressPhoto: [],
          ambientTempMin: "",
          ambientTempMax: "",
          ipRatingRequired: "",
          
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
          additionalNotes: ""
        });
        
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
      console.error('Failed to submit survey:', err?.message || err, err);
      // Queue for later sync if submission failed while seemingly online
      try {
        const stored = await offlineStorage.getStoredFormData();
        const draftId = (() => { try { return localStorage.getItem('draftId') || undefined; } catch { return undefined; } })();
        await offlineStorage.addToSyncQueue({
          type: 'CREATE',
          section: 'surveys',
          field: 'survey',
          value: { payload: surveyData, draftLastModified: stored?.lastModified ?? null, draftId },
          maxRetries: 3
        });
        toast({
          title: "Saved to Sync Queue",
          description: err?.message ? `Backend error: ${err.message}` : "Will retry automatically when connection stabilizes.",
        });
      } catch (queueError) {
        console.error('Failed to queue survey after submission error:', queueError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load saved data on app start
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await offlineStorage.loadFormData();
        if (savedData) {
          setFormData(savedData);
          toast({
            title: "Draft Loaded",
            description: "Your previous survey data has been restored",
          });
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
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
      severity: "high" as const
    },
    {
      id: "customer-permission",
      section: "Electricity",
      field: "Customer Permission",
      message: "Customer permission needed for DNO contact",
      severity: "high" as const
    },
    {
      id: "roof-condition",
      section: "Roof",
      field: "Roof Condition",
      message: "Roof may require repairs before installation",
      severity: "medium" as const
    }
  ];

  // Track online/offline status
  useEffect(() => {
    // The useOffline hook handles online/offline status automatically
    // No need for manual event listeners
  }, []);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const updateFormData = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: string) => {
    setCurrentSection(currentSection === section ? null : section);
  };

  const calculateProgress = () => {
    const requiredFields = [
      'surveyDate', 'surveyorName', 'customerName', 'siteAddress', 'postcode',
      'gridReference', 'phone', 'email', 'annualConsumption', 'mpanNumber',
      'electricityProvider', 'networkOperator', 'customerPermissionGranted',
      'daytimeImportRate', 'standingCharge', 'tariffType', 'smartMeterPresent',
      'exportTariffAvailable', 'propertyType', 'propertyAge', 'listedBuilding',
      'conservationArea', 'newBuild', 'sharedRoof', 'scaffoldAccess', 'storageArea'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof FormData];
      return value !== "" && value !== null && value !== undefined && value !== false;
    });
    
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      completedSteps: completedFields.length >= 10 ? [1] : []
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
    formData.roofFaces.forEach(face => {
      if (face.plannedPanelCount && face.plannedPanelCount !== "") {
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
    formData.roofFaces.forEach(face => {
      if (face.area && face.area !== "") {
        totalArea += parseFloat(face.area);
      }
    });
    return totalArea.toFixed(2);
  };

  const generateRecommendedActions = () => {
    const actions = [];
    
    // Check for required photos
    if (formData.mpanPhoto.length === 0) {
      actions.push("Upload MPAN photo for verification");
    }
    
    if (!formData.customerPermissionGranted) {
      actions.push("Obtain customer permission for DNO contact");
    }
    
    // Check for asbestos presence
    if (formData.asbestosPresence === "yes") {
      actions.push("Arrange asbestos survey before installation");
    }
    
    // Check for electrical issues
    if (formData.supplyType === "single-phase" && parseFloat(formData.annualConsumption || "0") > 5000) {
      actions.push("Consider three-phase upgrade for high consumption");
    }
    
    // Check for roof condition
    const roofFacesWithIssues = formData.roofFaces.filter(face => 
      face.coveringCondition === "poor" || face.structuralDefects
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

  const handleExport = async (type: 'pdf' | 'csv') => {
    // Mock export functionality - in a real app, this would generate actual files
    console.log(`Exporting ${type} for customer:`, formData.customerName);
    
    if (type === 'pdf') {
      // Mock PDF generation
      const pdfData = {
        customerName: formData.customerName,
        surveyDate: formData.surveyDate,
        totalPvCapacity: calculateTotalPvCapacity(),
        totalRoofArea: calculateTotalRoofArea(),
        flaggedIssues: redFlags.length,
        sections: {
          general: { completed: true, fields: Object.keys(formData).slice(0, 10) },
          electricity: { completed: true, fields: Object.keys(formData).slice(10, 22) },
          property: { completed: true, fields: Object.keys(formData).slice(22, 33) },
          roof: { completed: true, faces: formData.roofFaces.length },
          loft: { completed: true, fields: Object.keys(formData).slice(33, 46) },
          electrical: { completed: true, fields: Object.keys(formData).slice(46, 66) },
          battery: { completed: true, fields: Object.keys(formData).slice(66, 77) },
          safety: { completed: true, fields: Object.keys(formData).slice(77, 84) },
          preferences: { completed: true, fields: Object.keys(formData).slice(84, 93) }
        }
      };
      
      console.log("PDF Data:", pdfData);
      
      // Simulate file download
      const blob = new Blob([JSON.stringify(pdfData, null, 2)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solar-survey-${formData.customerName.replace(/\s+/g, '-')}-${formData.surveyDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } else if (type === 'csv') {
      // Mock CSV generation
      const csvData = [
        ['Field', 'Value', 'Section'],
        ['Customer Name', formData.customerName, 'General'],
        ['Survey Date', formData.surveyDate, 'General'],
        ['Site Address', formData.siteAddress, 'General'],
        ['Postcode', formData.postcode, 'General'],
        ['Annual Consumption', formData.annualConsumption, 'Electricity'],
        ['MPAN Number', formData.mpanNumber, 'Electricity'],
        ['Electricity Provider', formData.electricityProvider, 'Electricity'],
        ['Property Type', formData.propertyType, 'Property'],
        ['Total PV Capacity', calculateTotalPvCapacity(), 'Summary'],
        ['Total Roof Area', calculateTotalRoofArea(), 'Summary'],
        ['Flagged Issues', redFlags.length, 'Summary']
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      // Simulate file download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solar-survey-${formData.customerName.replace(/\s+/g, '-')}-${formData.surveyDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <div className="min-h-screen bg-background font-system mono-background">
      <SurveyHeader
        customerName={formData.customerName}
        currentStep={1}
        totalSteps={6}
        completedSteps={progress.completedSteps}
        isOnline={isOnline}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        offlineIndicator={<OfflineStatusIndicator />}
        autoSaveStatus={saveStatus}
        isSaving={isSaving}
      />

      <Hero />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 pb-40">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section 0 - General & Contact */}
          <SurveySection
            title="📄 Section 0 - General & Contact"
            isOpen={currentSection === "general"}
            onToggle={() => toggleSection("general")}
            completedFields={4}
            totalFields={10}
            flaggedFields={0}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TextInput
                id="survey-date"
                label="📅 Survey Date"
                type="date"
                value={formData.surveyDate}
                onChange={(value) => updateFormData('surveyDate', value)}
                required
              />
              
              <TextInput
                id="surveyor-name"
                label="👷 Surveyor Name"
                value={formData.surveyorName}
                onChange={(value) => updateFormData('surveyorName', value)}
                placeholder="Enter surveyor name..."
                required
              />
              
              <TextInput
                id="customer-name"
                label="👤 Customer Full Name"
                value={formData.customerName}
                onChange={(value) => updateFormData('customerName', value)}
                placeholder="Enter customer's full name..."
                required
                includeLocation
              />
              
              <TextInput
                id="site-address"
                label="🏠 Site Address"
                value={formData.siteAddress}
                onChange={(value) => updateFormData('siteAddress', value)}
                placeholder="Enter full site address..."
                required
              />
              
              <TextInput
                id="postcode"
                label="📮 Postcode"
                value={formData.postcode}
                onChange={(value) => updateFormData('postcode', value)}
                placeholder="Enter postcode..."
                required
              />
              
              <GPSInput
                id="grid-reference"
                label="📍 Grid Reference"
                value={formData.gridReference}
                onChange={(value) => updateFormData('gridReference', value)}
                required
              />
              
              <TextInput
                id="phone"
                label="📞 Phone"
                type="tel"
                value={formData.phone}
                onChange={(value) => updateFormData('phone', value)}
                placeholder="Enter phone number..."
                required
              />
              
              <TextInput
                id="email"
                label="📧 Email"
                type="email"
                value={formData.email}
                onChange={(value) => updateFormData('email', value)}
                placeholder="Enter email address..."
                required
              />
              
              <TextInput
                id="secondary-contact-name"
                label="👤 Secondary Contact Name"
                value={formData.secondaryContactName}
                onChange={(value) => updateFormData('secondaryContactName', value)}
                placeholder="Enter secondary contact name..."
              />
              
              <TextInput
                id="secondary-contact-phone"
                label="📞 Secondary Contact Phone"
                type="tel"
                value={formData.secondaryContactPhone}
                onChange={(value) => updateFormData('secondaryContactPhone', value)}
                placeholder="Enter secondary contact phone..."
              />
            </div>
          </SurveySection>

          {/* Section 1 - Electricity Baseline */}
          <SurveySection
            title="⚡ Section 1 - Electricity Baseline"
            isOpen={currentSection === "electricity"}
            onToggle={() => toggleSection("electricity")}
            completedFields={6}
            totalFields={12}
            flaggedFields={2}
          >
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <NumberInput
                  id="annual-consumption"
                  label="📊 Annual Consumption (kWh)"
                  value={formData.annualConsumption}
                  onChange={(value) => updateFormData('annualConsumption', value)}
                  min={500}
                  max={20000}
                  step={100}
                  unit="kWh"
                  required
                />
                
                <TextInput
                  id="mpan-number"
                  label="🔢 MPAN / Supply Number"
                  value={formData.mpanNumber}
                  onChange={(value) => updateFormData('mpanNumber', value)}
                  placeholder="S1234567890123"
                  required
                  isFlagged
                  flagMessage="Photo required for verification"
                />
                
                <DropdownSelect
                  id="electricity-provider"
                  label="🏢 Current Electricity Provider"
                  value={formData.electricityProvider}
                  onChange={(value) => updateFormData('electricityProvider', value)}
                  options={electricityProviderOptions}
                  placeholder="Select provider..."
                  required
                />
                
                <DropdownSelect
                  id="network-operator"
                  label="⚡ Network Operator"
                  value={formData.networkOperator}
                  onChange={(value) => updateFormData('networkOperator', value)}
                  options={networkOperatorOptions}
                  placeholder="Select DNO..."
                  required
                />
                
                <NumberInput
                  id="daytime-import-rate"
                  label="☀️ Day-time Import Rate"
                  value={formData.daytimeImportRate}
                  onChange={(value) => updateFormData('daytimeImportRate', value)}
                  min={0}
                  max={100}
                  step={0.01}
                  unit="p/kWh"
                  required
                />
                
                <NumberInput
                  id="nighttime-import-rate"
                  label="🌙 Night-time Import Rate"
                  value={formData.nighttimeImportRate}
                  onChange={(value) => updateFormData('nighttimeImportRate', value)}
                  min={0}
                  max={100}
                  step={0.01}
                  unit="p/kWh"
                />
                
                <NumberInput
                  id="standing-charge"
                  label="💰 Standing Charge"
                  value={formData.standingCharge}
                  onChange={(value) => updateFormData('standingCharge', value)}
                  min={0}
                  max={10}
                  step={0.01}
                  unit="£/day"
                  required
                />
                
                <DropdownSelect
                  id="tariff-type"
                  label="📋 Current Tariff Type"
                  value={formData.tariffType}
                  onChange={(value) => updateFormData('tariffType', value)}
                  options={tariffTypeOptions}
                  placeholder="Select tariff type..."
                  required
                />
                
                <SegmentedControl
                  id="smart-meter-present"
                  label="📱 Smart Meter Present"
                  value={formData.smartMeterPresent}
                  onChange={(value) => updateFormData('smartMeterPresent', value)}
                  required
                />
                
                <SegmentedControl
                  id="export-tariff-available"
                  label="📤 Export Tariff Available"
                  value={formData.exportTariffAvailable}
                  onChange={(value) => updateFormData('exportTariffAvailable', value)}
                  required
                />
              </div>
              
              <PhotoUpload
                id="mpan-photo"
                label="📸 MPAN Number Photo"
                photos={formData.mpanPhoto}
                onChange={(photos) => updateFormData('mpanPhoto', photos)}
                maxPhotos={2}
              />
              
              <SignatureInput
                id="customer-permission"
                customerName={formData.customerName}
                onCustomerNameChange={(name) => updateFormData('customerName', name)}
                onPermissionGranted={(granted) => updateFormData('customerPermissionGranted', granted)}
                permissionGranted={formData.customerPermissionGranted}
                required
                isFlagged
                flagMessage="Customer permission required"
              />
            </div>
          </SurveySection>

          {/* Section 2 - Property Overview */}
          <SurveySection
            title="🏠 Section 2 - Property Overview"
            isOpen={currentSection === "property"}
            onToggle={() => toggleSection("property")}
            completedFields={5}
            totalFields={11}
            flaggedFields={0}
          >
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DropdownSelect
                  id="property-type"
                  label="🏠 Property Type"
                  value={formData.propertyType}
                  onChange={(value) => updateFormData('propertyType', value)}
                  options={propertyTypeOptions}
                  placeholder="Select property type..."
                  required
                />
                
                <DropdownSelect
                  id="property-age"
                  label="📅 Property Age"
                  value={formData.propertyAge}
                  onChange={(value) => updateFormData('propertyAge', value)}
                  options={propertyAgeOptions}
                  placeholder="Select age range..."
                  required
                />
                
                <SegmentedControl
                  id="listed-building"
                  label="🏛️ Listed Building"
                  value={formData.listedBuilding}
                  onChange={(value) => updateFormData('listedBuilding', value)}
                  required
                />
              
              <SegmentedControl
                  id="conservation-area"
                  label="🌳 Conservation Area"
                  value={formData.conservationArea}
                  onChange={(value) => updateFormData('conservationArea', value)}
                required
              />
                
                <SegmentedControl
                  id="new-build"
                  label="🏗️ New-Build or Under Construction"
                  value={formData.newBuild}
                  onChange={(value) => updateFormData('newBuild', value)}
                  required
                />
                
                <SegmentedControl
                  id="shared-roof"
                  label="🏠 Shared Roof / Party Wall"
                  value={formData.sharedRoof}
                  onChange={(value) => updateFormData('sharedRoof', value)}
                  required
                />
                
                <SegmentedControl
                  id="scaffold-access"
                  label="🪜 Clear, Safe Access for Scaffold"
                  value={formData.scaffoldAccess}
                  onChange={(value) => updateFormData('scaffoldAccess', value)}
                  required
                />
                
                <SegmentedControl
                  id="storage-area"
                  label="📦 Suitable Storage Area for Panels & Battery"
                  value={formData.storageArea}
                  onChange={(value) => updateFormData('storageArea', value)}
                  required
                />
              </div>
              
              <PhotoUpload
                id="scaffold-access-photo"
                label="📸 Scaffold Access Photos"
                photos={formData.scaffoldAccessPhoto}
                onChange={(photos) => updateFormData('scaffoldAccessPhoto', photos)}
                maxPhotos={3}
              />
              
              <PhotoUpload
                id="storage-area-photo"
                label="📸 Storage Area Photos"
                photos={formData.storageAreaPhoto}
                onChange={(photos) => updateFormData('storageAreaPhoto', photos)}
                maxPhotos={3}
              />
              
              <TextareaInput
                id="restricted-parking"
                label="🚗 Restricted Parking / Narrow Lane"
                value={formData.restrictedParking}
                onChange={(value) => updateFormData('restrictedParking', value)}
                placeholder="Describe any parking or access restrictions..."
                rows={3}
              />
            </div>
          </SurveySection>

          {/* Section 3 - Roof Inspection */}
          <SurveySection
            title="🏠 Section 3 - Roof Inspection"
            isOpen={currentSection === "roof"}
            onToggle={() => toggleSection("roof")}
            completedFields={3}
            totalFields={18}
            flaggedFields={1}
          >
            <RoofSection
              roofFaces={formData.roofFaces}
              onRoofFacesChange={(faces) => updateFormData('roofFaces', faces)}
            />
          </SurveySection>

          {/* Section 4 - Loft / Attic */}
          <SurveySection
            title="🏠 Section 4 - Loft / Attic"
            isOpen={currentSection === "loft"}
            onToggle={() => toggleSection("loft")}
            completedFields={2}
            totalFields={9}
            flaggedFields={0}
          >
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <NumberInput
                  id="loft-hatch-width"
                  label="📏 Loft Access Hatch Width"
                  value={formData.loftHatchWidth}
                  onChange={(value) => updateFormData('loftHatchWidth', value)}
                  min={0}
                  max={200}
                  step={1}
                  unit="cm"
                  required
                />
                
                <NumberInput
                  id="loft-hatch-height"
                  label="📏 Loft Access Hatch Height"
                  value={formData.loftHatchHeight}
                  onChange={(value) => updateFormData('loftHatchHeight', value)}
                  min={0}
                  max={200}
                  step={1}
                  unit="cm"
                  required
                />
                
                <DropdownSelect
                  id="loft-access-quality"
                  label="🚪 Loft Access Quality"
                  value={formData.loftAccessQuality}
                  onChange={(value) => updateFormData('loftAccessQuality', value)}
                  options={loftAccessQualityOptions}
                  placeholder="Select access quality..."
                  required
                />
                
                <NumberInput
                  id="loft-headroom"
                  label="📏 Loft Headroom"
                  value={formData.loftHeadroom}
                  onChange={(value) => updateFormData('loftHeadroom', value)}
                  min={0}
                  max={10}
                  step={0.1}
                  unit="m"
                  required
                />
                
                <DropdownSelect
                  id="roof-timber-condition"
                  label="🪵 Roof Timber Condition"
                  value={formData.roofTimberCondition}
                  onChange={(value) => updateFormData('roofTimberCondition', value)}
                  options={roofTimberConditionOptions}
                  placeholder="Select timber condition..."
                  required
                />
                
              <SegmentedControl
                  id="wall-space-inverter"
                  label="⚡ Wall Space for Inverter (500×400×200 mm)"
                  value={formData.wallSpaceInverter}
                  onChange={(value) => updateFormData('wallSpaceInverter', value)}
                  required
                />
                
                <SegmentedControl
                  id="wall-space-battery"
                  label="🔋 Wall Space for Battery"
                  value={formData.wallSpaceBattery}
                  onChange={(value) => updateFormData('wallSpaceBattery', value)}
                  required
                />
                
                <NumberInput
                  id="loft-insulation-thickness"
                  label="🧱 Loft Insulation Thickness"
                  value={formData.loftInsulationThickness}
                  onChange={(value) => updateFormData('loftInsulationThickness', value)}
                  min={0}
                  max={500}
                  step={10}
                  unit="mm"
                required
              />
              
              <DropdownSelect
                  id="loft-lighting"
                  label="💡 Existing Loft Lighting"
                  value={formData.loftLighting}
                  onChange={(value) => updateFormData('loftLighting', value)}
                  options={loftLightingOptions}
                  placeholder="Select lighting type..."
                required
              />
                
                <SegmentedControl
                  id="loft-power-socket"
                  label="🔌 Existing Loft Power Socket"
                  value={formData.loftPowerSocket}
                  onChange={(value) => updateFormData('loftPowerSocket', value)}
                  required
                />
              </div>
              
              <PhotoUpload
                id="roof-timber-photo"
                label="📸 Roof Timber Condition Photos"
                photos={formData.roofTimberPhoto}
                onChange={(photos) => updateFormData('roofTimberPhoto', photos)}
                maxPhotos={3}
              />
              
              <PhotoUpload
                id="wall-space-inverter-photo"
                label="📸 Wall Space for Inverter Photos"
                photos={formData.wallSpaceInverterPhoto}
                onChange={(photos) => updateFormData('wallSpaceInverterPhoto', photos)}
                maxPhotos={2}
              />
              
              <PhotoUpload
                id="wall-space-battery-photo"
                label="📸 Wall Space for Battery Photos"
                photos={formData.wallSpaceBatteryPhoto}
                onChange={(photos) => updateFormData('wallSpaceBatteryPhoto', photos)}
                maxPhotos={2}
              />
            </div>
          </SurveySection>

          {/* Section 5 - Electrical Supply */}
          <SurveySection
            title="⚡ Section 5 - Electrical Supply"
            isOpen={currentSection === "electrical"}
            onToggle={() => toggleSection("electrical")}
            completedFields={3}
            totalFields={13}
            flaggedFields={0}
          >
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DropdownSelect
                  id="supply-type"
                  label="⚡ Supply Type"
                  value={formData.supplyType}
                  onChange={(value) => updateFormData('supplyType', value)}
                  options={supplyTypeOptions}
                  placeholder="Select supply type..."
                  required
                />
                
                <DropdownSelect
                  id="main-fuse-rating"
                  label="🔌 Main Fuse Rating (A)"
                  value={formData.mainFuseRating}
                  onChange={(value) => updateFormData('mainFuseRating', value)}
                  options={mainFuseRatingOptions}
                  placeholder="Select fuse rating..."
                  required
                />
                
                <TextInput
                  id="consumer-unit-make"
                  label="🏭 Consumer Unit Make & Model"
                  value={formData.consumerUnitMake}
                  onChange={(value) => updateFormData('consumerUnitMake', value)}
                  placeholder="e.g., Wylex, Hager, etc."
                  required
                />
                
                <TextInput
                  id="consumer-unit-location"
                  label="📍 Consumer Unit Location"
                  value={formData.consumerUnitLocation}
                  onChange={(value) => updateFormData('consumerUnitLocation', value)}
                  placeholder="e.g., Garage, Utility room, etc."
                  required
                />
                
                <NumberInput
                  id="spare-fuse-ways"
                  label="🔧 Spare Fuse-ways Available"
                  value={formData.spareFuseWays}
                  onChange={(value) => updateFormData('spareFuseWays', value)}
                  min={0}
                  max={20}
                  step={1}
                required
              />
              
              <SegmentedControl
                  id="existing-surge-protection"
                  label="🛡️ Existing Surge Protection"
                  value={formData.existingSurgeProtection}
                  onChange={(value) => updateFormData('existingSurgeProtection', value)}
                required
                />
                
                <SegmentedControl
                  id="earth-bonding-verified"
                  label="🔗 Earth Bonding Verified"
                  value={formData.earthBondingVerified}
                  onChange={(value) => updateFormData('earthBondingVerified', value)}
                  required
                />
                
                <DropdownSelect
                  id="earthing-system-type"
                  label="⚡ Earthing System Type"
                  value={formData.earthingSystemType}
                  onChange={(value) => updateFormData('earthingSystemType', value)}
                  options={earthingSystemOptions}
                  placeholder="Select earthing system..."
                  required
                />
                
                <ToggleInput
                  id="dno-notification-required"
                  label="📋 DNO Notification Required"
                  value={formData.dnoNotificationRequired}
                  onChange={(value) => updateFormData('dnoNotificationRequired', value)}
                  readOnly
                  description="Auto-calculated based on inverter size"
                />
                
                <SegmentedControl
                  id="ev-charger-installed"
                  label="🚗 EV Charger Already Installed"
                  value={formData.evChargerInstalled}
                  onChange={(value) => updateFormData('evChargerInstalled', value)}
                  required
                />
                
                {formData.evChargerInstalled === "yes" && (
                  <NumberInput
                    id="ev-charger-load"
                    label="⚡ EV Charger Load (kW)"
                    value={formData.evChargerLoad}
                    onChange={(value) => updateFormData('evChargerLoad', value)}
                    min={0}
                    max={50}
                    step={0.1}
                    unit="kW"
                    required
                  />
                )}
              </div>
              
              <PhotoUpload
                id="main-fuse-photo"
                label="📸 Main Fuse Rating Photo"
                photos={formData.mainFusePhoto}
                onChange={(photos) => updateFormData('mainFusePhoto', photos)}
                maxPhotos={2}
              />
              
              <PhotoUpload
                id="consumer-unit-location-photo"
                label="📸 Consumer Unit Location Photo"
                photos={formData.consumerUnitLocationPhoto}
                onChange={(photos) => updateFormData('consumerUnitLocationPhoto', photos)}
                maxPhotos={3}
              />
              
              <PhotoUpload
                id="spare-fuse-ways-photo"
                label="📸 Spare Fuse-ways Photo"
                photos={formData.spareFuseWaysPhoto}
                onChange={(photos) => updateFormData('spareFuseWaysPhoto', photos)}
                maxPhotos={2}
              />
              
              <PhotoUpload
                id="existing-surge-protection-photo"
                label="📸 Existing Surge Protection Photo"
                photos={formData.existingSurgeProtectionPhoto}
                onChange={(photos) => updateFormData('existingSurgeProtectionPhoto', photos)}
                maxPhotos={2}
              />
              
              <PhotoUpload
                id="earth-bonding-photo"
                label="📸 Earth Bonding Photo"
                photos={formData.earthBondingPhoto}
                onChange={(photos) => updateFormData('earthBondingPhoto', photos)}
                maxPhotos={2}
              />
              
              <PhotoUpload
                id="earthing-system-photo"
                label="📸 Earthing System Photo"
                photos={formData.earthingSystemPhoto}
                onChange={(photos) => updateFormData('earthingSystemPhoto', photos)}
                maxPhotos={2}
              />
              
              <PhotoUpload
                id="cable-route-to-roof"
                label="📸 Cable Route from CU to Roof (with arrows)"
                photos={formData.cableRouteToRoof}
                onChange={(photos) => updateFormData('cableRouteToRoof', photos)}
                maxPhotos={5}
              />
              
              <PhotoUpload
                id="cable-route-to-battery"
                label="📸 Cable Route from CU to Battery (with arrows)"
                photos={formData.cableRouteToBattery}
                onChange={(photos) => updateFormData('cableRouteToBattery', photos)}
                maxPhotos={5}
              />
            </div>
          </SurveySection>

          {/* Section 6 - Battery & Storage Preferences */}
          <SurveySection
            title="🔋 Section 6 - Battery & Storage Preferences"
            isOpen={currentSection === "battery"}
            onToggle={() => toggleSection("battery")}
            completedFields={2}
            totalFields={11}
            flaggedFields={0}
          >
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DropdownSelect
                  id="battery-required"
                  label="🔋 Battery Required"
                  value={formData.batteryRequired}
                  onChange={(value) => updateFormData('batteryRequired', value)}
                  options={batteryRequiredOptions}
                  placeholder="Select battery preference..."
                  required
                />
                
                <DropdownSelect
                  id="preferred-install-location"
                  label="📍 Preferred Install Location"
                  value={formData.preferredInstallLocation}
                  onChange={(value) => updateFormData('preferredInstallLocation', value)}
                  options={installLocationOptions}
                  placeholder="Select location..."
                  required
                />
                
                <NumberInput
                  id="distance-from-cu"
                  label="📏 Distance from CU to Battery"
                  value={formData.distanceFromCU}
                  onChange={(value) => updateFormData('distanceFromCU', value)}
                  min={0}
                  max={100}
                  step={0.1}
                  unit="m"
                  required
                />
                
                <DropdownSelect
                  id="mounting-surface"
                  label="🏗️ Mounting Surface"
                  value={formData.mountingSurface}
                  onChange={(value) => updateFormData('mountingSurface', value)}
                  options={mountingSurfaceOptions}
                  placeholder="Select surface type..."
                  required
                />
                
                <SegmentedControl
                  id="ventilation-adequate"
                  label="💨 Ventilation Adequate"
                  value={formData.ventilationAdequate}
                  onChange={(value) => updateFormData('ventilationAdequate', value)}
                  required
                />
                
                <SegmentedControl
                  id="fire-egress-compliance"
                  label="🚪 Fire Egress Compliance"
                  value={formData.fireEgressCompliance}
                  onChange={(value) => updateFormData('fireEgressCompliance', value)}
                  required
                />
                
                <TemperatureRangeInput
                  id="ambient-temperature"
                  label="🌡️ Ambient Temperature Range"
                  minTemp={formData.ambientTempMin}
                  maxTemp={formData.ambientTempMax}
                  onMinTempChange={(value) => updateFormData('ambientTempMin', value)}
                  onMaxTempChange={(value) => updateFormData('ambientTempMax', value)}
                  required
                />
                
                <DropdownSelect
                  id="ip-rating-required"
                  label="🛡️ IP Rating Required"
                  value={formData.ipRatingRequired}
                  onChange={(value) => updateFormData('ipRatingRequired', value)}
                  options={ipRatingOptions}
                  placeholder="Select IP rating..."
                  required
                />
              </div>
              
              <PhotoUpload
                id="ventilation-photo"
                label="📸 Ventilation Photos"
                photos={formData.ventilationPhoto}
                onChange={(photos) => updateFormData('ventilationPhoto', photos)}
                maxPhotos={3}
              />
              
              <PhotoUpload
                id="fire-egress-photo"
                label="📸 Fire Egress Compliance Photos"
                photos={formData.fireEgressPhoto}
                onChange={(photos) => updateFormData('fireEgressPhoto', photos)}
                maxPhotos={3}
              />
            </div>
          </SurveySection>

          {/* Section 7 - Health, Safety & Hazards */}
          <SurveySection
            title="⚠️ Section 7 - Health, Safety & Hazards"
            isOpen={currentSection === "safety"}
            onToggle={() => toggleSection("safety")}
            completedFields={2}
            totalFields={7}
            flaggedFields={0}
          >
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DropdownSelect
                  id="asbestos-presence"
                  label="⚠️ Asbestos Presence"
                  value={formData.asbestosPresence}
                  onChange={(value) => updateFormData('asbestosPresence', value)}
                  options={asbestosPresenceOptions}
                  placeholder="Select asbestos status..."
                  required
                />
                
              <SegmentedControl
                  id="livestock-pets-on-site"
                  label="🐕 Livestock / Pets on Site"
                  value={formData.livestockPetsOnSite}
                  onChange={(value) => updateFormData('livestockPetsOnSite', value)}
                required
                />
              </div>
              
              <TextareaInput
                id="working-at-height-difficulties"
                label="🪜 Working at Height Difficulties"
                value={formData.workingAtHeightDifficulties}
                onChange={(value) => updateFormData('workingAtHeightDifficulties', value)}
                placeholder="Describe any difficulties or special considerations..."
                rows={3}
              />
              
              <PhotoUpload
                id="fragile-roof-areas"
                label="📸 Fragile Roof Areas (with annotations)"
                photos={formData.fragileRoofAreas}
                onChange={(photos) => updateFormData('fragileRoofAreas', photos)}
                maxPhotos={5}
              />
              
              {formData.livestockPetsOnSite === "yes" && (
                <TextInput
                  id="livestock-pets-notes"
                  label="📝 Livestock / Pets Notes"
                  value={formData.livestockPetsNotes}
                  onChange={(value) => updateFormData('livestockPetsNotes', value)}
                  placeholder="Describe pets/livestock and any special considerations..."
                />
              )}
              
              <TextareaInput
                id="special-access-instructions"
                label="🚪 Special Access Instructions"
                value={formData.specialAccessInstructions}
                onChange={(value) => updateFormData('specialAccessInstructions', value)}
                placeholder="Any special access requirements or instructions..."
                rows={3}
              />
              
              <PhotoUpload
                id="asbestos-photo"
                label="📸 Asbestos Assessment Photos"
                photos={formData.asbestosPhoto}
                onChange={(photos) => updateFormData('asbestosPhoto', photos)}
                maxPhotos={3}
              />
            </div>
          </SurveySection>

          {/* Section 8 - Customer Preferences & Next Steps */}
          <SurveySection
            title="👤 Section 8 - Customer Preferences & Next Steps"
            isOpen={currentSection === "preferences"}
            onToggle={() => toggleSection("preferences")}
            completedFields={2}
            totalFields={9}
            flaggedFields={0}
          >
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DropdownSelect
                  id="preferred-contact-method"
                  label="📞 Preferred Contact Method"
                  value={formData.preferredContactMethod}
                  onChange={(value) => updateFormData('preferredContactMethod', value)}
                  options={contactMethodOptions}
                  placeholder="Select contact method..."
                  required
                />
                
                <DateRangeInput
                  id="installation-month"
                  label="📅 Preferred Installation Month"
                  startDate={formData.installationStartDate}
                  endDate={formData.installationEndDate}
                  onStartDateChange={(value) => updateFormData('installationStartDate', value)}
                  onEndDateChange={(value) => updateFormData('installationEndDate', value)}
                  customerAway={formData.customerAway}
                  onCustomerAwayChange={(value) => updateFormData('customerAway', value)}
                  awayNotes={formData.customerAwayNotes}
                  onAwayNotesChange={(value) => updateFormData('customerAwayNotes', value)}
                />
                
                <DropdownSelect
                  id="budget-range"
                  label="💰 Budget Range"
                  value={formData.budgetRange}
                  onChange={(value) => updateFormData('budgetRange', value)}
                  options={budgetRangeOptions}
                  placeholder="Select budget range..."
                  required
                />
                
                <SegmentedControl
                  id="interested-in-ev-charger"
                  label="🚗 Interested in EV Charger"
                  value={formData.interestedInEvCharger}
                  onChange={(value) => updateFormData('interestedInEvCharger', value)}
                  required
                />
                
                <SegmentedControl
                  id="interested-in-energy-monitoring"
                  label="📊 Interested in Energy Monitoring"
                  value={formData.interestedInEnergyMonitoring}
                  onChange={(value) => updateFormData('interestedInEnergyMonitoring', value)}
                  required
                />
              </div>
              
              <TextareaInput
                id="additional-notes"
                label="📝 Additional Notes"
                value={formData.additionalNotes}
                onChange={(value) => updateFormData('additionalNotes', value)}
                placeholder="Any additional notes, preferences, or special requirements..."
                rows={4}
              />
            </div>
          </SurveySection>

          {/* Section 9 - Auto-Generated Summary */}
          <SurveySection
            title="📊 Section 9 - Auto-Generated Summary"
            isOpen={currentSection === "summary"}
            onToggle={() => toggleSection("summary")}
            completedFields={0}
            totalFields={5}
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
              />
              
              <div className="flex justify-center pt-6 border-t">
                <ExportButtons
                  formData={formData}
                  onExport={handleExport}
                />
              </div>
              
              {/* Submit Survey Button */}
              <div className="flex justify-center pt-6 border-t">
                <SubmitSurveyButton 
                  formData={formData}
                  onSubmit={handleSubmitSurvey}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </SurveySection>
        </div>
      </main>

      {/* Red Flags Summary */}
      <RedFlagsSummary 
        flags={redFlags}
        onJumpToField={jumpToField}
      />

      {/* Sticky Submit Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground truncate">
            {isOnline ? "Online: submitting directly to backend" : "Offline: submit to save locally and sync later"}
          </div>
          <div className="flex gap-2">
            {pendingSync > 0 && (
              <Button 
                variant="outline" 
                size="sm"
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
                      console.error('Failed to clear sync queue:', error);
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
            <Button onClick={handleSubmitSurvey} disabled={isSubmitting} className="min-w-[160px]">
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;