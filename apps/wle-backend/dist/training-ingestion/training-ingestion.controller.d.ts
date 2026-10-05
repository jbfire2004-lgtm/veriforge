import { TrainingIngestionService } from './training-ingestion.service';
import { IngestTrainingCsvDto } from './dto/ingest-training-csv.dto';
import { IngestTrainingRowsDto } from './dto/ingest-training-rows.dto';
export declare class TrainingIngestionController {
    private readonly ingestion;
    constructor(ingestion: TrainingIngestionService);
    ingestCsv(dto: IngestTrainingCsvDto): Promise<import("./training-ingestion.service").IngestSummary>;
    ingestRows(dto: IngestTrainingRowsDto): Promise<import("./training-ingestion.service").IngestSummary>;
}
