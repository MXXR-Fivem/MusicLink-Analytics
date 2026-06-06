import { PublicMusicLinkPage } from '@/features/music-links/components/public-music-link-page';

interface MusicLinkPageProps {
    params: Promise<{
        publicId: string;
    }>;
}

export default async function MusicLinkPage({ params }: MusicLinkPageProps) {
    const { publicId } = await params;

    return <PublicMusicLinkPage publicId={publicId} />;
}
