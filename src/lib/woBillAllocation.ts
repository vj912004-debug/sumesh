import { mockInventory } from '@/lib/mockData2';

export type WoBillingStatus = 'Pending' | 'Partially Billed' | 'Fully Billed';

export type WoMaterialRequirement = {
  woId: string;
  orderId: string;
  itemCode: string;
  itemName: string;
  sanctionedQty: number;
  billedQty: number;
  billingStatus: WoBillingStatus;
  woStartDate: string;
  siteCode: string;
  woProductionStatus: string;
};

export type PurchaseBillInput = {
  billRef: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  vendorName: string;
  billDate: string;
  siteCode?: string;
  poRef?: string;
  /** Step 1: PO raised with WO reference */
  woRef?: string;
  /** Allow booking beyond sanctioned qty (approval override) */
  approvalOverride?: boolean;
};

export type WoAllocationLine = {
  woNumber: string;
  itemCode: string;
  itemName: string;
  qtyBilled: number;
  balanceQtyRemaining: number;
  billReference: string;
  matchMethod: 'wo-tag' | 'fifo' | 'approval-override';
};

export type WoAllocationAuditEntry = {
  id: string;
  timestamp: string;
  billRef: string;
  itemCode: string;
  itemName: string;
  vendorName: string;
  billDate: string;
  quantityPurchased: number;
  allocations: WoAllocationLine[];
  excessQty: number;
  logic: string;
  poRef?: string;
  woRef?: string;
};

export type WoAllocationResult = {
  allocations: WoAllocationLine[];
  excessQty: number;
  totalAllocated: number;
  requiresApproval: boolean;
  approvalMessage?: string;
  splitAcrossWoCount: number;
  logicSummary: string;
  canBook: boolean;
};

const STORAGE_REQUIREMENTS = 'sp2_wo_material_requirements';
const STORAGE_AUDIT = 'sp2_wo_allocation_audit';

