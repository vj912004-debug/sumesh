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
