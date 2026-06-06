'use client';

import { Modal, Stack } from '@mantine/core';
import { useState } from 'react';
import { CreateMusicLinkSection } from '@/features/music-links/components/create-music-link-section';
import { DashboardHeader } from '@/features/music-links/components/dashboard-header';
import { ErrorAlert } from '@/features/music-links/components/error-alert';
import { MusicLinksTable } from '@/features/music-links/components/music-links-table';
import { useMusicLinksDashboard } from '@/features/music-links/hooks/use-music-links-dashboard';
import styles from './page.module.css';

export default function Home() {
    const dashboard = useMusicLinksDashboard();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [previewedMusicLinkId, setPreviewedMusicLinkId] = useState<
        string | null
    >(null);
    const activeMusicLinkId = dashboard.musicLinks.some(
        (musicLink) => musicLink.publicId === previewedMusicLinkId,
    )
        ? previewedMusicLinkId
        : (dashboard.musicLinks[0]?.publicId ?? null);

    async function handleCreate() {
        const wasCreated = await dashboard.createSelectedMusicLink();

        if (wasCreated) {
            setIsCreateOpen(false);
        }
    }

    return (
        <main className={styles.page}>
            <div className={styles.backgrounds} aria-hidden="true">
                {dashboard.musicLinks.map((musicLink) =>
                    musicLink.coverUrl ? (
                        <div
                            key={musicLink.publicId}
                            className={`${styles.background} ${
                                musicLink.publicId === activeMusicLinkId
                                    ? styles.backgroundActive
                                    : ''
                            }`}
                            style={{
                                backgroundImage: `url(${musicLink.coverUrl})`,
                            }}
                        />
                    ) : null,
                )}
                <div className={styles.backgroundShade} />
            </div>

            <div className={styles.content}>
                <Stack gap={36}>
                    <DashboardHeader
                        musicLinks={dashboard.musicLinks}
                        onCreate={() => setIsCreateOpen(true)}
                    />
                    <ErrorAlert message={dashboard.error} />
                    <MusicLinksTable
                        musicLinks={dashboard.musicLinks}
                        isLoading={dashboard.isLoadingList}
                        activeMusicLinkId={activeMusicLinkId}
                        onPreview={setPreviewedMusicLinkId}
                    />
                </Stack>
            </div>

            <Modal
                opened={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Nouveau MusicLink"
                size="xl"
                radius="lg"
                centered
                overlayProps={{ backgroundOpacity: 0.68, blur: 8 }}
                classNames={{
                    content: styles.modal,
                    header: styles.modalHeader,
                    body: styles.modalBody,
                }}
            >
                <CreateMusicLinkSection
                    query={dashboard.query}
                    searchResults={dashboard.searchResults}
                    selectedTrack={dashboard.selectedTrack}
                    similarLinks={dashboard.similarLinks}
                    similarSource={dashboard.similarSource}
                    isSearching={dashboard.isSearching}
                    isCreating={dashboard.isCreating}
                    onQueryChange={dashboard.setQuery}
                    onSearch={() => void dashboard.searchTracks()}
                    onSelectTrack={(track) => void dashboard.selectTrack(track)}
                    onCreate={() => void handleCreate()}
                />
            </Modal>
        </main>
    );
}
