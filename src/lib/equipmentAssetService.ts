import { loadRentalChallans, loadRentalItems } from './rentalAssetService';
import { loadWarrantyAssets, loadWarrantyOutwardChallans } from './warrantyRepairService';
import {
  diffDays,
  loadAssetVisitHistory,
  type AssetOutReason,
  type AssetVisitHistoryRow,
} from './assetVisitHistory';

export type { AssetOutReason, AssetVisitHistoryRow };
export { diffDays, appendAssetVisitHistory, recordRentalReturnHistory, recordWarrantyReturnHistory } from './assetVisitHistory';
export type AgeingBucket = '0-15' | '16-30' | '31-60' | '60+' | 'n/a';

export type EquipmentAssetRow = {
  assetId: string;
  assetName: string;
  serialNo: string;
  assetTag?: string;
  category: string;
  totalOwnedQty: number;
  status: 'Available' | 'Not Available';
  customerName?: string;
  reason?: AssetOutReason;
  challanNo?: string;
  dateGiven?: string;
  daysWithCustomer?: number;
  expectedReturnDate?: string;
  isOverdue?: boolean;
  ageingBucket: AgeingBucket;
};

export type AssetDashboardFilters = {
  customer?: string;
  status?: 'Available' | 'Not Available' | 'All';
  reason?: AssetOutReason | 'All';
  ageingBucket?: AgeingBucket | 'All';
};

export type AssetAvailabilitySummary = {
  total: number;
  available: number;
  notAvailable: number;
  byReason: Record<AssetOutReason, number>;
};

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export function getAgeingBucket(days: number): AgeingBucket {
  if (days <= 15) return '0-15';
  if (days <= 30) return '16-30';
  if (days <= 60) return '31-60';
  return '60+';
}

type OpenAssignment = {
  assetId: string;
  assetName: string;
  serialNo: string;
  assetTag?: string;
  category: string;
  customerName: string;
  reason: AssetOutReason;
  challanNo: string;
  dateGiven: string;
  expectedReturnDate: string;
};

function buildRentalAssignments(): OpenAssignment[] {
  const items = loadRentalItems();
  const challans = loadRentalChallans().filter(c => c.status !== 'Returned');
  const assignments: OpenAssignment[] = [];

  for (const challan of challans) {
    for (const line of challan.items) {
      const outstanding = line.qtyDispatched - line.qtyReturned;
      if (outstanding <= 0) continue;
      const item = items.find(i => i.id === line.rentalItemId);
      const category = item?.category ?? 'Equipment';

      if (line.serialNos?.length) {
        const outSerials = line.serialNos.slice(line.qtyReturned, line.qtyDispatched);
        for (const sn of outSerials) {
          assignments.push({
            assetId: `${line.rentalItemId}::${sn}`,
            assetName: line.description,
            serialNo: sn,
            assetTag: item?.units?.find(u => u.serialNo === sn)?.assetTag,
            category,
            customerName: challan.buyerName,
            reason: 'Rental',
            challanNo: challan.id,
            dateGiven: challan.dateIssued,
            expectedReturnDate: challan.expectedReturnDate,
          });
        }
      } else {
        for (let i = 0; i < outstanding; i++) {
          assignments.push({
            assetId: `${line.rentalItemId}::unit-${line.qtyReturned + i + 1}`,
            assetName: line.description,
            serialNo: `— (${line.rentalItemId} unit ${line.qtyReturned + i + 1})`,
            category,
            customerName: challan.buyerName,
            reason: 'Rental',
            challanNo: challan.id,
            dateGiven: challan.dateIssued,
            expectedReturnDate: challan.expectedReturnDate,
          });
        }
      }
    }
  }
  return assignments;
}

function buildWarrantyAssignments(): OpenAssignment[] {
  const assets = loadWarrantyAssets();
  const challans = loadWarrantyOutwardChallans().filter(c => c.status !== 'Returned');

  return challans.map(c => {
    const asset = assets.find(a => a.id === c.assetId);
    return {
      assetId: c.assetId,
      assetName: c.itemName,
      serialNo: c.serialNo,
      assetTag: asset?.assetTag,
      category: 'Equipment',
      customerName: c.customerName ? `${c.customerName} → ${c.vendorName}` : c.vendorName,
      reason: 'Warranty Repair' as const,
      challanNo: c.id,
      dateGiven: c.dateIssued,
      expectedReturnDate: c.expectedReturnDate,
    };
  });
}

