import { getStoredEnquiries, mockCustomers, type Quotation } from './mockData';
import { getQuotations } from './quotationService';
import type { EnquiryType } from './enquiryTypes';
import { normalizeEnquiryType } from './enquiryTypes';

export type ClientPoCategory = 'manufacturing' | 'spares' | 'service';

export type PendingClientPoRow = {
  quotationId: string;
  enquiryId: string;
  customerId: string;
  customerName: string;
  quotationDate: string;
  totalAmount: number;
  quotationStatus: Quotation['status'];
  enquiryType: EnquiryType;
  poCategory: ClientPoCategory;
  categoryLabel: string;
  daysPending: number;
  requirements: string;
};

const CATEGORY_LABELS: Record<ClientPoCategory, string> = {
  manufacturing: 'Manufacturing PO',
  spares: 'Spares PO',
  service: 'Service PO',
};

export function enquiryTypeToPoCategory(enquiryType?: string): ClientPoCategory {
  const type = normalizeEnquiryType(enquiryType);
  if (type === 'spares') return 'spares';
  if (type === 'service' || type === 'rental') return 'service';
  return 'manufacturing';
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getPendingClientPos(): PendingClientPoRow[] {
  const enquiries = getStoredEnquiries();
  const customers = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('sp2_customers') || '[]')
    : mockCustomers;

  return getQuotations()
    .filter(q => (q.status === 'Sent' || q.status === 'Accepted') && !q.orderId)
    .map(q => {
      const enquiry = enquiries.find(e => e.id === q.enquiryId);
      const enquiryType = normalizeEnquiryType(enquiry?.enquiryType);
      const poCategory = enquiryTypeToPoCategory(enquiryType);
      const customer = customers.find((c: { id: string }) => c.id === q.customerId)
        ?? mockCustomers.find(c => c.id === q.customerId);

      return {
        quotationId: q.id,
        enquiryId: q.enquiryId || '—',
        customerId: q.customerId,
        customerName: customer?.name ?? q.customerId,
        quotationDate: q.date,
        totalAmount: q.totalAmount,
        quotationStatus: q.status,
        enquiryType,
        poCategory,
        categoryLabel: CATEGORY_LABELS[poCategory],
        daysPending: daysSince(q.date),
        requirements: enquiry?.requirements ?? '—',
      };
    })
    .sort((a, b) => b.daysPending - a.daysPending || b.totalAmount - a.totalAmount);
}

export function getPendingClientPosByCategory(category: ClientPoCategory): PendingClientPoRow[] {
  return getPendingClientPos().filter(r => r.poCategory === category);
}

export function getPendingClientPoSummary() {
  const all = getPendingClientPos();
  return {
    manufacturing: all.filter(r => r.poCategory === 'manufacturing'),
    spares: all.filter(r => r.poCategory === 'spares'),
    service: all.filter(r => r.poCategory === 'service'),
    total: all.length,
    totalValue: all.reduce((s, r) => s + r.totalAmount, 0),
  };
}
