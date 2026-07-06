export type WoContractBudget = {
  woId: string;
  jobName: string;
  workType: string;
  sanctionedAmount: number;
  totalBilled: number;
  status: 'Open' | 'Closed';
  woStartDate: string;
};

/** Pending item/qty per WO — used to suggest which WO an purchased item belongs to */
export type WoContractItemRequirement = {
  woId: string;
  jobName: string;
  itemCode: string;
  itemName: string;
  sanctionedQty: number;
  billedQty: number;
  uom: string;
  woStartDate: string;
};

export type ContractorBillLineInput = {
  woId: string;
  jobName: string;
  itemDescription: string;
  itemCode?: string;
  amount: number;
  qty?: number;
  uom?: string;
};

export type ContractorBillInput = {
  billNo: string;
  billDate: string;
  vendorName: string;
  totalAmount: number;
  lines: ContractorBillLineInput[];
  approvalOverride?: boolean;
};

export type WoSuggestion = {
  woId: string;
  jobName: string;
  itemCode: string;
  itemName: string;
  balanceQty: number;
  balanceAmount: number;
  uom: string;
  woStartDate: string;
  matchScore: number;
};

export type ContractorBillLineResult = ContractorBillLineInput & {
  balanceAfter: number;
  exceeded: boolean;
};

export type ContractorBillValidation = {
  lineTotal: number;
  totalMatches: boolean;
  totalDiff: number;
  lines: ContractorBillLineResult[];
  hasExceeded: boolean;
  exceededMessages: string[];
  canSave: boolean;
};

export type ContractorBillRecord = ContractorBillInput & {
  id: string;
  bookedAt: string;
};

const STORAGE_BUDGETS = 'sp2_wo_contract_budgets';
const STORAGE_ITEMS = 'sp2_wo_contract_item_requirements';
const STORAGE_BILLS = 'sp2_contractor_bills';

function balanceAmount(wo: WoContractBudget): number {
  return Math.max(0, wo.sanctionedAmount - wo.totalBilled);
}

function itemBalance(row: WoContractItemRequirement): number {
  return Math.max(0, row.sanctionedQty - row.billedQty);
}

function buildSeedBudgets(): WoContractBudget[] {
  const rows: Omit<WoContractBudget, 'status' | 'totalBilled'>[] = [
    { woId: 'WO-26-201', jobName: 'Machine A — Tank Painting', workType: 'Painting', sanctionedAmount: 15000, woStartDate: '2026-05-02' },
    { woId: 'WO-26-202', jobName: 'Machine B — Panel Coating', workType: 'Painting', sanctionedAmount: 12000, woStartDate: '2026-05-08' },
    { woId: 'WO-26-203', jobName: 'Machine C — Full Paint Job', workType: 'Painting', sanctionedAmount: 18000, woStartDate: '2026-05-12' },
    { woId: 'WO-26-204', jobName: 'Filter Skid — Touch-up', workType: 'Painting', sanctionedAmount: 8000, woStartDate: '2026-04-20' },
    { woId: 'WO-26-205', jobName: 'Pump Set — Primer + Top Coat', workType: 'Painting', sanctionedAmount: 22000, woStartDate: '2026-05-15' },
    { woId: 'WO-26-206', jobName: 'Heat Exchanger — Sand Blast + Paint', workType: 'Surface Prep', sanctionedAmount: 25000, woStartDate: '2026-05-18' },
    { woId: 'WO-26-207', jobName: 'DG Set Enclosure — Blue Shade', workType: 'Painting', sanctionedAmount: 14000, woStartDate: '2026-05-22' },
    { woId: 'WO-26-208', jobName: 'Conveyor Frame — Epoxy Coating', workType: 'Coating', sanctionedAmount: 16000, woStartDate: '2026-05-25' },
    { woId: 'WO-26-209', jobName: 'Storage Tank T-12 — External Paint', workType: 'Painting', sanctionedAmount: 35000, woStartDate: '2026-06-01' },
    { woId: 'WO-26-210', jobName: 'Valve Manifold — Anti-corrosive', workType: 'Coating', sanctionedAmount: 9500, woStartDate: '2026-06-05' },
    { woId: 'WO-26-211', jobName: 'Machine D — Hopper Painting', workType: 'Painting', sanctionedAmount: 11000, woStartDate: '2026-06-08' },
    { woId: 'WO-26-212', jobName: 'Machine E — Base Frame', workType: 'Painting', sanctionedAmount: 13500, woStartDate: '2026-06-10' },
    { woId: 'WO-26-213', jobName: 'Machine F — Silo Exterior', workType: 'Painting', sanctionedAmount: 28000, woStartDate: '2026-06-12' },
    { woId: 'WO-26-214', jobName: 'Machine G — Piping Rack', workType: 'Coating', sanctionedAmount: 9000, woStartDate: '2026-06-15' },
    { woId: 'WO-26-215', jobName: 'Machine H — Control Panel', workType: 'Painting', sanctionedAmount: 7500, woStartDate: '2026-06-18' },
    { woId: 'WO-26-216', jobName: 'Machine I — Separator Vessel', workType: 'Painting', sanctionedAmount: 32000, woStartDate: '2026-06-20' },
    { woId: 'WO-26-217', jobName: 'Machine J — Platform Grating', workType: 'Coating', sanctionedAmount: 10500, woStartDate: '2026-06-22' },
    { woId: 'WO-26-218', jobName: 'Machine K — Mixer Drum', workType: 'Painting', sanctionedAmount: 19000, woStartDate: '2026-06-25' },
    { woId: 'WO-26-219', jobName: 'Machine L — Filter Housing', workType: 'Painting', sanctionedAmount: 12500, woStartDate: '2026-06-28' },
    { woId: 'WO-26-220', jobName: 'Machine M — Skid Assembly', workType: 'Painting', sanctionedAmount: 24000, woStartDate: '2026-07-01' },
  ];
  return rows.map(r => ({
    ...r,
    totalBilled: r.woId === 'WO-26-202' ? 3500 : r.woId === 'WO-26-204' ? 8000 : r.woId === 'WO-26-205' ? 6000 : r.woId === 'WO-26-207' ? 2000 : r.woId === 'WO-26-209' ? 12000 : 0,
    status: (r.woId === 'WO-26-204' ? 'Closed' : 'Open') as 'Open' | 'Closed',
  }));
}

