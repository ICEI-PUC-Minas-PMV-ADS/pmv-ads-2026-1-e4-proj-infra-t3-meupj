import type { Collection, Db } from 'mongodb';
import type { PaymentMethod } from './orders.js';

export const TRANSACTIONS_COLLECTION_NAME = 'transactions';

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'confirmed' | 'cancelled';

export type Transaction = {
  profileId: string;
  orderId?: string;
  clientId?: string;
  type: TransactionType;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  amount: number;
  transactionDate: Date;
  dueDate?: Date;
  category?: string;
  reference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TransactionsStore = {
  ensureIndexes: () => Promise<void>;
  getCollection: () => Collection<Transaction>;
};

const indexedDatabases = new WeakSet<Db>();

const getTransactionsCollection = (db: Db): Collection<Transaction> =>
  db.collection<Transaction>(TRANSACTIONS_COLLECTION_NAME);

const ensureTransactionsIndexes = async (db: Db): Promise<void> => {
  if (indexedDatabases.has(db)) {
    return;
  }

  const collection = getTransactionsCollection(db);

  await collection.createIndex(
    { profileId: 1 },
    {
      name: 'transactions_profileId',
    },
  );

  await collection.createIndex(
    { profileId: 1, orderId: 1 },
    {
      name: 'transactions_profileId_orderId',
      sparse: true,
    },
  );

  await collection.createIndex(
    { profileId: 1, transactionDate: 1 },
    {
      name: 'transactions_profileId_transactionDate',
    },
  );

  await collection.createIndex(
    { profileId: 1, type: 1 },
    {
      name: 'transactions_profileId_type',
    },
  );

  await collection.createIndex(
    { profileId: 1, status: 1 },
    {
      name: 'transactions_profileId_status',
    },
  );

  await collection.createIndex(
    { profileId: 1, clientId: 1 },
    {
      name: 'transactions_profileId_clientId',
      sparse: true,
    },
  );

  indexedDatabases.add(db);
};

export const createTransactionsStore = (getDb: () => Db): TransactionsStore => ({
  ensureIndexes: async () => {
    const db = getDb();
    await ensureTransactionsIndexes(db);
  },
  getCollection: () => {
    const db = getDb();
    return getTransactionsCollection(db);
  },
});
