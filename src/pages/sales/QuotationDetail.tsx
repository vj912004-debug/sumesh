import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

import { mockCustomers, mockProducts } from '@/lib/mockData';
import {
  getQuotationById,
  fetchQuotationSendData,
  sendQuotationToClient,
  formatQuotedAmount,
} from '@/lib/quotationService';
import { awardPoAndCreateWorkOrders, getAwardForQuotation } from '@/lib/quoteAwardService';
import { getCustomerContacts } from '@/lib/customerContacts';
import { ArrowLeft, Printer, Send, Edit, FileCheck, Factory, Layers, Calculator } from 'lucide-react';
import QuotationLineEditor from '@/components/sales/QuotationLineEditor';
import QuotationEstimatedBomPanel from '@/components/sales/QuotationEstimatedBomPanel';

export default function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [awardOpen, setAwardOpen] = useState(false);
  const [clientPoNumber, setClientPoNumber] = useState('');
  const [clientPoDate, setClientPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDelivery, setTargetDelivery] = useState('');
  const [awarding, setAwarding] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const quote = useMemo(
    () => (id ? getQuotationById(id) : undefined),
    [id, refresh]
  );
  const sendPackage = useMemo(
    () => (id && sendOpen ? fetchQuotationSendData(id) : undefined),
    [id, sendOpen, refresh]
  );
  const award = quote ? getAwardForQuotation(quote.id) : undefined;
  const customer = mockCustomers.find(c => c.id === quote?.customerId);

  // refresh triggers re-read of quotation from storage
  void refresh;

  if (!quote || !customer) {
    return <div>Quotation not found</div>;
  }

  const isAwarded = quote.status === 'PO Awarded' || !!quote.orderId || !!award;
  const workOrderIds = quote.workOrderIds ?? award?.workOrderIds ?? [];

  const handlePrint = () => window.print();

  const handleSendToClient = async () => {
    if (!quote) return;
    setSending(true);
    try {
      const result = await sendQuotationToClient({
        quotationId: quote.id,
        to: customer.email,
        contactPerson: customer.contactPerson,
      });
      setSendOpen(false);
      setRefresh(n => n + 1);
      const bomCount = result.package.lines.filter(l => l.bom).length;
      const estimateRef = result.package.costEstimate?.id ?? 'none';
      notify(
        `Quotation ${quote.id} sent to ${customer.email} ` +
        `(BOM: ${bomCount} product(s), estimate: ${estimateRef})`
      );
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleAwardPo = async (e: React.FormEvent) => {
    e.preventDefault();
    setAwarding(true);
    try {
      const result = awardPoAndCreateWorkOrders({
        quotationId: quote.id,
        clientPoNumber,
        clientPoDate,
        targetDeliveryDate: targetDelivery || undefined,
      });
      setAwardOpen(false);
      setRefresh(n => n + 1);
      notify(
        `Client PO ${result.clientPoNumber} awarded → ${result.orderId} · ` +
        `${result.workOrderIds.length} work order(s) released`
      );
      if (result.workOrderIds.length === 1) {
        navigate(`/work-orders/${result.workOrderIds[0]}`);
      } else {
        navigate(`/orders/${result.orderId}`);
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Award failed');
    } finally {
      setAwarding(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg print:hidden">
          {toast}
        </div>
      )}
      <div className="flex items-center gap-4 print:hidden">
        <Link to="/quotations">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl font-bold tracking-tight">Quotation: {quote.id}</h2>
            <Badge variant={isAwarded ? 'default' : quote.status === 'Accepted' ? 'default' : 'secondary'}>
              {isAwarded ? 'PO Awarded' : quote.status}
            </Badge>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
              Rev: v3
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Previous revisions: <span className="underline cursor-pointer">v1 (01-Jun)</span>, <span className="underline cursor-pointer">v2 (15-Jun)</span>
          </p>
          {isAwarded && (
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {quote.clientPoNumber && (
                <Badge variant="outline">Client PO: {quote.clientPoNumber}</Badge>
              )}
              {(quote.orderId ?? award?.orderId) && (
                <Link to={`/orders/${quote.orderId ?? award?.orderId}`}>
                  <Badge variant="outline" className="hover:bg-muted cursor-pointer">
                    Sales Order: {quote.orderId ?? award?.orderId}
                  </Badge>
                </Link>
              )}
              {workOrderIds.map(woId => (
                <Link key={woId} to={`/work-orders/${woId}`}>
                  <Badge variant="outline" className="hover:bg-muted cursor-pointer">
                    <Factory className="h-3 w-3 mr-1 inline" />{woId}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 items-start flex-wrap">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" onClick={() => notify('Revision v4 saved as draft.')}>
            <Edit className="mr-2 h-4 w-4" /> Revise
          </Button>
          <Button variant="outline" onClick={() => setSendOpen(true)}>
            <Send className="mr-2 h-4 w-4" /> Send to Client
          </Button>
          {!isAwarded ? (
            <Button onClick={() => setAwardOpen(true)}>
              <FileCheck className="mr-2 h-4 w-4" /> Award PO & Release Work Order
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate(`/orders/${quote.orderId ?? award?.orderId}`)}>
              <Factory className="mr-2 h-4 w-4" /> View Production
            </Button>
          )}
        </div>
      </div>

      <Dialog open={awardOpen} onOpenChange={setAwardOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAwardPo}>
            <DialogHeader>
              <DialogTitle>Award Client PO → Work Order</DialogTitle>
              <DialogDescription>
                Record the client&apos;s purchase order against quotation {quote.id}. This creates a Sales Order and releases{' '}
                {quote.items.reduce((s, i) => s + i.quantity, 0)} work order(s) to production.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Client PO Number *</label>
                <Input
                  value={clientPoNumber}
                  onChange={e => setClientPoNumber(e.target.value)}
                  placeholder="e.g. RIL/PO/2026/1842"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Client PO Date *</label>
                <Input
                  type="date"
                  value={clientPoDate}
                  onChange={e => setClientPoDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Target Delivery Date</label>
                <Input
                  type="date"
                  value={targetDelivery}
                  onChange={e => setTargetDelivery(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAwardOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={awarding}>
                {awarding ? 'Creating…' : 'Award PO & Create Work Orders'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Quotation to Client</DialogTitle>
            <DialogDescription>
              Quotation {quote.id} will be emailed to {customer.email} with linked BOM and pre-build estimate data.
            </DialogDescription>
          </DialogHeader>

          {sendPackage && (
            <div className="space-y-4 py-2">
              {sendPackage.costEstimate && (
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Calculator className="h-4 w-4 text-primary" />
                    Pre-Build Estimate
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Estimate ID</span>
                      <p className="font-mono font-medium">{sendPackage.costEstimate.id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Title</span>
                      <p className="font-medium">{sendPackage.costEstimate.title}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Build spec</span>
                      <p>
                        {sendPackage.costEstimate.spec.capacityLph} LPH · qty {sendPackage.costEstimate.spec.buildQty} ·{' '}
                        {sendPackage.costEstimate.spec.filterMicron} micron
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Suggested price</span>
                      <p className="font-medium">{formatQuotedAmount(sendPackage.costEstimate.suggestedPrice)}</p>
                    </div>
                  </div>
                  <Link
                    to={`/production/cost-estimate/${sendPackage.costEstimate.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    View full estimate →
                  </Link>
                </div>
              )}

              {sendPackage.lines.map(line => (
                <div key={line.productId} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{line.productName}</p>
                      <p className="text-xs text-muted-foreground">Model: {line.productModel}</p>
                    </div>
                    <Badge variant="outline">
                      {line.quantity} × {formatQuotedAmount(line.unitPrice)}
                    </Badge>
                  </div>

                  {line.bom ? (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Layers className="h-4 w-4 text-cyan-600" />
                        <span className="font-medium">BOM {line.bom.id}</span>
                        <Badge variant="secondary" className="text-xs">{line.bom.status}</Badge>
                        <span className="text-muted-foreground text-xs">
                          {line.bom.items.length} components
                        </span>
                      </div>
                      {line.materialEstimate && line.materialEstimate.lines.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Part</TableHead>
                              <TableHead>Material</TableHead>
                              <TableHead className="text-center">Qty</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {line.materialEstimate.lines.slice(0, 5).map(mat => (
                              <TableRow key={mat.inventoryItemId}>
                                <TableCell className="font-mono text-xs">{mat.partNumber}</TableCell>
                                <TableCell className="text-sm">{mat.name}</TableCell>
                                <TableCell className="text-center text-sm">
                                  {mat.adjustedQty} {mat.uom}
                                </TableCell>
                              </TableRow>
                            ))}
                            {line.materialEstimate.lines.length > 5 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-xs text-muted-foreground text-center">
                                  +{line.materialEstimate.lines.length - 5} more components in BOM attachment
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      )}
                      <Link
                        to={`/production/bom/${line.productId}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View / edit BOM →
                      </Link>
                    </>
                  ) : (
                    <p className="text-sm text-amber-600">
                      No BOM defined for this product — quotation will be sent without BOM attachment.
                    </p>
                  )}
                </div>
              ))}

              <div className="rounded-md bg-muted/50 p-3 text-sm">
                <p className="font-medium">Email attachments</p>
                <p className="text-muted-foreground mt-1">
                  {quote.id}.pdf
                  {sendPackage.lines.some(l => l.bom) &&
                    sendPackage.lines
                      .filter(l => l.bom)
                      .map(l => `, ${l.bom!.id}_${l.productModel.replace(/\s+/g, '-')}.pdf`)
                      .join('')}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSendOpen(false)}>Cancel</Button>
            <Button onClick={handleSendToClient} disabled={sending || !sendPackage}>
              {sending ? 'Sending…' : 'Send Quotation + BOM'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuotationLineEditor
        quotationId={quote.id}
        editable={!isAwarded}
        onUpdated={() => setRefresh(n => n + 1)}
      />

      <QuotationEstimatedBomPanel
        quotationId={quote.id}
        editable={!isAwarded}
        onUpdated={() => setRefresh(n => n + 1)}
      />

      {/* Printable Document Area */}
      <div className="bg-white text-black p-8 shadow-sm border rounded-lg max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">SUMESH PETROLEUM PVT. LTD.</h1>
            <p className="text-sm text-gray-600">Makarpura GIDC, Vadodara, Gujarat - 390010</p>
            <p className="text-sm text-gray-600">Email: sales@sumeshpetroleum.com | Phone: +91 265 263xxxx</p>
            <p className="text-sm text-gray-600 font-semibold mt-1">GSTIN: 24AAACSXXXXA1Z5</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-zinc-400 uppercase tracking-widest mb-2">Quotation</h2>
            <table className="text-sm text-left ml-auto">
              <tbody>
                <tr>
                  <th className="pr-4 py-1 font-semibold text-zinc-700">Quote No:</th>
                  <td className="text-gray-900 font-medium">{quote.id}</td>
                </tr>
                <tr>
                  <th className="pr-4 py-1 font-semibold text-zinc-700">Date:</th>
                  <td className="text-gray-900">{quote.date}</td>
                </tr>
                <tr>
                  <th className="pr-4 py-1 font-semibold text-zinc-700">Valid Till:</th>
                  <td className="text-gray-900">30 Days</td>
                </tr>
                <tr>
                  <th className="pr-4 py-1 font-semibold text-zinc-700">Enquiry Ref:</th>
                  <td className="text-gray-900">{quote.enquiryId}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div className="w-full md:w-1/2 pr-0 md:pr-4">
            <h3 className="font-semibold text-zinc-700 border-b border-gray-200 pb-1 mb-2">Quoted To:</h3>
            <p className="font-bold text-gray-900">{customer.name}</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{customer.address}</p>
            <p className="text-sm text-gray-600">{customer.city}, {customer.state}</p>
            <p className="text-sm text-gray-600 mt-2"><strong>Attn:</strong> {customer.contactPerson}</p>
            {getCustomerContacts(customer).length > 1 && (
              <div className="text-xs text-gray-600 mt-2 space-y-0.5">
                {getCustomerContacts(customer).slice(1).map((c, i) => (
                  <p key={i}>{c.designation}: {c.name} ({c.phone})</p>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-600"><strong>GSTIN:</strong> {customer.gstin}</p>
          </div>
        </div>

        <div className="mb-8 border border-gray-200 rounded-md overflow-x-auto w-full">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-zinc-700">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Sr.</th>
                <th className="py-3 px-4 text-left font-semibold">Description of Goods</th>
                <th className="py-3 px-4 text-center font-semibold">Qty</th>
                <th className="py-3 px-4 text-right font-semibold">Unit Price (₹)</th>
                <th className="py-3 px-4 text-right font-semibold">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quote.items.map((item, index) => {
                const product = mockProducts.find(p => p.id === item.productId);
                return (
                  <tr key={index}>
                    <td className="py-3 px-4 text-gray-600 align-top">{index + 1}</td>
                    <td className="py-3 px-4 align-top">
                      <p className="font-semibold text-gray-900">{product?.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">Model: {product?.model}</p>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-900 align-top">{item.quantity} Nos</td>
                    <td className="py-3 px-4 text-right text-gray-900 align-top">{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-gray-900 font-medium align-top">
                      {(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="w-full md:w-1/2 text-sm text-gray-600">
            <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Taxes: GST @ 18% Extra as applicable.</li>
              <li>Delivery: 4-6 weeks from receipt of PO and advance.</li>
              <li>Payment: 30% Advance, balance against proforma invoice before dispatch.</li>
              <li>Freight & Insurance: Extra at actuals.</li>
              <li>Warranty: 12 months from commissioning or 18 months from supply.</li>
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2 text-zinc-700 font-medium">Basic Amount:</td>
                  <td className="py-2 text-right text-gray-900">₹{quote.totalAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 text-zinc-700 font-medium">Estimated GST (18%):</td>
                  <td className="py-2 text-right text-gray-900">₹{(quote.totalAmount * 0.18).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="py-3 text-base font-bold text-gray-900">Total Estimate:</td>
                  <td className="py-3 text-right text-base font-bold text-gray-900">
                    ₹{(quote.totalAmount * 1.18).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-end pt-12 border-t border-gray-200 mt-12">
          <div className="text-center">
            <p className="text-zinc-500 text-sm mb-16">Accepted By</p>
            <div className="w-48 border-t border-zinc-400"></div>
            <p className="text-gray-800 font-semibold mt-2 text-sm">Authorized Signatory</p>
            <p className="text-zinc-500 text-xs">{customer.name}</p>
          </div>
          <div className="text-center">
            <p className="text-zinc-500 text-sm mb-16">For Sumesh Petroleum Pvt. Ltd.</p>
            <div className="w-48 border-t border-zinc-400"></div>
            <p className="text-gray-800 font-semibold mt-2 text-sm">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
