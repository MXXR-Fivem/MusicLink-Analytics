import {
    Badge,
    Button,
    Group,
    Image,
    Paper,
    SimpleGrid,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { IconCheck, IconLink, IconPlus, IconSearch } from '@tabler/icons-react';
import type { SimilarTrackLink, SpotifyTrackSearchResult } from '../types';
import { formatPlatform } from '../utils';
import { TrackResultCard } from './track-result-card';
import styles from './music-links.module.css';

interface CreateMusicLinkSectionProps {
    query: string;
    searchResults: SpotifyTrackSearchResult[];
    selectedTrack: SpotifyTrackSearchResult | null;
    similarLinks: SimilarTrackLink[];
    similarSource: 'soundcharts' | 'mock';
    isSearching: boolean;
    isCreating: boolean;
    onQueryChange: (query: string) => void;
    onSearch: () => void;
    onSelectTrack: (track: SpotifyTrackSearchResult) => void;
    onCreate: () => void;
}

export function CreateMusicLinkSection({
    query,
    searchResults,
    selectedTrack,
    similarLinks,
    similarSource,
    isSearching,
    isCreating,
    onQueryChange,
    onSearch,
    onSelectTrack,
    onCreate,
}: CreateMusicLinkSectionProps) {
    return (
        <section className={styles.create}>
            <Title order={2}>Trouve le morceau</Title>
            <Text c="dimmed" mt={4}>
                Recherche une track Spotify, puis vérifie les plateformes
                disponibles avant de publier.
            </Text>
            <Group align="flex-end" mt="md">
                <TextInput
                    className={styles.searchInput}
                    label="Recherche Spotify"
                    placeholder="Titre, artiste..."
                    value={query}
                    onChange={(event) =>
                        onQueryChange(event.currentTarget.value)
                    }
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            onSearch();
                        }
                    }}
                />
                <Button
                    leftSection={<IconSearch size={18} />}
                    loading={isSearching}
                    disabled={!query.trim()}
                    onClick={onSearch}
                >
                    Rechercher
                </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="lg">
                {searchResults.map((track) => (
                    <TrackResultCard
                        key={track.spotifyTrackId}
                        track={track}
                        isSelected={
                            selectedTrack?.spotifyTrackId ===
                            track.spotifyTrackId
                        }
                        onSelect={onSelectTrack}
                    />
                ))}
            </SimpleGrid>

            {selectedTrack ? (
                <Paper
                    p="lg"
                    radius="lg"
                    mt="lg"
                    className={styles.selectedTrackSummary}
                >
                    <Group justify="space-between" align="flex-start" gap="md">
                        <Group wrap="nowrap" gap="md">
                            <Image
                                src={selectedTrack.coverUrl ?? undefined}
                                alt={`Pochette de ${selectedTrack.title}`}
                                w={64}
                                h={64}
                                radius="md"
                                fallbackSrc="/file.svg"
                            />
                            <div>
                                <Text fw={700} className={styles.summaryTitle}>
                                    {selectedTrack.title}
                                </Text>
                                <Text
                                    size="sm"
                                    className={styles.summaryArtist}
                                >
                                    {selectedTrack.artist}
                                </Text>
                            </div>
                        </Group>
                        <Badge
                            variant="light"
                            color={
                                similarSource === 'soundcharts'
                                    ? 'violet'
                                    : 'gray'
                            }
                            leftSection={
                                similarSource === 'soundcharts' ? (
                                    <IconCheck size={12} />
                                ) : (
                                    <IconLink size={12} />
                                )
                            }
                            className={styles.sourceBadge}
                        >
                            {similarSource === 'soundcharts'
                                ? 'Liens Soundcharts'
                                : 'Aucun lien Soundcharts'}
                        </Badge>
                    </Group>
                    <Group gap="xs" mt="lg">
                        <Badge
                            variant="light"
                            color="violet"
                            className={styles.platformBadge}
                        >
                            Spotify
                        </Badge>
                        {similarLinks.map((link) => (
                            <Badge
                                key={link.platform}
                                variant="light"
                                color="violet"
                                className={styles.platformBadge}
                            >
                                {formatPlatform(link.platform)}
                            </Badge>
                        ))}
                    </Group>
                    {similarLinks.length === 0 ? (
                        <Text size="sm" c="dimmed" mt="sm">
                            Seul le lien Spotify sera ajouté pour ce MusicLink.
                        </Text>
                    ) : null}
                    <Button
                        mt="lg"
                        loading={isCreating}
                        leftSection={<IconPlus size={18} />}
                        onClick={onCreate}
                        radius="xl"
                        className={styles.generateButton}
                    >
                        Générer le MusicLink
                    </Button>
                </Paper>
            ) : null}
        </section>
    );
}