/** Seed ~28 open WO material lines across 12 work orders for FIFO matching demos */
function buildSeedRequirements(): WoMaterialRequirement[] {
  const site = 'Makarpura GIDC';
  const rows: Omit<WoMaterialRequirement, 'billingStatus'>[] = [
    { woId: 'WO-26-081', orderId: 'SO-26-011', itemCode: 'MS-PL-10MM', itemName: 'MS Plate 10mm IS2062', sanctionedQty: 400, billedQty: 0, woStartDate: '2026-05-02', siteCode: site, woProductionStatus: 'Material Kitting' },
    { woId: 'WO-26-082', orderId: 'SO-26-012', itemCode: 'MS-PL-10MM', itemName: 'MS Plate 10mm IS2062', sanctionedQty: 600, billedQty: 200, woStartDate: '2026-05-10', siteCode: site, woProductionStatus: 'Assembly' },
    { woId: 'WO-26-083', orderId: 'SO-26-013', itemCode: 'MS-PL-10MM', itemName: 'MS Plate 10mm IS2062', sanctionedQty: 350, billedQty: 0, woStartDate: '2026-05-18', siteCode: site, woProductionStatus: 'Pending' },
    { woId: 'WO-26-084', orderId: 'SO-26-014', itemCode: 'MS-PL-10MM', itemName: 'MS Plate 10mm IS2062', sanctionedQty: 500, billedQty: 100, woStartDate: '2026-05-22', siteCode: site, woProductionStatus: 'Partially Billed' },
    { woId: 'WO-26-085', orderId: 'SO-26-015', itemCode: 'HTR-3KW', itemName: 'Heater Element 3KW', sanctionedQty: 24, billedQty: 0, woStartDate: '2026-05-05', siteCode: site, woProductionStatus: 'Material Kitting' },
    { woId: 'WO-26-086', orderId: 'SO-26-016', itemCode: 'HTR-3KW', itemName: 'Heater Element 3KW', sanctionedQty: 18, billedQty: 6, woStartDate: '2026-05-12', siteCode: site, woProductionStatus: 'Assembly' },
    { woId: 'WO-26-087', orderId: 'SO-26-017', itemCode: 'HTR-3KW', itemName: 'Heater Element 3KW', sanctionedQty: 30, billedQty: 0, woStartDate: '2026-05-20', siteCode: site, woProductionStatus: 'Pending' },
    { woId: 'WO-26-088', orderId: 'SO-26-018', itemCode: 'PUMP-GEAR-50', itemName: 'Gear Pump 50 LPM', sanctionedQty: 2, billedQty: 0, woStartDate: '2026-05-08', siteCode: site, woProductionStatus: 'Material Kitting' },
    { woId: 'WO-26-089', orderId: 'SO-26-019', itemCode: 'PUMP-GEAR-50', itemName: 'Gear Pump 50 LPM', sanctionedQty: 3, billedQty: 1, woStartDate: '2026-05-15', siteCode: site, woProductionStatus: 'Partially Billed' },
    { woId: 'WO-26-090', orderId: 'SO-26-020', itemCode: 'VLV-BLL-1IN', itemName: 'Ball Valve 1" SS304', sanctionedQty: 40, billedQty: 10, woStartDate: '2026-05-03', siteCode: site, woProductionStatus: 'Assembly' },
    { woId: 'WO-26-091', orderId: 'SO-26-021', itemCode: 'VLV-BLL-1IN', itemName: 'Ball Valve 1" SS304', sanctionedQty: 25, billedQty: 0, woStartDate: '2026-05-25', siteCode: site, woProductionStatus: 'Pending' },
    { woId: 'WO-26-092', orderId: 'SO-26-022', itemCode: 'FLT-EL-5M', itemName: 'Filter Element 5 Micron', sanctionedQty: 12, billedQty: 0, woStartDate: '2026-05-07', siteCode: site, woProductionStatus: 'Material Kitting' },
    { woId: 'WO-26-093', orderId: 'SO-26-023', itemCode: 'FLT-EL-5M', itemName: 'Filter Element 5 Micron', sanctionedQty: 8, billedQty: 3, woStartDate: '2026-05-14', siteCode: site, woProductionStatus: 'Partially Billed' },
    { woId: 'WO-26-094', orderId: 'SO-26-024', itemCode: 'MS-PL-10MM', itemName: 'MS Plate 10mm IS2062', sanctionedQty: 280, billedQty: 0, woStartDate: '2026-06-01', siteCode: site, woProductionStatus: 'Pending' },
    { woId: 'WO-26-095', orderId: 'SO-26-025', itemCode: 'MS-PL-10MM', itemName: 'MS Plate 10mm IS2062', sanctionedQty: 450, billedQty: 450, woStartDate: '2026-04-28', siteCode: site, woProductionStatus: 'Fully Billed' },
    { woId: 'WO-26-101', orderId: 'SO-26-001', itemCode: 'MS-PL-10MM', itemName: 'MS Plate 10mm IS2062', sanctionedQty: 800, billedQty: 300, woStartDate: '2026-06-25', siteCode: site, woProductionStatus: 'Assembly' },
    { woId: 'WO-26-101', orderId: 'SO-26-001', itemCode: 'HTR-3KW', itemName: 'Heater Element 3KW', sanctionedQty: 6, billedQty: 2, woStartDate: '2026-06-25', siteCode: site, woProductionStatus: 'Assembly' },
    { woId: 'WO-26-102', orderId: 'SO-26-002', itemCode: 'MS-PL-10MM', itemName: 'MS Plate 10mm IS2062', sanctionedQty: 1200, billedQty: 400, woStartDate: '2026-05-15', siteCode: site, woProductionStatus: 'Testing' },
    { woId: 'WO-26-102', orderId: 'SO-26-002', itemCode: 'PUMP-GEAR-50', itemName: 'Gear Pump 50 LPM', sanctionedQty: 2, billedQty: 0, woStartDate: '2026-05-15', siteCode: site, woProductionStatus: 'Testing' },
    { woId: 'WO-26-103', orderId: 'SO-26-004', itemCode: 'MS-PL-10MM', itemName: 'MS Plate 10mm IS2062', sanctionedQty: 150, billedQty: 0, woStartDate: '2026-07-01', siteCode: site, woProductionStatus: 'Material Kitting' },
    { woId: 'WO-26-103', orderId: 'SO-26-004', itemCode: 'VLV-BLL-1IN', itemName: 'Ball Valve 1" SS304', sanctionedQty: 6, billedQty: 0, woStartDate: '2026-07-01', siteCode: site, woProductionStatus: 'Material Kitting' },
    { woId: 'WO-26-104', orderId: 'SO-26-026', itemCode: 'HTR-3KW', itemName: 'Heater Element 3KW', sanctionedQty: 15, billedQty: 0, woStartDate: '2026-06-10', siteCode: site, woProductionStatus: 'Pending' },
    { woId: 'WO-26-105', orderId: 'SO-26-027', itemCode: 'HTR-3KW', itemName: 'Heater Element 3KW', sanctionedQty: 20, billedQty: 5, woStartDate: '2026-06-12', siteCode: site, woProductionStatus: 'Partially Billed' },
    { woId: 'WO-26-106', orderId: 'SO-26-028', itemCode: 'FLT-EL-5M', itemName: 'Filter Element 5 Micron', sanctionedQty: 10, billedQty: 0, woStartDate: '2026-06-08', siteCode: site, woProductionStatus: 'Pending' },
    { woId: 'WO-26-107', orderId: 'SO-26-029', itemCode: 'PUMP-GEAR-50', itemName: 'Gear Pump 50 LPM', sanctionedQty: 1, billedQty: 0, woStartDate: '2026-06-15', siteCode: site, woProductionStatus: 'Pending' },
    { woId: 'WO-26-108', orderId: 'SO-26-030', itemCode: 'VLV-BLL-1IN', itemName: 'Ball Valve 1" SS304', sanctionedQty: 18, billedQty: 0, woStartDate: '2026-06-18', siteCode: 'Halol Plant', woProductionStatus: 'Pending' },
    { woId: 'WO-26-109', orderId: 'SO-26-031', itemCode: 'MS-PL-10MM', itemName: 'MS Plate 10mm IS2062', sanctionedQty: 320, billedQty: 50, woStartDate: '2026-06-05', siteCode: site, woProductionStatus: 'Partially Billed' },
    { woId: 'WO-26-110', orderId: 'SO-26-032', itemCode: 'MS-PL-10MM', itemName: 'MS Plate 10mm IS2062', sanctionedQty: 200, billedQty: 0, woStartDate: '2026-06-20', siteCode: site, woProductionStatus: 'Pending' },
  ];

  return rows.map(r => ({
    ...r,
    billingStatus: deriveBillingStatus(r.sanctionedQty, r.billedQty),
  }));
}

