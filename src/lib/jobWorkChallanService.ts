import { loadInventory } from './woMaterialIssue';
import { getInventoryItemOptions } from './plantCatalogQuote';

const OUTWARD_KEY = 'sp2_job_work_outward_challans';

export type JobWorkChallanLine = {
  id: string;
  inventoryItemId: string;
  itemCode: string;
  description: string;
  hsnSac: string;
  qtyDispatched: number;
  qtyReturned: number;
  uom: string;
};

export type JobWorkInwardReceipt = {
  id: string;
  returnDate: string;
  scrapQty: number;
  qcStatus: 'QC Pending' | 'Accepted' | 'Rejected';
  remarks?: string;
  lines: Array<{ lineId: string; qtyReturned: number }>;
};

export type JobWorkOutwardChallan = {
  id: string;
  dateIssued: string;
  expectedReturnDate: string;
  subcontractorName: string;
  subcontractorGstin?: string;
  subcontractorAddress?: string;
  workOrderRef?: string;
  processDescription: string;
  formRef: string;
  status: 'Pending' | 'Partial' | 'Received' | 'Overdue';
  items: JobWorkChallanLine[];
  inwardReceipts?: JobWorkInwardReceipt[];
};

export type JobWorkOutwardInput = {
  subcontractorName: string;
  subcontractorGstin?: string;
  subcontractorAddress?: string;
  workOrderRef?: string;
  processDescription: string;
  expectedReturnDate: string;
  items: Array<{ inventoryItemId: string; qty: number }>;
};

const PROCESS_TYPES = [
  'Laser Cutting',
  'Welding & Fabrication',
  'Machining',
  'Powder Coating',
  'Heat Treatment',
  'Stress Relieving',
  'Assembly',
  'Other',
] as const;

export { PROCESS_TYPES };

function yearSuffix(): string {
  return String(new Date().getFullYear()).slice(-2);
}

function seqKey(): string {
  return `sp2_job_work_challan_seq_${yearSuffix()}`;
}

function readSeq(): number {
  return Number(localStorage.getItem(seqKey()) || '0');
}

function syncSeq(): void {
  const yy = yearSuffix();
  let max = 0;
  for (const c of loadJobWorkOutwardChallans()) {
    const m = c.id.match(/^DC-JW-(\d{2})-(\d+)$/i);
    if (m && m[1] === yy) max = Math.max(max, Number(m[2]));
  }
  if (max > readSeq()) localStorage.setItem(seqKey(), String(max));
}

export function peekNextJobWorkChallanNo(): string {
  syncSeq();
  const yy = yearSuffix();
  return `DC-JW-${yy}-${String(readSeq() + 1).padStart(4, '0')}`;
}

export function getNextJobWorkChallanNo(): string {
  syncSeq();
  const yy = yearSuffix();
  const next = readSeq() + 1;
  localStorage.setItem(seqKey(), String(next));
  return `DC-JW-${yy}-${String(next).padStart(4, '0')}`;
}

function nextInwardReceiptNo(): string {
  const yy = yearSuffix();
  const key = `sp2_job_work_inward_seq_${yy}`;
  const next = Number(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, String(next));
  return `JWR-${yy}-${String(next).padStart(4, '0')}`;
}

