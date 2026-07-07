import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { useAuth } from '@/context/AuthContext';
import { getInventoryItemOptions } from '@/lib/plantCatalogQuote';
import {
  approveMrs,
  getApprovedMrsReadyForIssue,
  getCombinedIssueReport,
  getMrsRegisterReport,
  getPendingApprovalReport,
  getWoItemBalance,
  issueFromMrs,
  raiseMrs,
  type MaterialRequisitionSlip,
} from '@/lib/materialRequisition';
import {
  canPerformStoreActions,
  getAvailableStock,
  getIssuedItemsForWo,
  getItemRate,
  getOpenWorkOrders,
  getStockLedgerReport,
  getWoLedger,
  getWoMaterialCostReport,
  issueMaterialToWo,
  loadMaterialAudit,
  returnMaterialFromWo,
} from '@/lib/woMaterialIssue';
import { getPlannedBomForWo } from '@/lib/quotationEstimatedBom';
import {
  AlertTriangle, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, ClipboardList,
  FileText, Shield, XCircle,
} from 'lucide-react';

const RETURN_REASONS = ['Excess Issued', 'Wrong WO', 'Job Cancelled', 'Other'] as const;

function mrsStatusBadge(status: MaterialRequisitionSlip['status']) {
  const map: Record<MaterialRequisitionSlip['status'], string> = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    'Partially Approved': 'bg-blue-100 text-blue-800 border-blue-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    Issued: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  };
  return <Badge className={map[status]}>{status}</Badge>;
}

