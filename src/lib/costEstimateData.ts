import type { RequirementSpec } from './costingService';

export type CostEstimate = {
  id: string;
  date: string;
  title: string;
  customerId?: string;
  enquiryId?: string;
  productId: string;
  requirements: string;
  spec: RequirementSpec;
  materialCost: number;
  buildCost: number;
  suggestedPrice: number;
  status: 'Draft' | 'Reviewed' | 'Approved' | 'Quoted';
  quotationId?: string;
};

const STORAGE_KEY = 'sp2_cost_estimates';

const seed: CostEstimate[] = [
  {
    id: 'EST-26-001',
    date: '2026-06-22',
    title: '6000 LPH Filtration Plant — Substation',
    customerId: 'CUST-001',
    enquiryId: 'ENQ-2026-001',
    productId: 'PROD-001',
    requirements: '6000 LPH plant, 5 micron filtration, IS2062 10mm fabrication, single unit.',
    spec: {
      capacityLph: 6000,
      buildQty: 1,
      filterMicron: 5,
      heaterKw: 3,
      plateThicknessMm: 10,
      fabricationOverheadPct: 18,
      targetMarginPct: 25,
    },
    materialCost: 152300,
    buildCost: 179714,
    suggestedPrice: 224643,
    status: 'Reviewed',
  },
  {
    id: 'EST-26-002',
    date: '2026-06-26',
    title: 'DAG-50 Dry Air Generator',
    customerId: 'CUST-003',
    enquiryId: 'ENQ-2026-002',
    productId: 'PROD-003',
    requirements: 'DAG-50 for Rajasthan site, standard heater and valve package.',
    spec: {
      capacityLph: 50,
      buildQty: 1,
      filterMicron: 5,
      heaterKw: 3,
      plateThicknessMm: 8,
      fabricationOverheadPct: 15,
      targetMarginPct: 22,
    },
    materialCost: 48500,
    buildCost: 55775,
    suggestedPrice: 67945,
    status: 'Draft',
  },
];

function load(): CostEstimate[] {
  if (typeof window === 'undefined') return seed;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(saved);
  } catch {
    return seed;
  }
}

function save(estimates: CostEstimate[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));
}

export function getCostEstimates(): CostEstimate[] {
  return load();
}

export function getCostEstimateById(id: string): CostEstimate | undefined {
  return load().find(e => e.id === id);
}

export function getCostEstimateByQuotationId(quotationId: string): CostEstimate | undefined {
  return load().find(e => e.quotationId === quotationId);
}

export function getCostEstimateByEnquiryId(enquiryId: string): CostEstimate | undefined {
  if (!enquiryId) return undefined;
  return load().find(e => e.enquiryId === enquiryId);
}

export function createCostEstimate(
  data: Omit<CostEstimate, 'id' | 'date'>
): CostEstimate {
  const existing = load();
  const doc: CostEstimate = {
    ...data,
    id: `EST-26-${String(existing.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
  };
  save([doc, ...existing]);
  return doc;
}

export function updateCostEstimate(id: string, patch: Partial<CostEstimate>): CostEstimate | undefined {
  const existing = load();
  const idx = existing.findIndex(e => e.id === id);
  if (idx === -1) return undefined;
  const updated = { ...existing[idx], ...patch };
  existing[idx] = updated;
  save(existing);
  return updated;
}
