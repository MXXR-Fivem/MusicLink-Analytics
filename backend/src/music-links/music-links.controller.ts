import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateMusicLinkDto } from './dto/create-music-link.dto';
import type { MusicLinkResponse } from './music-link.types';
import { MusicLinksService } from './music-links.service';

@Controller('music-links')
export class MusicLinksController {
    constructor(private readonly musicLinksService: MusicLinksService) {}

    @Get()
    findAll(): Promise<MusicLinkResponse[]> {
        return this.musicLinksService.findAll();
    }

    @Post()
    create(@Body() dto: CreateMusicLinkDto): Promise<MusicLinkResponse> {
        return this.musicLinksService.create(dto);
    }

    @Get(':publicId')
    findOne(@Param('publicId') publicId: string): Promise<MusicLinkResponse> {
        return this.musicLinksService.findByPublicId(publicId);
    }
}
