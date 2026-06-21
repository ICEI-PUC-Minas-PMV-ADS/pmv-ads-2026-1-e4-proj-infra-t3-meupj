import { buildApp } from './app.js';
import { isDevBypassEnabled } from './routes/auth-session.js';

const app = await buildApp();

const host = app.env.HOST ?? '0.0.0.0';
const port = app.env.PORT ?? 3000;

if (isDevBypassEnabled(app)) {
  app.log.warn('DEVELOPMENT MODE: Authentication bypass is ENABLED');
} else if (app.env.ENABLE_DEV_BYPASS === 'true') {
  app.log.warn('Ignoring ENABLE_DEV_BYPASS because NODE_ENV is not development');
}

try {
  await app.listen({ host, port });
  app.log.info({ host, port }, 'API server started');
} catch (error) {
  app.log.fatal({ err: error }, 'Unable to start API server');
  await app.close();
  process.exit(1);
}