function buildSeedItemRequirements(): WoContractItemRequirement[] {
  const paintItems = [
    { code: 'PNT-EPX-PRM', name: 'Epoxy Primer', uom: 'Ltr' },
    { code: 'PNT-TOP-BLU', name: 'Top Coat Blue', uom: 'Ltr' },
    { code: 'PNT-THNR', name: 'Paint Thinner', uom: 'Ltr' },
    { code: 'SVC-SANDBLAST', name: 'Sand Blasting Service', uom: 'Sqm' },
    { code: 'PNT-ZINC-PRM', name: 'Zinc Rich Primer', uom: 'Ltr' },
  ];

  const budgets = buildSeedBudgets().filter(w => w.status === 'Open');
  const rows: WoContractItemRequirement[] = [];

  budgets.forEach((wo, idx) => {
    const item = paintItems[idx % paintItems.length];
    const sanctionedQty = 10 + (idx % 8) * 5;
    const billedQty = idx % 4 === 0 ? Math.floor(sanctionedQty * 0.3) : idx % 7 === 0 ? Math.floor(sanctionedQty * 0.5) : 0;
    rows.push({
      woId: wo.woId,
      jobName: wo.jobName,
      itemCode: item.code,
      itemName: item.name,
      sanctionedQty,
      billedQty,
      uom: item.uom,
      woStartDate: wo.woStartDate,
    });
    if (idx % 3 === 0) {
      const second = paintItems[(idx + 1) % paintItems.length];
      rows.push({
        woId: wo.woId,
        jobName: wo.jobName,
        itemCode: second.code,
        itemName: second.name,
        sanctionedQty: 8 + (idx % 5) * 2,
        billedQty: 0,
        uom: second.uom,
        woStartDate: wo.woStartDate,
      });
    }
  });

  return rows;
}

export function loadWoContractBudgets(): WoContractBudget[] {
  try {
    const saved = localStorage.getItem(STORAGE_BUDGETS);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  const seed = buildSeedBudgets();
  localStorage.setItem(STORAGE_BUDGETS, JSON.stringify(seed));
  return seed;
}

export function loadWoContractItemRequirements(): WoContractItemRequirement[] {
  try {
    const saved = localStorage.getItem(STORAGE_ITEMS);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  const seed = buildSeedItemRequirements();
  localStorage.setItem(STORAGE_ITEMS, JSON.stringify(seed));
  return seed;
}

export function saveWoContractBudgets(rows: WoContractBudget[]): void {
  localStorage.setItem(STORAGE_BUDGETS, JSON.stringify(rows));
}

function saveWoContractItemRequirements(rows: WoContractItemRequirement[]): void {
  localStorage.setItem(STORAGE_ITEMS, JSON.stringify(rows));
}

export function loadContractorBills(): ContractorBillRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_BILLS) || '[]');
  } catch {
    return [];
  }
}

function saveContractorBills(bills: ContractorBillRecord[]): void {
  localStorage.setItem(STORAGE_BILLS, JSON.stringify(bills));
}

