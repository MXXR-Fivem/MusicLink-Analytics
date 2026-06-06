import { Button, Group, Image, Paper, Stack, Text } from '@mantine/core';
import type { SpotifyTrackSearchResult } from '../types';
import styles from './music-links.module.css';

interface TrackResultCardProps {
    track: SpotifyTrackSearchResult;
    isSelected: boolean;
    onSelect: (track: SpotifyTrackSearchResult) => void;
}

export function TrackResultCard({
    track,
    isSelected,
    onSelect,
}: TrackResultCardProps) {
    return (
        <Paper
            withBorder
            p="md"
            radius="sm"
            className={`${styles.trackResult} ${
                isSelected ? styles.selectedTrack : ''
            }`}
        >
            <Group align="flex-start" wrap="nowrap">
                <Image
                    src={track.coverUrl ?? undefined}
                    alt=""
                    w={72}
                    h={72}
                    radius="sm"
                    fallbackSrc="/file.svg"
                />
                <Stack gap={6} className={styles.trackInfo}>
                    <Text fw={600}>{track.title}</Text>
                    <Text size="sm" c="dimmed">
                        {track.artist}
                    </Text>
                    <Button
                        size="xs"
                        variant={isSelected ? 'filled' : 'light'}
                        color="gray"
                        className={styles.selectTrackButton}
                        onClick={() => onSelect(track)}
                    >
                        {isSelected ? 'Sélectionné' : 'Sélectionner'}
                    </Button>
                </Stack>
            </Group>
        </Paper>
    );
}
