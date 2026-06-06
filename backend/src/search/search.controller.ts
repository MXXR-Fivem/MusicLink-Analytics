import { Controller, Get, Param, Query } from '@nestjs/common';
import type {
    SimilarTracksResponse,
    SpotifyTrackSearchResult,
} from './search.types';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @Get('spotify')
    searchSpotify(
        @Query('query') query = '',
    ): Promise<SpotifyTrackSearchResult[]> {
        return this.searchService.searchSpotify(query);
    }
}

@Controller('tracks')
export class TracksController {
    constructor(private readonly searchService: SearchService) {}

    @Get(':spotifyTrackId/similar')
    getSimilarTracks(
        @Param('spotifyTrackId') spotifyTrackId: string,
        @Query('title') title = '',
        @Query('artist') artist = '',
    ): Promise<SimilarTracksResponse> {
        return this.searchService.getSimilarTracks({
            spotifyTrackId,
            title,
            artist,
        });
    }
}
