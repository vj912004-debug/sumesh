import { loadInventory } from './woMaterialIssue';
import { getInventoryItemOptions } from './plantCatalogQuote';

const PO_KEY = 'sp2_purchase_orders';

export type PoPurpose = 'Manufacture' | 'Sales' | 'Rental' | 'General';

export const PO_PURPOSE_OPTIONS: { value: PoPurpose; label: string; description: string }[] = [
  { value: 'Manufacture', label: 'Manufacture', description: 'Raw materials & parts for production / work orders' },
  { value: 'Sales', label: 'Sales', description: 'Items procured against a sales order or client delivery' },
  { value: 'Rental', label: 'Rental', description: 'Equipment, spares, or assets for rental fleet' },
  { value: 'General', label: 'General Stock', description: 'General store replenishment (not tied to a job)' },
];

export type PurchaseOrderLine = {
  id: string;
  inventoryItemId: string;
  itemCode: string;
  description: string;
  qty: number;
  rate: number;
  uom: string;
};

export type PurchaseOrder = {
  id: string;
  poPurpose: PoPurpose;
  vendorName: string;
  vendorGstin?: string;
  vendorAddress?: string;
  vendorContact?: string;
  poDate: string;
  deliveryDate: string;
  workOrderRef?: string;
  status: 'Draft' | 'Pending' | 'Received' | 'Cancelled';
  lines: PurchaseOrderLine[];
  remarks?: string;
};

export type CreatePurchaseOrderInput = {
  poPurpose: PoPurpose;
  vendorName: string;
  vendorGstin?: string;
  vendorAddress?: string;
  vendorContact?: string;
  deliveryDate: string;
  workOrderRef?: string;
  remarks?: string;
  lines: Array<{ inventoryItemId: string; qty: number; rate?: number }>;
};

const VENDOR_PRESETS = [
  'Laxmi Steels & Alloys',
  'ABB India Ltd',
  'Gujarat Pipes',
  'Siemens India Ltd',
  'Leybold GmbH (India)',
];

export { VENDOR_PRESETS };

function yearSuffix(): string {
  return String(new Date().getFullYear()).slice(-2);
}

function seqKey(): string {
  return `sp2_po_seq_${yearSuffix()}`;
}

function readSeq(): number {
  return Number(localStorage.getItem(seqKey()) || '0');
}

function syncSeq(): void {
  const yy = yearSuffix();
  let max = 0;
  for (const po of loadPurchaseOrders()) {
    const m = po.id.match(/^PO-(\d{2})-(\d+)$/i);
    if (m && m[1] === yy) max = Math.max(max, Number(m[2]));
  }
  if (max > readSeq()) localStorage.setItem(seqKey(), String(max));
}

export function peekNextPoNo(): string {
  syncSeq();
  const yy = yearSuffix();
  return `PO-${yy}-${String(readSeq() + 1).padStart(3, '0')}`;
}

export function getNextPoNo(): string {
  syncSeq();
  const yy = yearSuffix();
  const next = readSeq() + 1;
  localStorage.setItem(seqKey(), String(next));
  return `PO-${yy}-${String(next).padStart(3, '0')}`;
}

function buildSeed(): PurchaseOrder[] {
  return [
    {
      id: 'PO-26-050',
      poPurpose: 'Manufacture',
      vendorName: 'Laxmi Steels & Alloys',
      vendorGstin: '24AABCL1234F1Z9',
      vendorAddress: 'Plot 45, GIDC Makarpura, Vadodara, Gujarat - 390010',
      vendorContact: 'Rajesh Patel (+91 98980XXXXX)',
      poDate: '2026-06-25',
      deliveryDate: '2026-07-05',
      status: 'Received',
      lines: [
        { id: '1', inventoryItemId: 'INV-1001', itemCode: 'MS-PL-10MM', description: 'MS Plate 10mm IS2062', qty: 5000, rate: 65, uom: 'Kg' },
        { id: '2', inventoryItemId: 'INV-1006', itemCode: 'SS-PL-3MM', description: 'SS Plate 3mm SS304', qty: 1200, rate: 185, uom: 'Kg' },
      ],
    },
    {
      id: 'PO-26-051',
      poPurpose: 'Manufacture',
      vendorName: 'ABB India Ltd',
      poDate: '2026-06-28',
      deliveryDate: '2026-07-10',
      status: 'Pending',
      lines: [
        { id: '1', inventoryItemId: 'INV-1011', itemCode: 'MTR-5HP-3PH', description: 'Motor 5HP 3 Phase', qty: 4, rate: 28500, uom: 'Nos' },
      ],
    },
    {
      id: 'PO-26-052',
      poPurpose: 'Rental',
      vendorName: 'Gujarat Pipes',
      poDate: '2026-06-29',
      deliveryDate: '2026-07-12',
      status: 'Pending',
      lines: [
        { id: '1', inventoryItemId: 'INV-1013', itemCode: 'HOSE-R4-1IN', description: 'Hydraulic Hose R4 1 Inch', qty: 100, rate: 320, uom: 'Mtr' },
      ],
    },
  ];
}

export function loadPurchaseOrders(): PurchaseOrder[] {
  try {
    const saved = localStorage.getItem(PO_KEY);
    if (saved) {
      const parsed: PurchaseOrder[] = JSON.parse(saved);
      if (parsed.length > 0) {
        return parsed.map(po => ({
          ...po,
          poPurpose: po.poPurpose ?? 'General',
        }));
      }
    }
  } catch { /* ignore */ }
  const seeded = buildSeed();
  localStorage.setItem(PO_KEY, JSON.stringify(seeded));
  localStorage.setItem(seqKey(), '52');
  return seeded;
}

function saveAll(orders: PurchaseOrder[]): void {
  localStorage.setItem(PO_KEY, JSON.stringify(orders));
}

export function getPurchaseOrderById(id: string): PurchaseOrder | undefined {
  return loadPurchaseOrders().find(po => po.id === id);
}

export function getPoItemOptions() {
  return getInventoryItemOptions();
}

export function createPurchaseOrder(input: CreatePurchaseOrderInput): PurchaseOrder {
  if (!input.vendorName.trim()) throw new Error('Vendor name is required.');
  if (!input.poPurpose) throw new Error('Select what this PO is for.');
  if (!input.lines.length) throw new Error('Add at least one line item.');

  const lines: PurchaseOrderLine[] = input.lines.map((line, idx) => {
    const item = loadInventory().find(i => i.id === line.inventoryItemId);
    if (!item) throw new Error('Item not found in Item Master.');
    return {
      id: String(idx + 1),
      inventoryItemId: line.inventoryItemId,
      itemCode: item.partNumber,
      description: item.name,
      qty: line.qty,
      rate: line.rate ?? item.unitCost,
      uom: item.uom,
    };
  });

  const po: PurchaseOrder = {
    id: getNextPoNo(),
    poPurpose: input.poPurpose,
    vendorName: input.vendorName.trim(),
    vendorGstin: input.vendorGstin,
    vendorAddress: input.vendorAddress,
    vendorContact: input.vendorContact,
    poDate: new Date().toISOString().split('T')[0],
    deliveryDate: input.deliveryDate,
    workOrderRef: input.workOrderRef,
    status: 'Pending',
    lines,
    remarks: input.remarks,
  };

  saveAll([po, ...loadPurchaseOrders()]);
  return po;
}

export function getPoTotal(po: PurchaseOrder): number {
  return po.lines.reduce((s, l) => s + l.qty * l.rate, 0);
}

export function updatePoStatus(id: string, status: PurchaseOrder['status']): void {
  const all = loadPurchaseOrders();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], status };
  saveAll(all);
}
