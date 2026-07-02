import { Link } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBuildProfitRecords, getProfitSummary } from '@/lib/buildProfitLoss';
import { mockProducts, mockCustomers, getMockOrders } from '@/lib/mockData';
import { TrendingUp, TrendingDown, IndianRupee, BarChart3, ArrowRight } from 'lucide-react';

export default function BuildProfitLoss() {
  const records = getBuildProfitRecords();
  const summary = getProfitSummary();

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Build Profit & Loss</h2>
        <p className="text-muted-foreground">
          Actual profit or loss per completed product — revenue vs material, labor, and overhead after build.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">{fmt(summary.totalRevenue)}</p>
              </div>
              <IndianRupee className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Total Build Cost</p>
                <p className="text-2xl font-bold mt-1">{fmt(summary.totalCost)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className={summary.totalProfit >= 0 ? 'border-emerald-200' : 'border-rose-200'}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Net Profit / Loss</p>
                <p className={`text-2xl font-bold mt-1 ${summary.totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {summary.totalProfit >= 0 ? '+' : ''}{fmt(summary.totalProfit)}
                </p>
              </div>
              {summary.totalProfit >= 0
                ? <TrendingUp className="w-8 h-8 text-emerald-500" />
                : <TrendingDown className="w-8 h-8 text-rose-500" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Avg. Margin</p>
            <p className="text-2xl font-bold mt-1">{summary.avgMargin.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.profitCount} profit · {summary.lossCount} loss
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Builds — P&L Register</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No completed builds yet. Profit/loss is recorded when a work order reaches Completed stage.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>P&L Ref</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Actual Cost</TableHead>
                  <TableHead>Profit / Loss</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(rec => {
                  const product = mockProducts.find(p => p.id === rec.productId);
                  const order = getMockOrders().find(o => o.id === rec.orderId);
                  const customer = order
                    ? mockCustomers.find(c => c.id === order.customerId)
                    : undefined;

                  return (
                    <TableRow key={rec.id}>
                      <TableCell className="font-medium text-primary">{rec.id}</TableCell>
                      <TableCell className="font-mono text-xs">{rec.workOrderId}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{product?.name}</div>
                        <div className="text-xs text-muted-foreground">{product?.model}</div>
                      </TableCell>
                      <TableCell className="text-sm">{customer?.name ?? '—'}</TableCell>
                      <TableCell>{fmt(rec.revenue)}</TableCell>
                      <TableCell>{fmt(rec.totalActualCost)}</TableCell>
                      <TableCell className={`font-bold ${rec.profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {rec.profitLoss >= 0 ? '+' : ''}{fmt(rec.profitLoss)}
                      </TableCell>
                      <TableCell>{rec.profitMarginPct.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={rec.status === 'Profit' ? 'default' : rec.status === 'Loss' ? 'destructive' : 'secondary'}
                          className={rec.status === 'Profit' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
                        >
                          {rec.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/reports/build-profit/${rec.workOrderId}`}>
                          <Button variant="ghost" size="sm">
                            Details <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
