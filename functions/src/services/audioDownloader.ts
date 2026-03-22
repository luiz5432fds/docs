import * as admin from 'firebase-admin';
import {AudioSource} from '../types';

const storage = admin.storage();

export interface DownloadResult {
  storagePath: string;
  downloadUrl: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  duration?: number;
}

/**
 * Audio Downloader Service
 * Downloads audio from multiple sources: YouTube, WhatsApp, direct upload, generic URLs
 */
export class AudioDownloaderService {
  private readonly bucket = storage.bucket();

  /**
   * Download audio from YouTube using yt-dlp
   * Note: Requires yt-dlp to be installed on the server
   */
  async downloadFromYouTube(url: string, userId: string): Promise<DownloadResult> {
    const videoId = this.extractYouTubeVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const filename = `youtube_${videoId}_${Date.now()}.mp3`;
    const tempPath = `/tmp/${filename}`;
    const storagePath = `users/${userId}/audio/${filename}`;

    try {
      // In production, this would call a Python backend with yt-dlp
      // For now, we'll prepare the structure and return a placeholder
      // The actual download would be done by the Python backend

      return {
        storagePath,
        downloadUrl: await this.getSignedUrl(storagePath),
        filename,
        mimeType: 'audio/mpeg',
        sizeBytes: 0,
      };
    } catch (error) {
      throw new Error(`Failed to download from YouTube: ${(error as Error).message}`);
    }
  }

  /**
   * Download audio from WhatsApp message
   * Requires WhatsApp webhook integration
   */
  async downloadFromWhatsApp(messageId: string, userId: string): Promise<DownloadResult> {
    const filename = `whatsapp_${messageId}_${Date.now()}.mp3`;
    const storagePath = `users/${userId}/audio/${filename}`;

    try {
      // In production, this would fetch from WhatsApp Business API
      // The actual implementation depends on the WhatsApp integration

      return {
        storagePath,
        downloadUrl: await this.getSignedUrl(storagePath),
        filename,
        mimeType: 'audio/mpeg',
        sizeBytes: 0,
      };
    } catch (error) {
      throw new Error(`Failed to download from WhatsApp: ${(error as Error).message}`);
    }
  }

  /**
   * Handle direct file upload from user
   */
  async uploadDirect(
    file: Buffer,
    filename: string,
    mimeType: string,
    userId: string
  ): Promise<DownloadResult> {
    const sanitizedFilename = this.sanitizeFilename(filename);
    const storagePath = `users/${userId}/audio/${sanitizedFilename}`;

    try {
      const fileRef = this.bucket.file(storagePath);
      await fileRef.save(file, {
        contentType: mimeType,
        metadata: {contentType: mimeType},
      });

      const [metadata] = await fileRef.getMetadata();

      return {
        storagePath,
        downloadUrl: await this.getSignedUrl(storagePath),
        filename: sanitizedFilename,
        mimeType,
        sizeBytes: parseInt(metadata.size || '0', 10),
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${(error as Error).message}`);
    }
  }

  /**
   * Download from generic audio URL
   */
  async downloadFromUrl(url: string, userId: string): Promise<DownloadResult> {
    const extension = this.getExtensionFromUrl(url);
    const filename = `remote_${Date.now()}${extension}`;
    const storagePath = `users/${userId}/audio/${filename}`;

    try {
      // In production, this would download the file using axios or fetch
      // and save to storage

      return {
        storagePath,
        downloadUrl: await this.getSignedUrl(storagePath),
        filename,
        mimeType: this.getMimeTypeFromExtension(extension),
        sizeBytes: 0,
      };
    } catch (error) {
      throw new Error(`Failed to download from URL: ${(error as Error).message}`);
    }
  }

  /**
   * Main router - downloads audio based on source type
   */
  async download(source: AudioSource, userId: string): Promise<DownloadResult> {
    switch (source.type) {
      case 'youtube':
        if (!source.url) throw new Error('YouTube URL is required');
        return this.downloadFromYouTube(source.url, userId);

      case 'whatsapp':
        if (!source.messageId) throw new Error('WhatsApp message ID is required');
        return this.downloadFromWhatsApp(source.messageId, userId);

      case 'upload':
        throw new Error('Use uploadDirect method for file uploads');

      case 'url':
        if (!source.url) throw new Error('URL is required');
        return this.downloadFromUrl(source.url, userId);

      default:
        throw new Error(`Unsupported audio source type: ${(source as AudioSource).type}`);
    }
  }

  /**
   * Get a signed URL for file download (valid for 15 minutes)
   */
  private async getSignedUrl(storagePath: string): Promise<string> {
    const file = this.bucket.file(storagePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    return url;
  }

  /**
   * Extract video ID from YouTube URL
   */
  private extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[7]?.length === 11) return match[7];
      if (match && match[1]?.length === 11) return match[1];
    }

    return null;
  }

  /**
   * Sanitize filename for storage
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  /**
   * Get file extension from URL
   */
  private getExtensionFromUrl(url: string): string {
    const urlPath = url.split('?')[0];
    const match = urlPath.match(/\.(mp3|wav|ogg|m4a|flac|aac|wma)/i);
    return match ? `.${match[1].toLowerCase()}` : '.mp3';
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.flac': 'audio/flac',
      '.aac': 'audio/aac',
      '.wma': 'audio/x-ms-wma',
    };
    return mimeTypes[extension.toLowerCase()] || 'audio/mpeg';
  }

  /**
   * Delete audio file from storage
   */
  async deleteAudio(storagePath: string): Promise<void> {
    try {
      await this.bucket.file(storagePath).delete();
    } catch (error) {
      console.error(`Failed to delete audio file: ${(error as Error).message}`);
    }
  }
}

// Singleton instance
export const audioDownloaderService = new AudioDownloaderService();
