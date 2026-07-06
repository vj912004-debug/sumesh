import { getPlannedBomForWo } from './quotationEstimatedBom';
import {
  getWoLedger,
  issueMaterialToWo,
  loadInventory,
  loadMaterialAudit,
  type MaterialAuditEntry,
} from './woMaterialIssue';

const MRS_KEY = 'sp2_material_requisitions';

export type MrsStatus = 'Pending' | 'Approved' | 'Partially Approved' | 'Rejected' | 'Issued';

export type MaterialRequisitionSlip = {
  id: string;
  requisitionDate: string;
  woId: string;
  inventoryItemId: string;
  itemName: string;
  partNumber: string;
  uom: string;
  qtyRequested: number;
  qtyApproved: number;
  qtyIssued: number;
  requestedBy: string;
  requestedByRole?: string;
  remarks?: string;
  status: MrsStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  issueRefs: string[];
  exceedsBalance: boolean;
  plannedQty: number;
  issuedQtyAtRaise: number;
  balanceQtyAtRaise: number;
};

export type WoItemBalance = {
  plannedQty: number;
  issuedQty: number;
  balanceQty: number;
  uom: string;
  hasPlanned: boolean;
};

export type RaiseMrsInput = {
  woId: string;
  inventoryItemId: string;
  qtyRequested: number;
  requisitionDate: string;
  requestedBy: string;
  requestedByRole?: string;
  remarks?: string;
};

export type ApproveMrsInput = {
  mrsId: string;
  action: 'approve' | 'reject';
  qtyApproved?: number;
  approvedBy: string;
  rejectionReason?: string;
};

export type IssueFromMrsInput = {
  mrsId: string;
  quantity: number;
  issueDate: string;
  issuedTo: string;
  doneBy: string;
  userRole?: string;
};

