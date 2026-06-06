import { Paper, Table, Text, Title } from '@mantine/core';
import type { PlatformClicks } from '../types';
import styles from './report.module.css';

interface ReportPlatformTableProps {
    clicksByPlatform: PlatformClicks[];
}

export function ReportPlatformTable({
    clicksByPlatform,
}: ReportPlatformTableProps) {
    return (
        <Paper p="lg" radius="lg" className={styles.darkPanel}>
            <Title order={3} mb="md">
                Clics par plateforme
            </Title>

            {clicksByPlatform.length === 0 ? (
                <Text className={styles.mutedText}>Aucun clic enregistré.</Text>
            ) : (
                <Table className={styles.darkTable}>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Plateforme</Table.Th>
                            <Table.Th>Clics</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {clicksByPlatform.map((item) => (
                            <Table.Tr key={item.platform}>
                                <Table.Td>{item.platform}</Table.Td>
                                <Table.Td>{item.clicks}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            )}
        </Paper>
    );
}
