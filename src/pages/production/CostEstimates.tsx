import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { getCostEstimates, createCostEstimate } from '@/lib/costEstimateData';
import { calculateMaterialEstimate, getDefaultRequirementSpec } from '@/lib/costingService';
import { mockProducts, mockCustomers } from '@/lib/mockData';
import { Calculator, Plus, ArrowRight } from 'lucide-react';

export default function CostEstimates() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState(() => getCostEstimates());
  const [filter, setFilter] = useState<'all' | 'draft' | 'reviewed'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [productId, setProductId] = useState('PROD-001');
  const [customerId, setCustomerId] = useState('');
  const [requirements, setRequirements] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const spec = getDefaultRequirementSpec(productId);
    const result = calculateMaterialEstimate(productId, spec);
    const doc = createCostEstimate({
      title: title || `${mockProducts.find(p => p.id === productId)?.name} estimate`,
      customerId: customerId || undefined,
      productId,
      requirements: requirements || 'Standard build as per catalog BOM.',
      spec,
      materialCost: result.totalMaterialCost,
      buildCost: result.totalBuildCost,
      suggestedPrice: result.suggestedTotalPrice,
      status: 'Draft',
    });
    setEstimates([doc, ...estimates]);
    setIsOpen(false);
    setTitle('');
    setRequirements('');
    setCustomerId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pre-Build Cost Estimates</h2>
          <p className="text-muted-foreground">
            Approximate material and build pricing before production — based on BOM and customer requirements.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Estimate
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setFilter('draft')}
          className={`rounded-xl border bg-card shadow-sm text-left p-5 cursor-pointer transition-all hover:shadow-md hover:border-primary/40 ${filter === 'draft' ? 'border-primary ring-2 ring-primary/20' : ''}`}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase">Open Estimates</p>
          <p className="text-2xl font-bold mt-1">{estimates.filter(e => e.status === 'Draft').length}</p>
        </button>
        <button
          type="button"
          onClick={() => setFilter('reviewed')}
          className={`rounded-xl border bg-card shadow-sm text-left p-5 cursor-pointer transition-all hover:shadow-md hover:border-primary/40 ${filter === 'reviewed' ? 'border-primary ring-2 ring-primary/20' : ''}`}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase">Under Review</p>
          <p className="text-2xl font-bold mt-1">{estimates.filter(e => e.status === 'Reviewed').length}</p>
        </button>
        <button
          type="button"
          onClick={() => { setFilter('all'); navigate('/production/cost-estimates'); }}
          className={`rounded-xl border bg-card shadow-sm text-left p-5 cursor-pointer transition-all hover:shadow-md hover:border-primary/40 ${filter === 'all' ? 'border-primary ring-2 ring-primary/20' : ''}`}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase">Total Pipeline Value</p>
          <p className="text-2xl font-bold mt-1 text-primary">
            ₹{estimates.reduce((s, e) => s + e.suggestedPrice, 0).toLocaleString('en-IN')}
          </p>
        </button>
      </div>

      {filter !== 'all' && (
        <Button variant="ghost" size="sm" onClick={() => setFilter('all')}>Clear filter</Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Material Build Estimates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Title / Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Material Cost</TableHead>
                <TableHead>Suggested Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(filter === 'all' ? estimates : estimates.filter(e =>
                filter === 'draft' ? e.status === 'Draft' : e.status === 'Reviewed'
              )).map(est => {
                const product = mockProducts.find(p => p.id === est.productId);
                const customer = est.customerId
                  ? mockCustomers.find(c => c.id === est.customerId)
                  : undefined;
                return (
                  <TableRow key={est.id}>
                    <TableCell className="font-medium text-primary">{est.id}</TableCell>
                    <TableCell>{est.date}</TableCell>
                    <TableCell>
                      <div className="font-medium">{est.title}</div>
                      <div className="text-xs text-muted-foreground">{product?.name} · {product?.model}</div>
                    </TableCell>
                    <TableCell>{customer?.name ?? '—'}</TableCell>
                    <TableCell>₹{est.materialCost.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="font-semibold">₹{est.suggestedPrice.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge variant={est.status === 'Approved' ? 'default' : 'outline'}>{est.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/production/cost-estimate/${est.id}`}>
                        <Button variant="ghost" size="sm">
                          Open <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
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
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>New Pre-Build Estimate</DialogTitle>
              <DialogDescription>
                Select product and requirements. Material cost will be calculated from the approved BOM.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimate Title</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 6000 LPH plant for substation" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product *</label>
                <select
                  value={productId}
                  onChange={e => setProductId(e.target.value)}
                  className="w-full border rounded-md p-2 bg-background text-sm"
                  required
                >
                  {mockProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.model})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer (optional)</label>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full border rounded-md p-2 bg-background text-sm"
                >
                  <option value="">— None —</option>
                  {mockCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Requirements</label>
                <textarea
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  rows={3}
                  className="w-full border rounded-md p-2 bg-background text-sm"
                  placeholder="Capacity, filtration grade, heater spec, qty, site conditions..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Create & Calculate</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
