import { recordRentalReturnHistory } from './assetVisitHistory';
import { mockCustomers } from './mockData';

const RENTAL_ITEMS_KEY = 'sp2_rental_items';
const RENTAL_CHALLANS_KEY = 'sp2_rental_challans';
const RENTAL_CHALLAN_SEQ_KEY = 'sp2_rental_challan_seq';

export type ChallanReason = 'Rental' | 'Warranty Repair' | 'Service' | 'Other';
export type ChallanLineReturnStatus = 'Not Returned' | 'Partial' | 'Fully Returned';

export const CHALLAN_REASONS: ChallanReason[] = ['Rental', 'Warranty Repair', 'Service', 'Other'];

export type RentalAssetUnit = {
  serialNo: string;
  assetTag?: string;
  status: 'available' | 'out' | 'damaged' | 'under_repair';
  currentChallanId?: string;
};

export type RentalItem = {
  id: string;
  name: string;
  category: string;
  totalOwnedQty: number;
  uom: string;
  units?: RentalAssetUnit[];
};

export type RentalChallanLine = {
  id: string;
  rentalItemId: string;
  itemCode: string;
  description: string;
  hsnSac: string;
  qtyDispatched: number;
  qtyReturned: number;
  uom: string;
  serialNos?: string[];
};

export type RentalChallan = {
  id: string;
  dateIssued: string;
  expectedReturnDate: string;
  buyerName: string;
  buyerAddress: string;
  buyerGstin: string;
  buyerPhone: string;
  consigneeName: string;
  consigneeAddress: string;
  reason: ChallanReason;
  purpose: string;
  jobWorkNo: string;
  status: 'Pending' | 'Partial' | 'Returned' | 'Overdue';
  customerId?: string;
  items: RentalChallanLine[];
  operatorName?: string;
  driverDetails?: string;
  transporter?: string;
  vehicleNo?: string;
  lrNoDate?: string;
  preparedBy?: string;
  returnLogs?: RentalReturnLog[];
};

export type RentalReturnLog = {
  id: string;
  returnDate: string;
  condition: 'Good' | 'Damaged' | 'Under Repair';
  remarks?: string;
  processedBy?: string;
  lines: Array<{ lineId: string; qtyReturned: number }>;
};

export type RentalStockStatus = {
  rentalItemId: string;
  itemName: string;
  category: string;
  totalOwned: number;
  qtyOutOnRent: number;
  availableQty: number;
  utilizationPct: number;
  uom: string;
};

const SEED_ITEMS: RentalItem[] = [
  {
    id: 'RNT-001',
    name: 'Laptop - Dell Latitude 5540',
    category: 'Laptop',
    totalOwnedQty: 20,
    uom: 'Nos',
    units: Array.from({ length: 20 }, (_, i) => ({
      serialNo: `DL-LAT-${String(i + 1).padStart(3, '0')}`,
      status: 'available' as const,
    })),
  },
  {
    id: 'RNT-002',
    name: 'Projector - Epson EB-2250U',
    category: 'Projector',
    totalOwnedQty: 8,
    uom: 'Nos',
    units: Array.from({ length: 8 }, (_, i) => ({
      serialNo: `EPS-PRJ-${String(i + 1).padStart(3, '0')}`,
      status: 'available' as const,
    })),
  },
  {
    id: 'RNT-003',
    name: 'Filtration Rig 6000 LPH (Mobile)',
    category: 'Equipment',
    totalOwnedQty: 5,
    uom: 'Nos',
  },
  {
    id: 'RNT-004',
    name: 'Vacuum Hose Pipe 2 inch',
    category: 'Accessory',
    totalOwnedQty: 50,
    uom: 'Nos',
  },
];

