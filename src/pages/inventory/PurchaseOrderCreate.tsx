import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  ArrowLeft, Factory, Package, Plus, ShoppingBag, Store, Trash2,
} from 'lucide-react';
import {
  createPurchaseOrder,
  getPoItemOptions,
  peekNextPoNo,
  PO_PURPOSE_OPTIONS,
  VENDOR_PRESETS,
  type PoPurpose,
} from '@/lib/purchaseOrderService';
import { loadInventory } from '@/lib/woMaterialIssue';
import { cn } from '@/lib/utils';

type NewLine = { inventoryItemId: string; qty: number; rate: number };

const PURPOSE_ICONS: Record<PoPurpose, typeof Factory> = {
  Manufacture: Factory,
  Sales: ShoppingBag,
  Rental: Package,
  General: Store,
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-sm font-medium text-zinc-700">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export default function PurchaseOrderCreate() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const itemOptions = useMemo(() => getPoItemOptions(), []);
  const inventory = useMemo(() => loadInventory(), []);
  const nextPoNo = useMemo(() => peekNextPoNo(), []);
  const poDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [poPurpose, setPoPurpose] = useState<PoPurpose | ''>('');
  const [vendor, setVendor] = useState('');
  const [vendorGstin, setVendorGstin] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorContact, setVendorContact] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [woRef, setWoRef] = useState('');
  const [remarks, setRemarks] = useState('');
  const [lines, setLines] = useState<NewLine[]>([{ inventoryItemId: '', qty: 1, rate: 0 }]);

  const lineTotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const gstEstimate = Math.round(lineTotal * 0.18);
  const grandTotal = lineTotal + gstEstimate;

  const updateLine = (index: number, patch: Partial<NewLine>) => {
    const next = [...lines];
    next[index] = { ...next[index], ...patch };
    if (patch.inventoryItemId) {
      const item = inventory.find(i => i.id === patch.inventoryItemId);
      if (item) next[index].rate = item.unitCost;
    }
    setLines(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (!poPurpose) throw new Error('Select what this PO is for.');
      if (!vendor.trim()) throw new Error('Vendor name is required.');
      if (!deliveryDate) throw new Error('Delivery date is required.');
      if (poPurpose === 'Manufacture' && !woRef.trim()) {
        throw new Error('WO Reference is required for manufacture POs.');
      }
      for (const line of lines) {
        if (!line.inventoryItemId) throw new Error('Select an item for every line.');
        if (line.qty <= 0) throw new Error('Quantity must be greater than zero.');
      }
      const po = createPurchaseOrder({
        poPurpose,
        vendorName: vendor,
        vendorGstin: vendorGstin || undefined,
        vendorAddress: vendorAddress || undefined,
        vendorContact: vendorContact || undefined,
        deliveryDate,
        workOrderRef: woRef || undefined,
        remarks: remarks || undefined,
        lines: lines.map(l => ({ inventoryItemId: l.inventoryItemId, qty: l.qty, rate: l.rate })),
      });
      navigate(`/purchase-orders/${po.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create PO.');
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-8" data-demo-page="po-create">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link to="/purchase/orders">
            <Button variant="outline" size="icon" className="shrink-0 mt-0.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Create Purchase Order</h2>
            <p className="text-sm text-muted-foreground mt-1">
              PO number <span className="font-mono font-semibold text-zinc-800">{nextPoNo}</span>
              {' · '}
              Date {new Date(poDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <Link to="/purchase/orders">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button
            type="submit"
            form="create-po-form"
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {saving ? 'Creating…' : 'Create PO'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <form id="create-po-form" onSubmit={handleSubmit} className="space-y-6">
        {/* PO purpose — card picker */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">What is this PO for?</CardTitle>
            <CardDescription>Select the business purpose — this drives WO linking and reporting.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {PO_PURPOSE_OPTIONS.map(opt => {
                const Icon = PURPOSE_ICONS[opt.value];
                const selected = poPurpose === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    data-demo={`po-purpose-${opt.value.toLowerCase()}`}
                    onClick={() => setPoPurpose(opt.value)}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all hover:border-teal-300 hover:bg-teal-50/40',
                      selected
                        ? 'border-teal-600 bg-teal-50 shadow-sm ring-1 ring-teal-600/20'
                        : 'border-zinc-200 bg-white',
                    )}
                  >
                    <div className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg',
                      selected ? 'bg-teal-600 text-white' : 'bg-zinc-100 text-zinc-600',
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-zinc-900">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {!poPurpose && (
              <p className="text-xs text-amber-700 mt-3">Please select a purpose to continue.</p>
            )}
          </CardContent>
        </Card>

        {/* Vendor + schedule — two columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Vendor Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <FieldLabel required>Vendor Name</FieldLabel>
                <Input
                  list="vendor-presets"
                  value={vendor}
                  onChange={e => setVendor(e.target.value)}
                  placeholder="Laxmi Steels & Alloys"
                  required
                  data-demo="po-vendor"
                />
                <datalist id="vendor-presets">
                  {VENDOR_PRESETS.map(v => <option key={v} value={v} />)}
                </datalist>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel>Vendor GSTIN</FieldLabel>
                  <Input
                    value={vendorGstin}
                    onChange={e => setVendorGstin(e.target.value)}
                    placeholder="24AABCL1234F1Z9"
                    className="font-mono text-sm"
                    data-demo="po-gstin"
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Contact</FieldLabel>
                  <Input
                    value={vendorContact}
                    onChange={e => setVendorContact(e.target.value)}
                    placeholder="Name & phone"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Vendor Address</FieldLabel>
                <Input
                  value={vendorAddress}
                  onChange={e => setVendorAddress(e.target.value)}
                  placeholder="GIDC Makarpura, Vadodara"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Schedule & References</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel>PO Number</FieldLabel>
                  <Input value={nextPoNo} readOnly className="font-mono font-semibold bg-zinc-50" />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>PO Date</FieldLabel>
                  <Input type="date" value={poDate} readOnly className="bg-zinc-50" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel required>Delivery Date</FieldLabel>
                  <Input
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel required={poPurpose === 'Manufacture'}>WO Reference</FieldLabel>
                  <Input
                    value={woRef}
                    onChange={e => setWoRef(e.target.value)}
                    placeholder="WO-26-101"
                    required={poPurpose === 'Manufacture'}
                    className={poPurpose === 'Manufacture' && !woRef ? 'border-amber-300' : ''}
                    data-demo="po-wo-ref"
                  />
                </div>
              </div>
              {poPurpose === 'Manufacture' && (
                <p className="text-xs text-muted-foreground rounded-md bg-amber-50 border border-amber-100 px-3 py-2">
                  Manufacture POs must be linked to a work order for material allocation on GRN.
                </p>
              )}
              <div className="space-y-1.5">
                <FieldLabel>Remarks</FieldLabel>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Delivery instructions, MTC required, etc."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line items table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
            <div>
              <CardTitle className="text-lg">Line Items</CardTitle>
              <CardDescription className="mt-1">Select items from Item Master — rate auto-fills from master cost.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLines([...lines, { inventoryItemId: '', qty: 1, rate: 0 }])}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Line
            </Button>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/80 hover:bg-zinc-50/80">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead className="min-w-[280px]">Item</TableHead>
                    <TableHead className="w-28 text-right">Qty</TableHead>
                    <TableHead className="w-32 text-right">Rate (₹)</TableHead>
                    <TableHead className="w-36 text-right">Amount (₹)</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center text-muted-foreground text-sm">{index + 1}</TableCell>
                      <TableCell>
                        <SearchableSelect
                          options={itemOptions}
                          value={line.inventoryItemId}
                          onChange={v => updateLine(index, { inventoryItemId: v })}
                          placeholder="Search item code or name…"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={line.qty}
                          onChange={e => updateLine(index, { qty: Number(e.target.value) || 0 })}
                          className="text-right h-9"
                          required
                          data-demo={index === 0 ? 'po-line-qty' : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.rate}
                          onChange={e => updateLine(index, { rate: Number(e.target.value) || 0 })}
                          className="text-right h-9"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {line.inventoryItemId
                          ? (line.qty * line.rate).toLocaleString('en-IN')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {lines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setLines(lines.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t bg-zinc-50/50 px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                {poPurpose && <Badge variant="outline">{poPurpose}</Badge>}
                <span className="text-sm text-muted-foreground">{lines.length} line{lines.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex flex-col sm:items-end gap-1 text-sm">
                <div className="flex justify-between sm:justify-end gap-8 text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-zinc-800">₹{lineTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-8 text-muted-foreground">
                  <span>GST (18% est.)</span>
                  <span className="tabular-nums">₹{gstEstimate.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-8 text-base font-semibold text-zinc-900 pt-1 border-t border-zinc-200 mt-1">
                  <span>Grand Total</span>
                  <span className="tabular-nums">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile footer actions */}
        <div className="flex gap-3 lg:hidden">
          <Link to="/purchase/orders" className="flex-1">
            <Button type="button" variant="outline" className="w-full">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
            {saving ? 'Creating…' : 'Create PO'}
          </Button>
        </div>
      </form>
    </div>
  );
}
