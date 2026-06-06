import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { MusicLinksController } from './music-links.controller';
import { MusicLinksService } from './music-links.service';

describe('MusicLinksController', () => {
    let controller: MusicLinksController;
    const musicLinksService = {
        findAll: jest.fn(),
        create: jest.fn(),
        findByPublicId: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MusicLinksController],
            providers: [
                {
                    provide: MusicLinksService,
                    useValue: musicLinksService,
                },
            ],
        }).compile();

        controller = module.get<MusicLinksController>(MusicLinksController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should delegate creation to the service', async () => {
        const dto = {
            title: 'N95',
            artist: 'Kendrick Lamar',
            spotifyUrl: 'https://open.spotify.com/track/example',
        };
        const response = {
            publicId: 'abc123',
            title: dto.title,
            artist: dto.artist,
            coverUrl: null,
            spotifyUrl: dto.spotifyUrl,
            appleMusicUrl: null,
            deezerUrl: null,
            youtubeUrl: null,
            soundcloudUrl: null,
            metadata: null,
            createdAt: '2026-05-24T08:00:00.000Z',
            updatedAt: '2026-05-24T08:00:00.000Z',
            totalViews: 0,
            totalClicks: 0,
        };

        musicLinksService.create.mockResolvedValue(response);

        await expect(controller.create(dto)).resolves.toEqual(response);
        expect(musicLinksService.create).toHaveBeenCalledWith(dto);
    });
});