function loadItems(): RentalItem[] {
  try {
    const saved = localStorage.getItem(RENTAL_ITEMS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  localStorage.setItem(RENTAL_ITEMS_KEY, JSON.stringify(SEED_ITEMS));
  return SEED_ITEMS;
}

function saveItems(items: RentalItem[]): void {
  localStorage.setItem(RENTAL_ITEMS_KEY, JSON.stringify(items));
}

export function loadRentalItems(): RentalItem[] {
  return loadItems();
}

export function saveRentalItem(item: Omit<RentalItem, 'id'> & { id?: string }): RentalItem {
  const items = loadItems();
  if (item.id) {
    const idx = items.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...item, id: item.id };
      saveItems(items);
      return items[idx];
    }
  }
  const nums = items.map(i => Number(i.id.match(/RNT-(\d+)/)?.[1] ?? 0));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  const created: RentalItem = {
    id: `RNT-${String(next).padStart(3, '0')}`,
    name: item.name,
    category: item.category,
    totalOwnedQty: item.totalOwnedQty,
    uom: item.uom,
    units: item.units,
  };
  saveItems([...items, created]);
  return created;
}

function normalizeChallanReason(challan: RentalChallan): ChallanReason {
  if (challan.reason) return challan.reason;
  const p = (challan.purpose || '').toLowerCase();
  if (p.includes('warranty')) return 'Warranty Repair';
  if (p.includes('service')) return 'Service';
  if (p.includes('rental') || p.includes('rent')) return 'Rental';
  return 'Other';
}

export function loadRentalChallans(): RentalChallan[] {
  try {
    const saved = localStorage.getItem(RENTAL_CHALLANS_KEY);
    if (saved) {
      const parsed: RentalChallan[] = JSON.parse(saved);
      if (parsed.length > 0) {
        return parsed.map(c => ({
          ...c,
          reason: c.reason ?? normalizeChallanReason(c as RentalChallan),
          consigneeAddress: c.consigneeAddress || c.buyerAddress,
        }));
      }
    }
  } catch { /* ignore */ }
  const seeded = buildSeedChallans();
  localStorage.setItem(RENTAL_CHALLANS_KEY, JSON.stringify(seeded));
  localStorage.setItem(RENTAL_CHALLAN_SEQ_KEY, '2');
  markSerialsOut('RNT-001', ['DL-LAT-001', 'DL-LAT-002'], 'RD000003810');
  return seeded;
}

function buildSeedChallans(): RentalChallan[] {
  return [
    {
      id: 'RD000003810',
      dateIssued: '2026-03-12',
      expectedReturnDate: '2026-04-12',
      buyerName: 'SKIPPERSEIL LIMITED',
      buyerAddress: 'PLOT NO SP 9A, SKIPPERSEIL LTD, KARARANI, BHIWADI, Alwar, Rajasthan, 301019',
      buyerGstin: '08AAACS3970N1ZM',
      buyerPhone: '9887468329',
      consigneeName: 'SKIPPERSEIL LIMITED',
      consigneeAddress: 'C/O SKIPPERSEIL LTD PLOT NO SP 9A, KARARANI, BHIWADI, RAJASTHAN-301019',
      reason: 'Rental',
      purpose: 'Laptop rental for on-site testing',
      jobWorkNo: 'JW-26-0038',
      status: 'Pending',
      operatorName: 'Anoop Singh',
      transporter: 'Universal Logistics',
      vehicleNo: 'DL01LAFB056',
      preparedBy: 'chirag',
      items: [
        {
          id: '1',
          rentalItemId: 'RNT-001',
          itemCode: 'RNT-001',
          description: 'Laptop - Dell Latitude 5540',
          hsnSac: '997319',
          qtyDispatched: 2,
          qtyReturned: 0,
          uom: 'Nos',
          serialNos: ['DL-LAT-001', 'DL-LAT-002'],
        },
      ],
    },
    {
      id: 'RDC-26-0085',
      dateIssued: '2026-06-20',
      expectedReturnDate: '2026-07-05',
      buyerName: 'TATA POWER COMPANY LTD',
      buyerAddress: 'Kalyan Substation, GIDC Phase II, Kalyan, Maharashtra, 421301',
      buyerGstin: '27AAACT2727Q1Z8',
      buyerPhone: '9988776655',
      consigneeName: 'TATA POWER COMPANY LTD',
      consigneeAddress: 'Kalyan Substation, GIDC Phase II, Kalyan, Maharashtra, 421301',
      reason: 'Rental',
      purpose: 'Filtration rig rental',
      jobWorkNo: 'JW-26-0048',
      status: 'Pending',
      preparedBy: 'chirag',
      items: [
        {
          id: '1',
          rentalItemId: 'RNT-003',
          itemCode: 'RNT-003',
          description: 'Filtration Rig 6000 LPH (Mobile)',
          hsnSac: '84219900',
          qtyDispatched: 2,
          qtyReturned: 0,
          uom: 'Nos',
        },
      ],
    },
  ];
}

