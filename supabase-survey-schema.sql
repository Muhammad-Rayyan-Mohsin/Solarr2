-- Supabase Survey Schema - Complete Backend for Solar Survey Form
-- This schema stores 100% of the FormData fields from the survey form

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Generic updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

-- Root table: one row per survey (Section 0 - General & Contact)
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  status text not null default 'draft'
    check (status in ('draft','submitted','completed')),

  -- Section 0 - General & Contact
  survey_date date not null,
  surveyor_name text not null,
  surveyor_telephone text not null,
  surveyor_email text not null,
  customer_name text not null,
  site_address text not null,
  postcode text not null,
  grid_reference text,
  what3words text,
  phone text not null,
  email text not null,
  secondary_contact_name text,
  secondary_contact_phone text,

  -- PDF bookkeeping
  pdf_path text,
  pdf_generated_at timestamptz
);

create trigger surveys_set_updated_at
before update on public.surveys
for each row execute function set_updated_at();

-- Assets table: photos, signatures, voice notes (created after roof_faces)

-- Section 1 - Electricity Baseline
create table if not exists public.electricity_baseline (
  survey_id uuid primary key references public.surveys(id) on delete cascade,
  annual_consumption numeric(10,2),
  mpan_number text,
  electricity_provider text,
  network_operator text,
  customer_permission_granted boolean,
  daytime_import_rate numeric(10,4),
  nighttime_import_rate numeric(10,4),
  standing_charge numeric(10,4),
  tariff_type text,
  smart_meter_present text check (smart_meter_present in ('yes','no','na')),
  seg_tariff_available text check (seg_tariff_available in ('yes','no','na')),
  seg_tariff_explanation text,
  smart_tariff_available text check (smart_tariff_available in ('yes','no','na'))
  -- customerSignature stored in assets(kind='signature', section='electricity_baseline', field='customerSignature')
);

-- Section 2 - Property Overview
create table if not exists public.property_overview (
  survey_id uuid primary key references public.surveys(id) on delete cascade,
  property_type text,
  property_age text,
  listed_building text check (listed_building in ('yes','no','na')),
  conservation_area text check (conservation_area in ('yes','no','na')),
  new_build text check (new_build in ('yes','no','na')),
  shared_roof text check (shared_roof in ('yes','no','na')),
  scaffold_access text check (scaffold_access in ('yes','no','na')),
  storage_area text check (storage_area in ('yes','no','na')),
  restricted_parking text
  -- scaffoldAccessPhoto, storageAreaPhoto -> assets
);

-- Section 3 - Roof Inspection: 1:N roof faces
create table if not exists public.roof_faces (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  label text,
  orientation integer, -- degrees
  pitch integer,       -- degrees
  width numeric(10,2),
  length numeric(10,2),
  area numeric(10,2),
  covering text,
  covering_condition text,
  obstructions text[], -- list of tags/notes
  shading text[],      -- list of tags/notes
  gutter_height text,
  rafter_spacing text,
  rafter_depth text,
  batten_depth text,
  membrane_type text,
  membrane_condition text,
  structural_defects text,
  planned_panel_count integer
);

-- Assets table: photos, signatures, voice notes
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),

  survey_id uuid not null references public.surveys(id) on delete cascade,
  roof_face_id uuid references public.roof_faces(id) on delete cascade,

  section text not null,  -- e.g., 'electricity_baseline'
  field text not null,    -- e.g., 'mpanPhoto'
  kind text not null check (kind in ('photo','signature','voice')),
  storage_object_path text not null, -- storage.objects.name for the 'surveys' bucket
  mime_type text,
  byte_size bigint
);

-- Ensure performant lookups by survey and roof face
create index if not exists idx_assets_survey_id on public.assets(survey_id);
create index if not exists idx_assets_roof_face_id on public.assets(roof_face_id);

-- In case the table already exists from a previous version, relax created_by constraints
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'assets' and column_name = 'created_by'
  ) then
    begin
      alter table public.assets alter column created_by drop not null;
    exception when others then null; end;
    begin
      alter table public.assets drop constraint if exists assets_created_by_fkey;
    exception when others then null; end;
  end if;
