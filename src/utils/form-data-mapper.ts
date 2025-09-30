/**
 * Form Data Mapper
 * Ensures consistent mapping between form inputs and database schema
 */

export interface FormData {
  // Section 0 - General & Contact
  surveyDate: string;
  surveyorInfo?: {
    name?: string;
    telephone?: string;
    email?: string;
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

export interface RoofFace {
  id: string;
  label: string;
  orientation: number;
  pitch: number;
  width: number;
  length: number;
  area: number;
  covering: string;
  coveringCondition: string;
  obstructions: string[];
  shading: string[];
  gutterHeight: string;
  rafterSpacing: string;
  rafterDepth: string;
  battenDepth?: string;
  membraneType: string;
  membraneCondition: string;
  structuralDefects: string;
  plannedPanelCount: number;
  photos: string[];
}

/**
 * Maps form data to database-compatible format
 * Handles data type conversions and ensures all fields are properly mapped
 */
export class FormDataMapper {
  /**
   * Convert form data to database-compatible format
   */
  static mapFormToDatabase(formData: FormData): any {
    // Validate required fields
    const requiredFields = [
      'surveyDate', 'customerName', 'siteAddress', 'postcode', 'phone', 'email'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = field === 'surveyDate' ? formData.surveyDate : formData[field as keyof FormData];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Ensure surveyor info has default values
    type SurveyorInfo = {
      name?: string;
      telephone?: string;
      email?: string;
    };
    const surveyorInfo: SurveyorInfo = formData.surveyorInfo || {};
    const defaultSurveyorName = surveyorInfo.name || 'Unknown Surveyor';
    const defaultSurveyorPhone = surveyorInfo.telephone || 'Not provided';
    const defaultSurveyorEmail = surveyorInfo.email || 'notprovided@example.com';

    // Ensure survey_date is always provided
    const surveyDate = formData.surveyDate 
      ? new Date(formData.surveyDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0];

    return {
      // Main survey data
      survey_date: surveyDate,
      surveyor_name: defaultSurveyorName,
      surveyor_telephone: defaultSurveyorPhone,
      surveyor_email: defaultSurveyorEmail,
      customer_name: formData.customerName,
      site_address: formData.siteAddress,
      postcode: formData.postcode,
      grid_reference: formData.gridReference || '',
      what3words: formData.what3words || '',
      phone: formData.phone,
      email: formData.email,
      secondary_contact_name: formData.secondaryContactName || '',
      secondary_contact_phone: formData.secondaryContactPhone || '',
      customer_signature: formData.customerSignature || '',

      // Electricity baseline with proper data types
      electricity_baseline: {
        annual_consumption: parseFloat(formData.annualConsumption) || 0,
        smart_meter_present: formData.smartMeterPresent,
      },

      // Property overview
      property_overview: {
        property_type: formData.propertyType,
        property_age: formData.propertyAge,
        listed_building: formData.listedBuilding,
        conservation_area: formData.conservationArea,
        new_build: formData.newBuild,
        shared_roof: formData.sharedRoof,
        scaffold_access: formData.scaffoldAccess,
        storage_area: formData.storageArea,
        restricted_parking: formData.restrictedParking,
        occupancy_status: formData.occupancyStatus,
      },

      // Roof faces with proper data types
      roof_faces: formData.roofFaces.map(face => ({
        id: face.id,
        label: face.label,
        orientation: face.orientation.toString(),
        pitch: face.pitch.toString(),
        width: face.width.toString(),
        length: face.length.toString(),
        area: face.area.toString(),
        covering: face.covering,
        covering_condition: face.coveringCondition,
        obstructions: face.obstructions,
        shading: face.shading,
        gutter_height: face.gutterHeight,
        rafter_spacing: face.rafterSpacing,
        rafter_depth: face.rafterDepth,
        batten_depth: face.battenDepth || null,
        membrane_type: face.membraneType,
        membrane_condition: face.membraneCondition,
        structural_defects: face.structuralDefects,
        planned_panel_count: face.plannedPanelCount,
      })),

      // Loft/attic with proper data types
      loft_attic: {
        loft_hatch_width: parseFloat(formData.loftHatchWidth) || 0,
        loft_hatch_height: parseFloat(formData.loftHatchHeight) || 0,
        loft_access_type: formData.loftAccessType,
        loft_headroom: formData.loftHeadroom,
        loft_boards_in_place: formData.loftBoardsInPlace,
        roof_timber_condition: formData.roofTimberCondition,
        roof_timber_notes: formData.roofTimberNotes,
        wall_space_inverter: formData.wallSpaceInverter,
        wall_space_inverter_notes: formData.wallSpaceInverterNotes,
        wall_space_battery: formData.wallSpaceBattery,
        wall_space_battery_notes: formData.wallSpaceBatteryNotes,
        loft_insulation_thickness: parseFloat(formData.loftInsulationThickness) || 0,
        loft_lighting: formData.loftLighting,
        loft_power_socket: formData.loftPowerSocket,
      },

      // Electrical supply with proper data types
      electrical_supply: {
        supply_type: formData.supplyType,
        main_fuse_rating: formData.mainFuseRating,
        consumer_unit_make: formData.consumerUnitMake,
        consumer_unit_location: formData.consumerUnitLocation,
        spare_fuse_ways: parseInt(formData.spareFuseWays) || 0,
        existing_surge_protection: formData.existingSurgeProtection,
        earth_bonding_verified: formData.earthBondingVerified,
        earthing_system_type: formData.earthingSystemType,
        dno_notification_required: formData.dnoNotificationRequired,
        ev_charger_installed: formData.evChargerInstalled,
        ev_charger_load: parseFloat(formData.evChargerLoad) || 0,
      },

      // Battery storage with proper data types
      battery_storage: {
        battery_required: formData.batteryRequired,
        preferred_install_location: formData.preferredInstallLocation,
        distance_from_cu: formData.distanceFromCU,
        mounting_surface: formData.mountingSurface,
        ventilation_adequate: formData.ventilationAdequate,
      },

      // Health and safety
      health_safety: {
        asbestos_presence: formData.asbestosPresence,
        working_at_height_difficulties: formData.workingAtHeightDifficulties,
        livestock_pets_on_site: formData.livestockPetsOnSite,
        livestock_pets_notes: formData.livestockPetsNotes,
        special_access_instructions: formData.specialAccessInstructions,
      },

      // Customer preferences
      customer_preferences: {
        preferred_contact_method: formData.preferredContactMethod,
        installation_start_date: formData.installationStartDate,
        installation_end_date: formData.installationEndDate,
        customer_away: formData.customerAway,
        customer_away_notes: formData.customerAwayNotes,
        budget_range: formData.budgetRange,
        interested_in_ev_charger: formData.interestedInEvCharger,
        interested_in_energy_monitoring: formData.interestedInEnergyMonitoring,
        additional_notes: formData.additionalNotes,
      },

      // Assets (photos) - properly structured for database storage
      assets: this.mapPhotosToAssets(formData),
    };
  }

  /**
   * Map all photo fields to assets array for database storage
   */
  private static mapPhotosToAssets(formData: FormData): any[] {
    const assets: any[] = [];

    // Helper function to add photo assets
    const addPhotoAssets = (photos: string[], section: string, field: string) => {
      photos.forEach((photo, index) => {
        if (photo && photo.trim()) {
          assets.push({
            section,
            field,
            kind: 'photo',
            storage_object_path: photo,
            mime_type: this.getMimeTypeFromPath(photo),
            byte_size: 0, // Will be updated when file is uploaded
          });
        }
      });
    };

    // Map all photo fields
    addPhotoAssets(formData.annualConsumptionPhoto, 'electricity_baseline', 'annual_consumption');
    addPhotoAssets(formData.scaffoldAccessPhoto, 'property_overview', 'scaffold_access');
    addPhotoAssets(formData.storageAreaPhoto, 'property_overview', 'storage_area');
    addPhotoAssets(formData.roofTimberPhoto, 'loft_attic', 'roof_timber');
    addPhotoAssets(formData.wallSpaceInverterPhoto, 'loft_attic', 'wall_space_inverter');
    addPhotoAssets(formData.wallSpaceBatteryPhoto, 'loft_attic', 'wall_space_battery');
    addPhotoAssets(formData.mainFusePhoto, 'electrical_supply', 'main_fuse');
    addPhotoAssets(formData.consumerUnitLocationPhoto, 'electrical_supply', 'consumer_unit_location');
    addPhotoAssets(formData.spareFuseWaysPhoto, 'electrical_supply', 'spare_fuse_ways');
    addPhotoAssets(formData.existingSurgeProtectionPhoto, 'electrical_supply', 'existing_surge_protection');
    addPhotoAssets(formData.earthBondingPhoto, 'electrical_supply', 'earth_bonding');
    addPhotoAssets(formData.earthingSystemPhoto, 'electrical_supply', 'earthing_system');
    addPhotoAssets(formData.cableRouteToRoof, 'electrical_supply', 'cable_route_to_roof');
    addPhotoAssets(formData.cableRouteToBattery, 'electrical_supply', 'cable_route_to_battery');
    addPhotoAssets(formData.ventilationPhoto, 'battery_storage', 'ventilation');
    addPhotoAssets(formData.asbestosPhoto, 'health_safety', 'asbestos');
    addPhotoAssets(formData.fragileRoofAreas, 'health_safety', 'fragile_roof_areas');

    // Map roof face photos
    formData.roofFaces.forEach((roofFace, roofIndex) => {
      addPhotoAssets(roofFace.photos, 'roof_faces', `roof_face_${roofFace.id}_photos`);
    });

    return assets;
  }

  /**
   * Get MIME type from file path
   */
  private static getMimeTypeFromPath(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Convert database data back to form format
   */
  static mapDatabaseToForm(dbData: any): FormData {
    return {
      // Main survey data
      surveyDate: dbData.survey_date,
      surveyorInfo: {
        name: dbData.surveyor_name,
        telephone: dbData.surveyor_telephone,
        email: dbData.surveyor_email,
      },
      customerName: dbData.customer_name,
      siteAddress: dbData.site_address,
      postcode: dbData.postcode,
      gridReference: dbData.grid_reference,
      what3words: dbData.what3words,
      phone: dbData.phone,
      email: dbData.email,
      secondaryContactName: dbData.secondary_contact_name,
      secondaryContactPhone: dbData.secondary_contact_phone,

      // Electricity baseline
      annualConsumption: dbData.electricity_baseline?.annual_consumption?.toString() || '',
      annualConsumptionPhoto: this.extractPhotosFromAssets(dbData.assets, 'electricity_baseline', 'annual_consumption'),
      smartMeterPresent: dbData.electricity_baseline?.smart_meter_present,

      // Property overview
      propertyType: dbData.property_overview?.property_type || '',
      propertyAge: dbData.property_overview?.property_age || '',
      occupancyStatus: dbData.property_overview?.occupancy_status || '',
      listedBuilding: dbData.property_overview?.listed_building,
      conservationArea: dbData.property_overview?.conservation_area,
      newBuild: dbData.property_overview?.new_build,
      sharedRoof: dbData.property_overview?.shared_roof,
      scaffoldAccess: dbData.property_overview?.scaffold_access,
      scaffoldAccessPhoto: this.extractPhotosFromAssets(dbData.assets, 'property_overview', 'scaffold_access'),
      storageArea: dbData.property_overview?.storage_area,
      storageAreaPhoto: this.extractPhotosFromAssets(dbData.assets, 'property_overview', 'storage_area'),
      restrictedParking: dbData.property_overview?.restricted_parking || '',

      // Roof faces
      roofFaces: dbData.roof_faces?.map((face: any) => ({
        id: face.id,
        label: face.label,
        orientation: face.orientation,
        pitch: face.pitch,
        width: face.width,
        length: face.length,
        area: face.area,
        covering: face.covering,
        coveringCondition: face.covering_condition,
        obstructions: face.obstructions || [],
        shading: face.shading || [],
        gutterHeight: face.gutter_height,
        rafterSpacing: face.rafter_spacing,
        rafterDepth: face.rafter_depth,
        battenDepth: face.batten_depth,
        membraneType: face.membrane_type,
        membraneCondition: face.membrane_condition,
        structuralDefects: face.structural_defects,
        plannedPanelCount: face.planned_panel_count,
        photos: this.extractPhotosFromAssets(dbData.assets, 'roof_faces', `roof_face_${face.id}_photos`),
      })) || [],

      // Loft/attic
      loftHatchWidth: dbData.loft_attic?.loft_hatch_width?.toString() || '',
      loftHatchHeight: dbData.loft_attic?.loft_hatch_height?.toString() || '',
      loftAccessType: dbData.loft_attic?.loft_access_type || '',
      loftHeadroom: dbData.loft_attic?.loft_headroom || '',
      loftBoardsInPlace: dbData.loft_attic?.loft_boards_in_place,
      roofTimberCondition: dbData.loft_attic?.roof_timber_condition || '',
      roofTimberPhoto: this.extractPhotosFromAssets(dbData.assets, 'loft_attic', 'roof_timber'),
      roofTimberNotes: dbData.loft_attic?.roof_timber_notes || '',
      wallSpaceInverter: dbData.loft_attic?.wall_space_inverter,
      wallSpaceInverterPhoto: this.extractPhotosFromAssets(dbData.assets, 'loft_attic', 'wall_space_inverter'),
      wallSpaceInverterNotes: dbData.loft_attic?.wall_space_inverter_notes || '',
      wallSpaceBattery: dbData.loft_attic?.wall_space_battery,
      wallSpaceBatteryPhoto: this.extractPhotosFromAssets(dbData.assets, 'loft_attic', 'wall_space_battery'),
      wallSpaceBatteryNotes: dbData.loft_attic?.wall_space_battery_notes || '',
      loftInsulationThickness: dbData.loft_attic?.loft_insulation_thickness?.toString() || '',
      loftLighting: dbData.loft_attic?.loft_lighting || '',
      loftPowerSocket: dbData.loft_attic?.loft_power_socket,

      // Electrical supply
      supplyType: dbData.electrical_supply?.supply_type || '',
      mainFuseRating: dbData.electrical_supply?.main_fuse_rating || '',
      mainFusePhoto: this.extractPhotosFromAssets(dbData.assets, 'electrical_supply', 'main_fuse'),
      consumerUnitMake: dbData.electrical_supply?.consumer_unit_make || '',
      consumerUnitLocation: dbData.electrical_supply?.consumer_unit_location || '',
      consumerUnitLocationPhoto: this.extractPhotosFromAssets(dbData.assets, 'electrical_supply', 'consumer_unit_location'),
      spareFuseWays: dbData.electrical_supply?.spare_fuse_ways?.toString() || '',
      spareFuseWaysPhoto: this.extractPhotosFromAssets(dbData.assets, 'electrical_supply', 'spare_fuse_ways'),
      existingSurgeProtection: dbData.electrical_supply?.existing_surge_protection,
      existingSurgeProtectionPhoto: this.extractPhotosFromAssets(dbData.assets, 'electrical_supply', 'existing_surge_protection'),
      earthBondingVerified: dbData.electrical_supply?.earth_bonding_verified,
      earthBondingPhoto: this.extractPhotosFromAssets(dbData.assets, 'electrical_supply', 'earth_bonding'),
      earthingSystemType: dbData.electrical_supply?.earthing_system_type || '',
      earthingSystemPhoto: this.extractPhotosFromAssets(dbData.assets, 'electrical_supply', 'earthing_system'),
      cableRouteToRoof: this.extractPhotosFromAssets(dbData.assets, 'electrical_supply', 'cable_route_to_roof'),
      cableRouteToBattery: this.extractPhotosFromAssets(dbData.assets, 'electrical_supply', 'cable_route_to_battery'),
      dnoNotificationRequired: dbData.electrical_supply?.dno_notification_required || false,
      evChargerInstalled: dbData.electrical_supply?.ev_charger_installed,
      evChargerLoad: dbData.electrical_supply?.ev_charger_load?.toString() || '',

      // Battery storage
      batteryRequired: dbData.battery_storage?.battery_required || '',
      preferredInstallLocation: dbData.battery_storage?.preferred_install_location || '',
      distanceFromCU: dbData.battery_storage?.distance_from_cu || '',
      mountingSurface: dbData.battery_storage?.mounting_surface || '',
      ventilationAdequate: dbData.battery_storage?.ventilation_adequate,
      ventilationPhoto: this.extractPhotosFromAssets(dbData.assets, 'battery_storage', 'ventilation'),

      // Health and safety
      asbestosPresence: dbData.health_safety?.asbestos_presence || '',
      asbestosPhoto: this.extractPhotosFromAssets(dbData.assets, 'health_safety', 'asbestos'),
      workingAtHeightDifficulties: dbData.health_safety?.working_at_height_difficulties || '',
      fragileRoofAreas: this.extractPhotosFromAssets(dbData.assets, 'health_safety', 'fragile_roof_areas'),
      livestockPetsOnSite: dbData.health_safety?.livestock_pets_on_site,
      livestockPetsNotes: dbData.health_safety?.livestock_pets_notes || '',
      specialAccessInstructions: dbData.health_safety?.special_access_instructions || '',

      // Customer preferences
      preferredContactMethod: dbData.customer_preferences?.preferred_contact_method || '',
      installationStartDate: dbData.customer_preferences?.installation_start_date || '',
      installationEndDate: dbData.customer_preferences?.installation_end_date || '',
      customerAway: dbData.customer_preferences?.customer_away || false,
      customerAwayNotes: dbData.customer_preferences?.customer_away_notes || '',
      budgetRange: dbData.customer_preferences?.budget_range || '',
      interestedInEvCharger: dbData.customer_preferences?.interested_in_ev_charger,
      interestedInEnergyMonitoring: dbData.customer_preferences?.interested_in_energy_monitoring,
      additionalNotes: dbData.customer_preferences?.additional_notes || '',
      
      // Section 9 - Customer Signature
      customerSignature: dbData.customer_signature || '',
    };
  }

  /**
   * Extract photos from assets array for a specific section and field
   */
  private static extractPhotosFromAssets(assets: any[], section: string, field: string): string[] {
    if (!assets || !Array.isArray(assets)) return [];
    
    return assets
      .filter(asset => 
        asset.section === section && 
        asset.field === field && 
        asset.kind === 'photo'
      )
      .map(asset => asset.storage_object_path)
      .filter(path => path && path.trim());
  }
}
