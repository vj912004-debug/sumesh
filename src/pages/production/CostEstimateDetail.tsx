import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft, Calculator, AlertTriangle, CheckCircle, Printer, Save, Layers, Package,
  FileText, ExternalLink,
} from 'lucide-react';
import { getCostEstimateById, updateCostEstimate } from '@/lib/costEstimateData';
import { createQuotationFromEstimate } from '@/lib/quotationService';
import {
  calculateMaterialEstimate, getBomForProduct, type RequirementSpec,
} from '@/lib/costingService';
import { mockProducts, mockCustomers } from '@/lib/mockData';

export default function CostEstimateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const initial = getCostEstimateById(id || '');

  const [estimate, setEstimate] = useState(initial);
  const [spec, setSpec] = useState<RequirementSpec>(initial?.spec ?? {
    capacityLph: 6000,
    buildQty: 1,
    filterMicron: 5,
    heaterKw: 3,
    plateThicknessMm: 10,
    fabricationOverheadPct: 18,
    targetMarginPct: 25,
  });
  const [requirements, setRequirements] = useState(initial?.requirements ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'Draft');
  const [saved, setSaved] = useState(false);

  if (!estimate) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-medium">Estimate not found</p>
        <Link to="/production/cost-estimates" className="text-primary hover:underline mt-2 inline-block">
          Back to estimates
        </Link>
      </div>
    );
  }

  const product = mockProducts.find(p => p.id === estimate.productId);
  const customer = estimate.customerId
    ? mockCustomers.find(c => c.id === estimate.customerId)
    : undefined;
  const bom = getBomForProduct(estimate.productId);

  const result = useMemo(
    () => calculateMaterialEstimate(estimate.productId, spec),
    [estimate.productId, spec]
  );

  const updateSpec = <K extends keyof RequirementSpec>(key: K, value: RequirementSpec[K]) => {
    setSpec(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    const updated = updateCostEstimate(estimate.id, {
      title,
      requirements,
      spec,
      status,
      materialCost: result.totalMaterialCost,
      buildCost: result.totalBuildCost,
      suggestedPrice: result.suggestedTotalPrice,
    });
    if (updated) {
      setEstimate(updated);
      setSaved(true);
    }
  };

  const handleCreateQuotation = () => {
    if (status === 'Draft') {
      const ok = window.confirm('Mark this estimate as Reviewed before creating a quotation?');
      if (!ok) return;
      setStatus('Reviewed');
    }
    const current = updateCostEstimate(estimate.id, {
      title,
      requirements,
      spec,
      status: status === 'Draft' ? 'Reviewed' : status,
      materialCost: result.totalMaterialCost,
      buildCost: result.totalBuildCost,
      suggestedPrice: result.suggestedTotalPrice,
    }) ?? estimate;

    const quote = createQuotationFromEstimate({
      ...current,
      status: current.status === 'Draft' ? 'Reviewed' : current.status,
    });
    setEstimate({ ...current, status: 'Quoted', quotationId: quote.id });
    navigate(`/quotations/${quote.id}`);
  };

  const canCreateQuote = status !== 'Quoted' && !estimate.quotationId;

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/production/cost-estimates">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">Pre-Build Estimate</h2>
              <Badge variant="outline">{estimate.id}</Badge>
              <Badge variant={status === 'Approved' ? 'default' : 'secondary'}>{status}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {product?.name} ({product?.model})
              {estimate.enquiryId && (
                <> · <Link to={`/enquiries/${estimate.enquiryId}`} className="text-primary hover:underline">Enquiry {estimate.enquiryId}</Link></>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={e => { setStatus(e.target.value as typeof status); setSaved(false); }}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            {(['Draft', 'Reviewed', 'Approved', 'Quoted'] as const).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> {saved ? 'Saved' : 'Save Estimate'}
          </Button>
          {canCreateQuote && (
            <Button variant="default" className="bg-teal-600 hover:bg-teal-700" onClick={handleCreateQuotation}>
              <FileText className="mr-2 h-4 w-4" /> Create Quotation
            </Button>
          )}
          {estimate.quotationId && (
            <Link to={`/quotations/${estimate.quotationId}`}>
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" /> View Quotation
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Material Cost</p>
            <p className="text-2xl font-bold mt-1">{fmt(result.totalMaterialCost)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">BOM × inventory rates × qty</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Build Cost</p>
            <p className="text-2xl font-bold mt-1">{fmt(result.totalBuildCost)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">+ {spec.fabricationOverheadPct}% fabrication</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Suggested Quote</p>
            <p className="text-2xl font-bold mt-1 text-primary">{fmt(result.suggestedTotalPrice)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">+ {spec.targetMarginPct}% margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Catalog Reference</p>
            <p className="text-2xl font-bold mt-1">{fmt(result.catalogPrice)}</p>
            <p className={`text-[10px] mt-1 ${result.suggestedTotalPrice <= result.catalogPrice ? 'text-emerald-600' : 'text-amber-600'}`}>
              {result.suggestedTotalPrice <= result.catalogPrice ? 'Within catalog band' : 'Above catalog price'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                Build Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <label className="font-medium">Estimate Title</label>
                <Input value={title} onChange={e => { setTitle(e.target.value); setSaved(false); }} />
              </div>
              <div className="space-y-2">
                <label className="font-medium">Requirements / Notes</label>
                <textarea
                  value={requirements}
                  onChange={e => { setRequirements(e.target.value); setSaved(false); }}
                  rows={4}
                  className="w-full border rounded-md p-2 text-sm bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Capacity (LPH)</label>
                  <Input type="number" min={1} value={spec.capacityLph}
                    onChange={e => updateSpec('capacityLph', Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Build Qty</label>
                  <Input type="number" min={1} value={spec.buildQty}
                    onChange={e => updateSpec('buildQty', Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Filter (micron)</label>
                  <Input type="number" min={1} value={spec.filterMicron}
                    onChange={e => updateSpec('filterMicron', Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Heater (kW)</label>
                  <Input type="number" min={1} step={0.5} value={spec.heaterKw}
                    onChange={e => updateSpec('heaterKw', Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Plate (mm)</label>
                  <Input type="number" min={4} value={spec.plateThicknessMm}
                    onChange={e => updateSpec('plateThicknessMm', Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Fab. Overhead %</label>
                  <Input type="number" min={0} value={spec.fabricationOverheadPct}
                    onChange={e => updateSpec('fabricationOverheadPct', Number(e.target.value))} />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs text-muted-foreground">Target Margin %</label>
                  <Input type="number" min={0} value={spec.targetMarginPct}
                    onChange={e => updateSpec('targetMarginPct', Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-500" />
                BOM Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {bom ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">BOM ID</span>
                    <span className="font-mono font-medium">{bom.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline">{bom.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Components</span>
                    <span>{bom.items.length} items</span>
                  </div>
                  <Link to={`/production/bom/${estimate.productId}`}>
                    <Button variant="outline" size="sm" className="w-full mt-2">View / Edit BOM</Button>
                  </Link>
                </>
              ) : (
                <p className="text-muted-foreground text-xs">
                  No BOM defined for this product. Add a BOM in Products & BOM to enable material costing.
                </p>
              )}
              {customer && (
                <div className="pt-3 border-t">
                  <span className="text-muted-foreground text-xs">Customer</span>
                  <p className="font-medium">{customer.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Material Breakdown (Approx.)
              </CardTitle>
              {result.stockWarnings > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {result.stockWarnings} stock shortfall{result.stockWarnings > 1 ? 's' : ''}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {result.lines.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No BOM materials found. Create a BOM for this product to calculate material cost.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-center">BOM Qty</TableHead>
                      <TableHead className="text-center">Req. Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Line Cost</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.lines.map(line => (
                      <TableRow key={line.inventoryItemId}>
                        <TableCell className="font-mono text-xs">{line.partNumber}</TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{line.name}</div>
                          <div className="text-[10px] text-muted-foreground">{line.category}</div>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {line.bomQty} {line.uom}
                        </TableCell>
                        <TableCell className="text-center text-sm font-semibold">
                          {line.adjustedQty} {line.uom}
                        </TableCell>
                        <TableCell className="text-right text-sm">{fmt(line.unitCost)}</TableCell>
                        <TableCell className="text-right font-semibold">{fmt(line.lineCost)}</TableCell>
                        <TableCell className="text-center">
                          {line.shortfall > 0 ? (
                            <span className="text-destructive text-xs font-medium flex items-center justify-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              −{line.shortfall}
                            </span>
                          ) : (
                            <span className="text-emerald-600 text-xs flex items-center justify-center gap-1">
                              <CheckCircle className="w-3 h-3" /> OK
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={5} className="text-right text-sm uppercase">
                        Total Material Cost
                      </TableCell>
                      <TableCell className="text-right text-primary">{fmt(result.totalMaterialCost)}</TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow className="font-semibold">
                      <TableCell colSpan={5} className="text-right text-sm">
                        Fabrication Overhead ({spec.fabricationOverheadPct}%)
                      </TableCell>
                      <TableCell className="text-right">{fmt(result.fabricationOverhead)}</TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow className="font-bold bg-primary/5">
                      <TableCell colSpan={5} className="text-right text-sm uppercase">
                        Approx. Build Cost (per unit)
                      </TableCell>
                      <TableCell className="text-right">{fmt(result.totalBuildCost)}</TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow className="font-bold">
                      <TableCell colSpan={5} className="text-right text-sm uppercase text-primary">
                        Suggested Quote ({spec.buildQty} unit{spec.buildQty > 1 ? 's' : ''})
                      </TableCell>
                      <TableCell className="text-right text-primary text-lg">{fmt(result.suggestedTotalPrice)}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
