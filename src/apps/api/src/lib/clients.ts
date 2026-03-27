import type { Collection, Db, WithId } from 'mongodb';

export const CLIENTS_COLLECTION_NAME = 'clientes';

export type PersonType = 'fisica' | 'juridica';

export type ClientAddress = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais?: string;
};

export type Client = {
  profileId: string;
  nome: string;
  tipoPessoa: PersonType;
  documento: string;
  email: string;
  telefone: string;
  origem?: string;
  aniversario?: string;
  anotacoes?: string;
  endereco: ClientAddress;
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
    { profileId: 1, nome: 1 },
    {
      name: 'clients_profileId_nome',
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
