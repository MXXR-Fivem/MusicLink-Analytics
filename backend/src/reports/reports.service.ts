import { Injectable, NotFoundException } from '@nestjs/common';
import { sql } from 'kysely';
import { DatabaseService } from '../database/database.service';
import type {
    DailyClicks,
    DailyViews,
    MusicLinkReportResponse,
    PlatformClicks,
} from './report.types';

@Injectable()
export class ReportsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async getReport(publicId: string): Promise<MusicLinkReportResponse> {
        const musicLink = await this.databaseService.db
            .selectFrom('music_links')
            .select(['id', 'publicId', 'title', 'artist', 'coverUrl'])
            .where('publicId', '=', publicId)
            .executeTakeFirst();

        if (!musicLink) {
            throw new NotFoundException('MusicLink not found');
        }

        const [
            totalViews,
            totalClicks,
            clicksByPlatform,
            viewsOverTime,
            clicksOverTime,
        ] = await Promise.all([
            this.countEvents(musicLink.id, 'page_view'),
            this.countEvents(musicLink.id, 'platform_click'),
            this.getClicksByPlatform(musicLink.id),
            this.getViewsOverTime(musicLink.id),
            this.getClicksOverTime(musicLink.id),
        ]);

        return {
            publicId: musicLink.publicId,
            title: musicLink.title,
            artist: musicLink.artist,
            coverUrl: musicLink.coverUrl,
            totalViews,
            totalClicks,
            clickThroughRate:
                totalViews === 0
                    ? 0
                    : Number(((totalClicks / totalViews) * 100).toFixed(2)),
            clicksByPlatform,
            viewsOverTime,
            clicksOverTime,
        };
    }

    private async countEvents(
        musicLinkId: number,
        eventType: 'page_view' | 'platform_click',
    ): Promise<number> {
        const result = await this.databaseService.db
            .selectFrom('music_link_events')
            .select(sql<number>`count(*)`.as('total'))
            .where('musicLinkId', '=', musicLinkId)
            .where('eventType', '=', eventType)
            .executeTakeFirst();

        return Number(result?.total ?? 0);
    }

    private async getClicksByPlatform(
        musicLinkId: number,
    ): Promise<PlatformClicks[]> {
        const rows = await this.databaseService.db
            .selectFrom('music_link_events')
            .select(['platform', sql<number>`count(*)`.as('clicks')])
            .where('musicLinkId', '=', musicLinkId)
            .where('eventType', '=', 'platform_click')
            .where('platform', 'is not', null)
            .groupBy('platform')
            .orderBy('clicks', 'desc')
            .execute();

        return rows.map((row) => ({
            platform: row.platform ?? 'unknown',
            clicks: Number(row.clicks),
        }));
    }

    private async getViewsOverTime(musicLinkId: number): Promise<DailyViews[]> {
        const rows = await this.databaseService.db
            .selectFrom('music_link_events')
            .select([
                sql<string>`date("createdAt")`.as('date'),
                sql<number>`count(*)`.as('views'),
            ])
            .where('musicLinkId', '=', musicLinkId)
            .where('eventType', '=', 'page_view')
            .groupBy(sql`date("createdAt")`)
            .orderBy('date', 'asc')
            .execute();

        return rows.map((row) => ({
            date: row.date,
            views: Number(row.views),
        }));
    }

    private async getClicksOverTime(
        musicLinkId: number,
    ): Promise<DailyClicks[]> {
        const rows = await this.databaseService.db
            .selectFrom('music_link_events')
            .select([
                sql<string>`date("createdAt")`.as('date'),
                sql<number>`count(*)`.as('clicks'),
            ])
            .where('musicLinkId', '=', musicLinkId)
            .where('eventType', '=', 'platform_click')
            .groupBy(sql`date("createdAt")`)
            .orderBy('date', 'asc')
            .execute();

        return rows.map((row) => ({
            date: row.date,
            clicks: Number(row.clicks),
        }));
    }
}
