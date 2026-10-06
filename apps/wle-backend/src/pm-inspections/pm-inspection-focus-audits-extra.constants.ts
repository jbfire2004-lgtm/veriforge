import type { PmInspectionTemplateCategory } from '@prisma/client';
import {
  focusAudit,
  pf,
  type SystemTemplateDef,
} from './pm-inspection-focus-audits.constants';

const SITE = 'SITE' as PmInspectionTemplateCategory;
const TOOL = 'TOOL' as PmInspectionTemplateCategory;
const ENV = 'ENVIRONMENTAL' as PmInspectionTemplateCategory;
const FIRE = 'FIRE_PROTECTION' as PmInspectionTemplateCategory;
const ACCESS = 'ACCESS_EGRESS' as PmInspectionTemplateCategory;
const FALL = 'FALL_PROTECTION' as PmInspectionTemplateCategory;
const CONF = 'CONFINED_SPACE' as PmInspectionTemplateCategory;
const HOT = 'HOT_WORK' as PmInspectionTemplateCategory;
const EXC = 'EXCAVATION' as PmInspectionTemplateCategory;
const POWER = 'TEMPORARY_POWER' as PmInspectionTemplateCategory;
const CRANE = 'CRANE' as PmInspectionTemplateCategory;
const PME = 'PME' as PmInspectionTemplateCategory;
const VEHICLE = 'VEHICLE' as PmInspectionTemplateCategory;
const SCAFF = 'SCAFFOLDING' as PmInspectionTemplateCategory;