end $$;

-- Section 4 - Loft / Attic
create table if not exists public.loft_attic (
  survey_id uuid primary key references public.surveys(id) on delete cascade,
  loft_hatch_width numeric(10,2),
  loft_hatch_height numeric(10,2),
  loft_access_type text,
  loft_headroom text,
  loft_boards_in_place text check (loft_boards_in_place in ('yes','no','na')),
  roof_timber_condition text,
  roof_timber_notes text,
  wall_space_inverter text check (wall_space_inverter in ('yes','no','na')),
  wall_space_inverter_notes text,
  wall_space_battery text check (wall_space_battery in ('yes','no','na')),
  wall_space_battery_notes text,
  loft_insulation_thickness numeric(10,2),
  loft_lighting text,
  loft_power_socket text check (loft_power_socket in ('yes','no','na'))
  -- *_Photo fields -> assets
);

-- Section 5 - Electrical Supply
create table if not exists public.electrical_supply (
  survey_id uuid primary key references public.surveys(id) on delete cascade,
  supply_type text,
  main_fuse_rating text,
  consumer_unit_make text,
  consumer_unit_location text,
  spare_fuse_ways integer,
  existing_surge_protection text check (existing_surge_protection in ('yes','no','na')),
  earth_bonding_verified text check (earth_bonding_verified in ('yes','no','na')),
  earthing_system_type text,
  cable_route_to_roof text[],
  cable_route_to_battery text[],
  dno_notification_required boolean,
  ev_charger_installed text check (ev_charger_installed in ('yes','no','na')),
  ev_charger_load numeric(10,2)
  -- Photos -> assets
);

-- Section 6 - Battery & Storage Preferences
create table if not exists public.battery_storage (
  survey_id uuid primary key references public.surveys(id) on delete cascade,
  battery_required text,
  preferred_install_location text,
  distance_from_cu text,
  mounting_surface text,
  ventilation_adequate text check (ventilation_adequate in ('yes','no','na')),
  fire_egress_compliance text check (fire_egress_compliance in ('yes','no','na')),
  ambient_temp_min numeric(10,2),
  ambient_temp_max numeric(10,2),
  ip_rating_required text
  -- Photos -> assets
);

-- Section 7 - Health, Safety & Hazards
create table if not exists public.health_safety (
  survey_id uuid primary key references public.surveys(id) on delete cascade,
  asbestos_presence text,
  working_at_height_difficulties text,
  fragile_roof_areas text[],
  livestock_pets_on_site text check (livestock_pets_on_site in ('yes','no','na')),
  livestock_pets_notes text,
  special_access_instructions text
  -- Photos -> assets
);

-- Section 8 - Customer Preferences & Next Steps
create table if not exists public.customer_preferences (
  survey_id uuid primary key references public.surveys(id) on delete cascade,
  preferred_contact_method text,
  installation_start_date date,
  installation_end_date date,
  customer_away boolean,
  customer_away_notes text,
  budget_range text,
  interested_in_ev_charger text check (interested_in_ev_charger in ('yes','no','na')),
  interested_in_energy_monitoring text check (interested_in_energy_monitoring in ('yes','no','na')),
  additional_notes text
);

-- Indexes for browsing and search
create index if not exists idx_surveys_created_by on public.surveys(created_by);
create index if not exists idx_surveys_date on public.surveys(survey_date);
create index if not exists idx_surveys_customer_name on public.surveys(customer_name);
create index if not exists idx_surveys_postcode on public.surveys(postcode);
create index if not exists idx_electricity_mpan on public.electricity_baseline(mpan_number);

-- Full-text search index (without generated column)
create index if not exists idx_surveys_search on public.surveys 
using gin(to_tsvector('simple', customer_name || ' ' || site_address || ' ' || postcode));

