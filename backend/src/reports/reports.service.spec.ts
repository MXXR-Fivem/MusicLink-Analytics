import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
    let service: ReportsService;
    let databaseService: DatabaseService;
    let publicId: string;
    let musicLinkId: number;

    beforeEach(async () => {
        process.env.DATABASE_URL = ':memory:';

        const module: TestingModule = await Test.createTestingModule({
            imports: [DatabaseModule],
            providers: [ReportsService],
        }).compile();

        await module.init();

        service = module.get<ReportsService>(ReportsService);
        databaseService = module.get<DatabaseService>(DatabaseService);

        publicId = 'report-public-id';
        const now = '2026-05-24T08:00:00.000Z';
        const inserted = await databaseService.db
            .insertInto('music_links')
            .values({
                publicId,
                title: 'N95',
                artist: 'Kendrick Lamar',
                coverUrl: 'https://example.com/cover.jpg',
                spotifyUrl: null,
                appleMusicUrl: null,
                deezerUrl: null,
                youtubeUrl: null,
                soundcloudUrl: null,
                metadata: null,
                createdAt: now,
                updatedAt: now,
            })
            .returning(['id'])
            .executeTakeFirstOrThrow();

        musicLinkId = inserted.id;
    });

    afterEach(async () => {
        await databaseService.onModuleDestroy();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should generate analytics report for a music link', async () => {
        await insertEvent('page_view', null, '2026-05-24T08:00:00.000Z');
        await insertEvent('page_view', null, '2026-05-24T09:00:00.000Z');
        await insertEvent('page_view', null, '2026-05-25T08:00:00.000Z');
        await insertEvent(
            'platform_click',
            'spotify',
            '2026-05-24T10:00:00.000Z',
        );
        await insertEvent(
            'platform_click',
            'spotify',
            '2026-05-25T10:00:00.000Z',
        );
        await insertEvent(
            'platform_click',
            'youtube',
            '2026-05-25T11:00:00.000Z',
        );

        const report = await service.getReport(publicId);

        expect(report).toEqual({
            publicId,
            title: 'N95',
            artist: 'Kendrick Lamar',
            coverUrl: 'https://example.com/cover.jpg',
            totalViews: 3,
            totalClicks: 3,
            clickThroughRate: 100,
            clicksByPlatform: [
                { platform: 'spotify', clicks: 2 },
                { platform: 'youtube', clicks: 1 },
            ],
            viewsOverTime: [
                { date: '2026-05-24', views: 2 },
                { date: '2026-05-25', views: 1 },
            ],
            clicksOverTime: [
                { date: '2026-05-24', clicks: 1 },
                { date: '2026-05-25', clicks: 2 },
            ],
        });
    });

    it('should throw when the music link does not exist', async () => {
        await expect(service.getReport('missing')).rejects.toThrow(
            'MusicLink not found',
        );
    });

    async function insertEvent(
        eventType: 'page_view' | 'platform_click',
        platform: string | null,
        createdAt: string,
    ) {
        await databaseService.db
            .insertInto('music_link_events')
            .values({
                musicLinkId,
                eventType,
                platform,
                metadata: null,
                createdAt,
            })
            .execute();
    }
});
