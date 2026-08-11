import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase-admin.service';

/**
 * FirebaseAuthGuard
 *
 * Validates the Firebase ID token from the Authorization header.
 * On success, attaches decoded token to request.user.
 *
 * Usage:
 *   @UseGuards(FirebaseAuthGuard)
 *   @Get('protected-route')
 *
 * Token format: Bearer <firebase-id-token>
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header. Expected: Bearer <token>',
      );
    }

    const token = authHeader.slice(7).trim();

    try {
      const decoded = await this.firebaseAdmin.verifyIdToken(token);
      request.user = decoded; // attach decoded token to request
      return true;
    } catch (err) {
      this.logger.warn(`Token verification failed: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid or expired Firebase ID token.');
    }
  }
}