-- Browsing view (lightweight listing)
create or replace view public.surveys_list as
select
  s.id,
  s.created_at,
  s.survey_date,
  s.status,
  s.customer_name,
  s.site_address,
  s.postcode,
  eb.mpan_number
from public.surveys s
left join public.electricity_baseline eb on eb.survey_id = s.id;

-- RLS Policies
alter table public.surveys enable row level security;
alter table public.assets enable row level security;
alter table public.electricity_baseline enable row level security;
alter table public.property_overview enable row level security;
alter table public.roof_faces enable row level security;
alter table public.loft_attic enable row level security;
alter table public.electrical_supply enable row level security;
alter table public.battery_storage enable row level security;
alter table public.health_safety enable row level security;
alter table public.customer_preferences enable row level security;

-- Ownership policies for surveys
create policy "surveys_owner_select"
  on public.surveys for select
  to authenticated
  using (created_by = auth.uid());

-- Allow anonymous users to view surveys with the anonymous fallback UUID
create policy "surveys_anon_select"
  on public.surveys for select
  to anon
  using (created_by = '00000000-0000-0000-0000-000000000000'::uuid or created_by is null);

create policy "surveys_owner_ins"
  on public.surveys for insert
  to authenticated
  with check (created_by = auth.uid());

-- Allow anonymous users to insert surveys
create policy "surveys_anon_ins"
  on public.surveys for insert
  to anon
  with check (created_by = '00000000-0000-0000-0000-000000000000'::uuid or created_by is null);

create policy "surveys_owner_upd"
  on public.surveys for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "surveys_owner_del"
  on public.surveys for delete
  to authenticated
  using (created_by = auth.uid());

-- Child table policies (same pattern for all child tables)
create policy "electricity_baseline_select" on public.electricity_baseline for select to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "electricity_baseline_ins" on public.electricity_baseline for insert to authenticated
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "electricity_baseline_upd" on public.electricity_baseline for update to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()))
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "electricity_baseline_del" on public.electricity_baseline for delete to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));

create policy "property_overview_select" on public.property_overview for select to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "property_overview_ins" on public.property_overview for insert to authenticated
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "property_overview_upd" on public.property_overview for update to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()))
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "property_overview_del" on public.property_overview for delete to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));

create policy "roof_faces_select" on public.roof_faces for select to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "roof_faces_ins" on public.roof_faces for insert to authenticated
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "roof_faces_upd" on public.roof_faces for update to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()))
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "roof_faces_del" on public.roof_faces for delete to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));

create policy "loft_attic_select" on public.loft_attic for select to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "loft_attic_ins" on public.loft_attic for insert to authenticated
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "loft_attic_upd" on public.loft_attic for update to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()))
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "loft_attic_del" on public.loft_attic for delete to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));

create policy "electrical_supply_select" on public.electrical_supply for select to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "electrical_supply_ins" on public.electrical_supply for insert to authenticated
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "electrical_supply_upd" on public.electrical_supply for update to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()))
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "electrical_supply_del" on public.electrical_supply for delete to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));

create policy "battery_storage_select" on public.battery_storage for select to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "battery_storage_ins" on public.battery_storage for insert to authenticated
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "battery_storage_upd" on public.battery_storage for update to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()))
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "battery_storage_del" on public.battery_storage for delete to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));

create policy "health_safety_select" on public.health_safety for select to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "health_safety_ins" on public.health_safety for insert to authenticated
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "health_safety_upd" on public.health_safety for update to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()))
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "health_safety_del" on public.health_safety for delete to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));

create policy "customer_preferences_select" on public.customer_preferences for select to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "customer_preferences_ins" on public.customer_preferences for insert to authenticated
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "customer_preferences_upd" on public.customer_preferences for update to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()))
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "customer_preferences_del" on public.customer_preferences for delete to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));

create policy "assets_select" on public.assets for select to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "assets_ins" on public.assets for insert to authenticated
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "assets_upd" on public.assets for update to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()))
  with check (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));
create policy "assets_del" on public.assets for delete to authenticated
  using (exists (select 1 from public.surveys s where s.id = survey_id and s.created_by = auth.uid()));

