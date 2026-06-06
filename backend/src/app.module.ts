import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MusicLinksModule } from './music-links/music-links.module';
import { EventsModule } from './events/events.module';
import { ReportsModule } from './reports/reports.module';
import { SearchModule } from './search/search.module';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MusicLinksModule,
        EventsModule,
        ReportsModule,
        SearchModule,
        DatabaseModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
