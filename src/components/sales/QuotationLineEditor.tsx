import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  addProductToQuotation,
  removeQuotationLine,
  updateQuotationLine,
  formatQuotedAmount,
  getQuotationById,
} from '@/lib/quotationService';
import {
  getCatalogProductOptions,
  getProductQuoteEstimate,
} from '@/lib/plantCatalogQuote';
import { getBomForProduct } from '@/lib/bomService';
import { mockProducts } from '@/lib/mockData';
import { Calculator, Layers, PackageSearch, Plus, Trash2 } from 'lucide-react';

type Props = {
  quotationId: string;
  editable?: boolean;
  onUpdated?: () => void;
};

export default function QuotationLineEditor({ quotationId, editable = true, onUpdated }: Props) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [addQty, setAddQty] = useState('1');
  const [refresh, setRefresh] = useState(0);

  const quote = useMemo(() => getQuotationById(quotationId), [quotationId, refresh]);
  const catalogOptions = useMemo(() => getCatalogProductOptions(), []);

  const preview = useMemo(() => {
    if (!selectedProductId) return undefined;
    return getProductQuoteEstimate(selectedProductId, Number(addQty) || 1);
  }, [selectedProductId, addQty]);

  if (!quote) return null;

  const handleAdd = () => {
    if (!selectedProductId) return;
    addProductToQuotation(quotationId, selectedProductId, Number(addQty) || 1);
    setSelectedProductId('');
    setAddQty('1');
    setRefresh(n => n + 1);
    onUpdated?.();
  };

  const handleRemove = (index: number) => {
    removeQuotationLine(quotationId, index);
    setRefresh(n => n + 1);
    onUpdated?.();
  };

  const handleQtyChange = (index: number, qty: number) => {
    if (qty <= 0) return;
    const item = quote.items[index];
    const est = getProductQuoteEstimate(item.productId, qty);
    updateQuotationLine(quotationId, index, {
      quantity: qty,
      unitPrice: est?.estimatedUnitPrice ?? item.unitPrice,
    });
    setRefresh(n => n + 1);
    onUpdated?.();
  };

  return (
    <Card className="print:hidden">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <PackageSearch className="h-4 w-4" />
          Quotation Lines — Plant Catalog
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick standard products from catalog. Price auto-fills from BOM material estimate (or catalog rate).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="w-20">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>BOM</TableHead>
              <TableHead>Estimate</TableHead>
              {editable && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.items.map((item, index) => {
              const product = mockProducts.find(p => p.id === item.productId);
              const bom = getBomForProduct(item.productId);
              const est = getProductQuoteEstimate(item.productId, item.quantity);
              return (
                <TableRow key={`${item.productId}-${index}`}>
                  <TableCell>
                    <p className="font-medium text-sm">{product?.name}</p>
                    <p className="text-xs text-muted-foreground">{product?.model}</p>
                  </TableCell>
                  <TableCell>
                    {editable ? (
                      <Input
                        type="number"
                        min={1}
                        className="h-8 w-16"
                        value={item.quantity}
                        onChange={e => handleQtyChange(index, Number(e.target.value))}
                      />
                    ) : (
                      item.quantity
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatQuotedAmount(item.unitPrice)}
                    {est?.priceSource === 'bom-estimate' && (
                      <p className="text-[10px] text-teal-600">BOM estimate</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatQuotedAmount(item.quantity * item.unitPrice)}
                  </TableCell>
                  <TableCell>
                    {bom ? (
                      <Link
                        to={`/production/bom/${item.productId}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Layers className="h-3 w-3" />
                        {bom.id}
                      </Link>
                    ) : (
                      <Link
                        to={`/production/bom/${item.productId}`}
                        className="text-xs text-amber-600 hover:underline"
                      >
                        Create BOM →
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {est?.materialEstimate ? (
                      <span>
                        Mat. {formatQuotedAmount(est.materialEstimate.totalMaterialCost)}
                        {est.materialEstimate.bomId && ` · ${est.materialEstimate.bomId}`}
                      </span>
                    ) : (
                      'Catalog price'
                    )}
                  </TableCell>
                  {editable && (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {editable && !quote.orderId && quote.status !== 'PO Awarded' && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-medium">Add from Plant Catalog</p>
            <div className="grid gap-3 md:grid-cols-[1fr_100px_auto]">
              <SearchableSelect
                options={catalogOptions}
                value={selectedProductId}
                onChange={setSelectedProductId}
                placeholder="Type product name e.g. Transformer Oil…"
              />
              <Input
                type="number"
                min={1}
                value={addQty}
                onChange={e => setAddQty(e.target.value)}
                placeholder="Qty"
              />
              <Button type="button" onClick={handleAdd} disabled={!selectedProductId}>
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>

            {preview && (
              <div className="rounded-md border bg-background p-3 text-sm space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  <Calculator className="h-4 w-4 text-primary" />
                  Estimated for {preview.productName} ({preview.productModel})
                </div>
                <p>
                  Unit: <strong>{formatQuotedAmount(preview.estimatedUnitPrice)}</strong>
                  {' '}
                  <span className="text-muted-foreground">
                    (catalog {formatQuotedAmount(preview.catalogUnitPrice)})
                  </span>
                </p>
                {preview.bom ? (
                  <p className="text-xs flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    Linked BOM: {preview.bom.id} ({preview.bom.status}) — {preview.bom.items.length} components
                  </p>
                ) : (
                  <p className="text-xs text-amber-700">No BOM yet — price uses catalog rate. Create BOM to refine estimate.</p>
                )}
                {preview.materialEstimate && (
                  <p className="text-xs text-muted-foreground">
                    Material cost: {formatQuotedAmount(preview.materialEstimate.totalMaterialCost)} ·
                    Suggested build: {formatQuotedAmount(preview.materialEstimate.suggestedTotalPrice)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end text-sm font-semibold">
          Quotation total: {formatQuotedAmount(quote.totalAmount)}
        </div>
      </CardContent>
    </Card>
  );
}
