import type { Collection, Db, WithId } from 'mongodb';

export const PROFILE_COLLECTION_NAME = 'profile';

type NullableString = string | null;

export type ProfileBusinessAddress = {
  zipCode: NullableString;
  street: NullableString;
  number: NullableString;
  complement: NullableString;
  district: NullableString;
  city: NullableString;
  state: NullableString;
  country: NullableString;
};

export type ProfileBusiness = {
  name: NullableString;
  document: NullableString;
  phone: NullableString;
  email: NullableString;
  logo: NullableString;
  color: NullableString;
  footer: NullableString;
  address: ProfileBusinessAddress;
};

export type ProfileDocument = {
  authUserId: string;
  business: ProfileBusiness;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicProfile = {
  business: ProfileBusiness;
  createdAt: string;
  updatedAt: string;
};

export type ProfileStore = {
  ensureIndexes: () => Promise<void>;
  getByAuthUserId: (authUserId: string) => Promise<WithId<ProfileDocument> | null>;
  ensureByAuthUserId: (authUserId: string) => Promise<WithId<ProfileDocument>>;
};

const indexedDatabases = new WeakSet<Db>();

const createEmptyBusinessAddress = (): ProfileBusinessAddress => ({
  zipCode: null,
  street: null,
  number: null,
  complement: null,
  district: null,
  city: null,
  state: null,
  country: null,
});

const createEmptyBusiness = (): ProfileBusiness => ({
  name: null,
  document: null,
  phone: null,
  email: null,
  logo: null,
  color: null,
  footer: null,
  address: createEmptyBusinessAddress(),
});

const cloneBusiness = (business: ProfileBusiness): ProfileBusiness => ({
  ...business,
  address: { ...business.address },
});

const createDefaultProfile = (authUserId: string, now = new Date()): ProfileDocument => ({
  authUserId,
  business: createEmptyBusiness(),
  createdAt: now,
  updatedAt: now,
});

const getProfileCollection = (db: Db): Collection<ProfileDocument> =>
  db.collection<ProfileDocument>(PROFILE_COLLECTION_NAME);

const ensureProfileIndexes = async (db: Db): Promise<void> => {
  if (indexedDatabases.has(db)) {
    return;
  }

  const collection = getProfileCollection(db);

  await collection.createIndex(
    { authUserId: 1 },
    {
      unique: true,
      name: 'profile_authUserId_unique',
    },
  );

  indexedDatabases.add(db);
};

export const createProfileStore = (getDb: () => Db): ProfileStore => ({
  ensureIndexes: async () => {
    const db = getDb();
    await ensureProfileIndexes(db);
  },
  getByAuthUserId: async (authUserId: string) => {
    const db = getDb();
    await ensureProfileIndexes(db);

    return getProfileCollection(db).findOne({ authUserId });
  },
  ensureByAuthUserId: async (authUserId: string) => {
    const db = getDb();
    await ensureProfileIndexes(db);

    const collection = getProfileCollection(db);

    await collection.updateOne(
      { authUserId },
      {
        $setOnInsert: createDefaultProfile(authUserId),
      },
      { upsert: true },
    );

    const profile = await collection.findOne({ authUserId });

    if (!profile) {
      throw new Error('Failed to load profile after upsert');
    }

    return profile;
  },
});

export const toPublicProfile = (profile: WithId<ProfileDocument>): PublicProfile => ({
  business: cloneBusiness(profile.business),
  createdAt: profile.createdAt.toISOString(),
  updatedAt: profile.updatedAt.toISOString(),
});
