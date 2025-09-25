// Test script to verify the backend is working
// Run this in your browser console or as a Node.js script

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jmjvcvahzmmugonhyiuo.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptanZjdmFoem1tdWdvbmh5aXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjgxNjQsImV4cCI6MjA3NDQwNDE2NH0.dmmFhiAImi4ZtpOVRiTaeaHUHsQIm9z7kqU8YbOqdVE'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptanZjdmFoem1tdWdvbmh5aXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODgyODE2NCwiZXhwIjoyMDc0NDA0MTY0fQ.IYU-aWDv4vBkJmN_Ei4FERi5_ia2VX1QCiCCSJKCHzc'

// Admin client (bypasses RLS) – used only to create a test user
const admin = createClient(supabaseUrl, serviceRoleKey)
// User client (subject to RLS)
const client = createClient(supabaseUrl, anonKey)

// Test data matching your FormData interface
const testSurveyData = {
  surveyDate: new Date().toISOString(),
  surveyorInfo: {
    name: "Test Surveyor",
    telephone: "01234567890",
    email: "test@example.com"
  },
  customerName: "John Doe",
  siteAddress: "123 Test Street, Test City",
  postcode: "TE1 1ST",
  gridReference: "TQ123456",
  what3words: "test.words.here",
  phone: "09876543210",
  email: "customer@example.com",
  secondaryContactName: "Jane Doe",
  secondaryContactPhone: "09876543211",
  
  // Section 1 - Electricity Baseline
  annualConsumption: "4000",
  mpanNumber: "1234567890123",
  electricityProvider: "british-gas",
  networkOperator: "ukpn",
  customerPermissionGranted: true,
  daytimeImportRate: "0.25",
  nighttimeImportRate: "0.15",
  standingCharge: "0.45",
  tariffType: "fixed",
  smartMeterPresent: "yes",
  segTariffAvailable: "yes",
  segTariffExplanation: "Customer interested in export",
  smartTariffAvailable: "no",
  
  // Section 2 - Property Overview
  propertyType: "detached",
  propertyAge: "1980-2000",
  listedBuilding: "no",
  conservationArea: "no",
  newBuild: "no",
  sharedRoof: "no",
  scaffoldAccess: "yes",
  storageArea: "yes",
  restrictedParking: "None",
  
  // Section 3 - Roof Inspection
  roofFaces: [{
    id: "roof-1",
    label: "Main Roof",
    orientation: 180,
    pitch: 35,
    width: "8.5",
    length: "12.0",
    area: "102",
    covering: "tiles",
    coveringCondition: "good",
    obstructions: ["chimney", "vent"],
    shading: ["tree-morning"],
    gutterHeight: "2.5",
    rafterSpacing: "600",
    rafterDepth: "150",
    battenDepth: "25",
    membraneType: "breathable",
    membraneCondition: "good",
    structuralDefects: "None",
    plannedPanelCount: "12",
    photos: []
  }],
  
  // Section 4 - Loft / Attic
  loftHatchWidth: "0.6",
  loftHatchHeight: "0.5",
  loftAccessType: "easy",
  loftHeadroom: "2.1",
  loftBoardsInPlace: "yes",
  roofTimberCondition: "good",
  roofTimberPhoto: [],
  roofTimberNotes: "All timbers in good condition",
  wallSpaceInverter: "yes",
  wallSpaceInverterPhoto: [],
  wallSpaceInverterNotes: "Space available near consumer unit",
  wallSpaceBattery: "no",
  wallSpaceBatteryPhoto: [],
  wallSpaceBatteryNotes: "No suitable wall space",
  loftInsulationThickness: "300",
  loftLighting: "LED",
  loftPowerSocket: "yes",
  
  // Section 5 - Electrical Supply
  supplyType: "single-phase",
  mainFuseRating: "100A",
  mainFusePhoto: [],
  consumerUnitMake: "Hager",
  consumerUnitLocation: "Garage",
  consumerUnitLocationPhoto: [],
  spareFuseWays: "4",
  spareFuseWaysPhoto: [],
  existingSurgeProtection: "no",
  existingSurgeProtectionPhoto: [],
  earthBondingVerified: "yes",
  earthBondingPhoto: [],
  earthingSystemType: "TN-S",
  earthingSystemPhoto: [],
  cableRouteToRoof: ["Through loft", "External conduit"],
  cableRouteToBattery: ["Through garage wall"],
  dnoNotificationRequired: true,
  evChargerInstalled: "no",
  evChargerLoad: "7.4",
  
  // Section 6 - Battery & Storage Preferences
  batteryRequired: "yes",
  preferredInstallLocation: "garage",
  distanceFromCU: "2.5",
  mountingSurface: "wall",
  ventilationAdequate: "yes",
  ventilationPhoto: [],
  fireEgressCompliance: "yes",
  fireEgressPhoto: [],
  ambientTempMin: "5",
  ambientTempMax: "35",
  ipRatingRequired: "IP65",
  
  // Section 7 - Health, Safety & Hazards
  asbestosPresence: "no",
  asbestosPhoto: [],
  workingAtHeightDifficulties: "None",
  fragileRoofAreas: [],
  livestockPetsOnSite: "no",
  livestockPetsNotes: "No pets",
  specialAccessInstructions: "Standard access",
  
  // Section 8 - Customer Preferences & Next Steps
  preferredContactMethod: "email",
  installationStartDate: "2024-02-01",
  installationEndDate: "2024-02-15",
  customerAway: false,
  customerAwayNotes: "",
  budgetRange: "8k-12k",
  interestedInEvCharger: "yes",
  interestedInEnergyMonitoring: "yes",
  additionalNotes: "Customer very interested in battery storage"
}

