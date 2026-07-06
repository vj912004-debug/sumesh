import { recordWarrantyReturnHistory } from './assetVisitHistory';

const ASSETS_KEY = 'sp2_warranty_assets';
const OUTWARD_KEY = 'sp2_warranty_outward_challans';
const SEQ_KEY = 'sp2_warranty_challan_seq';

export type WarrantyStatus = 'Under Warranty' | 'Out of Warranty' | 'Extended Warranty';
export type RepairStatus = 'Repaired & OK' | 'Replaced with New Unit' | 'Not Repairable';
export type AssetStatus = 'available' | 'in_use' | 'out_for_repair' | 'not_repairable';

export type WarrantyAsset = {
  id: string;
  itemName: string;
  serialNo: string;
  assetTag?: string;
  purchaseInvoiceRef?: string;
  warrantyExpiry?: string;
  customerName?: string;
  status: AssetStatus;
  outwardChallanId?: string;
};

export type WarrantyInwardReturn = {
  returnDate: string;
  repairStatus: RepairStatus;
  repairRemarks?: string;
  newSerialNo?: string;
  newWarrantyStartDate?: string;
};

export type WarrantyOutwardChallan = {
  id: string;
  dateIssued: string;
  assetId: string;
  itemName: string;
  serialNo: string;
  vendorName: string;
  warrantyStatus: WarrantyStatus;
  warrantyRefNo?: string;
  reasonForReturn: string;
  customerName?: string;
  expectedReturnDate: string;
  serviceCharge?: number;
  status: 'Pending' | 'Returned' | 'Overdue';
  inwardReturn?: WarrantyInwardReturn;
};

export type ItemsOutForRepairRow = {
  challanNo: string;
  itemName: string;
  serialNo: string;
  vendor: string;
  sentDate: string;
  warrantyStatus: WarrantyStatus;
  expectedReturn: string;
  status: 'Pending' | 'Overdue';
  customerName?: string;
};

export type WarrantyClaimRow = {
  outwardChallanNo: string;
  inwardDate?: string;
  itemName: string;
  serialNo: string;
  vendor: string;
  sentDate: string;
  warrantyStatus: WarrantyStatus;
  outcome?: RepairStatus;
  customerName?: string;
};

const SEED_ASSETS: WarrantyAsset[] = [
  {
    id: 'AST-001',
    itemName: 'Rotary Vane Vacuum Pump',
    serialNo: 'LB-902187-X',
    assetTag: 'SER-TP-401',
    purchaseInvoiceRef: 'PINV-25-1180',
    warrantyExpiry: '2027-12-31',
    customerName: 'Tata Power',
    status: 'available',
  },
  {
    id: 'AST-002',
    itemName: 'Heater Contactor Relay',
    serialNo: 'SE-CON-44',
    assetTag: 'SER-TP-402',
    purchaseInvoiceRef: 'PINV-25-1192',
    warrantyExpiry: '2026-10-15',
    customerName: 'SKIPPERSEIL LIMITED',
    status: 'in_use',
  },
  {
    id: 'AST-003',
    itemName: 'Positive Displacement Pump',
    serialNo: 'TSH-7721-P',
    assetTag: 'SER-TP-403',
    purchaseInvoiceRef: 'PINV-24-0901',
    warrantyExpiry: '2028-01-31',
    status: 'available',
  },
  {
    id: 'AST-004',
    itemName: 'Laptop - Dell Latitude 5540',
    serialNo: 'DL-LAT-015',
    purchaseInvoiceRef: 'PINV-26-0044',
    warrantyExpiry: '2029-03-01',
    customerName: 'Reliance Industries',
    status: 'available',
  },
];

