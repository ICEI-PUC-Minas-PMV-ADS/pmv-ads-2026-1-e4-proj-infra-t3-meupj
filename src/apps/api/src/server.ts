import { buildApp } from './app.js';

const app = await buildApp();

const host = app.env.HOST ?? '0.0.0.0';
const port = app.env.PORT ?? 3000;

try {
  await app.listen({ host, port });
  app.log.info({ host, port }, 'API server started');
} catch (error) {
  app.log.fatal({ err: error }, 'Unable to start API server');
  await app.close();
  process.exit(1);
}
