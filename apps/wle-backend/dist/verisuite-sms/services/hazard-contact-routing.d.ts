import { type DangerousOccurrenceCode, type ProvincialRegion } from './erp-ohs-utility.catalog';
export type HazardRouteKind = 'gas_line_strike' | 'electrical_strike' | 'hazardous_release';
export type RoutedContactRole = 'primary_utility' | 'electric_utility' | 'local_fire' | 'provincial_ohs' | 'public_safety_911' | 'one_call';
export type HazardRoutedContact = {
    id: string;
    hazard: HazardRouteKind;
    role: RoutedContactRole;
    priority: number;
    name: string;
    phone: string | null;
    dialHint: string;
    reason: string;
    region: ProvincialRegion;
    verified: boolean;
    source: 'utility_catalog' | 'public_safety' | 'ohs_profile';
};
declare const HAZARD_LABEL: Record<HazardRouteKind, string>;
export declare function hazardsFromOccurrences(occurrences: DangerousOccurrenceCode[]): HazardRouteKind[];
export declare function hazardsFromText(text: string): HazardRouteKind[];
export declare function routeHazardContacts(input: {
    regionCode: string;
    occurrences?: DangerousOccurrenceCode[];
    text?: string;
    hazards?: HazardRouteKind[];
}): {
    region: ProvincialRegion;
    hazards: HazardRouteKind[];
    contacts: HazardRoutedContact[];
    summary: string[];
};
export { HAZARD_LABEL };
