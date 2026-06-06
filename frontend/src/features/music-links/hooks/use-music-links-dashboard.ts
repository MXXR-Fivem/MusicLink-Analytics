'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    createMusicLink,
    getSimilarTracks,
    listMusicLinks,
    searchSpotify,
} from '../api';
import type {
    MusicLink,
    SimilarTrackLink,
    SpotifyTrackSearchResult,
} from '../types';
import { getErrorMessage, toPlatformFields } from '../utils';

export function useMusicLinksDashboard() {
    const [musicLinks, setMusicLinks] = useState<MusicLink[]>([]);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<
        SpotifyTrackSearchResult[]
    >([]);
    const [selectedTrack, setSelectedTrack] =
        useState<SpotifyTrackSearchResult | null>(null);
    const [similarLinks, setSimilarLinks] = useState<SimilarTrackLink[]>([]);
    const [similarSource, setSimilarSource] = useState<'soundcharts' | 'mock'>(
        'mock',
    );
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const platformFields = useMemo(
        () => toPlatformFields(similarLinks),
        [similarLinks],
    );

    const refreshMusicLinks = useCallback(async () => {
        setIsLoadingList(true);
        setError(null);

        try {
            setMusicLinks(await listMusicLinks());
        } catch (refreshError) {
            setError(getErrorMessage(refreshError));
        } finally {
            setIsLoadingList(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(() => void refreshMusicLinks());

        function handlePageShow(event: PageTransitionEvent) {
            if (event.persisted) {
                void refreshMusicLinks();
            }
        }

        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, [refreshMusicLinks]);

    async function searchTracks() {
        setIsSearching(true);
        setError(null);
        setSelectedTrack(null);
        setSimilarLinks([]);

        try {
            setSearchResults(await searchSpotify(query));
        } catch (searchError) {
            setError(getErrorMessage(searchError));
        } finally {
            setIsSearching(false);
        }
    }

    async function selectTrack(track: SpotifyTrackSearchResult) {
        setSelectedTrack(track);
        setError(null);

        try {
            const similarTracks = await getSimilarTracks(track.spotifyTrackId, {
                title: track.title,
                artist: track.artist,
            });
            setSimilarLinks(similarTracks.links);
            setSimilarSource(similarTracks.source);
        } catch (similarError) {
            setSimilarLinks([]);
            setError(getErrorMessage(similarError));
        }
    }

    async function createSelectedMusicLink() {
        if (!selectedTrack) {
            return false;
        }

        setIsCreating(true);
        setError(null);

        try {
            await createMusicLink({
                title: selectedTrack.title,
                artist: selectedTrack.artist,
                coverUrl: selectedTrack.coverUrl,
                spotifyUrl: selectedTrack.spotifyUrl,
                appleMusicUrl: platformFields.appleMusic ?? null,
                deezerUrl: platformFields.deezer ?? null,
                youtubeUrl: platformFields.youtube ?? null,
                soundcloudUrl: platformFields.soundcloud ?? null,
                metadata: {
                    spotifyTrackId: selectedTrack.spotifyTrackId,
                    similarSource,
                },
            });

            setQuery('');
            setSearchResults([]);
            setSelectedTrack(null);
            setSimilarLinks([]);
            await refreshMusicLinks();
            return true;
        } catch (createError) {
            setError(getErrorMessage(createError));
            return false;
        } finally {
            setIsCreating(false);
        }
    }

    return {
        musicLinks,
        query,
        setQuery,
        searchResults,
        selectedTrack,
        similarLinks,
        similarSource,
        isLoadingList,
        isSearching,
        isCreating,
        error,
        searchTracks,
        selectTrack,
        createSelectedMusicLink,
    };
}
