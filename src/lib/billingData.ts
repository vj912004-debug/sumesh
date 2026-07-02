import { getMockOrders, mockCustomers } from './mockData';

export type BillingDocType = 'PI' | 'TI';

export type BillingDocument = {
  id: string;
  type: BillingDocType;
  orderId: string;
  customerId: string;
  date: string;
  basicAmount: number;
  gstAmount: number;
  grandTotal: number;
  status: string;
  linkedPiId?: string;
  irn?: string;
  paymentStatus?: 'Unpaid' | 'Partial' | 'Paid';
};

const PI_KEY = 'sp2_proforma_invoices';
const TI_KEY = 'sp2_tax_invoices';

const seedPI: BillingDocument[] = [
  {
    id: 'PI-26-101',
    type: 'PI',
    orderId: 'SO-26-001',
    customerId: 'CUST-005',
    date: '2026-06-23',
    basicAmount: 1200000,
    gstAmount: 216000,
    grandTotal: 1416000,
    status: 'Advance Received',
    paymentStatus: 'Partial',
  },
  {
    id: 'PI-26-102',
    type: 'PI',
    orderId: 'SO-26-002',
    customerId: 'CUST-003',
    date: '2026-05-12',
    basicAmount: 2200000,
    gstAmount: 396000,
    grandTotal: 2596000,
    status: 'Sent',
    paymentStatus: 'Unpaid',
  },
];

const seedTI: BillingDocument[] = [
  {
    id: 'TI-26-201',
    type: 'TI',
    orderId: 'SO-26-003',
    customerId: 'CUST-002',
    date: '2026-06-28',
    basicAmount: 850000,
    gstAmount: 153000,
    grandTotal: 1003000,
    status: 'IRN Generated',
    linkedPiId: 'PI-26-099',
    irn: '35d3d4b655f46a9e88bb...',
    paymentStatus: 'Paid',
  },
];

function load(key: string, seed: BillingDocument[]): BillingDocument[] {
  if (typeof window === 'undefined') return seed;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : seed;
  } catch {
    return seed;
  }
}

function save(key: string, docs: BillingDocument[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(docs));
}

export function getProformaInvoices(): BillingDocument[] {
  const saved = load(PI_KEY, seedPI);
  if (typeof window !== 'undefined' && !localStorage.getItem(PI_KEY)) {
    save(PI_KEY, seedPI);
  }
  return saved;
}

export function getTaxInvoices(): BillingDocument[] {
  const saved = load(TI_KEY, seedTI);
  if (typeof window !== 'undefined' && !localStorage.getItem(TI_KEY)) {
    save(TI_KEY, seedTI);
  }
  return saved;
}

export function getProformaByOrder(orderId: string): BillingDocument | undefined {
  return getProformaInvoices().find(p => p.orderId === orderId);
}

export function getTaxInvoiceByOrder(orderId: string): BillingDocument | undefined {
  return getTaxInvoices().find(t => t.orderId === orderId);
}

export function createProformaInvoice(orderId: string): BillingDocument {
  const orders = getMockOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');

  const existing = getProformaInvoices();
  const found = existing.find(p => p.orderId === orderId);
  if (found) return found;

  const basic = order.totalAmount;
  const gst = basic * 0.18;
  const doc: BillingDocument = {
    id: `PI-26-${100 + existing.length + 1}`,
    type: 'PI',
    orderId,
    customerId: order.customerId,
    date: new Date().toISOString().split('T')[0],
    basicAmount: basic,
    gstAmount: gst,
    grandTotal: basic + gst,
    status: 'Draft',
    paymentStatus: 'Unpaid',
  };
  save(PI_KEY, [doc, ...existing]);
  return doc;
}

export function createTaxInvoice(orderId: string, linkedPiId?: string): BillingDocument {
  const orders = getMockOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');

  const existing = getTaxInvoices();
  const found = existing.find(t => t.orderId === orderId);
  if (found) return found;

  const pi = linkedPiId || getProformaByOrder(orderId)?.id;
  const basic = order.totalAmount;
  const gst = basic * 0.18;
  const doc: BillingDocument = {
    id: `TI-26-${200 + existing.length + 1}`,
    type: 'TI',
    orderId,
    customerId: order.customerId,
    date: new Date().toISOString().split('T')[0],
    basicAmount: basic,
    gstAmount: gst,
    grandTotal: basic + gst,
    status: 'Draft (Awaiting IRN)',
    linkedPiId: pi,
    paymentStatus: 'Unpaid',
  };
  save(TI_KEY, [doc, ...existing]);
  return doc;
}

export function getCustomerName(customerId: string): string {
  return mockCustomers.find(c => c.id === customerId)?.name || 'Customer';
}
