export declare class RuleEngineService {
    evaluate({ worker, equipment, requiredCerts, }: {
        worker: any;
        equipment: any;
        requiredCerts: number[];
    }): {
        result: string;
        reasons: string[];
        missingCertifications: number[];
        expiredTraining: any;
        expiredCredentials: any;
        workerIncidents: any;
        equipmentIncidents: any;
    };
}
