import type { Collection, Db } from 'mongodb';

export const ORDERS_COLLECTION_NAME = 'orders';

export type OrderStatus =
  | 'draft'
  | 'pendingApproval'
  | 'inProgress'
  | 'completed'
  | 'warranty'
  | 'cancelled';

export const isValidOrderStatusTransition = (current: OrderStatus, next: OrderStatus): boolean => {
  if (current === next) {
    return true;
  }
  switch (current) {
    case 'draft':
      return next === 'pendingApproval' || next === 'cancelled';
    case 'pendingApproval':
      return next === 'inProgress' || next === 'cancelled';
    case 'inProgress':
      return next === 'completed' || next === 'warranty' || next === 'cancelled';
    case 'completed':
      return next === 'warranty';
    case 'warranty':
      return next === 'completed' || next === 'cancelled';
    case 'cancelled':
      return false;
    default:
      return false;
  }
};

export type PaymentMethod =
  | 'pix'
  | 'cash'
  | 'creditCard'
  | 'debitCard'
  | 'bankTransfer'
  | 'bankSlip';

export type OrderItemSnapshot = {
  catalogItemId: string;
  type: 'product' | 'service';
  name: string;
  description?: string;
  unitPrice: number;
  unitMeasure: string;
  quantity: number;
  subtotal: number;
  position: number;
};

export type Order = {
  profileId: string;
  clientId: string | null;
  orderNumber: string;
  reference?: string;
  status: OrderStatus;
  paymentMethods: PaymentMethod[];
  items: OrderItemSnapshot[];
  discount?: number;
  fees?: number;
  total: number;
  paymentTerms?: string;
  warrantyTerms?: string;
  additionalInfo?: string;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrdersStore = {
  ensureIndexes: () => Promise<void>;
  getCollection: () => Collection<Order>;
};

const indexedDatabases = new WeakSet<Db>();

const getOrdersCollection = (db: Db): Collection<Order> =>
  db.collection<Order>(ORDERS_COLLECTION_NAME);

const ensureOrdersIndexes = async (db: Db): Promise<void> => {
  if (indexedDatabases.has(db)) {
    return;
  }

  const collection = getOrdersCollection(db);

  await collection.createIndex(
    { profileId: 1 },
    {
      name: 'orders_profileId',
    },
  );

  await collection.createIndex(
    { profileId: 1, clientId: 1 },
    {
      name: 'orders_profileId_clientId',
    },
  );

  await collection.createIndex(
    { profileId: 1, status: 1 },
    {
      name: 'orders_profileId_status',
    },
  );

  await collection.createIndex(
    { profileId: 1, orderNumber: 1 },
    {
      name: 'orders_profileId_orderNumber',
      unique: true,
    },
  );

  indexedDatabases.add(db);
};

export const createOrdersStore = (getDb: () => Db): OrdersStore => ({
  ensureIndexes: async () => {
    const db = getDb();
    await ensureOrdersIndexes(db);
  },
  getCollection: () => {
    const db = getDb();
    return getOrdersCollection(db);
  },
});
