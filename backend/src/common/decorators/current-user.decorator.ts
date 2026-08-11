import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * @CurrentUser decorator
 *
 * Extracts the decoded Firebase token from the request (set by FirebaseAuthGuard).
 *
 * Usage:
 *   @UseGuards(FirebaseAuthGuard)
 *   @Get('me')
 *   getProfile(@CurrentUser() user: DecodedIdToken) {
 *     return { uid: user.uid };
 *   }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): DecodedIdToken => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as DecodedIdToken;
  },
);
