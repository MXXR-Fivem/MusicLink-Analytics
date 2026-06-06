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
