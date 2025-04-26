"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const api_key_config_1 = require("../config/api-key.config");
const rxjs_1 = require("rxjs");
let YouTubeService = class YouTubeService {
    httpService;
    constructor(httpService) {
        this.httpService = httpService;
    }
    async searchVideos(query) {
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService
                .get(`${api_key_config_1.API_CONFIG.baseUrl}/search`, {
                params: {
                    ...api_key_config_1.API_CONFIG.defaultParams,
                    q: query,
                    maxResults: 10,
                    type: 'video',
                },
            })
                .pipe((0, rxjs_1.catchError)((error) => {
                console.error('Error fetching YouTube data:', error.response?.data);
                const errorMessage = error.response?.data?.error?.message || '';
                if (errorMessage.includes('has not been used') || errorMessage.includes('disabled')) {
                    throw new common_1.HttpException('YouTube API is not enabled. Please enable it in the Google Cloud Console.', common_1.HttpStatus.SERVICE_UNAVAILABLE);
                }
                throw new common_1.HttpException('Failed to fetch data from YouTube API', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            })));
            return data;
        }
        catch (error) {
            if (error instanceof common_1.HttpException && error.getStatus() === common_1.HttpStatus.SERVICE_UNAVAILABLE) {
                throw error;
            }
            console.error('Unexpected error in searchVideos:', error);
            throw new common_1.HttpException('An unexpected error occurred with the YouTube service', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getVideoDetails(videoId) {
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService
                .get(`${api_key_config_1.API_CONFIG.baseUrl}/videos`, {
                params: {
                    ...api_key_config_1.API_CONFIG.defaultParams,
                    id: videoId,
                },
            })
                .pipe((0, rxjs_1.catchError)((error) => {
                console.error('Error fetching video details:', error.response?.data);
                const errorMessage = error.response?.data?.error?.message || '';
                if (errorMessage.includes('has not been used') || errorMessage.includes('disabled')) {
                    throw new common_1.HttpException('YouTube API is not enabled. Please enable it in the Google Cloud Console.', common_1.HttpStatus.SERVICE_UNAVAILABLE);
                }
                throw new common_1.HttpException('Failed to fetch video details from YouTube API', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            })));
            return data;
        }
        catch (error) {
            if (error instanceof common_1.HttpException && error.getStatus() === common_1.HttpStatus.SERVICE_UNAVAILABLE) {
                throw error;
            }
            console.error('Unexpected error in getVideoDetails:', error);
            throw new common_1.HttpException('An unexpected error occurred with the YouTube service', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.YouTubeService = YouTubeService;
exports.YouTubeService = YouTubeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], YouTubeService);
//# sourceMappingURL=youtube.service.js.map