import type { Request, Response, NextFunction } from 'express';
import { companySafetyService } from '../services/company-safety.service';
import { assertCompanyScope } from '../middleware/auth.middleware';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function companyIdFromBody(req: Request): string {
  return (req.body.company_id as string) ?? req.body.companyId;
}

export const companySafetyController = {
  async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = companyIdFromBody(req);
      assertCompanyScope(req, companyId);

      const profile = await companySafetyService.upsertProfile({
        companyId,
        corporateRiskLevel: req.body.corporate_risk_level ?? req.body.corporateRiskLevel,
        corporatePolicies: req.body.corporate_policies ?? req.body.corporatePolicies,
        corporatePpeStandards: req.body.corporate_ppe_standards ?? req.body.corporatePpeStandards,
        publish: req.body.publish,
      });

      return res.status(201).json(profile);
    } catch (e) {
      next(e);
    }
  },

  async hazards(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = companyIdFromBody(req);
      assertCompanyScope(req, companyId);

      const hazard = await companySafetyService.addHazard({
        companyId,
        hazardId: req.body.hazard_id ?? req.body.hazardId,
        title: req.body.title,
        severity: Number(req.body.severity),
        likelihood: Number(req.body.likelihood),
        requiredControls: req.body.required_controls ?? req.body.requiredControls,
        requiredTraining: req.body.required_training ?? req.body.requiredTraining,
        publish: req.body.publish,
      });

      return res.status(201).json(hazard);
    } catch (e) {
      next(e);
    }
  },

  async controls(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = companyIdFromBody(req);
      assertCompanyScope(req, companyId);

      const control = await companySafetyService.addControl({
        companyId,
        controlId: req.body.control_id ?? req.body.controlId,
        title: req.body.title,
        controlStrength: Number(req.body.control_strength ?? req.body.controlStrength),
        verificationSteps: req.body.verification_steps ?? req.body.verificationSteps,
        requiredTraining: req.body.required_training ?? req.body.requiredTraining,
        publish: req.body.publish,
      });

      return res.status(201).json(control);
    } catch (e) {
      next(e);
    }
  },

  async training(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = companyIdFromBody(req);
      assertCompanyScope(req, companyId);

      const row = await companySafetyService.upsertTraining({
        companyId,
        role: req.body.role,
        requiredCourses: req.body.required_courses ?? req.body.requiredCourses ?? [],
      });

      return res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  },

  async policy(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = companyIdFromBody(req);
      assertCompanyScope(req, companyId);

      const policy = await companySafetyService.createPolicy({
        companyId,
        policyType: req.body.policy_type ?? req.body.policyType,
        title: req.body.title,
        content: req.body.content,
        requiresAckForAccess: req.body.requires_ack_for_access ?? req.body.requiresAckForAccess,
        publish: req.body.publish,
      });

      return res.status(201).json(policy);
    } catch (e) {
      next(e);
    }
  },

  async sds(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = companyIdFromBody(req);
      assertCompanyScope(req, companyId);

      const sds = await companySafetyService.createSds({
        companyId,
        productName: req.body.product_name ?? req.body.productName,
        casNumber: req.body.cas_number ?? req.body.casNumber,
        whmisClassification: req.body.whmis_classification ?? req.body.whmisClassification,
        ppeRequirements: req.body.ppe_requirements ?? req.body.ppeRequirements,
        filePath: req.body.file_path ?? req.body.filePath,
        publish: req.body.publish,
      });

      return res.status(201).json(sds);
    } catch (e) {
      next(e);
    }
  },

  async emergency(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = companyIdFromBody(req);
      assertCompanyScope(req, companyId);

      const plan = await companySafetyService.createEmergencyPlan({
        companyId,
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

  async equipment(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = companyIdFromBody(req);
      assertCompanyScope(req, companyId);

      const rule = await companySafetyService.upsertEquipmentRule({
        companyId,
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

  async zones(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = companyIdFromBody(req);
      assertCompanyScope(req, companyId);

      const zone = await companySafetyService.upsertZoneTemplate({
        companyId,
        templateCode: req.body.template_code ?? req.body.templateCode,
        zoneType: req.body.zone_type ?? req.body.zoneType,
        title: req.body.title,
        requiredTraining: req.body.required_training ?? req.body.requiredTraining,
        requiredPpe: req.body.required_ppe ?? req.body.requiredPpe,
        requiresJha: req.body.requires_jha ?? req.body.requiresJha,
        highRisk: req.body.high_risk ?? req.body.highRisk,
      });

      return res.status(201).json(zone);
    } catch (e) {
      next(e);
    }
  },

  async getByCompanyId(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = routeParam(req.params.company_id);
      assertCompanyScope(req, companyId);

      const bundle = await companySafetyService.getCompanySafety(companyId);
      return res.json(bundle);
    } catch (e) {
      next(e);
    }
  },
};
