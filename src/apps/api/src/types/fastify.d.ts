import type { AppEnv } from '../env.js';

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  roles?: string[];
};

declare module 'fastify' {
  interface FastifyInstance {
    env: AppEnv;
  }

  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}
