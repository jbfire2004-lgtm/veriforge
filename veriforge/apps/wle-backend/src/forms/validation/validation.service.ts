import { Injectable } from '@nestjs/common';
import { FormEngineService } from '../engine/form-engine.service';
import type { SafetyFormDefinitionJson } from '../engine/form-engine.types';

@Injectable()
export class SafetyFormValidationService {
  constructor(private readonly engine: FormEngineService) {}

  validateSubmission(
    definition: SafetyFormDefinitionJson,
    data: Record<string, unknown>,
    partial = false,
  ) {
    return this.engine.validate(definition, data, partial);
  }
}
