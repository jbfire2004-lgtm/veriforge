"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPANDED_FOCUS_AUDIT_TEMPLATES = void 0;
const pm_inspection_focus_audits_constants_1 = require("./pm-inspection-focus-audits.constants");
const SITE = 'SITE';
const TOOL = 'TOOL';
const ENV = 'ENVIRONMENTAL';
const FIRE = 'FIRE_PROTECTION';
const ACCESS = 'ACCESS_EGRESS';
const FALL = 'FALL_PROTECTION';
const CONF = 'CONFINED_SPACE';
const HOT = 'HOT_WORK';
const EXC = 'EXCAVATION';
const POWER = 'TEMPORARY_POWER';
const CRANE = 'CRANE';
const PME = 'PME';
const VEHICLE = 'VEHICLE';
const SCAFF = 'SCAFFOLDING';
exports.EXPANDED_FOCUS_AUDIT_TEMPLATES = [
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Concrete & formwork operations', 'construction', 'Construction', 'concrete_formwork', SITE, 'Formwork design, shores, pour rates, and strike criteria.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('form_design', 'Formwork / shoring per engineered drawings', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('inspection_pre', 'Pre-pour inspection signed by competent person', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('pour_rate', 'Pour rate and vibration within design limits', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('edge_protect', 'Formwork edges protected / fall controls', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('strike', 'Strike / strip criteria understood by crew', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Steel erection & structural', 'construction', 'Construction', 'steel_erection', FALL, 'Bolting, decking, fall protection, and multi-lift control.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('decking', 'Decking and flooring sequence per plan', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('bolting', 'Connections bolted before releasing load', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('fall_steel', 'Fall protection continuous during erection', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('multi_lift', 'Multiple-lift rigging only when allowed', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('site_control', 'Controlled decking zone marked', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Demolition & strip-out', 'construction', 'Construction', 'demolition', SITE, 'Engineering survey, utilities, soft strip, and debris control.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('survey', 'Engineering / structural survey completed', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('utilities_d', 'Utilities isolated and verified', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('soft_strip', 'Soft strip sequence followed', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('debris', 'Debris chutes / drop zones controlled', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('dust', 'Dust and silica controls in place', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Traffic & public interface', 'construction', 'Construction', 'traffic_public', VEHICLE, 'TMP, flaggers, pedestrian routes, and public protection.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('tmp', 'Traffic management plan posted and followed', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('flaggers', 'Flaggers trained and positioned', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('ped_route', 'Public pedestrian routes protected', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('barricades_t', 'Barricades / fencing secure after hours', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('signage_t', 'Advance warning signs in place', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Crane set-up & ground bearing', 'construction', 'Construction', 'crane_setup', CRANE, 'Outriggers, mats, underground hazards, and counterweights.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('mats', 'Outrigger mats / pads sized for ground bearing', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('underground', 'Underground services / voids assessed', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('level', 'Crane leveled and swing clearances verified', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('counterweight', 'Counterweights installed per chart', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('radius', 'Working radius / load chart posted in cab', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Conveyor & crushing plant', 'mining', 'Mining', 'conveyor_crushing', PME, 'Guarding, pull-cords, isolation, and housekeeping at crushers.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('guards_c', 'Conveyor nip / tail / head guards in place', {
            weight: 25,
            critical: true,
            energyType: 'mechanical',
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('pull_cord', 'Emergency pull-cords tested', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('isolation_c', 'Isolation verified before belt work', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('spillage', 'Spillage and buildup controlled', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('access_c', 'Safe access for clean-up and inspection', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Underground development headings', 'mining', 'Mining', 'ug_development', SITE, 'Ground support, face conditions, services, and traffic in headings.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('support', 'Ground support installed per design', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('face', 'Face scaled and inspected before entry', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('services_ug', 'Air / water / power services secured', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('traffic_ug', 'Heading traffic / equipment rules followed', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('survey', 'Survey / grade control hazards managed', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Tailings & water management', 'mining', 'Mining', 'tailings_water', ENV, 'Dam inspection, freeboard, seepage, and spillway readiness.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('freeboard', 'Freeboard / water level within criteria', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('seepage', 'Seepage points inspected and logged', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('spillway', 'Spillway / overflow clear of debris', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('access_t', 'Dam crest access controlled', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('instrument', 'Instrumentation readings current', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Mine construction & civils', 'mining', 'Mining', 'mine_civils', SITE, 'Earthworks, foundations, laydown, and contractor interfaces on mine builds.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('geotech', 'Geotech recommendations followed for excavations', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('foundations', 'Foundation pours / embeds per ITP', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('laydown', 'Laydown and lifting zones controlled', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('interface', 'Owner / contractor interface permits current', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('env_civils', 'Erosion and sediment controls in place', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Shaft & hoist operations', 'mining', 'Mining', 'shaft_hoist', CRANE, 'Hoist signaling, conveyance, shaft inspection, and winders.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('signals', 'Hoist signals understood and tested', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('conveyance', 'Conveyance / cage inspection current', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('shaft_insp', 'Shaft examination schedule followed', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('winder', 'Winder / brake tests documented', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('persons', 'Persons / material conveyance rules followed', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Dust, silica & respiratory', 'mining', 'Mining', 'dust_respiratory', ENV, 'Suppression, monitoring, fit-testing, and restricted areas.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('suppression', 'Water / chemical dust suppression operating', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('monitoring_d', 'Personal / area dust monitoring current', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('respirators', 'Respirators fit-tested and stored correctly', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('restricted', 'High-dust areas posted and controlled', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('cleaning', 'Dry sweeping prohibited / HEPA used', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Wellsite & drilling operations', 'oil_gas', 'Oil & Gas', 'wellsite_drilling', SITE, 'BOP, well control drills, hazardous zones, and third-party interfaces.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('bop', 'BOP / well control equipment tested and certified', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('drill_wc', 'Well control drill within required interval', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('zones', 'Hazardous area classification respected', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('mud', 'Mud / cuttings handling contained', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('simops', 'SIMOPS / simultaneous operations controlled', {
            weight: 15,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Pipeline construction & ROW', 'oil_gas', 'Oil & Gas', 'pipeline_row', EXC, 'ROW access, ditching, stringing, welding, and backfill controls.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('row', 'Right-of-way access and traffic controlled', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('ditch', 'Open ditch protected / shored as required', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('stringing', 'Pipe stringing and handling per procedure', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('welding', 'Welding / NDE permits and fire watch in place', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('backfill', 'Padding and backfill protect coating', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Turnaround & SIMOPS', 'oil_gas', 'Oil & Gas', 'turnaround_simops', SITE, 'Blind lists, SIMOPS boards, permit to work, and night-shift handover.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('ptw', 'Permit-to-work board accurate for shift', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('blinds', 'Blind / isolation list verified in field', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('simops_ta', 'SIMOPS conflicts resolved before start', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('handover', 'Shift handover documented', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('scaffold_ta', 'Scaffold / access tags current in unit', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Flare, relief & venting', 'oil_gas', 'Oil & Gas', 'flare_relief', FIRE, 'Flare tip condition, knockout drums, ignition systems, and exclusion.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('pilot', 'Flare pilot / ignition system confirmed', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('knockout', 'Knockout drum levels within range', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('exclusion_f', 'Flare radiation exclusion zones marked', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('liquid', 'Liquid carryover controls inspected', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('relief_path', 'Relief path clear of isolation errors', {
            weight: 15,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Marine / tanker loading', 'oil_gas', 'Oil & Gas', 'marine_loading', ENV, 'Loading arms, ESD, vapor recovery, and mooring watch.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('arms', 'Loading arms / hoses inspected and bonded', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('esd', 'ESD and ship-shore link tested', { weight: 25 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('vapor', 'Vapor recovery / inerting as required', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('mooring', 'Mooring watch and gangway secured', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('spill_m', 'Boom / spill response staged', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Compressor & rotating equipment', 'oil_gas', 'Oil & Gas', 'compressors', PME, 'Guarding, vibration, seals, and LOTO for rotating packages.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('guards_r', 'Coupling and belt guards secured', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('vibration', 'Abnormal vibration / noise investigated', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('seals', 'Seal / packing leakage within limits', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('loto_r', 'LOTO verified before maintenance', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('lube', 'Lube oil levels and temperatures normal', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Radiological work & RWP', 'nuclear', 'Nuclear', 'radiological_rwp', ENV, 'RWP compliance, dose rates, contamination control, and RP coverage.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('rwp', 'Radiation work permit posted and briefed', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('dose', 'Dose rates surveyed and ALARA actions taken', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('contam', 'Contamination controls / step-off pads in use', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('rp_cover', 'RP coverage present as required by RWP', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('dosimetry', 'Dosimetry worn correctly by all workers', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Foreign material exclusion (FME)', 'nuclear', 'Nuclear', 'fme', SITE, 'FME zones, tool accountability, covers, and retrieval plans.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('zone_fme', 'FME zone established and posted', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('accountability', 'Tool / material accountability current', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('covers', 'Open systems covered when work stops', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('retrieval', 'FME retrieval plan available', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('briefing', 'FME briefing completed for crew', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Clearance & tagging (nuclear)', 'nuclear', 'Nuclear', 'nuclear_clearance', TOOL, 'Clearance orders, tagging accuracy, and independent verification.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('clearance', 'Clearance / tagout order matches field tags', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('iv', 'Independent verification performed', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('boundaries', 'Clearance boundaries walked down', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('temp_mods', 'Temporary modifications controlled', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('restoration', 'Restoration sequence understood', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Containment / RCA access', 'nuclear', 'Nuclear', 'rca_access', ACCESS, 'Access control, contamination monitoring, and dress-out.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('access_rca', 'RCA / containment access authorized', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('monitor', 'Portal / frisker monitors functional', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('dressout', 'Dress-out / undress sequence followed', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('tools_rca', 'Tools surveyed before exit', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('logs', 'Access logs complete', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Outage scaffold & temporary power', 'nuclear', 'Nuclear', 'outage_scaffold_power', SCAFF, 'Scaffold tags, seismic restraints, and temp power in nuclear outages.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('scaffold_n', 'Scaffold tagged and seismically restrained', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('temp_power_n', 'Temp power cords GFCI-protected and routed', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('combustible', 'Combustible load controlled in RCA', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('housekeeping_n', 'Housekeeping — no FME or trip hazards', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('fire_impair', 'Fire impairment permits current', { weight: 15 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Spent fuel & heavy lifts', 'nuclear', 'Nuclear', 'spent_fuel_lifts', CRANE, 'Fuel moves, heavy-lift plans, and pool / cask area controls.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('lift_plan_n', 'Heavy-lift / fuel move plan approved', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('pool', 'Pool / cask area FME and access controlled', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('crane_n', 'Crane / hoist inspections current', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('comms_n', 'Single point of control for lift communications', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('exclusion_n', 'Exclusion zone enforced during moves', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Nuclear construction & modifications', 'nuclear', 'Nuclear', 'nuclear_construction', SITE, 'Design change control, QA hold points, and plant impact reviews.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('dcp', 'Design / configuration change approved', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('qa_hold', 'QA hold / witness points honored', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('plant_impact', 'Plant impact / operability reviewed', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('materials', 'QA materials traceable to CMTR / CoC', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('housekeeping_nc', 'Construction housekeeping meets FME rules', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Boiler & high-energy piping', 'power_generation', 'Power Generation', 'boiler_piping', FIRE, 'Hot surfaces, expansion, hangers, and steam leak control.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('insulation', 'Insulation / cladding intact on hot surfaces', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('hangers', 'Pipe hangers and supports inspected', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('leaks', 'Steam / water leaks tagged and controlled', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('access_b', 'Safe access for inspection platforms', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('blowdown', 'Blowdown / drain paths clear and labeled', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Turbine hall rotating plant', 'power_generation', 'Power Generation', 'turbine_hall', PME, 'Guarding, oil systems, turning gear, and confined spaces under decks.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('guards_th', 'Coupling and shaft guards secured', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('lube_th', 'Lube oil system leaks and fire risk controlled', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('turning', 'Turning gear / barring procedures followed', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('underdeck', 'Under-deck confined space controls applied', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('hearing', 'Hearing protection enforced in turbine hall', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Switchyard & HV equipment', 'power_generation', 'Power Generation', 'switchyard', POWER, 'Clearances, grounding, SF6 awareness, and vehicle control in yards.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('clearance_hv', 'HV clearances maintained for people / vehicles', {
            weight: 25,
            critical: true,
            energyType: 'electrical',
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('ground_hv', 'Personal protective grounds applied when required', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('sf6', 'SF6 leak / asphyxiation controls understood', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('vehicles_y', 'Vehicle height and escort rules followed', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('access_y', 'Switchyard access logged', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Coal / fuel handling', 'power_generation', 'Power Generation', 'fuel_handling', ENV, 'Conveyors, dust, fire, and confined spaces in fuel systems.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('conveyor_f', 'Fuel conveyor guards and pull-cords OK', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('dust_f', 'Dust collection and housekeeping adequate', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('fire_f', 'Hot work / fire watches in fuel areas', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('bunker', 'Bunker / silo entry controls applied', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('spontaneous', 'Stockpile / spontaneous combustion checks', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Ash / waste & environmental', 'power_generation', 'Power Generation', 'ash_environmental', ENV, 'Ash ponds, wastewater, air permits, and spill response.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('pond', 'Ash / wastewater impoundment inspected', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('permits_e', 'Air / water permit conditions being met', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('spill_pg', 'Spill kits and drains controlled', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('fugitive', 'Fugitive dust / emissions controlled', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('records_e', 'Environmental inspection records current', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Outage construction & heavy lifts', 'power_generation', 'Power Generation', 'outage_construction', CRANE, 'Outage lifts, laydown, scaffolding, and energy isolation coordination.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('lift_pg', 'Critical lift plans approved for outage', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('isolation_pg', 'Unit isolation / LOTO coordinated with ops', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('scaffold_pg', 'Scaffold and access systems tagged', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('laydown_pg', 'Laydown and exclusion zones enforced', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('night', 'Night-shift lighting and supervision adequate', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Control room & human performance', 'power_generation', 'Power Generation', 'control_room_hu', SITE, 'Procedures, peer checks, alarms, and distraction control.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('procedures_cr', 'Operating procedures in use at console', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('peer', 'Peer check / concurrent verification used', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('alarms_cr', 'Alarm response priorities understood', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('distraction', 'Distraction-free zone enforced during critical tasks', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('turnover', 'Board turnover complete and documented', { weight: 15 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Turbine climb & rescue', 'wind', 'Wind Energy', 'turbine_climb_rescue', FALL, 'Climb assist, fall arrest, rescue kits, and weather holds.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('climb_assist', 'Climb assist / lift inspected before use', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('fall_arrest', 'Fall arrest systems inspected and worn', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('rescue_w', 'Tower rescue kit present and in date', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('weather_w', 'Wind / lightning hold criteria applied', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('buddy_w', 'Two-person rule / radio check completed', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Nacelle LOTO & hub work', 'wind', 'Wind Energy', 'nacelle_loto', TOOL, 'Rotor lock, electrical LOTO, hub access, and dropped-object control.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('rotor_lock', 'Rotor lock engaged and verified', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('elec_loto', 'Electrical LOTO complete before work', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('hub', 'Hub access procedures followed', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('drop', 'Dropped-object prevention in nacelle', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('comms_w', 'Base / nacelle communications verified', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Blade work & rope access', 'wind', 'Wind Energy', 'blade_rope', FALL, 'Rope access certification, anchorages, exclusion, and weather.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('cert_ra', 'Rope access technicians certified', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('anchors', 'Anchorages inspected / dual attachment', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('exclusion_b', 'Ground exclusion zone enforced', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('tools_b', 'Tool tethering in use', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('weather_b', 'Weather limits for blade work applied', { weight: 15 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Wind farm construction & cranage', 'wind', 'Wind Energy', 'wind_construction', CRANE, 'Component lifts, transport, foundations, and public road interfaces.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('foundation', 'Foundation / embed QA hold points complete', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('transport', 'Blade / tower transport escorts in place', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('crane_w', 'Crane set-up and lift plans for components', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('pad', 'Hardstand / pad bearing capacity verified', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('public', 'Public road closures / escorts coordinated', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Collection system & MV electrical', 'wind', 'Wind Energy', 'collection_mv', POWER, 'Pad-mount transformers, trenching, terminations, and grounding.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('trench_w', 'Cable trench shoring / barricades', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('grounding_w', 'Equipment grounding complete before energization', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('terminations', 'MV terminations per manufacturer procedure', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('padmount', 'Pad-mount clearances and locks', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('switching_w', 'Switching orders authorized', { weight: 15 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Site access roads & crane pads', 'wind', 'Wind Energy', 'roads_pads', VEHICLE, 'Road condition, berms, drainage, and soft-ground recovery.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('road', 'Access roads passable / graded', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('pad_c', 'Crane pads free of soft spots / voids', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('drainage', 'Drainage prevents washouts', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('recovery', 'Recovery / tow plan for stuck vehicles', { weight: 10 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('speed_w', 'Site speed limits posted and followed', { weight: 15 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Yaw / pitch hydraulic systems', 'wind', 'Wind Energy', 'yaw_pitch_hydraulics', PME, 'Hydraulic isolation, pressure release, and hose integrity.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('pressure', 'Hydraulic pressure released before break-in', {
            weight: 25,
            critical: true,
            energyType: 'hydraulic',
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('isolation_h', 'Hydraulic isolation verified', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('hoses', 'Hoses and fittings free of damage / leaks', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('ppe_h', 'Face shield / PPE for hydraulic injection risk', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('spill_h', 'Oil spill control in nacelle', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Substation & interconnection', 'wind', 'Wind Energy', 'wind_substation', POWER, 'Substation access, switching, grounding, and wildlife barriers.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('access_ss', 'Substation access authorized and logged', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('switching_ss', 'Switching order followed under supervision', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('grounds_ss', 'Protective grounds applied when required', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('wildlife', 'Wildlife / bird barriers intact', { weight: 10 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('fence', 'Perimeter fence and gates secured', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('O&M warehouse & tooling', 'wind', 'Wind Energy', 'wind_om_warehouse', TOOL, 'Torque tools, calibrated gear, spare parts, and chemical storage.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('torque', 'Torque tools calibrated and within date', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('calibration', 'Meters / multimeters calibration current', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('parts', 'Critical spares inventory controlled', { weight: 10 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('chem_w', 'Oils / chemicals labeled and segregated', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('housekeeping_w', 'Warehouse aisles clear / racking secured', {
            weight: 15,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Met mast & meteorological', 'wind', 'Wind Energy', 'met_mast', FALL, 'Mast climb, guy wires, instrumentation, and public exclusion.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('guys', 'Guy wires tensioned and marked', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('climb_m', 'Mast climb fall protection used', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('instruments', 'Anemometers / sensors secured', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('exclusion_m', 'Public exclusion / fencing adequate', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('lightning_m', 'Lightning / weather hold followed', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Commissioning & energization', 'wind', 'Wind Energy', 'wind_commissioning', POWER, 'Pre-energization checks, punchlist, and first-rotation controls.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('punch', 'Safety punchlist closed before energization', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('protections', 'Protection / trip settings verified', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('first_rot', 'First rotation exclusion and watch posted', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('scada', 'SCADA / remote stop verified', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('handover_w', 'Construction-to-O&M handover documented', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Blasting & explosives', 'mining', 'Mining', 'blasting_explosives', SITE, 'Magazine, transport, blast exclusion, and misfire procedures.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('magazine', 'Magazine inventory and security current', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('transport_e', 'Explosives transport rules followed', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('exclusion_bl', 'Blast exclusion zone cleared and guarded', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('misfire', 'Misfire procedure posted and understood', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('radio', 'Radio silence / initiation controls applied', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Surface mobile equipment', 'mining', 'Mining', 'surface_mobile', PME, 'Haul trucks, dozers, interactions, and pre-use inspections.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('preuse', 'Pre-use inspection completed', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('interaction', 'Light vehicle / heavy interaction rules', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('berms', 'Dump berms and windrows adequate', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('seatbelt', 'Seatbelts / restraints worn', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('parking', 'Parking / chocking on grade correct', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Mine ventilation & gas', 'mining', 'Mining', 'ventilation_gas', ENV, 'Fans, airflow, gas monitors, and refuge chambers.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('airflow', 'Airflow meets design at workplace', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('gas_mon', 'Gas monitors calibrated and used', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('fans', 'Main / auxiliary fans status known', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('refuge', 'Refuge chamber inspected and stocked', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('doors', 'Ventilation doors / seals functional', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Process plant & mills', 'mining', 'Mining', 'process_plant', PME, 'Mills, thickeners, reagents, and confined spaces in process.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('guards_m', 'Mill / agitator guards secured', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('reagents', 'Reagent storage and bunding adequate', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('confined_p', 'Confined space permits for tanks / thickeners', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('isolation_p', 'Isolation verified before liner / mill work', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('spill_p', 'Process spill response staged', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Decline / portal construction', 'mining', 'Mining', 'decline_portal', EXC, 'Portal stability, traffic, services install, and ground support QA.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('portal', 'Portal ground support per design', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('traffic_d', 'Decline traffic light / radio rules', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('services_d', 'Services install not creating trip / struck-by', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('qa_gs', 'Ground support QA / pull tests recorded', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('egress_d', 'Emergency egress / refuge plan current', { weight: 15 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Camp & contractor village', 'mining', 'Mining', 'camp_village', SITE, 'Fire, hygiene, emergency response, and fatigue management at camp.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('fire_camp', 'Fire detection / extinguishers current', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('hygiene', 'Kitchen / laundry hygiene controls', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('emergency_c', 'Muster / emergency response drills current', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('fatigue', 'Roster / fatigue rules being followed', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('security_c', 'Camp access / alcohol policy enforced', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Hot work in process units', 'oil_gas', 'Oil & Gas', 'hot_work_process', HOT, 'Gas testing, fire watch, spark containment, and isolations.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('gas_test', 'Gas test within time limits before hot work', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('fire_watch', 'Fire watch present with extinguisher', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('spark', 'Spark / slag containment adequate', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('isolation_hw', 'Process isolation verified for hot work', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('closeout', 'Fire watch duration after hot work completed', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Tank farm & storage', 'oil_gas', 'Oil & Gas', 'tank_farm', ENV, 'Bund integrity, overfill, foam systems, and vehicle controls.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('bund', 'Bund walls / floors intact and drained correctly', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('overfill', 'Overfill protection / alarms functional', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('foam', 'Foam / firewater systems accessible', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('vehicles_t', 'Vehicle / ignition source controls in farm', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('gauging', 'Gauging / sampling procedures followed', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Pigging & pipeline ops', 'oil_gas', 'Oil & Gas', 'pigging_ops', CONF, 'Launcher/receiver procedures, pressure, and trapped energy.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('procedure_pig', 'Pigging procedure / JSA briefed', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('pressure_pig', 'Vessel depressured before opening', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('trapped', 'Trapped pressure / product controlled', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('exclusion_pig', 'Exclusion during launch / receive', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('waste_pig', 'Pig waste / liquids contained', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Facility construction & brownfield', 'oil_gas', 'Oil & Gas', 'facility_brownfield', SITE, 'Live plant interfaces, excavating near lines, and lifting over process.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('live_plant', 'Live plant interface hazards briefed', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('excavate_og', 'Excavation near pipelines / cables controlled', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('lift_over', 'Lifts over live process approved', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('scaffold_og', 'Scaffold tags and access to height OK', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('housekeeping_og', 'Construction debris kept out of process', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('H2S / toxic gas readiness', 'oil_gas', 'Oil & Gas', 'h2s_toxic', ENV, 'Monitors, escape respirators, wind direction, and muster.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('monitors_h2s', 'Personal H2S monitors on and bump-tested', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('escape', 'Escape respirators available and inspected', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('wind_h2s', 'Wind direction known / upwind work preferred', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('muster_h2s', 'Muster points and alarms understood', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('buddy_h2s', 'Buddy system in H2S areas', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Offshore / platform marine', 'oil_gas', 'Oil & Gas', 'offshore_platform', SITE, 'Boat landing, helideck, life-saving appliances, and dropped objects.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('boat', 'Boat landing / transfer procedures followed', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('helideck', 'Helideck FOD and fire readiness', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('lsa', 'Life rafts / LSA inspections current', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('dropped', 'Dropped-object surveys / secondary retention', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('overboard', 'Overboard discharge / permit controls', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Fire impairment & Appendix R', 'nuclear', 'Nuclear', 'fire_impairment', FIRE, 'Impairment permits, compensatory measures, and combustible control.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('impairment', 'Fire impairment permit active and posted', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('compensatory', 'Compensatory measures in place', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('combustible_n', 'Combustible loading within limits', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('detection', 'Detection / suppression status known', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('hot_work_n', 'Hot work coordinated with fire ops', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Emergency preparedness drill', 'nuclear', 'Nuclear', 'ep_drill', SITE, 'Classification, notifications, accountability, and OSC readiness.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('class', 'Emergency classification criteria understood', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('notify', 'Notification / call-out process ready', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('account', 'Personnel accountability process functional', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('osc', 'OSC / TSC equipment and kits current', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('evac', 'Evacuation routes clear and marked', { weight: 15 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Chemistry & effluent control', 'nuclear', 'Nuclear', 'chemistry_effluent', ENV, 'Sampling, releases, spill control, and lab PPE.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('sampling', 'Sampling procedures and labels correct', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('release', 'Liquid / gaseous release permits followed', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('spill_chem', 'Chemical spill kits staged', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('lab_ppe', 'Lab PPE and eyewash available', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('records_chem', 'Chemistry records / trends reviewed', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Security & vital area', 'nuclear', 'Nuclear', 'security_vital', ACCESS, 'Badging, package searches, vital area barriers, and two-person rule.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('badge', 'Badges / access rights match work location', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('search', 'Package / vehicle search completed', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('barriers', 'Vital area barriers intact', { weight: 25 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('two_person', 'Two-person rule applied where required', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('tailgate', 'No tailgating through portals', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('ISI / NDE & weld quality', 'nuclear', 'Nuclear', 'isi_nde', SITE, 'NDE safety, radiation with sources, and weld traveler control.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('source', 'Radiography exclusion and source control', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('traveler', 'Weld traveler / traveler hold points followed', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('nde_ppe', 'NDE chemical / UV PPE used', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('access_isi', 'ISI access platforms secure', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('records_isi', 'NDE records complete before close-out', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('New-build nuclear construction', 'nuclear', 'Nuclear', 'nuclear_newbuild', SITE, 'Module lifts, rebar/concrete ITP, cleanliness, and craft qualifications.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('module', 'Module / heavy lift plan approved', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('itp', 'Concrete / rebar ITP hold points signed', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('clean', 'Zone cleanliness / FME for safety-related work', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('craft', 'Craft qualifications / weld stamps verified', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('storage', 'Safety-related material storage controlled', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Cooling water & intake', 'power_generation', 'Power Generation', 'cooling_intake', ENV, 'Intake screens, chlorine, confined spaces, and marine life controls.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('screens', 'Intake screens / trash racks clear', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('chlorine', 'Chlorine / biocide handling controls', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('confined_cw', 'Confined space for pits / tunnels controlled', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('marine', 'Marine life / environmental controls followed', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('access_cw', 'Walkways and grating secured over water', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Battery rooms & UPS', 'power_generation', 'Power Generation', 'battery_ups', POWER, 'Ventilation, PPE for batteries, spill control, and arc hazards.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('vent_bat', 'Battery room ventilation operating', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('ppe_bat', 'Acid / arc PPE available and used', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('spill_bat', 'Neutralizer / spill kits staged', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('clearances_bat', 'Live bus clearances maintained', {
            weight: 20,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('housekeeping_bat', 'No storage of combustibles in battery room', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Hydro / dam operations', 'power_generation', 'Power Generation', 'hydro_dam', SITE, 'Gate operations, spillway, public safety, and confined spaces.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('gates', 'Gate / hoist operations per procedure', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('spillway_h', 'Spillway / stilling basin inspected', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('public_h', 'Public safety barriers at reservoir', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('confined_h', 'Penstock / gallery entry controls', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('seepage_h', 'Seepage / instrumentation reviewed', { weight: 10 }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Gas turbine & HRSG', 'power_generation', 'Power Generation', 'gt_hrsg', FIRE, 'Fuel gas, purge, HRSG entry, and high-energy line breaks.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('purge', 'Purge / start permissives verified', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('fuel_gas', 'Fuel gas leak checks / detectors OK', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('hrsg_entry', 'HRSG confined space / heat controls', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('helb', 'High-energy line break exclusion understood', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('fire_gt', 'Turbine enclosure fire system status known', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Plant construction & tie-ins', 'power_generation', 'Power Generation', 'plant_tieins', SITE, 'Brownfield tie-ins, hydrotests, energization boundaries, and SIMOPS.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('tiein', 'Tie-in package / isolation approved', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('hydrotest', 'Hydrotest exclusion and relief path set', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('energize', 'Energization boundary marked and briefed', {
            weight: 20,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('simops_pg', 'Construction / ops SIMOPS board current', {
            weight: 15,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('housekeeping_pg', 'Laydown not blocking fire / egress routes', {
            weight: 10,
        }),
    ]),
    (0, pm_inspection_focus_audits_constants_1.focusAudit)('Chemical unloading & water treatment', 'power_generation', 'Power Generation', 'chem_water_treatment', ENV, 'Acid/caustic unloading, eyewash, bunding, and PPE.', [
        (0, pm_inspection_focus_audits_constants_1.pf)('unloading', 'Unloading checklist and grounding complete', {
            weight: 25,
            critical: true,
        }),
        (0, pm_inspection_focus_audits_constants_1.pf)('eyewash', 'Eyewash / safety showers tested', { weight: 20 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('bund_chem', 'Chemical bunds and tanks intact', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('ppe_chem', 'Chemical PPE matched to SDS', { weight: 15 }),
        (0, pm_inspection_focus_audits_constants_1.pf)('spill_wt', 'Spill response for acids / caustics staged', {
            weight: 10,
        }),
    ]),
];
//# sourceMappingURL=pm-inspection-focus-audits-extra.constants.js.map