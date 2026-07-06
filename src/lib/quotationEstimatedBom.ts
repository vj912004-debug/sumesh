import { loadInventory } from './woMaterialIssue';

const STORAGE_KEY = 'sp2_quotation_estimated_bom';

export type QuotationBomLine = {
  id: string;
  inventoryItemId: string;
  itemName: string;
  partNumber: string;
  quantity: number;
  uom: string;
  unitRate: number;
};

export type QuotationEstimatedBom = {
  quotationId: string;
  lines: QuotationBomLine[];
  totalEstimatedCost: number;
  approved: boolean;
  linkedWoIds: string[];
  lastUpdated: string;
};

function lineCost(line: QuotationBomLine): number {
  return line.quantity * line.unitRate;
}

function recalcTotal(lines: QuotationBomLine[]): number {
  return lines.reduce((s, l) => s + lineCost(l), 0);
}

function emptyBom(quotationId: string): QuotationEstimatedBom {
  return {
    quotationId,
    lines: [],
    totalEstimatedCost: 0,
    approved: false,
    linkedWoIds: [],
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

export function loadAllQuotationBoms(): QuotationEstimatedBom[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(boms: QuotationEstimatedBom[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boms));
}

export function getQuotationEstimatedBom(quotationId: string): QuotationEstimatedBom {
  return loadAllQuotationBoms().find(b => b.quotationId === quotationId) ?? emptyBom(quotationId);
}

function persist(bom: QuotationEstimatedBom): QuotationEstimatedBom {
  const all = loadAllQuotationBoms().filter(b => b.quotationId !== bom.quotationId);
  const updated = {
    ...bom,
    totalEstimatedCost: recalcTotal(bom.lines),
    lastUpdated: new Date().toISOString().split('T')[0],
  };
  saveAll([...all, updated]);
  return updated;
}

export function addQuotationBomLine(
  quotationId: string,
  inventoryItemId: string,
  quantity: number
): QuotationEstimatedBom {
  const inv = loadInventory().find(i => i.id === inventoryItemId);
  if (!inv) throw new Error('Item not found in catalog.');

  const bom = getQuotationEstimatedBom(quotationId);
  const existing = bom.lines.find(l => l.inventoryItemId === inventoryItemId);
  if (existing) {
    existing.quantity += quantity;
    existing.unitRate = inv.unitCost;
  } else {
    bom.lines.push({
      id: `QBL-${Date.now()}`,
      inventoryItemId,
      itemName: inv.name,
      partNumber: inv.partNumber,
      quantity,
      uom: inv.uom,
      unitRate: inv.unitCost,
    });
  }
  bom.approved = false;
  return persist(bom);
}

export function updateQuotationBomLine(
  quotationId: string,
  lineId: string,
  patch: Partial<Pick<QuotationBomLine, 'quantity' | 'unitRate'>>
): QuotationEstimatedBom {
  const bom = getQuotationEstimatedBom(quotationId);
  const line = bom.lines.find(l => l.id === lineId);
  if (!line) throw new Error('BOM line not found.');
  if (patch.quantity != null) line.quantity = patch.quantity;
  if (patch.unitRate != null) line.unitRate = patch.unitRate;
  bom.approved = false;
  return persist(bom);
}

export function replaceQuotationBomLine(
  quotationId: string,
  lineId: string,
  newInventoryItemId: string,
  quantity?: number
): QuotationEstimatedBom {
  const inv = loadInventory().find(i => i.id === newInventoryItemId);
  if (!inv) throw new Error('Item not found in catalog.');

  const bom = getQuotationEstimatedBom(quotationId);
  const idx = bom.lines.findIndex(l => l.id === lineId);
  if (idx === -1) throw new Error('BOM line not found.');

  bom.lines[idx] = {
    id: bom.lines[idx].id,
    inventoryItemId: newInventoryItemId,
    itemName: inv.name,
    partNumber: inv.partNumber,
    quantity: quantity ?? bom.lines[idx].quantity,
    uom: inv.uom,
    unitRate: inv.unitCost,
  };
  bom.approved = false;
  return persist(bom);
}

export function removeQuotationBomLine(quotationId: string, lineId: string): QuotationEstimatedBom {
  const bom = getQuotationEstimatedBom(quotationId);
  bom.lines = bom.lines.filter(l => l.id !== lineId);
  bom.approved = false;
  return persist(bom);
}

export function approveQuotationEstimatedBom(quotationId: string): QuotationEstimatedBom {
  const bom = getQuotationEstimatedBom(quotationId);
  if (bom.lines.length === 0) throw new Error('Add at least one BOM line before approving.');
  bom.approved = true;
  return persist(bom);
}

/** Copy approved estimated BOM to WOs as planned consumption baseline */
export function linkEstimatedBomToWorkOrders(quotationId: string, workOrderIds: string[]): void {
  const bom = getQuotationEstimatedBom(quotationId);
  if (bom.lines.length === 0) return;

  const PLANNED_KEY = 'sp2_wo_planned_bom';
  let planned: Array<{ woId: string; quotationId: string; lines: QuotationBomLine[] }> = [];
  try {
    planned = JSON.parse(localStorage.getItem(PLANNED_KEY) || '[]');
  } catch { /* ignore */ }

  for (const woId of workOrderIds) {
    planned = planned.filter(p => p.woId !== woId);
    planned.push({
      woId,
      quotationId,
      lines: bom.lines.map(l => ({ ...l, id: `${l.id}-${woId}` })),
    });
  }

  bom.linkedWoIds = workOrderIds;
  bom.approved = true;
  persist(bom);
  localStorage.setItem(PLANNED_KEY, JSON.stringify(planned));
}

export function getPlannedBomForWo(woId: string): QuotationBomLine[] {
  try {
    const planned = JSON.parse(localStorage.getItem('sp2_wo_planned_bom') || '[]');
    return planned.find((p: { woId: string }) => p.woId === woId)?.lines ?? [];
  } catch {
    return [];
  }
}
