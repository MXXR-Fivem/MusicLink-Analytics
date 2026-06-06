'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMusicLink, trackMusicLinkEvent } from '../api';
import type { MusicLink, MusicLinkPlatformLink } from '../types';
import { getErrorMessage, getMusicLinkPlatformLinks } from '../utils';

export function usePublicMusicLink(publicId: string) {
    const [musicLink, setMusicLink] = useState<MusicLink | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMusicLink = useCallback(
        async (trackView: boolean, showLoading = true) => {
            if (showLoading) {
                setIsLoading(true);
            }
            setError(null);

            try {
                const loadedMusicLink = await getMusicLink(publicId);
                setMusicLink(loadedMusicLink);

                if (trackView) {
                    void trackMusicLinkEvent(publicId, {
                        eventType: 'page_view',
                    });
                }
            } catch (loadError) {
                setError(getErrorMessage(loadError));
            } finally {
                setIsLoading(false);
            }
        },
        [publicId],
    );

    useEffect(() => {
        queueMicrotask(() => void loadMusicLink(true));

        function handlePageShow(event: PageTransitionEvent) {
            if (event.persisted) {
                void loadMusicLink(false, false);
            }
        }

        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, [loadMusicLink]);

    const platformLinks = useMemo(
        () => (musicLink ? getMusicLinkPlatformLinks(musicLink) : []),
        [musicLink],
    );

    function openPlatform(link: MusicLinkPlatformLink) {
        window.open(link.url, '_blank', 'noopener,noreferrer');
        void trackMusicLinkEvent(publicId, {
            eventType: 'platform_click',
            platform: link.platform,
        });
    }

    return {
        musicLink,
        platformLinks,
        isLoading,
        error,
        openPlatform,
    };
}
