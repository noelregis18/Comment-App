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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeController = void 0;
const common_1 = require("@nestjs/common");
const youtube_service_1 = require("./youtube.service");
let YouTubeController = class YouTubeController {
    youtubeService;
    constructor(youtubeService) {
        this.youtubeService = youtubeService;
    }
    async searchVideos(query) {
        try {
            if (!query || query.trim() === '') {
                throw new common_1.HttpException('Search query is required', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.youtubeService.searchVideos(query);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Error in searchVideos controller:', error);
            throw new common_1.HttpException('Failed to search videos', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getVideoDetails(id) {
        try {
            if (!id || id.trim() === '') {
                throw new common_1.HttpException('Video ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.youtubeService.getVideoDetails(id);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Error in getVideoDetails controller:', error);
            throw new common_1.HttpException('Failed to get video details', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.YouTubeController = YouTubeController;
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], YouTubeController.prototype, "searchVideos", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], YouTubeController.prototype, "getVideoDetails", null);
exports.YouTubeController = YouTubeController = __decorate([
    (0, common_1.Controller)('youtube'),
    __metadata("design:paramtypes", [youtube_service_1.YouTubeService])
], YouTubeController);
//# sourceMappingURL=youtube.controller.js.map