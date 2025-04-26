import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { API_CONFIG } from '../config/api-key.config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

// Define interface for error response
interface YouTubeErrorResponse {
  error?: {
    message?: string;
    code?: number;
    errors?: any[];
  };
}

@Injectable()
export class YouTubeService {
  constructor(private readonly httpService: HttpService) {}

  async searchVideos(query: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get(`${API_CONFIG.baseUrl}/search`, {
            params: {
              ...API_CONFIG.defaultParams,
              q: query,
              maxResults: 10,
              type: 'video',
            },
          })
          .pipe(
            catchError((error: AxiosError<YouTubeErrorResponse>) => {
              console.error('Error fetching YouTube data:', error.response?.data);
              
              // Check if the error is about API not being enabled
              const errorMessage = error.response?.data?.error?.message || '';
              if (errorMessage.includes('has not been used') || errorMessage.includes('disabled')) {
                throw new HttpException(
                  'YouTube API is not enabled. Please enable it in the Google Cloud Console.',
                  HttpStatus.SERVICE_UNAVAILABLE
                );
              }
              
              throw new HttpException(
                'Failed to fetch data from YouTube API',
                HttpStatus.INTERNAL_SERVER_ERROR
              );
            }),
          ),
      );

      return data;
    } catch (error) {
      // Return a mock response when the API is not available
      if (error instanceof HttpException && error.getStatus() === HttpStatus.SERVICE_UNAVAILABLE) {
        throw error;
      }
      
      console.error('Unexpected error in searchVideos:', error);
      throw new HttpException(
        'An unexpected error occurred with the YouTube service',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getVideoDetails(videoId: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get(`${API_CONFIG.baseUrl}/videos`, {
            params: {
              ...API_CONFIG.defaultParams,
              id: videoId,
            },
          })
          .pipe(
            catchError((error: AxiosError<YouTubeErrorResponse>) => {
              console.error('Error fetching video details:', error.response?.data);
              
              // Check if the error is about API not being enabled
              const errorMessage = error.response?.data?.error?.message || '';
              if (errorMessage.includes('has not been used') || errorMessage.includes('disabled')) {
                throw new HttpException(
                  'YouTube API is not enabled. Please enable it in the Google Cloud Console.',
                  HttpStatus.SERVICE_UNAVAILABLE
                );
              }
              
              throw new HttpException(
                'Failed to fetch video details from YouTube API',
                HttpStatus.INTERNAL_SERVER_ERROR
              );
            }),
          ),
      );

      return data;
    } catch (error) {
      // Return a mock response when the API is not available
      if (error instanceof HttpException && error.getStatus() === HttpStatus.SERVICE_UNAVAILABLE) {
        throw error;
      }
      
      console.error('Unexpected error in getVideoDetails:', error);
      throw new HttpException(
        'An unexpected error occurred with the YouTube service',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 