const HISTORY_KEY = 'sp2_asset_visit_history';

export type AssetOutReason = 'Rental' | 'Warranty Repair' | 'Service' | 'Other';

export type AssetVisitHistoryRow = {
  id: string;
  assetId: string;
  assetName: string;
  serialNo: string;
  customerName: string;
  reason: AssetOutReason;
  challanNo: string;
  dateGiven: string;
  dateReturned: string;
  totalDaysWithCustomer: number;
};

export function diffDays(from: string, to: string): number {
  const a = new Date(from + 'T00:00:00');
  const b = new Date(to + 'T00:00:00');
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 86_400_000));
}

export function loadAssetVisitHistory(): AssetVisitHistoryRow[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
}

function saveHistory(rows: AssetVisitHistoryRow[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(rows));
}

export function appendAssetVisitHistory(entry: Omit<AssetVisitHistoryRow, 'id'>): void {
  const rows = loadAssetVisitHistory();
  saveHistory([{ ...entry, id: `HIS-${Date.now()}-${Math.floor(Math.random() * 1000)}` }, ...rows]);
}

export function recordRentalReturnHistory(params: {
  assetId: string;
  assetName: string;
  serialNo: string;
  customerName: string;
  challanNo: string;
  dateGiven: string;
  dateReturned: string;
}): void {
  appendAssetVisitHistory({
    assetId: params.assetId,
    assetName: params.assetName,
    serialNo: params.serialNo,
    customerName: params.customerName,
    reason: 'Rental',
    challanNo: params.challanNo,
    dateGiven: params.dateGiven,
    dateReturned: params.dateReturned,
    totalDaysWithCustomer: diffDays(params.dateGiven, params.dateReturned),
  });
}

export function recordWarrantyReturnHistory(params: {
  assetId: string;
  assetName: string;
  serialNo: string;
  holderName: string;
  challanNo: string;
  dateGiven: string;
  dateReturned: string;
}): void {
  appendAssetVisitHistory({
    assetId: params.assetId,
    assetName: params.assetName,
    serialNo: params.serialNo,
    customerName: params.holderName,
    reason: 'Warranty Repair',
    challanNo: params.challanNo,
    dateGiven: params.dateGiven,
    dateReturned: params.dateReturned,
    totalDaysWithCustomer: diffDays(params.dateGiven, params.dateReturned),
  });
}
