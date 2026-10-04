import { Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SifHecaService } from '../sif-heca/sif-heca.service';
import { EventClassificationEngine } from './event-classification.engine';

@Injectable()
export class PmSafetyEventsIngestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classifier: EventClassificationEngine,
    @Optional() private readonly sifHeca?: SifHecaService,
  ) {}

  async ingestToSifHeca(eventId: string, actorId?: number) {
    if (!this.sifHeca) return null;

    const event = await this.prisma.pmSafetyEvent.findUnique({
      where: { id: eventId },
      include: { injuries: true, equipmentLinks: true },
    });
    if (!event || event.sifEventId) return null;
    if (event.severity !== 'high' && event.severity !== 'critical') {
      if (
        event.eventType !== 'incident_injury' &&
        event.eventType !== 'near_miss'
      ) {
        return null;
      }
    }

    const energyTypes = [
      this.classifier.suggestHecaCategory(
        event.description ?? event.title,
        event.hecaCategoryCode ?? undefined,
      ),
    ];

    const hasMedical = event.injuries.some((i) => i.medicalAid || i.lostTime);
    const result = await this.sifHeca.ingest({
      companyId: event.companyId,
      projectId: event.projectId,
      siteId: event.siteId ?? undefined,
      sourceType: 'incident',
      sourceId: eventId,
      sourceItemId: '',
      title: event.title,
      description: event.description ?? undefined,
      rawPayload: { event } as unknown as Record<string, unknown>,
      scoringInput: {
        hazardSeverity:
          event.severity === 'critical' ? 5 : event.severity === 'high' ? 4 : 3,
        hazardLikelihood: hasMedical ? 5 : event.likelihood,
        energyTypes,
        controls: [],
      },
      actorId,
    });

    await this.prisma.pmSafetyEvent.update({
      where: { id: eventId },
      data: {
        sifEventId: result.id,
        hecaCategoryCode:
          result.hecaScore?.hecaCategoryCode ?? event.hecaCategoryCode,
      },
    });
    return result;
  }
}
