import {
    Button,
    Group,
    Image,
    Loader,
    Paper,
    SimpleGrid,
    Text,
    Title,
} from '@mantine/core';
import {
    IconArrowUpRight,
    IconChartBar,
    IconEye,
    IconMouse,
} from '@tabler/icons-react';
import Link from 'next/link';
import type { MusicLink } from '../types';
import { formatDate } from '../utils';
import styles from './music-links.module.css';

interface MusicLinksTableProps {
    musicLinks: MusicLink[];
    isLoading: boolean;
    activeMusicLinkId: string | null;
    onPreview: (publicId: string) => void;
}

export function MusicLinksTable({
    musicLinks,
    isLoading,
    activeMusicLinkId,
    onPreview,
}: MusicLinksTableProps) {
    return (
        <section className={styles.library}>
            <Group justify="space-between" mb="md">
                <div>
                    <Text className={styles.sectionKicker}>Ta collection</Text>
                    <Title order={2} className={styles.sectionTitle}>
                        MusicLinks récents
                    </Title>
                </div>
                {isLoading ? <Loader size="sm" /> : null}
            </Group>

            {musicLinks.length === 0 && !isLoading ? (
                <Paper p="xl" radius="lg" className={styles.emptyState}>
                    <Title order={3}>La scène est encore vide.</Title>
                    <Text mt="xs">
                        Crée ton premier MusicLink depuis le bouton en haut de
                        la page.
                    </Text>
                </Paper>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                    {musicLinks.map((musicLink) => (
                        <article
                            key={musicLink.publicId}
                            className={`${styles.musicCard} ${
                                activeMusicLinkId === musicLink.publicId
                                    ? styles.musicCardActive
                                    : ''
                            }`}
                            onMouseEnter={() => onPreview(musicLink.publicId)}
                            onFocus={() => onPreview(musicLink.publicId)}
                        >
                            <div className={styles.cardCoverWrap}>
                                <Image
                                    src={musicLink.coverUrl ?? undefined}
                                    alt={`Pochette de ${musicLink.title}`}
                                    className={styles.cardCover}
                                    fallbackSrc="/file.svg"
                                />
                                <div className={styles.cardCoverOverlay} />
                                <Text className={styles.cardDate}>
                                    {formatDate(musicLink.createdAt)}
                                </Text>
                            </div>

                            <div className={styles.cardBody}>
                                <div>
                                    <Title
                                        order={3}
                                        className={styles.cardTitle}
                                    >
                                        {musicLink.title}
                                    </Title>
                                    <Text className={styles.cardArtist}>
                                        {musicLink.artist}
                                    </Text>
                                </div>

                                <Group gap="lg" className={styles.cardMetrics}>
                                    <Group gap={6}>
                                        <IconEye size={16} />
                                        <Text size="sm">
                                            {musicLink.totalViews} vues
                                        </Text>
                                    </Group>
                                    <Group gap={6}>
                                        <IconMouse size={16} />
                                        <Text size="sm">
                                            {musicLink.totalClicks} clics
                                        </Text>
                                    </Group>
                                </Group>

                                <Group gap="xs" mt="auto">
                                    <Button
                                        component={Link}
                                        href={`/music-link/${musicLink.publicId}`}
                                        variant="filled"
                                        color="dark"
                                        radius="xl"
                                        size="sm"
                                        rightSection={
                                            <IconArrowUpRight size={15} />
                                        }
                                        className={styles.cardPrimaryAction}
                                    >
                                        Ouvrir
                                    </Button>
                                    <Button
                                        component={Link}
                                        href={`/music-link/${musicLink.publicId}/report`}
                                        variant="light"
                                        color="violet"
                                        radius="xl"
                                        size="sm"
                                        leftSection={<IconChartBar size={15} />}
                                        className={styles.cardAnalyticsAction}
                                    >
                                        Analytics
                                    </Button>
                                </Group>
                            </div>
                        </article>
                    ))}
                </SimpleGrid>
            )}
        </section>
    );
}
