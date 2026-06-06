'use client';

import { useCallback, useEffect, useState } from 'react';
import { getMusicLinkReport } from '../api';
import type { MusicLinkReport } from '../types';
import { getErrorMessage } from '../utils';

export function useMusicLinkReport(publicId: string) {
    const [report, setReport] = useState<MusicLinkReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadReport = useCallback(
        async (showLoading = true) => {
            if (showLoading) {
                setIsLoading(true);
            }
            setError(null);

            try {
                setReport(await getMusicLinkReport(publicId));
            } catch (loadError) {
                setError(getErrorMessage(loadError));
            } finally {
                setIsLoading(false);
            }
        },
        [publicId],
    );

    useEffect(() => {
        queueMicrotask(() => void loadReport());

        function handlePageShow(event: PageTransitionEvent) {
            if (event.persisted) {
                void loadReport(false);
            }
        }

        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, [loadReport]);

    return {
        report,
        isLoading,
        error,
    };
}
