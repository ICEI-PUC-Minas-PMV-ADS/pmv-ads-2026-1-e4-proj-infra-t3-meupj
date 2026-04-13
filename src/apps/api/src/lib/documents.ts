import type { WithId } from 'mongodb';

import type { Client } from './clients.js';
import type { Order } from './orders.js';
import type { ProfileDocument } from './profile.js';
import type { Transaction } from './transactions.js';

type CommercialDocumentType = 'budget' | 'serviceOrder';

type CommercialDocumentPayload = {
  generatedAt: string;
  profile: {
    name: string | null;
    document: string | null;
    phone: string | null;
    email: string | null;
    footer: string | null;
    address: ProfileDocument['business']['address'];
  };
  client: {
    _id: string;
    name: string;
    type: Client['type'];
    document: string;
    email: string;
    phone: string;
    address: Client['address'];
  } | null;
  order: {
    _id: string;
    orderNumber: string;
    reference?: string;
    status: Order['status'];
    createdAt: string;
    updatedAt: string;
    paymentTerms?: string;
    warrantyTerms?: string;
    additionalInfo?: string;
    items: {
      catalogItemId: string;
      type: 'product' | 'service';
      name: string;
      description?: string;
      unitPrice: number;
      unitMeasure: string;
      quantity: number;
      subtotal: number;
      position: number;
    }[];
  };
  summary: {
    itemsSubtotal: number;
    discount: number;
    fees: number;
    total: number;
  };
};

export type BudgetDocumentPayload = CommercialDocumentPayload & {
  documentType: 'budget';
};

export type ServiceOrderDocumentPayload = CommercialDocumentPayload & {
  documentType: 'serviceOrder';
};

export type ReceiptDocumentPayload = {
  documentType: 'receipt';
  generatedAt: string;
  profile: {
    name: string | null;
    document: string | null;
    phone: string | null;
    email: string | null;
    footer: string | null;
    address: ProfileDocument['business']['address'];
  };
  client: {
    _id: string;
    name: string;
    type: Client['type'];
    document: string;
    email: string;
    phone: string;
    address: Client['address'];
  } | null;
  order: {
    _id: string;
    orderNumber: string;
    reference?: string;
    status: Order['status'];
  } | null;
  transaction: {
    _id: string;
    type: Transaction['type'];
    status: 'confirmed';
    paymentMethod?: Transaction['paymentMethod'];
    amount: number;
    transactionDate: string;
    dueDate?: string;
    category?: string;
    reference?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  };
  summary: {
    totalReceived: number;
  };
};

const buildCommercialDocument = <TDocumentType extends CommercialDocumentType>(
  documentType: TDocumentType,
  order: WithId<Order>,
  profile: WithId<ProfileDocument>,
  client: WithId<Client> | null,
  generatedAt: Date,
): (TDocumentType extends 'budget' ? BudgetDocumentPayload : ServiceOrderDocumentPayload) => {
  const itemsSubtotal = order.items.reduce((acc, item) => acc + item.subtotal, 0);
  const discount = order.discount ?? 0;
  const fees = order.fees ?? 0;

  return {
    documentType,
    generatedAt: generatedAt.toISOString(),
    profile: {
      name: profile.business.name,
      document: profile.business.document,
      phone: profile.business.phone,
      email: profile.business.email,
      footer: profile.business.footer,
      address: profile.business.address,
    },
    client: client
      ? {
          _id: client._id.toHexString(),
          name: client.name,
          type: client.type,
          document: client.document,
          email: client.email,
          phone: client.phone,
          address: client.address,
        }
      : null,
    order: {
      _id: order._id.toHexString(),
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        catalogItemId: item.catalogItemId,
        type: item.type,
        name: item.name,
        unitPrice: item.unitPrice,
        unitMeasure: item.unitMeasure,
        quantity: item.quantity,
        subtotal: item.subtotal,
        position: item.position,
        ...(item.description !== undefined && { description: item.description }),
      })),
      ...(order.reference !== undefined && { reference: order.reference }),
      ...(order.paymentTerms !== undefined && { paymentTerms: order.paymentTerms }),
      ...(order.warrantyTerms !== undefined && { warrantyTerms: order.warrantyTerms }),
      ...(order.additionalInfo !== undefined && { additionalInfo: order.additionalInfo }),
    },
    summary: {
      itemsSubtotal,
      discount,
      fees,
      total: order.total,
    },
  } as TDocumentType extends 'budget' ? BudgetDocumentPayload : ServiceOrderDocumentPayload;
};

export const buildBudgetDocument = (
  order: WithId<Order>,
  profile: WithId<ProfileDocument>,
  client: WithId<Client> | null,
  generatedAt = new Date(),
): BudgetDocumentPayload => {
  return buildCommercialDocument('budget', order, profile, client, generatedAt);
};

export const buildServiceOrderDocument = (
  order: WithId<Order>,
  profile: WithId<ProfileDocument>,
  client: WithId<Client> | null,
  generatedAt = new Date(),
): ServiceOrderDocumentPayload => {
  return buildCommercialDocument('serviceOrder', order, profile, client, generatedAt);
};

export const buildReceiptDocument = (
  transaction: WithId<Transaction>,
  profile: WithId<ProfileDocument>,
  client: WithId<Client> | null,
  order: WithId<Order> | null,
  generatedAt = new Date(),
): ReceiptDocumentPayload => {
  return {
    documentType: 'receipt',
    generatedAt: generatedAt.toISOString(),
    profile: {
      name: profile.business.name,
      document: profile.business.document,
      phone: profile.business.phone,
      email: profile.business.email,
      footer: profile.business.footer,
      address: profile.business.address,
    },
    client: client
      ? {
          _id: client._id.toHexString(),
          name: client.name,
          type: client.type,
          document: client.document,
          email: client.email,
          phone: client.phone,
          address: client.address,
        }
      : null,
    order: order
      ? {
          _id: order._id.toHexString(),
          orderNumber: order.orderNumber,
          status: order.status,
          ...(order.reference !== undefined && { reference: order.reference }),
        }
      : null,
    transaction: {
      _id: transaction._id.toHexString(),
      type: transaction.type,
      status: 'confirmed',
      amount: transaction.amount,
      transactionDate: transaction.transactionDate.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      ...(transaction.paymentMethod !== undefined && { paymentMethod: transaction.paymentMethod }),
      ...(transaction.dueDate !== undefined && { dueDate: transaction.dueDate.toISOString() }),
      ...(transaction.category !== undefined && { category: transaction.category }),
      ...(transaction.reference !== undefined && { reference: transaction.reference }),
      ...(transaction.notes !== undefined && { notes: transaction.notes }),
    },
    summary: {
      totalReceived: transaction.amount,
    },
  };
};