function yearSuffix(): string {
  return String(new Date().getFullYear()).slice(-2);
}

function rentalSeqKey(): string {
  return `sp2_rental_challan_seq_${yearSuffix()}`;
}

function readRentalSeq(): number {
  return Number(localStorage.getItem(rentalSeqKey()) || '0');
}

function maxRentalSeqFromChallans(): number {
  const yy = yearSuffix();
  let max = 0;
  for (const c of loadRentalChallans()) {
    const m1 = c.id.match(/^RDC-(\d{2})-(\d+)$/i);
    if (m1 && m1[1] === yy) max = Math.max(max, Number(m1[2]));
    const m2 = c.id.match(/^RD0*(\d+)$/i);
    if (m2) max = Math.max(max, Number(m2[1]) - 810);
  }
  return max;
}

function syncRentalSeq(): void {
  const key = rentalSeqKey();
  const stored = readRentalSeq();
  const fromChallans = maxRentalSeqFromChallans();
  if (fromChallans > stored) {
    localStorage.setItem(key, String(fromChallans));
  }
}

/** Preview next number without consuming sequence */
export function peekNextChallanNo(): string {
  syncRentalSeq();
  const yy = yearSuffix();
  const next = readRentalSeq() + 1;
  return `RDC-${yy}-${String(next).padStart(4, '0')}`;
}

export function getNextChallanNo(): string {
  syncRentalSeq();
  const yy = yearSuffix();
  const key = rentalSeqKey();
  const next = readRentalSeq() + 1;
  localStorage.setItem(key, String(next));
  return `RDC-${yy}-${String(next).padStart(4, '0')}`;
}

export function loadCustomersForChallan(): Array<{
  id: string;
  name: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
}> {
  try {
    const saved = JSON.parse(localStorage.getItem('sp2_customers') || '[]');
    if (Array.isArray(saved) && saved.length > 0) return saved;
  } catch { /* ignore */ }
  return mockCustomers;
}

function formatCustomerAddress(c: { address?: string; city?: string; state?: string }): string {
  return [c.address, c.city, c.state].filter(Boolean).join(', ');
}

export function getCustomerOptions() {
  return loadCustomersForChallan().map(c => ({
    value: c.id,
    label: c.name,
    sublabel: formatCustomerAddress(c),
    searchText: `${c.name} ${c.gstin ?? ''} ${c.city ?? ''} ${c.state ?? ''}`,
    meta: {
      id: c.id,
      name: c.name,
      address: formatCustomerAddress(c),
      gstin: c.gstin ?? '',
      phone: c.phone ?? '',
    },
  }));
}

export function getQtyPending(line: RentalChallanLine): number {
  return Math.max(0, line.qtyDispatched - line.qtyReturned);
}

export function getLineReturnStatus(line: RentalChallanLine): ChallanLineReturnStatus {
  const pending = getQtyPending(line);
  if (pending <= 0) return 'Fully Returned';
  if (line.qtyReturned > 0) return 'Partial';
  return 'Not Returned';
}

