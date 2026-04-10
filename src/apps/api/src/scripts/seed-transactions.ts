import { existsSync, readFileSync } from 'node:fs';
import { MongoClient } from 'mongodb';

const envFilePath = new URL('../../.env', import.meta.url);

const parseEnvFile = (path: URL): Record<string, string> => {
  if (!existsSync(path)) {
    return {};
  }

  const content = readFileSync(path, 'utf8');
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'))
      .map((line) => {
        const [key, ...rest] = line.split('=');
        return [key, rest.join('=')];
      }),
  );
};

const envOverrides = parseEnvFile(envFilePath);

const parseArg = (name: string): string | undefined => {
  const match = process.argv.slice(2).find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.split('=')[1] : undefined;
};

const uri = parseArg('uri') ?? process.env.MONGODB_URI ?? envOverrides.MONGODB_URI;
const dbName = parseArg('db') ?? process.env.MONGODB_DB_NAME ?? envOverrides.MONGODB_DB_NAME;

if (!uri) {
  throw new Error('Environment variable MONGODB_URI is required');
}

const client = new MongoClient(uri, {
  retryWrites: true,
  retryReads: true,
});

const resolveDbName = (uri: string, fallback?: string): string => {
  if (fallback && fallback.trim().length > 0) {
    return fallback;
  }

  try {
    const parsed = new URL(uri);
    const pathname = parsed.pathname.replace(/^\//, '').trim();
    if (pathname.length > 0) {
      return pathname;
    }
  } catch {
    // ignore
  }

  return 'meupj';
};

const transactions = [
  {
    profileId: 'seed-profile-1',
    type: 'income' as const,
    status: 'pending' as const,
    amount: 1200,
    transactionDate: new Date(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    category: 'Serviço',
    paymentMethod: 'pix' as const,
    reference: 'Seed income transaction',
    notes: 'Mock revenue transaction for schema validation',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    profileId: 'seed-profile-1',
    type: 'expense' as const,
    status: 'pending' as const,
    amount: 450,
    transactionDate: new Date(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    category: 'Custo operacional',
    paymentMethod: 'cash' as const,
    clientId: 'seed-client-1',
    reference: 'Seed expense transaction',
    notes: 'Mock expense transaction for schema validation',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const main = async (): Promise<void> => {
  await client.connect();
  const databaseName = resolveDbName(uri, dbName);
  const db = client.db(databaseName);
  const collection = db.collection('transactions');

  console.log(`Connected to MongoDB database: ${databaseName}`);
  console.log('Inserting mock transactions...');

  const insertResult = await collection.insertMany(transactions);

  console.log(`Inserted ${insertResult.insertedCount} documents into transactions.`);

  const indexes = await collection.indexes();
  console.log('Existing transaction indexes:');
  indexes.forEach((index) => console.log(` - ${index.name}`));
};

main()
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await client.close();
  });
