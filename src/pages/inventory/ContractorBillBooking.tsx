import { Fragment, useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  bookContractorBill,
  CONTRACTOR_ITEM_OPTIONS,
  getBillWiseReport,
  getItemToWoMatchingReport,
  getOpenWoOptions,
  getWoWiseReport,
  loadContractorBills,
  parseContractorBillQuery,
  suggestWosForItem,
  validateContractorBill,
  type ContractorBillLineInput,
} from '@/lib/contractorBillBooking';
import { AlertTriangle, CheckCircle2, Lightbulb, Plus, Sparkles, Trash2 } from 'lucide-react';

const emptyLine = (): ContractorBillLineInput => ({
  woId: '',
  jobName: '',
  itemDescription: '',
  itemCode: '',
  amount: 0,
  qty: undefined,
  uom: '',
});

export default function ContractorBillBooking() {
  const [billNo, setBillNo] = useState('BILL-PNT-001');
  const [billDate, setBillDate] = useState('2026-07-05');
  const [vendorName, setVendorName] = useState('Ramesh Painting Contractor');
  const [totalAmount, setTotalAmount] = useState('12000');
  const [approvalOverride, setApprovalOverride] = useState(false);
  const [nlQuery, setNlQuery] = useState('');
  const [activeSuggestLine, setActiveSuggestLine] = useState<number | null>(null);
  const [lines, setLines] = useState<ContractorBillLineInput[]>([
    {
      woId: 'WO-26-201', jobName: 'Machine A — Tank Painting',
      itemDescription: 'Epoxy Primer + Top Coat', itemCode: 'PNT-EPX-PRM',
      amount: 5000, qty: 12, uom: 'Ltr',
    },
    {
      woId: 'WO-26-202', jobName: 'Machine B — Panel Coating',
      itemDescription: 'Top Coat Blue', itemCode: 'PNT-TOP-BLU',
      amount: 3000, qty: 8, uom: 'Ltr',
    },
    {
      woId: 'WO-26-203', jobName: 'Machine C — Full Paint Job',
      itemDescription: 'Sand Blasting + Paint', itemCode: 'SVC-SANDBLAST',
      amount: 4000, qty: 25, uom: 'Sqm',
    },
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  const openWos = useMemo(() => getOpenWoOptions(), [refresh]);

  const validation = useMemo(
    () =>
      validateContractorBill({
        billNo,
        billDate,
        vendorName,
        totalAmount: Number(totalAmount) || 0,
        lines,
        approvalOverride,
      }),
    [billNo, billDate, vendorName, totalAmount, lines, approvalOverride]
  );

  const woReport = useMemo(() => getWoWiseReport(), [refresh]);
  const billReport = useMemo(() => getBillWiseReport(), [refresh]);
  const itemReport = useMemo(() => getItemToWoMatchingReport(), [refresh]);

  const updateLine = (index: number, patch: Partial<ContractorBillLineInput>) => {
    setLines(prev => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const applySuggestion = (lineIndex: number, woId: string, jobName: string, itemCode: string, itemName: string, uom: string) => {
    updateLine(lineIndex, { woId, jobName, itemCode, itemDescription: itemName, uom });
    setActiveSuggestLine(null);
  };

  const addLine = () => setLines(prev => [...prev, emptyLine()]);
  const removeLine = (index: number) => setLines(prev => prev.filter((_, i) => i !== index));

  const handleNlQuery = () => {
    const parsed = parseContractorBillQuery(nlQuery);
    if (!parsed) return;
    if (parsed.vendorName) setVendorName(parsed.vendorName);
    if (parsed.totalAmount != null) setTotalAmount(String(parsed.totalAmount));
    if (parsed.itemDescription) {
      const suggestions = suggestWosForItem(parsed.itemDescription, parsed.qty);
      if (suggestions.length > 0) {
        const s = suggestions[0];
        setLines(prev => [
          ...prev,
          {
            woId: s.woId,
            jobName: s.jobName,
            itemCode: s.itemCode,
            itemDescription: s.itemName,
            qty: parsed.qty,
            uom: s.uom,
            amount: 0,
          },
        ]);
      }
    }
  };

  const handleBook = () => {
    try {
      bookContractorBill({
        billNo,
        billDate,
        vendorName,
        totalAmount: Number(totalAmount) || 0,
        lines,
        approvalOverride,
      });
      setRefresh(n => n + 1);
      setToast(`Bill ${billNo} booked — ${lines.length} WO line(s) updated.`);
      setBillNo(`BILL-PNT-${String(loadContractorBills().length + 1).padStart(3, '0')}`);
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Booking failed');
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Contractor Bill Booking</h2>
        <p className="text-muted-foreground">
          Split one contractor bill across multiple Work Orders — track cost, items, and qty per job/machine.
        </p>
      </div>

      <Card className="border-dashed border-violet-200 bg-violet-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            AI / query assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Example: &quot;Book contractor bill from Ramesh Painting for total amount ₹12000 covering Epoxy Primer qty 12 across multiple machines.&quot;
          </p>
          <div className="flex gap-2">
            <Input
              value={nlQuery}
              onChange={e => setNlQuery(e.target.value)}
              placeholder="Describe bill, contractor, items, and qty..."
              className="bg-white"
            />
            <Button type="button" variant="secondary" onClick={handleNlQuery}>Run</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bill Header</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bill No.</label>
            <Input value={billNo} onChange={e => setBillNo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bill Date</label>
            <Input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Contractor / Vendor</label>
            <Input value={vendorName} onChange={e => setVendorName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Total Bill Amount (₹)</label>
            <Input type="number" min={0} value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Bill Line Items — one WO per row</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Enter item/qty to get suggested WOs where that item is still pending.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addLine}>
            <Plus className="mr-1 h-4 w-4" /> Add Line
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">WO No.</TableHead>
                  <TableHead className="min-w-[160px]">Job / Machine</TableHead>
                  <TableHead className="min-w-[140px]">Item / Work</TableHead>
                  <TableHead className="min-w-[120px]">Description</TableHead>
                  <TableHead className="w-20">Qty</TableHead>
                  <TableHead className="w-20">UOM</TableHead>
                  <TableHead className="text-right w-28">Amount ₹</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, i) => {
                  const wo = openWos.find(w => w.woId === line.woId);
                  const result = validation.lines[i];
                  const itemQuery = line.itemCode || line.itemDescription;
                  const suggestions = activeSuggestLine === i && itemQuery
                    ? suggestWosForItem(itemQuery, line.qty)
                    : [];

                  return (
                    <Fragment key={i}>
                      <TableRow className={result?.exceeded ? 'bg-red-50/60' : undefined}>
                        <TableCell>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                            value={line.woId}
                            onChange={e => {
                              const woId = e.target.value;
                              const selected = openWos.find(w => w.woId === woId);
                              updateLine(i, {
                                woId,
                                jobName: selected?.jobName ?? line.jobName,
                              });
                            }}
                          >
                            <option value="">Select WO…</option>
                            {openWos.map(w => (
                              <option key={w.woId} value={w.woId}>
                                {w.woId} · Bal ₹{(w.sanctionedAmount - w.totalBilled).toLocaleString('en-IN')}
                              </option>
                            ))}
                          </select>
                          {wo && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Sanctioned ₹{wo.sanctionedAmount.toLocaleString('en-IN')}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.jobName}
                            onChange={e => updateLine(i, { jobName: e.target.value })}
                            placeholder="Machine name"
                          />
                        </TableCell>
                        <TableCell>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                            value={line.itemCode ?? ''}
                            onChange={e => {
                              const opt = CONTRACTOR_ITEM_OPTIONS.find(o => o.code === e.target.value);
                              updateLine(i, {
                                itemCode: e.target.value,
                                itemDescription: opt?.name ?? line.itemDescription,
                                uom: opt?.uom ?? line.uom,
                              });
                              setActiveSuggestLine(i);
                            }}
                          >
                            <option value="">Select item…</option>
                            {CONTRACTOR_ITEM_OPTIONS.map(o => (
                              <option key={o.code} value={o.code}>{o.name}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.itemDescription}
                            onChange={e => {
                              updateLine(i, { itemDescription: e.target.value });
                              setActiveSuggestLine(i);
                            }}
                            onFocus={() => setActiveSuggestLine(i)}
                            placeholder="Paint / work done"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={line.qty ?? ''}
                            onChange={e => {
                              updateLine(i, { qty: e.target.value ? Number(e.target.value) : undefined });
                              setActiveSuggestLine(i);
                            }}
                            onFocus={() => setActiveSuggestLine(i)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.uom ?? ''}
                            onChange={e => updateLine(i, { uom: e.target.value })}
                            placeholder="Ltr"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="text-right"
                            value={line.amount || ''}
                            onChange={e => updateLine(i, { amount: Number(e.target.value) || 0 })}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={lines.length <= 1}
                            onClick={() => removeLine(i)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {suggestions.length > 0 && (
                        <TableRow className="bg-blue-50/50">
                          <TableCell colSpan={8} className="py-2">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <Lightbulb className="h-4 w-4 text-blue-600 shrink-0" />
                              <span className="text-blue-900 font-medium">Suggested WOs (pending item/qty):</span>
                              {suggestions.map(s => (
                                <Button
                                  key={s.woId}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs bg-white"
                                  onClick={() => applySuggestion(i, s.woId, s.jobName, s.itemCode, s.itemName, s.uom)}
                                >
                                  {s.woId} · {s.itemName} · bal {s.balanceQty} {s.uom}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div className="text-sm space-y-1">
              <p>
                Line total: <strong>₹{validation.lineTotal.toLocaleString('en-IN')}</strong>
                {' · '}
                Bill total: <strong>₹{Number(totalAmount || 0).toLocaleString('en-IN')}</strong>
                {validation.totalMatches && (
                  <Badge variant="default" className="ml-2">Balanced</Badge>
                )}
              </p>
              {!validation.totalMatches && (
                <p className="text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Mismatch ₹{Math.abs(validation.totalDiff).toLocaleString('en-IN')} — line sum must equal bill total
                </p>
              )}
              {validation.hasExceeded && (
                <p className="text-amber-700">{validation.exceededMessages.join(' · ')}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={approvalOverride}
                  onChange={e => setApprovalOverride(e.target.checked)}
                  className="rounded border-zinc-300"
                />
                Approval override
              </label>
              <Button disabled={!validation.canSave} onClick={handleBook}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Book Bill
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">WO-wise Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WO No.</TableHead>
                  <TableHead>Job / Machine</TableHead>
                  <TableHead className="text-right">Sanctioned</TableHead>
                  <TableHead className="text-right">Total Billed</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {woReport.map(row => (
                  <TableRow key={row.woId}>
                    <TableCell className="font-medium">{row.woId}</TableCell>
                    <TableCell className="text-sm">{row.jobName}</TableCell>
                    <TableCell className="text-right">₹{row.sanctionedAmount.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right">₹{row.totalBilled.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{row.balance.toLocaleString('en-IN')}
                      {row.status === 'Closed' && (
                        <Badge variant="secondary" className="ml-1">Closed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bill-wise Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill No.</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>WO Split</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billReport.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No bills booked yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  billReport.map(row => (
                    <TableRow key={row.billNo + row.billDate}>
                      <TableCell className="font-medium">{row.billNo}</TableCell>
                      <TableCell className="text-sm">{row.vendorName}</TableCell>
                      <TableCell className="text-right">₹{row.totalAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs">{row.splitSummary}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item-to-WO Matching Report</CardTitle>
          <p className="text-sm text-muted-foreground">
            Which item/qty from each bill was booked against which Work Order.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill No.</TableHead>
                <TableHead>Item Purchased / Work</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Matched WO(s)</TableHead>
                <TableHead>Qty Booked per WO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemReport.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    Book a bill to see item-to-WO matching.
                  </TableCell>
                </TableRow>
              ) : (
                itemReport.map((row, idx) => (
                  <TableRow key={`${row.billNo}-${idx}`}>
                    <TableCell className="font-medium">{row.billNo}</TableCell>
                    <TableCell>{row.item}</TableCell>
                    <TableCell className="text-right">
                      {row.qty > 0 ? `${row.qty} ${row.uom}` : '—'}
                    </TableCell>
                    <TableCell>{row.matchedWos}</TableCell>
                    <TableCell>{row.qtyPerWo}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
