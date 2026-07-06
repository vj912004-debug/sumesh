import { mockQuotations, mockProducts, type Quotation } from './mockData';
import type { CostEstimate } from './costEstimateData';
import {
  updateCostEstimate,
  getCostEstimateByQuotationId,
  getCostEstimateByEnquiryId,
} from './costEstimateData';
import {
  calculateMaterialEstimate,
  getDefaultRequirementSpec,
  type CostEstimateResult,
} from './costingService';
import { getBomForProduct } from './bomService';
import { getProductQuoteEstimate } from './plantCatalogQuote';
import type { BOM } from './mockData2';
import { sendEmail } from './communicationService';
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

export type QuotationLinePackage = {
  productId: string;
  productName: string;
  productModel: string;
  quantity: number;
  unitPrice: number;
  bom?: BOM;
  materialEstimate?: CostEstimateResult;
};

export type QuotationSendPackage = {
  quotation: Quotation;
  costEstimate?: CostEstimate;
  lines: QuotationLinePackage[];
};

/** Resolve linked cost estimate + BOM / material breakdown for each quoted line */
export function fetchQuotationSendData(quotationId: string): QuotationSendPackage | undefined {
  const quotation = getQuotationById(quotationId);
  if (!quotation) return undefined;

  const costEstimate =
    getCostEstimateByQuotationId(quotationId) ??
  (quotation.enquiryId ? getCostEstimateByEnquiryId(quotation.enquiryId) : undefined);

  const lines: QuotationLinePackage[] = quotation.items.map(item => {
    const product = mockProducts.find(p => p.id === item.productId);
    const bom = getBomForProduct(item.productId);
    const spec = costEstimate?.productId === item.productId
      ? costEstimate.spec
      : undefined;
    const materialEstimate = spec
      ? calculateMaterialEstimate(item.productId, spec)
      : bom
        ? calculateMaterialEstimate(item.productId, {
            ...getDefaultRequirementSpec(item.productId),
            buildQty: item.quantity,
          })
        : undefined;

    return {
      productId: item.productId,
      productName: product?.name ?? item.productId,
      productModel: product?.model ?? '—',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      bom,
      materialEstimate,
    };
  });

  return { quotation, costEstimate, lines };
}

export function updateQuotation(id: string, patch: Partial<Quotation>): Quotation | undefined {
  const quotations = loadQuotations();
  const idx = quotations.findIndex(q => q.id === id);
  if (idx === -1) return undefined;
  const updated = { ...quotations[idx], ...patch };
  quotations[idx] = updated;
  saveQuotations(quotations);
  return updated;
}

function buildBomAttachmentSummary(pkg: QuotationSendPackage): string {
  const parts = pkg.lines.map(line => {
    if (!line.bom) return `${line.productName}: no BOM on file`;
    const itemCount = line.bom.items.length;
    return `${line.productName} (${line.bom.id}, ${itemCount} components)`;
  });
  return parts.join('; ');
}

function buildEmailBody(
  pkg: QuotationSendPackage,
  contactPerson: string,
): string {
  const { quotation, costEstimate } = pkg;
  const bomSummary = buildBomAttachmentSummary(pkg);
  const estimateRef = costEstimate
    ? `\nPre-build estimate: ${costEstimate.id} — ${costEstimate.title}`
    : '';
  const specRef = costEstimate
    ? `\nBuild spec: ${costEstimate.spec.capacityLph} LPH, qty ${costEstimate.spec.buildQty}, ` +
      `${costEstimate.spec.filterMicron} micron, ${costEstimate.spec.heaterKw} kW heater`
    : '';

  return (
    `Dear ${contactPerson},\n\n` +
    `Please find our quotation ${quotation.id} dated ${quotation.date}.\n` +
    `Grand Total: ${formatQuotedAmount(quotation.totalAmount)} (excl. GST)\n` +
    `Enquiry Ref: ${quotation.enquiryId || '—'}${estimateRef}${specRef}\n\n` +
    `Attached documents:\n` +
    `• Quotation ${quotation.id}.pdf\n` +
    `• BOM summary: ${bomSummary}\n\n` +
    `Valid for 30 days. We look forward to your purchase order.\n\n` +
    `Sumesh Petroleum Pvt. Ltd.`
  );
}

