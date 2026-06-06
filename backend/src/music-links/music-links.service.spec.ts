import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { MusicLinksService } from './music-links.service';

describe('MusicLinksService', () => {
    let service: MusicLinksService;
    let databaseService: DatabaseService;

    beforeEach(async () => {
        process.env.DATABASE_URL = ':memory:';

        const module: TestingModule = await Test.createTestingModule({
            imports: [DatabaseModule],
            providers: [MusicLinksService],
        }).compile();

        await module.init();

        service = module.get<MusicLinksService>(MusicLinksService);
        databaseService = module.get<DatabaseService>(DatabaseService);
    });

    afterEach(async () => {
        await databaseService.onModuleDestroy();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create and retrieve a music link by public id', async () => {
        const created = await service.create({
            title: 'N95',
            artist: 'Kendrick Lamar',
            spotifyUrl: 'https://open.spotify.com/track/example',
            metadata: {
                spotifyTrackId: 'example',
            },
        });

        expect(created.publicId).toEqual(expect.any(String));
        expect(created.title).toBe('N95');
        expect(created.artist).toBe('Kendrick Lamar');
        expect(created.totalViews).toBe(0);
        expect(created.totalClicks).toBe(0);

        await expect(service.findByPublicId(created.publicId)).resolves.toEqual(
            created,
        );
    });

    it('should list created music links', async () => {
        await service.create({
            title: 'N95',
            artist: 'Kendrick Lamar',
        });

        await service.create({
            title: 'Formation',
            artist: 'Beyonce',
        });

        const musicLinks = await service.findAll();

        expect(musicLinks).toHaveLength(2);
        expect(musicLinks.map((musicLink) => musicLink.title)).toEqual([
            'Formation',
            'N95',
        ]);
    });
});
