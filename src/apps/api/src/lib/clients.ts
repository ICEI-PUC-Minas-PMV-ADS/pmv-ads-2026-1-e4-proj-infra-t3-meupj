import type { Collection, Db, WithId } from 'mongodb';

export const CLIENTS_COLLECTION_NAME = 'clientes';

export type PersonType = 'individual' | 'company';

export type ClientAddress = {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country?: string;
};

export type Client = {
  profileId: string;
  name: string;
  type: PersonType;
  document: string;
  email: string;
  phone: string;
  origin?: string;
  birthDate?: string;
  notes?: string;
  address: ClientAddress;
  createdAt: Date;
  updatedAt: Date;
};

export type ClientStore = {
  ensureIndexes: () => Promise<void>;
  getCollection: () => Collection<Client>;
};

const indexedDatabases = new WeakSet<Db>();

const getClientsCollection = (db: Db): Collection<Client> =>
  db.collection<Client>(CLIENTS_COLLECTION_NAME);

const ensureClientsIndexes = async (db: Db): Promise<void> => {
  if (indexedDatabases.has(db)) {
    return;
  }

  const collection = getClientsCollection(db);

  await collection.createIndex(
    { profileId: 1 },
    {
      name: 'clients_profileId',
    },
  );

  await collection.createIndex(
    { profileId: 1, name: 1 },
    {
      name: 'clients_profileId_name',
    },
  );

  await collection.createIndex(
    { profileId: 1, documento: 1 },
    {
      name: 'clients_profileId_documento',
      unique: true,
      sparse: true,
    },
  );

  await collection.createIndex(
    { profileId: 1, email: 1 },
    {
      name: 'clients_profileId_email',
      sparse: true,
    },
  );

  indexedDatabases.add(db);
};

export const createClientsStore = (getDb: () => Db): ClientStore => ({
  ensureIndexes: async () => {
    const db = getDb();
    await ensureClientsIndexes(db);
  },
  getCollection: () => {
    const db = getDb();
    return getClientsCollection(db);
  },
});
