import { Body, Controller, Param, Post } from '@nestjs/common';
import { CreateMusicLinkEventDto } from './dto/create-music-link-event.dto';
import type { MusicLinkEventResponse } from './event.types';
import { EventsService } from './events.service';

@Controller('music-links/:publicId/events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Post()
    create(
        @Param('publicId') publicId: string,
        @Body() dto: CreateMusicLinkEventDto,
    ): Promise<MusicLinkEventResponse> {
        return this.eventsService.createForMusicLink(publicId, dto);
    }
}
