import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { IncidentsService } from '../incidents/incidents.service';
import { SafetyStationService } from '../safety-station/safety-station.service';
import { SafetyMapService } from '../safety-map/safety-map.service';
import { VerificationService } from '../verification/verification.service';

/** Rewritten Next.js rewrites + older mobile pages; keep public until callers send Bearer. */
@Public()
@Controller()
export class LegacyCompatController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly incidents: IncidentsService,
    private readonly stations: SafetyStationService,
    private readonly safetyMap: SafetyMapService,
    private readonly verification: VerificationService,
  ) {}

  // Legacy singular incidents routes used by older frontend pages.
  @Get('incident')
  listIncidents(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('companyId') companyId?: string,
    @Query('siteId') siteId?: string,
    @Query('workerId') workerId?: string,
    @Query('equipmentId') equipmentId?: string,
  ) {
    return this.incidents.list({
      status: status || undefined,
      severity: severity || undefined,
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      siteId: siteId ? parseInt(siteId, 10) : undefined,
      workerId: workerId ? parseInt(workerId, 10) : undefined,
      equipmentId: equipmentId ? parseInt(equipmentId, 10) : undefined,
    });
  }

  @Get('incident/company/:companyId')
  listIncidentsForCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.incidents.list({ companyId });
  }

  @Get('incident/worker/:workerId')
  listIncidentsForWorker(@Param('workerId', ParseIntPipe) workerId: number) {
    return this.incidents.list({ workerId });
  }

  @Get('incident/equipment/:equipmentId')
  listIncidentsForEquipment(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
  ) {
    return this.incidents.list({ equipmentId });
  }

  @Get('incidents/analytics')
  async incidentsAnalytics(
    @Query('days') daysRaw?: string,
    @Query('severity') severity?: string,
    @Query('company') companyRaw?: string,
  ) {
    const days = Number.isFinite(Number(daysRaw)) ? Number(daysRaw) : 30;
    const since = new Date(Date.now() - Math.max(days, 1) * 86400000);
    const companyId = Number.isFinite(Number(companyRaw))
      ? Number(companyRaw)
      : undefined;
    const rows = await this.prisma.incident.findMany({
      where: {
        createdAt: { gte: since },
        severity: severity || undefined,
        companyId,
      },
      orderBy: { createdAt: 'desc' },
    });
    return {
      total: rows.length,
      bySeverity: {
        LOW: rows.filter((r) => r.severity === 'LOW').length,
        MEDIUM: rows.filter((r) => r.severity === 'MEDIUM').length,
        HIGH: rows.filter((r) => r.severity === 'HIGH').length,
        CRITICAL: rows.filter((r) => r.severity === 'CRITICAL').length,
      },
      rows,
    };
  }

  @Get('verification/combined-status')
  combinedStatus(
    @Query('worker') workerRaw?: string,
    @Query('equipment') equipmentRaw?: string,
  ) {
    const workerId = parseInt(workerRaw ?? '', 10);
    const equipmentId = parseInt(equipmentRaw ?? '', 10);
    return this.verification.verifyCombined(workerId, equipmentId);
  }

  @Get('gate/logs')
  async gateLogs() {
    return this.prisma.digitalSignoff.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        worker: true,
        equipment: true,
        site: true,
      },
    });
  }

  @Get('logging/stats')
  async loggingStats() {
    const [signoffs, incidents, workers, equipment] = await Promise.all([
      this.prisma.digitalSignoff.count(),
      this.prisma.incident.count(),
      this.prisma.worker.count(),
      this.prisma.equipment.count(),
    ]);
    return { signoffs, incidents, workers, equipment };
  }

  @Get('cache/workers')
  cacheWorkers() {
    return this.prisma.worker.findMany({ orderBy: { id: 'desc' }, take: 500 });
  }

  @Get('cache/equipment')
  cacheEquipment() {
    return this.prisma.equipment.findMany({
      orderBy: { id: 'desc' },
      take: 500,
    });
  }

  @Get('cache/training')
  cacheTraining() {
    return this.prisma.trainingRecord.findMany({
      include: { certification: true, worker: true },
      orderBy: { id: 'desc' },
      take: 1000,
    });
  }

  @Get('cache/requirements')
  cacheRequirements() {
    return this.prisma.equipmentTrainingRequirement.findMany({
      include: { equipment: true, certification: true },
      orderBy: { id: 'desc' },
      take: 1000,
    });
  }

  @Get('safety-station/list')
  safetyStationList() {
    return this.stations.findAll();
  }

  @Get('safety-station/monitor')
  async safetyStationMonitor() {
    const rows = await this.stations.findAll();
    return rows.map((r) => ({
      ...r,
      online: false,
    }));
  }

  @Patch('safety-station/:id/config')
  safetyStationConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Partial<{ name: string; siteId: number | null; active: boolean }>,
  ) {
    return this.stations.update(id, body);
  }

  @Post('safety-station/:id/action/:action')
  safetyStationAction(
    @Param('id', ParseIntPipe) id: number,
    @Param('action') action: string,
  ) {
    return { ok: true, stationId: id, action };
  }

  @Get('map/workers')
  mapWorkers() {
    return this.safetyMap.listWorkersForMap();
  }

  @Get('map/equipment')
  mapEquipment() {
    return this.safetyMap.listEquipmentForMap();
  }

  @Get('map/stations')
  mapStations() {
    return this.safetyMap.listStationsForMap();
  }

  @Get('map/incidents')
  mapIncidents() {
    return this.safetyMap.listIncidentsForMap();
  }
}
