import { NotificationSchedulerCron } from './notification-scheduler.cron';
import { NotificationSchedulerService } from './notification-scheduler.service';

describe('NotificationSchedulerCron', () => {
  const expiryMetrics = {
    scanned: 2,
    processed: 2,
    notified: 3,
    skipped: 1,
    readinessRecalc: 1,
    errors: 0,
  };

  it('daily job runs training, equipment cert, and fit test expiry', async () => {
    const scheduler = {
      runInspections: jest.fn().mockResolvedValue({}),
      runCompetencyExpiry: jest.fn().mockResolvedValue({}),
      runPpeExpiry: jest.fn().mockResolvedValue({}),
      runMaintenance: jest.fn().mockResolvedValue({}),
      runTrainingExpiry: jest.fn().mockResolvedValue(expiryMetrics),
      runEquipmentCertExpiry: jest.fn().mockResolvedValue(expiryMetrics),
      runFitTestExpiry: jest.fn().mockResolvedValue({ notified: 0, tests: 0 }),
    } as unknown as NotificationSchedulerService;

    const cron = new NotificationSchedulerCron(scheduler);
    await cron.dailyComplianceNotifications();

    expect(scheduler.runTrainingExpiry).toHaveBeenCalled();
    expect(scheduler.runEquipmentCertExpiry).toHaveBeenCalled();
    expect(scheduler.runFitTestExpiry).toHaveBeenCalled();
  });

  it('continues other steps when training expiry throws', async () => {
    const scheduler = {
      runInspections: jest.fn().mockResolvedValue({}),
      runCompetencyExpiry: jest.fn().mockResolvedValue({}),
      runPpeExpiry: jest.fn().mockResolvedValue({}),
      runMaintenance: jest.fn().mockResolvedValue({}),
      runTrainingExpiry: jest.fn().mockRejectedValue(new Error('db down')),
      runEquipmentCertExpiry: jest.fn().mockResolvedValue(expiryMetrics),
      runFitTestExpiry: jest.fn().mockResolvedValue({ notified: 0, tests: 0 }),
    } as unknown as NotificationSchedulerService;

    const cron = new NotificationSchedulerCron(scheduler);
    await cron.dailyComplianceNotifications();

    expect(scheduler.runEquipmentCertExpiry).toHaveBeenCalled();
    expect(scheduler.runFitTestExpiry).toHaveBeenCalled();
  });
});
