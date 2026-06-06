import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SearchController, TracksController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
    let controller: SearchController;
    let tracksController: TracksController;
    const searchService = {
        searchSpotify: jest.fn(),
        getSimilarTracks: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SearchController, TracksController],
            providers: [
                {
                    provide: SearchService,
                    useValue: searchService,
                },
            ],
        }).compile();

        controller = module.get<SearchController>(SearchController);
        tracksController = module.get<TracksController>(TracksController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should delegate Spotify search to the service', async () => {
        const results = [
            {
                spotifyTrackId: 'mock-n95',
                title: 'N95',
                artist: 'Kendrick Lamar',
                coverUrl: null,
                spotifyUrl: 'https://open.spotify.com/track/mock-n95',
            },
        ];

        searchService.searchSpotify.mockResolvedValue(results);

        await expect(controller.searchSpotify('kendrick')).resolves.toEqual(
            results,
        );
        expect(searchService.searchSpotify).toHaveBeenCalledWith('kendrick');
    });

    it('should delegate similar track lookup to the service', async () => {
        const response = {
            spotifyTrackId: 'mock-n95',
            source: 'mock' as const,
            links: [],
        };

        searchService.getSimilarTracks.mockResolvedValue(response);

        await expect(
            tracksController.getSimilarTracks('mock-n95', 'N95', 'Kendrick'),
        ).resolves.toEqual(response);
        expect(searchService.getSimilarTracks).toHaveBeenCalledWith({
            spotifyTrackId: 'mock-n95',
            title: 'N95',
            artist: 'Kendrick',
        });
    });
});
