/** Shapes returned by `GET /companies/:id` (Prisma `findOne` include). */

export type CompanyCertificationRef = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type CompanyTrainingRecord = {
  id: number;
  workerId: number;
  certificationId?: number | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  completedAt?: string | null;
  certificateNumber?: string | null;
  certification?: CompanyCertificationRef | null;
};

export type CompanyCredential = {
  id: number;
  workerId: number;
  name?: string | null;
  value?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  certification?: CompanyCertificationRef | null;
};

export type CompanyIncident = {
  id: number;
  title?: string | null;
  description?: string | null;
  createdAt?: string | null;
};

export type CompanyWorker = {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  trainingRecords?: CompanyTrainingRecord[];
  credentials?: CompanyCredential[];
  incidents?: CompanyIncident[];
};

export type CompanyEquipment = {
  id: number;
  name?: string | null;
  safetyStatus?: string | null;
  incidents?: CompanyIncident[];
};

export type CompanyDetails = {
  id: number;
  name: string;
  logoUrl?: string | null;
  createdAt?: string | null;
  workers: CompanyWorker[];
  equipment: CompanyEquipment[];
  documents?: { id: number; name?: string | null; url?: string | null; type?: string | null }[];
  incidents?: CompanyIncident[];
};