/** Expanded / new industry focus audits — mining, nuclear, O&G, power, wind, construction. */
export const EXPANDED_FOCUS_AUDIT_TEMPLATES: SystemTemplateDef[] = [
  // —— Construction (ops + build-out) ——
  focusAudit(
    'Concrete & formwork operations',
    'construction',
    'Construction',
    'concrete_formwork',
    SITE,
    'Formwork design, shores, pour rates, and strike criteria.',
    [
      pf('form_design', 'Formwork / shoring per engineered drawings', {
        weight: 25,
        critical: true,
      }),
      pf('inspection_pre', 'Pre-pour inspection signed by competent person', {
        weight: 20,
      }),
      pf('pour_rate', 'Pour rate and vibration within design limits', {
        weight: 15,
      }),
      pf('edge_protect', 'Formwork edges protected / fall controls', {
        weight: 15,
      }),
      pf('strike', 'Strike / strip criteria understood by crew', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Steel erection & structural',
    'construction',
    'Construction',
    'steel_erection',
    FALL,
    'Bolting, decking, fall protection, and multi-lift control.',
    [
      pf('decking', 'Decking and flooring sequence per plan', { weight: 20 }),
      pf('bolting', 'Connections bolted before releasing load', {
        weight: 20,
        critical: true,
      }),
      pf('fall_steel', 'Fall protection continuous during erection', {
        weight: 25,
        critical: true,
      }),
      pf('multi_lift', 'Multiple-lift rigging only when allowed', {
        weight: 15,
      }),
      pf('site_control', 'Controlled decking zone marked', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Demolition & strip-out',
    'construction',
    'Construction',
    'demolition',
    SITE,
    'Engineering survey, utilities, soft strip, and debris control.',
    [
      pf('survey', 'Engineering / structural survey completed', {
        weight: 25,
        critical: true,
      }),
      pf('utilities_d', 'Utilities isolated and verified', { weight: 20 }),
      pf('soft_strip', 'Soft strip sequence followed', { weight: 15 }),
      pf('debris', 'Debris chutes / drop zones controlled', { weight: 15 }),
      pf('dust', 'Dust and silica controls in place', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Traffic & public interface',
    'construction',
    'Construction',
    'traffic_public',
    VEHICLE,
    'TMP, flaggers, pedestrian routes, and public protection.',
    [
      pf('tmp', 'Traffic management plan posted and followed', {
        weight: 25,
        critical: true,
      }),
      pf('flaggers', 'Flaggers trained and positioned', { weight: 15 }),
      pf('ped_route', 'Public pedestrian routes protected', { weight: 20 }),
      pf('barricades_t', 'Barricades / fencing secure after hours', {
        weight: 15,
      }),
      pf('signage_t', 'Advance warning signs in place', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Crane set-up & ground bearing',
    'construction',
    'Construction',
    'crane_setup',
    CRANE,
    'Outriggers, mats, underground hazards, and counterweights.',
    [
      pf('mats', 'Outrigger mats / pads sized for ground bearing', {
        weight: 25,
        critical: true,
      }),
      pf('underground', 'Underground services / voids assessed', {
        weight: 20,
      }),
      pf('level', 'Crane leveled and swing clearances verified', {
        weight: 15,
      }),
      pf('counterweight', 'Counterweights installed per chart', { weight: 15 }),
      pf('radius', 'Working radius / load chart posted in cab', { weight: 10 }),
    ],
  ),

  // —— Mining (ops + development) ——
  focusAudit(
    'Conveyor & crushing plant',
    'mining',
    'Mining',
    'conveyor_crushing',
    PME,
    'Guarding, pull-cords, isolation, and housekeeping at crushers.',
    [
      pf('guards_c', 'Conveyor nip / tail / head guards in place', {
        weight: 25,
        critical: true,
        energyType: 'mechanical',
      }),
      pf('pull_cord', 'Emergency pull-cords tested', { weight: 20 }),
      pf('isolation_c', 'Isolation verified before belt work', {
        weight: 20,
        critical: true,
      }),
      pf('spillage', 'Spillage and buildup controlled', { weight: 15 }),
      pf('access_c', 'Safe access for clean-up and inspection', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Underground development headings',
    'mining',
    'Mining',
    'ug_development',
    SITE,
    'Ground support, face conditions, services, and traffic in headings.',
    [
      pf('support', 'Ground support installed per design', {
        weight: 25,
        critical: true,
      }),
      pf('face', 'Face scaled and inspected before entry', { weight: 20 }),
      pf('services_ug', 'Air / water / power services secured', { weight: 15 }),
      pf('traffic_ug', 'Heading traffic / equipment rules followed', {
        weight: 15,
      }),
      pf('survey', 'Survey / grade control hazards managed', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Tailings & water management',
    'mining',
    'Mining',
    'tailings_water',
    ENV,
    'Dam inspection, freeboard, seepage, and spillway readiness.',
    [
      pf('freeboard', 'Freeboard / water level within criteria', {
        weight: 25,
        critical: true,
      }),
      pf('seepage', 'Seepage points inspected and logged', { weight: 20 }),
      pf('spillway', 'Spillway / overflow clear of debris', { weight: 15 }),
      pf('access_t', 'Dam crest access controlled', { weight: 15 }),
      pf('instrument', 'Instrumentation readings current', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Mine construction & civils',
    'mining',
    'Mining',
    'mine_civils',
    SITE,
    'Earthworks, foundations, laydown, and contractor interfaces on mine builds.',
    [
      pf('geotech', 'Geotech recommendations followed for excavations', {
        weight: 20,
      }),
      pf('foundations', 'Foundation pours / embeds per ITP', { weight: 15 }),
      pf('laydown', 'Laydown and lifting zones controlled', { weight: 15 }),
      pf('interface', 'Owner / contractor interface permits current', {
        weight: 20,
        critical: true,
      }),
      pf('env_civils', 'Erosion and sediment controls in place', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Shaft & hoist operations',
    'mining',
    'Mining',
    'shaft_hoist',
    CRANE,
    'Hoist signaling, conveyance, shaft inspection, and winders.',
    [
      pf('signals', 'Hoist signals understood and tested', {
        weight: 20,
        critical: true,
      }),
      pf('conveyance', 'Conveyance / cage inspection current', { weight: 20 }),
      pf('shaft_insp', 'Shaft examination schedule followed', { weight: 20 }),
      pf('winder', 'Winder / brake tests documented', { weight: 15 }),
      pf('persons', 'Persons / material conveyance rules followed', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Dust, silica & respiratory',
    'mining',
    'Mining',
    'dust_respiratory',
    ENV,
    'Suppression, monitoring, fit-testing, and restricted areas.',
    [
      pf('suppression', 'Water / chemical dust suppression operating', {
        weight: 20,
      }),
      pf('monitoring_d', 'Personal / area dust monitoring current', {
        weight: 20,
      }),
      pf('respirators', 'Respirators fit-tested and stored correctly', {
        weight: 20,
        critical: true,
      }),
      pf('restricted', 'High-dust areas posted and controlled', { weight: 15 }),
      pf('cleaning', 'Dry sweeping prohibited / HEPA used', { weight: 10 }),
    ],
  ),

  // —— Oil & Gas ——
  focusAudit(
    'Wellsite & drilling operations',
    'oil_gas',
    'Oil & Gas',
    'wellsite_drilling',
    SITE,
    'BOP, well control drills, hazardous zones, and third-party interfaces.',
    [
      pf('bop', 'BOP / well control equipment tested and certified', {
        weight: 25,
        critical: true,
      }),
      pf('drill_wc', 'Well control drill within required interval', {
        weight: 20,
      }),
      pf('zones', 'Hazardous area classification respected', { weight: 15 }),
      pf('mud', 'Mud / cuttings handling contained', { weight: 15 }),
      pf('simops', 'SIMOPS / simultaneous operations controlled', {
        weight: 15,
      }),
    ],
  ),
  focusAudit(
    'Pipeline construction & ROW',
    'oil_gas',
    'Oil & Gas',
    'pipeline_row',
    EXC,
    'ROW access, ditching, stringing, welding, and backfill controls.',
    [
      pf('row', 'Right-of-way access and traffic controlled', { weight: 15 }),
      pf('ditch', 'Open ditch protected / shored as required', {
        weight: 20,
        critical: true,
      }),
      pf('stringing', 'Pipe stringing and handling per procedure', {
        weight: 15,
      }),
      pf('welding', 'Welding / NDE permits and fire watch in place', {
        weight: 20,
      }),
      pf('backfill', 'Padding and backfill protect coating', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Turnaround & SIMOPS',
    'oil_gas',
    'Oil & Gas',
    'turnaround_simops',
    SITE,
    'Blind lists, SIMOPS boards, permit to work, and night-shift handover.',
    [
      pf('ptw', 'Permit-to-work board accurate for shift', {
        weight: 25,
        critical: true,
      }),
      pf('blinds', 'Blind / isolation list verified in field', { weight: 20 }),
      pf('simops_ta', 'SIMOPS conflicts resolved before start', {
        weight: 20,
      }),
      pf('handover', 'Shift handover documented', { weight: 15 }),
      pf('scaffold_ta', 'Scaffold / access tags current in unit', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Flare, relief & venting',
    'oil_gas',
    'Oil & Gas',
    'flare_relief',
    FIRE,
    'Flare tip condition, knockout drums, ignition systems, and exclusion.',
    [
      pf('pilot', 'Flare pilot / ignition system confirmed', {
        weight: 20,
        critical: true,
      }),
      pf('knockout', 'Knockout drum levels within range', { weight: 15 }),
      pf('exclusion_f', 'Flare radiation exclusion zones marked', {
        weight: 20,
      }),
      pf('liquid', 'Liquid carryover controls inspected', { weight: 15 }),
      pf('relief_path', 'Relief path clear of isolation errors', {
        weight: 15,
      }),
    ],
  ),
  focusAudit(
    'Marine / tanker loading',
    'oil_gas',
    'Oil & Gas',
    'marine_loading',
    ENV,
    'Loading arms, ESD, vapor recovery, and mooring watch.',
    [
      pf('arms', 'Loading arms / hoses inspected and bonded', {
        weight: 20,
        critical: true,
      }),
      pf('esd', 'ESD and ship-shore link tested', { weight: 25 }),
      pf('vapor', 'Vapor recovery / inerting as required', { weight: 15 }),
      pf('mooring', 'Mooring watch and gangway secured', { weight: 15 }),
      pf('spill_m', 'Boom / spill response staged', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Compressor & rotating equipment',
    'oil_gas',
    'Oil & Gas',
    'compressors',
    PME,
    'Guarding, vibration, seals, and LOTO for rotating packages.',
    [
      pf('guards_r', 'Coupling and belt guards secured', {
        weight: 20,
        critical: true,
      }),
      pf('vibration', 'Abnormal vibration / noise investigated', {
        weight: 15,
      }),
      pf('seals', 'Seal / packing leakage within limits', { weight: 15 }),
      pf('loto_r', 'LOTO verified before maintenance', {
        weight: 25,
        critical: true,
      }),
      pf('lube', 'Lube oil levels and temperatures normal', { weight: 10 }),
    ],
  ),

  // —— Nuclear ——
  focusAudit(
    'Radiological work & RWP',
    'nuclear',
    'Nuclear',
    'radiological_rwp',
    ENV,
    'RWP compliance, dose rates, contamination control, and RP coverage.',
    [
      pf('rwp', 'Radiation work permit posted and briefed', {
        weight: 25,
        critical: true,
      }),
      pf('dose', 'Dose rates surveyed and ALARA actions taken', { weight: 20 }),
      pf('contam', 'Contamination controls / step-off pads in use', {
        weight: 20,
      }),
      pf('rp_cover', 'RP coverage present as required by RWP', { weight: 15 }),
      pf('dosimetry', 'Dosimetry worn correctly by all workers', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Foreign material exclusion (FME)',
    'nuclear',
    'Nuclear',
    'fme',
    SITE,
    'FME zones, tool accountability, covers, and retrieval plans.',
    [
      pf('zone_fme', 'FME zone established and posted', {
        weight: 20,
        critical: true,
      }),
      pf('accountability', 'Tool / material accountability current', {
        weight: 25,
        critical: true,
      }),
      pf('covers', 'Open systems covered when work stops', { weight: 15 }),
      pf('retrieval', 'FME retrieval plan available', { weight: 15 }),
      pf('briefing', 'FME briefing completed for crew', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Clearance & tagging (nuclear)',
    'nuclear',
    'Nuclear',
    'nuclear_clearance',
    TOOL,
    'Clearance orders, tagging accuracy, and independent verification.',
    [
      pf('clearance', 'Clearance / tagout order matches field tags', {
        weight: 25,
        critical: true,
      }),
      pf('iv', 'Independent verification performed', { weight: 20 }),
      pf('boundaries', 'Clearance boundaries walked down', { weight: 20 }),
      pf('temp_mods', 'Temporary modifications controlled', { weight: 15 }),
      pf('restoration', 'Restoration sequence understood', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Containment / RCA access',
    'nuclear',
    'Nuclear',
    'rca_access',
    ACCESS,
    'Access control, contamination monitoring, and dress-out.',
    [
      pf('access_rca', 'RCA / containment access authorized', {
        weight: 20,
        critical: true,
      }),
      pf('monitor', 'Portal / frisker monitors functional', { weight: 20 }),
      pf('dressout', 'Dress-out / undress sequence followed', { weight: 20 }),
      pf('tools_rca', 'Tools surveyed before exit', { weight: 15 }),
      pf('logs', 'Access logs complete', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Outage scaffold & temporary power',
    'nuclear',
    'Nuclear',
    'outage_scaffold_power',
    SCAFF,
    'Scaffold tags, seismic restraints, and temp power in nuclear outages.',
    [
      pf('scaffold_n', 'Scaffold tagged and seismically restrained', {
        weight: 25,
        critical: true,
      }),
      pf('temp_power_n', 'Temp power cords GFCI-protected and routed', {
        weight: 20,
      }),
      pf('combustible', 'Combustible load controlled in RCA', { weight: 15 }),
      pf('housekeeping_n', 'Housekeeping — no FME or trip hazards', {
        weight: 15,
      }),
      pf('fire_impair', 'Fire impairment permits current', { weight: 15 }),
    ],
  ),
  focusAudit(
    'Spent fuel & heavy lifts',
    'nuclear',
    'Nuclear',
    'spent_fuel_lifts',
    CRANE,
    'Fuel moves, heavy-lift plans, and pool / cask area controls.',
    [
      pf('lift_plan_n', 'Heavy-lift / fuel move plan approved', {
        weight: 25,
        critical: true,
      }),
      pf('pool', 'Pool / cask area FME and access controlled', { weight: 20 }),
      pf('crane_n', 'Crane / hoist inspections current', { weight: 20 }),
      pf('comms_n', 'Single point of control for lift communications', {
        weight: 15,
      }),
      pf('exclusion_n', 'Exclusion zone enforced during moves', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Nuclear construction & modifications',
    'nuclear',
    'Nuclear',
    'nuclear_construction',
    SITE,
    'Design change control, QA hold points, and plant impact reviews.',
    [
      pf('dcp', 'Design / configuration change approved', {
        weight: 25,
        critical: true,
      }),
      pf('qa_hold', 'QA hold / witness points honored', { weight: 20 }),
      pf('plant_impact', 'Plant impact / operability reviewed', { weight: 20 }),
      pf('materials', 'QA materials traceable to CMTR / CoC', { weight: 15 }),
      pf('housekeeping_nc', 'Construction housekeeping meets FME rules', {
        weight: 10,
      }),
    ],
  ),

  // —— Power generation ——
  focusAudit(
    'Boiler & high-energy piping',
    'power_generation',
    'Power Generation',
    'boiler_piping',
    FIRE,
    'Hot surfaces, expansion, hangers, and steam leak control.',
    [
      pf('insulation', 'Insulation / cladding intact on hot surfaces', {
        weight: 20,
      }),
      pf('hangers', 'Pipe hangers and supports inspected', { weight: 15 }),
      pf('leaks', 'Steam / water leaks tagged and controlled', {
        weight: 20,
        critical: true,
      }),
      pf('access_b', 'Safe access for inspection platforms', { weight: 15 }),
      pf('blowdown', 'Blowdown / drain paths clear and labeled', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Turbine hall rotating plant',
    'power_generation',
    'Power Generation',
    'turbine_hall',
    PME,
    'Guarding, oil systems, turning gear, and confined spaces under decks.',
    [
      pf('guards_th', 'Coupling and shaft guards secured', {
        weight: 25,
        critical: true,
      }),
      pf('lube_th', 'Lube oil system leaks and fire risk controlled', {
        weight: 20,
      }),
      pf('turning', 'Turning gear / barring procedures followed', {
        weight: 15,
      }),
      pf('underdeck', 'Under-deck confined space controls applied', {
        weight: 15,
      }),
      pf('hearing', 'Hearing protection enforced in turbine hall', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Switchyard & HV equipment',
    'power_generation',
    'Power Generation',
    'switchyard',
    POWER,
    'Clearances, grounding, SF6 awareness, and vehicle control in yards.',
    [
      pf('clearance_hv', 'HV clearances maintained for people / vehicles', {
        weight: 25,
        critical: true,
        energyType: 'electrical',
      }),
      pf('ground_hv', 'Personal protective grounds applied when required', {
        weight: 20,
      }),
      pf('sf6', 'SF6 leak / asphyxiation controls understood', { weight: 15 }),
      pf('vehicles_y', 'Vehicle height and escort rules followed', {
        weight: 15,
      }),
      pf('access_y', 'Switchyard access logged', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Coal / fuel handling',
    'power_generation',
    'Power Generation',
    'fuel_handling',
    ENV,
    'Conveyors, dust, fire, and confined spaces in fuel systems.',
    [
      pf('conveyor_f', 'Fuel conveyor guards and pull-cords OK', {
        weight: 20,
        critical: true,
      }),
      pf('dust_f', 'Dust collection and housekeeping adequate', { weight: 20 }),
      pf('fire_f', 'Hot work / fire watches in fuel areas', { weight: 15 }),
      pf('bunker', 'Bunker / silo entry controls applied', { weight: 20 }),
      pf('spontaneous', 'Stockpile / spontaneous combustion checks', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Ash / waste & environmental',
    'power_generation',
    'Power Generation',
    'ash_environmental',
    ENV,
    'Ash ponds, wastewater, air permits, and spill response.',
    [
      pf('pond', 'Ash / wastewater impoundment inspected', { weight: 20 }),
      pf('permits_e', 'Air / water permit conditions being met', {
        weight: 20,
      }),
      pf('spill_pg', 'Spill kits and drains controlled', { weight: 15 }),
      pf('fugitive', 'Fugitive dust / emissions controlled', { weight: 15 }),
      pf('records_e', 'Environmental inspection records current', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Outage construction & heavy lifts',
    'power_generation',
    'Power Generation',
    'outage_construction',
    CRANE,
    'Outage lifts, laydown, scaffolding, and energy isolation coordination.',
    [
      pf('lift_pg', 'Critical lift plans approved for outage', {
        weight: 25,
        critical: true,
      }),
      pf('isolation_pg', 'Unit isolation / LOTO coordinated with ops', {
        weight: 25,
        critical: true,
      }),
      pf('scaffold_pg', 'Scaffold and access systems tagged', { weight: 15 }),
      pf('laydown_pg', 'Laydown and exclusion zones enforced', { weight: 15 }),
      pf('night', 'Night-shift lighting and supervision adequate', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Control room & human performance',
    'power_generation',
    'Power Generation',
    'control_room_hu',
    SITE,
    'Procedures, peer checks, alarms, and distraction control.',
    [
      pf('procedures_cr', 'Operating procedures in use at console', {
        weight: 20,
      }),
      pf('peer', 'Peer check / concurrent verification used', {
        weight: 20,
        critical: true,
      }),
      pf('alarms_cr', 'Alarm response priorities understood', { weight: 15 }),
      pf('distraction', 'Distraction-free zone enforced during critical tasks', {
        weight: 15,
      }),
      pf('turnover', 'Board turnover complete and documented', { weight: 15 }),
    ],
  ),

  // —— Wind ——
  focusAudit(
    'Turbine climb & rescue',
    'wind',
    'Wind Energy',
    'turbine_climb_rescue',
    FALL,
    'Climb assist, fall arrest, rescue kits, and weather holds.',
    [
      pf('climb_assist', 'Climb assist / lift inspected before use', {
        weight: 20,
      }),
      pf('fall_arrest', 'Fall arrest systems inspected and worn', {
        weight: 25,
        critical: true,
      }),
      pf('rescue_w', 'Tower rescue kit present and in date', {
        weight: 20,
        critical: true,
      }),
      pf('weather_w', 'Wind / lightning hold criteria applied', { weight: 15 }),
      pf('buddy_w', 'Two-person rule / radio check completed', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Nacelle LOTO & hub work',
    'wind',
    'Wind Energy',
    'nacelle_loto',
    TOOL,
    'Rotor lock, electrical LOTO, hub access, and dropped-object control.',
    [
      pf('rotor_lock', 'Rotor lock engaged and verified', {
        weight: 25,
        critical: true,
      }),
      pf('elec_loto', 'Electrical LOTO complete before work', {
        weight: 25,
        critical: true,
      }),
      pf('hub', 'Hub access procedures followed', { weight: 15 }),
      pf('drop', 'Dropped-object prevention in nacelle', { weight: 15 }),
      pf('comms_w', 'Base / nacelle communications verified', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Blade work & rope access',
    'wind',
    'Wind Energy',
    'blade_rope',
    FALL,
    'Rope access certification, anchorages, exclusion, and weather.',
    [
      pf('cert_ra', 'Rope access technicians certified', {
        weight: 25,
        critical: true,
      }),
      pf('anchors', 'Anchorages inspected / dual attachment', { weight: 20 }),
      pf('exclusion_b', 'Ground exclusion zone enforced', { weight: 15 }),
      pf('tools_b', 'Tool tethering in use', { weight: 15 }),
      pf('weather_b', 'Weather limits for blade work applied', { weight: 15 }),
    ],
  ),
  focusAudit(
    'Wind farm construction & cranage',
    'wind',
    'Wind Energy',
    'wind_construction',
    CRANE,
    'Component lifts, transport, foundations, and public road interfaces.',
    [
      pf('foundation', 'Foundation / embed QA hold points complete', {
        weight: 20,
      }),
      pf('transport', 'Blade / tower transport escorts in place', {
        weight: 15,
      }),
      pf('crane_w', 'Crane set-up and lift plans for components', {
        weight: 25,
        critical: true,
      }),
      pf('pad', 'Hardstand / pad bearing capacity verified', { weight: 15 }),
      pf('public', 'Public road closures / escorts coordinated', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Collection system & MV electrical',
    'wind',
    'Wind Energy',
    'collection_mv',
    POWER,
    'Pad-mount transformers, trenching, terminations, and grounding.',
    [
      pf('trench_w', 'Cable trench shoring / barricades', { weight: 15 }),
      pf('grounding_w', 'Equipment grounding complete before energization', {
        weight: 25,
        critical: true,
      }),
      pf('terminations', 'MV terminations per manufacturer procedure', {
        weight: 20,
      }),
      pf('padmount', 'Pad-mount clearances and locks', { weight: 15 }),
      pf('switching_w', 'Switching orders authorized', { weight: 15 }),
    ],
  ),
  focusAudit(
    'Site access roads & crane pads',
    'wind',
    'Wind Energy',
    'roads_pads',
    VEHICLE,
    'Road condition, berms, drainage, and soft-ground recovery.',
    [
      pf('road', 'Access roads passable / graded', { weight: 15 }),
      pf('pad_c', 'Crane pads free of soft spots / voids', {
        weight: 25,
        critical: true,
      }),
      pf('drainage', 'Drainage prevents washouts', { weight: 15 }),
      pf('recovery', 'Recovery / tow plan for stuck vehicles', { weight: 10 }),
      pf('speed_w', 'Site speed limits posted and followed', { weight: 15 }),
    ],
  ),
  focusAudit(
    'Yaw / pitch hydraulic systems',
    'wind',
    'Wind Energy',
    'yaw_pitch_hydraulics',
    PME,
    'Hydraulic isolation, pressure release, and hose integrity.',
    [
      pf('pressure', 'Hydraulic pressure released before break-in', {
        weight: 25,
        critical: true,
        energyType: 'hydraulic',
      }),
      pf('isolation_h', 'Hydraulic isolation verified', { weight: 20 }),
      pf('hoses', 'Hoses and fittings free of damage / leaks', { weight: 15 }),
      pf('ppe_h', 'Face shield / PPE for hydraulic injection risk', {
        weight: 15,
      }),
      pf('spill_h', 'Oil spill control in nacelle', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Substation & interconnection',
    'wind',
    'Wind Energy',
    'wind_substation',
    POWER,
    'Substation access, switching, grounding, and wildlife barriers.',
    [
      pf('access_ss', 'Substation access authorized and logged', {
        weight: 20,
        critical: true,
      }),
      pf('switching_ss', 'Switching order followed under supervision', {
        weight: 25,
        critical: true,
      }),
      pf('grounds_ss', 'Protective grounds applied when required', {
        weight: 20,
      }),
      pf('wildlife', 'Wildlife / bird barriers intact', { weight: 10 }),
      pf('fence', 'Perimeter fence and gates secured', { weight: 10 }),
    ],
  ),
  focusAudit(
    'O&M warehouse & tooling',
    'wind',
    'Wind Energy',
    'wind_om_warehouse',
    TOOL,
    'Torque tools, calibrated gear, spare parts, and chemical storage.',
    [
      pf('torque', 'Torque tools calibrated and within date', {
        weight: 20,
        critical: true,
      }),
      pf('calibration', 'Meters / multimeters calibration current', {
        weight: 15,
      }),
      pf('parts', 'Critical spares inventory controlled', { weight: 10 }),
      pf('chem_w', 'Oils / chemicals labeled and segregated', { weight: 15 }),
      pf('housekeeping_w', 'Warehouse aisles clear / racking secured', {
        weight: 15,
      }),
    ],
  ),
  focusAudit(
    'Met mast & meteorological',
    'wind',
    'Wind Energy',
    'met_mast',
    FALL,
    'Mast climb, guy wires, instrumentation, and public exclusion.',
    [
      pf('guys', 'Guy wires tensioned and marked', { weight: 20 }),
      pf('climb_m', 'Mast climb fall protection used', {
        weight: 25,
        critical: true,
      }),
      pf('instruments', 'Anemometers / sensors secured', { weight: 15 }),
      pf('exclusion_m', 'Public exclusion / fencing adequate', { weight: 15 }),
      pf('lightning_m', 'Lightning / weather hold followed', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Commissioning & energization',
    'wind',
    'Wind Energy',
    'wind_commissioning',
    POWER,
    'Pre-energization checks, punchlist, and first-rotation controls.',
    [
      pf('punch', 'Safety punchlist closed before energization', {
        weight: 25,
        critical: true,
      }),
      pf('protections', 'Protection / trip settings verified', { weight: 20 }),
      pf('first_rot', 'First rotation exclusion and watch posted', {
        weight: 20,
      }),
      pf('scada', 'SCADA / remote stop verified', { weight: 15 }),
      pf('handover_w', 'Construction-to-O&M handover documented', {
        weight: 10,
      }),
    ],
  ),

  // —— Mining (additional ops + construction) ——
  focusAudit(
    'Blasting & explosives',
    'mining',
    'Mining',
    'blasting_explosives',
    SITE,
    'Magazine, transport, blast exclusion, and misfire procedures.',
    [
      pf('magazine', 'Magazine inventory and security current', {
        weight: 25,
        critical: true,
      }),
      pf('transport_e', 'Explosives transport rules followed', { weight: 20 }),
      pf('exclusion_bl', 'Blast exclusion zone cleared and guarded', {
        weight: 25,
        critical: true,
      }),
      pf('misfire', 'Misfire procedure posted and understood', { weight: 15 }),
      pf('radio', 'Radio silence / initiation controls applied', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Surface mobile equipment',
    'mining',
    'Mining',
    'surface_mobile',
    PME,
    'Haul trucks, dozers, interactions, and pre-use inspections.',
    [
      pf('preuse', 'Pre-use inspection completed', { weight: 20 }),
      pf('interaction', 'Light vehicle / heavy interaction rules', {
        weight: 25,
        critical: true,
      }),
      pf('berms', 'Dump berms and windrows adequate', { weight: 20 }),
      pf('seatbelt', 'Seatbelts / restraints worn', { weight: 15 }),
      pf('parking', 'Parking / chocking on grade correct', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Mine ventilation & gas',
    'mining',
    'Mining',
    'ventilation_gas',
    ENV,
    'Fans, airflow, gas monitors, and refuge chambers.',
    [
      pf('airflow', 'Airflow meets design at workplace', {
        weight: 25,
        critical: true,
      }),
      pf('gas_mon', 'Gas monitors calibrated and used', {
        weight: 25,
        critical: true,
      }),
      pf('fans', 'Main / auxiliary fans status known', { weight: 15 }),
      pf('refuge', 'Refuge chamber inspected and stocked', { weight: 15 }),
      pf('doors', 'Ventilation doors / seals functional', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Process plant & mills',
    'mining',
    'Mining',
    'process_plant',
    PME,
    'Mills, thickeners, reagents, and confined spaces in process.',
    [
      pf('guards_m', 'Mill / agitator guards secured', {
        weight: 20,
        critical: true,
      }),
      pf('reagents', 'Reagent storage and bunding adequate', { weight: 20 }),
      pf('confined_p', 'Confined space permits for tanks / thickeners', {
        weight: 20,
        critical: true,
      }),
      pf('isolation_p', 'Isolation verified before liner / mill work', {
        weight: 20,
      }),
      pf('spill_p', 'Process spill response staged', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Decline / portal construction',
    'mining',
    'Mining',
    'decline_portal',
    EXC,
    'Portal stability, traffic, services install, and ground support QA.',
    [
      pf('portal', 'Portal ground support per design', {
        weight: 25,
        critical: true,
      }),
      pf('traffic_d', 'Decline traffic light / radio rules', { weight: 20 }),
      pf('services_d', 'Services install not creating trip / struck-by', {
        weight: 15,
      }),
      pf('qa_gs', 'Ground support QA / pull tests recorded', { weight: 15 }),
      pf('egress_d', 'Emergency egress / refuge plan current', { weight: 15 }),
    ],
  ),
  focusAudit(
    'Camp & contractor village',
    'mining',
    'Mining',
    'camp_village',
    SITE,
    'Fire, hygiene, emergency response, and fatigue management at camp.',
    [
      pf('fire_camp', 'Fire detection / extinguishers current', {
        weight: 20,
        critical: true,
      }),
      pf('hygiene', 'Kitchen / laundry hygiene controls', { weight: 15 }),
      pf('emergency_c', 'Muster / emergency response drills current', {
        weight: 20,
      }),
      pf('fatigue', 'Roster / fatigue rules being followed', { weight: 15 }),
      pf('security_c', 'Camp access / alcohol policy enforced', { weight: 10 }),
    ],
  ),

  // —— Oil & Gas (additional) ——
  focusAudit(
    'Hot work in process units',
    'oil_gas',
    'Oil & Gas',
    'hot_work_process',
    HOT,
    'Gas testing, fire watch, spark containment, and isolations.',
    [
      pf('gas_test', 'Gas test within time limits before hot work', {
        weight: 25,
        critical: true,
      }),
      pf('fire_watch', 'Fire watch present with extinguisher', {
        weight: 20,
        critical: true,
      }),
      pf('spark', 'Spark / slag containment adequate', { weight: 15 }),
      pf('isolation_hw', 'Process isolation verified for hot work', {
        weight: 20,
      }),
      pf('closeout', 'Fire watch duration after hot work completed', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Tank farm & storage',
    'oil_gas',
    'Oil & Gas',
    'tank_farm',
    ENV,
    'Bund integrity, overfill, foam systems, and vehicle controls.',
    [
      pf('bund', 'Bund walls / floors intact and drained correctly', {
        weight: 20,
        critical: true,
      }),
      pf('overfill', 'Overfill protection / alarms functional', {
        weight: 20,
      }),
      pf('foam', 'Foam / firewater systems accessible', { weight: 15 }),
      pf('vehicles_t', 'Vehicle / ignition source controls in farm', {
        weight: 15,
      }),
      pf('gauging', 'Gauging / sampling procedures followed', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Pigging & pipeline ops',
    'oil_gas',
    'Oil & Gas',
    'pigging_ops',
    CONF,
    'Launcher/receiver procedures, pressure, and trapped energy.',
    [
      pf('procedure_pig', 'Pigging procedure / JSA briefed', {
        weight: 20,
        critical: true,
      }),
      pf('pressure_pig', 'Vessel depressured before opening', {
        weight: 25,
        critical: true,
      }),
      pf('trapped', 'Trapped pressure / product controlled', { weight: 20 }),
      pf('exclusion_pig', 'Exclusion during launch / receive', { weight: 15 }),
      pf('waste_pig', 'Pig waste / liquids contained', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Facility construction & brownfield',
    'oil_gas',
    'Oil & Gas',
    'facility_brownfield',
    SITE,
    'Live plant interfaces, excavating near lines, and lifting over process.',
    [
      pf('live_plant', 'Live plant interface hazards briefed', {
        weight: 25,
        critical: true,
      }),
      pf('excavate_og', 'Excavation near pipelines / cables controlled', {
        weight: 20,
        critical: true,
      }),
      pf('lift_over', 'Lifts over live process approved', { weight: 20 }),
      pf('scaffold_og', 'Scaffold tags and access to height OK', {
        weight: 15,
      }),
      pf('housekeeping_og', 'Construction debris kept out of process', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'H2S / toxic gas readiness',
    'oil_gas',
    'Oil & Gas',
    'h2s_toxic',
    ENV,
    'Monitors, escape respirators, wind direction, and muster.',
    [
      pf('monitors_h2s', 'Personal H2S monitors on and bump-tested', {
        weight: 25,
        critical: true,
      }),
      pf('escape', 'Escape respirators available and inspected', {
        weight: 20,
        critical: true,
      }),
      pf('wind_h2s', 'Wind direction known / upwind work preferred', {
        weight: 15,
      }),
      pf('muster_h2s', 'Muster points and alarms understood', { weight: 15 }),
      pf('buddy_h2s', 'Buddy system in H2S areas', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Offshore / platform marine',
    'oil_gas',
    'Oil & Gas',
    'offshore_platform',
    SITE,
    'Boat landing, helideck, life-saving appliances, and dropped objects.',
    [
      pf('boat', 'Boat landing / transfer procedures followed', {
        weight: 20,
        critical: true,
      }),
      pf('helideck', 'Helideck FOD and fire readiness', { weight: 15 }),
      pf('lsa', 'Life rafts / LSA inspections current', { weight: 20 }),
      pf('dropped', 'Dropped-object surveys / secondary retention', {
        weight: 20,
      }),
      pf('overboard', 'Overboard discharge / permit controls', { weight: 10 }),
    ],
  ),

  // —— Nuclear (additional) ——
  focusAudit(
    'Fire impairment & Appendix R',
    'nuclear',
    'Nuclear',
    'fire_impairment',
    FIRE,
    'Impairment permits, compensatory measures, and combustible control.',
    [
      pf('impairment', 'Fire impairment permit active and posted', {
        weight: 25,
        critical: true,
      }),
      pf('compensatory', 'Compensatory measures in place', { weight: 20 }),
      pf('combustible_n', 'Combustible loading within limits', { weight: 20 }),
      pf('detection', 'Detection / suppression status known', { weight: 15 }),
      pf('hot_work_n', 'Hot work coordinated with fire ops', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Emergency preparedness drill',
    'nuclear',
    'Nuclear',
    'ep_drill',
    SITE,
    'Classification, notifications, accountability, and OSC readiness.',
    [
      pf('class', 'Emergency classification criteria understood', {
        weight: 20,
      }),
      pf('notify', 'Notification / call-out process ready', { weight: 20 }),
      pf('account', 'Personnel accountability process functional', {
        weight: 20,
        critical: true,
      }),
      pf('osc', 'OSC / TSC equipment and kits current', { weight: 15 }),
      pf('evac', 'Evacuation routes clear and marked', { weight: 15 }),
    ],
  ),
  focusAudit(
    'Chemistry & effluent control',
    'nuclear',
    'Nuclear',
    'chemistry_effluent',
    ENV,
    'Sampling, releases, spill control, and lab PPE.',
    [
      pf('sampling', 'Sampling procedures and labels correct', { weight: 20 }),
      pf('release', 'Liquid / gaseous release permits followed', {
        weight: 25,
        critical: true,
      }),
      pf('spill_chem', 'Chemical spill kits staged', { weight: 15 }),
      pf('lab_ppe', 'Lab PPE and eyewash available', { weight: 15 }),
      pf('records_chem', 'Chemistry records / trends reviewed', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Security & vital area',
    'nuclear',
    'Nuclear',
    'security_vital',
    ACCESS,
    'Badging, package searches, vital area barriers, and two-person rule.',
    [
      pf('badge', 'Badges / access rights match work location', {
        weight: 20,
        critical: true,
      }),
      pf('search', 'Package / vehicle search completed', { weight: 15 }),
      pf('barriers', 'Vital area barriers intact', { weight: 25 }),
      pf('two_person', 'Two-person rule applied where required', {
        weight: 20,
      }),
      pf('tailgate', 'No tailgating through portals', { weight: 10 }),
    ],
  ),
  focusAudit(
    'ISI / NDE & weld quality',
    'nuclear',
    'Nuclear',
    'isi_nde',
    SITE,
    'NDE safety, radiation with sources, and weld traveler control.',
    [
      pf('source', 'Radiography exclusion and source control', {
        weight: 25,
        critical: true,
      }),
      pf('traveler', 'Weld traveler / traveler hold points followed', {
        weight: 20,
      }),
      pf('nde_ppe', 'NDE chemical / UV PPE used', { weight: 15 }),
      pf('access_isi', 'ISI access platforms secure', { weight: 15 }),
      pf('records_isi', 'NDE records complete before close-out', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'New-build nuclear construction',
    'nuclear',
    'Nuclear',
    'nuclear_newbuild',
    SITE,
    'Module lifts, rebar/concrete ITP, cleanliness, and craft qualifications.',
    [
      pf('module', 'Module / heavy lift plan approved', {
        weight: 25,
        critical: true,
      }),
      pf('itp', 'Concrete / rebar ITP hold points signed', { weight: 20 }),
      pf('clean', 'Zone cleanliness / FME for safety-related work', {
        weight: 20,
      }),
      pf('craft', 'Craft qualifications / weld stamps verified', {
        weight: 15,
      }),
      pf('storage', 'Safety-related material storage controlled', {
        weight: 10,
      }),
    ],
  ),

  // —— Power generation (additional) ——
  focusAudit(
    'Cooling water & intake',
    'power_generation',
    'Power Generation',
    'cooling_intake',
    ENV,
    'Intake screens, chlorine, confined spaces, and marine life controls.',
    [
      pf('screens', 'Intake screens / trash racks clear', { weight: 20 }),
      pf('chlorine', 'Chlorine / biocide handling controls', {
        weight: 20,
        critical: true,
      }),
      pf('confined_cw', 'Confined space for pits / tunnels controlled', {
        weight: 20,
        critical: true,
      }),
      pf('marine', 'Marine life / environmental controls followed', {
        weight: 15,
      }),
      pf('access_cw', 'Walkways and grating secured over water', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Battery rooms & UPS',
    'power_generation',
    'Power Generation',
    'battery_ups',
    POWER,
    'Ventilation, PPE for batteries, spill control, and arc hazards.',
    [
      pf('vent_bat', 'Battery room ventilation operating', {
        weight: 20,
        critical: true,
      }),
      pf('ppe_bat', 'Acid / arc PPE available and used', { weight: 20 }),
      pf('spill_bat', 'Neutralizer / spill kits staged', { weight: 15 }),
      pf('clearances_bat', 'Live bus clearances maintained', {
        weight: 20,
        critical: true,
      }),
      pf('housekeeping_bat', 'No storage of combustibles in battery room', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Hydro / dam operations',
    'power_generation',
    'Power Generation',
    'hydro_dam',
    SITE,
    'Gate operations, spillway, public safety, and confined spaces.',
    [
      pf('gates', 'Gate / hoist operations per procedure', {
        weight: 25,
        critical: true,
      }),
      pf('spillway_h', 'Spillway / stilling basin inspected', { weight: 15 }),
      pf('public_h', 'Public safety barriers at reservoir', { weight: 15 }),
      pf('confined_h', 'Penstock / gallery entry controls', { weight: 20 }),
      pf('seepage_h', 'Seepage / instrumentation reviewed', { weight: 10 }),
    ],
  ),
  focusAudit(
    'Gas turbine & HRSG',
    'power_generation',
    'Power Generation',
    'gt_hrsg',
    FIRE,
    'Fuel gas, purge, HRSG entry, and high-energy line breaks.',
    [
      pf('purge', 'Purge / start permissives verified', {
        weight: 25,
        critical: true,
      }),
      pf('fuel_gas', 'Fuel gas leak checks / detectors OK', { weight: 20 }),
      pf('hrsg_entry', 'HRSG confined space / heat controls', { weight: 20 }),
      pf('helb', 'High-energy line break exclusion understood', {
        weight: 15,
      }),
      pf('fire_gt', 'Turbine enclosure fire system status known', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Plant construction & tie-ins',
    'power_generation',
    'Power Generation',
    'plant_tieins',
    SITE,
    'Brownfield tie-ins, hydrotests, energization boundaries, and SIMOPS.',
    [
      pf('tiein', 'Tie-in package / isolation approved', {
        weight: 25,
        critical: true,
      }),
      pf('hydrotest', 'Hydrotest exclusion and relief path set', {
        weight: 20,
      }),
      pf('energize', 'Energization boundary marked and briefed', {
        weight: 20,
      }),
      pf('simops_pg', 'Construction / ops SIMOPS board current', {
        weight: 15,
      }),
      pf('housekeeping_pg', 'Laydown not blocking fire / egress routes', {
        weight: 10,
      }),
    ],
  ),
  focusAudit(
    'Chemical unloading & water treatment',
    'power_generation',
    'Power Generation',
    'chem_water_treatment',
    ENV,
    'Acid/caustic unloading, eyewash, bunding, and PPE.',
    [
      pf('unloading', 'Unloading checklist and grounding complete', {
        weight: 25,
        critical: true,
      }),
      pf('eyewash', 'Eyewash / safety showers tested', { weight: 20 }),
      pf('bund_chem', 'Chemical bunds and tanks intact', { weight: 15 }),
      pf('ppe_chem', 'Chemical PPE matched to SDS', { weight: 15 }),
      pf('spill_wt', 'Spill response for acids / caustics staged', {
        weight: 10,
      }),
    ],
  ),
];
