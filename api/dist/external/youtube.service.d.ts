import { HttpService } from '@nestjs/axios';
export declare class YouTubeService {
    private readonly httpService;
    constructor(httpService: HttpService);
    searchVideos(query: string): Promise<any>;
    getVideoDetails(videoId: string): Promise<any>;
}
