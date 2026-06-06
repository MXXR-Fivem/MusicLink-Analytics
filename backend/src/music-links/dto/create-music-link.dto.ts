import {
    IsObject,
    IsOptional,
    IsString,
    IsUrl,
    MinLength,
} from 'class-validator';

export class CreateMusicLinkDto {
    @IsString()
    @MinLength(1)
    title!: string;

    @IsString()
    @MinLength(1)
    artist!: string;

    @IsOptional()
    @IsUrl()
    coverUrl?: string | null;

    @IsOptional()
    @IsUrl()
    spotifyUrl?: string | null;

    @IsOptional()
    @IsUrl()
    appleMusicUrl?: string | null;

    @IsOptional()
    @IsUrl()
    deezerUrl?: string | null;

    @IsOptional()
    @IsUrl()
    youtubeUrl?: string | null;

    @IsOptional()
    @IsUrl()
    soundcloudUrl?: string | null;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown> | null;
}