function deriveBillingStatus(sanctioned: number, billed: number): WoBillingStatus {
  if (billed <= 0) return 'Pending';
  if (billed >= sanctioned) return 'Fully Billed';
  return 'Partially Billed';
}

function balanceQty(row: WoMaterialRequirement): number {
  return Math.max(0, row.sanctionedQty - row.billedQty);
}

function normalizeItemCode(code: string): string {
  return code.trim().toUpperCase();
}

function matchesItem(row: WoMaterialRequirement, itemCode: string, itemName: string): boolean {
  const code = normalizeItemCode(itemCode);
  if (code && normalizeItemCode(row.itemCode) === code) return true;
  if (itemName && row.itemName.toLowerCase() === itemName.trim().toLowerCase()) return true;
  return false;
}

function isOpenForBilling(row: WoMaterialRequirement): boolean {
  return balanceQty(row) > 0 && row.billingStatus !== 'Fully Billed';
}

export function loadWoMaterialRequirements(): WoMaterialRequirement[] {
  try {
    const saved = localStorage.getItem(STORAGE_REQUIREMENTS);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  const seed = buildSeedRequirements();
  localStorage.setItem(STORAGE_REQUIREMENTS, JSON.stringify(seed));
  return seed;
}

export function saveWoMaterialRequirements(rows: WoMaterialRequirement[]): void {
  localStorage.setItem(STORAGE_REQUIREMENTS, JSON.stringify(rows));
}

export function loadAllocationAudit(): WoAllocationAuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_AUDIT) || '[]');
  } catch {
    return [];
  }
}

