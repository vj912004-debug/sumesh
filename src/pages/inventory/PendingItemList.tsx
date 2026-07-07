import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle, Clock, Download, History, PackageOpen, Printer, Search, Users,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getPendingItemListRows,
  loadRentalItems,
  AGEING_BUCKETS,
  CHALLAN_REASONS,
  type AgeingBucket,
  type ChallanReason,
  type PendingItemListRow,
} from '@/lib/rentalAssetService';

type ViewMode = 'pending' | 'history';

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'dd MMM yyyy');
  } catch {
    return iso;
  }
}

function ageingBadge(days: number) {
  if (days > 60) return <Badge className="bg-red-100 text-red-800 border-red-200">{days} days</Badge>;
  if (days > 30) return <Badge className="bg-orange-100 text-orange-800 border-orange-200">{days} days</Badge>;
  if (days > 15) return <Badge className="bg-amber-100 text-amber-800 border-amber-200">{days} days</Badge>;
  return <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200">{days} days</Badge>;
}

function statusBadge(row: PendingItemListRow) {
  if (row.lineStatus === 'Fully Returned') {
    return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Closed</Badge>;
  }
  const today = new Date().toISOString().split('T')[0];
  if (row.expectedReturnDate && row.expectedReturnDate < today) {
    return <Badge variant="destructive">Overdue</Badge>;
  }
  if (row.lineStatus === 'Partial') {
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Partial</Badge>;
  }
  return <Badge variant="outline">Not Returned</Badge>;
}

