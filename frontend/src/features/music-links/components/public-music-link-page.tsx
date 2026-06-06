'use client';

import {
    Alert,
    Button,
    Container,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import {
    IconAlertCircle,
    IconArrowLeft,
    IconChartBar,
    IconBrandAppleFilled,
    IconBrandDeezer,
    IconBrandSoundcloud,
    IconBrandSpotifyFilled,
    IconBrandYoutubeFilled,
    IconPlayerPlayFilled,
} from '@tabler/icons-react';
import Link from 'next/link';
import type { MusicLinkPlatform } from '../types';
import { usePublicMusicLink } from '../hooks/use-public-music-link';
import styles from './public-music-link.module.css';

interface PublicMusicLinkPageProps {
    publicId: string;
}

export function PublicMusicLinkPage({ publicId }: PublicMusicLinkPageProps) {
    const { musicLink, platformLinks, isLoading, error, openPlatform } =
        usePublicMusicLink(publicId);

    if (isLoading) {
        return (
            <main className={styles.page}>
                <Loader color="white" />
            </main>
        );
    }

    if (error || !musicLink) {
        return (
            <main className={styles.page}>
                <Container size="sm" className={styles.content}>
                    <Alert
                        color="red"
                        icon={<IconAlertCircle size={18} />}
                        title="MusicLink introuvable"
                    >
                        {error ?? 'Impossible de charger ce MusicLink.'}
                    </Alert>
                </Container>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <Link
                href="/"
                className={styles.homeBackLink}
                aria-label="Retour à l'accueil"
            >
                <IconArrowLeft size={18} stroke={1.7} />
            </Link>
            {musicLink.coverUrl ? (
                <div
                    className={styles.background}
                    style={{ backgroundImage: `url(${musicLink.coverUrl})` }}
                />
            ) : null}
            <div className={styles.overlay} />

            <Container size={420} className={styles.content}>
                <Paper className={styles.panel}>
                    <Group className={styles.tabs} gap="md">
                        <Text fw={700}>Morceaux choisis</Text>
                        <Text>Favorites</Text>
                        <Text fw={700}>MusicLink</Text>
                    </Group>

                    <div className={styles.coverSection}>
                        <div
                            className={styles.coverImage}
                            style={{
                                backgroundImage: musicLink.coverUrl
                                    ? `url(${musicLink.coverUrl})`
                                    : undefined,
                            }}
                        />
                        <div className={styles.coverShade} />
                        <div className={styles.trackHeading}>
                            <Title order={1}>{musicLink.title}</Title>
                            <Text>{musicLink.artist}</Text>
                        </div>
                    </div>

                    <Stack gap="sm" className={styles.links}>
                        {platformLinks.map((link) => (
                            <button
                                key={link.platform}
                                className={styles.platformButton}
                                type="button"
                                onClick={() => void openPlatform(link)}
                            >
                                <PlatformMark platform={link.platform} />
                                <span>{link.label}</span>
                                <span className={styles.playButton}>
                                    <IconPlayerPlayFilled size={16} />
                                </span>
                            </button>
                        ))}
                    </Stack>

                    <Button
                        component={Link}
                        href={`/music-link/${musicLink.publicId}/report`}
                        variant="subtle"
                        color="gray"
                        leftSection={<IconChartBar size={17} stroke={1.8} />}
                        className={styles.reportLink}
                    >
                        Rapport analytics
                    </Button>

                    <div className={styles.footer}>
                        technical test for base for music
                    </div>
                </Paper>
            </Container>
        </main>
    );
}

function PlatformMark({ platform }: { platform: MusicLinkPlatform }) {
    const iconProps = {
        size: 22,
        stroke: 1.8,
    };

    return (
        <span
            className={`${styles.platformMark} ${styles[`platform_${platform}`]}`}
        >
            {platform === 'spotify' ? (
                <IconBrandSpotifyFilled {...iconProps} />
            ) : platform === 'appleMusic' ? (
                <IconBrandAppleFilled {...iconProps} />
            ) : platform === 'deezer' ? (
                <IconBrandDeezer {...iconProps} />
            ) : platform === 'youtube' ? (
                <IconBrandYoutubeFilled {...iconProps} />
            ) : (
                <IconBrandSoundcloud {...iconProps} />
            )}
        </span>
    );
}
