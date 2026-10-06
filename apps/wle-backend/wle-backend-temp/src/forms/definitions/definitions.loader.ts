import { Injectable } from '@nestjs/common';
import type { SafetyFormDefinitionJson } from '../engine/form-engine.types';
import { SAFETY_FORM_CATALOG } from './catalog';

@Injectable()
export class DefinitionsLoader {
  private readonly byId = new Map<string, SafetyFormDefinitionJson>();

  constructor() {
    for (const def of SAFETY_FORM_CATALOG) {
      this.byId.set(def.id, def);
    }
  }

  all(): SafetyFormDefinitionJson[] {
    return [...this.byId.values()];
  }

  get(id: string): SafetyFormDefinitionJson | undefined {
    return this.byId.get(id);
  }

  byCategory(category: string): SafetyFormDefinitionJson[] {
    return this.all().filter((d) => d.category === category);
  }
}
