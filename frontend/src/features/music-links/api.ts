import { apiRequest } from '@/lib/http';
import type {
    CreateMusicLinkEventPayload,
    CreateMusicLinkPayload,
    MusicLink,
    MusicLinkReport,
    SimilarTracksResponse,
    SpotifyTrackSearchResult,
} from './types';

export async function listMusicLinks(): Promise<MusicLink[]> {
    return apiRequest<MusicLink[]>('/music-links');
}

export async function getMusicLink(publicId: string): Promise<MusicLink> {
    return apiRequest<MusicLink>(`/music-links/${publicId}`);
}

export async function searchSpotify(
    query: string,
): Promise<SpotifyTrackSearchResult[]> {
    const params = new URLSearchParams({ query });
    return apiRequest<SpotifyTrackSearchResult[]>(
        `/search/spotify?${params.toString()}`,
    );
}

export async function getSimilarTracks(
    spotifyTrackId: string,
    track?: {
        title: string;
        artist: string;
    },
): Promise<SimilarTracksResponse> {
    const params = new URLSearchParams();

    if (track) {
        params.set('title', track.title);
        params.set('artist', track.artist);
    }

    const query = params.toString();

    return apiRequest<SimilarTracksResponse>(
        `/tracks/${spotifyTrackId}/similar${query ? `?${query}` : ''}`,
    );
}

export async function createMusicLink(
    payload: CreateMusicLinkPayload,
): Promise<MusicLink> {
    return apiRequest<MusicLink>('/music-links', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

export async function trackMusicLinkEvent(
    publicId: string,
    payload: CreateMusicLinkEventPayload,
): Promise<void> {
    await apiRequest(`/music-links/${publicId}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

export async function getMusicLinkReport(
    publicId: string,
): Promise<MusicLinkReport> {
    return apiRequest<MusicLinkReport>(`/music-links/${publicId}/report`);
}
