import type { Collection, Db } from 'mongodb';

export const COUNTERS_COLLECTION_NAME = 'counters';

export type CounterSequence = {
  _id: string; // The identifier for the sequence, e.g. "orders_{profileId}"
  seq: number;
};

export type CountersStore = {
  getNextSequence: (sequenceName: string) => Promise<number>;
  generateOrderNumber: (profileId: string) => Promise<string>;
  getCollection: () => Collection<CounterSequence>;
};

const getCountersCollection = (db: Db): Collection<CounterSequence> =>
  db.collection<CounterSequence>(COUNTERS_COLLECTION_NAME);

export const createCountersStore = (getDb: () => Db): CountersStore => ({
  getNextSequence: async (sequenceName: string) => {
    const db = getDb();
    const collection = getCountersCollection(db);

    const result = await collection.findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    );

    if (!result || result.seq === undefined) {
      throw new Error(`Failed to generate sequence for ${sequenceName}`);
    }

    return result.seq;
  },
  generateOrderNumber: async (profileId: string) => {
    const db = getDb();
    const collection = getCountersCollection(db);

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yymm = `${yy}${mm}`;
    const sequenceName = `orders_${profileId}_${yymm}`;

    const result = await collection.findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    );

    if (!result || result.seq === undefined) {
      throw new Error(`Failed to generate sequence for ${sequenceName}`);
    }

    return `ORD${yymm}${String(result.seq).padStart(3, '0')}`;
  },
  getCollection: () => {
    const db = getDb();
    return getCountersCollection(db);
  },
});
