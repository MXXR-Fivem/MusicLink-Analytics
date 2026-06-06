import { Controller, Get, Param } from '@nestjs/common';
import type { MusicLinkReportResponse } from './report.types';
import { ReportsService } from './reports.service';

@Controller('music-links/:publicId/report')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get()
    getReport(
        @Param('publicId') publicId: string,
    ): Promise<MusicLinkReportResponse> {
        return this.reportsService.getReport(publicId);
    }
}
