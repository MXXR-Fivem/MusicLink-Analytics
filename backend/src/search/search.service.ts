import { BadRequestException, Injectable } from '@nestjs/common';
import type {
    SimilarTracksResponse,
    SpotifyTrackSearchResult,
} from './search.types';

@Injectable()
export class SearchService {
    private spotifyToken: {
        accessToken: string;
        expiresAt: number;
    } | null = null;
    private spotifyTokenRequest: Promise<string | null> | null = null;

    async searchSpotify(query: string): Promise<SpotifyTrackSearchResult[]> {
        const normalizedQuery = query.trim();

        if (!normalizedQuery) {
            throw new BadRequestException('Query is required');
        }

        const token = await this.getSpotifyAccessToken();

        if (token) {
            return this.searchSpotifyApi(normalizedQuery, token);
        }

        return this.searchSpotifyMock(normalizedQuery);
    }

    async getSimilarTracks({
        spotifyTrackId,
    }: {
        spotifyTrackId: string;
        title?: string;
        artist?: string;
    }): Promise<SimilarTracksResponse> {
        if (!spotifyTrackId.trim()) {
            throw new BadRequestException('Spotify track id is required');
        }

        const token =
            process.env.SOUNDCHARTS_API_KEY ??
            process.env.SOUNDCHARTS_API_TOKEN;

        if (token) {
            const soundchartsLinks = await this.getSoundchartsPlatformLinks(
                spotifyTrackId,
                token,
            );

            if (soundchartsLinks.length > 0) {
                return {
                    spotifyTrackId,
                    source: 'soundcharts',
                    links: soundchartsLinks,
                };
            }
        }

        return this.getSimilarTracksMock(spotifyTrackId);
    }

    private getSimilarTracksMock(
        spotifyTrackId: string,
    ): SimilarTracksResponse {
        return {
            spotifyTrackId,
            source: 'mock',
            links: [],
        };
    }

    private async getSoundchartsPlatformLinks(
        spotifyTrackId: string,
        token: string,
    ): Promise<SimilarTracksResponse['links']> {
        try {
            const song = await this.fetchSoundchartsSongBySpotifyId(
                spotifyTrackId,
                token,
            );

            if (!song.uuid) {
                return [];
            }

            const identifiers = await this.fetchSoundchartsIdentifiers(
                song.uuid,
                token,
            );

            return this.mapSoundchartsIdentifiersToLinks(identifiers);
        } catch {
            return [];
        }
    }

    private async fetchSoundchartsSongBySpotifyId(
        spotifyTrackId: string,
        token: string,
    ): Promise<{ uuid?: string }> {
        const response = await fetch(
            `https://customer.api.soundcharts.com/api/v2.25/song/by-platform/spotify/${encodeURIComponent(
                spotifyTrackId,
            )}`,
            {
                headers: this.getSoundchartsHeaders(token),
            },
        );

        if (!response.ok) {
            return {};
        }

        const data = (await response.json()) as SoundchartsSongResponse;
        return {
            uuid: data.object?.uuid ?? data.uuid,
        };
    }

    private async fetchSoundchartsIdentifiers(
        songUuid: string,
        token: string,
    ): Promise<SoundchartsIdentifier[]> {
        const params = new URLSearchParams({
            onlyDefault: 'true',
            limit: '100',
        });
        const response = await fetch(
            `https://customer.api.soundcharts.com/api/v2/song/${encodeURIComponent(
                songUuid,
            )}/identifiers?${params.toString()}`,
            {
                headers: this.getSoundchartsHeaders(token),
            },
        );

        if (!response.ok) {
            return [];
        }

        const data = (await response.json()) as SoundchartsIdentifiersResponse;
        return data.items ?? data.object?.items ?? [];
    }

    private getSoundchartsHeaders(token: string): Record<string, string> {
        return {
            'x-app-id': process.env.SOUNDCHARTS_APP_ID ?? 'soundcharts',
            'x-api-key': token,
        };
    }

    private mapSoundchartsIdentifiersToLinks(
        identifiers: SoundchartsIdentifier[],
    ): SimilarTracksResponse['links'] {
        return identifiers.flatMap((identifier) => {
            const platform = this.mapSoundchartsPlatform(
                identifier.platformCode ??
                    identifier.platform ??
                    identifier.platformName,
            );
            const url =
                identifier.url ??
                this.buildPlatformUrl(platform, identifier.identifier);

            if (!platform || !url) {
                return [];
            }

            return [
                {
                    platform,
                    url,
                },
            ];
        });
    }

    private mapSoundchartsPlatform(
        platform?: string,
    ): SimilarTracksResponse['links'][number]['platform'] | null {
        switch (platform) {
            case 'apple-music':
            case 'apple_music':
            case 'appleMusic':
                return 'appleMusic';
            case 'deezer':
                return 'deezer';
            case 'youtube':
            case 'youtube-music':
            case 'youtube_music':
                return 'youtube';
            case 'soundcloud':
                return 'soundcloud';
            default:
                return null;
        }
    }

