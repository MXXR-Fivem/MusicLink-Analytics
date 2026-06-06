export interface PlatformClicks {
    platform: string;
    clicks: number;
}

export interface DailyViews {
    date: string;
    views: number;
}

export interface DailyClicks {
    date: string;
    clicks: number;
}

export interface MusicLinkReportResponse {
    publicId: string;
    title: string;
    artist: string;
    coverUrl: string | null;
    totalViews: number;
    totalClicks: number;
    clickThroughRate: number;
    clicksByPlatform: PlatformClicks[];
    viewsOverTime: DailyViews[];
    clicksOverTime: DailyClicks[];
}