-- Grant access to the view
grant select on public.surveys_list to anon, authenticated;

-- Grant permissions for RPC functions
grant execute on function public.create_full_survey(jsonb) to anon, authenticated;
grant execute on function public.get_full_survey(uuid) to anon, authenticated;

-- RPC function to create entire survey from FormData JSON
create or replace function public.create_full_survey(payload jsonb)
returns uuid
language plpgsql
security definer
as $$
declare
  v_survey_id uuid := gen_random_uuid();
begin
  -- surveys
  insert into public.surveys (
    id, created_by, status, survey_date,
    surveyor_name, surveyor_telephone, surveyor_email,
    customer_name, site_address, postcode, grid_reference, what3words,
    phone, email, secondary_contact_name, secondary_contact_phone
  )
  values (
    v_survey_id, coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), coalesce((payload->>'status'),'draft'),
    (payload->>'surveyDate')::date,
    payload#>>'{surveyorInfo,name}',
    payload#>>'{surveyorInfo,telephone}',
    payload#>>'{surveyorInfo,email}',
    payload->>'customerName',
    payload->>'siteAddress',
    payload->>'postcode',
    payload->>'gridReference',
    payload->>'what3words',
    payload->>'phone',
    payload->>'email',
    payload->>'secondaryContactName',
    payload->>'secondaryContactPhone'
  );

  -- electricity_baseline
  insert into public.electricity_baseline (
    survey_id, annual_consumption, mpan_number, electricity_provider, network_operator,
    customer_permission_granted, daytime_import_rate, nighttime_import_rate, standing_charge,
    tariff_type, smart_meter_present, seg_tariff_available, seg_tariff_explanation, smart_tariff_available
  )
  values (
    v_survey_id,
    nullif(payload->>'annualConsumption','')::numeric,
    payload->>'mpanNumber',
    payload->>'electricityProvider',
    payload->>'networkOperator',
    (payload->>'customerPermissionGranted')::boolean,
    nullif(payload->>'daytimeImportRate','')::numeric,
    nullif(payload->>'nighttimeImportRate','')::numeric,
    nullif(payload->>'standingCharge','')::numeric,
    payload->>'tariffType',
    nullif(payload->>'smartMeterPresent',''),
    nullif(payload->>'segTariffAvailable',''),
    payload->>'segTariffExplanation',
    nullif(payload->>'smartTariffAvailable','')
  );

  -- property_overview
  insert into public.property_overview (
    survey_id, property_type, property_age, listed_building, conservation_area, new_build,
    shared_roof, scaffold_access, storage_area, restricted_parking
  )
  values (
    v_survey_id,
    payload->>'propertyType',
    payload->>'propertyAge',
    nullif(payload->>'listedBuilding',''),
    nullif(payload->>'conservationArea',''),
    nullif(payload->>'newBuild',''),
    nullif(payload->>'sharedRoof',''),
    nullif(payload->>'scaffoldAccess',''),
    nullif(payload->>'storageArea',''),
    payload->>'restrictedParking'
  );

  -- roof_faces (array)
  insert into public.roof_faces (
    id, survey_id, label, orientation, pitch, width, length, area,
    covering, covering_condition, obstructions, shading,
    gutter_height, rafter_spacing, rafter_depth, batten_depth,
    membrane_type, membrane_condition, structural_defects,
    planned_panel_count
  )
  select
    gen_random_uuid(), v_survey_id,
    rf->>'label',
    nullif(rf->>'orientation','')::int,
    nullif(rf->>'pitch','')::int,
    nullif(rf->>'width','')::numeric,
    nullif(rf->>'length','')::numeric,
    nullif(rf->>'area','')::numeric,
    rf->>'covering', rf->>'coveringCondition',
    case when rf->'obstructions' is not null and jsonb_typeof(rf->'obstructions') = 'array'
      then array(select jsonb_array_elements_text(rf->'obstructions')) else null end,
    case when rf->'shading' is not null and jsonb_typeof(rf->'shading') = 'array'
      then array(select jsonb_array_elements_text(rf->'shading')) else null end,
    rf->>'gutterHeight', rf->>'rafterSpacing', rf->>'rafterDepth', rf->>'battenDepth',
    rf->>'membraneType', rf->>'membraneCondition', rf->>'structuralDefects',
    nullif(rf->>'plannedPanelCount','')::int
  from jsonb_array_elements(coalesce(payload->'roofFaces','[]'::jsonb)) as rf;

  -- loft_attic
  insert into public.loft_attic (
    survey_id, loft_hatch_width, loft_hatch_height, loft_access_type, loft_headroom,
    loft_boards_in_place, roof_timber_condition, roof_timber_notes,
    wall_space_inverter, wall_space_inverter_notes,
    wall_space_battery, wall_space_battery_notes,
    loft_insulation_thickness, loft_lighting, loft_power_socket
  )
  values (
    v_survey_id,
    nullif(payload->>'loftHatchWidth','')::numeric,
    nullif(payload->>'loftHatchHeight','')::numeric,
    payload->>'loftAccessType',
    payload->>'loftHeadroom',
    nullif(payload->>'loftBoardsInPlace',''),
    payload->>'roofTimberCondition',
    payload->>'roofTimberNotes',
    nullif(payload->>'wallSpaceInverter',''),
    payload->>'wallSpaceInverterNotes',
    nullif(payload->>'wallSpaceBattery',''),
    payload->>'wallSpaceBatteryNotes',
    nullif(payload->>'loftInsulationThickness','')::numeric,
    payload->>'loftLighting',
    nullif(payload->>'loftPowerSocket','')
  );

  -- electrical_supply
  insert into public.electrical_supply (
    survey_id, supply_type, main_fuse_rating, consumer_unit_make, consumer_unit_location,
    spare_fuse_ways, existing_surge_protection, earth_bonding_verified, earthing_system_type,
    cable_route_to_roof, cable_route_to_battery, dno_notification_required,
    ev_charger_installed, ev_charger_load
  )
  values (
    v_survey_id,
    payload->>'supplyType',
    payload->>'mainFuseRating',
    payload->>'consumerUnitMake',
    payload->>'consumerUnitLocation',
    nullif(payload->>'spareFuseWays','')::int,
    nullif(payload->>'existingSurgeProtection',''),
    nullif(payload->>'earthBondingVerified',''),
    payload->>'earthingSystemType',
    case when jsonb_typeof(payload->'cableRouteToRoof')='array'
      then array(select jsonb_array_elements_text(payload->'cableRouteToRoof')) else null end,
    case when jsonb_typeof(payload->'cableRouteToBattery')='array'
      then array(select jsonb_array_elements_text(payload->'cableRouteToBattery')) else null end,
    (payload->>'dnoNotificationRequired')::boolean,
    nullif(payload->>'evChargerInstalled',''),
    nullif(payload->>'evChargerLoad','')::numeric
  );

  -- battery_storage
  insert into public.battery_storage (
    survey_id, battery_required, preferred_install_location, distance_from_cu, mounting_surface,
    ventilation_adequate, fire_egress_compliance, ambient_temp_min, ambient_temp_max, ip_rating_required
  )
  values (
    v_survey_id,
    payload->>'batteryRequired',
    payload->>'preferredInstallLocation',
    payload->>'distanceFromCU',
    payload->>'mountingSurface',
    nullif(payload->>'ventilationAdequate',''),
    nullif(payload->>'fireEgressCompliance',''),
    nullif(payload->>'ambientTempMin','')::numeric,
    nullif(payload->>'ambientTempMax','')::numeric,
    payload->>'ipRatingRequired'
  );

  -- health_safety
  insert into public.health_safety (
    survey_id, asbestos_presence, working_at_height_difficulties, fragile_roof_areas,
    livestock_pets_on_site, livestock_pets_notes, special_access_instructions
  )
  values (
    v_survey_id,
    payload->>'asbestosPresence',
    payload->>'workingAtHeightDifficulties',
    case when jsonb_typeof(payload->'fragileRoofAreas')='array'
      then array(select jsonb_array_elements_text(payload->'fragileRoofAreas')) else null end,
    nullif(payload->>'livestockPetsOnSite',''),
    payload->>'livestockPetsNotes',
    payload->>'specialAccessInstructions'
  );

  -- customer_preferences
  insert into public.customer_preferences (
    survey_id, preferred_contact_method, installation_start_date, installation_end_date,
    customer_away, customer_away_notes, budget_range,
    interested_in_ev_charger, interested_in_energy_monitoring, additional_notes
  )
  values (
    v_survey_id,
    payload->>'preferredContactMethod',
    nullif(payload->>'installationStartDate','')::date,
    nullif(payload->>'installationEndDate','')::date,
    (payload->>'customerAway')::boolean,
    payload->>'customerAwayNotes',
    payload->>'budgetRange',
    nullif(payload->>'interestedInEvCharger',''),
    nullif(payload->>'interestedInEnergyMonitoring',''),
    payload->>'additionalNotes'
  );

  return v_survey_id;
