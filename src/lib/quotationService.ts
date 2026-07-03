import { mockQuotations, type Quotation } from './mockData';
import type { CostEstimate } from './costEstimateData';
import { updateCostEstimate } from './costEstimateData';
import { processErpEvent } from './erpEvents';

const QUOTATIONS_KEY = 'sp2_quotations';
const ENQUIRIES_KEY = 'sp2_enquiries';

function loadQuotations(): Quotation[] {
  if (typeof window === 'undefined') return mockQuotations;
  try {
    const saved = localStorage.getItem(QUOTATIONS_KEY);
    if (!saved) {
      localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(mockQuotations));
      return mockQuotations;
    }
    return JSON.parse(saved);
  } catch {
    return mockQuotations;
  }
}

function saveQuotations(quotations: Quotation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotations));
}

export function getQuotations(): Quotation[] {
  return loadQuotations();
}

export function getQuotationById(id: string): Quotation | undefined {
  return loadQuotations().find(q => q.id === id);
}

export type PartyQuotedRate = {
  quotationId: string;
  date: string;
  totalAmount: number;
  status: Quotation['status'];
  enquiryId: string;
  customerId?: string;
  items: Quotation['items'];
};

/** All quotations for a party (customer), newest first */
export function getQuotationsForParty(customerId: string): Quotation[] {
  if (!customerId) return [];
  return loadQuotations()
    .filter(q => q.customerId === customerId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export function getPastQuotedRatesForParty(customerId: string): PartyQuotedRate[] {
  return getQuotationsForParty(customerId).map(toPartyQuotedRate);
}

/** Submitted offers = sent to customer (excludes draft quotes) */
export function getSubmittedOffers(): PartyQuotedRate[] {
  return loadQuotations()
    .filter(q => q.status !== 'Draft')
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .map(toPartyQuotedRate);
}

export function getSubmittedOffersForParty(customerId: string): PartyQuotedRate[] {
  return getQuotationsForParty(customerId)
    .filter(q => q.status !== 'Draft')
    .map(toPartyQuotedRate);
}

export function getSubmittedOffersForEnquiry(enquiryId: string): PartyQuotedRate[] {
  if (!enquiryId) return [];
  return loadQuotations()
    .filter(q => q.enquiryId === enquiryId && q.status !== 'Draft')
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(toPartyQuotedRate);
}

function toPartyQuotedRate(q: Quotation): PartyQuotedRate {
  return {
    quotationId: q.id,
    date: q.date,
    totalAmount: q.totalAmount,
    status: q.status,
    enquiryId: q.enquiryId,
    items: q.items,
    customerId: q.customerId,
  };
}

export function formatQuotedAmount(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function createQuotationFromEstimate(estimate: CostEstimate): Quotation {
  const existing = loadQuotations().find(
    q => q.enquiryId === estimate.enquiryId && estimate.enquiryId
  );
  if (existing) return existing;

  const quotations = loadQuotations();
  const unitPrice = Math.round(estimate.suggestedPrice / estimate.spec.buildQty);
  const quote: Quotation = {
    id: `QT-26-${String(quotations.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    enquiryId: estimate.enquiryId ?? '',
    customerId: estimate.customerId ?? '',
    totalAmount: estimate.suggestedPrice,
    status: 'Draft',
    items: [{
      productId: estimate.productId,
      quantity: estimate.spec.buildQty,
      unitPrice,
    }],
  };

  saveQuotations([quote, ...quotations]);
  updateCostEstimate(estimate.id, { status: 'Quoted', quotationId: quote.id } as Partial<CostEstimate>);

  if (estimate.enquiryId && typeof window !== 'undefined') {
    try {
      const enquiries = JSON.parse(localStorage.getItem(ENQUIRIES_KEY) || '[]');
      const idx = enquiries.findIndex((e: { id: string }) => e.id === estimate.enquiryId);
      if (idx !== -1 && enquiries[idx].status === 'Open') {
        enquiries[idx].status = 'Quoted';
        localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));
      }
    } catch {
      // ignore
    }
  }

  processErpEvent('manual.message', {
    enquiryId: estimate.enquiryId,
    customerId: estimate.customerId,
    totalAmount: quote.totalAmount,
    status: `Quotation ${quote.id} created from estimate ${estimate.id}`,
  });

  return quote;
}