/** Migrate legacy bill lines that used `description` only */
function normalizeLine(line: ContractorBillLineInput & { description?: string }): ContractorBillLineInput {
  return {
    woId: line.woId,
    jobName: line.jobName ?? line.description ?? '',
    itemDescription: line.itemDescription ?? line.description ?? '',
    itemCode: line.itemCode,
    amount: line.amount,
    qty: line.qty,
    uom: line.uom,
  };
}

export function getOpenWoOptions(): WoContractBudget[] {
  return loadWoContractBudgets().filter(w => w.status === 'Open');
}

export function suggestWosForItem(itemQuery: string, qty?: number): WoSuggestion[] {
  if (!itemQuery.trim()) return [];

  const q = itemQuery.trim().toLowerCase();
  const budgets = loadWoContractBudgets();
  const items = loadWoContractItemRequirements().filter(r => itemBalance(r) > 0);

  const matched = items
    .filter(r =>
      r.itemCode.toLowerCase().includes(q) ||
      r.itemName.toLowerCase().includes(q) ||
      q.includes(r.itemCode.toLowerCase()) ||
      q.includes(r.itemName.toLowerCase())
    )
    .map(r => {
      const wo = budgets.find(w => w.woId === r.woId);
      const balQty = itemBalance(r);
      let score = 10;
      if (r.itemCode.toLowerCase() === q) score += 20;
      if (r.itemName.toLowerCase() === q) score += 15;
      if (qty && qty <= balQty) score += 10;
      return {
        woId: r.woId,
        jobName: r.jobName,
        itemCode: r.itemCode,
        itemName: r.itemName,
        balanceQty: balQty,
        balanceAmount: wo ? balanceAmount(wo) : 0,
        uom: r.uom,
        woStartDate: r.woStartDate,
        matchScore: score,
      };
    });

  return matched
    .sort((a, b) => b.matchScore - a.matchScore || a.woStartDate.localeCompare(b.woStartDate))
    .slice(0, 8);
}

export function validateContractorBill(
  input: ContractorBillInput,
  budgets?: WoContractBudget[]
): ContractorBillValidation {
  const master = budgets ?? loadWoContractBudgets();
  const normalizedLines = input.lines.map(normalizeLine);
  const lineTotal = normalizedLines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const totalMatches = Math.abs(lineTotal - input.totalAmount) < 0.01;
  const exceededMessages: string[] = [];

  const lines: ContractorBillLineResult[] = normalizedLines.map(line => {
    const wo = master.find(w => w.woId === line.woId);
    const bal = wo ? balanceAmount(wo) : 0;
    const amt = Number(line.amount) || 0;
    const exceeded = wo ? amt > bal : true;
    if (exceeded && wo) {
      exceededMessages.push(
        `${line.woId}: ₹${amt.toLocaleString('en-IN')} exceeds balance ₹${bal.toLocaleString('en-IN')}`
      );
    }
    if (!wo && line.woId) {
      exceededMessages.push(`${line.woId}: Work Order not found`);
    }
    return {
      ...line,
      balanceAfter: wo ? Math.max(0, bal - amt) : 0,
      exceeded,
    };
  });

  const hasExceeded = lines.some(l => l.exceeded);
  const canSave =
    input.billNo.trim() !== '' &&
    input.vendorName.trim() !== '' &&
    input.totalAmount > 0 &&
    normalizedLines.length > 0 &&
    normalizedLines.every(l => l.woId && l.amount > 0) &&
    totalMatches &&
    (!hasExceeded || !!input.approvalOverride);

  return {
    lineTotal,
    totalMatches,
    totalDiff: input.totalAmount - lineTotal,
    lines,
    hasExceeded,
    exceededMessages,
    canSave,
  };
}