export default function MaterialIssue() {
  const { user } = useAuth();
  const canStore = canPerformStoreActions(user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [refresh, setRefresh] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') ?? 'requisition');

  // MRS raise form
  const [mrsWo, setMrsWo] = useState('');
  const [mrsItem, setMrsItem] = useState('');
  const [mrsQty, setMrsQty] = useState('');
  const [mrsDate, setMrsDate] = useState(new Date().toISOString().split('T')[0]);
  const [mrsRequestedBy, setMrsRequestedBy] = useState(user?.name ?? '');
  const [mrsRemarks, setMrsRemarks] = useState('');

  // Approval dialog
  const [approveTarget, setApproveTarget] = useState<MaterialRequisitionSlip | null>(null);
  const [approveQty, setApproveQty] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [approveMode, setApproveMode] = useState<'approve' | 'reject'>('approve');

  // Issue form — direct or via MRS
  const [issueMode, setIssueMode] = useState<'direct' | 'mrs'>('direct');
  const [issueMrsId, setIssueMrsId] = useState('');
  const [issueWo, setIssueWo] = useState('');
  const [issueItem, setIssueItem] = useState('');
  const [issueQty, setIssueQty] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [issuedTo, setIssuedTo] = useState('');

  // Return form
  const [returnWo, setReturnWo] = useState('');
  const [returnItem, setReturnItem] = useState('');
  const [returnQty, setReturnQty] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnReason, setReturnReason] = useState<typeof RETURN_REASONS[number]>('Excess Issued');

  const openWos = useMemo(() => getOpenWorkOrders(), [refresh]);
  const itemOptions = useMemo(() => getInventoryItemOptions(), []);
  const audit = useMemo(() => loadMaterialAudit(), [refresh]);
  const woCostReport = useMemo(() => getWoMaterialCostReport(), [refresh]);
  const stockLedger = useMemo(() => getStockLedgerReport(), [refresh]);
  const mrsRegister = useMemo(() => getMrsRegisterReport(), [refresh]);
  const pendingMrs = useMemo(() => getPendingApprovalReport(), [refresh]);
  const approvedForIssue = useMemo(() => getApprovedMrsReadyForIssue(), [refresh]);
  const combinedIssues = useMemo(() => getCombinedIssueReport(), [refresh]);

  const mrsBalance = mrsWo && mrsItem ? getWoItemBalance(mrsWo, mrsItem) : null;
  const mrsExceeds =
    mrsBalance?.hasPlanned && Number(mrsQty) > 0 && Number(mrsQty) > mrsBalance.balanceQty;

  const selectedMrs = issueMrsId ? approvedForIssue.find(m => m.id === issueMrsId) : null;

  const issueRate = issueItem ? getItemRate(issueItem) : 0;
  const issueStock = issueItem ? getAvailableStock(issueItem) : 0;
  const issueAmount = (Number(issueQty) || 0) * issueRate;

  const returnIssued = returnWo ? getIssuedItemsForWo(returnWo) : [];
  const returnSummary = returnIssued.find(i => i.inventoryItemId === returnItem);
  const selectedWoLedger = issueWo ? getWoLedger(issueWo) : null;
  const plannedBom = useMemo(
    () => (issueWo ? getPlannedBomForWo(issueWo) : []),
    [issueWo, refresh]
  );
  const plannedTotal = plannedBom.reduce((s, l) => s + l.quantity * l.unitRate, 0);

  // Pre-fill issue from URL ?mrs=MRS-26-101
  useEffect(() => {
    const mrsParam = searchParams.get('mrs');
    if (mrsParam) {
      const slip = getApprovedMrsReadyForIssue().find(m => m.id === mrsParam);
      if (slip) {
        setActiveTab('issue');
        setIssueMode('mrs');
        setIssueMrsId(slip.id);
        setIssueWo(slip.woId);
        setIssueItem(slip.inventoryItemId);
        setIssueQty(String(slip.qtyApproved - slip.qtyIssued));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (issueMode === 'mrs' && selectedMrs) {
      setIssueWo(selectedMrs.woId);
      setIssueItem(selectedMrs.inventoryItemId);
      const pending = selectedMrs.qtyApproved - selectedMrs.qtyIssued;
      if (!issueQty || Number(issueQty) > pending) {
        setIssueQty(String(pending));
      }
    }
  }, [issueMode, selectedMrs?.id, selectedMrs?.qtyApproved, selectedMrs?.qtyIssued]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const bump = () => setRefresh(n => n + 1);

  const handleRaiseMrs = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slip = raiseMrs({
        woId: mrsWo,
        inventoryItemId: mrsItem,
        qtyRequested: Number(mrsQty),
        requisitionDate: mrsDate,
        requestedBy: mrsRequestedBy.trim() || user?.name || 'Site User',
        requestedByRole: user?.role,
        remarks: mrsRemarks,
      });
      notify(`${slip.id} raised for ${slip.woId} — ${slip.qtyRequested} ${slip.uom} ${slip.itemName}${slip.exceedsBalance ? ' (flagged: exceeds balance)' : ''}`);
      setMrsQty('');
      setMrsRemarks('');
      bump();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Requisition failed');
    }
  };

  const handleApproveSubmit = () => {
    if (!approveTarget || !canStore) return;
    try {
      if (approveMode === 'reject') {
        approveMrs({
          mrsId: approveTarget.id,
          action: 'reject',
          approvedBy: user?.name ?? 'Store',
          rejectionReason: rejectReason,
        });
        notify(`${approveTarget.id} rejected.`);
      } else {
        const qty = Number(approveQty) || approveTarget.qtyRequested;
        const slip = approveMrs({
          mrsId: approveTarget.id,
          action: 'approve',
          qtyApproved: qty,
          approvedBy: user?.name ?? 'Store',
        });
        notify(`${slip.id} ${slip.status} — ${slip.qtyApproved} ${slip.uom} ready for issue.`);
        setSearchParams({ tab: 'issue', mrs: slip.id });
        setActiveTab('issue');
        setIssueMode('mrs');
        setIssueMrsId(slip.id);
      }
      setApproveTarget(null);
      setApproveQty('');
      setRejectReason('');
      bump();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Approval failed');
    }
  };

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canStore) return notify('Store Owner / Admin permission required.');
    try {
      if (issueMode === 'mrs' && issueMrsId) {
        const { slip, entry } = issueFromMrs({
          mrsId: issueMrsId,
          quantity: Number(issueQty),
          issueDate,
          issuedTo,
          doneBy: user?.name ?? 'Store User',
          userRole: user?.role,
        });
        notify(`${entry.issueRef} via ${slip.id} — ${entry.qty} ${entry.itemName} issued. BOM & cost updated.`);
        if (slip.status === 'Issued') setIssueMrsId('');
      } else {
        const entry = issueMaterialToWo({
          woId: issueWo,
          inventoryItemId: issueItem,
          quantity: Number(issueQty),
          issueDate,
          issuedTo,
          doneBy: user?.name ?? 'Store User',
          userRole: user?.role,
          sourceType: 'Direct',
        });
        notify(`${entry.issueRef} (Direct) — ${entry.qty} ${entry.itemName} issued to ${issueWo}.`);
      }
      setIssueQty('');
      bump();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Issue failed');
    }
  };

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canStore) return notify('Store Owner / Admin permission required.');
    try {
      const entry = returnMaterialFromWo({
        woId: returnWo,
        inventoryItemId: returnItem,
        qtyToReturn: Number(returnQty),
        returnDate,
        reason: returnReason,
        doneBy: user?.name ?? 'Store User',
        userRole: user?.role,
      });
      notify(`${entry.issueRef} — ${entry.qty} returned to stock. WO BOM & cost reduced.`);
      setReturnQty('');
      bump();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Return failed');
    }
  };

  const maxMrsIssueQty = selectedMrs ? selectedMrs.qtyApproved - selectedMrs.qtyIssued : 0;

  return (
    <div className="space-y-6" data-demo-page="material-issue">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg max-w-md">
          {toast}
        </div>
      )}

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Material Requisition & Issue</h2>
          <p className="text-muted-foreground">
            Path A: Requisition → Approval → Issue &nbsp;|&nbsp; Path B: Direct Issue by store owner.
            Both update stock, WO BOM, and cost — every issue tagged Direct or Via MRS.
          </p>
        </div>
        <Badge variant={canStore ? 'default' : 'secondary'} className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          {canStore ? `Store access: ${user?.name ?? 'Admin'}` : 'Site — can raise MRS only'}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSearchParams({ tab: v }); }} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="requisition"><FileText className="h-4 w-4 mr-1" /> Requisition</TabsTrigger>
          <TabsTrigger value="approval">
            Approval
            {pendingMrs.length > 0 && (
              <Badge className="ml-1.5 h-5 px-1.5 bg-amber-500 text-white">{pendingMrs.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="issue"><ArrowDownToLine className="h-4 w-4 mr-1" /> Issue</TabsTrigger>
          <TabsTrigger value="return"><ArrowUpFromLine className="h-4 w-4 mr-1" /> Return</TabsTrigger>
          <TabsTrigger value="reports"><ClipboardList className="h-4 w-4 mr-1" /> Reports</TabsTrigger>
        </TabsList>

        {/* ── REQUISITION ── */}
        <TabsContent value="requisition">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Material Requisition Slip (MRS)</CardTitle>
                <p className="text-sm text-muted-foreground">Raised by site supervisor / painter / contractor</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRaiseMrs} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Requisition Date</label>
                    <Input type="date" value={mrsDate} onChange={e => setMrsDate(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">WO No. / Job Order *</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={mrsWo}
                      onChange={e => setMrsWo(e.target.value)}
                      required
                    >
                      <option value="">Select open WO…</option>
                      {openWos.map((w: { id: string; status: string }) => (
                        <option key={w.id} value={w.id}>{w.id} — {w.status}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Requested By *</label>
                    <Input
                      value={mrsRequestedBy}
                      onChange={e => setMrsRequestedBy(e.target.value)}
                      placeholder="Name / role e.g. Ramesh — Painter"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Item *</label>
                    <SearchableSelect
                      options={itemOptions}
                      value={mrsItem}
                      onChange={setMrsItem}
                      placeholder="Type 2–3 letters e.g. Paint, Epoxy…"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Qty Requested *</label>
                    <Input type="number" min={0.01} step="0.01" value={mrsQty} onChange={e => setMrsQty(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Remarks / Purpose</label>
                    <Input value={mrsRemarks} onChange={e => setMrsRemarks(e.target.value)} placeholder="e.g. Tank painting — exterior coat" />
                  </div>
                  {mrsExceeds && (
                    <p className="text-sm text-amber-700 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      Requested qty exceeds balance ({mrsBalance?.balanceQty} {mrsBalance?.uom}) — flagged for store review, not blocked.
                    </p>
                  )}
                  <Button type="submit" disabled={!mrsWo || !mrsItem || !mrsQty}>
                    Raise MRS
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Planned vs Issued vs Balance</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {mrsWo && mrsItem ? `${mrsWo} — selected item` : 'Select WO and item to see BOM check'}
                </p>
              </CardHeader>
              <CardContent>
                {!mrsWo || !mrsItem ? (
                  <p className="text-sm text-muted-foreground text-center py-12">Auto-check appears when WO and item are selected</p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-lg border p-4 bg-teal-50/50">
                        <p className="text-xs text-muted-foreground uppercase">Planned</p>
                        <p className="text-2xl font-bold text-teal-700">
                          {mrsBalance?.hasPlanned ? mrsBalance.plannedQty : '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">{mrsBalance?.uom}</p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground uppercase">Issued</p>
                        <p className="text-2xl font-bold">{mrsBalance?.issuedQty ?? 0}</p>
                        <p className="text-xs text-muted-foreground">{mrsBalance?.uom}</p>
                      </div>
                      <div className="rounded-lg border p-4 bg-blue-50/50">
                        <p className="text-xs text-muted-foreground uppercase">Balance</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {mrsBalance?.hasPlanned ? mrsBalance.balanceQty : '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">{mrsBalance?.uom}</p>
                      </div>
                    </div>
                    {!mrsBalance?.hasPlanned && (
                      <p className="text-xs text-muted-foreground text-center">
                        No planned BOM for this item on this WO — balance check N/A.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── APPROVAL ── */}
        <TabsContent value="approval">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Store Approval — Pending MRS</CardTitle>
              <p className="text-sm text-muted-foreground">
                Approve full, approve partial, or reject with reason. Approved qty flows to Issue tab.
              </p>
            </CardHeader>
            <CardContent>
              {pendingMrs.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No pending requisitions</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>MRS No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>WO</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Requested</TableHead>
                      <TableHead className="text-right">Planned / Issued / Bal.</TableHead>
                      <TableHead>By</TableHead>
                      <TableHead>Flag</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingMrs.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs font-medium">{s.id}</TableCell>
                        <TableCell className="text-xs">{s.requisitionDate}</TableCell>
                        <TableCell>{s.woId}</TableCell>
                        <TableCell className="text-sm">{s.itemName}</TableCell>
                        <TableCell className="text-right">{s.qtyRequested} {s.uom}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {s.plannedQty > 0
                            ? `${s.plannedQty} / ${s.issuedQtyAtRaise} / ${s.balanceQtyAtRaise}`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-xs">{s.requestedBy}</TableCell>
                        <TableCell>
                          {s.exceedsBalance ? (
                            <Badge variant="outline" className="text-amber-700 border-amber-300">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Exceeds
                            </Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          {canStore ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                setApproveTarget(s);
                                setApproveMode('approve');
                                setApproveQty(String(s.qtyRequested));
                                setRejectReason('');
                              }}
                            >
                              Review
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Store only</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ISSUE ── */}
        <TabsContent value="issue">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Material Issue</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={issueMode === 'mrs' ? 'default' : 'outline'}
                    onClick={() => setIssueMode('mrs')}
                    disabled={!canStore}
                  >
                    Via MRS (Path A)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={issueMode === 'direct' ? 'default' : 'outline'}
                    onClick={() => { setIssueMode('direct'); setIssueMrsId(''); }}
                    disabled={!canStore}
                  >
                    Direct Issue (Path B)
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIssue} className="space-y-4">
                  {issueMode === 'mrs' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Approved MRS *</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={issueMrsId}
                        onChange={e => setIssueMrsId(e.target.value)}
                        required
                        disabled={!canStore}
                      >
                        <option value="">Select approved MRS…</option>
                        {approvedForIssue.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.id} — {s.woId} — {s.itemName} ({s.qtyApproved - s.qtyIssued} {s.uom} pending)
                          </option>
                        ))}
                      </select>
                      {approvedForIssue.length === 0 && (
                        <p className="text-xs text-muted-foreground">No approved MRS awaiting issue</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">WO No. *</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={issueWo}
                      onChange={e => setIssueWo(e.target.value)}
                      required
                      disabled={!canStore || issueMode === 'mrs'}
                    >
                      <option value="">Select open WO…</option>
                      {openWos.map((w: { id: string; status: string }) => (
                        <option key={w.id} value={w.id}>{w.id} — {w.status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Item *</label>
                    {issueMode === 'mrs' ? (
                      <Input readOnly value={selectedMrs?.itemName ?? ''} className="bg-muted" />
                    ) : (
                      <SearchableSelect
                        options={itemOptions}
                        value={issueItem}
                        onChange={setIssueItem}
                        placeholder="Type item e.g. Paint, MS Plate…"
                        disabled={!canStore}
                      />
                    )}
                    {issueItem && issueMode === 'direct' && (
                      <p className="text-xs text-muted-foreground">
                        Stock: {issueStock} · Rate: ₹{issueRate.toLocaleString('en-IN')} · Tagged: <strong>Direct</strong>
                      </p>
                    )}
                    {issueMode === 'mrs' && selectedMrs && (
                      <p className="text-xs text-muted-foreground">
                        Approved: {selectedMrs.qtyApproved} {selectedMrs.uom} · Issued so far: {selectedMrs.qtyIssued} · Tagged: <strong>Via MRS</strong>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Qty Issued *</label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={issueQty}
                        onChange={e => setIssueQty(e.target.value)}
                        required
                        disabled={!canStore}
                      />
                      {issueMode === 'mrs' && selectedMrs && (
                        <p className="text-xs text-muted-foreground">Max: {maxMrsIssueQty} {selectedMrs.uom}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Amount (auto)</label>
                      <Input readOnly value={`₹${issueAmount.toLocaleString('en-IN')}`} className="bg-muted" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Issue Date</label>
                    <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} disabled={!canStore} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Issued To</label>
                    <Input value={issuedTo} onChange={e => setIssuedTo(e.target.value)} placeholder="Contractor / employee" disabled={!canStore} />
                  </div>

                  {issueQty && Number(issueQty) > issueStock && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Exceeds available stock ({issueStock})
                    </p>
                  )}
                  {issueMode === 'mrs' && issueQty && Number(issueQty) > maxMrsIssueQty && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Exceeds approved pending qty ({maxMrsIssueQty})
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      !canStore ||
                      !issueWo ||
                      !issueItem ||
                      Number(issueQty) > issueStock ||
                      (issueMode === 'mrs' && (!issueMrsId || Number(issueQty) > maxMrsIssueQty))
                    }
                  >
                    {issueMode === 'mrs' ? 'Issue via MRS' : 'Direct Issue'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">WO BOM — Estimated vs Actual</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {issueWo
                    ? `${issueWo} — Planned: ₹${plannedTotal.toLocaleString('en-IN')} · Actual: ₹${(selectedWoLedger?.totalMaterialCost ?? 0).toLocaleString('en-IN')}`
                    : 'Select a WO to view BOM'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {!issueWo ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Select WO on the left</p>
                ) : (
                  <>
                    {plannedBom.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">From Quotation (Estimated)</p>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead className="text-right">Planned</TableHead>
                              <TableHead className="text-right">Est. Cost</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {plannedBom.map(l => (
                              <TableRow key={l.id}>
                                <TableCell className="text-sm">{l.itemName}</TableCell>
                                <TableCell className="text-right">{l.quantity} {l.uom}</TableCell>
                                <TableCell className="text-right">₹{(l.quantity * l.unitRate).toLocaleString('en-IN')}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Consumption BOM (Actual)</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Net Qty</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(selectedWoLedger?.lines ?? []).filter(l => l.qtyIssued - l.qtyReturned > 0).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-muted-foreground py-6 text-sm">No material issued yet</TableCell>
                            </TableRow>
                          ) : (
                            (selectedWoLedger?.lines ?? []).map(l => {
                              const net = l.qtyIssued - l.qtyReturned;
                              if (net <= 0) return null;
                              return (
                                <TableRow key={l.inventoryItemId}>
                                  <TableCell className="text-sm">{l.itemName}</TableCell>
                                  <TableCell className="text-right">{net} {l.uom}</TableCell>
                                  <TableCell className="text-right">₹{(net * l.unitRate).toLocaleString('en-IN')}</TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── RETURN ── */}
        <TabsContent value="return">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Material Return (Unused / Excess)</CardTitle>
              <p className="text-sm text-muted-foreground">Counter-entry — stock restored, WO BOM reduced, audit trail kept.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReturn} className="grid gap-4 md:grid-cols-2 max-w-3xl">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">WO No. *</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={returnWo}
                    onChange={e => { setReturnWo(e.target.value); setReturnItem(''); }}
                    required
                    disabled={!canStore}
                  >
                    <option value="">Select WO…</option>
                    {openWos.map((w: { id: string }) => (
                      <option key={w.id} value={w.id}>{w.id}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Item *</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={returnItem}
                    onChange={e => setReturnItem(e.target.value)}
                    required
                    disabled={!canStore || !returnWo}
                  >
                    <option value="">Select issued item…</option>
                    {returnIssued.filter(i => i.netQty > 0).map(i => (
                      <option key={i.inventoryItemId} value={i.inventoryItemId}>
                        {i.itemName} — net {i.netQty} {i.uom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Net Issued on WO</label>
                  <Input readOnly value={returnSummary ? `${returnSummary.netQty} ${returnSummary.uom}` : '—'} className="bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Qty to Return *</label>
                  <Input type="number" min={0} step="0.01" value={returnQty} onChange={e => setReturnQty(e.target.value)} required disabled={!canStore} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Reason *</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value as typeof returnReason)}
                    disabled={!canStore}
                  >
                    {RETURN_REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Return Date</label>
                  <Input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} disabled={!canStore} />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={!canStore || !returnWo || !returnItem}>
                    Save Return (Counter-Entry)
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── REPORTS ── */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">MRS Register</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MRS No.</TableHead>
                    <TableHead>WO</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Requested</TableHead>
                    <TableHead className="text-right">Approved</TableHead>
                    <TableHead className="text-right">Issued</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mrsRegister.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">No requisitions yet</TableCell></TableRow>
                  ) : mrsRegister.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.id}</TableCell>
                      <TableCell>{s.woId}</TableCell>
                      <TableCell className="text-sm">{s.itemName}</TableCell>
                      <TableCell className="text-right">{s.qtyRequested}</TableCell>
                      <TableCell className="text-right">{s.qtyApproved || '—'}</TableCell>
                      <TableCell className="text-right">{s.qtyIssued || '—'}</TableCell>
                      <TableCell>{mrsStatusBadge(s.status)}</TableCell>
                      <TableCell className="text-xs">{s.requisitionDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Combined Issue Report (Direct + Via MRS)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>MRS No.</TableHead>
                    <TableHead>Issue Ref</TableHead>
                    <TableHead>WO</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedIssues.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-6">No issues yet</TableCell></TableRow>
                  ) : combinedIssues.map(r => (
                    <TableRow key={r.issueRef}>
                      <TableCell>
                        <Badge variant={r.source === 'Direct' ? 'secondary' : 'default'}>{r.source}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.mrsNo}</TableCell>
                      <TableCell className="font-mono text-xs">{r.issueRef}</TableCell>
                      <TableCell>{r.woId}</TableCell>
                      <TableCell className="text-sm">{r.itemName}</TableCell>
                      <TableCell className="text-right">{r.qty}</TableCell>
                      <TableCell className="text-right">₹{r.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-xs">{r.doneBy}</TableCell>
                      <TableCell className="text-xs">{r.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">WO-wise Material Cost</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Issued</TableHead>
                    <TableHead className="text-right">Returned</TableHead>
                    <TableHead className="text-right">Net Qty</TableHead>
                    <TableHead className="text-right">Net Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {woCostReport.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No issues yet</TableCell></TableRow>
                  ) : woCostReport.map((r, i) => (
                    <TableRow key={`${r.woId}-${r.partNumber}-${i}`}>
                      <TableCell className="font-medium">{r.woId}</TableCell>
                      <TableCell>{r.itemName}</TableCell>
                      <TableCell className="text-right">{r.qtyIssued}</TableCell>
                      <TableCell className="text-right">{r.qtyReturned}</TableCell>
                      <TableCell className="text-right">{r.netQty}</TableCell>
                      <TableCell className="text-right">₹{r.netCost.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Audit Log (Issue & Return)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>WO</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audit.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-6">No transactions</TableCell></TableRow>
                  ) : audit.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.issueRef}</TableCell>
                      <TableCell className="text-xs">{a.action === 'Issued' ? (a.sourceType ?? 'Direct') : '—'}</TableCell>
                      <TableCell>{a.woId}</TableCell>
                      <TableCell className="text-sm">{a.itemName}</TableCell>
                      <TableCell>
                        <Badge variant={a.action === 'Issued' ? 'default' : 'secondary'}>{a.action}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{a.qty}</TableCell>
                      <TableCell className="text-right">₹{a.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-xs">{a.doneBy}</TableCell>
                      <TableCell className="text-xs">{a.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval dialog */}
      <Dialog open={!!approveTarget} onOpenChange={open => !open && setApproveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review {approveTarget?.id}</DialogTitle>
            <DialogDescription>
              {approveTarget?.itemName} — {approveTarget?.qtyRequested} {approveTarget?.uom} for {approveTarget?.woId}
              {approveTarget?.exceedsBalance && ' · Flagged: exceeds planned balance'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant={approveMode === 'approve' ? 'default' : 'outline'}
              onClick={() => setApproveMode('approve')}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button
              size="sm"
              variant={approveMode === 'reject' ? 'destructive' : 'outline'}
              onClick={() => setApproveMode('reject')}
            >
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
          {approveMode === 'approve' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Qty to Approve (max {approveTarget?.qtyRequested})</label>
              <Input
                type="number"
                min={0.01}
                max={approveTarget?.qtyRequested}
                step="0.01"
                value={approveQty}
                onChange={e => setApproveQty(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setApproveQty(String(approveTarget?.qtyRequested ?? ''))}>
                  Approve Full
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setApproveQty(String(Math.floor((approveTarget?.qtyRequested ?? 0) / 2)))}
                >
                  Approve Half
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>Cancel</Button>
            <Button
              onClick={handleApproveSubmit}
              variant={approveMode === 'reject' ? 'destructive' : 'default'}
              disabled={approveMode === 'reject' ? !rejectReason.trim() : !approveQty || Number(approveQty) > (approveTarget?.qtyRequested ?? 0)}
            >
              {approveMode === 'reject' ? 'Reject MRS' : 'Approve & Go to Issue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
