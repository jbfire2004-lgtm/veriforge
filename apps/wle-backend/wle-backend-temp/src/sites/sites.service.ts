import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SitesService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // LIST ALL SITES
  // ---------------------------------------------------------
  async findAll() {
    return this.prisma.site.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // ---------------------------------------------------------
  // GET SITE WITH FULL DETAILS
  // ---------------------------------------------------------
  async findOne(id: number) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: {
        workerSiteAccess: {
          include: { worker: true },
        },
        digitalSignoff: {
          include: {
            worker: true,
            equipment: true,
            supervisor: true,
          },
        },
      },
    });

    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  // ---------------------------------------------------------
  // CREATE SITE
  // ---------------------------------------------------------
  async create(data: { name: string }) {
    return this.prisma.site.create({
      data: {
        name: data.name,
      },
    });
  }

  // ---------------------------------------------------------
  // UPDATE SITE
  // ---------------------------------------------------------
  async update(id: number, data: Partial<{ name: string }>) {
    const existing = await this.prisma.site.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Site not found');

    return this.prisma.site.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
      },
    });
  }

  // ---------------------------------------------------------
  // DELETE SITE
  // ---------------------------------------------------------
  async remove(id: number) {
    const existing = await this.prisma.site.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Site not found');

    await this.prisma.site.delete({ where: { id } });
    return { status: 'ok', deletedId: id };
  }

  // ---------------------------------------------------------
  // LIGHTWEIGHT SUMMARY (FOR DASHBOARDS)
  // ---------------------------------------------------------
  async summary(id: number) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: {
        workerSiteAccess: true,
        digitalSignoff: true,
      },
    });

    if (!site) throw new NotFoundException('Site not found');

    return {
      siteId: site.id,
      siteName: site.name,
      accessCount: site.workerSiteAccess.length,
      signoffCount: site.digitalSignoff.length,
    };
  }
}
