import { mockProducts } from './mockData';
import { mockInventory, type InventoryItem } from './mockData2';
import { getBomForProduct } from './bomService';
import {
  calculateMaterialEstimate,
  getDefaultRequirementSpec,
  type CostEstimateResult,
} from './costingService';
import type { BOM } from './mockData2';

export type CatalogProductOption = {
  value: string;
  label: string;
  sublabel: string;
  searchText: string;
};

export type ProductQuoteEstimate = {
  productId: string;
  productName: string;
  productModel: string;
  quantity: number;
  catalogUnitPrice: number;
  estimatedUnitPrice: number;
  estimatedLineTotal: number;
  bom?: BOM;
  materialEstimate?: CostEstimateResult;
  priceSource: 'bom-estimate' | 'catalog';
};

export function getCatalogProductOptions(): CatalogProductOption[] {
  return mockProducts.map(p => ({
    value: p.id,
    label: p.name,
    sublabel: p.model,
    searchText: `${p.id} ${p.category} ${p.name} ${p.model}`,
  }));
}

export function getInventoryItemOptions(excludeIds?: string[]): CatalogProductOption[] {
  return mockInventory
    .filter(inv => !excludeIds?.includes(inv.id))
    .map(inv => inventoryToOption(inv));
}

export function inventoryToOption(inv: InventoryItem): CatalogProductOption {
  return {
    value: inv.id,
    label: inv.name,
    sublabel: inv.partNumber,
    searchText: `${inv.id} ${inv.partNumber} ${inv.name} ${inv.category}`,
  };
}

export function getProductQuoteEstimate(productId: string, quantity = 1): ProductQuoteEstimate | undefined {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) return undefined;

  const bom = getBomForProduct(productId);
  const spec = { ...getDefaultRequirementSpec(productId), buildQty: quantity };
  const materialEstimate = bom
    ? calculateMaterialEstimate(productId, spec)
    : undefined;

  const estimatedUnitPrice = materialEstimate?.suggestedUnitPrice ?? product.basePrice;
  const hasBomEstimate = !!bom && !!materialEstimate;

  return {
    productId,
    productName: product.name,
    productModel: product.model,
    quantity,
    catalogUnitPrice: product.basePrice,
    estimatedUnitPrice: Math.round(estimatedUnitPrice),
    estimatedLineTotal: Math.round(estimatedUnitPrice * quantity),
    bom,
    materialEstimate,
    priceSource: hasBomEstimate ? 'bom-estimate' : 'catalog',
  };
}
