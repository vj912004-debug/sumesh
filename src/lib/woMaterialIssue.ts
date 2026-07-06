import { mockInventory, mockWorkOrders, type InventoryItem } from './mockData2';

const INVENTORY_KEY = 'sp2_inventory';
const WO_LEDGER_KEY = 'sp2_wo_material_ledger';
const AUDIT_KEY = 'sp2_wo_material_audit';
const WORK_ORDERS_KEY = 'mockWorkOrders';

export type WoConsumptionLine = {
  inventoryItemId: string;
  itemName: string;
  partNumber: string;
  qtyIssued: number;
  qtyReturned: number;
  unitRate: number;
  uom: string;
};

export type WoMaterialLedger = {
  woId: string;
  lines: WoConsumptionLine[];
  totalMaterialCost: number;
  lastUpdated: string;
};

export type MaterialAuditEntry = {
  id: string;
  issueRef: string;
  woId: string;
  inventoryItemId: string;
  itemName: string;
  qty: number;
  action: 'Issued' | 'Returned';
  amount: number;
  doneBy: string;
  date: string;
  reason?: string;
  issuedTo?: string;
  linkedIssueRef?: string;
  sourceType?: 'Direct' | 'Via MRS';
  mrsNo?: string;
};

export type MaterialIssueInput = {
  woId: string;
  inventoryItemId: string;
  quantity: number;
  issueDate: string;
  issuedTo: string;
  doneBy: string;
  userRole?: string;
  sourceType?: 'Direct' | 'Via MRS';
  mrsNo?: string;
};

export type MaterialReturnInput = {
  woId: string;
  inventoryItemId: string;
  qtyToReturn: number;
  returnDate: string;
  reason: 'Excess Issued' | 'Wrong WO' | 'Job Cancelled' | 'Other';
  doneBy: string;
  userRole?: string;
};

export type IssuedItemSummary = {
  inventoryItemId: string;
  itemName: string;
  partNumber: string;
  uom: string;
  qtyIssued: number;
  qtyReturned: number;
  netQty: number;
  unitRate: number;
};

const STORE_ROLES = ['admin', 'administrator', 'inventory', 'store', 'store owner', 'store admin'];

export function canPerformStoreActions(user: { role?: string; name?: string } | null): boolean {
  if (!user) return false;
  const role = (user.role ?? '').toLowerCase();
  const name = (user.name ?? '').toLowerCase();
  return STORE_ROLES.some(r => role.includes(r) || name.includes(r));
}

export function loadInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return mockInventory;
  try {
    const saved = localStorage.getItem(INVENTORY_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(mockInventory));
  return mockInventory;
}

export function saveInventory(items: InventoryItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
}

