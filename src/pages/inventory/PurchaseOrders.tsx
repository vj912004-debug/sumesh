import { useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Search, FileText } from 'lucide-react';
import {
  getPoTotal,
  loadPurchaseOrders,
  PO_PURPOSE_OPTIONS,
  type PoPurpose,
  type PurchaseOrder,
} from '@/lib/purchaseOrderService';

const STATUS_OPTIONS = ['All', 'Pending', 'Received', 'Draft', 'Cancelled'] as const;

function statusVariant(status: PurchaseOrder['status']) {
  if (status === 'Received') return 'default' as const;
  if (status === 'Pending') return 'secondary' as const;
  if (status === 'Cancelled') return 'destructive' as const;
  return 'outline' as const;
}

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [purposeFilter, setPurposeFilter] = useState<PoPurpose | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>('All');

  const orders = useMemo(() => {
    const all = loadPurchaseOrders();
    return [...all].sort((a, b) => b.poDate.localeCompare(a.poDate) || b.id.localeCompare(a.id));
  }, [location.key]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(po => {
      if (purposeFilter !== 'All' && po.poPurpose !== purposeFilter) return false;
      if (statusFilter !== 'All' && po.status !== statusFilter) return false;
      if (!q) return true;
      return (
        po.id.toLowerCase().includes(q) ||
        po.vendorName.toLowerCase().includes(q) ||
        (po.workOrderRef?.toLowerCase().includes(q) ?? false) ||
        po.poPurpose.toLowerCase().includes(q)
      );
    });
  }, [orders, search, purposeFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(p => p.status === 'Pending').length,
    received: orders.filter(p => p.status === 'Received').length,
    value: orders.reduce((s, p) => s + getPoTotal(p), 0),
  }), [orders]);

  return (
    <div className="space-y-6" data-demo-page="purchase-orders">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase Order List</h2>
          <p className="text-muted-foreground">
            All saved POs — manufacture, rental, sales, and general stock.
          </p>
        </div>
        <Button onClick={() => navigate('/purchase/orders/new')} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Create PO
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total POs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending GRN</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{stats.received}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{stats.value.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-teal-600" />
              Saved Purchase Orders ({filtered.length})
            </CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PO no., vendor, WO…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={purposeFilter}
              onChange={e => setPurposeFilter(e.target.value as PoPurpose | 'All')}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="All">All purposes</option>
              {PO_PURPOSE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as (typeof STATUS_OPTIONS)[number])}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              {orders.length === 0 ? (
                <>
                  <p>No purchase orders yet.</p>
                  <Button className="mt-4" onClick={() => navigate('/purchase/orders/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Create your first PO
                  </Button>
                </>
              ) : (
                <p>No POs match your filters.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>PO For</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>WO Ref</TableHead>
                    <TableHead className="text-right">Lines</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(po => (
                    <TableRow key={po.id} data-demo-doc={po.id}>
                      <TableCell className="font-medium font-mono">
                        <Link to={`/purchase-orders/${po.id}`} className="text-primary hover:underline">
                          {po.id}
                        </Link>
                      </TableCell>
                      <TableCell>{po.poDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{po.poPurpose}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate" title={po.vendorName}>
                        {po.vendorName}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {po.workOrderRef || '—'}
                      </TableCell>
                      <TableCell className="text-right">{po.lines.length}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{getPoTotal(po).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(po.status)}>{po.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            po.status === 'Pending'
                              ? navigate('/purchase/grn')
                              : navigate(`/purchase-orders/${po.id}`)
                          }
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {po.status === 'Pending' ? 'GRN' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
