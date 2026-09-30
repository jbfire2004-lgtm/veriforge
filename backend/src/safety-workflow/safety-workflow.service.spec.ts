import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IncidentsService } from '../incidents/incidents.service';
import { InvestigationsService } from '../investigations/investigations.service';
import { INCIDENT_STATUS } from './safety-workflow.types';
import { SafetyWorkflowService } from './safety-workflow.service';

describe('SafetyWorkflowService', () => {
  let service: SafetyWorkflowService;
  const incidents = {
    findOne: jest.fn(),
    changeStatus: jest.fn(),
  };
  const investigations = {
    startInvestigation: jest.fn(),
    assignInvestigator: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SafetyWorkflowService,
        { provide: IncidentsService, useValue: incidents },
        { provide: InvestigationsService, useValue: investigations },
      ],
    }).compile();

    service = module.get(SafetyWorkflowService);
  });

  describe('getDefinition', () => {
    it('returns version, steps, transitions, and rules', () => {
      const def = service.getDefinition();
      expect(def.version).toBe(1);
      expect(def.steps.length).toBeGreaterThan(0);
      expect(def.transitions.length).toBeGreaterThan(0);
      expect(def.incidentStatuses).toContain(INCIDENT_STATUS.OPEN);
      expect(def.rules?.length).toBeGreaterThan(0);
    });
  });

  describe('getIncidentState', () => {
    it('maps OPEN to REPORTED phase and lists triage transition', async () => {
      incidents.findOne.mockResolvedValue({
        id: 1,
        status: INCIDENT_STATUS.OPEN,
        severity: 'LOW',
        investigations: [],
      });

      const state = await service.getIncidentState(1);
      expect(state.phase).toBe('REPORTED');
      expect(state.incidentStatus).toBe(INCIDENT_STATUS.OPEN);
      expect(state.availableTransitions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ to: INCIDENT_STATUS.IN_REVIEW }),
        ]),
      );
    });

    it('uses INVESTIGATION phase when in review with an open investigation', async () => {
      incidents.findOne.mockResolvedValue({
        id: 2,
        status: INCIDENT_STATUS.IN_REVIEW,
        severity: 'MEDIUM',
        investigations: [{ id: 10, status: 'OPEN' }],
      });

      const state = await service.getIncidentState(2);
      expect(state.phase).toBe('INVESTIGATION');
      expect(state.openInvestigationCount).toBe(1);
      expect(state.openInvestigationIds).toEqual([10]);
    });

    it('sets suggestsInvestigation when HIGH severity and transition hints', async () => {
      incidents.findOne.mockResolvedValue({
        id: 3,
        status: INCIDENT_STATUS.IN_REVIEW,
        severity: 'HIGH',
        investigations: [],
      });

      const state = await service.getIncidentState(3);
      const action = state.availableTransitions.find(
        (t) => t.to === INCIDENT_STATUS.ACTION_REQUIRED,
      );
      expect(action?.suggestsInvestigation).toBe(true);
    });
  });

  describe('advance', () => {
    it('updates status on valid transition', async () => {
      incidents.findOne.mockResolvedValue({
        id: 1,
        status: INCIDENT_STATUS.OPEN,
        severity: 'LOW',
        investigations: [],
      });
      incidents.changeStatus.mockResolvedValue({
        id: 1,
        status: INCIDENT_STATUS.IN_REVIEW,
      });

      const result = await service.advance(1, INCIDENT_STATUS.IN_REVIEW);
      expect(incidents.changeStatus).toHaveBeenCalledWith(
        1,
        INCIDENT_STATUS.IN_REVIEW,
      );
      expect(result.incident.status).toBe(INCIDENT_STATUS.IN_REVIEW);
      expect(result.investigation).toBeNull();
    });

    it('throws on invalid transition', async () => {
      incidents.findOne.mockResolvedValue({
        id: 1,
        status: INCIDENT_STATUS.OPEN,
        severity: 'LOW',
        investigations: [],
      });

      await expect(service.advance(1, INCIDENT_STATUS.CLOSED)).rejects.toThrow(
        BadRequestException,
      );
      expect(incidents.changeStatus).not.toHaveBeenCalled();
    });

    it('starts investigation and assigns investigator when requested', async () => {
      incidents.findOne.mockResolvedValue({
        id: 4,
        status: INCIDENT_STATUS.IN_REVIEW,
        severity: 'HIGH',
        investigations: [],
      });
      incidents.changeStatus.mockResolvedValue({
        id: 4,
        status: INCIDENT_STATUS.ACTION_REQUIRED,
      });
      investigations.startInvestigation.mockResolvedValue({ id: 100 });
      investigations.assignInvestigator.mockResolvedValue({
        id: 100,
        investigatorId: 7,
      });

      const result = await service.advance(4, INCIDENT_STATUS.ACTION_REQUIRED, {
        startInvestigation: true,
        investigatorId: 7,
      });

      expect(investigations.startInvestigation).toHaveBeenCalledWith(4);
      expect(investigations.assignInvestigator).toHaveBeenCalledWith(100, 7);
      expect(result.investigation).toEqual({ id: 100, investigatorId: 7 });
    });
  });
});
