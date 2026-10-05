export type ControlClass = 'direct' | 'alternative';
export declare function inferControlClass(controlType: string, energyTypes?: string[], hazardCategories?: string[]): ControlClass;
export declare function controlClassLabel(cls: ControlClass): string;
export declare function isDirectControlType(controlType: string, energyTypes?: string[]): boolean;