function csvEscape(value: string | number | undefined): string {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(filename: string, header: string[], rows: (string | number | undefined)[][]) {
  const body = [header, ...rows].map(r => r.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PendingItemList() {
  const allRows = useMemo(() => getPendingItemListRows(), []);
  const rentalItems = useMemo(() => loadRentalItems(), []);

  const [view, setView] = useState<ViewMode>('pending');
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [itemFilter, setItemFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState<'All' | ChallanReason>('All');
  const [ageingFilter, setAgeingFilter] = useState<'All' | AgeingBucket>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const pendingRows = useMemo(() => allRows.filter(r => r.qtyPending > 0), [allRows]);

  const filteredRows = useMemo(() => {
    const base = view === 'pending' ? pendingRows : allRows;
    const q = search.trim().toLowerCase();
    const rows = base.filter(r => {
      if (q && !(
        r.customerName.toLowerCase().includes(q) ||
        r.itemName.toLowerCase().includes(q) ||
        r.challanNo.toLowerCase().includes(q)
      )) return false;
      if (customerFilter && !r.customerName.toLowerCase().includes(customerFilter.toLowerCase())) return false;
      if (itemFilter && r.rentalItemId !== itemFilter) return false;
      if (addressFilter && !r.deliveryAddress.toLowerCase().includes(addressFilter.toLowerCase())) return false;
      if (reasonFilter !== 'All' && r.reason !== reasonFilter) return false;
      if (view === 'pending' && ageingFilter !== 'All' && r.ageingBucket !== ageingFilter) return false;
      if (dateFrom && r.dateSent < dateFrom) return false;
      if (dateTo && r.dateSent > dateTo) return false;
      return true;
    });
    // Pending: oldest first for follow-up priority. History: newest dispatch first.
    return rows.sort((a, b) =>
      view === 'pending'
        ? b.daysPending - a.daysPending
        : b.dateSent.localeCompare(a.dateSent)
    );
  }, [allRows, pendingRows, view, search, customerFilter, itemFilter, addressFilter, reasonFilter, ageingFilter, dateFrom, dateTo]);

  const totalPendingQty = pendingRows.reduce((s, r) => s + r.qtyPending, 0);
  const customersWithPending = new Set(pendingRows.map(r => r.customerName)).size;
  const overdueCount = pendingRows.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.expectedReturnDate && r.expectedReturnDate < today;
  }).length;
  const aged60Plus = pendingRows.filter(r => r.ageingBucket === '60+').length;

  const handleExportCsv = () => {
    const today = new Date().toISOString().split('T')[0];
    if (view === 'pending') {
      downloadCsv(
        `pending-items-${today}.csv`,
        ['Customer', 'Item', 'Challan No', 'Date Sent', 'Delivery Address', 'Qty Sent', 'Qty Returned', 'Qty Pending', 'UOM', 'Days Pending', 'Expected Return', 'Reason', 'Status'],
        filteredRows.map(r => [
          r.customerName, r.itemName, r.challanNo, r.dateSent, r.deliveryAddress,
          r.qtySent, r.qtyReturned, r.qtyPending, r.uom, r.daysPending,
          r.expectedReturnDate, r.reason, r.lineStatus,
        ])
      );
    } else {
      downloadCsv(
        `challan-history-${today}.csv`,
        ['Customer', 'Item', 'Challan No', 'Date Sent', 'Delivery Address', 'Qty Sent', 'Qty Returned', 'Qty Pending', 'UOM', 'Date Returned', 'Total Days Taken', 'Closed By', 'Reason', 'Status'],
        filteredRows.map(r => [
          r.customerName, r.itemName, r.challanNo, r.dateSent, r.deliveryAddress,
          r.qtySent, r.qtyReturned, r.qtyPending, r.uom,
          r.dateReturned ?? '', r.totalDaysTaken ?? '', r.closedBy ?? '',
          r.reason, r.lineStatus,
        ])
      );
    }
  };

  return (
    <div className="space-y-6" data-demo-page="pending-items">
      <style>{`
        @media print {
          body, html { background: white !important; }
          aside, header, button, input, select, .print\\:hidden { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; }
          tr { page-break-inside: avoid !important; }
        }
      `}</style>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-800">Pending Item List</h2>
          <p className="text-zinc-500 font-medium">
            Items sent via challan and not yet returned — with ageing, history, and export.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="h-4 w-4 mr-2" /> Export Excel (CSV)
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print / PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 print:hidden">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Pending Lines</CardTitle>
            <PackageOpen className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{pendingRows.length}</div>
            <p className="text-xs text-zinc-400">{totalPendingQty} unit(s) still with customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Customers Holding Items</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customersWithPending}</div>
            <p className="text-xs text-zinc-400">With at least one pending item</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-red-400">Past expected return date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Aged 60+ Days</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{aged60Plus}</div>
            <p className="text-xs text-zinc-400">Long-pending — priority follow-up</p>
          </CardContent>
        </Card>
      </div>

      <Card className="print-area">
        <CardHeader className="border-b pb-4 print:hidden">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <Tabs value={view} onValueChange={v => setView(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="pending">
                    <PackageOpen className="h-4 w-4 mr-2" /> Pending ({pendingRows.length})
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="h-4 w-4 mr-2" /> View History ({allRows.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  className="pl-9"
                  placeholder="Search customer, item, or challan no…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600">Customer</label>
                <Input placeholder="Filter customer…" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600">Item</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={itemFilter}
                  onChange={e => setItemFilter(e.target.value)}
                >
                  <option value="">All items</option>
                  {rentalItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600">Address / Site</label>
                <Input placeholder="Filter address…" value={addressFilter} onChange={e => setAddressFilter(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600">Reason</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={reasonFilter}
                  onChange={e => setReasonFilter(e.target.value as 'All' | ChallanReason)}
                >
                  <option value="All">All reasons</option>
                  {CHALLAN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600">Ageing</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                  value={ageingFilter}
                  onChange={e => setAgeingFilter(e.target.value as 'All' | AgeingBucket)}
                  disabled={view === 'history'}
                >
                  <option value="All">All ages</option>
                  {AGEING_BUCKETS.map(b => <option key={b} value={b}>{b} days</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600">Sent From</label>
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600">Sent To</label>
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="hidden print:block py-4">
            <h2 className="text-xl font-bold">
              {view === 'pending' ? 'Pending Item List' : 'Challan History Report'} — {format(new Date(), 'dd MMM yyyy')}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Challan No</TableHead>
                  <TableHead>Date Sent</TableHead>
                  <TableHead className="min-w-[160px]">Delivery Address</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Returned</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  {view === 'pending' ? (
                    <>
                      <TableHead>Days Pending</TableHead>
                      <TableHead>Expected Return</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Date Returned</TableHead>
                      <TableHead>Days Taken</TableHead>
                      <TableHead>Closed By</TableHead>
                    </>
                  )}
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row, i) => (
                  <TableRow key={`${row.challanNo}-${row.lineId}-${i}`} className={row.qtyPending <= 0 ? 'bg-zinc-50/50' : ''}>
                    <TableCell className="font-medium">{row.customerName}</TableCell>
                    <TableCell>{row.itemName}</TableCell>
                    <TableCell className="font-mono text-xs text-teal-700">{row.challanNo}</TableCell>
                    <TableCell>{fmtDate(row.dateSent)}</TableCell>
                    <TableCell className="text-xs text-zinc-600 max-w-[220px] truncate" title={row.deliveryAddress}>
                      {row.deliveryAddress}
                    </TableCell>
                    <TableCell className="text-right">{row.qtySent} {row.uom}</TableCell>
                    <TableCell className="text-right text-emerald-700">{row.qtyReturned}</TableCell>
                    <TableCell className="text-right font-semibold text-amber-700">{row.qtyPending}</TableCell>
                    {view === 'pending' ? (
                      <>
                        <TableCell>{ageingBadge(row.daysPending)}</TableCell>
                        <TableCell>{fmtDate(row.expectedReturnDate)}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{fmtDate(row.dateReturned)}</TableCell>
                        <TableCell>{row.totalDaysTaken != null ? `${row.totalDaysTaken} days` : '—'}</TableCell>
                        <TableCell className="text-sm">{row.closedBy ?? '—'}</TableCell>
                      </>
                    )}
                    <TableCell><Badge variant="outline" className="text-xs">{row.reason}</Badge></TableCell>
                    <TableCell>{statusBadge(row)}</TableCell>
                  </TableRow>
                ))}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-10 text-zinc-400">
                      {view === 'pending'
                        ? 'No pending items — everything sent has been returned.'
                        : 'No records match the current filters.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
