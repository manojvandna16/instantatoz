import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkersService } from './workers.service';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * WorkersController — /api/v1/workers/profile/image
 *
 * All routes require a valid Firebase ID token in:
 *   Authorization: Bearer <token>
 *
 * The worker can only operate on their own profile image.
 * Their Firebase UID (from the verified token) is used as the storage path key.
 */
@Controller('workers')
@UseGuards(FirebaseAuthGuard)
export class WorkersController {
  private readonly logger = new Logger(WorkersController.name);

  constructor(private readonly workersService: WorkersService) {}

  /**
   * POST /api/v1/workers/profile/image
   *
   * Upload or replace the authenticated worker's profile image.
   * Accepts multipart/form-data with field name "image".
   *
   * Response:
   *   { signedUrl: string, meta: ProfileImageMeta }
   */
  @Post('profile/image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB — first gate at multer level
      },
    }),
  )
  async uploadProfileImage(
    @CurrentUser() user: DecodedIdToken,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.log(`Profile image upload requested by uid=${user.uid}`);

    const result = await this.workersService.uploadProfileImage(
      user.uid,
      file.buffer,
      file.mimetype,
      file.size,
    );

    return {
      success: true,
      message: 'Profile image uploaded successfully.',
      ...result,
    };
  }

  /**
   * GET /api/v1/workers/profile/image
   *
   * Get a temporary signed URL for the authenticated worker's profile image.
   * The URL expires in 1 hour.
   *
   * Response:
   *   { signedUrl: string }
   */
  @Get('profile/image')
  async getProfileImage(@CurrentUser() user: DecodedIdToken) {
    const signedUrl = await this.workersService.getProfileImageSignedUrl(user.uid);
    return { success: true, signedUrl };
  }

  /**
   * DELETE /api/v1/workers/profile/image
   *
   * Delete the authenticated worker's profile image.
   */
  @Delete('profile/image')
  @HttpCode(HttpStatus.OK)
  async deleteProfileImage(@CurrentUser() user: DecodedIdToken) {
    await this.workersService.deleteProfileImage(user.uid);
    return { success: true, message: 'Profile image deleted.' };
  }
}
