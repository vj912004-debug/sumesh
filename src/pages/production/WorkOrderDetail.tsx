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
import { mockProducts } from '@/lib/mockData';
import { ArrowLeft, CheckCircle2, Factory, FileCheck } from 'lucide-react';
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
  const product = mockProducts.find(p => p.id === wo?.productId);

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

  const handleAdvanceStage = () => {
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
  };

  const handleLogLabor = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(loggedHours);
    if (isNaN(hours) || hours <= 0) return;

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

  const handleRequestMaterial = () => {
    alert('Material request issued successfully. Stores notified.');
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
          <p className="text-muted-foreground">SO Ref: {wo.orderId} | Due Date: {wo.endDate}</p>
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
                  <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                    <span className="text-sm font-medium">BOM Link:</span>
                    <span className="text-sm font-bold text-primary cursor-pointer hover:underline">BOM-SP1012</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">Item Description</th>
                        <th className="py-2 text-center font-medium">Required Qty</th>
                        <th className="py-2 text-center font-medium">Consumed</th>
                        <th className="py-2 text-right font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-3">Vacuum Pump 300m3/hr</td>
                        <td className="py-3 text-center">1 Nos</td>
                        <td className="py-3 text-center font-medium text-green-600">1 Nos</td>
                        <td className="py-3 text-right"><Badge variant="outline">Issued</Badge></td>
                      </tr>
                      <tr>
                        <td className="py-3">SS 304 Sheet 2mm</td>
                        <td className="py-3 text-center">450 Kg</td>
                        <td className="py-3 text-center font-medium text-orange-600">200 Kg</td>
                        <td className="py-3 text-right"><Badge variant="secondary">Material Issued</Badge></td>
                      </tr>
                      <tr>
                        <td className="py-3">Control Panel Relays</td>
                        <td className="py-3 text-center">12 Nos</td>
                        <td className="py-3 text-center text-muted-foreground">0 Nos</td>
                        <td className="py-3 text-right"><Badge variant="outline">Pending</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                  <Button variant="outline" className="w-full mt-2" onClick={handleRequestMaterial}>Request Material from Stores</Button>
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

