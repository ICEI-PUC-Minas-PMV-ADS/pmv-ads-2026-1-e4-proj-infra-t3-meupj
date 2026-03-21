import type { Collection, Db, WithId } from 'mongodb';

export const CATALOG_COLLECTION_NAME = 'catalog';

export type CatalogUnitMeasure =
  | 'unit'
  | 'dozen'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'meter'
  | 'squareMeter'
  | 'kilogram'
  | 'box'
  | 'kit'
  | 'piece';

export type CatalogItem = {
  profileId: string;
  type: 'product' | 'service';
  name: string;
  description?: string;
  unitPrice: number;
  unitMeasure: CatalogUnitMeasure;
  costPrice?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CatalogStore = {
  ensureIndexes: () => Promise<void>;
  getCollection: () => Collection<CatalogItem>;
};

const indexedDatabases = new WeakSet<Db>();

const getCatalogCollection = (db: Db): Collection<CatalogItem> =>
  db.collection<CatalogItem>(CATALOG_COLLECTION_NAME);

const ensureCatalogIndexes = async (db: Db): Promise<void> => {
  if (indexedDatabases.has(db)) {
    return;
  }

  const collection = getCatalogCollection(db);

  await collection.createIndex(
    { profileId: 1 },
    {
      name: 'catalog_profileId',
    },
  );

  await collection.createIndex(
    { profileId: 1, type: 1 },
    {
      name: 'catalog_profileId_type',
    },
  );

  await collection.createIndex(
    { profileId: 1, name: 1 },
    {
      name: 'catalog_profileId_name',
    },
  );

  indexedDatabases.add(db);
};

export const createCatalogStore = (getDb: () => Db): CatalogStore => ({
  ensureIndexes: async () => {
    const db = getDb();
    await ensureCatalogIndexes(db);
  },
  getCollection: () => {
    const db = getDb();
    return getCatalogCollection(db);
  },
});