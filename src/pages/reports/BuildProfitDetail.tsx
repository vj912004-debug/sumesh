import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft, TrendingUp, TrendingDown, Printer, IndianRupee, Wrench, Package,
} from 'lucide-react';
import {
  getBuildProfitByWorkOrder,
  getMaterialLinesForWorkOrder,
  LABOR_RATE,
  SHOP_OVERHEAD_PCT,
} from '@/lib/buildProfitLoss';
import { mockProducts, mockCustomers, getMockOrders } from '@/lib/mockData';

export default function BuildProfitDetail() {
  const { workOrderId } = useParams();
  const record = workOrderId ? getBuildProfitByWorkOrder(workOrderId) : undefined;

  if (!record) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-medium">Profit/Loss record not found for this work order.</p>
        <p className="text-sm text-muted-foreground mt-2">Complete the work order to generate a P&L snapshot.</p>
        <Link to="/reports/build-profit" className="text-primary hover:underline mt-4 inline-block">
          Back to P&L Register
        </Link>
      </div>
    );
  }

  const product = mockProducts.find(p => p.id === record.productId);
  const order = getMockOrders().find(o => o.id === record.orderId);
  const customer = order ? mockCustomers.find(c => c.id === order.customerId) : undefined;
  const materialLines = getMaterialLinesForWorkOrder(record.productId, record.workOrderId);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const isProfit = record.profitLoss >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/reports/build-profit">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">Build P&L: {record.id}</h2>
              <Badge
                variant={isProfit ? 'default' : 'destructive'}
                className={isProfit ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
              >
                {record.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {record.workOrderId} · Order {record.orderId} · Completed {record.completedAt}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print Report
        </Button>
      </div>

      <Card className={`border-2 ${isProfit ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Net {isProfit ? 'Profit' : 'Loss'} on Build
              </p>
              <p className={`text-4xl font-bold mt-1 ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isProfit ? '+' : ''}{fmt(record.profitLoss)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {record.profitMarginPct.toFixed(1)}% margin on ₹{record.revenue.toLocaleString('en-IN')} revenue
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isProfit
                ? <TrendingUp className="w-16 h-16 text-emerald-500 opacity-80" />
                : <TrendingDown className="w-16 h-16 text-rose-500 opacity-80" />}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Sale Revenue</p>
            <p className="text-xl font-bold mt-1">{fmt(record.revenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Pre-Build Estimate</p>
            <p className="text-xl font-bold mt-1">{fmt(record.estimatedCost)}</p>
            <p className="text-[10px] text-muted-foreground">Before production</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Actual Build Cost</p>
            <p className="text-xl font-bold mt-1">{fmt(record.totalActualCost)}</p>
            <p className="text-[10px] text-muted-foreground">After completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Cost Variance</p>
            <p className={`text-xl font-bold mt-1 ${record.totalActualCost > record.estimatedCost ? 'text-rose-600' : 'text-emerald-600'}`}>
              {record.totalActualCost > record.estimatedCost ? '+' : ''}
              {fmt(record.totalActualCost - record.estimatedCost)}
            </p>
            <p className="text-[10px] text-muted-foreground">Actual vs estimate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Product & Customer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <span className="text-muted-foreground">Product</span>
              <p className="font-semibold">{product?.name}</p>
              <p className="text-xs text-muted-foreground">{product?.model}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Customer</span>
              <p className="font-semibold">{customer?.name ?? '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Labor Logged</span>
              <p className="font-semibold">{record.laborHours} hrs @ ₹{LABOR_RATE}/hr</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Cost Breakdown (Actual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="font-medium">Materials Consumed</span>
                </div>
                <span className="font-bold">{fmt(record.actualMaterialCost)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-600" />
                  <span className="font-medium">Labor ({record.laborHours} hrs)</span>
                </div>
                <span className="font-bold">{fmt(record.actualLaborCost)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="font-medium">Shop Overhead ({SHOP_OVERHEAD_PCT}%)</span>
                <span className="font-bold">{fmt(record.actualOverheadCost)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border-2 border-primary/20 font-bold">
                <span>Total Actual Cost</span>
                <span>{fmt(record.totalActualCost)}</span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg font-bold text-lg ${isProfit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                <span>Profit / Loss</span>
                <span>{isProfit ? '+' : ''}{fmt(record.profitLoss)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Material Cost Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part</TableHead>
                <TableHead>Material</TableHead>
                <TableHead className="text-center">Planned Qty</TableHead>
                <TableHead className="text-center">Actual Qty</TableHead>
                <TableHead className="text-right">Planned Cost</TableHead>
                <TableHead className="text-right">Actual Cost</TableHead>
                <TableHead className="text-right">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialLines.map(line => (
                <TableRow key={line.inventoryItemId}>
                  <TableCell className="font-mono text-xs">{line.partNumber}</TableCell>
                  <TableCell className="text-sm">{line.name}</TableCell>
                  <TableCell className="text-center">{line.adjustedQty} {line.uom}</TableCell>
                  <TableCell className="text-center font-medium">{line.actualQty} {line.uom}</TableCell>
                  <TableCell className="text-right">{fmt(line.plannedCost)}</TableCell>
                  <TableCell className="text-right font-semibold">{fmt(line.actualCost)}</TableCell>
                  <TableCell className={`text-right text-sm ${line.variancePct > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {line.variancePct > 0 ? '+' : ''}{line.variancePct}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/30">
                <TableCell colSpan={4} className="text-right">Material Subtotal</TableCell>
                <TableCell className="text-right">{fmt(materialLines.reduce((s, l) => s + l.plannedCost, 0))}</TableCell>
                <TableCell className="text-right">{fmt(record.actualMaterialCost)}</TableCell>
                <TableCell className={`text-right ${record.materialVariancePct > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {record.materialVariancePct > 0 ? '+' : ''}{record.materialVariancePct.toFixed(1)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