export function bookContractorBill(input: ContractorBillInput): ContractorBillRecord {
  const budgets = loadWoContractBudgets();
  const itemReqs = loadWoContractItemRequirements();
  const normalizedLines = input.lines.map(normalizeLine);
  const validation = validateContractorBill({ ...input, lines: normalizedLines }, budgets);
  if (!validation.canSave) {
    throw new Error('Bill validation failed — check totals and WO balances.');
  }

  for (const line of normalizedLines) {
    const wo = budgets.find(w => w.woId === line.woId);
    if (wo) {
      wo.totalBilled += Number(line.amount) || 0;
      if (wo.totalBilled >= wo.sanctionedAmount) {
        wo.status = 'Closed';
      }
    }

    if (line.itemCode || line.itemDescription) {
      const query = line.itemCode ?? line.itemDescription;
      const itemRow = itemReqs.find(
        r =>
          r.woId === line.woId &&
          (r.itemCode === line.itemCode ||
            r.itemName.toLowerCase() === line.itemDescription.toLowerCase() ||
            r.itemName.toLowerCase().includes(line.itemDescription.toLowerCase()))
      ) ?? itemReqs.find(
        r =>
          r.woId === line.woId &&
          (r.itemCode.toLowerCase().includes(query.toLowerCase()) ||
            r.itemName.toLowerCase().includes(query.toLowerCase()))
      );

      if (itemRow && line.qty) {
        itemRow.billedQty = Math.min(itemRow.sanctionedQty, itemRow.billedQty + line.qty);
      }
    }
  }

  saveWoContractBudgets(budgets);
  saveWoContractItemRequirements(itemReqs);

  const record: ContractorBillRecord = {
    ...input,
    lines: normalizedLines,
    id: `CB-${Date.now()}`,
    bookedAt: new Date().toISOString(),
  };
  saveContractorBills([record, ...loadContractorBills()]);
  return record;
}

export function getWoWiseReport(): Array<{
  woId: string;
  jobName: string;
  sanctionedAmount: number;
  totalBilled: number;
  balance: number;
  status: string;
}> {
  return loadWoContractBudgets().map(wo => ({
    woId: wo.woId,
    jobName: wo.jobName,
    sanctionedAmount: wo.sanctionedAmount,
    totalBilled: wo.totalBilled,
    balance: balanceAmount(wo),
    status: wo.status,
  }));
}

export function getBillWiseReport(): Array<{
  billNo: string;
  billDate: string;
  vendorName: string;
  totalAmount: number;
  splitSummary: string;
}> {
  return loadContractorBills().map(b => ({
    billNo: b.billNo,
    billDate: b.billDate,
    vendorName: b.vendorName,
    totalAmount: b.totalAmount,
    splitSummary: b.lines
      .map(l => {
        const norm = normalizeLine(l);
        return `${norm.woId}: ₹${norm.amount.toLocaleString('en-IN')}${norm.itemDescription ? ` (${norm.itemDescription})` : ''}`;
      })
      .join(' | '),
  }));
}

export function getItemToWoMatchingReport(): Array<{
  billNo: string;
  billDate: string;
  item: string;
  qty: number;
  uom: string;
  matchedWos: string;
  qtyPerWo: string;
}> {
  const rows: Array<{
    billNo: string;
    billDate: string;
    item: string;
    qty: number;
    uom: string;
    matchedWos: string;
    qtyPerWo: string;
  }> = [];

  for (const bill of loadContractorBills()) {
    for (const raw of bill.lines) {
      const line = normalizeLine(raw);
      if (!line.woId) continue;
      rows.push({
        billNo: bill.billNo,
        billDate: bill.billDate,
        item: line.itemDescription || line.itemCode || 'Contract work',
        qty: line.qty ?? 0,
        uom: line.uom ?? '—',
        matchedWos: line.woId,
        qtyPerWo: line.qty ? `${line.qty} ${line.uom ?? ''}`.trim() : `₹${line.amount}`,
      });
    }
  }

  return rows;
}

export function parseContractorBillQuery(text: string): Partial<{
  vendorName: string;
  totalAmount: number;
  itemDescription: string;
  qty: number;
}> | null {
  const vendorMatch = text.match(/(?:from|contractor|vendor)\s+([^,.]+?)(?:\.|,|$|for)/i);
  const amountMatch = text.match(/(?:total|amount|bill)\s*(?:of|for)?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
  const itemMatch = text.match(/(?:item|paint|work)\s+([^,.]+?)(?:\s+qty|\s+quantity|\.|,|$)/i);
  const qtyMatch = text.match(/(?:qty|quantity)\s*(\d+(?:\.\d+)?)/i);

  if (!vendorMatch && !amountMatch && !itemMatch) return null;

  return {
    vendorName: vendorMatch?.[1]?.trim(),
    totalAmount: amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : undefined,
    itemDescription: itemMatch?.[1]?.trim(),
    qty: qtyMatch ? Number(qtyMatch[1]) : undefined,
  };
}

export const CONTRACTOR_ITEM_OPTIONS = [
  { code: 'PNT-EPX-PRM', name: 'Epoxy Primer', uom: 'Ltr' },
  { code: 'PNT-TOP-BLU', name: 'Top Coat Blue', uom: 'Ltr' },
  { code: 'PNT-THNR', name: 'Paint Thinner', uom: 'Ltr' },
  { code: 'SVC-SANDBLAST', name: 'Sand Blasting Service', uom: 'Sqm' },
  { code: 'PNT-ZINC-PRM', name: 'Zinc Rich Primer', uom: 'Ltr' },
];
