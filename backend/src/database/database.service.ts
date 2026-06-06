import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import DatabaseDriver from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { Kysely, SqliteDialect } from 'kysely';
import { Database } from './database.types';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly connection: Kysely<Database>;

    constructor() {
        const databaseUrl =
            process.env.DATABASE_URL ?? './data/musiclink.sqlite';
        const databasePath = this.resolveDatabasePath(databaseUrl);

        if (databasePath !== ':memory:') {
            mkdirSync(dirname(databasePath), { recursive: true });
        }

        this.connection = new Kysely<Database>({
            dialect: new SqliteDialect({
                database: new DatabaseDriver(databasePath),
            }),
        });
    }

    get db(): Kysely<Database> {
        return this.connection;
    }

    async onModuleInit() {
        await this.createSchema();
    }

    async onModuleDestroy() {
        await this.connection.destroy();
    }

    private resolveDatabasePath(databaseUrl: string): string {
        if (databaseUrl === ':memory:') {
            return databaseUrl;
        }

        const normalized = databaseUrl.replace(/^sqlite:\/\//, '');
        return isAbsolute(normalized)
            ? normalized
            : resolve(process.cwd(), normalized);
    }

    private async createSchema() {
        await this.connection.schema
            .createTable('music_links')
            .ifNotExists()
            .addColumn('id', 'integer', (column) =>
                column.primaryKey().autoIncrement(),
            )
            .addColumn('publicId', 'text', (column) =>
                column.notNull().unique(),
            )
            .addColumn('title', 'text', (column) => column.notNull())
            .addColumn('artist', 'text', (column) => column.notNull())
            .addColumn('coverUrl', 'text')
            .addColumn('spotifyUrl', 'text')
            .addColumn('appleMusicUrl', 'text')
            .addColumn('deezerUrl', 'text')
            .addColumn('youtubeUrl', 'text')
            .addColumn('soundcloudUrl', 'text')
            .addColumn('metadata', 'text')
            .addColumn('createdAt', 'text', (column) => column.notNull())
            .addColumn('updatedAt', 'text', (column) => column.notNull())
            .execute();

        await this.connection.schema
            .createIndex('music_links_publicId_index')
            .ifNotExists()
            .on('music_links')
            .column('publicId')
            .execute();

        await this.connection.schema
            .createTable('music_link_events')
            .ifNotExists()
            .addColumn('id', 'integer', (column) =>
                column.primaryKey().autoIncrement(),
            )
            .addColumn('musicLinkId', 'integer', (column) =>
                column
                    .notNull()
                    .references('music_links.id')
                    .onDelete('cascade'),
            )
            .addColumn('eventType', 'text', (column) => column.notNull())
            .addColumn('platform', 'text')
            .addColumn('metadata', 'text')
            .addColumn('createdAt', 'text', (column) => column.notNull())
            .execute();

        await this.connection.schema
            .createIndex('music_link_events_musicLinkId_index')
            .ifNotExists()
            .on('music_link_events')
            .column('musicLinkId')
            .execute();

        await this.connection.schema
            .createIndex('music_link_events_eventType_index')
            .ifNotExists()
            .on('music_link_events')
            .column('eventType')
            .execute();
    }
}