    private buildPlatformUrl(
        platform: SimilarTracksResponse['links'][number]['platform'] | null,
        identifier?: string,
    ): string | null {
        if (!platform || !identifier) {
            return null;
        }

        const encodedIdentifier = encodeURIComponent(identifier);

        switch (platform) {
            case 'appleMusic':
                return `https://music.apple.com/search?term=${encodedIdentifier}`;
            case 'deezer':
                return `https://www.deezer.com/track/${encodedIdentifier}`;
            case 'youtube':
                return `https://www.youtube.com/watch?v=${encodedIdentifier}`;
            case 'soundcloud':
                return `https://soundcloud.com/search?q=${encodedIdentifier}`;
        }
    }

    private async searchSpotifyApi(
        query: string,
        token: string,
        retryOnUnauthorized = true,
    ): Promise<SpotifyTrackSearchResult[]> {
        const params = new URLSearchParams({
            q: query,
            type: 'track',
            limit: '10',
        });

        const response = await fetch(
            `https://api.spotify.com/v1/search?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (response.status === 401 && retryOnUnauthorized) {
            this.spotifyToken = null;
            const refreshedToken = await this.getSpotifyAccessToken(true);

            if (refreshedToken) {
                return this.searchSpotifyApi(query, refreshedToken, false);
            }
        }

        if (!response.ok) {
            return this.searchSpotifyMock(query);
        }

        const data = (await response.json()) as SpotifySearchApiResponse;
        return (
            data.tracks?.items.map((track) => ({
                spotifyTrackId: track.id,
                title: track.name,
                artist: track.artists.map((artist) => artist.name).join(', '),
                coverUrl: track.album.images[0]?.url ?? null,
                spotifyUrl: track.external_urls.spotify,
            })) ?? []
        );
    }

    private async getSpotifyAccessToken(
        forceRefresh = false,
    ): Promise<string | null> {
        const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();

        if (!clientId || !clientSecret) {
            return process.env.SPOTIFY_ACCESS_TOKEN?.trim() || null;
        }

        if (
            !forceRefresh &&
            this.spotifyToken &&
            this.spotifyToken.expiresAt > Date.now()
        ) {
            return this.spotifyToken.accessToken;
        }

        if (this.spotifyTokenRequest) {
            return this.spotifyTokenRequest;
        }

        this.spotifyTokenRequest = this.requestSpotifyAccessToken(
            clientId,
            clientSecret,
        ).finally(() => {
            this.spotifyTokenRequest = null;
        });

        return this.spotifyTokenRequest;
    }

    private async requestSpotifyAccessToken(
        clientId: string,
        clientSecret: string,
    ): Promise<string | null> {
        try {
            const credentials = Buffer.from(
                `${clientId}:${clientSecret}`,
            ).toString('base64');
            const response = await fetch(
                'https://accounts.spotify.com/api/token',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'client_credentials',
                    }),
                },
            );

            if (!response.ok) {
                return null;
            }

            const data = (await response.json()) as SpotifyTokenResponse;

            if (!data.access_token || !data.expires_in) {
                return null;
            }

            const refreshMargin = Math.min(60_000, data.expires_in * 100);
            this.spotifyToken = {
                accessToken: data.access_token,
                expiresAt: Date.now() + data.expires_in * 1000 - refreshMargin,
            };

            return data.access_token;
        } catch {
            return null;
        }
    }

    private searchSpotifyMock(query: string): SpotifyTrackSearchResult[] {
        const normalizedQuery = query.toLowerCase();

        return mockSpotifyTracks.filter((track) => {
            const searchable = `${track.title} ${track.artist}`.toLowerCase();
            return searchable.includes(normalizedQuery);
        });
    }
}

interface SpotifySearchApiResponse {
    tracks?: {
        items: Array<{
            id: string;
            name: string;
            artists: Array<{
                name: string;
            }>;
            album: {
                images: Array<{
                    url: string;
                }>;
            };
            external_urls: {
                spotify: string;
            };
        }>;
    };
}

interface SpotifyTokenResponse {
    access_token?: string;
    expires_in?: number;
}

interface SoundchartsSongResponse {
    uuid?: string;
    object?: {
        uuid?: string;
    };
}

interface SoundchartsIdentifier {
    platformCode?: string;
    platformName?: string;
    platform?: string;
    identifier?: string;
    url?: string;
}

interface SoundchartsIdentifiersResponse {
    items?: SoundchartsIdentifier[];
    object?: {
        items?: SoundchartsIdentifier[];
    };
}

const mockSpotifyTracks: SpotifyTrackSearchResult[] = [
    {
        spotifyTrackId: 'mock-n95',
        title: 'N95',
        artist: 'Kendrick Lamar',
        coverUrl:
            'https://i.scdn.co/image/ab67616d0000b2732e02117d76426a08ac7c174f',
        spotifyUrl: 'https://open.spotify.com/track/mock-n95',
    },
    {
        spotifyTrackId: 'mock-formation',
        title: 'Formation',
        artist: 'Beyonce',
        coverUrl:
            'https://i.scdn.co/image/ab67616d0000b2730d1a4c5f9b3d34a5a0f5f0f1',
        spotifyUrl: 'https://open.spotify.com/track/mock-formation',
    },
    {
        spotifyTrackId: 'mock-blinding-lights',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        coverUrl:
            'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
        spotifyUrl: 'https://open.spotify.com/track/mock-blinding-lights',
    },
];
