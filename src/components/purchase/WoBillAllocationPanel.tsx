import { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  allocateBillToWorkOrders,
  confirmBillAllocation,
  getPendingWoLinesForItem,
  inventoryItemOptions,
  loadAllocationAudit,
  parseWoAllocationQuery,
  type PurchaseBillInput,
  type WoAllocationResult,
} from '@/lib/woBillAllocation';
import { getOpenWarrantyChallanOptions, validateRepairCostBooking } from '@/lib/warrantyRepairService';
import { AlertTriangle, CheckCircle2, Shield, Sparkles, Split } from 'lucide-react';

type Props = {
  initialBillRef?: string;
  initialPoRef?: string;
  initialVendor?: string;
  initialDate?: string;
  onBooked?: (message: string) => void;
};

const fieldClass = 'space-y-1.5';
const labelClass = 'text-sm font-medium text-zinc-700';

export default function WoBillAllocationPanel({
  initialBillRef = '',
  initialPoRef = '',
  initialVendor = '',
  initialDate = new Date().toISOString().split('T')[0],
  onBooked,
}: Props) {
  const items = useMemo(() => inventoryItemOptions(), []);

  const [billRef, setBillRef] = useState(initialBillRef);
  const [poRef, setPoRef] = useState(initialPoRef);
  const [woRef, setWoRef] = useState('');
  const [itemCode, setItemCode] = useState('MS-PL-10MM');
  const [quantity, setQuantity] = useState('750');
  const [vendorName, setVendorName] = useState(initialVendor);
  const [billDate, setBillDate] = useState(initialDate);
  const [siteCode, setSiteCode] = useState('');
  const [approvalOverride, setApprovalOverride] = useState(false);
  const [warrantyChallanRef, setWarrantyChallanRef] = useState('');
  const [repairCostAmount, setRepairCostAmount] = useState('');
  const [warrantyCostOverride, setWarrantyCostOverride] = useState(false);
  const [warrantyCostError, setWarrantyCostError] = useState<string | null>(null);
  const [nlQuery, setNlQuery] = useState('');
  const [result, setResult] = useState<WoAllocationResult | null>(null);
  const [booked, setBooked] = useState(false);
  const [auditRefresh, setAuditRefresh] = useState(0);

  const selectedItem = items.find(i => i.code === itemCode);
  const pendingLines = useMemo(
    () => getPendingWoLinesForItem(itemCode, selectedItem?.name, siteCode || undefined),
    [itemCode, selectedItem?.name, siteCode, auditRefresh]
  );

  const warrantyChallanOptions = useMemo(() => getOpenWarrantyChallanOptions(), [auditRefresh, booked]);

  const buildInput = (): PurchaseBillInput => ({
    billRef: billRef || `BILL-${Date.now()}`,
    itemCode,
    itemName: selectedItem?.name ?? itemCode,
    quantity: Number(quantity) || 0,
    vendorName,
    billDate,
    siteCode: siteCode || undefined,
    poRef: poRef || undefined,
    woRef: woRef || undefined,
    approvalOverride,
    warrantyChallanRef: warrantyChallanRef || undefined,
    repairCostAmount: Number(repairCostAmount) || 0,
    warrantyCostOverride,
  });

  const checkWarrantyCost = (input: PurchaseBillInput) => {
    const check = validateRepairCostBooking(
      input.warrantyChallanRef,
      input.repairCostAmount ?? 0,
      input.warrantyCostOverride
    );
    if (!check.ok) {
      setWarrantyCostError(check.message);
      return false;
    }
    setWarrantyCostError(check.warning ?? null);
    return true;
  };

  const handlePreview = () => {
    setBooked(false);
    const input = buildInput();
    if (input.quantity <= 0) return;
    if (!checkWarrantyCost(input)) return;
    setResult(allocateBillToWorkOrders(input, { dryRun: true }));
  };

  const handleConfirm = () => {
    const input = buildInput();
    if (!checkWarrantyCost(input)) return;
    try {
      const audit = confirmBillAllocation(input);
      setResult(allocateBillToWorkOrders(input, { dryRun: true }));
      setBooked(true);
      setAuditRefresh(n => n + 1);
      onBooked?.(
        `Bill ${input.billRef} booked — ${audit.allocations.length} WO line(s), ` +
        `${audit.excessQty > 0 ? `${audit.excessQty} excess flagged` : 'fully allocated'}`
      );
    } catch (err) {
      setWarrantyCostError(err instanceof Error ? err.message : 'Booking failed.');
    }
  };

  const handleNlQuery = () => {
    const parsed = parseWoAllocationQuery(nlQuery);
    if (!parsed) return;
    const nextCode = parsed.itemCode ?? itemCode;
    const nextQty = parsed.quantity != null ? String(parsed.quantity) : quantity;
    const nextVendor = parsed.vendorName ?? vendorName;
    const nextDate = parsed.billDate ?? billDate;
    if (parsed.itemCode) setItemCode(parsed.itemCode);
    if (parsed.quantity != null) setQuantity(String(parsed.quantity));
    if (parsed.vendorName) setVendorName(parsed.vendorName);
    if (parsed.billDate) setBillDate(parsed.billDate);

    const item = inventoryItemOptions().find(i => i.code === nextCode);
    setBooked(false);
    setResult(
      allocateBillToWorkOrders(
        {
          billRef: billRef || `BILL-${Date.now()}`,
          itemCode: nextCode,
          itemName: item?.name ?? nextCode,
          quantity: Number(nextQty) || 0,
          vendorName: nextVendor,
          billDate: nextDate,
          siteCode: siteCode || undefined,
          poRef: poRef || undefined,
          woRef: woRef || undefined,
          approvalOverride,
        },
        { dryRun: true }
      )
    );
  };

  const audit = useMemo(() => loadAllocationAudit(), [auditRefresh, booked]);

  return (
    <div className="space-y-6">
      <Card className="border-dashed border-violet-200 bg-violet-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            Natural-language allocation query
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Example: &quot;Show pending Work Orders with balance for MS Plate 10mm. Bill for 750 units from Laxmi Steels dated 2026-06-30.&quot;
          </p>
          <div className="flex gap-2">
            <Input
              value={nlQuery}
              onChange={e => setNlQuery(e.target.value)}
              placeholder="Describe the bill and item to auto-match FIFO..."
              className="bg-white"
            />
            <Button type="button" variant="secondary" onClick={handleNlQuery}>
              Run Query
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className={fieldClass}>
          <label className={labelClass}>Bill Reference No.</label>
          <Input value={billRef} onChange={e => setBillRef(e.target.value)} placeholder="BILL-26-1201" />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>PO Reference</label>
          <Input value={poRef} onChange={e => setPoRef(e.target.value)} placeholder="PO-26-050" />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>WO Tag on PO (Step 1)</label>
          <Input value={woRef} onChange={e => setWoRef(e.target.value)} placeholder="WO-26-082 (optional)" />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>Item Code</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={itemCode}
            onChange={e => setItemCode(e.target.value)}
          >
            {items.map(i => (
              <option key={i.code} value={i.code}>{i.label}</option>
            ))}
          </select>
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>Quantity Purchased</label>
          <Input type="number" min={0} value={quantity} onChange={e => setQuantity(e.target.value)} />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>Vendor Name</label>
          <Input value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="Laxmi Steels" />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>Purchase / Bill Date</label>
          <Input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>Site / Location (optional)</label>
          <Input value={siteCode} onChange={e => setSiteCode(e.target.value)} placeholder="Makarpura GIDC" />
        </div>
        <div className={`${fieldClass} flex items-end`}>
          <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={approvalOverride}
              onChange={e => setApprovalOverride(e.target.checked)}
              className="rounded border-zinc-300"
            />
            Approval override (beyond sanctioned qty)
          </label>
        </div>
      </div>

      <Card className="border-dashed border-teal-200 bg-teal-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-teal-600" />
            Warranty Repair Bill Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            If this purchase bill is for vendor repair linked to a warranty outward challan, select the challan.
            Repair cost is blocked when warranty status is Under/Extended Warranty.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className={fieldClass}>
              <label className={labelClass}>Warranty Outward Challan Ref</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={warrantyChallanRef}
                onChange={e => { setWarrantyChallanRef(e.target.value); setWarrantyCostError(null); }}
              >
                <option value="">— Not a warranty repair bill —</option>
                {warrantyChallanOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label} — {o.sublabel}</option>
                ))}
              </select>
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Repair Cost (₹)</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={repairCostAmount}
                onChange={e => { setRepairCostAmount(e.target.value); setWarrantyCostError(null); }}
                placeholder="0 — leave blank if no repair charge"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={warrantyCostOverride}
              onChange={e => setWarrantyCostOverride(e.target.checked)}
              className="rounded border-zinc-300"
            />
            Warranty cost override (explicit approval to book repair cost on covered warranty)
          </label>
          {warrantyCostError && (
            <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
              warrantyCostError.includes('override') || warrantyCostError.includes('blocked')
                ? 'border-red-300 bg-red-50 text-red-900'
                : 'border-amber-300 bg-amber-50 text-amber-900'
            }`}>
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              {warrantyCostError}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handlePreview}>Preview WO Allocation (FIFO)</Button>
        {result?.canBook && !booked && (
          <Button variant="default" onClick={handleConfirm}>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm & Book Bill
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Open Work Orders — {selectedItem?.name} ({pendingLines.length} pending)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WO Number</TableHead>
                <TableHead>SO Ref</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Sanctioned</TableHead>
                <TableHead className="text-right">Billed</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>WO Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingLines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                    No open Work Orders with balance for this item.
                  </TableCell>
                </TableRow>
              ) : (
                pendingLines.map(row => (
                  <TableRow key={`${row.woId}-${row.itemCode}`}>
                    <TableCell className="font-medium">{row.woId}</TableCell>
                    <TableCell>{row.orderId}</TableCell>
                    <TableCell className="text-sm">{row.itemCode}</TableCell>
                    <TableCell className="text-right">{row.sanctionedQty}</TableCell>
                    <TableCell className="text-right">{row.billedQty}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {row.sanctionedQty - row.billedQty}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.billingStatus}</Badge>
                    </TableCell>
                    <TableCell>{row.woStartDate}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {result && (
        <Card className={result.excessQty > 0 ? 'border-amber-300' : 'border-emerald-300'}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {result.splitAcrossWoCount > 1 && <Split className="h-4 w-4" />}
              Allocation Result
              {result.splitAcrossWoCount > 1 && (
                <Badge variant="outline">Split across {result.splitAcrossWoCount} WOs</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{result.logicSummary}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.allocations.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO Number</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty Billed</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                    <TableHead>Bill Ref</TableHead>
                    <TableHead>Match</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.allocations.map((a, i) => (
                    <TableRow key={`${a.woNumber}-${i}`}>
                      <TableCell className="font-medium">{a.woNumber}</TableCell>
                      <TableCell>{a.itemName}</TableCell>
                      <TableCell className="text-right font-semibold">{a.qtyBilled}</TableCell>
                      <TableCell className="text-right">{a.balanceQtyRemaining}</TableCell>
                      <TableCell>{a.billReference}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{a.matchMethod}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {result.excessQty > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Unmatched / Excess Quantity: {result.excessQty}</p>
                  <p className="text-amber-800 mt-1">
                    Purchased quantity exceeds total pending balance across all matching Work Orders.
                    Excess is not auto-booked — route for manual review.
                  </p>
                </div>
              </div>
            )}

            {result.requiresApproval && (
              <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-4 text-sm">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                <p className="text-red-900">{result.approvalMessage}</p>
              </div>
            )}

            {booked && (
              <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Booking saved. Audit trail updated.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {audit.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Allocation Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Bill Ref</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>WOs</TableHead>
                  <TableHead>Logic</TableHead>
                  <TableHead className="text-right">Excess</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.slice(0, 10).map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {new Date(entry.timestamp).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="font-medium">{entry.billRef}</TableCell>
                    <TableCell>{entry.itemCode}</TableCell>
                    <TableCell className="text-right">{entry.quantityPurchased}</TableCell>
                    <TableCell className="text-sm">
                      {entry.allocations.map(a => `${a.woNumber} (${a.qtyBilled})`).join(', ')}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={entry.logic}>
                      {entry.logic}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.excessQty > 0 ? (
                        <Badge variant="outline" className="text-amber-700">{entry.excessQty}</Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
