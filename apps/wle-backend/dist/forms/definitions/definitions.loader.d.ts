import type { SafetyFormDefinitionJson } from '../engine/form-engine.types';
export declare class DefinitionsLoader {
    private readonly byId;
    constructor();
    all(): SafetyFormDefinitionJson[];
    get(id: string): SafetyFormDefinitionJson | undefined;
    byCategory(category: string): SafetyFormDefinitionJson[];
}
