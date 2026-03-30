import { describe, expect, it, vi } from 'vitest';
import { isValidOrderStatusTransition } from '../lib/orders.js';
import { createCountersStore } from '../lib/counters.js';

describe('OrderStatus Transition Matrix', () => {
  it('allows draft to transition to pendingApproval or cancelled', () => {
    expect(isValidOrderStatusTransition('draft', 'pendingApproval')).toBe(true);
    expect(isValidOrderStatusTransition('draft', 'cancelled')).toBe(true);
    expect(isValidOrderStatusTransition('draft', 'inProgress')).toBe(false);
  });

  it('allows pendingApproval to transition to inProgress or cancelled', () => {
    expect(isValidOrderStatusTransition('pendingApproval', 'inProgress')).toBe(true);
    expect(isValidOrderStatusTransition('pendingApproval', 'cancelled')).toBe(true);
    expect(isValidOrderStatusTransition('pendingApproval', 'completed')).toBe(false);
  });

  it('allows inProgress to transition to completed, warranty or cancelled', () => {
    expect(isValidOrderStatusTransition('inProgress', 'completed')).toBe(true);
    expect(isValidOrderStatusTransition('inProgress', 'warranty')).toBe(true);
    expect(isValidOrderStatusTransition('inProgress', 'cancelled')).toBe(true);
    expect(isValidOrderStatusTransition('inProgress', 'draft')).toBe(false);
  });

  it('allows completed strictly to warranty', () => {
    expect(isValidOrderStatusTransition('completed', 'warranty')).toBe(true);
    expect(isValidOrderStatusTransition('completed', 'draft')).toBe(false);
    expect(isValidOrderStatusTransition('completed', 'cancelled')).toBe(false);
  });

  it('allows warranty to transition to completed or cancelled', () => {
    expect(isValidOrderStatusTransition('warranty', 'completed')).toBe(true);
    expect(isValidOrderStatusTransition('warranty', 'cancelled')).toBe(true);
    expect(isValidOrderStatusTransition('warranty', 'draft')).toBe(false);
  });

  it('blocks any transitions from cancelled state', () => {
    expect(isValidOrderStatusTransition('cancelled', 'draft')).toBe(false);
    expect(isValidOrderStatusTransition('cancelled', 'completed')).toBe(false);
    expect(isValidOrderStatusTransition('cancelled', 'pendingApproval')).toBe(false);
  });

  it('allows transitions to the exact same state', () => {
    expect(isValidOrderStatusTransition('draft', 'draft')).toBe(true);
    expect(isValidOrderStatusTransition('inProgress', 'inProgress')).toBe(true);
  });
});

describe('Atomic sequence generator (CountersStore)', () => {
  it('generates the correct pattern ORDYYMM###', async () => {
    const mockFindOneAndUpdate = vi.fn().mockResolvedValue({ seq: 42 });

    const mockDb: any = {
      collection: vi.fn(() => ({
        findOneAndUpdate: mockFindOneAndUpdate,
      })),
    };

    const countersStore = createCountersStore(() => mockDb);

    const profileId = 'test-profile-123';
    const orderNumber = await countersStore.generateOrderNumber(profileId);

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');

    expect(orderNumber).toBe(`ORD${yy}${mm}042`);
    expect(mockFindOneAndUpdate).toHaveBeenCalledTimes(1);

    // Checks if the correct atomic collection parameter was given
    const sequenceName = `orders_${profileId}_${yy}${mm}`;
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: sequenceName },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    );
  });
});
