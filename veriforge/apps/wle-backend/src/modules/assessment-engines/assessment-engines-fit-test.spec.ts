import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentEnginesController } from './assessment-engines.controller';
import { AssessmentEnginesService } from './assessment-engines.service';
import { AssessmentExportService } from './assessment-export.service';
import { FitTestService } from '../fit-test/fit-test.service';

describe('AssessmentEnginesController fit-test routes', () => {
  let controller: AssessmentEnginesController;

  const engines = {};
  const exportPdf = {};
  const fitTests = {
    run: jest.fn(),
    summary: jest.fn(),
    listHistory: jest.fn(),
    exportPdf: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentEnginesController],
      providers: [
        { provide: AssessmentEnginesService, useValue: engines },
        { provide: AssessmentExportService, useValue: exportPdf },
        { provide: FitTestService, useValue: fitTests },
      ],
    }).compile();

    controller = module.get(AssessmentEnginesController);
  });

  it('POST fit-test/worker/:id delegates to FitTestService.run', async () => {
    fitTests.run.mockResolvedValue({
      run: { id: 1, result: 'PASS' },
      evaluation: { pass: true },
    });

    const out = await controller.runFitTest(
      '42',
      { user: { userId: 7 } },
      { result: 'PASS', testType: 'N95' },
    );

    expect(fitTests.run).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        result: 'PASS',
        testType: 'N95',
        createdById: 7,
      }),
    );
    expect(out.run.result).toBe('PASS');
  });

  it('GET fit-test/worker/:id/latest delegates to summary', async () => {
    fitTests.summary.mockResolvedValue({ latest: { id: 3 }, evaluation: {} });
    await controller.latestFitTest('5');
    expect(fitTests.summary).toHaveBeenCalledWith(5);
  });

  it('GET fit-test/worker/:id/history delegates to listHistory', async () => {
    fitTests.listHistory.mockResolvedValue([]);
    await controller.fitTestHistory('5');
    expect(fitTests.listHistory).toHaveBeenCalledWith(5);
  });
});
