import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentTrainingRequirementDto } from './dto/create-equipment-training-requirement.dto';
import { UpdateEquipmentTrainingRequirementDto } from './dto/update-equipment-training-requirement.dto';

const includeRelations = {
  equipment: true,
  certification: true,
} as const;

@Injectable()
export class EquipmentTrainingRequirementsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEquipmentTrainingRequirementDto) {
    await this.assertEquipmentExists(dto.equipmentId);
    await this.assertCertificationExists(dto.certificationId);

    const duplicate = await this.prisma.equipmentTrainingRequirement.findFirst({
      where: {
        equipmentId: dto.equipmentId,
        certificationId: dto.certificationId,
      },
    });
    if (duplicate) {
      throw new ConflictException(
        'This certification is already required for this equipment',
      );
    }

    return this.prisma.equipmentTrainingRequirement.create({
      data: {
        equipmentId: dto.equipmentId,
        certificationId: dto.certificationId,
      },
      include: includeRelations,
    });
  }

  findAll() {
    return this.prisma.equipmentTrainingRequirement.findMany({
      include: includeRelations,
      orderBy: { id: 'asc' },
    });
  }

  async findByEquipment(equipmentId: number) {
    await this.assertEquipmentExists(equipmentId);
    return this.prisma.equipmentTrainingRequirement.findMany({
      where: { equipmentId },
      include: includeRelations,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const row = await this.prisma.equipmentTrainingRequirement.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!row)
      throw new NotFoundException('Equipment training requirement not found');
    return row;
  }

  async update(id: number, dto: UpdateEquipmentTrainingRequirementDto) {
    const existing = await this.prisma.equipmentTrainingRequirement.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException('Equipment training requirement not found');

    const nextEquipmentId = dto.equipmentId ?? existing.equipmentId;
    const nextCertId = dto.certificationId ?? existing.certificationId;

    if (dto.equipmentId !== undefined) {
      await this.assertEquipmentExists(nextEquipmentId);
    }
    if (dto.certificationId !== undefined) {
      await this.assertCertificationExists(nextCertId);
    }

    const duplicate = await this.prisma.equipmentTrainingRequirement.findFirst({
      where: {
        equipmentId: nextEquipmentId,
        certificationId: nextCertId,
        NOT: { id },
      },
    });
    if (duplicate) {
      throw new ConflictException(
        'This certification is already required for this equipment',
      );
    }

    return this.prisma.equipmentTrainingRequirement.update({
      where: { id },
      data: {
        ...(dto.equipmentId !== undefined && { equipmentId: dto.equipmentId }),
        ...(dto.certificationId !== undefined && {
          certificationId: dto.certificationId,
        }),
      },
      include: includeRelations,
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.equipmentTrainingRequirement.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException('Equipment training requirement not found');

    await this.prisma.equipmentTrainingRequirement.delete({ where: { id } });
    return { status: 'ok', deletedId: id };
  }

  private async assertEquipmentExists(id: number) {
    const equipment = await this.prisma.equipment.findUnique({ where: { id } });
    if (!equipment) throw new NotFoundException('Equipment not found');
  }

  private async assertCertificationExists(id: number) {
    const cert = await this.prisma.certification.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('Certification not found');
  }
}
