import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RuleEngineService } from '../rules/rule-engine.service';
import { PublicTokenResolver } from '../verification/public-token.resolver';

@Injectable()
export class CombinedService {
  constructor(
    private prisma: PrismaService,
    private ruleEngine: RuleEngineService,
    private readonly publicTokens: PublicTokenResolver,
  ) {}

  // LOAD WORKER WITH FULL SAFETY DATA
  private async loadWorker(workerId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        company: true,
        trainingRecords: { include: { certification: true } },
        credentials: { include: { certification: true } },
        incidents: true,
      },
    });

    if (!worker) throw new NotFoundException('Worker not found');
    return worker;
  }

  // LOAD EQUIPMENT WITH FULL SAFETY DATA
  private async loadEquipment(equipmentId: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        company: true,
        trainingRequirements: {
          include: { certification: true },
        },
        incidents: true,
      },
    });

    if (!equipment) throw new NotFoundException('Equipment not found');
    return equipment;
  }

  // RAW COMBINED VERIFICATION (FULL OBJECTS)
  async verifyCombined(workerId: number, equipmentId: number) {
    const worker = await this.loadWorker(workerId);
    const equipment = await this.loadEquipment(equipmentId);

    const requiredCerts = equipment.trainingRequirements.map(
      (r) => r.certificationId,
    );

    const evaluation = this.ruleEngine.evaluate({
      worker,
      equipment,
      requiredCerts,
    });

    return {
      worker,
      equipment,
      requiredCerts,
      ...evaluation,
    };
  }

  async verifyCombinedByRef(workerRef: string, equipmentRef: string) {
    const worker = await this.publicTokens.resolveWorkerRef(workerRef);
    const equipment = await this.publicTokens.resolveEquipmentRef(equipmentRef);
    return this.verifyCombined(worker.workerId, equipment.equipmentId);
  }

  async getCombinedResultViewByRef(workerRef: string, equipmentRef: string) {
    const worker = await this.publicTokens.resolveWorkerRef(workerRef);
    const equipment = await this.publicTokens.resolveEquipmentRef(equipmentRef);
    return this.getCombinedResultView(worker.workerId, equipment.equipmentId);
  }

  // UI-FRIENDLY VIEW MODEL FOR COMBINED RESULTS PAGE (no raw DB objects)
  async getCombinedResultView(workerId: number, equipmentId: number) {
    const result = await this.verifyCombined(workerId, equipmentId);

    const worker = result.worker;
    const equipment = result.equipment;

    return {
      status: result.result, // SAFE | UNSAFE
      reasons: result.reasons,
      workerSummary: {
        id: worker.id,
        firstName: worker.firstName,
        lastName: worker.lastName,
        fullName: `${worker.firstName} ${worker.lastName}`,
        companyName: worker.company?.name ?? null,
        photoUrl: worker.photoUrl ?? null,
      },
      equipmentSummary: {
        id: equipment.id,
        name: equipment.name,
        serialNumber: equipment.serialNumber ?? null,
        companyName: equipment.company?.name ?? null,
      },
      badges: {
        missingCertsCount: result.missingCertifications.length,
        expiredTrainingCount: result.expiredTraining.length,
        expiredCredentialsCount: result.expiredCredentials.length,
        workerIncidentsCount: result.workerIncidents.length,
        equipmentIncidentsCount: result.equipmentIncidents.length,
      },
    };
  }
}
