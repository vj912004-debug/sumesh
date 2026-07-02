import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, ArrowLeft, Send, FileText } from 'lucide-react';
import { mockOrders, mockCustomers, mockQuotations, mockProducts } from '@/lib/mockData';
import { getProformaByOrder, createProformaInvoice } from '@/lib/billingData';
import { sendEmail } from '@/lib/communicationService';

export default function ProformaInvoiceDetail() {
  const { id } = useParams();
  const order = mockOrders.find(o => o.id === id);
  const quotation = mockQuotations.find(q => q.id === order?.quotationId);
  const customer = mockCustomers.find(c => c.id === order?.customerId);

  let pi = order ? getProformaByOrder(order.id) : undefined;
  if (order && !pi) {
    pi = createProformaInvoice(order.id);
  }

  if (!order || !customer || !pi) {
    return <div>Proforma Invoice not found</div>;
  }

  const handlePrint = () => window.print();

  const handleSend = async () => {
    await sendEmail({
      to: customer.email,
      type: 'Proforma Invoice (PI)',
      subject: `Proforma Invoice ${pi!.id} - Sumesh Petroleum`,
      body: `Dear ${customer.contactPerson},\n\nPlease find Proforma Invoice ${pi!.id} for Order ${order.id}.\nGrand Total: ₹${pi!.grandTotal.toLocaleString('en-IN')} (incl. GST)\n\nKindly remit advance as per terms before dispatch.\n\nSumesh Petroleum Pvt. Ltd.`,
      attachment: `${pi!.id}.pdf`,
      sourceRef: pi!.id,
    });
    alert(`PI ${pi!.id} sent to ${customer.email}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 print:hidden">
        <Link to="/accounting">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Proforma Invoice (PI)</h2>
            <Badge variant="secondary">{pi.status}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">{pi.id} · Order {order.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
          <Button onClick={handleSend}><Send className="mr-2 h-4 w-4" /> Email PI to Customer</Button>
        </div>
      </div>

      <div className="bg-white text-black p-8 shadow-sm border rounded-lg max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 font-sans">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">SUMESH PETROLEUM PVT. LTD.</h1>
            <p className="text-sm text-gray-600">Makarpura GIDC, Vadodara, Gujarat - 390010</p>
            <p className="text-sm font-semibold mt-1">GSTIN: 24AAACSXXXXA1Z5</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold tracking-widest uppercase text-teal-700">PROFORMA INVOICE</h2>
            <p className="text-xs font-bold text-teal-600 mt-1">(PI)</p>
          </div>
        </div>

        <div className="flex border border-zinc-400 mb-6 text-sm">
          <div className="w-1/2 border-r border-zinc-400 p-4">
            <h3 className="font-semibold text-zinc-700 mb-2">Proforma To:</h3>
            <p className="font-bold">{customer.name}</p>
            <p className="text-zinc-700 whitespace-pre-line">{customer.address}</p>
            <p className="mt-2"><strong>GSTIN:</strong> {customer.gstin}</p>
          </div>
          <div className="w-1/2 p-0 flex flex-col">
            <div className="flex border-b border-zinc-400">
              <div className="w-1/2 border-r border-zinc-400 p-2">
                <span className="text-xs text-zinc-500 block">PI No.</span>
                <span className="font-semibold">{pi.id}</span>
              </div>
              <div className="w-1/2 p-2">
                <span className="text-xs text-zinc-500 block">Date</span>
                <span className="font-semibold">{pi.date}</span>
              </div>
            </div>
            <div className="flex border-b border-zinc-400">
              <div className="w-1/2 border-r border-zinc-400 p-2">
                <span className="text-xs text-zinc-500 block">Sales Order</span>
                <span className="font-semibold">{order.id}</span>
              </div>
              <div className="w-1/2 p-2">
                <span className="text-xs text-zinc-500 block">Quotation Ref</span>
                <span className="font-semibold">{quotation?.id || '—'}</span>
              </div>
            </div>
            <div className="p-2">
              <span className="text-xs text-zinc-500 block">Payment Terms</span>
              <span className="font-semibold text-xs">30% Advance against PI before production dispatch</span>
            </div>
          </div>
        </div>

        <table className="w-full border-collapse border border-zinc-400 text-sm mb-6">
          <thead className="bg-zinc-100">
            <tr>
              <th className="border border-zinc-400 p-2 text-left w-10">Sr</th>
              <th className="border border-zinc-400 p-2 text-left">Description</th>
              <th className="border border-zinc-400 p-2 text-center w-16">Qty</th>
              <th className="border border-zinc-400 p-2 text-right w-24">Rate</th>
              <th className="border border-zinc-400 p-2 text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quotation?.items.map((item, index) => {
              const product = mockProducts.find(p => p.id === item.productId);
              return (
                <tr key={index}>
                  <td className="border border-zinc-400 p-2 text-center">{index + 1}</td>
                  <td className="border border-zinc-400 p-2 font-semibold">{product?.name}</td>
                  <td className="border border-zinc-400 p-2 text-center">{item.quantity}</td>
                  <td className="border border-zinc-400 p-2 text-right">{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="border border-zinc-400 p-2 text-right">{(item.quantity * item.unitPrice).toLocaleString('en-IN')}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr><td colSpan={4} className="p-2 text-right border border-zinc-400">GST @ 18%</td>
              <td className="p-2 text-right border border-zinc-400">₹{pi.gstAmount.toLocaleString('en-IN')}</td></tr>
            <tr className="bg-teal-50">
              <td colSpan={4} className="p-2 text-right font-bold border border-zinc-400">Grand Total (PI)</td>
              <td className="p-2 text-right font-bold border border-zinc-400 text-lg">₹{pi.grandTotal.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        <div className="text-xs text-zinc-600 border border-dashed border-teal-300 bg-teal-50/50 p-3 rounded">
          <FileText className="inline h-3.5 w-3.5 mr-1 text-teal-600" />
          This is a <strong>Proforma Invoice (PI)</strong> for advance payment and is not a Tax Invoice. Tax Invoice (TI) with IRN will be issued upon dispatch.
        </div>
      </div>
    </div>
  );
}
