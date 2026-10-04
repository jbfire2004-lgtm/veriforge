import { Injectable, NotFoundException } from '@nestjs/common';
import { PmSmsHecaType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_HECA_ENTRIES: Array<{
  code: string;
  title: string;
  hecaType: PmSmsHecaType;
  energyTypes: string[];
  controls: string[];
  verification: string[];
}> = [
  {
    code: 'HECA_CRANE_LIFT',
    title: 'Critical crane lift',
    hecaType: 'critical_task',
    energyTypes: ['gravity', 'mechanical'],
    controls: ['lift_plan', 'exclusion_zone', 'signal_person'],
    verification: ['lift_plan_approved', 'rigging_inspected'],
  },
  {
    code: 'HECA_ENERGIZED_ELECTRICAL',
    title: 'Energized electrical work',
    hecaType: 'critical_task',
    energyTypes: ['electrical'],
    controls: ['lockout_tagout', 'arc_flash_ppe', 'qualified_person'],
    verification: ['loto_verified', 'voltage_tested'],
  },
  {
    code: 'HECA_CONFINED_SPACE',
    title: 'Confined space entry',
    hecaType: 'critical_task',
    energyTypes: ['chemical', 'pressure'],
    controls: ['entry_permit', 'atmospheric_monitoring', 'rescue_plan'],
    verification: ['gas_test_logged', 'attendant_assigned'],
  },
  {
    code: 'HECA_PRESSURE_VESSEL',
    title: 'Pressure vessel / system',
    hecaType: 'critical_equipment',
    energyTypes: ['pressure', 'thermal'],
    controls: ['pressure_relief', 'inspection_current'],
    verification: ['certification_valid'],
  },
];

@Injectable()
export class SmsHecaLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async seedDefaults(companyId: number, projectId?: number) {
    for (const entry of DEFAULT_HECA_ENTRIES) {
      await this.prisma.pmSmsHecaLibraryEntry.upsert({
        where: { companyId_code: { companyId, code: entry.code } },
        create: {
          companyId,
          projectId,
          code: entry.code,
          title: entry.title,
          hecaType: entry.hecaType,
          energyTypesJson: entry.energyTypes,
          requiredControlsJson: entry.controls,
          verificationStepsJson: entry.verification,
        },
        update: {},
      });
    }
    return this.list(companyId, projectId);
  }

  async list(companyId: number, projectId?: number, activeOnly = true) {
    return this.prisma.pmSmsHecaLibraryEntry.findMany({
      where: {
        companyId,
        OR: projectId ? [{ projectId }, { projectId: null }] : undefined,
        active: activeOnly ? true : undefined,
      },
      orderBy: { title: 'asc' },
    });
  }

  async create(
    companyId: number,
    data: {
      code: string;
      title: string;
      description?: string;
      hecaType: PmSmsHecaType;
      projectId?: number;
      requiredControls?: string[];
      verificationSteps?: string[];
      trainingCodes?: string[];
      energyTypes?: string[];
    },
  ) {
    return this.prisma.pmSmsHecaLibraryEntry.create({
      data: {
        companyId,
        projectId: data.projectId,
        code: data.code,
        title: data.title,
        description: data.description,
        hecaType: data.hecaType,
        requiredControlsJson: data.requiredControls ?? [],
        verificationStepsJson: data.verificationSteps ?? [],
        trainingCodesJson: data.trainingCodes ?? [],
        energyTypesJson: data.energyTypes ?? [],
      },
    });
  }

  async getByCode(companyId: number, code: string) {
    const row = await this.prisma.pmSmsHecaLibraryEntry.findUnique({
      where: { companyId_code: { companyId, code } },
    });
    if (!row) throw new NotFoundException(`HECA entry ${code} not found`);
    return row;
  }
}
