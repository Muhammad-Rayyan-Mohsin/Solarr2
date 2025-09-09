-- Create enum types for status fields
CREATE TYPE survey_status AS ENUM ('draft', 'completed', 'synced');
CREATE TYPE sync_status AS ENUM ('pending', 'synced', 'failed');

-- Create the surveys table
CREATE TABLE surveys (
    -- Metadata
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status survey_status DEFAULT 'draft',
    sync_status sync_status DEFAULT 'pending',
    last_synced TIMESTAMP WITH TIME ZONE,

    -- Section 0 - General & Contact
    surveyor_name VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    site_address TEXT NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    grid_reference VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    secondary_contact_name VARCHAR(255),
    secondary_contact_phone VARCHAR(20),
    survey_date DATE NOT NULL,

    -- Section 1 - Electricity Baseline
    current_electricity_usage DECIMAL(10, 2),
    mpan_number VARCHAR(50),
    current_electricity_supplier VARCHAR(100),
    network_operator VARCHAR(100),
    customer_permission_granted BOOLEAN,
    daytime_import_rate DECIMAL(10, 2),
    nighttime_import_rate DECIMAL(10, 2),
    standing_charge DECIMAL(10, 2),
    current_electricity_tariff VARCHAR(50),
    smart_meter_present VARCHAR(10),
    export_tariff_available VARCHAR(10),

    -- Section 2 - Property Overview
    property_type VARCHAR(50),
    property_age VARCHAR(50),
    listed_building VARCHAR(10),
    conservation_area VARCHAR(10),
    new_build VARCHAR(10),
    shared_roof VARCHAR(10),
    scaffold_access VARCHAR(10),
    storage_area VARCHAR(10),
    restricted_parking TEXT,

    -- Section 3 - Roof Inspection
    roof_faces JSONB, -- Store complex roof data as JSON

    -- Section 4 - Loft/Attic
    loft_hatch_width DECIMAL(10, 2),
    loft_hatch_height DECIMAL(10, 2),
    loft_access_quality VARCHAR(50),
    loft_headroom DECIMAL(10, 2),
    roof_timber_condition VARCHAR(50),
    wall_space_inverter VARCHAR(10),
    wall_space_battery VARCHAR(10),
    loft_insulation_thickness DECIMAL(10, 2),
    loft_lighting VARCHAR(50),
    loft_power_socket VARCHAR(10),

    -- Section 5 - Electrical Supply
    electrical_supply_type VARCHAR(50),
    main_fuse_rating VARCHAR(20),
    consumer_unit_make VARCHAR(100),
    consumer_unit_location VARCHAR(100),
    spare_fuse_ways INTEGER,
    existing_surge_protection VARCHAR(10),
    earth_bonding_verified VARCHAR(10),
    earthing_system VARCHAR(50),
    dno_notification_required BOOLEAN,
    ev_charger_installed VARCHAR(10),
    ev_charger_load DECIMAL(10, 2),
    cable_route_to_roof TEXT[],
    cable_route_to_battery TEXT[],

    -- Section 6 - Battery & Storage
    battery_required BOOLEAN,
    install_location VARCHAR(50),
    distance_from_cu DECIMAL(10, 2),
    mounting_surface VARCHAR(50),
    ventilation_adequate VARCHAR(10),
    fire_egress_compliance VARCHAR(10),
    temperature_range_min DECIMAL(5, 2),
    temperature_range_max DECIMAL(5, 2),
    ip_rating VARCHAR(10),

    -- Section 7 - Health & Safety
    asbestos_presence BOOLEAN,
    working_at_height_difficulties TEXT,
    fragile_roof_areas TEXT[],
    livestock_pets VARCHAR(10),
    livestock_pets_notes TEXT,
    special_access_instructions TEXT,

    -- Section 8 - Customer Preferences
    contact_method VARCHAR(50),
    installation_start_date DATE,
    installation_end_date DATE,
    customer_away BOOLEAN,
    customer_away_notes TEXT,
    budget_range VARCHAR(50),
    interested_in_ev_charger VARCHAR(10),
    interested_in_energy_monitoring VARCHAR(10),
    additional_notes TEXT
);

-- Create indexes for common queries
CREATE INDEX idx_surveys_customer_name ON surveys(customer_name);
CREATE INDEX idx_surveys_survey_date ON surveys(survey_date);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_sync_status ON surveys(sync_status);


CREATE TRIGGER update_surveys_updated_at
    BEFORE UPDATE ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE surveys IS 'Stores solar survey data with sections for general info, electricity, property, roof, loft, electrical supply, battery, safety, and customer preferences';
COMMENT ON COLUMN surveys.roof_faces IS 'JSON array containing details of each roof face including orientation, pitch, dimensions, and conditions';
COMMENT ON COLUMN surveys.cable_route_to_roof IS 'Array of text descriptions for cable routing to roof';
COMMENT ON COLUMN surveys.cable_route_to_battery IS 'Array of text descriptions for cable routing to battery';
COMMENT ON COLUMN surveys.fragile_roof_areas IS 'Array of text descriptions for fragile roof areas';