export async function sendQuotationToClient(input: {
  quotationId: string;
  to: string;
  contactPerson: string;
}): Promise<{ quotation: Quotation; package: QuotationSendPackage }> {
  const pkg = fetchQuotationSendData(input.quotationId);
  if (!pkg) throw new Error('Quotation not found');

  const bomFiles = pkg.lines
    .filter(l => l.bom)
    .map(l => `${l.bom!.id}_${l.productModel.replace(/\s+/g, '-')}.pdf`);
  const attachments = [`${pkg.quotation.id}.pdf`, ...bomFiles].join(', ');

  await sendEmail({
    to: input.to,
    type: 'Quotation & BOM',
    subject: `Quotation ${pkg.quotation.id} with BOM — Sumesh Petroleum`,
    body: buildEmailBody(pkg, input.contactPerson),
    attachment: attachments,
    sourceRef: pkg.quotation.id,
  });

  const quotation = updateQuotation(pkg.quotation.id, { status: 'Sent' }) ?? pkg.quotation;

  processErpEvent('manual.message', {
    enquiryId: quotation.enquiryId,
    customerId: quotation.customerId,
    quotationId: quotation.id,
    bomIds: pkg.lines.map(l => l.bom?.id).filter(Boolean),
    estimateId: pkg.costEstimate?.id,
    status: `Quotation ${quotation.id} sent with BOM to ${input.to}`,
  });

  return { quotation, package: pkg };
}

function recalcTotal(items: Quotation['items']): number {
  return items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
}

/** Add a standard plant-catalog product to quotation with BOM-linked estimate price */
export function addProductToQuotation(
  quotationId: string,
  productId: string,
  quantity: number,
  unitPriceOverride?: number
): Quotation | undefined {
  const quote = getQuotationById(quotationId);
  if (!quote) return undefined;

  const est = getProductQuoteEstimate(productId, quantity);
  if (!est) return undefined;

  const unitPrice = unitPriceOverride ?? est.estimatedUnitPrice;
  const existingIdx = quote.items.findIndex(i => i.productId === productId);

  let items = [...quote.items];
  if (existingIdx >= 0) {
    items[existingIdx] = {
      ...items[existingIdx],
      quantity: items[existingIdx].quantity + quantity,
      unitPrice,
    };
  } else {
    items.push({ productId, quantity, unitPrice });
  }

  return updateQuotation(quotationId, {
    items,
    totalAmount: recalcTotal(items),
  });
}

export function removeQuotationLine(quotationId: string, lineIndex: number): Quotation | undefined {
  const quote = getQuotationById(quotationId);
  if (!quote) return undefined;
  const items = quote.items.filter((_, i) => i !== lineIndex);
  return updateQuotation(quotationId, { items, totalAmount: recalcTotal(items) });
}

export function updateQuotationLine(
  quotationId: string,
  lineIndex: number,
  patch: Partial<Quotation['items'][0]>
): Quotation | undefined {
  const quote = getQuotationById(quotationId);
  if (!quote || !quote.items[lineIndex]) return undefined;
  const items = quote.items.map((item, i) => (i === lineIndex ? { ...item, ...patch } : item));
  return updateQuotation(quotationId, { items, totalAmount: recalcTotal(items) });
}

function nextQuotationId(quotations: Quotation[]): string {
  const nums = quotations
    .map(q => q.id.match(/QT-26-(\d+)/)?.[1])
    .filter(Boolean)
    .map(n => Number(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `QT-26-${String(next).padStart(3, '0')}`;
}

/** Create a blank draft quotation — add products from Plant Catalog on the quote page */
export function createDirectQuotation(input: {
  customerId: string;
  enquiryId?: string;
}): Quotation {
  const quotations = loadQuotations();
  const quote: Quotation = {
    id: nextQuotationId(quotations),
    date: new Date().toISOString().split('T')[0],
    enquiryId: input.enquiryId?.trim() ?? '',
    customerId: input.customerId,
    totalAmount: 0,
    status: 'Draft',
    items: [],
  };
  saveQuotations([quote, ...quotations]);

  if (input.enquiryId?.trim()) {
    try {
      const enquiries = JSON.parse(localStorage.getItem(ENQUIRIES_KEY) || '[]');
      const idx = enquiries.findIndex((e: { id: string }) => e.id === input.enquiryId);
      if (idx !== -1 && enquiries[idx].status === 'Open') {
        enquiries[idx].status = 'Quoted';
        localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));
      }
    } catch { /* ignore */ }
  }

  return quote;
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
