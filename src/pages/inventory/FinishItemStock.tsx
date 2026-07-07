import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getFgReceipts,
  getFgStockSummary,
  getFinishedGoodsStock,
  markFgQaPassed,
} from '@/lib/finishedGoodsService';
import { Package, CheckCircle2, Factory, Boxes } from 'lucide-react';

export default function FinishItemStock() {
  const [refresh, setRefresh] = useState(0);
  const stock = useMemo(() => getFinishedGoodsStock(), [refresh]);
  const receipts = useMemo(() => getFgReceipts(), [refresh]);
  const summary = useMemo(() => getFgStockSummary(), [refresh]);

  const handleQaPass = (receiptRef: string) => {
    try {
      markFgQaPassed(receiptRef);
      setRefresh(n => n + 1);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'QA update failed');
    }
  };

  return (
    <div className="space-y-6" data-demo-page="finish-stock">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Finish Item Stock Status</h2>
        <p className="text-muted-foreground">
          Finished goods received from completed work orders — available for dispatch after QA clearance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Boxes className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{summary.totalUnits}</p>
                <p className="text-xs text-muted-foreground">FG units in stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">₹{summary.totalValue.toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground">Total FG value (ATP)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{summary.productCount}</p>
            <p className="text-xs text-muted-foreground">Product models in stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-amber-600">{summary.pendingQa}</p>
            <p className="text-xs text-muted-foreground">Awaiting QA clearance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock"><Package className="h-4 w-4 mr-1" /> FG Stock</TabsTrigger>
          <TabsTrigger value="receipts"><Factory className="h-4 w-4 mr-1" /> Receipt Register</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Finished Goods — Available to Promise</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">FG Qty</TableHead>
                    <TableHead className="text-right">Unit Value</TableHead>
                    <TableHead className="text-right">Stock Value</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stock.filter(p => p.stock > 0).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                        No finished goods in stock — complete a work order to receive FG here.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stock
                      .filter(p => p.stock > 0)
                      .map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.model}</TableCell>
                          <TableCell>{p.category}</TableCell>
                          <TableCell className="text-right font-semibold">{p.stock} Nos</TableCell>
                          <TableCell className="text-right">₹{p.basePrice.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right">₹{(p.stock * p.basePrice).toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{p.fgLocation}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">FG Receipt Register (from Work Orders)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Auto-created when a work order reaches Completed — BOM done → product enters FG store.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt Ref</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>WO</TableHead>
                    <TableHead>SO</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Serial No.</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Material Cost</TableHead>
                    <TableHead>QA</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-10">
                        No FG receipts yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    receipts.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.receiptRef}</TableCell>
                        <TableCell className="text-xs">{r.receivedAt}</TableCell>
                        <TableCell>
                          <Link to={`/work-orders/${r.woId}`} className="text-primary hover:underline">{r.woId}</Link>
                        </TableCell>
                        <TableCell>
                          <Link to={`/orders/${r.orderId}`} className="text-primary hover:underline">{r.orderId}</Link>
                        </TableCell>
                        <TableCell className="text-sm">{r.productName} ({r.productModel})</TableCell>
                        <TableCell className="font-mono text-xs">{r.serialNo}</TableCell>
                        <TableCell className="text-right">{r.quantity}</TableCell>
                        <TableCell className="text-right">₹{r.materialCost.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Badge
                            variant={r.qaStatus === 'Passed' ? 'default' : 'secondary'}
                            className={r.qaStatus === 'Passed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
                          >
                            {r.qaStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {r.qaStatus === 'Pending QA' && (
                            <Button size="sm" variant="outline" onClick={() => handleQaPass(r.receiptRef)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Pass QA
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
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
