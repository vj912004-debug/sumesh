import { useMemo, useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle, CheckCircle2, Clock, Package, Users, BarChart3, History,
} from 'lucide-react';
import {
  getAssetAvailabilitySummary,
  getAssetHistoryReport,
  getCustomerWiseAssetReport,
  getEquipmentAssetDashboard,
  getOverdueAssetReport,
  getUniqueCustomers,
  type AgeingBucket,
  type AssetOutReason,
} from '@/lib/equipmentAssetService';

const REASONS: AssetOutReason[] = ['Rental', 'Warranty Repair', 'Service', 'Other'];
const AGEING_BUCKETS: AgeingBucket[] = ['0-15', '16-30', '31-60', '60+'];

function ageingBadge(bucket: AgeingBucket, overdue?: boolean) {
  if (bucket === 'n/a') return <span className="text-zinc-400 text-xs">—</span>;
  const colors: Record<AgeingBucket, string> = {
    '0-15': 'bg-emerald-100 text-emerald-800',
    '16-30': 'bg-blue-100 text-blue-800',
    '31-60': 'bg-amber-100 text-amber-800',
    '60+': 'bg-orange-100 text-orange-800',
    'n/a': '',
  };
  return (
    <Badge className={overdue ? 'bg-red-100 text-red-800 border-red-300' : colors[bucket]}>
      {bucket} days{overdue ? ' · Overdue' : ''}
    </Badge>
  );
}

