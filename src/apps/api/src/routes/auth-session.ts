import type { FastifyInstance } from 'fastify';
import type { IncomingHttpHeaders } from 'node:http';

import type { AuthService } from '../lib/auth.js';
import type { ProfileStore } from '../lib/profile.js';

const DEV_BYPASS_AUTH_USER_ID = 'dev-user-id';

export const UnauthorizedPayload = Object.freeze({
  error: 'Unauthorized',
  message: 'Unauthorized',
  statusCode: 401,
});

type AuthenticatedProfileDependencies = {
  authService: AuthService;
  profileStore: ProfileStore;
};

export const isDevBypassEnabled = (app: FastifyInstance): boolean =>
  app.env.NODE_ENV === 'development' && app.env.ENABLE_DEV_BYPASS === 'true';

export const resolveAuthenticatedProfileId = async (
  app: FastifyInstance,
  dependencies: AuthenticatedProfileDependencies,
  headers: IncomingHttpHeaders,
): Promise<string | null> => {
  const session = await dependencies.authService.getSessionFromHeaders(headers);

  if (session) {
    const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);
    return profile._id.toHexString();
  }

  if (!isDevBypassEnabled(app)) {
    return null;
  }

  app.log.warn('Using development authentication bypass');

  const fallbackProfile =
    await dependencies.profileStore.ensureByAuthUserId(DEV_BYPASS_AUTH_USER_ID);
  return fallbackProfile._id.toHexString();
};
