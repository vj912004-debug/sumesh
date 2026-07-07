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
  AlertTriangle, CheckCircle, Package, RotateCcw, Send, Shield, Wrench, BarChart3,
} from 'lucide-react';
import {
  getItemsOutForRepairReport,
  getOpenWarrantyChallanOptions,
  getOverdueWarrantyRepairReport,
  getWarrantyAssetOptions,
  getWarrantyClaimRegister,
  inferWarrantyStatus,
  issueWarrantyOutward,
  loadWarrantyAssets,
  loadWarrantyOutwardChallans,
  peekNextWarrantyChallanNo,
  recordWarrantyInward,
  type RepairStatus,
  type WarrantyStatus,
} from '@/lib/warrantyRepairService';

const WARRANTY_STATUSES: WarrantyStatus[] = ['Under Warranty', 'Out of Warranty', 'Extended Warranty'];
const REPAIR_STATUSES: RepairStatus[] = ['Repaired & OK', 'Replaced with New Unit', 'Not Repairable'];

function warrantyBadge(status: WarrantyStatus) {
  const map: Record<WarrantyStatus, string> = {
    'Under Warranty': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Out of Warranty': 'bg-zinc-100 text-zinc-800 border-zinc-200',
    'Extended Warranty': 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return <Badge className={map[status]}>{status}</Badge>;
}

export default function WarrantyRepairChallan() {
  const [refresh, setRefresh] = useState(0);
  const bump = () => setRefresh(n => n + 1);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('outward');

  const assets = useMemo(() => loadWarrantyAssets(), [refresh]);
  const challans = useMemo(() => loadWarrantyOutwardChallans(), [refresh]);
  const assetOptions = useMemo(() => getWarrantyAssetOptions(), [refresh]);
  const openChallanOptions = useMemo(() => getOpenWarrantyChallanOptions(), [refresh]);
  const outForRepair = useMemo(() => getItemsOutForRepairReport(), [refresh]);
  const claimRegister = useMemo(() => getWarrantyClaimRegister(), [refresh]);
  const overdueReport = useMemo(() => getOverdueWarrantyRepairReport(), [refresh]);
  const nextChallanNo = useMemo(() => peekNextWarrantyChallanNo(), [refresh, activeTab]);
  const challanDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Outward form
  const [assetId, setAssetId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [warrantyStatus, setWarrantyStatus] = useState<WarrantyStatus>('Under Warranty');
  const [warrantyRefNo, setWarrantyRefNo] = useState('');
  const [reasonForReturn, setReasonForReturn] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [serviceCharge, setServiceCharge] = useState('');

  // Inward form
  const [inwardChallanId, setInwardChallanId] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [repairStatus, setRepairStatus] = useState<RepairStatus>('Repaired & OK');
  const [repairRemarks, setRepairRemarks] = useState('');
  const [newSerialNo, setNewSerialNo] = useState('');
  const [newWarrantyStart, setNewWarrantyStart] = useState('');

  const selectedAsset = assetId ? assets.find(a => a.id === assetId) : null;
  const inwardChallan = inwardChallanId ? challans.find(c => c.id === inwardChallanId) : null;

  const pendingCount = challans.filter(c => c.status !== 'Returned').length;
  const returnedCount = challans.filter(c => c.status === 'Returned').length;

  const handleAssetPick = (id: string) => {
    setAssetId(id);
    const asset = assets.find(a => a.id === id);
    if (asset) {
      setWarrantyStatus(inferWarrantyStatus(asset));
      setWarrantyRefNo(asset.purchaseInvoiceRef ?? '');
      setCustomerName(asset.customerName ?? '');
    }
  };

  const handleIssueOutward = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      issueWarrantyOutward({
        assetId,
        vendorName,
        warrantyStatus,
        warrantyRefNo: warrantyRefNo || undefined,
        reasonForReturn,
        customerName: customerName || undefined,
        expectedReturnDate,
        serviceCharge: serviceCharge ? Number(serviceCharge) : undefined,
      });
      setAssetId('');
      setVendorName('');
      setReasonForReturn('');
      setExpectedReturnDate('');
      setServiceCharge('');
      bump();
      setActiveTab('register');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not issue outward challan.');
    }
  };

  const handleInwardReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inwardChallanId) return;
    setError(null);
    try {
      if (repairStatus === 'Replaced with New Unit' && !newSerialNo.trim()) {
        throw new Error('Enter the new serial number for replaced unit.');
      }
      recordWarrantyInward(inwardChallanId, {
        returnDate,
        repairStatus,
        repairRemarks: repairRemarks || undefined,
        newSerialNo: newSerialNo.trim() || undefined,
        newWarrantyStartDate: newWarrantyStart || undefined,
      });
      setInwardChallanId('');
      setRepairRemarks('');
      setNewSerialNo('');
      setNewWarrantyStart('');
      bump();
      setActiveTab('register');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not book inward return.');
    }
  };

  return (
    <div className="space-y-6" data-demo-page="warranty-repair">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-800">Warranty Repair — Returnable Challan</h2>
        <p className="text-zinc-500 font-medium">
          Send items to vendor/OEM for warranty repair and book inward returns — repair cost blocked when under warranty.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto h-7" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-zinc-500">Out for Repair</CardTitle>
            <Wrench className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">{pendingCount}</div>
            <p className="text-xs text-zinc-400">Pending vendor return</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-zinc-500">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueReport.length}</div>
            <p className="text-xs text-zinc-400">Past expected return</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-zinc-500">Returned</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{returnedCount}</div>
            <p className="text-xs text-zinc-400">Closed with inward challan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-zinc-500">Asset Records</CardTitle>
            <Package className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assets.length}</div>
            <p className="text-xs text-zinc-400">Purchase-linked assets</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="outward"><Send className="h-4 w-4 mr-1" /> Outward to Vendor</TabsTrigger>
          <TabsTrigger value="inward"><RotateCcw className="h-4 w-4 mr-1" /> Inward Return</TabsTrigger>
          <TabsTrigger value="register">Claim Register</TabsTrigger>
          <TabsTrigger value="reports"><BarChart3 className="h-4 w-4 mr-1" /> Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="outward" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Outward Returnable Challan (To Vendor/OEM)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIssueOutward} className="space-y-4 max-w-3xl">
                <div className="grid gap-4 md:grid-cols-2 rounded-lg border border-teal-200 bg-teal-50/40 p-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-600">Challan No. (auto-generated)</label>
                    <Input value={nextChallanNo} readOnly className="font-mono font-semibold bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-600">Challan Date</label>
                    <Input type="date" value={challanDate} readOnly className="bg-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Item / Serial No. / Asset Tag</label>
                  <SearchableSelect
                    options={assetOptions.filter(o => o.meta.status !== 'out_for_repair')}
                    value={assetId}
                    onChange={handleAssetPick}
                    placeholder="Search purchase or asset record…"
                  />
                </div>

                {selectedAsset && (
                  <div className="text-sm bg-zinc-50 border rounded-md p-3 space-y-1">
                    <div><span className="font-medium">Item:</span> {selectedAsset.itemName}</div>
                    <div><span className="font-medium">Serial:</span> {selectedAsset.serialNo}</div>
                    {selectedAsset.purchaseInvoiceRef && (
                      <div><span className="font-medium">Purchase Invoice:</span> {selectedAsset.purchaseInvoiceRef}</div>
                    )}
                    {selectedAsset.warrantyExpiry && (
                      <div><span className="font-medium">Warranty Expiry:</span> {selectedAsset.warrantyExpiry}</div>
                    )}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Vendor / OEM Name</label>
                    <Input value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="Leybold GmbH (India)" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Warranty Status</label>
                    <select
                      className="w-full h-10 rounded-md border px-3 text-sm"
                      value={warrantyStatus}
                      onChange={e => setWarrantyStatus(e.target.value as WarrantyStatus)}
                    >
                      {WARRANTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Warranty Reference No.</label>
                    <Input value={warrantyRefNo} onChange={e => setWarrantyRefNo(e.target.value)} placeholder="PINV-25-1180 / warranty card" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Expected Return Date</label>
                    <Input type="date" value={expectedReturnDate} onChange={e => setExpectedReturnDate(e.target.value)} required />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-medium">Reason for Return (Fault Description)</label>
                    <Input value={reasonForReturn} onChange={e => setReasonForReturn(e.target.value)} placeholder="Damaged / fault description" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Customer Name (if applicable)</label>
                    <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Original customer site" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Service / Handling Charge (₹)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceCharge}
                      onChange={e => setServiceCharge(e.target.value)}
                      placeholder="Optional — logistics even under warranty"
                    />
                  </div>
                </div>

                {(warrantyStatus === 'Under Warranty' || warrantyStatus === 'Extended Warranty') && (
                  <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                    Under warranty — repair/purchase cost cannot be booked against this challan. Only separate service/handling charges allowed.
                  </div>
                )}

                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                  <Send className="h-4 w-4 mr-2" /> Issue Outward Challan
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inward" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inward Return Challan (From Vendor)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInwardReturn} className="space-y-4 max-w-2xl">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Reference Outward Challan No.</label>
                  <SearchableSelect
                    options={openChallanOptions}
                    value={inwardChallanId}
                    onChange={setInwardChallanId}
                    placeholder="Select open outward challan…"
                  />
                </div>

                {inwardChallan && (
                  <>
                    <div className="text-sm bg-zinc-50 border rounded p-3 space-y-1">
                      <div><span className="font-medium">Item:</span> {inwardChallan.itemName} ({inwardChallan.serialNo})</div>
                      <div><span className="font-medium">Vendor:</span> {inwardChallan.vendorName}</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Warranty:</span> {warrantyBadge(inwardChallan.warrantyStatus)}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Return Date</label>
                        <Input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Repair Status</label>
                        <select
                          className="w-full h-10 rounded-md border px-3 text-sm"
                          value={repairStatus}
                          onChange={e => setRepairStatus(e.target.value as RepairStatus)}
                        >
                          {REPAIR_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">Repair Report / Remarks</label>
                      <Input value={repairRemarks} onChange={e => setRepairRemarks(e.target.value)} placeholder="Vendor repair notes" />
                    </div>

                    {repairStatus === 'Replaced with New Unit' && (
                      <div className="grid gap-4 md:grid-cols-2 border border-dashed rounded-lg p-3">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">New Serial No.</label>
                          <Input value={newSerialNo} onChange={e => setNewSerialNo(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">New Warranty Start Date</label>
                          <Input type="date" value={newWarrantyStart} onChange={e => setNewWarrantyStart(e.target.value)} />
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-zinc-500">
                      On save, asset status updates to Available/In Use and &quot;Out for Repair&quot; tag is removed.
                      {inwardChallan.customerName && ` Can be re-issued to ${inwardChallan.customerName}.`}
                    </div>

                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                      <RotateCcw className="h-4 w-4 mr-2" /> Book Inward Return
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Warranty Claim Register</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Outward Challan</TableHead>
                    <TableHead>Item / Serial</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Warranty</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challans.map(c => {
                    const isOverdue = c.status !== 'Returned' && c.expectedReturnDate < new Date().toISOString().split('T')[0];
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs text-teal-700">{c.id}</TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{c.itemName}</div>
                          <div className="text-xs text-zinc-500">{c.serialNo}</div>
                        </TableCell>
                        <TableCell className="text-sm">{c.vendorName}</TableCell>
                        <TableCell className="text-sm">{c.dateIssued}</TableCell>
                        <TableCell>{warrantyBadge(c.warrantyStatus)}</TableCell>
                        <TableCell className={isOverdue ? 'text-red-600 font-medium' : ''}>{c.expectedReturnDate}</TableCell>
                        <TableCell className="text-sm">{c.inwardReturn?.repairStatus ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant={c.status === 'Returned' ? 'default' : isOverdue ? 'destructive' : 'outline'}>
                            {c.status === 'Returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Pending'}
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

        <TabsContent value="reports" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Items Out for Warranty Repair</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Serial No.</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Warranty</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outForRepair.map(r => (
                    <TableRow key={r.challanNo}>
                      <TableCell>{r.itemName}</TableCell>
                      <TableCell className="font-mono text-xs">{r.serialNo}</TableCell>
                      <TableCell>{r.vendor}</TableCell>
                      <TableCell>{r.sentDate}</TableCell>
                      <TableCell>{warrantyBadge(r.warrantyStatus)}</TableCell>
                      <TableCell>{r.expectedReturn}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === 'Overdue' ? 'destructive' : 'outline'}>{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {outForRepair.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-6 text-zinc-400">No items currently out for repair.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Warranty Claim Register (Outward–Inward Pairs)</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Outward</TableHead>
                    <TableHead>Inward Date</TableHead>
                    <TableHead>Item / Serial</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Warranty</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claimRegister.map(r => (
                    <TableRow key={r.outwardChallanNo}>
                      <TableCell className="font-mono text-xs">{r.outwardChallanNo}</TableCell>
                      <TableCell>{r.inwardDate ?? '—'}</TableCell>
                      <TableCell>{r.itemName} <span className="text-zinc-400 text-xs">({r.serialNo})</span></TableCell>
                      <TableCell>{r.vendor}</TableCell>
                      <TableCell>{warrantyBadge(r.warrantyStatus)}</TableCell>
                      <TableCell>{r.outcome ?? 'Pending'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Overdue Warranty Repairs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Challan</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Customer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueReport.map(r => (
                    <TableRow key={r.challanNo}>
                      <TableCell className="font-mono text-xs">{r.challanNo}</TableCell>
                      <TableCell>{r.itemName}</TableCell>
                      <TableCell className="font-mono text-xs">{r.serialNo}</TableCell>
                      <TableCell>{r.vendor}</TableCell>
                      <TableCell className="text-red-600 font-medium">{r.expectedReturn}</TableCell>
                      <TableCell>{r.customerName ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                  {overdueReport.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-zinc-400">No overdue warranty repairs.</TableCell></TableRow>
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
