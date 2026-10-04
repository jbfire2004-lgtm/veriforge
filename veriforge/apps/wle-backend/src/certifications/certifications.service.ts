import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';

@Injectable()
export class CertificationsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateCertificationDto) {
    return this.prisma.certification.create({
      data,
    });
  }

  findAll() {
    return this.prisma.certification.findMany({
      include: {
        trainingRecords: {
          include: {
            worker: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.certification.findUnique({
      where: { id },
      include: {
        trainingRecords: {
          include: {
            worker: true,
          },
        },
      },
    });
  }

  update(id: number, data: UpdateCertificationDto) {
    return this.prisma.certification.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.certification.delete({
      where: { id },
    });
  }
}