function buildMasterAssets(): Omit<EquipmentAssetRow, 'status' | 'ageingBucket'>[] {
  const rows: Omit<EquipmentAssetRow, 'status' | 'ageingBucket'>[] = [];
  const rentalItems = loadRentalItems();

  for (const item of rentalItems) {
    if (item.units?.length) {
      for (const unit of item.units) {
        rows.push({
          assetId: `${item.id}::${unit.serialNo}`,
          assetName: item.name,
          serialNo: unit.serialNo,
          assetTag: unit.assetTag,
          category: item.category,
          totalOwnedQty: 1,
        });
      }
    } else {
      rows.push({
        assetId: item.id,
        assetName: item.name,
        serialNo: '— (qty-based)',
        category: item.category,
        totalOwnedQty: item.totalOwnedQty,
      });
    }
  }

  for (const asset of loadWarrantyAssets()) {
    if (asset.status === 'not_repairable') continue;
    rows.push({
      assetId: asset.id,
      assetName: asset.itemName,
      serialNo: asset.serialNo,
      assetTag: asset.assetTag,
      category: 'Equipment',
      totalOwnedQty: 1,
    });
  }

  return rows;
}

function assignmentMap(): Map<string, OpenAssignment> {
  const map = new Map<string, OpenAssignment>();
  for (const a of [...buildRentalAssignments(), ...buildWarrantyAssignments()]) {
    map.set(a.assetId, a);
  }
  return map;
}

function assignmentsForAsset(assetId: string, map: Map<string, OpenAssignment>): OpenAssignment[] {
  return [...map.values()].filter(
    a => a.assetId === assetId || a.assetId.startsWith(`${assetId}::`)
  );
}

export function getEquipmentAssetDashboard(filters: AssetDashboardFilters = {}): EquipmentAssetRow[] {
  const today = todayIso();
  const assignments = assignmentMap();
  const rows: EquipmentAssetRow[] = buildMasterAssets().map(base => {
    const matched = assignmentsForAsset(base.assetId, assignments);
    if (!matched.length) {
      return { ...base, status: 'Available', ageingBucket: 'n/a' as AgeingBucket };
    }
    const primary = matched.sort((a, b) => a.dateGiven.localeCompare(b.dateGiven))[0];
    const days = Math.max(...matched.map(a => diffDays(a.dateGiven, today)));
    const isOverdue = matched.some(a => a.expectedReturnDate < today);
    const customerName =
      matched.length > 1
        ? `${matched.length} units out (${[...new Set(matched.map(m => m.customerName))].join(', ')})`
        : primary.customerName;
    return {
      ...base,
      status: 'Not Available',
      customerName,
      reason: primary.reason,
      challanNo: matched.length > 1 ? `${primary.challanNo} +${matched.length - 1}` : primary.challanNo,
      dateGiven: primary.dateGiven,
      daysWithCustomer: days,
      expectedReturnDate: primary.expectedReturnDate,
      isOverdue,
      ageingBucket: getAgeingBucket(days),
    };
  });

  return rows.filter(r => {
    if (filters.status && filters.status !== 'All' && r.status !== filters.status) return false;
    if (filters.reason && filters.reason !== 'All' && r.reason !== filters.reason) return false;
    if (filters.ageingBucket && filters.ageingBucket !== 'All' && r.ageingBucket !== filters.ageingBucket) return false;
    if (filters.customer?.trim()) {
      const q = filters.customer.trim().toLowerCase();
      if (!r.customerName?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function getAssetAvailabilitySummary(): AssetAvailabilitySummary {
  const rows = getEquipmentAssetDashboard();
  const byReason: Record<AssetOutReason, number> = {
    Rental: 0,
    'Warranty Repair': 0,
    Service: 0,
    Other: 0,
  };
  let notAvailable = 0;
  for (const r of rows) {
    if (r.status === 'Not Available') {
      notAvailable++;
      if (r.reason) byReason[r.reason]++;
    }
  }
  return {
    total: rows.length,
    available: rows.length - notAvailable,
    notAvailable,
    byReason,
  };
}

export function getCustomerWiseAssetReport(): EquipmentAssetRow[] {
  return getEquipmentAssetDashboard({ status: 'Not Available' });
}

export function getOverdueAssetReport(): EquipmentAssetRow[] {
  return getEquipmentAssetDashboard({ status: 'Not Available' }).filter(r => r.isOverdue);
}

export function getAssetHistoryReport(assetId?: string): AssetVisitHistoryRow[] {
  const history = loadAssetVisitHistory();
  if (!assetId) return history;
  return history.filter(h => h.assetId === assetId || h.assetId.startsWith(assetId));
}

export function getUniqueCustomers(): string[] {
  const names = new Set<string>();
  for (const r of getEquipmentAssetDashboard()) {
    if (r.customerName) names.add(r.customerName);
  }
  for (const h of loadAssetVisitHistory()) {
    names.add(h.customerName);
  }
  return [...names].sort();
}
