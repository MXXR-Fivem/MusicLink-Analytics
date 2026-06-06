'use client';

import {
    Alert,
    Button,
    Container,
    Group,
    Loader,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { IconAlertCircle, IconExternalLink } from '@tabler/icons-react';
import Link from 'next/link';
import { useMusicLinkReport } from '../hooks/use-music-link-report';
import { ReportCharts } from './report-charts';
import { ReportPlatformTable } from './report-platform-table';
import { ReportStatCard } from './report-stat-card';
import styles from './report.module.css';

interface MusicLinkReportPageProps {
    publicId: string;
}

export function MusicLinkReportPage({ publicId }: MusicLinkReportPageProps) {
    const { report, isLoading, error } = useMusicLinkReport(publicId);

    if (isLoading) {
        return (
            <main className={styles.page}>
                <Container size="lg">
                    <Loader />
                </Container>
            </main>
        );
    }

    if (error || !report) {
        return (
            <main className={styles.page}>
                <Container size="lg">
                    <Alert
                        color="red"
                        icon={<IconAlertCircle size={18} />}
                        title="Rapport introuvable"
                    >
                        {error ?? 'Impossible de charger ce rapport.'}
                    </Alert>
                </Container>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            {report.coverUrl ? (
                <div
                    className={styles.background}
                    style={{ backgroundImage: `url(${report.coverUrl})` }}
                />
            ) : null}
            <div className={styles.overlay} />
            <Container size="lg" className={styles.content}>
                <Stack gap="xl">
                    <Group
                        justify="space-between"
                        align="flex-end"
                        className={styles.reportHeader}
                    >
                        <div>
                            <Title order={1}>Rapport analytics</Title>
                            <Text className={styles.mutedText} mt={4}>
                                {report.title} · {report.artist}
                            </Text>
                        </div>
                        <Button
                            component={Link}
                            href={`/music-link/${report.publicId}`}
                            variant="light"
                            color="violet"
                            radius="xl"
                            leftSection={<IconExternalLink size={18} />}
                            className={styles.publicLinkButton}
                        >
                            Ouvrir la page publique
                        </Button>
                    </Group>

                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                        <ReportStatCard
                            label="Total vues"
                            value={report.totalViews}
                        />
                        <ReportStatCard
                            label="Total clics"
                            value={report.totalClicks}
                        />
                        <ReportStatCard
                            label="Taux de clic"
                            value={`${report.clickThroughRate}%`}
                        />
                    </SimpleGrid>

                    <ReportPlatformTable
                        clicksByPlatform={report.clicksByPlatform}
                    />
                    <ReportCharts report={report} />
                </Stack>
            </Container>
        </main>
    );
}
