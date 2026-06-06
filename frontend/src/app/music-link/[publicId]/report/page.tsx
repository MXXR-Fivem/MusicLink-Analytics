import { MusicLinkReportPage } from '@/features/music-links/components/music-link-report-page';

interface MusicLinkReportRouteProps {
    params: Promise<{
        publicId: string;
    }>;
}

export default async function MusicLinkReportRoute({
    params,
}: MusicLinkReportRouteProps) {
    const { publicId } = await params;

    return <MusicLinkReportPage publicId={publicId} />;
}
