import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { mockWorkOrders, type WorkOrder } from '@/lib/mockData2';
import { getMockOrders, saveMockOrders } from '@/lib/mockData';
import { processErpEvent } from '@/lib/erpEvents';
import {
  finalizeBuildProfit,
  getBuildProfitByWorkOrder,
  addLaborHours,
} from '@/lib/buildProfitLoss';
import { getPlannedBomForWo } from '@/lib/quotationEstimatedBom';
import { getWoLedger } from '@/lib/woMaterialIssue';
import { getFgReceiptByWo, loadProducts, receiveFinishedGoodsFromWo } from '@/lib/finishedGoodsService';
import { ArrowLeft, CheckCircle2, Factory, FileCheck, TrendingUp, TrendingDown, Package, Boxes } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WorkOrderDetail() {
  const { id } = useParams();

  const [wos, setWos] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem('mockWorkOrders');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('mockWorkOrders', JSON.stringify(mockWorkOrders));
    return mockWorkOrders;
  });

  const wo = wos.find(w => w.id === id);
  const product = loadProducts().find(p => p.id === wo?.productId);
  const profitRecord = wo ? getBuildProfitByWorkOrder(wo.id) : undefined;
  const fgReceipt = wo ? getFgReceiptByWo(wo.id) : undefined;
  const plannedBom = wo ? getPlannedBomForWo(wo.id) : [];
  const actualLedger = wo ? getWoLedger(wo.id) : null;

  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [loggedHours, setLoggedHours] = useState('');
  const [logDesc, setLogDesc] = useState('');

  if (!wo || !product) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Work Order not found</p>
        <Link to="/work-orders" className="text-primary hover:underline mt-2 inline-block">Back to Work Orders</Link>
      </div>
    );
  }

  const stages = [
    { name: 'Material Kitting', desc: 'Stores issuing raw materials' },
    { name: 'Fabrication', desc: 'Welding and tank structural work' },
    { name: 'Assembly', desc: 'Pumps, motors, and piping integration' },
    { name: 'Electricals', desc: 'Panel wiring and relays' },
    { name: 'Testing', desc: 'Quality control and vacuum leak tests' },
    { name: 'Completed', desc: 'Ready for dispatch' }
  ];

  const currentStageIdx = stages.findIndex(s => s.name === wo.status);

  const handleAdvanceStage = async () => {
    if (wo.status === 'Completed') return;
    const nextIdx = currentStageIdx + 1;
    const nextStage = stages[nextIdx].name as any;
    const newProgress = Math.min(100, Math.floor(nextIdx * (100 / (stages.length - 1))));

    const updated = wos.map(w => w.id === wo.id ? { 
      ...w, 
      status: nextStage, 
      progress: newProgress 
    } : w);
    
    setWos(updated);
    localStorage.setItem('mockWorkOrders', JSON.stringify(updated));

    await processErpEvent('workorder.stage_changed', {
      workOrderId: wo.id,
      orderId: wo.orderId,
      stage: nextStage,
    });

    if (nextStage === 'Completed') {
      const salesOrders = getMockOrders();
      const updatedSales = salesOrders.map(o => o.id === wo.orderId ? { ...o, status: 'Ready for Dispatch' as const } : o);
      saveMockOrders(updatedSales);
      const completedWo = updated.find(w => w.id === wo.id)!;
      finalizeBuildProfit(completedWo);
      const fg = receiveFinishedGoodsFromWo(completedWo, 'Production');
      const result = await processErpEvent('workorder.completed', { orderId: wo.orderId, workOrderId: wo.id });
      alert(
        `Job card completed!\n• Order ${wo.orderId} → Ready for Dispatch\n• Build P&L recorded\n• FG received: ${fg.receiptRef} — ${fg.quantity} unit(s) → Finished Goods (${fg.serialNo})\n• ${result.tasksCreated.length} task(s) created\n• ${result.notificationsSent} notification(s) sent`
      );
    }
  };

  const handleLogLabor = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(loggedHours);
    if (isNaN(hours) || hours <= 0) return;

    addLaborHours(wo.id, hours);

    // Advance progress slightly on logging labor
    const newProgress = Math.min(99, wo.progress + Math.min(15, Math.ceil(hours * 2)));
    const updated = wos.map(w => w.id === wo.id ? { 
      ...w, 
      progress: newProgress 
    } : w);

    setWos(updated);
    localStorage.setItem('mockWorkOrders', JSON.stringify(updated));
    setIsHoursOpen(false);
    setLoggedHours('');
    setLogDesc('');
    alert(`Successfully logged ${hours} hours: "${logDesc}"`);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/work-orders">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Job Card: {wo.id}</h2>
            <Badge variant={wo.status === 'Completed' ? 'default' : 'secondary'}>
              {wo.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            SO Ref: <Link to={`/orders/${wo.orderId}`} className="text-primary hover:underline">{wo.orderId}</Link>
            {' · '}Due: {wo.endDate}
            {wo.clientPoNumber && <> · Client PO: <strong>{wo.clientPoNumber}</strong></>}
          </p>
          {wo.quotationId && (
            <p className="text-sm text-muted-foreground mt-1">
              From quotation{' '}
              <Link to={`/quotations/${wo.quotationId}`} className="text-primary hover:underline">{wo.quotationId}</Link>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {wo.status !== 'Completed' && (
            <>
              <Button variant="outline" onClick={() => setIsHoursOpen(true)}>
                <Factory className="mr-2 h-4 w-4" /> Log Labor Hours
              </Button>
              <Button onClick={handleAdvanceStage}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Advance Stage
              </Button>
            </>
          )}
        </div>
      </div>

      {wo.status === 'Completed' && fgReceipt && (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Boxes className="w-8 h-8 text-blue-600 shrink-0" />
              <div>
                <p className="font-semibold text-lg">Finished Goods Received</p>
                <p className="text-sm text-muted-foreground">
                  {fgReceipt.receiptRef} · Serial {fgReceipt.serialNo} · {fgReceipt.quantity} unit(s) in FG Storage
                  {' · '}Material cost ₹{fgReceipt.materialCost.toLocaleString('en-IN')}
                  {' · '}QA: {fgReceipt.qaStatus}
                </p>
              </div>
            </div>
            <Link to="/inventory/finish-stock">
              <Button variant="outline" size="sm">View FG Stock</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {wo.status === 'Completed' && profitRecord && (
        <Card className={profitRecord.profitLoss >= 0 ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'}>
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {profitRecord.profitLoss >= 0
                ? <TrendingUp className="w-8 h-8 text-emerald-600 shrink-0" />
                : <TrendingDown className="w-8 h-8 text-rose-600 shrink-0" />}
              <div>
                <p className="font-semibold text-lg">
                  Build {profitRecord.status}: {profitRecord.profitLoss >= 0 ? '+' : ''}
                  ₹{profitRecord.profitLoss.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Revenue ₹{profitRecord.revenue.toLocaleString('en-IN')} − Actual cost ₹{profitRecord.totalActualCost.toLocaleString('en-IN')}
                  {' '}({profitRecord.profitMarginPct.toFixed(1)}% margin)
                </p>
              </div>
            </div>
            <Link to={`/reports/build-profit/${wo.id}`}>
              <Button variant="outline" size="sm">View Full P&L Report</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Product Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Machine</div>
              <div className="font-semibold">{product.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Model</div>
              <div>{product.model}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Progress</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${wo.progress}%` }}></div>
                </div>
                <span className="text-sm font-medium">{wo.progress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <Tabs defaultValue="stages" className="w-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Job Execution</CardTitle>
                <TabsList>
                  <TabsTrigger value="stages">Production Stages</TabsTrigger>
                  <TabsTrigger value="materials">Material Consumption</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="stages" className="mt-0">
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
                  {stages.map((stage, idx) => {
                    const isCompleted = stages.findIndex(s => s.name === wo.status) > idx || wo.status === 'Completed';
                    const isCurrent = wo.status === stage.name && wo.status !== 'Completed';
                    
                    return (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow
                          ${isCompleted ? 'border-primary text-primary bg-primary/5' : isCurrent ? 'border-primary text-primary font-bold animate-pulse' : 'border-muted text-muted-foreground'}
                        `}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border shadow-sm bg-card">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-bold ${isCurrent ? 'text-primary' : ''}`}>{stage.name}</h4>
                            {isCurrent && <Badge variant="outline" className="text-primary border-primary bg-primary/5">In Progress</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">{stage.desc}</div>
                          
                          {stage.name === 'Testing' && isCurrent && (
                            <div className="mt-4">
                              <Link to="/qc">
                                <Button size="sm" variant="outline" className="w-full">
                                  <FileCheck className="mr-2 h-4 w-4" /> Run Quality Tests
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="materials" className="mt-0">
                <div className="space-y-4">
                  {plannedBom.length > 0 && (
                    <div className="rounded-md border border-teal-200 bg-teal-50/40 p-3">
                      <p className="text-sm font-medium text-teal-800">
                        Estimated BOM from quotation — starting baseline for material planning
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md flex-wrap gap-2">
                    <span className="text-sm font-medium">
                      Actual material cost: ₹{(actualLedger?.totalMaterialCost ?? 0).toLocaleString('en-IN')}
                    </span>
                    <Link to={`/inventory/material-issue?tab=requisition`}>
                      <Button variant="outline" size="sm">
                        <Package className="mr-2 h-4 w-4" /> Issue / Return Material
                      </Button>
                    </Link>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">Item</th>
                        <th className="py-2 text-center font-medium">Planned (Est.)</th>
                        <th className="py-2 text-center font-medium">Consumed (Actual)</th>
                        <th className="py-2 text-right font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(() => {
                        const itemIds = new Set([
                          ...plannedBom.map(l => l.inventoryItemId),
                          ...(actualLedger?.lines ?? []).map(l => l.inventoryItemId),
                        ]);
                        if (itemIds.size === 0) {
                          return (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-muted-foreground">
                                No BOM yet — link quotation estimated BOM on PO award, then issue material from stores.
                              </td>
                            </tr>
                          );
                        }
                        return [...itemIds].map(itemId => {
                          const planned = plannedBom.find(l => l.inventoryItemId === itemId);
                          const actual = actualLedger?.lines.find(l => l.inventoryItemId === itemId);
                          const net = actual ? actual.qtyIssued - actual.qtyReturned : 0;
                          const name = planned?.itemName ?? actual?.itemName ?? itemId;
                          const plannedQty = planned ? `${planned.quantity} ${planned.uom}` : '—';
                          const consumedQty = net > 0 ? `${net} ${actual?.uom ?? ''}` : '0';
                          let status = 'Pending';
                          if (net > 0 && planned && net >= planned.quantity) status = 'Issued';
                          else if (net > 0) status = 'Partial';
                          return (
                            <tr key={itemId}>
                              <td className="py-3">{name}</td>
                              <td className="py-3 text-center">{plannedQty}</td>
                              <td className={`py-3 text-center font-medium ${net > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                                {consumedQty}
                              </td>
                              <td className="py-3 text-right">
                                <Badge variant={status === 'Issued' ? 'outline' : status === 'Partial' ? 'secondary' : 'outline'}>
                                  {status}
                                </Badge>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <Dialog open={isHoursOpen} onOpenChange={setIsHoursOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleLogLabor}>
            <DialogHeader>
              <DialogTitle>Log Labor Hours</DialogTitle>
              <DialogDescription>
                Record timesheet hours spent working on this job stage.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hours Logged</label>
                <Input 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  max="24"
                  placeholder="e.g. 4.5" 
                  value={loggedHours} 
                  onChange={e => setLoggedHours(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Description</label>
                <Input 
                  placeholder="Details of work completed..." 
                  value={logDesc} 
                  onChange={e => setLogDesc(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsHoursOpen(false)}>Cancel</Button>
              <Button type="submit">Log Hours</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

