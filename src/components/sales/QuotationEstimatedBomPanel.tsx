import { useMemo, useState, Fragment } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  addQuotationBomLine,
  approveQuotationEstimatedBom,
  getQuotationEstimatedBom,
  removeQuotationBomLine,
  replaceQuotationBomLine,
  updateQuotationBomLine,
  type QuotationBomLine,
} from '@/lib/quotationEstimatedBom';
import { getInventoryItemOptions } from '@/lib/plantCatalogQuote';
import { formatQuotedAmount } from '@/lib/quotationService';
import { CheckCircle2, Layers, Plus, Replace, Trash2 } from 'lucide-react';

type Props = {
  quotationId: string;
  editable?: boolean;
  onUpdated?: () => void;
};

export default function QuotationEstimatedBomPanel({ quotationId, editable = true, onUpdated }: Props) {
  const [refresh, setRefresh] = useState(0);
  const [selectedItem, setSelectedItem] = useState('');
  const [addQty, setAddQty] = useState('1');
  const [replacingLineId, setReplacingLineId] = useState<string | null>(null);
  const [replaceItemId, setReplaceItemId] = useState('');

  const bom = useMemo(() => getQuotationEstimatedBom(quotationId), [quotationId, refresh]);
  const itemOptions = useMemo(() => getInventoryItemOptions(), []);

  const bump = () => {
    setRefresh(n => n + 1);
    onUpdated?.();
  };

  const handleAdd = () => {
    if (!selectedItem) return;
    addQuotationBomLine(quotationId, selectedItem, Number(addQty) || 1);
    setSelectedItem('');
    setAddQty('1');
    bump();
  };

  const handleApprove = () => {
    try {
      approveQuotationEstimatedBom(quotationId);
      bump();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Approve failed');
    }
  };

  const handleReplace = (lineId: string) => {
    if (!replaceItemId) return;
    replaceQuotationBomLine(quotationId, lineId, replaceItemId);
    setReplacingLineId(null);
    setReplaceItemId('');
    bump();
  };

  const lineAmount = (l: QuotationBomLine) => l.quantity * l.unitRate;

  return (
    <Card className="print:hidden border-teal-200/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
          <Layers className="h-4 w-4 text-teal-600" />
          Quotation BOM (Estimated)
          {bom.approved && <Badge className="bg-teal-100 text-teal-800 border-teal-200">Approved</Badge>}
          {bom.linkedWoIds.length > 0 && (
            <Badge variant="outline">Linked to {bom.linkedWoIds.length} WO(s)</Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Build estimated BOM from Item Master — searchable by first 2–3 letters of item name or part code.
          Approved BOM links to Work Order when PO is awarded.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part No.</TableHead>
              <TableHead>Item / Component</TableHead>
              <TableHead className="text-center w-24">Qty</TableHead>
              <TableHead className="text-right w-28">Rate</TableHead>
              <TableHead className="text-right w-28">Amount</TableHead>
              {editable && <TableHead className="w-24" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bom.lines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={editable ? 6 : 5} className="text-center text-muted-foreground py-8">
                  No components yet — add items from catalog below.
                </TableCell>
              </TableRow>
            ) : (
              bom.lines.map(line => (
                <Fragment key={line.id}>
                  <TableRow>
                    <TableCell className="font-mono text-xs">{line.partNumber}</TableCell>
                    <TableCell className="text-sm font-medium">{line.itemName}</TableCell>
                    <TableCell className="text-center">
                      {editable ? (
                        <Input
                          type="number"
                          min={0.01}
                          step="0.01"
                          className="h-8 w-20 mx-auto text-center"
                          value={line.quantity}
                          onChange={e =>
                            updateQuotationBomLine(quotationId, line.id, {
                              quantity: Number(e.target.value) || 0,
                            }) && bump()
                          }
                        />
                      ) : (
                        `${line.quantity} ${line.uom}`
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {editable ? (
                        <Input
                          type="number"
                          min={0}
                          className="h-8 w-24 ml-auto text-right"
                          value={line.unitRate}
                          onChange={e =>
                            updateQuotationBomLine(quotationId, line.id, {
                              unitRate: Number(e.target.value) || 0,
                            }) && bump()
                          }
                        />
                      ) : (
                        formatQuotedAmount(line.unitRate)
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatQuotedAmount(lineAmount(line))}
                    </TableCell>
                    {editable && (
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Replace item"
                            onClick={() => {
                              setReplacingLineId(replacingLineId === line.id ? null : line.id);
                              setReplaceItemId('');
                            }}
                          >
                            <Replace className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              removeQuotationBomLine(quotationId, line.id);
                              bump();
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                  {replacingLineId === line.id && editable && (
                    <TableRow className="bg-muted/40">
                      <TableCell colSpan={6} className="py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">Replace with:</span>
                          <div className="flex-1 min-w-[200px] max-w-md">
                            <SearchableSelect
                              options={itemOptions}
                              value={replaceItemId}
                              onChange={setReplaceItemId}
                              placeholder="Search item…"
                            />
                          </div>
                          <Button type="button" size="sm" disabled={!replaceItemId} onClick={() => handleReplace(line.id)}>
                            Replace
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => setReplacingLineId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>

        {editable && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-medium">Add component from Item Catalog</p>
            <div className="grid gap-3 md:grid-cols-[1fr_100px_auto]">
              <SearchableSelect
                options={itemOptions}
                value={selectedItem}
                onChange={setSelectedItem}
                placeholder="Type 2–3 letters e.g. Epoxy, MS Plate…"
              />
              <Input type="number" min={0.01} step="0.01" value={addQty} onChange={e => setAddQty(e.target.value)} />
              <Button type="button" onClick={handleAdd} disabled={!selectedItem}>
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm font-semibold">
            Total estimated material cost: {formatQuotedAmount(bom.totalEstimatedCost)}
          </p>
          {editable && bom.lines.length > 0 && !bom.approved && (
            <Button type="button" variant="secondary" onClick={handleApprove}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Estimated BOM
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
