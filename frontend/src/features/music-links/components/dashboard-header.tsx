import { Button, Group, SimpleGrid, Text, Title } from '@mantine/core';
import { IconArrowUpRight, IconPlus } from '@tabler/icons-react';
import type { MusicLink } from '../types';
import styles from './music-links.module.css';

interface DashboardHeaderProps {
    musicLinks: MusicLink[];
    onCreate: () => void;
}

export function DashboardHeader({
    musicLinks,
    onCreate,
}: DashboardHeaderProps) {
    const totalViews = musicLinks.reduce(
        (total, musicLink) => total + musicLink.totalViews,
        0,
    );
    const totalClicks = musicLinks.reduce(
        (total, musicLink) => total + musicLink.totalClicks,
        0,
    );

    return (
        <header className={styles.hero}>
            <Group justify="space-between" align="flex-start" gap="xl">
                <div className={styles.heroCopy}>
                    <Title order={1} className={styles.heroTitle}>
                        Tes sorties, réunies au même endroit.
                    </Title>
                    <Text className={styles.heroSubtitle}>
                        Crée des pages musicales élégantes et mesure ce qui
                        résonne vraiment auprès de ton audience.
                    </Text>
                </div>
                <Button
                    size="md"
                    radius="xl"
                    color="dark"
                    rightSection={<IconArrowUpRight size={18} />}
                    leftSection={<IconPlus size={18} />}
                    onClick={onCreate}
                    className={styles.createButton}
                >
                    Nouveau MusicLink
                </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, xs: 3 }} mt={36} spacing="sm">
                <Stat value={musicLinks.length} label="MusicLinks actifs" />
                <Stat value={totalViews} label="Vues cumulées" />
                <Stat value={totalClicks} label="Clics plateformes" />
            </SimpleGrid>
        </header>
    );
}

function Stat({ value, label }: { value: number; label: string }) {
    return (
        <div className={styles.heroStat}>
            <Text className={styles.heroStatValue}>{value}</Text>
            <Text className={styles.heroStatLabel}>{label}</Text>
        </div>
    );
}
