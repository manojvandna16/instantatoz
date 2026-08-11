import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import {
  SupabaseStorageService,
  ProfileImageMeta,
} from '../supabase/supabase-storage.service';

@Injectable()
export class WorkersService {
  private readonly logger = new Logger(WorkersService.name);

  constructor(
    private readonly firebase: FirebaseAdminService,
    private readonly storage: SupabaseStorageService,
  ) {}

  /**
   * Upload worker profile image.
   * Saves metadata to Firestore after successful upload.
   */
  async uploadProfileImage(
    workerUid: string,
    buffer: Buffer,
    mimeType: string,
    fileSize: number,
  ): Promise<{ signedUrl: string; meta: ProfileImageMeta }> {
    // Upload to Supabase Storage
    const meta = await this.storage.uploadWorkerProfileImage(
      workerUid,
      buffer,
      mimeType,
      fileSize,
    );

    // Save metadata to Firestore (not the image itself — just the path)
    await this.firebase.firestore
      .collection('workers')
      .doc(workerUid)
      .set({ profileImage: meta }, { merge: true });

    this.logger.log(`Firestore profileImage metadata updated for uid=${workerUid}`);

    // Return signed URL so the app can immediately display the image
    const signedUrl = await this.storage.createWorkerProfileImageSignedUrl(workerUid);

    return { signedUrl, meta };
  }

  /**
   * Get signed URL for worker's current profile image.
   * Returns null if no image exists.
   */
  async getProfileImageSignedUrl(workerUid: string): Promise<string> {
    // Verify image exists in Firestore first
    const doc = await this.firebase.firestore
      .collection('workers')
      .doc(workerUid)
      .get();

    if (!doc.exists || !doc.data()?.profileImage) {
      throw new NotFoundException('No profile image found for this worker.');
    }

    return this.storage.createWorkerProfileImageSignedUrl(workerUid);
  }

  /**
   * Delete worker's profile image.
   * Removes from Supabase Storage and clears Firestore metadata.
   */
  async deleteProfileImage(workerUid: string): Promise<void> {
    await this.storage.deleteWorkerProfileImage(workerUid);

    // Clear profileImage field from Firestore
    await this.firebase.firestore
      .collection('workers')
      .doc(workerUid)
      .update({ profileImage: null });

    this.logger.log(`Profile image deleted for uid=${workerUid}`);
  }
}
