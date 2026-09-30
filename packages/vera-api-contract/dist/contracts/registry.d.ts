import type { ApiContractDefinition } from "./types";
/** Canonical API contract registry for Vera Core (§3). */
export declare const API_CONTRACT_REGISTRY: ApiContractDefinition[];
export declare function getContractById(id: string): ApiContractDefinition | undefined;
export declare function contractsByTag(tag: string): ApiContractDefinition[];
