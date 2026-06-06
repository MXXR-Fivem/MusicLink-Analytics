import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { SearchService } from './search.service';

describe('SearchService', () => {
    let service: SearchService;

    afterEach(() => {
        jest.restoreAllMocks();
        delete process.env.SPOTIFY_CLIENT_ID;
        delete process.env.SPOTIFY_CLIENT_SECRET;
        delete process.env.SPOTIFY_ACCESS_TOKEN;
        delete process.env.SOUNDCHARTS_API_KEY;
        delete process.env.SOUNDCHARTS_API_TOKEN;
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SearchService],
        }).compile();

        service = module.get<SearchService>(SearchService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return matching mocked Spotify tracks when no token is configured', async () => {
        process.env.SPOTIFY_ACCESS_TOKEN = '';

        const results = await service.searchSpotify('kendrick');

        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({
            spotifyTrackId: 'mock-n95',
            title: 'N95',
            artist: 'Kendrick Lamar',
        });
    });

    it('should reject empty Spotify search queries', async () => {
        await expect(service.searchSpotify('   ')).rejects.toThrow(
            'Query is required',
        );
    });

    it('should request and reuse a Spotify client credentials token', async () => {
        process.env.SPOTIFY_CLIENT_ID = 'client-id';
        process.env.SPOTIFY_CLIENT_SECRET = 'client-secret';
        const fetchMock = jest
            .spyOn(global, 'fetch')
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        access_token: 'generated-token',
                        expires_in: 3600,
                    }),
                    { status: 200 },
                ),
            )
            .mockImplementation(async () =>
                Promise.resolve(
                    new Response(
                        JSON.stringify({
                            tracks: {
                                items: [
                                    {
                                        id: 'spotify-track',
                                        name: 'Track',
                                        artists: [{ name: 'Artist' }],
                                        album: { images: [] },
                                        external_urls: {
                                            spotify:
                                                'https://open.spotify.com/track/spotify-track',
                                        },
                                    },
                                ],
                            },
                        }),
                        { status: 200 },
                    ),
                ),
            );

        await service.searchSpotify('track');
        await service.searchSpotify('track');

        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(fetchMock.mock.calls[0][0]).toBe(
            'https://accounts.spotify.com/api/token',
        );
        expect(fetchMock.mock.calls[1][1]).toMatchObject({
            headers: { Authorization: 'Bearer generated-token' },
        });
    });

    it('should refresh the Spotify token after an unauthorized response', async () => {
        process.env.SPOTIFY_CLIENT_ID = 'client-id';
        process.env.SPOTIFY_CLIENT_SECRET = 'client-secret';
        const responses = [
            new Response(
                JSON.stringify({
                    access_token: 'first-token',
                    expires_in: 3600,
                }),
                { status: 200 },
            ),
            new Response(null, { status: 401 }),
            new Response(
                JSON.stringify({
                    access_token: 'second-token',
                    expires_in: 3600,
                }),
                { status: 200 },
            ),
            new Response(JSON.stringify({ tracks: { items: [] } }), {
                status: 200,
            }),
        ];
        const fetchMock = jest
            .spyOn(global, 'fetch')
            .mockImplementation(() =>
                Promise.resolve(responses.shift() as Response),
            );

        await service.searchSpotify('track');

        expect(fetchMock).toHaveBeenCalledTimes(4);
        expect(fetchMock.mock.calls[3][1]).toMatchObject({
            headers: { Authorization: 'Bearer second-token' },
        });
    });

    it('should return mocked similar platform links', async () => {
        process.env.SOUNDCHARTS_API_TOKEN = '';

        const response = await service.getSimilarTracks({
            spotifyTrackId: 'mock-n95',
            title: 'N95',
            artist: 'Kendrick Lamar',
        });

        expect(response.source).toBe('mock');
        expect(response.spotifyTrackId).toBe('mock-n95');
        expect(response.links).toEqual([]);
    });

    it('should map Soundcharts identifiers using platformCode', () => {
        const serviceWithPrivateAccess = service as unknown as {
            mapSoundchartsIdentifiersToLinks: (
                identifiers: Array<{
                    platformCode: string;
                    identifier: string;
                    url: string;
                }>,
            ) => Array<{
                platform: string;
                url: string;
            }>;
        };

        const links = serviceWithPrivateAccess.mapSoundchartsIdentifiersToLinks(
            [
                {
                    platformCode: 'apple-music',
                    identifier: '1879524262',
                    url: 'https://music.apple.com/us/album/tu-dors/1879523679?i=1879524262',
                },
                {
                    platformCode: 'deezer',
                    identifier: '3862146611',
                    url: 'https://deezer.com/track/3862146611',
                },
                {
                    platformCode: 'spotify',
                    identifier: '6JnsxE0leMVkUvTV0n969D',
                    url: 'https://open.spotify.com/track/6JnsxE0leMVkUvTV0n969D',
                },
            ],
        );

        expect(links).toEqual([
            {
                platform: 'appleMusic',
                url: 'https://music.apple.com/us/album/tu-dors/1879523679?i=1879524262',
            },
            {
                platform: 'deezer',
                url: 'https://deezer.com/track/3862146611',
            },
        ]);
    });
});
