export interface MusicLink {
    publicId: string;
    title: string;
    artist: string;
    coverUrl: string | null;
    spotifyUrl: string | null;
    appleMusicUrl: string | null;
    deezerUrl: string | null;
    youtubeUrl: string | null;
    soundcloudUrl: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
    totalViews: number;
    totalClicks: number;
}

export interface SpotifyTrackSearchResult {
    spotifyTrackId: string;
    title: string;
    artist: string;
    coverUrl: string | null;
    spotifyUrl: string;
}

export interface SimilarTrackLink {
    platform: 'appleMusic' | 'deezer' | 'youtube' | 'soundcloud';
    url: string;
}

export interface SimilarTracksResponse {
    spotifyTrackId: string;
    links: SimilarTrackLink[];
    source: 'soundcharts' | 'mock';
}

export type MusicLinkPlatform =
    | 'spotify'
    | 'appleMusic'
    | 'deezer'
    | 'youtube'
    | 'soundcloud';

export interface MusicLinkPlatformLink {
    platform: MusicLinkPlatform;
    label: string;
    url: string;
}

export interface CreateMusicLinkEventPayload {
    eventType: 'page_view' | 'platform_click';
    platform?: MusicLinkPlatform | null;
    metadata?: Record<string, unknown> | null;
}

export interface PlatformClicks {
    platform: string;
    clicks: number;
}

export interface DailyViews {
    date: string;
    views: number;
}

export interface DailyClicks {
    date: string;
    clicks: number;
}

export interface MusicLinkReport {
    publicId: string;
    title: string;
    artist: string;
    coverUrl: string | null;
    totalViews: number;
    totalClicks: number;
    clickThroughRate: number;
    clicksByPlatform: PlatformClicks[];
    viewsOverTime: DailyViews[];
    clicksOverTime: DailyClicks[];
}

export interface CreateMusicLinkPayload {
    title: string;
    artist: string;
    coverUrl?: string | null;
    spotifyUrl?: string | null;
    appleMusicUrl?: string | null;
    deezerUrl?: string | null;
    youtubeUrl?: string | null;
    soundcloudUrl?: string | null;
    metadata?: Record<string, unknown> | null;
}
