import type {
    MusicLink,
    MusicLinkPlatform,
    MusicLinkPlatformLink,
    SimilarTrackLink,
} from './types';

export function formatDate(value: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function formatPlatform(platform: SimilarTrackLink['platform']): string {
    const labels: Record<SimilarTrackLink['platform'], string> = {
        appleMusic: 'Apple Music',
        deezer: 'Deezer',
        youtube: 'YouTube',
        soundcloud: 'SoundCloud',
    };

    return labels[platform];
}

export function getMusicLinkPlatformLinks(
    musicLink: MusicLink,
): MusicLinkPlatformLink[] {
    const platformUrls: Array<{
        platform: MusicLinkPlatform;
        label: string;
        url: string | null;
    }> = [
        {
            platform: 'spotify',
            label: 'Spotify',
            url: musicLink.spotifyUrl,
        },
        {
            platform: 'appleMusic',
            label: 'Apple Music',
            url: musicLink.appleMusicUrl,
        },
        {
            platform: 'deezer',
            label: 'Deezer',
            url: musicLink.deezerUrl,
        },
        {
            platform: 'youtube',
            label: 'YouTube',
            url: musicLink.youtubeUrl,
        },
        {
            platform: 'soundcloud',
            label: 'SoundCloud',
            url: musicLink.soundcloudUrl,
        },
    ];

    return platformUrls
        .filter((link) => link.url)
        .map((link) => ({
            platform: link.platform,
            label: link.label,
            url: link.url as string,
        }));
}

export function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Erreur inconnue';
}

export function toPlatformFields(
    similarLinks: SimilarTrackLink[],
): Record<string, string> {
    return similarLinks.reduce<Record<string, string>>((accumulator, link) => {
        accumulator[link.platform] = link.url;
        return accumulator;
    }, {});
}
