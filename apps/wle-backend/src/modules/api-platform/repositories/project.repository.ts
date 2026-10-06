import { Injectable } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from './base.repository';

@Injectable()
export class ProjectRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { company: true },
    });
  }

  close(id: number) {
    return this.prisma.project.update({
      where: { id },
      data: { status: ProjectStatus.CLOSED },
    });
  }
}
