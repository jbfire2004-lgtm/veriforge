export type RootStackParamList = {
  Home: { workerId: number };
  Training: { workerId: number };
  TrainingDetail: { workerId: number; recordId: number };
  Orientations: { workerId: number; companyId?: number };
  QR: { workerId: number };
  Readiness: { workerId: number };
};