async function ensureTestUser() {
  const random = Math.random().toString(36).slice(2, 8)
  const email = `survey.tester+${random}@example.com`
  const password = 'Test1234!'

  // Create confirmed user via admin
  const { data: created, error: createUserErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createUserErr) {
    console.warn('Note: createUser returned error (may already exist):', createUserErr.message)
  } else {
    console.log('Created test user:', created.user?.id)
  }

  // Sign in with anon client to get a session (RLS context)
  const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({ email, password })
  if (signInErr) throw signInErr
  console.log('Signed in as:', signInData.user?.id)
  return { email, password, userId: signInData.user?.id }
}

async function testBackend() {
  try {
    console.log('Testing backend...')

    // 0. Ensure DB connection (simple query with anon client)
    const { error: connErr } = await client.from('surveys').select('id', { count: 'exact', head: true })
    if (connErr) throw new Error('DB connection failed: ' + connErr.message)
    console.log('✅ DB connection OK')

    // 1. Ensure we have an authenticated user (required for RLS + auth.uid())
    const { userId } = await ensureTestUser()
    
    // 2: Create survey using RPC function
    console.log('1. Creating survey...')
    const { data: surveyId, error: createError } = await client
      .rpc('create_full_survey', { payload: testSurveyData })
    
    if (createError) {
      console.error('Create error:', createError)
      return
    }
    
    console.log('✅ Survey created with ID:', surveyId)
    
    // 3: Verify survey was created
    console.log('2. Verifying survey...')
    const { data: survey, error: fetchError } = await client
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single()
    
    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return
    }
    
    console.log('✅ Survey fetched:', survey.customer_name)
    
    // 4: Check related tables
    console.log('3. Checking related data...')
    const { data: electricity } = await client
      .from('electricity_baseline')
      .select('*')
      .eq('survey_id', surveyId)
      .single()

    const { data: roofFaces } = await client
      .from('roof_faces')
      .select('*')
      .eq('survey_id', surveyId)
    
    console.log('✅ Electricity data:', electricity?.mpan_number)
    console.log('✅ Roof faces:', roofFaces?.length)

    // 5: Upload a tiny test asset and link it
    console.log('4. Uploading test asset...')
    const blob = new Blob([new TextEncoder().encode('hello from test asset')], { type: 'text/plain' })
    const path = `surveys/${userId}/${surveyId}/assets/test/sample/sample.txt`
    const { error: upErr } = await client.storage.from('surveys').upload(path, blob)
    if (upErr) throw upErr

    const { data: asset, error: insErr } = await client
      .from('assets')
      .insert({
        survey_id: surveyId,
        section: 'test',
        field: 'sample',
        kind: 'photo',
        storage_object_path: path,
        mime_type: 'text/plain',
        byte_size: blob.size,
      })
      .select()
      .single()
    if (insErr) throw insErr
    console.log('✅ Asset inserted:', asset.id)

    // 6: List surveys
    console.log('5. Listing surveys...')
    const { data: surveys } = await client
      .from('surveys_list')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    console.log('✅ Recent surveys:', surveys?.length)
    
    console.log('🎉 All tests passed!')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testBackend()
