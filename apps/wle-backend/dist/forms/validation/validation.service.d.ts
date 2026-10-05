import { FormEngineService } from '../engine/form-engine.service';
import type { SafetyFormDefinitionJson } from '../engine/form-engine.types';
export declare class SafetyFormValidationService {
    private readonly engine;
    constructor(engine: FormEngineService);
    validateSubmission(definition: SafetyFormDefinitionJson, data: Record<string, unknown>, partial?: boolean): import("../engine/form-engine.types").SafetyFormValidationError[];
}
