"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INDUSTRY_LABELS = exports.FOCUS_AUDIT_TEMPLATES = exports.SMART_SITE_TEMPLATE = exports.photoItem = exports.pf = void 0;
exports.focusAudit = focusAudit;
const pf = (id, label, opts) => (Object.assign({ id,
    label, type: 'pass_fail', required: true, weight: 10 }, opts));
exports.pf = pf;
exports.photoItem = {
    id: 'photo_evidence',
    label: 'Photo evidence (AI-assisted)',
    type: 'photo',
    required: false,
};
function focusAudit(title, industry, industryLabel, focusArea, category, description, items) {
    return {
        name: `Focus Audit — ${title}`,
        category,
        scoringMode: 'weighted',
        description,
        scoringRules: {
            inspectionKind: 'focus_audit',
            industry,
            industryLabel,
            focusArea,
            photoFirst: true,
        },
        items: [...items, exports.photoItem],
    };
}
exports.SMART_SITE_TEMPLATE = {
    name: 'Smart Site Inspection',
    category: 'SITE',
    scoringMode: 'pass_fail',
    description: 'Photo-driven field walkdown. Each picture is analyzed by AI, numbered on the report, and at-risk findings are assigned to the responsible company.',
    scoringRules: {
        inspectionKind: 'smart_site',
        photoFirst: true,
        skipChecklistScoring: true,
    },
    items: [
        {
            id: 'site_area',
            label: 'Site / project area',
            type: 'text',
            required: false,
        },
        { id: 'weather', label: 'Weather / site conditions', type: 'text' },
        { id: 'inspector_notes', label: 'Overall inspection notes', type: 'text' },
    ],
};
const FOCUS_AUDIT_TEMPLATES_CORE = [
    focusAudit('Fall protection & work at height', 'construction', 'Construction', 'fall_protection', 'FALL_PROTECTION', 'Anchorages, harnesses, 100% tie-off, openings, and rescue readiness.', [
        (0, exports.pf)('anchor', 'Anchorage points rated, tagged, and inspected', {
            weight: 20,
            energyType: 'gravitational',
        }),
        (0, exports.pf)('harness', 'Harness, lanyard, and SRL condition acceptable', {
            weight: 20,
        }),
        (0, exports.pf)('tie_off', '100% tie-off where required by policy', {
            weight: 20,
            critical: true,
        }),
        (0, exports.pf)('openings', 'Floor/wall/roof openings protected or covered', {
            weight: 15,
        }),
        (0, exports.pf)('rescue', 'Rescue plan communicated to crew', { weight: 10 }),
    ]),
    focusAudit('Excavation & trenching', 'construction', 'Construction', 'excavation', 'EXCAVATION', 'Competent person, sloping/shoring, utilities locates, and access/egress.', [
        (0, exports.pf)('competent_person', 'Competent person designated and on site', {
            weight: 20,
        }),
        (0, exports.pf)('protection', 'Sloping, benching, or shoring per plan', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('utilities', 'Underground utilities located and protected', {
            weight: 20,
        }),
        (0, exports.pf)('access', 'Ladders or ramps within 25 ft of workers', { weight: 15 }),
        (0, exports.pf)('spoil', 'Spoil pile set back and barricades in place', {
            weight: 10,
        }),
    ]),
    focusAudit('Scaffolding & access systems', 'construction', 'Construction', 'scaffolding', 'SCAFFOLDING', 'Tags, guardrails, base plates, tie-ins, and load limits.', [
        (0, exports.pf)('tag', 'Scaffold tag current (green/yellow/red)', { weight: 20 }),
        (0, exports.pf)('guardrails', 'Guardrails, mid-rails, and toe boards complete', {
            weight: 20,
            critical: true,
        }),
        (0, exports.pf)('base', 'Base plates, mud sills, and leveling jacks sound', {
            weight: 15,
        }),
        (0, exports.pf)('tie_in', 'Tie-ins and bracing per engineered plan', { weight: 20 }),
        (0, exports.pf)('access', 'Safe access ladder or stairway provided', { weight: 15 }),
    ]),
    focusAudit('Crane & rigging operations', 'construction', 'Construction', 'crane_rigging', 'CRANE', 'Lift plan, rigging inspection, exclusion zone, and operator qualification.', [
        (0, exports.pf)('lift_plan', 'Lift plan reviewed for critical lifts', { weight: 20 }),
        (0, exports.pf)('rigging', 'Rigging and hardware inspection documented', {
            weight: 20,
            energyType: 'gravitational',
        }),
        (0, exports.pf)('zone', 'Lift zone barricaded and controlled', { weight: 20 }),
        (0, exports.pf)('operator', 'Operator certification / competency verified', {
            weight: 20,
        }),
        (0, exports.pf)('signals', 'Qualified signal person when required', { weight: 10 }),
    ]),
    focusAudit('Temporary electrical power', 'construction', 'Construction', 'temp_power', 'TEMPORARY_POWER', 'GFCI protection, cord condition, panel labeling, and wet-location controls.', [
        (0, exports.pf)('gfci', 'GFCI / AFCI protection in use', {
            weight: 25,
            energyType: 'electrical',
            critical: true,
        }),
        (0, exports.pf)('cords', 'Cords and cables free of damage', { weight: 15 }),
        (0, exports.pf)('panels', 'Panels labeled and closed / guarded', { weight: 15 }),
        (0, exports.pf)('wet', 'Wet-location controls and covers in place', { weight: 15 }),
        (0, exports.pf)('lockout', 'Lockout available for maintenance work', { weight: 10 }),
    ]),
    focusAudit('Hot work & fire prevention', 'construction', 'Construction', 'hot_work', 'HOT_WORK', 'Permits, fire watch, combustible clearance, and extinguisher readiness.', [
        (0, exports.pf)('permit', 'Hot work permit issued and posted', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('fire_watch', 'Fire watch assigned and trained', { weight: 20 }),
        (0, exports.pf)('clearance', 'Combustibles cleared or shielded within 35 ft', {
            weight: 20,
        }),
        (0, exports.pf)('extinguisher', 'Fire extinguisher within reach', { weight: 15 }),
        (0, exports.pf)('monitoring', 'Post-work monitoring period documented', {
            weight: 10,
        }),
    ]),
    focusAudit('Housekeeping & material storage', 'construction', 'Construction', 'housekeeping', 'HOUSEKEEPING', 'Walkways, material stacking, waste control, and trip hazards.', [
        (0, exports.pf)('walkways', 'Walkways and stairs clear', { weight: 20 }),
        (0, exports.pf)('stacking', 'Materials stacked stable and within load limits', {
            weight: 15,
        }),
        (0, exports.pf)('waste', 'Waste and debris controlled', { weight: 15 }),
        (0, exports.pf)('trips', 'Cords, holes, and rebar caps addressed', { weight: 15 }),
        (0, exports.pf)('lighting', 'Adequate lighting in work areas', { weight: 10 }),
    ]),
    focusAudit('Confined space entry', 'construction', 'Construction', 'confined_space', 'CONFINED_SPACE', 'Permits, atmospheric testing, attendant, and rescue plan.', [
        (0, exports.pf)('permit', 'Confined space entry permit complete', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('atmosphere', 'Atmospheric testing before and during entry', {
            weight: 25,
        }),
        (0, exports.pf)('attendant', 'Attendant stationed at entry point', { weight: 15 }),
        (0, exports.pf)('rescue', 'Rescue plan and equipment ready', { weight: 15 }),
        (0, exports.pf)('isolation', 'Energy isolation verified before entry', { weight: 10 }),
    ]),
    focusAudit('Ground control & highwall', 'mining', 'Mining', 'ground_control', 'SITE', 'Highwall stability, scaling, berms, and geotechnical monitoring.', [
        (0, exports.pf)('highwall', 'Highwall / pit wall stable — no active failure signs', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('scaling', 'Scaling and loose material program active', {
            weight: 20,
        }),
        (0, exports.pf)('berms', 'Haul road berms and windrows adequate', { weight: 15 }),
        (0, exports.pf)('monitoring', 'Geotechnical monitoring points checked', {
            weight: 15,
        }),
        (0, exports.pf)('exclusion', 'Exclusion zones marked at crest and toe', {
            weight: 10,
        }),
    ]),
    focusAudit('Ventilation & air quality', 'mining', 'Mining', 'ventilation', 'ENVIRONMENTAL', 'Airflow, diesel particulate, gas detection, and refuge alternatives.', [
        (0, exports.pf)('airflow', 'Ventilation plan airflow adequate for activity', {
            weight: 25,
        }),
        (0, exports.pf)('gas_detection', 'Gas detection calibrated and alarms tested', {
            weight: 20,
            critical: true,
        }),
        (0, exports.pf)('dpm', 'DPM / dust controls functioning', { weight: 15 }),
        (0, exports.pf)('refuge', 'Refuge / fresh-air alternatives identified', {
            weight: 15,
        }),
        (0, exports.pf)('records', 'Ventilation inspection records current', { weight: 10 }),
    ]),
    focusAudit('Mobile equipment & haul roads', 'mining', 'Mining', 'mobile_equipment', 'PME', 'Pre-use inspection, traffic management, berms, and visibility.', [
        (0, exports.pf)('pre_use', 'Pre-use inspection completed for mobile equipment', {
            weight: 20,
        }),
        (0, exports.pf)('traffic', 'Traffic management plan followed', { weight: 20 }),
        (0, exports.pf)('visibility', 'Visibility aids and lighting adequate', { weight: 15 }),
        (0, exports.pf)('seatbelt', 'Seat belts and ROPS/FOPS verified', {
            weight: 15,
            critical: true,
        }),
        (0, exports.pf)('speed', 'Speed limits and signage observed', { weight: 10 }),
    ]),
    focusAudit('Lockout & energy isolation', 'mining', 'Mining', 'lockout', 'TOOL', 'LOTO procedures, zero-energy verification, and group lockout.', [
        (0, exports.pf)('procedure', 'LOTO procedure posted at equipment', { weight: 20 }),
        (0, exports.pf)('zero_energy', 'Zero-energy state verified before work', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('devices', 'Locks and tags applied by authorized workers', {
            weight: 20,
        }),
        (0, exports.pf)('group', 'Group lockout box used for multi-craft work', {
            weight: 10,
        }),
        (0, exports.pf)('stored_energy', 'Stored energy released (hydraulic, gravity)', {
            weight: 10,
            energyType: 'hydraulic',
        }),
    ]),
    focusAudit('Blasting & explosives storage', 'mining', 'Mining', 'blasting', 'FIRE_PROTECTION', 'Magazines, blast area control, misfire procedures, and signage.', [
        (0, exports.pf)('magazine', 'Explosives magazine secured and signed', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('blast_area', 'Blast area barricaded and cleared', { weight: 20 }),
        (0, exports.pf)('misfire', 'Misfire procedure understood by crew', { weight: 15 }),
        (0, exports.pf)('licensed', 'Licensed blaster present and documented', { weight: 15 }),
        (0, exports.pf)('inventory', 'Explosives inventory reconciled', { weight: 10 }),
    ]),
    focusAudit('Refuge & emergency egress', 'mining', 'Mining', 'refuge_egress', 'ACCESS_EGRESS', 'Refuge chambers, escape routes, communication, and muster.', [
        (0, exports.pf)('refuge', 'Refuge chambers inspected and supplied', { weight: 25 }),
        (0, exports.pf)('escape', 'Primary and alternate escape routes clear', {
            weight: 20,
            critical: true,
        }),
        (0, exports.pf)('comms', 'Emergency communication tested', { weight: 15 }),
        (0, exports.pf)('muster', 'Muster points marked and known to crew', { weight: 15 }),
        (0, exports.pf)('drills', 'Recent emergency drill documented', { weight: 10 }),
    ]),
    focusAudit('Machine guarding & point of operation', 'manufacturing', 'Manufacturing', 'machine_guarding', 'TOOL', 'Guards, interlocks, light curtains, and point-of-operation clearance.', [
        (0, exports.pf)('guards', 'Fixed and interlocked guards in place', {
            weight: 25,
            critical: true,
            energyType: 'mechanical',
        }),
        (0, exports.pf)('interlocks', 'Safety interlocks functional', { weight: 20 }),
        (0, exports.pf)('point_op', 'Point-of-operation guarded or controlled', {
            weight: 20,
        }),
        (0, exports.pf)('bypass', 'No guard bypassing or defeat devices', { weight: 15 }),
        (0, exports.pf)('training', 'Operators trained on machine-specific hazards', {
            weight: 10,
        }),
    ]),
    focusAudit('Lockout/tagout program', 'manufacturing', 'Manufacturing', 'loto_program', 'TOOL', 'Written procedures, periodic inspection, and contractor coordination.', [
        (0, exports.pf)('written', 'Equipment-specific LOTO procedures available', {
            weight: 20,
        }),
        (0, exports.pf)('annual', 'Annual LOTO inspection documented', { weight: 15 }),
        (0, exports.pf)('isolation', 'Energy sources identified and isolated', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('contractors', 'Contractor LOTO coordination in place', {
            weight: 15,
        }),
        (0, exports.pf)('verification', 'Try-start / zero-energy verification performed', {
            weight: 15,
        }),
    ]),
    focusAudit('Chemical handling & SDS', 'manufacturing', 'Manufacturing', 'chemical_handling', 'ENVIRONMENTAL', 'Labeling, SDS access, secondary containment, and PPE match.', [
        (0, exports.pf)('labels', 'Containers labeled per GHS', { weight: 20 }),
        (0, exports.pf)('sds', 'SDS accessible within 10 seconds', { weight: 20 }),
        (0, exports.pf)('containment', 'Secondary containment adequate', {
            weight: 15,
            energyType: 'chemical',
        }),
        (0, exports.pf)('ppe_chem', 'Chemical PPE matches SDS requirements', { weight: 15 }),
        (0, exports.pf)('spill', 'Spill kit stocked and workers trained', { weight: 10 }),
    ]),
    focusAudit('Forklift & pedestrian interface', 'manufacturing', 'Manufacturing', 'forklift_pedestrian', 'VEHICLE', 'Separation, speed, horn use, and operator certification.', [
        (0, exports.pf)('separation', 'Pedestrian / forklift separation maintained', {
            weight: 20,
        }),
        (0, exports.pf)('speed', 'Speed limits posted and followed', { weight: 15 }),
        (0, exports.pf)('horn', 'Horn at intersections and blind corners', { weight: 15 }),
        (0, exports.pf)('cert', 'Lift truck operators certified', {
            weight: 20,
            critical: true,
        }),
        (0, exports.pf)('ped_walkways', 'Designated pedestrian walkways marked', {
            weight: 10,
        }),
    ]),
    focusAudit('Ergonomics & manual handling', 'manufacturing', 'Manufacturing', 'ergonomics', 'SITE', 'Lift limits, mechanical aids, job rotation, and reporting.', [
        (0, exports.pf)('lift_technique', 'Two-person / mechanical lift used for heavy loads', { weight: 20 }),
        (0, exports.pf)('aids', 'Lift tables, hoists, or carts available', { weight: 15 }),
        (0, exports.pf)('rotation', 'Job rotation or micro-breaks for repetitive tasks', {
            weight: 10,
        }),
        (0, exports.pf)('reporting', 'Early reporting process for discomfort understood', {
            weight: 10,
        }),
        (0, exports.pf)('workspace', 'Work height and reach within ergonomic range', {
            weight: 15,
        }),
    ]),
    focusAudit('PPE program compliance', 'manufacturing', 'Manufacturing', 'ppe_program', 'FALL_PROTECTION', 'Hazard assessment, PPE issuance, maintenance, and training.', [
        (0, exports.pf)('assessment', 'PPE hazard assessment current for area', {
            weight: 20,
        }),
        (0, exports.pf)('issued', 'Required PPE issued and worn correctly', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('maintenance', 'PPE inspection and replacement program active', {
            weight: 15,
        }),
        (0, exports.pf)('training', 'PPE training documented for new hires', { weight: 15 }),
        (0, exports.pf)('signage', 'PPE signage at area entrances', { weight: 10 }),
    ]),
    focusAudit('Process safety & pressure systems', 'oil_gas', 'Oil & Gas', 'process_safety', 'FIRE_PROTECTION', 'Pressure relief, isolation valves, alarms, and operating limits.', [
        (0, exports.pf)('relief', 'Pressure relief devices tagged and in service', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('isolation', 'Isolation valves identified and locked when required', {
            weight: 20,
        }),
        (0, exports.pf)('alarms', 'High/low alarms tested and logged', { weight: 15 }),
        (0, exports.pf)('limits', 'Operating within safe limits (pressure/temp/flow)', {
            weight: 15,
        }),
        (0, exports.pf)('procedures', 'Operating procedures available at console', {
            weight: 10,
        }),
    ]),
    focusAudit('H2S & gas detection', 'oil_gas', 'Oil & Gas', 'h2s_gas', 'ENVIRONMENTAL', 'Monitors, wind awareness, muster, and breathing apparatus.', [
        (0, exports.pf)('monitors', 'Personal / area gas monitors calibrated', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('wind', 'Wind socks / weather monitoring visible', { weight: 10 }),
        (0, exports.pf)('muster_h2s', 'H2S muster routes and flags understood', {
            weight: 15,
        }),
        (0, exports.pf)('scba', 'Emergency breathing apparatus accessible', { weight: 15 }),
        (0, exports.pf)('drill', 'Gas release drill within required interval', { weight: 10 }),
    ]),
    focusAudit('Hot work in classified areas', 'oil_gas', 'Oil & Gas', 'hot_work_classified', 'HOT_WORK', 'Permits, gas tests, fire watch, and ignition source control.', [
        (0, exports.pf)('permit_hw', 'Hot work permit with gas test recorded', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('gas_test', 'Continuous or periodic gas monitoring during work', {
            weight: 20,
        }),
        (0, exports.pf)('ignition', 'Ignition sources controlled in classified zone', {
            weight: 20,
        }),
        (0, exports.pf)('fire_watch_og', 'Dedicated fire watch with extinguisher', {
            weight: 15,
        }),
        (0, exports.pf)('authorization', 'Area authority sign-off on permit', { weight: 10 }),
    ]),
    focusAudit('Vessel / tank confined space', 'oil_gas', 'Oil & Gas', 'vessel_confined_space', 'CONFINED_SPACE', 'Isolation, cleaning, atmospheric monitoring, and rescue.', [
        (0, exports.pf)('isolation_v', 'Vessel isolated, drained, and vented', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('atmo_v', 'Continuous atmospheric monitoring during entry', {
            weight: 20,
        }),
        (0, exports.pf)('entry_permit', 'Confined space entry permit complete', {
            weight: 20,
        }),
        (0, exports.pf)('rescue_v', 'Rescue team / equipment on standby', { weight: 15 }),
        (0, exports.pf)('communication_v', 'Entrant-attendant communication verified', {
            weight: 10,
        }),
    ]),
    focusAudit('Spill prevention & containment', 'oil_gas', 'Oil & Gas', 'spill_prevention', 'ENVIRONMENTAL', 'Secondary containment, drain protection, and spill response.', [
        (0, exports.pf)('secondary_og', 'Secondary containment intact', { weight: 20 }),
        (0, exports.pf)('drains_og', 'Drains protected during transfers', { weight: 15 }),
        (0, exports.pf)('spill_kit_og', 'Spill kit and response plan at transfer points', {
            weight: 15,
        }),
        (0, exports.pf)('bundling', 'Hoses and connections drip-free', { weight: 15 }),
        (0, exports.pf)('reporting_og', 'Spill reporting chain understood', { weight: 10 }),
    ]),
    focusAudit('Arc flash & electrical safety', 'utilities', 'Utilities', 'arc_flash', 'TEMPORARY_POWER', 'Labels, PPE category, boundaries, and de-energization preference.', [
        (0, exports.pf)('labels_af', 'Arc flash labels on equipment', {
            weight: 25,
            critical: true,
            energyType: 'electrical',
        }),
        (0, exports.pf)('ppe_cat', 'PPE category matches incident energy analysis', {
            weight: 20,
        }),
        (0, exports.pf)('boundaries', 'Approach boundaries marked and respected', {
            weight: 15,
        }),
        (0, exports.pf)('deenergize', 'De-energization attempted before live work', {
            weight: 15,
        }),
        (0, exports.pf)('qualified', 'Qualified electrical workers only in restricted area', {
            weight: 10,
        }),
    ]),
    focusAudit('Trenching & shoring (utilities)', 'utilities', 'Utilities', 'utility_trenching', 'EXCAVATION', 'Locates, shoring, spoil, and safe entry for utility installs.', [
        (0, exports.pf)('locates_u', 'One-call / locates documented before dig', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('shoring_u', 'Shoring or trench box per tabulated data', {
            weight: 20,
        }),
        (0, exports.pf)('spoil_u', 'Spoil and equipment set back from edge', { weight: 15 }),
        (0, exports.pf)('access_u', 'Safe entry and egress for workers in trench', {
            weight: 15,
        }),
        (0, exports.pf)('competent_u', 'Competent person inspecting daily', { weight: 10 }),
    ]),
    focusAudit('Overhead line clearance', 'utilities', 'Utilities', 'overhead_lines', 'FALL_PROTECTION', 'MAD, spotting, insulated tools, and worker training.', [
        (0, exports.pf)('mad', 'Minimum approach distance maintained', {
            weight: 25,
            critical: true,
            energyType: 'electrical',
        }),
        (0, exports.pf)('spotter', 'Spotter used for equipment near lines', { weight: 15 }),
        (0, exports.pf)('insulated', 'Insulated tools / cover-up where required', {
            weight: 15,
        }),
        (0, exports.pf)('training_oh', 'Workers trained on line-contact procedures', {
            weight: 15,
        }),
        (0, exports.pf)('marking', 'Overhead hazards marked on job brief', { weight: 10 }),
    ]),
    focusAudit('Substation access & grounding', 'utilities', 'Utilities', 'substation', 'ACCESS_EGRESS', 'Access control, grounding, switching procedures, and PPE.', [
        (0, exports.pf)('access_sub', 'Substation access controlled and logged', {
            weight: 20,
        }),
        (0, exports.pf)('grounding', 'Temporary grounding applied before work', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('switching', 'Switching order reviewed and authorized', {
            weight: 20,
        }),
        (0, exports.pf)('ppe_sub', 'Rubber gloves / sleeves tested and in date', {
            weight: 15,
        }),
        (0, exports.pf)('housekeeping_sub', 'Housekeeping — no trip hazards in yard', {
            weight: 10,
        }),
    ]),
    focusAudit('Chain saw & cutting operations', 'forestry', 'Forestry', 'chainsaw', 'TOOL', 'PPE, kickback prevention, buddy system, and maintenance.', [
        (0, exports.pf)('chaps', 'Cutting PPE — chaps, helmet, eye/ear protection', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('kickback', 'Bar tip guard / proper cutting technique', {
            weight: 15,
            energyType: 'mechanical',
        }),
        (0, exports.pf)('buddy', 'Buddy system or communication in remote cuts', {
            weight: 15,
        }),
        (0, exports.pf)('maintenance_cs', 'Chain tension and brake functional', {
            weight: 15,
        }),
        (0, exports.pf)('fuel', 'Fuel handling away from ignition sources', { weight: 10 }),
    ]),
    focusAudit('Steep slope & wire strike', 'forestry', 'Forestry', 'steep_slope', 'FALL_PROTECTION', 'Slope assessment, machine stability, wire awareness, and escape routes.', [
        (0, exports.pf)('slope', 'Slope angle within equipment / policy limits', {
            weight: 20,
        }),
        (0, exports.pf)('wire', 'Overhead utility / guy wire survey complete', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('stability', 'Machine stability and seat belt use', { weight: 15 }),
        (0, exports.pf)('escape_f', 'Escape routes identified on steep blocks', {
            weight: 15,
        }),
        (0, exports.pf)('weather_f', 'Weather hold criteria understood', { weight: 10 }),
    ]),
    focusAudit('Landing & load securing', 'forestry', 'Forestry', 'landing_loads', 'VEHICLE', 'Landing layout, binder condition, load limits, and pedestrian control.', [
        (0, exports.pf)('landing', 'Landing clear of overhead hazards', { weight: 20 }),
        (0, exports.pf)('binders', 'Binders / wrappers in good condition', { weight: 15 }),
        (0, exports.pf)('load_limits', 'Load within truck / trailer rating', { weight: 20 }),
        (0, exports.pf)('ped_landing', 'Pedestrians excluded from landing during loading', {
            weight: 15,
        }),
        (0, exports.pf)('signage_l', 'Traffic control at public road crossings', {
            weight: 10,
        }),
    ]),
    focusAudit('Emergency preparedness & muster', 'general', 'General', 'emergency_preparedness', 'ACCESS_EGRESS', 'Muster points, alarms, warden roles, and drill records.', [
        (0, exports.pf)('muster_g', 'Muster points marked and communicated', { weight: 20 }),
        (0, exports.pf)('alarms', 'Alarm systems tested / audible in work area', {
            weight: 15,
        }),
        (0, exports.pf)('wardens', 'Emergency wardens assigned', { weight: 15 }),
        (0, exports.pf)('drill_g', 'Emergency drill within policy interval', { weight: 15 }),
        (0, exports.pf)('first_aid', 'First aid / AED locations known', { weight: 10 }),
    ]),
    focusAudit('Signage & hazard communication', 'general', 'General', 'signage_hazcom', 'SITE', 'Signs, labels, SDS, and language accessibility.', [
        (0, exports.pf)('signs', 'Required safety signs posted and legible', { weight: 20 }),
        (0, exports.pf)('labels_g', 'Containers and pipes labeled', { weight: 15 }),
        (0, exports.pf)('sds_g', 'Hazard communication program current', { weight: 15 }),
        (0, exports.pf)('language', 'Critical info accessible to all workers on site', {
            weight: 10,
        }),
        (0, exports.pf)('barricades', 'Temporary hazard barricades in place', { weight: 15 }),
    ]),
    focusAudit('Access, egress & means of escape', 'general', 'General', 'access_egress', 'ACCESS_EGRESS', 'Unobstructed exits, lighting, doors, and assembly areas.', [
        (0, exports.pf)('exits', 'Exits unobstructed and unlocked where required', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('lighting_ae', 'Emergency / exit lighting functional', { weight: 15 }),
        (0, exports.pf)('doors', 'Fire doors not wedged open', { weight: 15 }),
        (0, exports.pf)('assembly', 'Assembly area identified away from hazard', {
            weight: 10,
        }),
        (0, exports.pf)('travel', 'Travel distance to exit within code / policy', {
            weight: 10,
        }),
    ]),
    focusAudit('Contractor safety orientation', 'general', 'General', 'contractor_orientation', 'SITE', 'Orientation records, site rules, emergency contacts, and scope briefing.', [
        (0, exports.pf)('orientation', 'Contractor orientation completed before work', {
            weight: 25,
            critical: true,
        }),
        (0, exports.pf)('site_rules', 'Site-specific rules communicated', { weight: 15 }),
        (0, exports.pf)('emergency_contacts', 'Emergency contacts posted and understood', {
            weight: 15,
        }),
        (0, exports.pf)('scope', 'Scope of work and interface hazards reviewed', {
            weight: 15,
        }),
        (0, exports.pf)('insurance', 'Insurance / registration verified in Vera', {
            weight: 10,
        }),
    ]),
];
exports.FOCUS_AUDIT_TEMPLATES = FOCUS_AUDIT_TEMPLATES_CORE;
exports.INDUSTRY_LABELS = {
    construction: 'Construction',
    mining: 'Mining',
    manufacturing: 'Manufacturing',
    oil_gas: 'Oil & Gas',
    nuclear: 'Nuclear',
    power_generation: 'Power Generation',
    wind: 'Wind Energy',
    utilities: 'Utilities',
    forestry: 'Forestry',
    general: 'General / All industries',
};
//# sourceMappingURL=pm-inspection-focus-audits.constants.js.map