import type { IntelligenceBundle, NlpQuery, NlpResponse } from "../types";
export declare class NaturalLanguageEngine {
    parse(text: string): NlpQuery;
    answer(query: NlpQuery, bundle?: IntelligenceBundle): NlpResponse;
}
//# sourceMappingURL=nlp-engine.d.ts.map