export type ChallanItemStatusRow = {
  customerName: string;
  itemName: string;
  rentalItemId: string;
  challanNo: string;
  dateSent: string;
  deliveryAddress: string;
  qtySent: number;
  qtyReturned: number;
  qtyPending: number;
  uom: string;
  reason: ChallanReason;
  expectedReturnDate: string;
  lineStatus: ChallanLineReturnStatus;
  challanStatus: RentalChallan['status'];
};

export type ChallanBalanceFilters = {
  customer?: string;
  itemId?: string;
  address?: string;
  status?: 'All' | 'Pending' | 'Partial' | 'Closed' | ChallanLineReturnStatus;
  dateFrom?: string;
  dateTo?: string;
};

export function getChallanItemStatusRows(): ChallanItemStatusRow[] {
  return loadRentalChallans().flatMap(c =>
    c.items.map(line => ({
      customerName: c.buyerName,
      itemName: line.description,
      rentalItemId: line.rentalItemId,
      challanNo: c.id,
      dateSent: c.dateIssued,
      deliveryAddress: c.consigneeAddress || c.buyerAddress,
      qtySent: line.qtyDispatched,
      qtyReturned: line.qtyReturned,
      qtyPending: getQtyPending(line),
      uom: line.uom,
      reason: normalizeChallanReason(c),
      expectedReturnDate: c.expectedReturnDate,
      lineStatus: getLineReturnStatus(line),
      challanStatus: c.status,
    }))
  );
}

export function filterChallanItemStatusRows(
  rows: ChallanItemStatusRow[],
  filters: ChallanBalanceFilters
): ChallanItemStatusRow[] {
  return rows.filter(row => {
    if (filters.customer && !row.customerName.toLowerCase().includes(filters.customer.toLowerCase())) {
      return false;
    }
    if (filters.itemId && row.rentalItemId !== filters.itemId) return false;
    if (filters.address && !row.deliveryAddress.toLowerCase().includes(filters.address.toLowerCase())) {
      return false;
    }
    if (filters.dateFrom && row.dateSent < filters.dateFrom) return false;
    if (filters.dateTo && row.dateSent > filters.dateTo) return false;
    if (filters.status && filters.status !== 'All') {
      if (filters.status === 'Pending' && row.qtyPending <= 0) return false;
      if (filters.status === 'Closed' && row.lineStatus !== 'Fully Returned') return false;
      if (filters.status === 'Partial' && row.lineStatus !== 'Partial') return false;
      if (
        filters.status === 'Not Returned' ||
        filters.status === 'Fully Returned'
      ) {
        if (row.lineStatus !== filters.status) return false;
      }
    }
    return true;
  });
}

export type AgeingBucket = '0-15' | '16-30' | '31-60' | '60+';

export const AGEING_BUCKETS: AgeingBucket[] = ['0-15', '16-30', '31-60', '60+'];

export function getAgeingBucket(days: number): AgeingBucket {
  if (days <= 15) return '0-15';
  if (days <= 30) return '16-30';
  if (days <= 60) return '31-60';
  return '60+';
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.max(0, Math.round((to - from) / 86_400_000));
}

export type PendingItemListRow = ChallanItemStatusRow & {
  lineId: string;
  daysPending: number;
  ageingBucket: AgeingBucket;
  /** Last return date recorded against this line (fully-returned lines: closing date) */
  dateReturned?: string;
  /** Days from dispatch to final return (only for fully returned lines) */
  totalDaysTaken?: number;
  /** User who processed the closing return */
  closedBy?: string;
};

/**
 * All challan lines with ageing + history fields.
 * Pending view = rows with qtyPending > 0; History view = all rows.
 */