function loadAll(): MaterialRequisitionSlip[] {
  try {
    return JSON.parse(localStorage.getItem(MRS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(slips: MaterialRequisitionSlip[]): void {
  localStorage.setItem(MRS_KEY, JSON.stringify(slips));
}

function nextMrsId(): string {
  const slips = loadAll();
  const nums = slips
    .map(s => s.id.match(/MRS-26-(\d+)/)?.[1])
    .filter(Boolean)
    .map(Number);
  const next = nums.length ? Math.max(...nums) + 1 : 101;
  return `MRS-26-${next}`;
}

export function getWoItemBalance(woId: string, inventoryItemId: string): WoItemBalance {
  const planned = getPlannedBomForWo(woId).find(l => l.inventoryItemId === inventoryItemId);
  const inv = loadInventory().find(i => i.id === inventoryItemId);
  const plannedQty = planned?.quantity ?? 0;
  const uom = planned?.uom ?? inv?.uom ?? '';

  const ledger = getWoLedger(woId);
  const line = ledger.lines.find(l => l.inventoryItemId === inventoryItemId);
  const issuedQty = line ? line.qtyIssued - line.qtyReturned : 0;
  const balanceQty = plannedQty > 0 ? Math.max(0, plannedQty - issuedQty) : 0;

  return { plannedQty, issuedQty, balanceQty, uom, hasPlanned: plannedQty > 0 };
}

export function loadMaterialRequisitions(): MaterialRequisitionSlip[] {
  return loadAll().sort((a, b) => b.id.localeCompare(a.id));
}

export function getMrsById(mrsId: string): MaterialRequisitionSlip | undefined {
  return loadAll().find(s => s.id === mrsId);
}

export function getPendingMrs(): MaterialRequisitionSlip[] {
  return loadAll().filter(s => s.status === 'Pending');
}

export function getApprovedMrsReadyForIssue(): MaterialRequisitionSlip[] {
  return loadAll().filter(
    s =>
      (s.status === 'Approved' || s.status === 'Partially Approved') &&
      s.qtyIssued < s.qtyApproved
  );
}

export function raiseMrs(input: RaiseMrsInput): MaterialRequisitionSlip {
  if (input.qtyRequested <= 0) throw new Error('Requested quantity must be greater than zero.');

  const inv = loadInventory().find(i => i.id === input.inventoryItemId);
  if (!inv) throw new Error('Item not found in catalog.');

  const balance = getWoItemBalance(input.woId, input.inventoryItemId);
  const exceedsBalance = balance.hasPlanned && input.qtyRequested > balance.balanceQty;

  const slip: MaterialRequisitionSlip = {
    id: nextMrsId(),
    requisitionDate: input.requisitionDate,
    woId: input.woId,
    inventoryItemId: input.inventoryItemId,
    itemName: inv.name,
    partNumber: inv.partNumber,
    uom: inv.uom,
    qtyRequested: input.qtyRequested,
    qtyApproved: 0,
    qtyIssued: 0,
    requestedBy: input.requestedBy,
    requestedByRole: input.requestedByRole,
    remarks: input.remarks?.trim() || undefined,
    status: 'Pending',
    issueRefs: [],
    exceedsBalance,
    plannedQty: balance.plannedQty,
    issuedQtyAtRaise: balance.issuedQty,
    balanceQtyAtRaise: balance.balanceQty,
  };

  saveAll([slip, ...loadAll()]);
  return slip;
}

export function approveMrs(input: ApproveMrsInput): MaterialRequisitionSlip {
  const all = loadAll();
  const idx = all.findIndex(s => s.id === input.mrsId);
  if (idx === -1) throw new Error('MRS not found.');

  const slip = { ...all[idx] };
  if (slip.status !== 'Pending') {
    throw new Error(`MRS is already ${slip.status}.`);
  }

  if (input.action === 'reject') {
    if (!input.rejectionReason?.trim()) throw new Error('Rejection reason is required.');
    slip.status = 'Rejected';
    slip.rejectionReason = input.rejectionReason.trim();
    slip.approvedBy = input.approvedBy;
    slip.approvedAt = new Date().toISOString().split('T')[0];
    all[idx] = slip;
    saveAll(all);
    return slip;
  }

  const qtyApproved = input.qtyApproved ?? slip.qtyRequested;
  if (qtyApproved <= 0) throw new Error('Approved quantity must be greater than zero.');
  if (qtyApproved > slip.qtyRequested) {
    throw new Error(`Cannot approve ${qtyApproved} — only ${slip.qtyRequested} was requested.`);
  }

  slip.qtyApproved = qtyApproved;
  slip.status = qtyApproved < slip.qtyRequested ? 'Partially Approved' : 'Approved';
  slip.approvedBy = input.approvedBy;
  slip.approvedAt = new Date().toISOString().split('T')[0];
  all[idx] = slip;
  saveAll(all);
  return slip;
}

export function issueFromMrs(input: IssueFromMrsInput): { slip: MaterialRequisitionSlip; entry: MaterialAuditEntry } {
  const all = loadAll();
  const idx = all.findIndex(s => s.id === input.mrsId);
  if (idx === -1) throw new Error('MRS not found.');

  const slip = { ...all[idx] };
  if (slip.status !== 'Approved' && slip.status !== 'Partially Approved') {
    throw new Error('Only approved MRS can be issued.');
  }

  const remaining = slip.qtyApproved - slip.qtyIssued;
  if (input.quantity <= 0) throw new Error('Issue quantity must be greater than zero.');
  if (input.quantity > remaining) {
    throw new Error(`Cannot issue ${input.quantity} — only ${remaining} ${slip.uom} approved and pending issue.`);
  }

  const entry = issueMaterialToWo({
    woId: slip.woId,
    inventoryItemId: slip.inventoryItemId,
    quantity: input.quantity,
    issueDate: input.issueDate,
    issuedTo: input.issuedTo,
    doneBy: input.doneBy,
    userRole: input.userRole,
    sourceType: 'Via MRS',
    mrsNo: slip.id,
  });

  slip.qtyIssued += input.quantity;
  slip.issueRefs = [...slip.issueRefs, entry.issueRef];
  if (slip.qtyIssued >= slip.qtyApproved) {
    slip.status = 'Issued';
  }

  all[idx] = slip;
  saveAll(all);
  return { slip, entry };
}

export function getMrsRegisterReport(): MaterialRequisitionSlip[] {
  return loadMaterialRequisitions();
}

export function getPendingApprovalReport(): MaterialRequisitionSlip[] {
  return getPendingMrs();
}

export function getCombinedIssueReport(): Array<{
  source: 'Direct' | 'Via MRS';
  mrsNo: string;
  issueRef: string;
  woId: string;
  itemName: string;
  qty: number;
  amount: number;
  doneBy: string;
  date: string;
  issuedTo?: string;
}> {
  return loadMaterialAudit()
    .filter(a => a.action === 'Issued')
    .map(a => ({
      source: a.sourceType ?? 'Direct',
      mrsNo: a.mrsNo ?? '—',
      issueRef: a.issueRef,
      woId: a.woId,
      itemName: a.itemName,
      qty: a.qty,
      amount: a.amount,
      doneBy: a.doneBy,
      date: a.date,
      issuedTo: a.issuedTo,
    }));
}