exception when others then
  raise;
end$$;

-- RPC: fetch a complete survey with all sections, roof faces and assets
create or replace function public.get_full_survey(p_survey_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v jsonb;
begin
  select jsonb_build_object(
    'id', s.id,
    'status', s.status,
    'surveyDate', s.survey_date,
    'surveyorInfo', jsonb_build_object(
      'name', s.surveyor_name,
      'telephone', s.surveyor_telephone,
      'email', s.surveyor_email
    ),
    'customerName', s.customer_name,
    'siteAddress', s.site_address,
    'postcode', s.postcode,
    'gridReference', s.grid_reference,
    'what3words', s.what3words,
    'phone', s.phone,
    'email', s.email,
    'secondaryContactName', s.secondary_contact_name,
    'secondaryContactPhone', s.secondary_contact_phone,
    'electricity_baseline', to_jsonb(eb) - 'survey_id',
    'property_overview', to_jsonb(po) - 'survey_id',
    'roof_faces', coalesce((
      select jsonb_agg(
        (to_jsonb(rf) - 'survey_id') || jsonb_build_object(
          'assets', coalesce((
            select jsonb_agg(jsonb_build_object(
              'id', a.id,
              'section', a.section,
              'field', a.field,
              'kind', a.kind,
              'storagePath', a.storage_object_path,
              'mimeType', a.mime_type,
              'byteSize', a.byte_size
            ))
            from public.assets a
            where a.survey_id = s.id and a.roof_face_id = rf.id
          ), '[]'::jsonb)
        )
      )
      from public.roof_faces rf where rf.survey_id = s.id
    ), '[]'::jsonb),
    'loft_attic', to_jsonb(la) - 'survey_id',
    'electrical_supply', to_jsonb(es) - 'survey_id',
    'battery_storage', to_jsonb(bs) - 'survey_id',
    'health_safety', to_jsonb(hs) - 'survey_id',
    'customer_preferences', to_jsonb(cp) - 'survey_id',
    'assets', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id,
        'section', a.section,
        'field', a.field,
        'kind', a.kind,
        'storagePath', a.storage_object_path,
        'mimeType', a.mime_type,
        'byteSize', a.byte_size
      )) from public.assets a where a.survey_id = s.id and a.roof_face_id is null
    ), '[]'::jsonb)
  )
  into v
  from public.surveys s
  left join public.electricity_baseline eb on eb.survey_id = s.id
  left join public.property_overview po on po.survey_id = s.id
  left join public.loft_attic la on la.survey_id = s.id
  left join public.electrical_supply es on es.survey_id = s.id
  left join public.battery_storage bs on bs.survey_id = s.id
  left join public.health_safety hs on hs.survey_id = s.id
  left join public.customer_preferences cp on cp.survey_id = s.id
  where s.id = p_survey_id;

  return v;
end$$;