function appendAudit(entry: WoAllocationAuditEntry): void {
  const audit = loadAllocationAudit();
  localStorage.setItem(STORAGE_AUDIT, JSON.stringify([entry, ...audit].slice(0, 100)));
}

export function getPendingWoLinesForItem(itemCode: string, itemName?: string, siteCode?: string): WoMaterialRequirement[] {
  return loadWoMaterialRequirements()
    .filter(r => isOpenForBilling(r))
    .filter(r => matchesItem(r, itemCode, itemName ?? ''))
    .filter(r => !siteCode || r.siteCode === siteCode)
    .sort((a, b) => a.woStartDate.localeCompare(b.woStartDate) || a.woId.localeCompare(b.woId));
}

export function allocateBillToWorkOrders(
  input: PurchaseBillInput,
  options: { dryRun?: boolean } = {}
): WoAllocationResult {
  const stored = loadWoMaterialRequirements();
  const requirements: WoMaterialRequirement[] = options.dryRun
    ? JSON.parse(JSON.stringify(stored))
    : stored;
  let remaining = input.quantity;
  const allocations: WoAllocationLine[] = [];
  let requiresApproval = false;
  let approvalMessage: string | undefined;
  const logicParts: string[] = [];

  const rowKey = (woId: string, itemCode: string) => `${woId}::${normalizeItemCode(itemCode)}`;

  const findRow = (woId: string, itemCode: string) =>
    requirements.find(r => r.woId === woId && normalizeItemCode(r.itemCode) === normalizeItemCode(itemCode));

  const allocateToRow = (
    row: WoMaterialRequirement,
    qty: number,
    method: WoAllocationLine['matchMethod'],
    allowOverSanctioned: boolean
  ): number => {
    const bal = balanceQty(row);
    let actual = qty;

    if (qty > bal && !allowOverSanctioned) {
      requiresApproval = true;
      approvalMessage = `Quantity exceeds sanctioned balance on ${row.woId} (${bal} remaining). Enable approval override to book.`;
      actual = 0;
      return 0;
    }

    if (qty > bal && allowOverSanctioned) {
      actual = qty;
      method = 'approval-override';
    } else {
      actual = Math.min(qty, bal);
    }

    if (actual <= 0) return 0;

    row.billedQty += actual;
    row.billingStatus = deriveBillingStatus(row.sanctionedQty, row.billedQty);

    allocations.push({
      woNumber: row.woId,
      itemCode: row.itemCode,
      itemName: row.itemName,
      qtyBilled: actual,
      balanceQtyRemaining: balanceQty(row),
      billReference: input.billRef,
      matchMethod: method,
    });

    return actual;
  };

  // Step 1: Direct WO tag on PO/bill
  if (input.woRef?.trim()) {
    const tagged = findRow(input.woRef.trim(), input.itemCode)
      ?? requirements.find(r => r.woId === input.woRef!.trim() && matchesItem(r, input.itemCode, input.itemName));

    if (tagged && isOpenForBilling(tagged)) {
      const booked = allocateToRow(tagged, remaining, 'wo-tag', !!input.approvalOverride);
      if (booked > 0) {
        remaining -= booked;
        logicParts.push(`Step 1: Direct WO tag → ${tagged.woId} (${booked} qty)`);
      }
    } else if (input.woRef.trim()) {
      logicParts.push(`Step 1: WO tag ${input.woRef} not found or no balance — falling back to FIFO`);
    }
  }

  // Steps 2–4: FIFO across matching open WOs
  if (remaining > 0) {
    const candidates = requirements
      .filter(r => isOpenForBilling(r))
      .filter(r => matchesItem(r, input.itemCode, input.itemName))
      .filter(r => !input.siteCode || r.siteCode === input.siteCode)
      .sort((a, b) => a.woStartDate.localeCompare(b.woStartDate) || a.woId.localeCompare(b.woId));

    const fifoWoIds = new Set<string>();

    for (const row of candidates) {
      if (remaining <= 0) break;
      const booked = allocateToRow(row, remaining, 'fifo', !!input.approvalOverride);
      if (booked > 0) {
        remaining -= booked;
        fifoWoIds.add(row.woId);
      }
    }

    if (fifoWoIds.size > 0) {
      logicParts.push(
        `Steps 2–4: FIFO match → ${fifoWoIds.size} WO(s) [${[...fifoWoIds].join(', ')}]` +
        (fifoWoIds.size > 1 ? ' — quantity split across WOs' : '')
      );
    }
  }

  // Step 5: Excess
  const excessQty = remaining;
  if (excessQty > 0) {
    logicParts.push(`Step 5: ${excessQty} qty unmatched — exceeds total pending balance (manual review)`);
  }

  if (!options.dryRun) {
    saveWoMaterialRequirements(requirements);
  }

  const totalAllocated = input.quantity - excessQty;
  const splitAcrossWoCount = new Set(allocations.map(a => a.woNumber)).size;

  return {
    allocations,
    excessQty,
    totalAllocated,
    requiresApproval: requiresApproval && !input.approvalOverride,
    approvalMessage,
    splitAcrossWoCount,
    logicSummary: logicParts.join(' | ') || 'No matching open Work Orders',
    canBook: totalAllocated > 0 && !(requiresApproval && !input.approvalOverride),
  };
}

