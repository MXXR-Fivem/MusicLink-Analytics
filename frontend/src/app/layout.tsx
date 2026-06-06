import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { createTheme, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'MusicLink Analytics',
    description: 'Create and monitor public music links',
};

const theme = createTheme({
    primaryColor: 'violet',
    defaultRadius: 'md',
    fontFamily: 'var(--font-geist-sans), Arial, Helvetica, sans-serif',
    headings: {
        fontFamily: 'var(--font-geist-sans), Arial, Helvetica, sans-serif',
    },
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable}`}
        >
            <body>
                <MantineProvider theme={theme}>{children}</MantineProvider>
            </body>
        </html>
    );
}
