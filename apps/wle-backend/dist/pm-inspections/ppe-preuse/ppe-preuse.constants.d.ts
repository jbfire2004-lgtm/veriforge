export type PpePreUseItemResult = 'pass' | 'fail' | 'na';
export type PpePreUseChecklistItemDef = {
    id: string;
    category: string;
    label: string;
    critical?: boolean;
};
export declare const PPE_PREUSE_CHECKLIST: PpePreUseChecklistItemDef[];
export type PpePreUseItemSubmission = {
    id: string;
    result: PpePreUseItemResult;
    note?: string;
};
export declare function computePpePreUseOverall(items: PpePreUseItemSubmission[]): 'pass' | 'fail' | 'conditional';
