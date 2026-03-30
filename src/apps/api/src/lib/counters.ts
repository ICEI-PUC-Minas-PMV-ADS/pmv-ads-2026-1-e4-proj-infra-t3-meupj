import type { Collection, Db } from 'mongodb';

export const COUNTERS_COLLECTION_NAME = 'counters';

export type CounterSequence = {
  _id: string; // The identifier for the sequence, e.g. "orders_{profileId}"
  seq: number;
};

export type CountersStore = {
  getNextSequence: (sequenceName: string) => Promise<number>;
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
  getCollection: () => {
    const db = getDb();
    return getCountersCollection(db);
  },
});
