import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'worker-profile-images';
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60; // 1 hour

/** Allowed MIME types for worker profile images */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/** Max file size: 5 MB */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export interface ProfileImageMeta {
  storageProvider: 'supabase';
  bucket: string;
  path: string;
  updatedAt: string;
}

/**
 * SupabaseStorageService
 *
 * Handles all Worker Profile Image operations against the
 * private Supabase `worker-profile-images` bucket.
 *
 * SECURITY:
 *   - Uses SERVICE_ROLE_KEY — NEVER expose this key to any frontend.
 *   - Private bucket — images are only accessible via short-lived signed URLs.
 *   - Validation: MIME type and file size are enforced server-side.
 *   - Authorization: enforced in WorkersService (worker can only touch own path).
 */
@Injectable()
export class SupabaseStorageService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private client: SupabaseClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.getOrThrow<string>('SUPABASE_URL');
    const serviceRoleKey = this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');

    this.client = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('Supabase client initialized (service-role)');
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Returns the canonical storage path for a worker's profile image */
  private workerProfilePath(firebaseUid: string): string {
    return `workers/${firebaseUid}/profile.webp`;
  }

  /** Validate file buffer — MIME type and size */
  private validateFile(
    buffer: Buffer,
    mimeType: string,
    originalSize: number,
  ): void {
    if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
      throw new BadRequestException(
        `Invalid file type: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }
    if (originalSize > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File too large (${(originalSize / 1024 / 1024).toFixed(2)} MB). Maximum allowed: 5 MB.`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Upload (or replace) a worker's profile image.
   * Returns the storage path on success.
   */
  async uploadWorkerProfileImage(
    firebaseUid: string,
    buffer: Buffer,
    mimeType: string,
    fileSize: number,
  ): Promise<ProfileImageMeta> {
    this.validateFile(buffer, mimeType, fileSize);

    const path = this.workerProfilePath(firebaseUid);

    // upsert: true replaces existing file — handles both upload and replace
    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: 'image/webp', // always store as webp path
        upsert: true,
      });

    if (error) {
      this.logger.error(`Upload failed for uid=${firebaseUid}: ${error.message}`);
      throw new InternalServerErrorException(
        'Profile photo upload failed. Please try again.',
      );
    }

    this.logger.log(`Profile image uploaded for uid=${firebaseUid} → ${path}`);

    return {
      storageProvider: 'supabase',
      bucket: BUCKET,
      path,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate a short-lived signed URL for a worker's profile image.
   * The URL expires in 1 hour.
   */
  async createWorkerProfileImageSignedUrl(firebaseUid: string): Promise<string> {
    const path = this.workerProfilePath(firebaseUid);

    const { data, error } = await this.client.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRES_IN_SECONDS);

    if (error || !data?.signedUrl) {
      this.logger.warn(`Signed URL failed for uid=${firebaseUid}: ${error?.message}`);
      throw new InternalServerErrorException(
        'Could not generate image URL. Please try again.',
      );
    }

    return data.signedUrl;
  }

  /**
   * Delete a worker's profile image from Supabase Storage.
   */
  async deleteWorkerProfileImage(firebaseUid: string): Promise<void> {
    const path = this.workerProfilePath(firebaseUid);

    const { error } = await this.client.storage.from(BUCKET).remove([path]);

    if (error) {
      this.logger.warn(`Delete failed for uid=${firebaseUid}: ${error.message}`);
      // Non-fatal: log and continue — file may not exist
    } else {
      this.logger.log(`Profile image deleted for uid=${firebaseUid}`);
    }
  }

  /**
   * Replace a worker's profile image (delete old, upload new).
   * Atomic-ish: uses upsert so a failed upload doesn't leave the worker imageless.
   */
  async replaceWorkerProfileImage(
    firebaseUid: string,
    buffer: Buffer,
    mimeType: string,
    fileSize: number,
  ): Promise<ProfileImageMeta> {
    // upsert: true in uploadWorkerProfileImage handles replacement atomically
    return this.uploadWorkerProfileImage(firebaseUid, buffer, mimeType, fileSize);
  }
}