export default function AssetAvailabilityDashboard() {
  const [customerFilter, setCustomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Not Available'>('All');
  const [reasonFilter, setReasonFilter] = useState<AssetOutReason | 'All'>('All');
  const [ageingFilter, setAgeingFilter] = useState<AgeingBucket | 'All'>('All');
  const [search, setSearch] = useState('');

  const filters = useMemo(
    () => ({
      customer: customerFilter || undefined,
      status: statusFilter,
      reason: reasonFilter,
      ageingBucket: ageingFilter,
    }),
    [customerFilter, statusFilter, reasonFilter, ageingFilter]
  );

  const dashboard = useMemo(() => getEquipmentAssetDashboard(filters), [filters]);
  const summary = useMemo(() => getAssetAvailabilitySummary(), []);
  const customerReport = useMemo(() => getCustomerWiseAssetReport(), []);
  const overdueReport = useMemo(() => getOverdueAssetReport(), []);
  const history = useMemo(() => getAssetHistoryReport(), []);
  const customers = useMemo(() => getUniqueCustomers(), []);

  const filtered = dashboard.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.assetName.toLowerCase().includes(q) ||
      r.serialNo.toLowerCase().includes(q) ||
      r.customerName?.toLowerCase().includes(q) ||
      r.challanNo?.toLowerCase().includes(q)
    );
  });

  const ageingCounts = useMemo(() => {
    const counts: Record<AgeingBucket, number> = { '0-15': 0, '16-30': 0, '31-60': 0, '60+': 0, 'n/a': 0 };
    for (const r of getEquipmentAssetDashboard({ status: 'Not Available' })) {
      counts[r.ageingBucket]++;
    }
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-800">Equipment & Asset Availability</h2>
        <p className="text-zinc-500 font-medium">
          Unified view of all assets — Available vs Not Available, with customer-wise ageing from returnable challans.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between">
            <CardTitle className="text-sm text-zinc-500">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between">
            <CardTitle className="text-sm text-zinc-500">Available</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{summary.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between">
            <CardTitle className="text-sm text-zinc-500">With Customer / Vendor</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">{summary.notAvailable}</div>
            <p className="text-xs text-zinc-400 mt-1">
              Rental {summary.byReason.Rental} · Warranty {summary.byReason['Warranty Repair']}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between">
            <CardTitle className="text-sm text-zinc-500">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueReport.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {AGEING_BUCKETS.map(b => (
          <button
            key={b}
            type="button"
            onClick={() => setAgeingFilter(ageingFilter === b ? 'All' : b)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              ageingFilter === b ? 'border-teal-500 bg-teal-50' : 'border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <div className="text-xs text-zinc-500">{b} days</div>
            <div className="text-2xl font-bold">{ageingCounts[b]}</div>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Search asset / serial / challan</label>
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600">Customer</label>
                <Input
                  list="customer-list"
                  value={customerFilter}
                  onChange={e => setCustomerFilter(e.target.value)}
                  placeholder="Filter customer"
                />
                <datalist id="customer-list">
                  {customers.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600">Status</label>
                <select
                  className="w-full h-10 rounded-md border px-2 text-sm"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
                >
                  <option value="All">All</option>
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600">Reason</label>
                <select
                  className="w-full h-10 rounded-md border px-2 text-sm"
                  value={reasonFilter}
                  onChange={e => setReasonFilter(e.target.value as typeof reasonFilter)}
                >
                  <option value="All">All</option>
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600">Ageing</label>
                <select
                  className="w-full h-10 rounded-md border px-2 text-sm"
                  value={ageingFilter}
                  onChange={e => setAgeingFilter(e.target.value as typeof ageingFilter)}
                >
                  <option value="All">All</option>
                  {AGEING_BUCKETS.map(b => <option key={b} value={b}>{b} days</option>)}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Serial / Tag</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Customer / Holder</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Challan</TableHead>
                <TableHead>Date Given</TableHead>
                <TableHead className="text-right">Days Out</TableHead>
                <TableHead>Expected Return</TableHead>
                <TableHead>Ageing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.assetId} className={r.isOverdue ? 'bg-red-50/50' : undefined}>
                  <TableCell className="font-medium text-sm">{r.assetName}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.serialNo}
                    {r.assetTag && <span className="block text-zinc-400">{r.assetTag}</span>}
                  </TableCell>
                  <TableCell className="text-sm">{r.category}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'Available' ? 'default' : 'secondary'}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-[160px] truncate">{r.customerName ?? '—'}</TableCell>
                  <TableCell className="text-sm">{r.reason ?? '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{r.challanNo ?? '—'}</TableCell>
                  <TableCell className="text-sm">{r.dateGiven ?? '—'}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {r.daysWithCustomer != null ? (
                      <span className={r.isOverdue ? 'text-red-600' : ''}>{r.daysWithCustomer}</span>
                    ) : '—'}
                  </TableCell>
                  <TableCell className={`text-sm ${r.isOverdue ? 'text-red-600 font-medium' : ''}`}>
                    {r.expectedReturnDate ?? '—'}
                  </TableCell>
                  <TableCell>{ageingBadge(r.ageingBucket, r.isOverdue)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-zinc-400">No assets match filters.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Tabs defaultValue="customer">
        <TabsList>
          <TabsTrigger value="customer"><Users className="h-4 w-4 mr-1" /> Customer-wise</TabsTrigger>
          <TabsTrigger value="overdue"><AlertTriangle className="h-4 w-4 mr-1" /> Overdue</TabsTrigger>
          <TabsTrigger value="history"><History className="h-4 w-4 mr-1" /> Visit History</TabsTrigger>
          <TabsTrigger value="summary"><BarChart3 className="h-4 w-4 mr-1" /> Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="customer" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Customer-wise Asset Report</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer / Holder</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>Challan</TableHead>
                    <TableHead>Date Given</TableHead>
                    <TableHead className="text-right">Days Out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerReport.map(r => (
                    <TableRow key={`${r.assetId}-${r.challanNo}`}>
                      <TableCell>{r.customerName}</TableCell>
                      <TableCell>{r.assetName}</TableCell>
                      <TableCell className="font-mono text-xs">{r.serialNo}</TableCell>
                      <TableCell className="font-mono text-xs">{r.challanNo}</TableCell>
                      <TableCell>{r.dateGiven}</TableCell>
                      <TableCell className="text-right font-semibold">{r.daysWithCustomer}</TableCell>
                      <TableCell>
                        <Badge variant={r.isOverdue ? 'destructive' : 'outline'}>
                          {r.isOverdue ? 'Overdue' : 'Out'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                <Clock className="h-5 w-5" /> Overdue — Past Expected Return
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Challan</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead className="text-right">Days Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueReport.map(r => (
                    <TableRow key={r.assetId}>
                      <TableCell>{r.assetName}</TableCell>
                      <TableCell className="font-mono text-xs">{r.serialNo}</TableCell>
                      <TableCell>{r.customerName}</TableCell>
                      <TableCell className="font-mono text-xs">{r.challanNo}</TableCell>
                      <TableCell className="text-red-600 font-medium">{r.expectedReturnDate}</TableCell>
                      <TableCell className="text-right font-bold text-red-600">{r.daysWithCustomer}</TableCell>
                    </TableRow>
                  ))}
                  {overdueReport.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-zinc-400">No overdue assets.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Asset Visit History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>Customer / Holder</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Challan</TableHead>
                    <TableHead>Date Given</TableHead>
                    <TableHead>Date Returned</TableHead>
                    <TableHead className="text-right">Total Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(h => (
                    <TableRow key={h.id}>
                      <TableCell>{h.assetName}</TableCell>
                      <TableCell className="font-mono text-xs">{h.serialNo}</TableCell>
                      <TableCell>{h.customerName}</TableCell>
                      <TableCell>{h.reason}</TableCell>
                      <TableCell className="font-mono text-xs">{h.challanNo}</TableCell>
                      <TableCell>{h.dateGiven}</TableCell>
                      <TableCell>{h.dateReturned}</TableCell>
                      <TableCell className="text-right font-semibold">{h.totalDaysWithCustomer}</TableCell>
                    </TableRow>
                  ))}
                  {history.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-6 text-zinc-400">No visit history yet — returns are saved automatically.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Asset Availability Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span>Total assets tracked</span>
                    <span className="font-bold">{summary.total}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-emerald-700">Available</span>
                    <span className="font-bold text-emerald-700">{summary.available}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-amber-700">Not Available</span>
                    <span className="font-bold text-amber-700">{summary.notAvailable}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-zinc-700">Not Available by reason</p>
                  {REASONS.map(r => (
                    <div key={r} className="flex justify-between">
                      <span>{r}</span>
                      <span className="font-semibold">{summary.byReason[r]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
