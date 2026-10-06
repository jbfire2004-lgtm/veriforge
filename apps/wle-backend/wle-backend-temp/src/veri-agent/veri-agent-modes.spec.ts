import {
  activeModeFromEnv,
  getVeriAgentMode,
  resolveVeriAgentMode,
} from './veri-agent-modes';

describe('veri-agent-modes', () => {
  const prev = process.env.VERA_AGENT_MODE;

  afterEach(() => {
    if (prev === undefined) delete process.env.VERA_AGENT_MODE;
    else process.env.VERA_AGENT_MODE = prev;
  });

  it('resolves manufacturing aliases', () => {
    expect(resolveVeriAgentMode('manufacturing')).toBe('manufacturing');
    expect(resolveVeriAgentMode('MFG')).toBe('manufacturing');
    expect(resolveVeriAgentMode('iso9001')).toBe('manufacturing');
  });

  it('resolves construction aliases', () => {
    expect(resolveVeriAgentMode('construction')).toBe('construction');
    expect(resolveVeriAgentMode('CONST')).toBe('construction');
    expect(resolveVeriAgentMode('jobsite')).toBe('construction');
    expect(resolveVeriAgentMode('osha')).toBe('construction');
    expect(resolveVeriAgentMode('csa')).toBe('construction');
  });

  it('resolves mining aliases', () => {
    expect(resolveVeriAgentMode('mining')).toBe('mining');
    expect(resolveVeriAgentMode('MINE')).toBe('mining');
    expect(resolveVeriAgentMode('msha')).toBe('mining');
  });

  it('resolves telecom / tower aliases', () => {
    expect(resolveVeriAgentMode('telecom')).toBe('telecom');
    expect(resolveVeriAgentMode('TOWER')).toBe('telecom');
    expect(resolveVeriAgentMode('towers')).toBe('telecom');
    expect(resolveVeriAgentMode('rf')).toBe('telecom');
    expect(resolveVeriAgentMode('cell')).toBe('telecom');
    expect(resolveVeriAgentMode('wireless')).toBe('telecom');
  });

  it('resolves power generation aliases', () => {
    expect(resolveVeriAgentMode('power')).toBe('power');
    expect(resolveVeriAgentMode('power_generation')).toBe('power');
    expect(resolveVeriAgentMode('powergen')).toBe('power');
    expect(resolveVeriAgentMode('generation')).toBe('power');
    expect(resolveVeriAgentMode('nerc')).toBe('power');
    expect(resolveVeriAgentMode('gads')).toBe('power');
  });

  it('resolves nuclear aliases', () => {
    expect(resolveVeriAgentMode('nuclear')).toBe('nuclear');
    expect(resolveVeriAgentMode('NUC')).toBe('nuclear');
    expect(resolveVeriAgentMode('nrc')).toBe('nuclear');
    expect(resolveVeriAgentMode('iaea')).toBe('nuclear');
  });

  it('resolves multi-industry aliases', () => {
    expect(resolveVeriAgentMode('multi')).toBe('multi');
    expect(resolveVeriAgentMode('multi_industry')).toBe('multi');
    expect(resolveVeriAgentMode('multi-industry')).toBe('multi');
    expect(resolveVeriAgentMode('multindustry')).toBe('multi');
    expect(resolveVeriAgentMode('operations')).toBe('multi');
    expect(resolveVeriAgentMode('industrial')).toBe('multi');
    expect(resolveVeriAgentMode('all')).toBe('multi');
  });

  it('resolves none / empty', () => {
    expect(resolveVeriAgentMode('')).toBe('none');
    expect(resolveVeriAgentMode('none')).toBe('none');
    expect(resolveVeriAgentMode('off')).toBe('none');
    expect(resolveVeriAgentMode('unknown')).toBe('none');
  });

  it('returns manufacturing system prompt with QC / lineage priorities', () => {
    const mode = getVeriAgentMode('manufacturing');
    expect(mode).not.toBeNull();
    expect(mode!.systemPrompt).toContain('MANUFACTURING');
    expect(mode!.systemPrompt).toContain('ISO 9001');
    expect(mode!.systemPrompt).toContain('ISO 14001');
    expect(mode!.systemPrompt).toContain('SCADA/PLC');
    expect(mode!.systemPrompt).toContain('batch/lot');
    expect(mode!.systemPrompt).toContain('Never invent');
  });

  it('returns construction system prompt with safety / permit priorities', () => {
    const mode = getVeriAgentMode('construction');
    expect(mode).not.toBeNull();
    expect(mode!.systemPrompt).toContain('CONSTRUCTION');
    expect(mode!.systemPrompt).toContain('OSHA');
    expect(mode!.systemPrompt).toContain('CSA');
    expect(mode!.systemPrompt).toContain('permit');
    expect(mode!.systemPrompt).toContain('Contractor');
    expect(mode!.systemPrompt).toContain('Equipment certification');
    expect(mode!.systemPrompt).toContain('Never invent');
  });

  it('returns mining system prompt with MSHA / blast / geotech priorities', () => {
    const mode = getVeriAgentMode('mining');
    expect(mode).not.toBeNull();
    expect(mode!.systemPrompt).toContain('MINING');
    expect(mode!.systemPrompt).toContain('MSHA');
    expect(mode!.systemPrompt).toContain('Environmental monitoring');
    expect(mode!.systemPrompt).toContain('Heavy equipment');
    expect(mode!.systemPrompt).toContain('Blast planning');
    expect(mode!.systemPrompt).toContain('Geotechnical');
    expect(mode!.systemPrompt).toContain('Ore/assay');
    expect(mode!.systemPrompt).toContain('Never invent');
  });

  it('returns telecom system prompt with climb / RF / asset priorities', () => {
    const mode = getVeriAgentMode('telecom');
    expect(mode).not.toBeNull();
    expect(mode!.systemPrompt).toContain('TELECOM / TOWER');
    expect(mode!.systemPrompt).toContain('Tower climb safety');
    expect(mode!.systemPrompt).toContain('RF exposure');
    expect(mode!.systemPrompt).toContain('Site inspection accuracy');
    expect(mode!.systemPrompt).toContain('Photo-evidence');
    expect(mode!.systemPrompt).toContain('Asset lifecycle');
    expect(mode!.systemPrompt).toContain('Never invent');
  });

  it('returns power generation system prompt with NERC / SCADA / reliability priorities', () => {
    const mode = getVeriAgentMode('power');
    expect(mode).not.toBeNull();
    expect(mode!.systemPrompt).toContain('POWER GENERATION');
    expect(mode!.systemPrompt).toContain('NERC/GADS');
    expect(mode!.systemPrompt).toContain('SCADA');
    expect(mode!.systemPrompt).toContain('Outage management');
    expect(mode!.systemPrompt).toContain('Equipment inspections');
    expect(mode!.systemPrompt).toContain('Environmental reporting');
    expect(mode!.systemPrompt).toContain('turbine/boiler/generator');
    expect(mode!.systemPrompt).toContain('Never invent');
  });

  it('returns nuclear system prompt with radiation / NRC / IAEA priorities', () => {
    const mode = getVeriAgentMode('nuclear');
    expect(mode).not.toBeNull();
    expect(mode!.systemPrompt).toContain('NUCLEAR');
    expect(mode!.systemPrompt).toContain('Radiation protection');
    expect(mode!.systemPrompt).toContain('Critical equipment');
    expect(mode!.systemPrompt).toContain('Access control');
    expect(mode!.systemPrompt).toContain('NRC/IAEA');
    expect(mode!.systemPrompt).toContain('Never invent');
  });

  it('returns multi-industry system prompt with cross-industry operations priorities', () => {
    const mode = getVeriAgentMode('multi');
    expect(mode).not.toBeNull();
    expect(mode!.systemPrompt).toContain('MULTI-INDUSTRY');
    expect(mode!.systemPrompt).toContain('Manufacturing');
    expect(mode!.systemPrompt).toContain('Construction');
    expect(mode!.systemPrompt).toContain('Mining');
    expect(mode!.systemPrompt).toContain('Telecom/Tower');
    expect(mode!.systemPrompt).toContain('Power Generation');
    expect(mode!.systemPrompt).toContain('Nuclear');
    expect(mode!.systemPrompt).toContain('workflows, reports, data models');
    expect(mode!.systemPrompt).toContain('Never invent');
  });

  it('reads VERA_AGENT_MODE from env', () => {
    process.env.VERA_AGENT_MODE = 'manufacturing';
    expect(activeModeFromEnv()).toBe('manufacturing');
    process.env.VERA_AGENT_MODE = 'construction';
    expect(activeModeFromEnv()).toBe('construction');
    process.env.VERA_AGENT_MODE = 'mining';
    expect(activeModeFromEnv()).toBe('mining');
    process.env.VERA_AGENT_MODE = 'telecom';
    expect(activeModeFromEnv()).toBe('telecom');
    process.env.VERA_AGENT_MODE = 'power';
    expect(activeModeFromEnv()).toBe('power');
    process.env.VERA_AGENT_MODE = 'nuclear';
    expect(activeModeFromEnv()).toBe('nuclear');
    process.env.VERA_AGENT_MODE = 'multi';
    expect(activeModeFromEnv()).toBe('multi');
    process.env.VERA_AGENT_MODE = 'none';
    expect(activeModeFromEnv()).toBe('none');
  });
});
