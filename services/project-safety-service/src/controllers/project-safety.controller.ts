import type { Request, Response, NextFunction } from 'express';
import { projectSafetyService } from '../services/project-safety.service';
import { assertCompanyScope } from '../middleware/auth.middleware';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function idsFromBody(req: Request) {
  const companyId = (req.body.company_id ?? req.body.companyId) as string;
  const projectId = (req.body.project_id ?? req.body.projectId) as string;
  return { companyId, projectId };
}

export const projectSafetyController = {
  async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, projectId } = idsFromBody(req);
      assertCompanyScope(req, companyId);

      const profile = await projectSafetyService.upsertProfile({
        companyId,
        projectId,
        riskLevel: req.body.risk_level ?? req.body.riskLevel,
        requiredJhaTypes: req.body.required_jha_types ?? req.body.requiredJhaTypes,
        requiredInspections: req.body.required_inspections ?? req.body.requiredInspections,
        requiredTraining: req.body.required_training ?? req.body.requiredTraining,
        requiredEquipmentCertifications:
          req.body.required_equipment_certifications ?? req.body.requiredEquipmentCertifications,
        requiredPpe: req.body.required_ppe ?? req.body.requiredPpe,
        requiredEmergencyPlans:
          req.body.required_emergency_plans ?? req.body.requiredEmergencyPlans,
        publish: req.body.publish,
      });

      return res.status(201).json(profile);
    } catch (e) {
      next(e);
    }
  },

  async hazards(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, projectId } = idsFromBody(req);
      assertCompanyScope(req, companyId);

      const hazard = await projectSafetyService.addHazard({
        companyId,
        projectId,
        hazardId: req.body.hazard_id ?? req.body.hazardId,
        title: req.body.title,
        severity: Number(req.body.severity),
        likelihood: Number(req.body.likelihood),
        requiredControls: req.body.required_controls ?? req.body.requiredControls,
        publish: req.body.publish,
      });

      return res.status(201).json(hazard);
    } catch (e) {
      next(e);
    }
  },

  async controls(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, projectId } = idsFromBody(req);
      assertCompanyScope(req, companyId);

      const control = await projectSafetyService.addControl({
        companyId,
        projectId,
        controlId: req.body.control_id ?? req.body.controlId,
        title: req.body.title,
        controlStrength: Number(req.body.control_strength ?? req.body.controlStrength),
        verificationSteps: req.body.verification_steps ?? req.body.verificationSteps,
        publish: req.body.publish,
      });

      return res.status(201).json(control);
    } catch (e) {
      next(e);
    }
  },

  async zones(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, projectId } = idsFromBody(req);
      assertCompanyScope(req, companyId);

      const zone = await projectSafetyService.addZone({
        companyId,
        projectId,
        name: req.body.name,
        type: req.body.type,
        location: req.body.location,
        riskLevel: req.body.risk_level ?? req.body.riskLevel,
        rules: {
          requiredTraining: req.body.required_training ?? req.body.requiredTraining,
          requiredPpe: req.body.required_ppe ?? req.body.requiredPpe,
          requiredJha: req.body.required_jha ?? req.body.requiredJha,
          requiredPermits: req.body.required_permits ?? req.body.requiredPermits,
          requiredEquipmentAuthorization:
            req.body.required_equipment_authorization ?? req.body.requiredEquipmentAuthorization,
          requiredSds: req.body.required_sds ?? req.body.requiredSds,
        },
      });

      return res.status(201).json(zone);
    } catch (e) {
      next(e);
    }
  },

  async equipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, projectId } = idsFromBody(req);
      assertCompanyScope(req, companyId);

      const rule = await projectSafetyService.upsertEquipment({
        companyId,
        projectId,
        ruleKey: req.body.rule_key ?? req.body.ruleKey,
        requiredInspections: req.body.required_inspections ?? req.body.requiredInspections,
        requiredCerts: req.body.required_certs ?? req.body.requiredCerts,
        requiredControls: req.body.required_controls ?? req.body.requiredControls,
      });

      return res.status(201).json(rule);
    } catch (e) {
      next(e);
    }
  },

  async training(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, projectId } = idsFromBody(req);
      assertCompanyScope(req, companyId);

      const row = await projectSafetyService.upsertTraining({
        companyId,
        projectId,
        role: req.body.role,
        requiredCourses: req.body.required_courses ?? req.body.requiredCourses ?? [],
      });

      return res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  },

  async emergency(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, projectId } = idsFromBody(req);
      assertCompanyScope(req, companyId);

      const plan = await projectSafetyService.createEmergency({
        companyId,
        projectId,
        planType: req.body.plan_type ?? req.body.planType,
        title: req.body.title,
        content: req.body.content,
        publish: req.body.publish,
      });

      return res.status(201).json(plan);
    } catch (e) {
      next(e);
    }
  },

  async score(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = routeParam(req.params.project_id);
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const score = await projectSafetyService.getScore(projectId, companyId);
      return res.json(score);
    } catch (e) {
      next(e);
    }
  },
};