export function getPendingItemListRows(): PendingItemListRow[] {
  const today = new Date().toISOString().split('T')[0];
  return loadRentalChallans().flatMap(c =>
    c.items.map(line => {
      const qtyPending = getQtyPending(line);

      let dateReturned: string | undefined;
      let closedBy: string | undefined;
      for (const log of c.returnLogs ?? []) {
        if (!log.lines.some(l => l.lineId === line.id)) continue;
        if (!dateReturned || log.returnDate >= dateReturned) {
          dateReturned = log.returnDate;
          closedBy = log.processedBy;
        }
      }

      const isClosed = qtyPending <= 0;
      const daysPending = isClosed ? 0 : daysBetween(c.dateIssued, today);

      return {
        customerName: c.buyerName,
        itemName: line.description,
        rentalItemId: line.rentalItemId,
        challanNo: c.id,
        dateSent: c.dateIssued,
        deliveryAddress: c.consigneeAddress || c.buyerAddress,
        qtySent: line.qtyDispatched,
        qtyReturned: line.qtyReturned,
        qtyPending,
        uom: line.uom,
        reason: normalizeChallanReason(c),
        expectedReturnDate: c.expectedReturnDate,
        lineStatus: getLineReturnStatus(line),
        challanStatus: c.status,
        lineId: line.id,
        daysPending,
        ageingBucket: getAgeingBucket(daysPending),
        dateReturned,
        totalDaysTaken: isClosed && dateReturned ? daysBetween(c.dateIssued, dateReturned) : undefined,
        closedBy: isClosed ? closedBy : undefined,
      };
    })
  );
}

export type ItemWisePendingRow = {
  rentalItemId: string;
  itemName: string;
  totalQtySent: number;
  totalQtyReturned: number;
  totalQtyPending: number;
  uom: string;
};

