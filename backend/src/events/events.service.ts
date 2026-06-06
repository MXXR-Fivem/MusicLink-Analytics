import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Selectable } from 'kysely';
import { DatabaseService } from '../database/database.service';
import type { MusicLinkEventsTable } from '../database/database.types';
import type { CreateMusicLinkEventDto } from './dto/create-music-link-event.dto';
import type { MusicLinkEventResponse } from './event.types';

@Injectable()
export class EventsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async createForMusicLink(
        publicId: string,
        dto: CreateMusicLinkEventDto,
    ): Promise<MusicLinkEventResponse> {
        if (dto.eventType === 'platform_click' && !dto.platform?.trim()) {
            throw new BadRequestException(
                'Platform is required for platform_click events',
            );
        }

        if (dto.eventType === 'page_view' && dto.platform) {
            throw new BadRequestException(
                'Platform must be empty for page_view events',
            );
        }

        const musicLink = await this.databaseService.db
            .selectFrom('music_links')
            .select(['id'])
            .where('publicId', '=', publicId)
            .executeTakeFirst();

        if (!musicLink) {
            throw new NotFoundException('MusicLink not found');
        }

        const createdAt = new Date().toISOString();
        const inserted = await this.databaseService.db
            .insertInto('music_link_events')
            .values({
                musicLinkId: musicLink.id,
                eventType: dto.eventType,
                platform: dto.platform?.trim() ?? null,
                metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
                createdAt,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        return this.toResponse(inserted);
    }

    private toResponse(
        row: Selectable<MusicLinkEventsTable>,
    ): MusicLinkEventResponse {
        return {
            eventType: row.eventType,
            platform: row.platform,
            metadata: row.metadata
                ? (JSON.parse(row.metadata) as Record<string, unknown>)
                : null,
            createdAt: row.createdAt,
        };
    }
}
