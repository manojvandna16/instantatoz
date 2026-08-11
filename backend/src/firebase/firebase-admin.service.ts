import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth, type DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * FirebaseAdminService
 *
 * Provides server-side Firebase Admin SDK access.
 * Uses firebase-admin v12+ modular API.
 *
 * SECURITY: Credentials are loaded from environment variables only.
 * FIREBASE_PRIVATE_KEY is NEVER exposed to any client.
 */
@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private adminApp: App;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    if (getApps().length === 0) {
      const projectId = this.config.getOrThrow<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');
      const rawPrivateKey = this.config.get<string>('FIREBASE_PRIVATE_KEY');

      if (clientEmail && rawPrivateKey) {
        const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
        this.adminApp = initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
        });
        this.logger.log('Firebase Admin SDK initialized with service account');
      } else {
        // No service account credentials — initialize with project ID only
        // (Works for local dev; some features like verifyIdToken won't work until credentials are added)
        this.adminApp = initializeApp({ projectId });
        this.logger.warn(
          'Firebase Admin SDK initialized WITHOUT service account credentials. ' +
          'Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to .env for full functionality.',
        );
      }
    } else {
      this.adminApp = getApp();
      this.logger.log('Firebase Admin SDK — reusing existing app instance');
    }
  }

  /** Verify a Firebase ID token — returns decoded token with uid */
  async verifyIdToken(token: string): Promise<DecodedIdToken> {
    return getAuth(this.adminApp).verifyIdToken(token);
  }

  /** Firebase Auth instance */
  get auth(): Auth {
    return getAuth(this.adminApp);
  }

  /** Firestore instance (Admin SDK — bypasses security rules) */
  get firestore(): Firestore {
    return getFirestore(this.adminApp);
  }
}
