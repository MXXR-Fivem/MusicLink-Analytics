export interface MusicLinkResponse {
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
