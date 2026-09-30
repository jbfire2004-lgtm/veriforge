import { CertStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class CertificationService {
  async addCertification(data: {
    workerId: string;
    type: string;
    expiry?: Date | null;
    status?: CertStatus;
  }) {
    return prisma.certification.create({
      data: {
        workerId: data.workerId,
        type: data.type,
        expiry: data.expiry ?? null,
        status: data.status ?? CertStatus.valid,
      },
    });
  }

  async updateCertification(
    id: string,
    patch: Partial<{ type: string; expiry: Date | null; status: CertStatus }>,
  ) {
    return prisma.certification.update({
      where: { id },
      data: patch,
    });
  }

  async expireCertification(id: string) {
    return prisma.certification.update({
      where: { id },
      data: { status: CertStatus.expired },
    });
  }

  async getWorkerCertifications(workerId: string) {
    return prisma.certification.findMany({
      where: { workerId },
      orderBy: { expiry: "asc" },
    });
  }
}
