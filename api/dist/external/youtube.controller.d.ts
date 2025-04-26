import { YouTubeService } from './youtube.service';
export declare class YouTubeController {
    private readonly youtubeService;
    constructor(youtubeService: YouTubeService);
    searchVideos(query: string): Promise<any>;
    getVideoDetails(id: string): Promise<any>;
}
