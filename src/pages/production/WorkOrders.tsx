import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { mockWorkOrders, type WorkOrder } from '@/lib/mockData2';
import { mockProducts } from '@/lib/mockData';
import { Plus } from 'lucide-react';

export default function WorkOrders() {
  const [wos, setWos] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem('mockWorkOrders');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('mockWorkOrders', JSON.stringify(mockWorkOrders));
    return mockWorkOrders;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [productId, setProductId] = useState('PROD-001');
  const [endDate, setEndDate] = useState('');

  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newWo: WorkOrder = {
      id: `WO-26-${101 + wos.length}`,
      orderId,
      productId,
      startDate: new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Material Kitting',
      progress: 10
    };
    const updated = [...wos, newWo];
    setWos(updated);
    localStorage.setItem('mockWorkOrders', JSON.stringify(updated));
    setIsOpen(false);
    setOrderId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Work Orders</h2>
          <p className="text-muted-foreground">Monitor shop floor production job cards and stage completion.</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Work Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Job Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order ID</TableHead>
                <TableHead>Sales Order Ref</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Target Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wos.map((wo) => {
                const product = mockProducts.find(p => p.id === wo.productId);
                return (
                  <TableRow key={wo.id}>
                    <TableCell className="font-medium">{wo.id}</TableCell>
                    <TableCell className="text-muted-foreground">{wo.orderId}</TableCell>
                    <TableCell>
                      {product?.name}
                      <div className="text-xs text-muted-foreground">{product?.model}</div>
                    </TableCell>
                    <TableCell>{wo.endDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden max-w-[100px]">
                          <div className="h-full bg-primary" style={{ width: `${wo.progress}%` }}></div>
                        </div>
                        <span className="text-xs">{wo.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={wo.status === 'Completed' ? 'default' : 'secondary'}
                        className={wo.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                      >
                        {wo.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/work-orders/${wo.id}`}>
                        <Button variant="ghost" size="sm">Tracker</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreateWorkOrder}>
            <DialogHeader>
              <DialogTitle>Create New Work Order</DialogTitle>
              <DialogDescription>
                Issue a new production job card linked to a Sales Order.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sales Order Ref</label>
                <Input 
                  placeholder="e.g. SO-26-004" 
                  value={orderId} 
                  onChange={e => setOrderId(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product / Machine Model</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={productId} 
                  onChange={e => setProductId(e.target.value)}
                >
                  {mockProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.model})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Completion Date</label>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Create Job Card</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

