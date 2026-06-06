import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { Selectable, sql } from 'kysely';
import { DatabaseService } from '../database/database.service';
import type { MusicLinksTable } from '../database/database.types';
import type { CreateMusicLinkDto } from './dto/create-music-link.dto';
import type { MusicLinkResponse } from './music-link.types';

@Injectable()
export class MusicLinksService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findAll(): Promise<MusicLinkResponse[]> {
        const rows = await this.databaseService.db
            .selectFrom('music_links')
            .leftJoin(
                'music_link_events',
                'music_link_events.musicLinkId',
                'music_links.id',
            )
            .selectAll('music_links')
            .select((expressionBuilder) => [
                expressionBuilder.fn
                    .count<number>('music_link_events.id')
                    .filterWhere(
                        'music_link_events.eventType',
                        '=',
                        'page_view',
                    )
                    .as('totalViews'),
                expressionBuilder.fn
                    .count<number>('music_link_events.id')
                    .filterWhere(
                        'music_link_events.eventType',
                        '=',
                        'platform_click',
                    )
                    .as('totalClicks'),
            ])
            .groupBy('music_links.id')
            .orderBy('music_links.createdAt', 'desc')
            .orderBy('music_links.id', 'desc')
            .execute();

        return rows.map((row) =>
            this.toResponse(row, {
                totalViews: Number(row.totalViews),
                totalClicks: Number(row.totalClicks),
            }),
        );
    }

    async create(dto: CreateMusicLinkDto): Promise<MusicLinkResponse> {
        this.validateCreateDto(dto);

        const now = new Date().toISOString();
        const publicId = await this.generateUniquePublicId();

        await this.databaseService.db
            .insertInto('music_links')
            .values({
                publicId,
                title: dto.title.trim(),
                artist: dto.artist.trim(),
                coverUrl: dto.coverUrl ?? null,
                spotifyUrl: dto.spotifyUrl ?? null,
                appleMusicUrl: dto.appleMusicUrl ?? null,
                deezerUrl: dto.deezerUrl ?? null,
                youtubeUrl: dto.youtubeUrl ?? null,
                soundcloudUrl: dto.soundcloudUrl ?? null,
                metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
                createdAt: now,
                updatedAt: now,
            })
            .execute();

        return this.findByPublicId(publicId);
    }

    async findByPublicId(publicId: string): Promise<MusicLinkResponse> {
        const row = await this.databaseService.db
            .selectFrom('music_links')
            .selectAll()
            .where('publicId', '=', publicId)
            .executeTakeFirst();

        if (!row) {
            throw new NotFoundException('MusicLink not found');
        }

        return this.toResponse(row, {
            totalViews: await this.countEvents(row.id, 'page_view'),
            totalClicks: await this.countEvents(row.id, 'platform_click'),
        });
    }

    private validateCreateDto(dto: CreateMusicLinkDto): void {
        if (!dto.title?.trim()) {
            throw new BadRequestException('Title is required');
        }

        if (!dto.artist?.trim()) {
            throw new BadRequestException('Artist is required');
        }
    }

    private async generateUniquePublicId(): Promise<string> {
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const publicId = randomBytes(6).toString('base64url');
            const existing = await this.databaseService.db
                .selectFrom('music_links')
                .select('id')
                .where('publicId', '=', publicId)
                .executeTakeFirst();

            if (!existing) {
                return publicId;
            }
        }

        throw new Error('Unable to generate a unique public id');
    }

    private async countEvents(
        musicLinkId: number,
        eventType: 'page_view' | 'platform_click',
    ): Promise<number> {
        const result = await this.databaseService.db
            .selectFrom('music_link_events')
            .select(sql<number>`count(*)`.as('total'))
            .where('musicLinkId', '=', musicLinkId)
            .where('eventType', '=', eventType)
            .executeTakeFirst();

        return Number(result?.total ?? 0);
    }

    private toResponse(
        row: Selectable<MusicLinksTable>,
        counters: Pick<MusicLinkResponse, 'totalViews' | 'totalClicks'>,
    ): MusicLinkResponse {
        return {
            publicId: row.publicId,
            title: row.title,
            artist: row.artist,
            coverUrl: row.coverUrl,
            spotifyUrl: row.spotifyUrl,
            appleMusicUrl: row.appleMusicUrl,
            deezerUrl: row.deezerUrl,
            youtubeUrl: row.youtubeUrl,
            soundcloudUrl: row.soundcloudUrl,
            metadata: row.metadata
                ? (JSON.parse(row.metadata) as Record<string, unknown>)
                : null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            totalViews: counters.totalViews,
            totalClicks: counters.totalClicks,
        };
    }
}