function loadAssets(): WarrantyAsset[] {
  try {
    const saved = localStorage.getItem(ASSETS_KEY);
    if (saved) {
      const parsed: WarrantyAsset[] = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  localStorage.setItem(ASSETS_KEY, JSON.stringify(SEED_ASSETS));
  return SEED_ASSETS;
}

function saveAssets(assets: WarrantyAsset[]): void {
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
}

function loadOutward(): WarrantyOutwardChallan[] {
  try {
    const saved = localStorage.getItem(OUTWARD_KEY);
    if (saved) {
      const parsed: WarrantyOutwardChallan[] = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  const seeded = buildSeedOutward();
  localStorage.setItem(OUTWARD_KEY, JSON.stringify(seeded));
  localStorage.setItem(SEQ_KEY, '2');
  markAssetOutForRepair('AST-001', 'WR-000003811');
  return seeded;
}

function buildSeedOutward(): WarrantyOutwardChallan[] {
  return [
    {
      id: 'WR-000003811',
      dateIssued: '2026-06-10',
      assetId: 'AST-001',
      itemName: 'Rotary Vane Vacuum Pump',
      serialNo: 'LB-902187-X',
      vendorName: 'Leybold GmbH (India)',
      warrantyStatus: 'Under Warranty',
      warrantyRefNo: 'PINV-25-1180 / WC-LEY-902187',
      reasonForReturn: 'Vacuum drop below 0.5 mbar — suspected vane wear',
      customerName: 'Tata Power',
      expectedReturnDate: '2026-07-10',
      status: 'Pending',
    },
  ];
}

function saveOutward(challans: WarrantyOutwardChallan[]): void {
  localStorage.setItem(OUTWARD_KEY, JSON.stringify(challans));
}

function markAssetOutForRepair(assetId: string, challanId: string): void {
  const assets = loadAssets();
  const idx = assets.findIndex(a => a.id === assetId);
  if (idx === -1) return;
  assets[idx] = { ...assets[idx], status: 'out_for_repair', outwardChallanId: challanId };
  saveAssets(assets);
}

export function loadWarrantyAssets(): WarrantyAsset[] {
  return loadAssets();
}

export function saveWarrantyAsset(asset: Omit<WarrantyAsset, 'id'> & { id?: string }): WarrantyAsset {
  const assets = loadAssets();
  if (asset.id) {
    const idx = assets.findIndex(a => a.id === asset.id);
    if (idx !== -1) {
      assets[idx] = { ...assets[idx], ...asset, id: asset.id };
      saveAssets(assets);
      return assets[idx];
    }
  }
  const nums = assets.map(a => Number(a.id.match(/AST-(\d+)/)?.[1] ?? 0));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  const created: WarrantyAsset = {
    id: `AST-${String(next).padStart(3, '0')}`,
    itemName: asset.itemName,
    serialNo: asset.serialNo,
    assetTag: asset.assetTag,
    purchaseInvoiceRef: asset.purchaseInvoiceRef,
    warrantyExpiry: asset.warrantyExpiry,
    customerName: asset.customerName,
    status: asset.status ?? 'available',
  };
  saveAssets([...assets, created]);
  return created;
}

export function loadWarrantyOutwardChallans(): WarrantyOutwardChallan[] {
  return loadOutward();
}

function warrantySeqKey(): string {
  return `sp2_warranty_challan_seq_${yearSuffix()}`;
}

function yearSuffix(): string {
  return String(new Date().getFullYear()).slice(-2);
}

function readWarrantySeq(): number {
  return Number(localStorage.getItem(warrantySeqKey()) || '0');
}

function maxWarrantySeqFromChallans(): number {
  const yy = yearSuffix();
  let max = 0;
  for (const c of loadOutward()) {
    const m1 = c.id.match(/^WR-(\d{2})-(\d+)$/i);
    if (m1 && m1[1] === yy) max = Math.max(max, Number(m1[2]));
    const m2 = c.id.match(/^WR-0*(\d+)$/i);
    if (m2) max = Math.max(max, Number(m2[1]) - 810);
  }
  return max;
}

function syncWarrantySeq(): void {
  const key = warrantySeqKey();
  const stored = readWarrantySeq();
  const fromChallans = maxWarrantySeqFromChallans();
  if (fromChallans > stored) {
    localStorage.setItem(key, String(fromChallans));
  }
}

/** Preview next warranty outward challan no. */
export function peekNextWarrantyChallanNo(): string {
  syncWarrantySeq();
  const yy = yearSuffix();
  const next = readWarrantySeq() + 1;
  return `WR-${yy}-${String(next).padStart(4, '0')}`;
}

export function getNextWarrantyChallanNo(): string {
  syncWarrantySeq();
  const yy = yearSuffix();
  const key = warrantySeqKey();
  const next = readWarrantySeq() + 1;
  localStorage.setItem(key, String(next));
  return `WR-${yy}-${String(next).padStart(4, '0')}`;
}

export function getWarrantyAssetOptions() {
  return loadAssets().map(a => ({
    value: a.id,
    label: `${a.itemName} — ${a.serialNo}`,
    sublabel: `${a.assetTag ?? a.id} · ${a.status.replace(/_/g, ' ')}${a.purchaseInvoiceRef ? ` · ${a.purchaseInvoiceRef}` : ''}`,
    searchText: `${a.itemName} ${a.serialNo} ${a.assetTag ?? ''} ${a.purchaseInvoiceRef ?? ''} ${a.customerName ?? ''}`,
    meta: a,
  }));
}

export function getOpenWarrantyChallanOptions() {
  return loadOutward()
    .filter(c => c.status !== 'Returned')
    .map(c => ({
      value: c.id,
      label: c.id,
      sublabel: `${c.itemName} → ${c.vendorName}`,
      searchText: `${c.id} ${c.serialNo} ${c.vendorName}`,
      meta: c,
    }));
}

export type WarrantyOutwardInput = {
  assetId: string;
  vendorName: string;
  warrantyStatus: WarrantyStatus;
  warrantyRefNo?: string;
  reasonForReturn: string;
  customerName?: string;
  expectedReturnDate: string;
  serviceCharge?: number;
  id?: string;
  dateIssued?: string;
};

export function issueWarrantyOutward(input: WarrantyOutwardInput): WarrantyOutwardChallan {
  const asset = loadAssets().find(a => a.id === input.assetId);
  if (!asset) throw new Error('Asset not found in purchase/asset records.');
  if (asset.status === 'out_for_repair') {
    throw new Error(`Asset ${asset.serialNo} is already out for warranty repair (challan ${asset.outwardChallanId}).`);
  }

  const challan: WarrantyOutwardChallan = {
    id: input.id ?? getNextWarrantyChallanNo(),
    dateIssued: input.dateIssued ?? new Date().toISOString().split('T')[0],
    assetId: input.assetId,
    itemName: asset.itemName,
    serialNo: asset.serialNo,
    vendorName: input.vendorName,
    warrantyStatus: input.warrantyStatus,
    warrantyRefNo: input.warrantyRefNo ?? asset.purchaseInvoiceRef,
    reasonForReturn: input.reasonForReturn,
    customerName: input.customerName ?? asset.customerName,
    expectedReturnDate: input.expectedReturnDate,
    serviceCharge: input.serviceCharge,
    status: 'Pending',
  };

  saveOutward([challan, ...loadOutward()]);
  markAssetOutForRepair(input.assetId, challan.id);
  return challan;
}

export function recordWarrantyInward(
  outwardChallanId: string,
  inward: WarrantyInwardReturn
): WarrantyOutwardChallan {
  const all = loadOutward();
  const idx = all.findIndex(c => c.id === outwardChallanId);
  if (idx === -1) throw new Error('Original outward challan not found — inward must link to an outward challan.');
  if (all[idx].status === 'Returned') throw new Error('This outward challan is already closed with an inward return.');

  const challan = { ...all[idx], inwardReturn: inward, status: 'Returned' as const };
  all[idx] = challan;
  saveOutward(all);

  const assets = loadAssets();
  const assetIdx = assets.findIndex(a => a.id === challan.assetId);
  if (assetIdx === -1) return challan;

  const asset = { ...assets[assetIdx] };
  asset.outwardChallanId = undefined;

  if (inward.repairStatus === 'Not Repairable') {
    asset.status = 'not_repairable';
  } else if (inward.repairStatus === 'Replaced with New Unit' && inward.newSerialNo) {
    asset.serialNo = inward.newSerialNo;
    asset.status = asset.customerName ? 'in_use' : 'available';
    if (inward.newWarrantyStartDate) {
      const start = new Date(inward.newWarrantyStartDate);
      start.setFullYear(start.getFullYear() + 1);
      asset.warrantyExpiry = start.toISOString().split('T')[0];
    }
  } else {
    asset.status = asset.customerName ? 'in_use' : 'available';
  }

  assets[assetIdx] = asset;
  saveAssets(assets);

  recordWarrantyReturnHistory({
    assetId: challan.assetId,
    assetName: challan.itemName,
    serialNo: inward.newSerialNo ?? challan.serialNo,
    holderName: challan.customerName ? `${challan.customerName} → ${challan.vendorName}` : challan.vendorName,
    challanNo: challan.id,
    dateGiven: challan.dateIssued,
    dateReturned: inward.returnDate,
  });

  return challan;
}

export function validateRepairCostBooking(
  warrantyChallanRef: string | undefined,
  repairCostAmount: number,
  approvalOverride?: boolean
): { ok: true; warning?: string } | { ok: false; message: string; requiresOverride: boolean } {
  if (!warrantyChallanRef?.trim() || repairCostAmount <= 0) return { ok: true };

  const challan = loadOutward().find(c => c.id === warrantyChallanRef.trim());
  if (!challan) {
    return { ok: false, message: `Warranty challan ${warrantyChallanRef} not found.`, requiresOverride: false };
  }
  if (challan.status === 'Returned') {
    return { ok: false, message: 'Cannot book repair cost against a closed warranty challan.', requiresOverride: false };
  }

  const covered =
    challan.warrantyStatus === 'Under Warranty' || challan.warrantyStatus === 'Extended Warranty';

  if (covered) {
    if (!approvalOverride) {
      return {
        ok: false,
        message:
          `Repair cost cannot be booked — item is "${challan.warrantyStatus}" on challan ${challan.id}. ` +
          `Use Service Charge on the challan for handling/logistics only, or enable approval override.`,
        requiresOverride: true,
      };
    }
    return {
      ok: true,
      warning: `Repair cost booked with override on ${challan.warrantyStatus} challan ${challan.id}.`,
    };
  }

  return { ok: true };
}

export function getWarrantyChallanByRef(ref: string): WarrantyOutwardChallan | undefined {
  return loadOutward().find(c => c.id === ref.trim());
}

export function getItemsOutForRepairReport(): ItemsOutForRepairRow[] {
  const today = new Date().toISOString().split('T')[0];
  return loadOutward()
    .filter(c => c.status !== 'Returned')
    .map(c => ({
      challanNo: c.id,
      itemName: c.itemName,
      serialNo: c.serialNo,
      vendor: c.vendorName,
      sentDate: c.dateIssued,
      warrantyStatus: c.warrantyStatus,
      expectedReturn: c.expectedReturnDate,
      status: c.expectedReturnDate < today ? 'Overdue' as const : 'Pending' as const,
      customerName: c.customerName,
    }));
}

export function getWarrantyClaimRegister(): WarrantyClaimRow[] {
  return loadOutward().map(c => ({
    outwardChallanNo: c.id,
    inwardDate: c.inwardReturn?.returnDate,
    itemName: c.itemName,
    serialNo: c.inwardReturn?.newSerialNo ?? c.serialNo,
    vendor: c.vendorName,
    sentDate: c.dateIssued,
    warrantyStatus: c.warrantyStatus,
    outcome: c.inwardReturn?.repairStatus,
    customerName: c.customerName,
  }));
}

export function getOverdueWarrantyRepairReport(): ItemsOutForRepairRow[] {
  return getItemsOutForRepairReport().filter(r => r.status === 'Overdue');
}

export function inferWarrantyStatus(asset: WarrantyAsset): WarrantyStatus {
  if (!asset.warrantyExpiry) return 'Out of Warranty';
  const today = new Date().toISOString().split('T')[0];
  if (asset.warrantyExpiry >= today) return 'Under Warranty';
  return 'Out of Warranty';
}
