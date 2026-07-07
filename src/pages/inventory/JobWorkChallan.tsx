import { useMemo, useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  AlertTriangle, ArrowDownToLine, CheckCircle2, Plus, Send, Wrench, BarChart3, FileText,
} from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import {
  getAvailableStockForItem,
  getJobWorkItemOptions,
  getOpenJobWorkChallanOptions,
  getPendingJobWorkReport,
  issueJobWorkOutward,
  loadJobWorkOutwardChallans,
  peekNextJobWorkChallanNo,
  PROCESS_TYPES,
  recordJobWorkInward,
  validateJobWorkIssue,
  type JobWorkInwardReceipt,
  type JobWorkOutwardChallan,
} from '@/lib/jobWorkChallanService';
import { loadInventory } from '@/lib/woMaterialIssue';

type NewLine = { inventoryItemId: string; qty: number };

const QC_STATUSES: JobWorkInwardReceipt['qcStatus'][] = ['QC Pending', 'Accepted', 'Rejected'];

export default function JobWorkChallan() {
  const [refresh, setRefresh] = useState(0);
  const bump = () => setRefresh(n => n + 1);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('outward');

  const challans = useMemo(() => loadJobWorkOutwardChallans(), [refresh]);
  const itemOptions = useMemo(() => getJobWorkItemOptions(), [refresh]);
  const openOptions = useMemo(() => getOpenJobWorkChallanOptions(), [refresh]);
  const pendingReport = useMemo(() => getPendingJobWorkReport(), [refresh]);
  const inventory = useMemo(() => loadInventory(), [refresh]);

  const nextChallanNo = useMemo(() => peekNextJobWorkChallanNo(), [refresh, activeTab]);
  const challanDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Outward
  const [subcontractor, setSubcontractor] = useState('');
  const [subGstin, setSubGstin] = useState('');
  const [subAddress, setSubAddress] = useState('');
  const [woRef, setWoRef] = useState('');
  const [process, setProcess] = useState<string>(PROCESS_TYPES[0]);
  const [expectedReturn, setExpectedReturn] = useState('');
  const [lines, setLines] = useState<NewLine[]>([{ inventoryItemId: '', qty: 1 }]);

  // Inward
  const [inwardChallanId, setInwardChallanId] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnQtys, setReturnQtys] = useState<Record<string, number>>({});
  const [scrapQty, setScrapQty] = useState('0');
  const [qcStatus, setQcStatus] = useState<JobWorkInwardReceipt['qcStatus']>('QC Pending');
  const [remarks, setRemarks] = useState('');

  const inwardChallan = inwardChallanId ? challans.find(c => c.id === inwardChallanId) : null;
  const pendingCount = challans.filter(c => c.status !== 'Received').length;
  const overdueCount = pendingReport.filter(r => r.status === 'Overdue').length;

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      for (const line of lines) {
        if (!line.inventoryItemId) throw new Error('Select item for every line.');
        const check = validateJobWorkIssue(line.inventoryItemId, line.qty);
        if (!check.ok) throw new Error(check.message);
      }
      issueJobWorkOutward({
        subcontractorName: subcontractor,
        subcontractorGstin: subGstin || undefined,
        subcontractorAddress: subAddress || undefined,
        workOrderRef: woRef || undefined,
        processDescription: process,
        expectedReturnDate: expectedReturn,
        items: lines,
      });
      setSubcontractor('');
      setSubGstin('');
      setSubAddress('');
      setWoRef('');
      setExpectedReturn('');
      setLines([{ inventoryItemId: '', qty: 1 }]);
      bump();
      setActiveTab('register');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not issue challan.');
    }
  };

  const handleInward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inwardChallanId) return;
    setError(null);
    try {
      recordJobWorkInward(
        inwardChallanId,
        returnDate,
        returnQtys,
        Number(scrapQty) || 0,
        qcStatus,
        remarks || undefined
      );
      setInwardChallanId('');
      setReturnQtys({});
      setScrapQty('0');
      setRemarks('');
      bump();
      setActiveTab('register');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not book inward.');
    }
  };

  const updateLine = (index: number, patch: Partial<NewLine>) => {
    const next = [...lines];
    next[index] = { ...next[index], ...patch };
    setLines(next);
  };

  return (
    <div className="space-y-6" data-demo-page="job-work">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Job Work Challan</h2>
        <p className="text-muted-foreground">
          Issue materials to subcontractors on Form 57F4 outward challan and receive processed goods inward.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto h-7" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between">
            <CardTitle className="text-sm text-zinc-500">Open Challans</CardTitle>
            <Send className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-700">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between">
            <CardTitle className="text-sm text-zinc-500">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between">
            <CardTitle className="text-sm text-zinc-500">Form</CardTitle>
            <FileText className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">57F4</div>
            <p className="text-xs text-zinc-400">Job work outward challan</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="outward"><Send className="h-4 w-4 mr-1" /> Outward (57F4)</TabsTrigger>
          <TabsTrigger value="inward"><ArrowDownToLine className="h-4 w-4 mr-1" /> Inward Receipt</TabsTrigger>
          <TabsTrigger value="register">Challan Register</TabsTrigger>
          <TabsTrigger value="reports"><BarChart3 className="h-4 w-4 mr-1" /> Pending Report</TabsTrigger>
        </TabsList>

        <TabsContent value="outward" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issue Job Work Outward Challan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIssue} className="space-y-4 max-w-3xl">
                <div className="grid gap-4 md:grid-cols-2 rounded-lg border border-teal-200 bg-teal-50/40 p-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Challan No. (auto-generated)</label>
                    <Input value={nextChallanNo} readOnly className="font-mono font-semibold bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Challan Date</label>
                    <Input type="date" value={challanDate} readOnly className="bg-white" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium">Subcontractor / Job Worker</label>
                    <Input value={subcontractor} onChange={e => setSubcontractor(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">GSTIN</label>
                    <Input value={subGstin} onChange={e => setSubGstin(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Work Order Ref</label>
                    <Input value={woRef} onChange={e => setWoRef(e.target.value)} placeholder="WO-26-101" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-medium">Address</label>
                    <Input value={subAddress} onChange={e => setSubAddress(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Process / Job Description</label>
                    <select
                      className="w-full h-10 rounded-md border px-3 text-sm"
                      value={process}
                      onChange={e => setProcess(e.target.value)}
                    >
                      {PROCESS_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Expected Return Date</label>
                    <Input type="date" value={expectedReturn} onChange={e => setExpectedReturn(e.target.value)} required />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Materials to Issue</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => setLines([...lines, { inventoryItemId: '', qty: 1 }])}>
                      <Plus className="h-4 w-4 mr-1" /> Add Line
                    </Button>
                  </div>
                  {lines.map((line, index) => {
                    const stock = line.inventoryItemId ? getAvailableStockForItem(line.inventoryItemId) : 0;
                    const item = line.inventoryItemId ? inventory.find(i => i.id === line.inventoryItemId) : null;
                    const exceeds = item && line.qty > stock;
                    return (
                      <div key={index} className="rounded-lg border border-dashed p-3 space-y-2 bg-zinc-50/50">
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-medium">Item (from Item Master)</label>
                            <SearchableSelect
                              options={itemOptions}
                              value={line.inventoryItemId}
                              onChange={v => updateLine(index, { inventoryItemId: v })}
                              placeholder="Search item…"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium">Qty</label>
                            <Input
                              type="number"
                              min="0.001"
                              step="0.001"
                              value={line.qty}
                              onChange={e => updateLine(index, { qty: Number(e.target.value) || 0 })}
                              className={exceeds ? 'border-red-500' : ''}
                            />
                          </div>
                        </div>
                        {item && (
                          <p className={`text-xs ${exceeds ? 'text-red-700' : 'text-emerald-700'}`}>
                            {exceeds
                              ? `Only ${stock} ${item.uom} available — cannot issue ${line.qty}.`
                              : `${stock} ${item.uom} available in stock`}
                          </p>
                        )}
                        {lines.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => setLines(lines.filter((_, i) => i !== index))}>
                            Remove
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                  <Send className="h-4 w-4 mr-2" /> Issue Job Work Challan
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inward" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receive Job Work Inward</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInward} className="space-y-4 max-w-2xl">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Reference Outward Challan</label>
                  <SearchableSelect
                    options={openOptions}
                    value={inwardChallanId}
                    onChange={id => {
                      setInwardChallanId(id);
                      const c = challans.find(x => x.id === id);
                      const qtys: Record<string, number> = {};
                      c?.items.forEach(i => { qtys[i.id] = 0; });
                      setReturnQtys(qtys);
                    }}
                    placeholder="Select open challan…"
                  />
                </div>

                {inwardChallan && (
                  <>
                    <div className="text-sm bg-zinc-50 border rounded p-3 space-y-1">
                      <div><span className="font-medium">Subcontractor:</span> {inwardChallan.subcontractorName}</div>
                      <div><span className="font-medium">Process:</span> {inwardChallan.processDescription}</div>
                      {inwardChallan.workOrderRef && (
                        <div><span className="font-medium">WO:</span> {inwardChallan.workOrderRef}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {inwardChallan.items.map(line => {
                        const max = line.qtyDispatched - line.qtyReturned;
                        if (max <= 0) return null;
                        return (
                          <div key={line.id} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <p className="font-medium text-sm">{line.description}</p>
                              <p className="text-xs text-zinc-500">Outstanding: {max} {line.uom}</p>
                            </div>
                            <Input
                              type="number"
                              min="0"
                              max={max}
                              step="0.001"
                              className="w-28 text-right"
                              value={returnQtys[line.id] || 0}
                              onChange={e => setReturnQtys({ ...returnQtys, [line.id]: Math.min(max, Number(e.target.value) || 0) })}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Receipt Date</label>
                        <Input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Scrap Qty Received</label>
                        <Input type="number" min="0" value={scrapQty} onChange={e => setScrapQty(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">QC Status</label>
                        <select className="w-full h-10 rounded-md border px-3 text-sm" value={qcStatus} onChange={e => setQcStatus(e.target.value as JobWorkInwardReceipt['qcStatus'])}>
                          {QC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Remarks</label>
                      <Input value={remarks} onChange={e => setRemarks(e.target.value)} />
                    </div>
                    <Button type="submit" className="bg-teal-600 text-white">
                      <ArrowDownToLine className="h-4 w-4 mr-2" /> Book Inward Receipt
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Job Work Challan Register</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Challan No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Subcontractor</TableHead>
                    <TableHead>Process</TableHead>
                    <TableHead>WO Ref</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challans.map(c => {
                    const overdue = c.status !== 'Received' && isAfter(new Date(), parseISO(c.expectedReturnDate));
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs font-semibold text-teal-700">{c.id}</TableCell>
                        <TableCell>{format(new Date(c.dateIssued), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{c.subcontractorName}</TableCell>
                        <TableCell>{c.processDescription}</TableCell>
                        <TableCell className="text-xs">{c.workOrderRef ?? '—'}</TableCell>
                        <TableCell className="text-xs max-w-[180px] truncate">
                          {c.items.map(i => `${i.description} (${i.qtyReturned}/${i.qtyDispatched})`).join(', ')}
                        </TableCell>
                        <TableCell className={overdue ? 'text-red-600 font-medium' : ''}>
                          {format(new Date(c.expectedReturnDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={c.status === 'Received' ? 'default' : overdue ? 'destructive' : 'outline'}>
                            {overdue && c.status !== 'Received' ? 'Overdue' : c.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5" /> Job Work Pending Report
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Challan</TableHead>
                    <TableHead>Subcontractor</TableHead>
                    <TableHead>Process</TableHead>
                    <TableHead>WO</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Qty Out</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReport.map(r => (
                    <TableRow key={r.challanNo}>
                      <TableCell className="font-mono text-xs">{r.challanNo}</TableCell>
                      <TableCell>{r.subcontractor}</TableCell>
                      <TableCell>{r.process}</TableCell>
                      <TableCell>{r.workOrderRef}</TableCell>
                      <TableCell className="text-xs max-w-[160px] truncate">{r.items}</TableCell>
                      <TableCell className="text-right">{r.qtyOutstanding}</TableCell>
                      <TableCell className={r.status === 'Overdue' ? 'text-red-600 font-medium' : ''}>{r.expectedReturn}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === 'Overdue' ? 'destructive' : 'secondary'}>{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingReport.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-6 text-zinc-400">No pending job work.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