export function getItemWisePendingReport(): ItemWisePendingRow[] {
  const map = new Map<string, ItemWisePendingRow>();
  for (const row of getChallanItemStatusRows()) {
    const existing = map.get(row.rentalItemId);
    if (existing) {
      existing.totalQtySent += row.qtySent;
      existing.totalQtyReturned += row.qtyReturned;
      existing.totalQtyPending += row.qtyPending;
    } else {
      map.set(row.rentalItemId, {
        rentalItemId: row.rentalItemId,
        itemName: row.itemName,
        totalQtySent: row.qtySent,
        totalQtyReturned: row.qtyReturned,
        totalQtyPending: row.qtyPending,
        uom: row.uom,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.itemName.localeCompare(b.itemName));
}

export type AddressWisePendingRow = {
  customerName: string;
  deliveryAddress: string;
  itemName: string;
  challanNo: string;
  dateSent: string;
  qtyPending: number;
  uom: string;
  reason: ChallanReason;
};

export function getAddressWisePendingReport(): AddressWisePendingRow[] {
  return getChallanItemStatusRows()
    .filter(r => r.qtyPending > 0)
    .map(r => ({
      customerName: r.customerName,
      deliveryAddress: r.deliveryAddress,
      itemName: r.itemName,
      challanNo: r.challanNo,
      dateSent: r.dateSent,
      qtyPending: r.qtyPending,
      uom: r.uom,
      reason: r.reason,
    }))
    .sort((a, b) =>
      a.deliveryAddress.localeCompare(b.deliveryAddress) ||
      a.customerName.localeCompare(b.customerName)
    );
}

export function getCustomerPendingItemsReport() {
  return getChallanItemStatusRows()
    .filter(r => r.qtyPending > 0)
    .map(r => ({
      customer: r.customerName,
      address: r.deliveryAddress,
      itemName: r.itemName,
      challanNo: r.challanNo,
      issueDate: r.dateSent,
      qtySent: r.qtySent,
      qtyReturned: r.qtyReturned,
      qtyPending: r.qtyPending,
      uom: r.uom,
      expectedReturnDate: r.expectedReturnDate,
      status: r.lineStatus,
      reason: r.reason,
    }));
}

function saveChallans(challans: RentalChallan[]): void {
  localStorage.setItem(RENTAL_CHALLANS_KEY, JSON.stringify(challans));
}

export function getQtyOutOnRent(rentalItemId: string): number {
  return loadRentalChallans()
    .filter(c => c.status !== 'Returned')
    .flatMap(c => c.items)
    .filter(l => l.rentalItemId === rentalItemId)
    .reduce((s, l) => s + (l.qtyDispatched - l.qtyReturned), 0);
}

export function getRentalStockStatus(rentalItemId: string): RentalStockStatus | null {
  const item = loadItems().find(i => i.id === rentalItemId);
  if (!item) return null;
  const qtyOutOnRent = getQtyOutOnRent(rentalItemId);
  const availableQty = Math.max(0, item.totalOwnedQty - qtyOutOnRent);
  return {
    rentalItemId: item.id,
    itemName: item.name,
    category: item.category,
    totalOwned: item.totalOwnedQty,
    qtyOutOnRent,
    availableQty,
    utilizationPct: item.totalOwnedQty > 0 ? Math.round((qtyOutOnRent / item.totalOwnedQty) * 100) : 0,
    uom: item.uom,
  };
}

export function getAllRentalStockStatus(): RentalStockStatus[] {
  return loadItems()
    .map(i => getRentalStockStatus(i.id)!)
    .filter(Boolean);
}

export function validateIssueQty(rentalItemId: string, qty: number): { ok: true } | { ok: false; message: string } {
  const stock = getRentalStockStatus(rentalItemId);
  if (!stock) return { ok: false, message: 'Rental item not found in master.' };
  if (stock.availableQty <= 0) {
    return {
      ok: false,
      message: `Cannot issue — all ${stock.totalOwned} units of "${stock.itemName}" are already out on rent.`,
    };
  }
  if (qty > stock.availableQty) {
    return {
      ok: false,
      message: `Only ${stock.availableQty} ${stock.uom} available — ${stock.qtyOutOnRent} already on rent.`,
    };
  }
  return { ok: true };
}

export function getAvailableSerials(rentalItemId: string): RentalAssetUnit[] {
  const item = loadItems().find(i => i.id === rentalItemId);
  if (!item?.units) return [];
  return item.units.filter(u => u.status === 'available');
}

export function validateSerials(rentalItemId: string, serialNos: string[]): { ok: true } | { ok: false; message: string } {
  const available = new Set(getAvailableSerials(rentalItemId).map(u => u.serialNo));
  for (const sn of serialNos) {
    if (!available.has(sn)) {
      return { ok: false, message: `Serial ${sn} is not available — already out or invalid.` };
    }
  }
  return { ok: true };
}

function markSerialsOut(rentalItemId: string, serialNos: string[], challanId: string): void {
  if (!serialNos.length) return;
  const items = loadItems();
  const item = items.find(i => i.id === rentalItemId);
  if (!item?.units) return;
  item.units = item.units.map(u =>
    serialNos.includes(u.serialNo)
      ? { ...u, status: 'out' as const, currentChallanId: challanId }
      : u
  );
  saveItems(items);
}

function markSerialsReturned(rentalItemId: string, serialNos: string[], condition: RentalReturnLog['condition']): void {
  if (!serialNos.length) return;
  const items = loadItems();
  const item = items.find(i => i.id === rentalItemId);
  if (!item?.units) return;
  const newStatus = condition === 'Damaged' ? 'damaged' : condition === 'Under Repair' ? 'under_repair' : 'available';
  item.units = item.units.map(u =>
    serialNos.includes(u.serialNo)
      ? { ...u, status: newStatus, currentChallanId: undefined }
      : u
  );
  saveItems(items);
}

export function issueOutwardChallan(challan: RentalChallan): RentalChallan {
  for (const line of challan.items) {
    if (!line.rentalItemId) continue;
    const check = validateIssueQty(line.rentalItemId, line.qtyDispatched);
    if (!check.ok) throw new Error(check.message);
    if (line.serialNos?.length) {
      const serialCheck = validateSerials(line.rentalItemId, line.serialNos);
      if (!serialCheck.ok) throw new Error(serialCheck.message);
    }
  }

  const all = loadRentalChallans();
  saveChallans([challan, ...all]);

  for (const line of challan.items) {
    if (line.serialNos?.length) {
      markSerialsOut(line.rentalItemId, line.serialNos, challan.id);
    }
  }
  return challan;
}

export function recordReturn(
  challanId: string,
  returnDate: string,
  condition: RentalReturnLog['condition'],
  lineReturns: Record<string, number>,
  remarks?: string,
  processedBy?: string
): RentalChallan {
  const all = loadRentalChallans();
  const idx = all.findIndex(c => c.id === challanId);
  if (idx === -1) throw new Error('Challan not found.');

  const challan = { ...all[idx] };
  let anyReturned = false;
  let allReturned = true;

  const logLines: RentalReturnLog['lines'] = [];

  challan.items = challan.items.map(line => {
    const retQty = lineReturns[line.id] || 0;
    if (retQty <= 0) {
      if (line.qtyReturned < line.qtyDispatched) allReturned = false;
      return line;
    }
    const maxAllowed = line.qtyDispatched - line.qtyReturned;
    if (retQty > maxAllowed) {
      throw new Error(`Cannot return ${retQty} for ${line.description} — only ${maxAllowed} ${line.uom} outstanding.`);
    }
    anyReturned = true;
    const newReturned = line.qtyReturned + retQty;
    if (newReturned < line.qtyDispatched) allReturned = false;
    logLines.push({ lineId: line.id, qtyReturned: retQty });

    if (line.serialNos?.length) {
      const returningSerials = line.serialNos.slice(line.qtyReturned, line.qtyReturned + retQty);
      markSerialsReturned(line.rentalItemId, returningSerials, condition);
      for (const sn of returningSerials) {
        recordRentalReturnHistory({
          assetId: `${line.rentalItemId}::${sn}`,
          assetName: line.description,
          serialNo: sn,
          customerName: challan.buyerName,
          challanNo: challan.id,
          dateGiven: challan.dateIssued,
          dateReturned: returnDate,
        });
      }
    } else {
      for (let i = 0; i < retQty; i++) {
        const unitIdx = line.qtyReturned + i + 1;
        recordRentalReturnHistory({
          assetId: `${line.rentalItemId}::unit-${unitIdx}`,
          assetName: line.description,
          serialNo: `— (${line.rentalItemId} unit ${unitIdx})`,
          customerName: challan.buyerName,
          challanNo: challan.id,
          dateGiven: challan.dateIssued,
          dateReturned: returnDate,
        });
      }
    }

    return { ...line, qtyReturned: newReturned };
  });

  if (!anyReturned) throw new Error('Enter at least one return quantity.');

  challan.status = allReturned ? 'Returned' : 'Partial';
  const log: RentalReturnLog = {
    id: `RRT-${Date.now()}`,
    returnDate,
    condition,
    remarks,
    processedBy,
    lines: logLines,
  };
  challan.returnLogs = [...(challan.returnLogs ?? []), log];
  all[idx] = challan;
  saveChallans(all);
  return challan;
}

export function getCustomerRentalReport() {
  const today = new Date().toISOString().split('T')[0];
  return getCustomerPendingItemsReport().map(r => ({
    customer: r.customer,
    itemName: r.itemName,
    qtyOut: r.qtyPending,
    challanNo: r.challanNo,
    issueDate: r.issueDate,
    expectedReturnDate: r.expectedReturnDate,
    status: r.expectedReturnDate < today
      ? 'Overdue' as const
      : r.status === 'Partial'
        ? 'Partial' as const
        : 'Pending' as const,
  }));
}

export function getOverdueReturnReport() {
  const today = new Date().toISOString().split('T')[0];
  return getCustomerRentalReport().filter(r => r.status === 'Overdue');
}

export function getRentalItemOptions() {
  return loadItems().map(i => {
    const stock = getRentalStockStatus(i.id)!;
    return {
      value: i.id,
      label: i.name,
      sublabel: `${stock.availableQty}/${stock.totalOwned} available · ${i.category}`,
      searchText: `${i.id} ${i.name} ${i.category}`,
    };
  });
}
