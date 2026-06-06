import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MusicLinksController } from './music-links.controller';
import { MusicLinksService } from './music-links.service';

@Module({
    imports: [DatabaseModule],
    controllers: [MusicLinksController],
    providers: [MusicLinksService],
})
export class MusicLinksModule {}
