import { Paper, Text, Title } from '@mantine/core';
import styles from './report.module.css';

interface ReportStatCardProps {
    label: string;
    value: string | number;
}

export function ReportStatCard({ label, value }: ReportStatCardProps) {
    return (
        <Paper p="lg" radius="lg" className={styles.statPanel}>
            <Text size="sm" className={styles.mutedText}>
                {label}
            </Text>
            <Title order={3} mt={4}>
                {value}
            </Title>
        </Paper>
    );
}
