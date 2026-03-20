import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';

import type { AuthService } from '../lib/auth.js';
import { toPublicProfile, type ProfileStore } from '../lib/profile.js';

type ProfileRouteDependencies = {
  authService: AuthService;
  profileStore: ProfileStore;
};

const NullableStringSchema = Type.Union([Type.String(), Type.Null()]);

const ProfileAddressSchema = Type.Object(
  {
    zipCode: NullableStringSchema,
    street: NullableStringSchema,
    number: NullableStringSchema,
    complement: NullableStringSchema,
    district: NullableStringSchema,
    city: NullableStringSchema,
    state: NullableStringSchema,
    country: NullableStringSchema,
  },
  {
    additionalProperties: false,
  },
);

const ProfileBusinessSchema = Type.Object(
  {
    name: NullableStringSchema,
    document: NullableStringSchema,
    phone: NullableStringSchema,
    email: NullableStringSchema,
    logo: NullableStringSchema,
    color: NullableStringSchema,
    footer: NullableStringSchema,
    address: ProfileAddressSchema,
  },
  {
    additionalProperties: false,
  },
);

const ProfileResponseSchema = Type.Object(
  {
    business: ProfileBusinessSchema,
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
  },
  {
    additionalProperties: false,
  },
);

const UnauthorizedSchema = Type.Object({
  error: Type.Literal('Unauthorized'),
  message: Type.Literal('Unauthorized'),
  statusCode: Type.Literal(401),
});

const UnauthorizedPayload = Object.freeze({
  error: 'Unauthorized',
  message: 'Unauthorized',
  statusCode: 401,
});

export const registerProfileRoutes = (
  app: FastifyInstance,
  dependencies: ProfileRouteDependencies,
): void => {
  app.get(
    '/profile',
    {
      schema: {
        response: {
          200: ProfileResponseSchema,
          401: UnauthorizedSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      if (!session) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      request.user = {
        id: session.user.id,
        email: session.user.email,
      };

      const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);

      return reply.send(toPublicProfile(profile));
    },
  );
};
