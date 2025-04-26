import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { YouTubeService } from './youtube.service';

@Controller('youtube')
export class YouTubeController {
  constructor(private readonly youtubeService: YouTubeService) {}

  @Get('search')
  async searchVideos(@Query('q') query: string) {
    try {
      if (!query || query.trim() === '') {
        throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
      }
      return await this.youtubeService.searchVideos(query);
    } catch (error) {
      // Re-throw HttpExceptions as they already have proper status and message
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in searchVideos controller:', error);
      throw new HttpException(
        'Failed to search videos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async getVideoDetails(@Param('id') id: string) {
    try {
      if (!id || id.trim() === '') {
        throw new HttpException('Video ID is required', HttpStatus.BAD_REQUEST);
      }
      return await this.youtubeService.getVideoDetails(id);
    } catch (error) {
      // Re-throw HttpExceptions as they already have proper status and message
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in getVideoDetails controller:', error);
      throw new HttpException(
        'Failed to get video details',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 