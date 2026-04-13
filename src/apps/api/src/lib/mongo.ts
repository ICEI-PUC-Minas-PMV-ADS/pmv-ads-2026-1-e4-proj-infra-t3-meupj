import type { FastifyBaseLogger } from 'fastify';
import { Db, MongoClient } from 'mongodb';

const INITIAL_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 30_000;
const HEALTHCHECK_INTERVAL_MS = 15_000;

export type MongoConnectionState = 'idle' | 'connecting' | 'connected' | 'degraded';

export type MongoStatus = {
  state: MongoConnectionState;
  lastError: string | null;
};

export type MongoConnectionOptions = {
  uri: string;
  dbName?: string;
  logger: FastifyBaseLogger;
};

export type MongoService = {
  initialize: (options: MongoConnectionOptions) => Promise<void>;
  isHealthy: () => boolean;
  getStatus: () => MongoStatus;
  getClient: () => MongoClient;
  getDb: () => Db;
  close: () => Promise<void>;
};

type RuntimeState = {
  uri: string | null;
  dbName: string | null;
  logger: FastifyBaseLogger | null;
  client: MongoClient | null;
  db: Db | null;
  state: MongoConnectionState;
  lastError: Error | null;
  retryDelayMs: number;
  reconnectTimer: NodeJS.Timeout | null;
  healthcheckTimer: NodeJS.Timeout | null;
};

const runtime: RuntimeState = {
  uri: null,
  dbName: null,
  logger: null,
  client: null,
  db: null,
  state: 'idle',
  lastError: null,
  retryDelayMs: INITIAL_RETRY_DELAY_MS,
  reconnectTimer: null,
  healthcheckTimer: null,
};

const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(String(error));
};

const resolveDbName = (uri: string, dbName?: string): string => {
  if (dbName && dbName.trim().length > 0) {
    return dbName;
  }

  try {
    const parsedUri = new URL(uri);
    const pathname = parsedUri.pathname.replace(/^\//, '').trim();

    if (pathname.length > 0) {
      return pathname;
    }
  } catch {
    // URL parsing is only a convenience fallback.
  }

  return 'meupj';
};

const clearReconnectTimer = (): void => {
  if (!runtime.reconnectTimer) {
    return;
  }

  clearTimeout(runtime.reconnectTimer);
  runtime.reconnectTimer = null;
};

const clearHealthcheckTimer = (): void => {
  if (!runtime.healthcheckTimer) {
    return;
  }

  clearInterval(runtime.healthcheckTimer);
  runtime.healthcheckTimer = null;
};

const closeClient = async (): Promise<void> => {
  if (!runtime.client) {
    runtime.db = null;
    return;
  }

  try {
    await runtime.client.close();
  } catch (error) {
    runtime.logger?.warn({ err: normalizeError(error) }, 'Error while closing MongoDB client');
  }

  runtime.client = null;
  runtime.db = null;
};

const scheduleReconnect = (): void => {
  if (!runtime.logger || !runtime.uri || runtime.reconnectTimer) {
    return;
  }

  const delay = runtime.retryDelayMs;
  runtime.logger.warn({ delayMs: delay }, 'Scheduling MongoDB reconnection attempt');

  runtime.reconnectTimer = setTimeout(() => {
    runtime.reconnectTimer = null;
    void connect();
  }, delay);

  runtime.reconnectTimer.unref();
  runtime.retryDelayMs = Math.min(runtime.retryDelayMs * 2, MAX_RETRY_DELAY_MS);
};

const connect = async (): Promise<void> => {
  if (!runtime.logger || !runtime.uri) {
    throw new Error('MongoDB runtime is not initialized');
  }

  if (runtime.state === 'connecting') {
    return;
  }

  runtime.state = 'connecting';
  clearReconnectTimer();

  try {
    runtime.client ??= new MongoClient(runtime.uri, {
      retryReads: true,
      retryWrites: true,
      serverSelectionTimeoutMS: 5_000,
    });

    await runtime.client.connect();

    const targetDbName = resolveDbName(runtime.uri, runtime.dbName ?? undefined);
    runtime.db = runtime.client.db(targetDbName);
    await runtime.db.command({ ping: 1 });

    runtime.state = 'connected';
    runtime.lastError = null;
    runtime.retryDelayMs = INITIAL_RETRY_DELAY_MS;
    runtime.logger.info({ dbName: targetDbName }, 'MongoDB connection established');
  } catch (error) {
    const normalizedError = normalizeError(error);
    runtime.lastError = normalizedError;
    runtime.state = 'degraded';
    runtime.logger.error({ err: normalizedError }, 'MongoDB connection failed');
    await closeClient();
    scheduleReconnect();
  }
};

const startHealthcheck = (): void => {
  if (runtime.healthcheckTimer) {
    return;
  }

  runtime.healthcheckTimer = setInterval(() => {
    void (async () => {
      if (runtime.state !== 'connected' || !runtime.db) {
        return;
      }

      try {
        await runtime.db.command({ ping: 1 });
      } catch (error) {
        const normalizedError = normalizeError(error);
        runtime.lastError = normalizedError;
        runtime.state = 'degraded';
        runtime.logger?.error(
          { err: normalizedError },
          'MongoDB ping failed; entering degraded state',
        );
        await closeClient();
        scheduleReconnect();
      }
    })();
  }, HEALTHCHECK_INTERVAL_MS);

  runtime.healthcheckTimer.unref();
};

const initialize = async (options: MongoConnectionOptions): Promise<void> => {
  runtime.uri = options.uri;
  runtime.dbName = options.dbName ?? null;
  runtime.logger = options.logger;

  await connect();
  startHealthcheck();
};

const getClient = (): MongoClient => {
  if (!runtime.client || runtime.state !== 'connected') {
    throw new Error('MongoDB client is not connected');
  }

  return runtime.client;
};

const getDb = (): Db => {
  if (!runtime.db || runtime.state !== 'connected') {
    throw new Error('MongoDB database is not connected');
  }

  return runtime.db;
};

const isHealthy = (): boolean => runtime.state === 'connected' && runtime.db !== null;

const getStatus = (): MongoStatus => ({
  state: runtime.state,
  lastError: runtime.lastError?.message ?? null,
});

const close = async (): Promise<void> => {
  clearReconnectTimer();
  clearHealthcheckTimer();
  await closeClient();
  runtime.state = 'idle';
};

export const mongoService: MongoService = {
  initialize,
  isHealthy,
  getStatus,
  getClient,
  getDb,
  close,
};
