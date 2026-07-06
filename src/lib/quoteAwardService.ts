import { getMockOrders, saveMockOrders, type Order } from './mockData';
import { mockWorkOrders, type WorkOrder } from './mockData2';
import { getQuotationById } from './quotationService';
import { processErpEvent } from './erpEvents';
import { linkEstimatedBomToWorkOrders } from './quotationEstimatedBom';

const QUOTATIONS_KEY = 'sp2_quotations';
const ENQUIRIES_KEY = 'sp2_enquiries';
const WORK_ORDERS_KEY = 'mockWorkOrders';
const CLIENT_POS_KEY = 'sp2_client_po_awards';

export type AwardPoInput = {
  quotationId: string;
  clientPoNumber: string;
  clientPoDate: string;
  targetDeliveryDate?: string;
};

export type ClientPoAward = {
  id: string;
  clientPoNumber: string;
  clientPoDate: string;
  quotationId: string;
  orderId: string;
  workOrderIds: string[];
  customerId: string;
  totalAmount: number;
  awardedAt: string;
};

export type AwardPoResult = {
  clientPoNumber: string;
  orderId: string;
  workOrderIds: string[];
  quotationId: string;
};

function loadWorkOrders(): WorkOrder[] {
  if (typeof window === 'undefined') return mockWorkOrders;
  try {
    const saved = localStorage.getItem(WORK_ORDERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(mockWorkOrders));
  return mockWorkOrders;
}

function saveWorkOrders(wos: WorkOrder[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(wos));
}

function loadQuotations(): import('./mockData').Quotation[] {
  try {
    return JSON.parse(localStorage.getItem(QUOTATIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQuotations(quotes: import('./mockData').Quotation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotes));
}

function nextWoId(existing: WorkOrder[]): string {
  const nums = existing
    .map(w => w.id.match(/WO-26-(\d+)/)?.[1])
    .filter(Boolean)
    .map(n => Number(n));
  const next = nums.length ? Math.max(...nums) + 1 : 101;
  return `WO-26-${next}`;
}

function nextOrderId(orders: Order[]): string {
  const nums = orders
    .map(o => o.id.match(/SO-26-(\d+)/)?.[1])
    .filter(Boolean)
    .map(n => Number(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `SO-26-${String(next).padStart(3, '0')}`;
}

export function getClientPoAwards(): ClientPoAward[] {
  try {
    return JSON.parse(localStorage.getItem(CLIENT_POS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveClientPoAward(award: ClientPoAward): void {
  const awards = getClientPoAwards();
  localStorage.setItem(CLIENT_POS_KEY, JSON.stringify([award, ...awards]));
}

export function getAwardForQuotation(quotationId: string): ClientPoAward | undefined {
  return getClientPoAwards().find(a => a.quotationId === quotationId);
}

export function awardPoAndCreateWorkOrders(input: AwardPoInput): AwardPoResult {
  const quote = getQuotationById(input.quotationId);
  if (!quote) {
    throw new Error('Quotation not found.');
  }
  if (quote.orderId || quote.status === 'PO Awarded') {
    throw new Error(`Quotation already awarded — Sales Order ${quote.orderId}.`);
  }
  if (!input.clientPoNumber.trim()) {
    throw new Error('Client PO number is required.');
  }

  const orders = getMockOrders();
  const wos = loadWorkOrders();
  const orderId = nextOrderId(orders);
  const today = new Date().toISOString().split('T')[0];
  const deliveryDate =
    input.targetDeliveryDate ||
    new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const workOrderIds: string[] = [];
  const newWos: WorkOrder[] = [];

  for (const item of quote.items) {
    for (let unit = 0; unit < item.quantity; unit++) {
      const woId = nextWoId([...wos, ...newWos]);
      const wo: WorkOrder = {
        id: woId,
        orderId,
        productId: item.productId,
        startDate: today,
        endDate: deliveryDate,
        status: 'Material Kitting',
        progress: 5,
        quotationId: quote.id,
        clientPoNumber: input.clientPoNumber.trim(),
        quantity: 1,
      };
      newWos.push(wo);
      workOrderIds.push(woId);
    }
  }

  wos.push(...newWos);

  const order: Order = {
    id: orderId,
    date: input.clientPoDate || today,
    quotationId: quote.id,
    customerId: quote.customerId,
    status: 'In Production',
    totalAmount: quote.totalAmount,
    clientPoNumber: input.clientPoNumber.trim(),
    clientPoDate: input.clientPoDate,
    workOrderIds,
  };

  saveMockOrders([order, ...orders]);
  saveWorkOrders(wos);

  const quotes = loadQuotations();
  const qIdx = quotes.findIndex(q => q.id === quote.id);
  if (qIdx !== -1) {
    quotes[qIdx] = {
      ...quotes[qIdx],
      status: 'PO Awarded',
      orderId,
      clientPoNumber: input.clientPoNumber.trim(),
      workOrderIds,
    };
    saveQuotations(quotes);
  }

  if (quote.enquiryId) {
    try {
      const enquiries = JSON.parse(localStorage.getItem(ENQUIRIES_KEY) || '[]');
      const eIdx = enquiries.findIndex((e: { id: string }) => e.id === quote.enquiryId);
      if (eIdx !== -1) {
        enquiries[eIdx].status = 'Converted';
        localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));
      }
    } catch { /* ignore */ }
  }

  const award: ClientPoAward = {
    id: `CPO-${Date.now()}`,
    clientPoNumber: input.clientPoNumber.trim(),
    clientPoDate: input.clientPoDate,
    quotationId: quote.id,
    orderId,
    workOrderIds,
    customerId: quote.customerId,
    totalAmount: quote.totalAmount,
    awardedAt: new Date().toISOString(),
  };
  saveClientPoAward(award);

  linkEstimatedBomToWorkOrders(quote.id, workOrderIds);

  processErpEvent('manual.message', {
    enquiryId: quote.enquiryId,
    customerId: quote.customerId,
    orderId,
    status: `Client PO ${input.clientPoNumber} awarded — ${orderId} with ${workOrderIds.length} work order(s)`,
  });

  return {
    clientPoNumber: input.clientPoNumber.trim(),
    orderId,
    workOrderIds,
    quotationId: quote.id,
  };
}
