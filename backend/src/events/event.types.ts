import type { MusicLinkEventType } from '../database/database.types';

export interface MusicLinkEventResponse {
    eventType: MusicLinkEventType;
    platform: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}
