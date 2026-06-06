import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { EventsService } from './events.service';

describe('EventsService', () => {
    let service: EventsService;
    let databaseService: DatabaseService;
    let publicId: string;

    beforeEach(async () => {
        process.env.DATABASE_URL = ':memory:';

        const module: TestingModule = await Test.createTestingModule({
            imports: [DatabaseModule],
            providers: [EventsService],
        }).compile();

        await module.init();

        service = module.get<EventsService>(EventsService);
        databaseService = module.get<DatabaseService>(DatabaseService);

        publicId = 'test-public-id';
        const now = new Date().toISOString();
        await databaseService.db
            .insertInto('music_links')
            .values({
                publicId,
                title: 'N95',
                artist: 'Kendrick Lamar',
                coverUrl: null,
                spotifyUrl: null,
                appleMusicUrl: null,
                deezerUrl: null,
                youtubeUrl: null,
                soundcloudUrl: null,
                metadata: null,
                createdAt: now,
                updatedAt: now,
            })
            .execute();
    });

    afterEach(async () => {
        await databaseService.onModuleDestroy();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a page view event', async () => {
        const event = await service.createForMusicLink(publicId, {
            eventType: 'page_view',
        });

        expect(event.eventType).toBe('page_view');
        expect(event.platform).toBeNull();
    });

    it('should create a platform click event', async () => {
        const event = await service.createForMusicLink(publicId, {
            eventType: 'platform_click',
            platform: 'spotify',
            metadata: {
                source: 'public-page',
            },
        });

        expect(event.eventType).toBe('platform_click');
        expect(event.platform).toBe('spotify');
        expect(event.metadata).toEqual({
            source: 'public-page',
        });
    });

    it('should reject a platform click without platform', async () => {
        await expect(
            service.createForMusicLink(publicId, {
                eventType: 'platform_click',
            }),
        ).rejects.toThrow('Platform is required');
    });
});
