import { recordRentalReturnHistory } from './assetVisitHistory';

const RENTAL_ITEMS_KEY = 'sp2_rental_items';
const RENTAL_CHALLANS_KEY = 'sp2_rental_challans';
const RENTAL_CHALLAN_SEQ_KEY = 'sp2_rental_challan_seq';

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
  purpose: string;
  jobWorkNo: string;
  status: 'Pending' | 'Partial' | 'Returned' | 'Overdue';
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

export function loadRentalChallans(): RentalChallan[] {
  try {
    const saved = localStorage.getItem(RENTAL_CHALLANS_KEY);
    if (saved) {
      const parsed: RentalChallan[] = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
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

export function getCustomerOptions() {
  try {
    const customers = JSON.parse(localStorage.getItem('sp2_customers') || '[]') as Array<{
      id: string;
      name: string;
      address?: string;
      gstin?: string;
      phone?: string;
    }>;
    return customers.map(c => ({
      value: c.id,
      label: c.name,
      sublabel: c.address,
      searchText: `${c.name} ${c.gstin ?? ''}`,
      meta: c,
    }));
  } catch {
    return [];
  }
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
  remarks?: string
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
    lines: logLines,
  };
  challan.returnLogs = [...(challan.returnLogs ?? []), log];
  all[idx] = challan;
  saveChallans(all);
  return challan;
}

export function getCustomerRentalReport() {
  const today = new Date().toISOString().split('T')[0];
  return loadRentalChallans()
    .filter(c => c.status !== 'Returned')
    .flatMap(c =>
      c.items
        .filter(l => l.qtyDispatched - l.qtyReturned > 0)
        .map(l => ({
          customer: c.buyerName,
          itemName: l.description,
          qtyOut: l.qtyDispatched - l.qtyReturned,
          challanNo: c.id,
          issueDate: c.dateIssued,
          expectedReturnDate: c.expectedReturnDate,
          status: c.expectedReturnDate < today ? 'Overdue' as const : c.status === 'Partial' ? 'Partial' as const : 'Pending' as const,
        }))
    );
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