export function confirmBillAllocation(input: PurchaseBillInput): WoAllocationAuditEntry {
  const result = allocateBillToWorkOrders(input, { dryRun: false });
  const entry: WoAllocationAuditEntry = {
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    billRef: input.billRef,
    itemCode: input.itemCode,
    itemName: input.itemName,
    vendorName: input.vendorName,
    billDate: input.billDate,
    quantityPurchased: input.quantity,
    allocations: result.allocations,
    excessQty: result.excessQty,
    logic: result.logicSummary,
    poRef: input.poRef,
    woRef: input.woRef,
  };
  appendAudit(entry);
  return entry;
}

/** Natural-language style query parser for the AI query box */
export function parseWoAllocationQuery(text: string): Partial<PurchaseBillInput> | null {
  const itemMatch = text.match(/(?:for|item)\s+([^,.]+?)(?:\.|,|$|\s+from|\s+I have)/i)
    ?? text.match(/pending Work Orders with balance quantity for\s+(.+?)(?:\.|$)/i);
  const qtyMatch = text.match(/(?:bill|received a bill|quantity)\s+(?:for\s+)?(\d+(?:\.\d+)?)\s*(?:units)?/i);
  const vendorMatch = text.match(/from\s+([^,.]+?)(?:\s+dated|\s+date|\.|,|$)/i);
  const dateMatch = text.match(/dated\s+([\d-]+|[\d]{1,2}[-/][A-Za-z]{3}[-/][\d]{4})/i);

  if (!itemMatch && !qtyMatch) return null;

  const itemRaw = itemMatch?.[1]?.trim() ?? '';
  const invItem = mockInventory.find(
    i => i.partNumber.toLowerCase() === itemRaw.toLowerCase() || i.name.toLowerCase() === itemRaw.toLowerCase()
  );

  return {
    itemCode: invItem?.partNumber ?? itemRaw,
    itemName: invItem?.name ?? itemRaw,
    quantity: qtyMatch ? Number(qtyMatch[1]) : undefined,
    vendorName: vendorMatch?.[1]?.trim(),
    billDate: dateMatch?.[1] ?? new Date().toISOString().split('T')[0],
  };
}

export function inventoryItemOptions() {
  return mockInventory.map(i => ({
    code: i.partNumber,
    name: i.name,
    label: `${i.partNumber} — ${i.name}`,
  }));
}
