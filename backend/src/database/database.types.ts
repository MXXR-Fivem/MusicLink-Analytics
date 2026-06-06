import { Generated } from 'kysely';

export type MusicLinkEventType = 'page_view' | 'platform_click';

export interface MusicLinksTable {
    id: Generated<number>;
    publicId: string;
    title: string;
    artist: string;
    coverUrl: string | null;
    spotifyUrl: string | null;
    appleMusicUrl: string | null;
    deezerUrl: string | null;
    youtubeUrl: string | null;
    soundcloudUrl: string | null;
    metadata: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface MusicLinkEventsTable {
    id: Generated<number>;
    musicLinkId: number;
    eventType: MusicLinkEventType;
    platform: string | null;
    metadata: string | null;
    createdAt: string;
}

export interface Database {
    music_links: MusicLinksTable;
    music_link_events: MusicLinkEventsTable;
}
