import { Injectable } from '@nestjs/common';
import type {
  SafetyFormDefinitionJson,
  SafetyFormFieldDefinition,
  SafetyFormValidationError,
} from './form-engine.types';
import { isFieldVisible, visibleFields } from './conditional.evaluator';

@Injectable()
export class FormEngineService {
  getVisibleFields(
    definition: SafetyFormDefinitionJson,
    data: Record<string, unknown>,
  ): SafetyFormFieldDefinition[] {
    return visibleFields(definition.fields, data);
  }

  validate(
    definition: SafetyFormDefinitionJson,
    data: Record<string, unknown>,
    partial = false,
  ): SafetyFormValidationError[] {
    const errors: SafetyFormValidationError[] = [];
    const visibilityCtx = {
      ...data,
      __requiresSupervisor: definition.workflow?.requiresSupervisor === true,
    };
    const fields = partial
      ? definition.fields
      : visibleFields(definition.fields, visibilityCtx);

    for (const field of fields) {
      if (!isFieldVisible(field, visibilityCtx) && !partial) continue;
      const value = data[field.id];
      const required = field.required === true;

      if (
        required &&
        (value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0))
      ) {
        errors.push({
          fieldId: field.id,
          message: `${field.label} is required`,
        });
        continue;
      }

      if (value == null || value === '') continue;

      const v = field.validation ?? {};
      if (field.type === 'number' && typeof value === 'number') {
        const min = v.min as number | undefined;
        const max = v.max as number | undefined;
        if (min != null && value < min) {
          errors.push({
            fieldId: field.id,
            message: `${field.label} must be at least ${min}`,
          });
        }
        if (max != null && value > max) {
          errors.push({
            fieldId: field.id,
            message: `${field.label} must be at most ${max}`,
          });
        }
      }

      if (
        (field.type === 'select' || field.type === 'multiselect') &&
        field.options?.length
      ) {
        const allowed = field.options.map((o) =>
          typeof o === 'string' ? o : o.value,
        );
        if (field.type === 'multiselect' && Array.isArray(value)) {
          for (const item of value) {
            if (!allowed.includes(String(item))) {
              errors.push({
                fieldId: field.id,
                message: `Invalid option in ${field.label}`,
              });
            }
          }
        } else if (!allowed.includes(String(value))) {
          errors.push({
            fieldId: field.id,
            message: `Invalid selection for ${field.label}`,
          });
        }
      }
    }
    return errors;
  }

  evaluateFlags(
    definition: SafetyFormDefinitionJson,
    data: Record<string, unknown>,
  ): { sifFlag: boolean; hecaFlag: boolean } {
    const wf = definition.workflow ?? {};
    let sifFlag = false;
    let hecaFlag = false;

    if (wf.autoFlagSIF) {
      sifFlag =
        data.sifPotential === true ||
        data.sifPotential === 'yes' ||
        data.severity === 'SIF' ||
        data.energyType === 'gravity' ||
        data.energyType === 'mechanical';
    }
    if (wf.autoFlagHECA) {
      hecaFlag =
        data.hecaCategory != null ||
        data.hecaObservation === true ||
        data.observationType === 'HECA' ||
        data.atRisk === true;
    }
    return { sifFlag, hecaFlag };
  }
}
