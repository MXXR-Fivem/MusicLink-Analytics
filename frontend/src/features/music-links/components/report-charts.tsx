'use client';

import { Paper, SimpleGrid, Text, Title } from '@mantine/core';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { MusicLinkReport } from '../types';
import styles from './report.module.css';

interface ReportChartsProps {
    report: MusicLinkReport;
}

export function ReportCharts({ report }: ReportChartsProps) {
    return (
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
            <ChartPanel title="Évolution des vues">
                {report.viewsOverTime.length === 0 ? (
                    <EmptyChart />
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={report.viewsOverTime}>
                            <CartesianGrid
                                stroke="rgba(23,23,23,0.1)"
                                strokeDasharray="3 3"
                            />
                            <XAxis dataKey="date" stroke="#77736d" />
                            <YAxis allowDecimals={false} stroke="#77736d" />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="views"
                                name="Vues"
                                stroke="#6c4ddc"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </ChartPanel>

            <ChartPanel title="Évolution des clics">
                {report.clicksOverTime.length === 0 ? (
                    <EmptyChart />
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={report.clicksOverTime}>
                            <CartesianGrid
                                stroke="rgba(23,23,23,0.1)"
                                strokeDasharray="3 3"
                            />
                            <XAxis dataKey="date" stroke="#77736d" />
                            <YAxis allowDecimals={false} stroke="#77736d" />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="clicks"
                                name="Clics"
                                stroke="#9b7bea"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </ChartPanel>

            <ChartPanel title="Répartition des clics">
                {report.clicksByPlatform.length === 0 ? (
                    <EmptyChart />
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={report.clicksByPlatform}>
                            <CartesianGrid
                                stroke="rgba(23,23,23,0.1)"
                                strokeDasharray="3 3"
                            />
                            <XAxis dataKey="platform" stroke="#77736d" />
                            <YAxis allowDecimals={false} stroke="#77736d" />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="clicks"
                                name="Clics"
                                fill="#6c4ddc"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </ChartPanel>
        </SimpleGrid>
    );
}

function ChartPanel({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Paper p="lg" radius="lg" className={styles.chartPanel}>
            <Title order={3} mb="md">
                {title}
            </Title>
            {children}
        </Paper>
    );
}

function EmptyChart() {
    return (
        <div className={styles.emptyChart}>
            <Text className={styles.mutedText}>Pas encore de données.</Text>
        </div>
    );
}
