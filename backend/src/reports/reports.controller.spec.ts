import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
    let controller: ReportsController;
    const reportsService = {
        getReport: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReportsController],
            providers: [
                {
                    provide: ReportsService,
                    useValue: reportsService,
                },
            ],
        }).compile();

        controller = module.get<ReportsController>(ReportsController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should delegate report generation to the service', async () => {
        const report = {
            publicId: 'public-id',
            title: 'N95',
            artist: 'Kendrick Lamar',
            totalViews: 2,
            totalClicks: 1,
            clickThroughRate: 50,
            clicksByPlatform: [{ platform: 'spotify', clicks: 1 }],
            viewsOverTime: [{ date: '2026-05-24', views: 2 }],
            clicksOverTime: [{ date: '2026-05-24', clicks: 1 }],
        };

        reportsService.getReport.mockResolvedValue(report);

        await expect(controller.getReport('public-id')).resolves.toEqual(
            report,
        );
        expect(reportsService.getReport).toHaveBeenCalledWith('public-id');
    });
});
