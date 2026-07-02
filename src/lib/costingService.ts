import { mockBOMs, mockInventory, type BOM, type BOMItem } from './mockData2';
import { mockProducts } from './mockData';

export type RequirementSpec = {
  capacityLph: number;
  buildQty: number;
  filterMicron: number;
  heaterKw: number;
  plateThicknessMm: number;
  fabricationOverheadPct: number;
  targetMarginPct: number;
};

export type MaterialLine = {
  inventoryItemId: string;
  partNumber: string;
  name: string;
  category: string;
  uom: string;
  bomQty: number;
  adjustedQty: number;
  unitCost: number;
  lineCost: number;
  stockAvailable: number;
  shortfall: number;
};

export type CostEstimateResult = {
  productId: string;
  productName: string;
  bomId?: string;
  bomStatus?: string;
  lines: MaterialLine[];
  totalMaterialCost: number;
  fabricationOverhead: number;
  totalBuildCost: number;
  suggestedUnitPrice: number;
  suggestedTotalPrice: number;
  catalogPrice: number;
  marginOnBuild: number;
  stockWarnings: number;
};

const DEFAULT_SPEC: RequirementSpec = {
  capacityLph: 6000,
  buildQty: 1,
  filterMicron: 5,
  heaterKw: 3,
  plateThicknessMm: 10,
  fabricationOverheadPct: 18,
  targetMarginPct: 25,
};

export function getDefaultRequirementSpec(productId: string): RequirementSpec {
  const product = mockProducts.find(p => p.id === productId);
  const capacityMatch = product?.model.match(/(\d+)/);
  const capacity = capacityMatch ? Number(capacityMatch[1]) : 6000;
  return { ...DEFAULT_SPEC, capacityLph: capacity };
}

export function getBomForProduct(productId: string): BOM | undefined {
  return mockBOMs.find(b => b.productId === productId);
}

function scaleQty(baseQty: number, itemId: string, spec: RequirementSpec, baseCapacity: number): number {
  const inv = mockInventory.find(i => i.id === itemId);
  if (!inv) return baseQty;

  let qty = baseQty;

  if (inv.category === 'Raw Material' || inv.partNumber.includes('PL')) {
    const capacityFactor = spec.capacityLph / baseCapacity;
    const thicknessFactor = spec.plateThicknessMm / 10;
    qty = baseQty * capacityFactor * thicknessFactor;
  }

  if (inv.partNumber.includes('FLT') || inv.name.toLowerCase().includes('filter')) {
    const micronFactor = 5 / Math.max(1, spec.filterMicron);
    qty = baseQty * micronFactor;
  }

  if (inv.partNumber.includes('HTR') || inv.name.toLowerCase().includes('heater')) {
    const heaterFactor = spec.heaterKw / 3;
    qty = baseQty * heaterFactor;
  }

  if (inv.partNumber.includes('PUMP')) {
    const capacityFactor = spec.capacityLph / baseCapacity;
    qty = baseQty * Math.max(1, Math.ceil(capacityFactor));
  }

  return Math.max(0.01, Math.round(qty * 100) / 100);
}

export function calculateMaterialEstimate(
  productId: string,
  spec: RequirementSpec,
  customItems?: BOMItem[]
): CostEstimateResult {
  const product = mockProducts.find(p => p.id === productId);
  const bom = getBomForProduct(productId);
  const items = customItems ?? bom?.items ?? [];
  const baseCapacity = getDefaultRequirementSpec(productId).capacityLph;

  const lines: MaterialLine[] = items.map(item => {
    const inv = mockInventory.find(i => i.id === item.inventoryItemId);
    const perUnitQty = scaleQty(item.quantity, item.inventoryItemId, spec, baseCapacity);
    const adjustedQty = perUnitQty * spec.buildQty;
    const unitCost = inv?.unitCost ?? 0;
    const stockAvailable = inv ? inv.stockMain + inv.stockSubcon : 0;
    const shortfall = Math.max(0, adjustedQty - stockAvailable);

    return {
      inventoryItemId: item.inventoryItemId,
      partNumber: inv?.partNumber ?? 'N/A',
      name: inv?.name ?? 'Unknown item',
      category: inv?.category ?? '—',
      uom: inv?.uom ?? '—',
      bomQty: item.quantity,
      adjustedQty,
      unitCost,
      lineCost: adjustedQty * unitCost,
      stockAvailable,
      shortfall,
    };
  });

  const totalMaterialCost = lines.reduce((sum, l) => sum + l.lineCost, 0);
  const fabricationOverhead = totalMaterialCost * (spec.fabricationOverheadPct / 100);
  const totalBuildCost = totalMaterialCost + fabricationOverhead;
  const suggestedUnitPrice = totalBuildCost * (1 + spec.targetMarginPct / 100);
  const suggestedTotalPrice = suggestedUnitPrice * spec.buildQty;
  const catalogPrice = (product?.basePrice ?? 0) * spec.buildQty;
  const marginOnBuild = suggestedTotalPrice > 0
    ? ((suggestedTotalPrice - totalBuildCost * spec.buildQty) / suggestedTotalPrice) * 100
    : 0;

  return {
    productId,
    productName: product?.name ?? productId,
    bomId: bom?.id,
    bomStatus: bom?.status,
    lines,
    totalMaterialCost,
    fabricationOverhead,
    totalBuildCost,
    suggestedUnitPrice,
    suggestedTotalPrice,
    catalogPrice,
    marginOnBuild,
    stockWarnings: lines.filter(l => l.shortfall > 0).length,
  };
}