export function loadWoLedgers(): WoMaterialLedger[] {
  try {
    return JSON.parse(localStorage.getItem(WO_LEDGER_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveWoLedgers(ledgers: WoMaterialLedger[]): void {
  localStorage.setItem(WO_LEDGER_KEY, JSON.stringify(ledgers));
}

export function getWoLedger(woId: string): WoMaterialLedger {
  const existing = loadWoLedgers().find(l => l.woId === woId);
  if (existing) return existing;
  return { woId, lines: [], totalMaterialCost: 0, lastUpdated: new Date().toISOString().split('T')[0] };
}

function saveWoLedger(ledger: WoMaterialLedger): void {
  const all = loadWoLedgers().filter(l => l.woId !== ledger.woId);
  saveWoLedgers([...all, ledger]);
}

export function loadMaterialAudit(): MaterialAuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
  } catch {
    return [];
  }
}

function appendAudit(entry: MaterialAuditEntry): void {
  const audit = loadMaterialAudit();
  localStorage.setItem(AUDIT_KEY, JSON.stringify([entry, ...audit]));
}

function nextIssueRef(): string {
  const audit = loadMaterialAudit();
  const nums = audit
    .filter(a => a.action === 'Issued')
    .map(a => a.issueRef.match(/MI-26-(\d+)/)?.[1])
    .filter(Boolean)
    .map(Number);
  const next = nums.length ? Math.max(...nums) + 1 : 401;
  return `MI-26-${next}`;
}

function recalcLedgerTotal(lines: WoConsumptionLine[]): number {
  return lines.reduce(
    (sum, l) => sum + (l.qtyIssued - l.qtyReturned) * l.unitRate,
    0
  );
}

export function getOpenWorkOrders() {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(WORK_ORDERS_KEY) : null;
  const wos = saved ? JSON.parse(saved) : mockWorkOrders;
  return wos.filter(
    (w: { status: string }) => w.status !== 'Completed'
  );
}

export function getItemRate(inventoryItemId: string): number {
  const item = loadInventory().find(i => i.id === inventoryItemId);
  return item?.unitCost ?? 0;
}

export function getAvailableStock(inventoryItemId: string): number {
  const item = loadInventory().find(i => i.id === inventoryItemId);
  return item ? item.stockMain + item.stockSubcon : 0;
}

export function getIssuedItemsForWo(woId: string): IssuedItemSummary[] {
  const ledger = getWoLedger(woId);
  return ledger.lines
    .map(l => ({
      inventoryItemId: l.inventoryItemId,
      itemName: l.itemName,
      partNumber: l.partNumber,
      uom: l.uom,
      qtyIssued: l.qtyIssued,
      qtyReturned: l.qtyReturned,
      netQty: l.qtyIssued - l.qtyReturned,
      unitRate: l.unitRate,
    }))
    .filter(l => l.netQty > 0 || l.qtyIssued > 0);
}

function assertStorePermission(user: { role?: string; name?: string } | null): void {
  if (!canPerformStoreActions(user)) {
    throw new Error('Only Store Owner / Store Admin can perform material issue and return.');
  }
}

export function issueMaterialToWo(input: MaterialIssueInput): MaterialAuditEntry {
  assertStorePermission({ role: input.userRole, name: input.doneBy });
  const inventory = loadInventory();
  const item = inventory.find(i => i.id === input.inventoryItemId);
  if (!item) throw new Error('Item not found in stock.');

  const available = item.stockMain + item.stockSubcon;
  if (input.quantity > available) {
    throw new Error(`Cannot issue ${input.quantity} ${item.uom} — only ${available} available in stock.`);
  }
  if (input.quantity <= 0) throw new Error('Quantity must be greater than zero.');

  item.stockMain = Math.max(0, item.stockMain - input.quantity);
  saveInventory(inventory);

  const ledger = getWoLedger(input.woId);
  const existing = ledger.lines.find(l => l.inventoryItemId === input.inventoryItemId);
  const rate = item.unitCost;

  if (existing) {
    existing.qtyIssued += input.quantity;
    existing.unitRate = rate;
  } else {
    ledger.lines.push({
      inventoryItemId: input.inventoryItemId,
      itemName: item.name,
      partNumber: item.partNumber,
      qtyIssued: input.quantity,
      qtyReturned: 0,
      unitRate: rate,
      uom: item.uom,
    });
  }

  ledger.totalMaterialCost = recalcLedgerTotal(ledger.lines);
  ledger.lastUpdated = input.issueDate;
  saveWoLedger(ledger);

  const issueRef = nextIssueRef();
  const entry: MaterialAuditEntry = {
    id: `AUD-MI-${Date.now()}`,
    issueRef,
    woId: input.woId,
    inventoryItemId: input.inventoryItemId,
    itemName: item.name,
    qty: input.quantity,
    action: 'Issued',
    amount: input.quantity * rate,
    doneBy: input.doneBy,
    date: input.issueDate,
    issuedTo: input.issuedTo,
    sourceType: input.sourceType ?? 'Direct',
    mrsNo: input.mrsNo,
  };
  appendAudit(entry);
  return entry;
}

export function returnMaterialFromWo(input: MaterialReturnInput): MaterialAuditEntry {
  assertStorePermission({ role: input.userRole, name: input.doneBy });
  const ledger = getWoLedger(input.woId);
  const line = ledger.lines.find(l => l.inventoryItemId === input.inventoryItemId);
  if (!line) throw new Error('No issue record found for this item on this WO.');

  const netIssued = line.qtyIssued - line.qtyReturned;
  if (input.qtyToReturn > netIssued) {
    throw new Error(`Cannot return ${input.qtyToReturn} — only ${netIssued} ${line.uom} net issued on this WO.`);
  }
  if (input.qtyToReturn <= 0) throw new Error('Return quantity must be greater than zero.');

  const inventory = loadInventory();
  const item = inventory.find(i => i.id === input.inventoryItemId);
  if (item) {
    item.stockMain += input.qtyToReturn;
    saveInventory(inventory);
  }

  line.qtyReturned += input.qtyToReturn;

  // Full return → remove from active WO consumption BOM; audit log retains history
  if (line.qtyIssued - line.qtyReturned <= 0) {
    ledger.lines = ledger.lines.filter(l => l.inventoryItemId !== input.inventoryItemId);
  }

  ledger.totalMaterialCost = recalcLedgerTotal(ledger.lines);
  ledger.lastUpdated = input.returnDate;
  saveWoLedger(ledger);

  const lastIssue = loadMaterialAudit().find(
    a => a.woId === input.woId && a.inventoryItemId === input.inventoryItemId && a.action === 'Issued'
  );

  const entry: MaterialAuditEntry = {
    id: `AUD-MR-${Date.now()}`,
    issueRef: `MR-26-${Date.now().toString().slice(-6)}`,
    woId: input.woId,
    inventoryItemId: input.inventoryItemId,
    itemName: line.itemName,
    qty: input.qtyToReturn,
    action: 'Returned',
    amount: input.qtyToReturn * line.unitRate,
    doneBy: input.doneBy,
    date: input.returnDate,
    reason: input.reason,
    linkedIssueRef: lastIssue?.issueRef,
  };
  appendAudit(entry);
  return entry;
}

export function getWoMaterialCostReport(): Array<{
  woId: string;
  itemName: string;
  partNumber: string;
  qtyIssued: number;
  qtyReturned: number;
  netQty: number;
  netCost: number;
}> {
  const audit = loadMaterialAudit();
  const inventory = loadInventory();
  const map = new Map<string, {
    woId: string;
    itemName: string;
    partNumber: string;
    qtyIssued: number;
    qtyReturned: number;
    unitRate: number;
  }>();

  for (const a of audit) {
    const key = `${a.woId}::${a.inventoryItemId}`;
    const inv = inventory.find(i => i.id === a.inventoryItemId);
    const row = map.get(key) ?? {
      woId: a.woId,
      itemName: a.itemName,
      partNumber: inv?.partNumber ?? '—',
      qtyIssued: 0,
      qtyReturned: 0,
      unitRate: inv?.unitCost ?? (a.qty > 0 ? a.amount / a.qty : 0),
    };
    if (a.action === 'Issued') row.qtyIssued += a.qty;
    else row.qtyReturned += a.qty;
    map.set(key, row);
  }

  return [...map.values()].map(r => {
    const netQty = r.qtyIssued - r.qtyReturned;
    return {
      woId: r.woId,
      itemName: r.itemName,
      partNumber: r.partNumber,
      qtyIssued: r.qtyIssued,
      qtyReturned: r.qtyReturned,
      netQty,
      netCost: netQty * r.unitRate,
    };
  });
}

export function getStockLedgerReport(): Array<{
  itemName: string;
  partNumber: string;
  openingStock: number;
  issued: number;
  returned: number;
  closingStock: number;
  uom: string;
}> {
  const audit = loadMaterialAudit();
  const inventory = loadInventory();

  return inventory.map(item => {
    const issued = audit
      .filter(a => a.inventoryItemId === item.id && a.action === 'Issued')
      .reduce((s, a) => s + a.qty, 0);
    const returned = audit
      .filter(a => a.inventoryItemId === item.id && a.action === 'Returned')
      .reduce((s, a) => s + a.qty, 0);
    const closing = item.stockMain + item.stockSubcon;
    const opening = closing + issued - returned;

    return {
      itemName: item.name,
      partNumber: item.partNumber,
      openingStock: opening,
      issued,
      returned,
      closingStock: closing,
      uom: item.uom,
    };
  });
}
