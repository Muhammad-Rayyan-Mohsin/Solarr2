// Survey Service - Integration with Supabase Backend
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jmjvcvahzmmugonhyiuo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptanZjdmFoem1tdWdvbmh5aXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjgxNjQsImV4cCI6MjA3NDQwNDE2NH0.dmmFhiAImi4ZtpOVRiTaeaHUHsQIm9z7kqU8YbOqdVE'
const supabase = createClient(supabaseUrl, supabaseKey)

export interface SurveyFormData {
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
  segTariffAvailable: "yes" | "no" | "na" | null;
  segTariffExplanation: string;
  smartTariffAvailable: "yes" | "no" | "na" | null;
  customerSignature: string;

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
  roofFaces: Array<{
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
  }>;

  // Section 4 - Loft / Attic
  loftHatchWidth: string;
  loftHatchHeight: string;
  loftAccessType: string;
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

export interface SurveyListItem {
  id: string;
  created_at: string;
  survey_date: string;
  status: string;
  customer_name: string;
  site_address: string;
  postcode: string;
  mpan_number?: string;
}

export class SurveyService {
  /**
   * Save a complete survey using the RPC function
   */
  static async saveSurvey(formData: SurveyFormData): Promise<string> {
    const { data: surveyId, error } = await supabase
      .rpc('create_full_survey', { payload: formData })
    
    if (error) {
      throw new Error(`Failed to save survey: ${error.message}`)
    }
    
    return surveyId
  }

  /**
   * Upload a file to storage and create an asset record
   */
  static async uploadAsset(
    surveyId: string,
    file: File,
    section: string,
    field: string,
    kind: 'photo' | 'signature' | 'voice',
    roofFaceId?: string
  ): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `surveys/${(await supabase.auth.getUser()).data.user?.id}/${surveyId}/assets/${section}/${field}/${fileName}`
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('surveys')
      .upload(filePath, file)
    
    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`)
    }
    
    // Create asset record
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .insert({
        survey_id: surveyId,
        roof_face_id: roofFaceId,
        section,
        field,
        kind,
        storage_object_path: filePath,
        mime_type: file.type,
        byte_size: file.size
      })
      .select()
      .single()
    
    if (assetError) {
      throw new Error(`Failed to create asset record: ${assetError.message}`)
    }
    
    return asset.id
  }

  /**
   * Get a signed URL for an asset
   */
  static async getAssetUrl(assetId: string, expiresIn: number = 3600): Promise<string> {
    const { data: asset, error: fetchError } = await supabase
      .from('assets')
      .select('storage_object_path')
      .eq('id', assetId)
      .single()
    
    if (fetchError) {
      throw new Error(`Failed to fetch asset: ${fetchError.message}`)
    }
    
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('surveys')
      .createSignedUrl(asset.storage_object_path, expiresIn)
    
    if (urlError) {
      throw new Error(`Failed to create signed URL: ${urlError.message}`)
    }
    
    return signedUrl.signedUrl
  }

  /**
   * Generate PDF for a survey
   */
  static async generatePDF(surveyId: string): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No active session')
    }
    
    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-survey-pdf?survey_id=${surveyId}`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`PDF generation failed: ${error}`)
    }
    
    const data = await response.json()
    return data.pdf_url
  }

  /**
   * Get list of surveys for the current user
   */
  static async getSurveys(limit: number = 50, offset: number = 0): Promise<SurveyListItem[]> {
    const { data, error } = await supabase
      .from('surveys_list')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      throw new Error(`Failed to fetch surveys: ${error.message}`)
    }
    
    return data || []
  }

  /**
   * Search surveys by text
   */
  static async searchSurveys(query: string): Promise<SurveyListItem[]> {
    const { data, error } = await supabase
      .from('surveys')
      .select(`
        id, created_at, survey_date, status, customer_name, site_address, postcode,
        electricity_baseline!inner(mpan_number)
      `)
      .textSearch('customer_name,site_address,postcode', query)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      throw new Error(`Failed to search surveys: ${error.message}`)
    }
    
    return data?.map(survey => ({
      id: survey.id,
      created_at: survey.created_at,
      survey_date: survey.survey_date,
      status: survey.status,
      customer_name: survey.customer_name,
      site_address: survey.site_address,
      postcode: survey.postcode,
      mpan_number: survey.electricity_baseline?.[0]?.mpan_number
    })) || []
  }

  /**
   * Get complete survey data by ID
   */
  static async getSurvey(surveyId: string): Promise<any> {
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single()
    
    if (surveyError) {
      throw new Error(`Failed to fetch survey: ${surveyError.message}`)
    }
    
    // Fetch all related data
    const [
      { data: electricity },
      { data: property },
      { data: roofFaces },
      { data: loft },
      { data: electrical },
      { data: battery },
      { data: health },
      { data: customer },
      { data: assets }
    ] = await Promise.all([
      supabase.from('electricity_baseline').select('*').eq('survey_id', surveyId).maybeSingle(),
      supabase.from('property_overview').select('*').eq('survey_id', surveyId).maybeSingle(),
      supabase.from('roof_faces').select('*').eq('survey_id', surveyId),
      supabase.from('loft_attic').select('*').eq('survey_id', surveyId).maybeSingle(),
      supabase.from('electrical_supply').select('*').eq('survey_id', surveyId).maybeSingle(),
      supabase.from('battery_storage').select('*').eq('survey_id', surveyId).maybeSingle(),
      supabase.from('health_safety').select('*').eq('survey_id', surveyId).maybeSingle(),
      supabase.from('customer_preferences').select('*').eq('survey_id', surveyId).maybeSingle(),
      supabase.from('assets').select('*').eq('survey_id', surveyId)
    ])
    
    return {
      ...survey,
      electricity_baseline: electricity,
      property_overview: property,
      roof_faces: roofFaces,
      loft_attic: loft,
      electrical_supply: electrical,
      battery_storage: battery,
      health_safety: health,
      customer_preferences: customer,
      assets: assets
    }
  }

  /**
   * Update survey status
   */
  static async updateSurveyStatus(surveyId: string, status: 'draft' | 'submitted' | 'completed'): Promise<void> {
    const { error } = await supabase
      .from('surveys')
      .update({ status })
      .eq('id', surveyId)
    
    if (error) {
      throw new Error(`Failed to update survey status: ${error.message}`)
    }
  }
}
