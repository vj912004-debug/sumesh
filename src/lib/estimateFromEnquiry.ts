import type { Enquiry } from './mockData';
import { mockProducts } from './mockData';
import {
  calculateMaterialEstimate,
  getDefaultRequirementSpec,
  type RequirementSpec,
} from './costingService';
import {
  createCostEstimate,
  getCostEstimates,
  type CostEstimate,
} from './costEstimateData';

export function inferProductFromRequirements(requirements: string): string {
  const r = requirements.toLowerCase();

  if (r.includes('10000') || r.includes('10,000') || r.includes('10 000')) return 'PROD-002';
  if (r.includes('dag-50') || r.includes('dag 50') || r.includes('dry air')) return 'PROD-003';
  if (r.includes('20 kl') || r.includes('storage tank') || r.includes('mobile tank')) return 'PROD-004';
  if (r.includes('vacuum') || r.includes('vs-500') || r.includes('vs 500')) return 'PROD-005';
  if (r.includes('6000') || r.includes('6,000') || r.includes('filtration')) return 'PROD-001';

  const modelMatch = mockProducts.find(p =>
    r.includes(p.model.toLowerCase()) || r.includes(p.name.toLowerCase())
  );
  return modelMatch?.id ?? 'PROD-001';
}

export function parseSpecFromRequirements(
  requirements: string,
  productId: string
): RequirementSpec {
  const spec = getDefaultRequirementSpec(productId);
  const r = requirements.toLowerCase();

  const lphMatch = r.match(/(\d[\d,]*)\s*lph/);
  if (lphMatch) {
    spec.capacityLph = Number(lphMatch[1].replace(/,/g, ''));
  }

  const qtyMatch = r.match(/qty\s*[:-]?\s*(\d+)|(\d+)\s*(?:unit|nos|no\.)/i);
  if (qtyMatch) {
    spec.buildQty = Number(qtyMatch[1] || qtyMatch[2]);
  }

  const micronMatch = r.match(/(\d+)\s*micron/);
  if (micronMatch) {
    spec.filterMicron = Number(micronMatch[1]);
  }

  const kwMatch = r.match(/(\d+(?:\.\d+)?)\s*kw/);
  if (kwMatch) {
    spec.heaterKw = Number(kwMatch[1]);
  }

  const mmMatch = r.match(/(\d+)\s*mm/);
  if (mmMatch) {
    spec.plateThicknessMm = Number(mmMatch[1]);
  }

  return spec;
}

export function getCostEstimateByEnquiryId(enquiryId: string): CostEstimate | undefined {
  return getCostEstimates().find(e => e.enquiryId === enquiryId);
}

export function createEstimateFromEnquiry(enquiry: Enquiry): CostEstimate {
  const existing = getCostEstimateByEnquiryId(enquiry.id);
  if (existing) return existing;

  const productId = inferProductFromRequirements(enquiry.requirements);
  const product = mockProducts.find(p => p.id === productId);
  const spec = parseSpecFromRequirements(enquiry.requirements, productId);
  const result = calculateMaterialEstimate(productId, spec);

  return createCostEstimate({
    title: `${product?.name ?? 'Build'} — ${enquiry.id}`,
    customerId: enquiry.customerId,
    enquiryId: enquiry.id,
    productId,
    requirements: enquiry.requirements,
    spec,
    materialCost: result.totalMaterialCost,
    buildCost: result.totalBuildCost,
    suggestedPrice: result.suggestedTotalPrice,
    status: 'Draft',
  });
}
