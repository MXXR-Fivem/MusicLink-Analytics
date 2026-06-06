import { Module } from '@nestjs/common';
import { SearchController, TracksController } from './search.controller';
import { SearchService } from './search.service';

@Module({
    controllers: [SearchController, TracksController],
    providers: [SearchService],
})
export class SearchModule {}
