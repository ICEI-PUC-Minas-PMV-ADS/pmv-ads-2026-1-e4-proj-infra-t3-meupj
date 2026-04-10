import type { WithId } from 'mongodb';

import type { Client } from './clients.js';
import type { Order } from './orders.js';
import type { ProfileDocument } from './profile.js';

export type BudgetDocumentPayload = {
  documentType: 'budget';
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

export const buildBudgetDocument = (
  order: WithId<Order>,
  profile: WithId<ProfileDocument>,
  client: WithId<Client> | null,
  generatedAt = new Date(),
): BudgetDocumentPayload => {
  const itemsSubtotal = order.items.reduce((acc, item) => acc + item.subtotal, 0);
  const discount = order.discount ?? 0;
  const fees = order.fees ?? 0;

  return {
    documentType: 'budget',
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
  };
};