import {
    IsIn,
    IsObject,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';
import type { MusicLinkEventType } from '../../database/database.types';

export class CreateMusicLinkEventDto {
    @IsIn(['page_view', 'platform_click'])
    eventType!: MusicLinkEventType;

    @IsOptional()
    @IsString()
    @MinLength(1)
    platform?: string | null;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown> | null;
}