function loadAll(): JobWorkOutwardChallan[] {
  try {
    const saved = localStorage.getItem(OUTWARD_KEY);
    if (saved) {
      const parsed: JobWorkOutwardChallan[] = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  const seeded = buildSeed();
  localStorage.setItem(OUTWARD_KEY, JSON.stringify(seeded));
  localStorage.setItem(seqKey(), '2');
  return seeded;
}

function saveAll(challans: JobWorkOutwardChallan[]): void {
  localStorage.setItem(OUTWARD_KEY, JSON.stringify(challans));
}

function buildSeed(): JobWorkOutwardChallan[] {
  return [
    {
      id: 'DC-JW-26-0010',
      dateIssued: '2026-06-28',
      expectedReturnDate: '2026-07-12',
      subcontractorName: 'Shreeji Laser Cutting',
      subcontractorGstin: '24AABCS1234F1Z5',
      subcontractorAddress: 'GIDC Makarpura, Vadodara',
      workOrderRef: 'WO-26-101',
      processDescription: 'Laser Cutting',
      formRef: '57F4',
      status: 'Pending',
      items: [
        {
          id: '1',
          inventoryItemId: 'INV-1001',
          itemCode: 'MS-PL-10MM',
          description: 'MS Plate 10mm IS2062',
          hsnSac: '7208',
          qtyDispatched: 500,
          qtyReturned: 0,
          uom: 'Kg',
        },
      ],
    },
    {
      id: 'DC-JW-26-0011',
      dateIssued: '2026-06-29',
      expectedReturnDate: '2026-07-08',
      subcontractorName: 'Om Fabricators',
      workOrderRef: 'WO-26-102',
      processDescription: 'Welding & Fabrication',
      formRef: '57F4',
      status: 'Pending',
      items: [
        {
          id: '1',
          inventoryItemId: 'INV-1019',
          itemCode: 'TANK-MS-5KL',
          description: 'MS Storage Tank 5 KL (Shell)',
          hsnSac: '7309',
          qtyDispatched: 1,
          qtyReturned: 0,
          uom: 'Nos',
        },
      ],
    },
  ];
}

export function loadJobWorkOutwardChallans(): JobWorkOutwardChallan[] {
  return loadAll();
}

export function getJobWorkItemOptions() {
  return getInventoryItemOptions().map(o => ({
    ...o,
    sublabel: o.sublabel,
  }));
}

export function getAvailableStockForItem(inventoryItemId: string): number {
  const item = loadInventory().find(i => i.id === inventoryItemId);
  return item ? item.stockMain + item.stockSubcon : 0;
}

export function validateJobWorkIssue(
  inventoryItemId: string,
  qty: number
): { ok: true } | { ok: false; message: string } {
  const item = loadInventory().find(i => i.id === inventoryItemId);
  if (!item) return { ok: false, message: 'Item not found in Item Master.' };
  const available = item.stockMain + item.stockSubcon;
  if (qty > available) {
    return {
      ok: false,
      message: `Only ${available} ${item.uom} available for ${item.name} — cannot issue ${qty}.`,
    };
  }
  return { ok: true };
}

export function issueJobWorkOutward(input: JobWorkOutwardInput): JobWorkOutwardChallan {
  if (!input.items.length) throw new Error('Add at least one material line.');
  for (const line of input.items) {
    const check = validateJobWorkIssue(line.inventoryItemId, line.qty);
    if (!check.ok) throw new Error(check.message);
  }

  const challan: JobWorkOutwardChallan = {
    id: getNextJobWorkChallanNo(),
    dateIssued: new Date().toISOString().split('T')[0],
    expectedReturnDate: input.expectedReturnDate,
    subcontractorName: input.subcontractorName,
    subcontractorGstin: input.subcontractorGstin,
    subcontractorAddress: input.subcontractorAddress,
    workOrderRef: input.workOrderRef,
    processDescription: input.processDescription,
    formRef: '57F4',
    status: 'Pending',
    items: input.items.map((line, idx) => {
      const item = loadInventory().find(i => i.id === line.inventoryItemId)!;
      return {
        id: String(idx + 1),
        inventoryItemId: line.inventoryItemId,
        itemCode: item.partNumber,
        description: item.name,
        hsnSac: '9988',
        qtyDispatched: line.qty,
        qtyReturned: 0,
        uom: item.uom,
      };
    }),
  };

  saveAll([challan, ...loadAll()]);
  return challan;
}

export function recordJobWorkInward(
  outwardChallanId: string,
  returnDate: string,
  lineReturns: Record<string, number>,
  scrapQty: number,
  qcStatus: JobWorkInwardReceipt['qcStatus'],
  remarks?: string
): JobWorkOutwardChallan {
  const all = loadAll();
  const idx = all.findIndex(c => c.id === outwardChallanId);
  if (idx === -1) throw new Error('Outward job work challan not found.');

  const challan = { ...all[idx] };
  let anyReturned = false;
  let allReturned = true;
  const receiptLines: JobWorkInwardReceipt['lines'] = [];

  challan.items = challan.items.map(line => {
    const ret = lineReturns[line.id] || 0;
    if (ret <= 0) {
      if (line.qtyReturned < line.qtyDispatched) allReturned = false;
      return line;
    }
    const max = line.qtyDispatched - line.qtyReturned;
    if (ret > max) {
      throw new Error(`Cannot receive ${ret} for ${line.description} — only ${max} ${line.uom} outstanding.`);
    }
    anyReturned = true;
    const newReturned = line.qtyReturned + ret;
    if (newReturned < line.qtyDispatched) allReturned = false;
    receiptLines.push({ lineId: line.id, qtyReturned: ret });
    return { ...line, qtyReturned: newReturned };
  });

  if (!anyReturned) throw new Error('Enter at least one received quantity.');

  challan.status = allReturned ? 'Received' : 'Partial';
  const receipt: JobWorkInwardReceipt = {
    id: nextInwardReceiptNo(),
    returnDate,
    scrapQty,
    qcStatus,
    remarks,
    lines: receiptLines,
  };
  challan.inwardReceipts = [...(challan.inwardReceipts ?? []), receipt];
  all[idx] = challan;
  saveAll(all);
  return challan;
}

export function getOpenJobWorkChallanOptions() {
  return loadAll()
    .filter(c => c.status !== 'Received')
    .map(c => ({
      value: c.id,
      label: c.id,
      sublabel: `${c.subcontractorName} · ${c.processDescription}`,
      searchText: `${c.id} ${c.subcontractorName} ${c.workOrderRef ?? ''}`,
    }));
}

export function getPendingJobWorkReport() {
  const today = new Date().toISOString().split('T')[0];
  return loadAll()
    .filter(c => c.status !== 'Received')
    .map(c => ({
      challanNo: c.id,
      date: c.dateIssued,
      subcontractor: c.subcontractorName,
      process: c.processDescription,
      workOrderRef: c.workOrderRef ?? '—',
      expectedReturn: c.expectedReturnDate,
      qtyOutstanding: c.items.reduce((s, l) => s + (l.qtyDispatched - l.qtyReturned), 0),
      status: c.expectedReturnDate < today ? 'Overdue' as const : c.status,
      items: c.items.map(l => l.description).join(', '),
    }));
}

export function getSubcontractorJobWorkReport() {
  return getPendingJobWorkReport();
}
