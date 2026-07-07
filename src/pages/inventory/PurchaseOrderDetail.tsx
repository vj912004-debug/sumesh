import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Download, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getPoTotal, getPurchaseOrderById } from '@/lib/purchaseOrderService';

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const [toast, setToast] = useState<string | null>(null);

  const po = useMemo(() => (id ? getPurchaseOrderById(id) : undefined), [id]);

  if (!po) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-muted-foreground">Purchase order not found.</p>
        <Link to="/purchase/orders">
          <Button variant="outline">Back to PO list</Button>
        </Link>
      </div>
    );
  }

  const subtotal = getPoTotal(po);
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg print:hidden">
          {toast}
        </div>
      )}
      <div className="flex items-center gap-4 print:hidden">
        <Link to="/purchase/orders">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Purchase Order: {po.id}</h2>
            <Badge variant={po.status === 'Received' ? 'default' : 'secondary'}>{po.status}</Badge>
            <Badge variant="outline">{po.poPurpose}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print PO
          </Button>
          <Button variant="outline" onClick={() => { handlePrint(); setToast('PO PDF downloaded.'); }}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button onClick={() => setToast(`PO ${po.id} emailed to ${po.vendorContact ?? po.vendorName}.`)}>
            <Send className="mr-2 h-4 w-4" /> Email to Vendor
          </Button>
        </div>
      </div>

      <div className="bg-white text-black p-8 shadow-sm border rounded-lg max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 font-sans">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">SUMESH PETROLEUM PVT. LTD.</h1>
            <p className="text-sm text-gray-600">Makarpura GIDC, Vadodara, Gujarat - 390010</p>
            <p className="text-sm text-gray-600">Email: purchase@sumeshpetroleum.com</p>
            <p className="text-sm text-gray-600 font-semibold mt-1">GSTIN: 24AAACSXXXXA1Z5</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold tracking-widest uppercase mb-2">Purchase Order</h2>
            <table className="text-sm text-left ml-auto">
              <tbody>
                <tr>
                  <th className="pr-4 py-1 font-semibold text-zinc-700">PO For:</th>
                  <td className="text-gray-900 font-medium">{po.poPurpose}</td>
                </tr>
                <tr>
                  <th className="pr-4 py-1 font-semibold text-zinc-700">PO No:</th>
                  <td className="text-gray-900 font-medium">{po.id}</td>
                </tr>
                <tr>
                  <th className="pr-4 py-1 font-semibold text-zinc-700">Date:</th>
                  <td className="text-gray-900">{po.poDate}</td>
                </tr>
                <tr>
                  <th className="pr-4 py-1 font-semibold text-zinc-700">Delivery Date:</th>
                  <td className="text-gray-900">{po.deliveryDate}</td>
                </tr>
                {po.workOrderRef && (
                  <tr>
                    <th className="pr-4 py-1 font-semibold text-zinc-700">WO Ref:</th>
                    <td className="text-gray-900">{po.workOrderRef}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold text-zinc-700 border-b border-gray-200 pb-1 mb-2">Vendor Details:</h3>
          <p className="font-bold text-gray-900">{po.vendorName}</p>
          {po.vendorAddress && (
            <p className="text-sm text-gray-600 whitespace-pre-line">{po.vendorAddress}</p>
          )}
          {po.vendorContact && (
            <p className="text-sm text-gray-600 mt-2"><strong>Contact:</strong> {po.vendorContact}</p>
          )}
          {po.vendorGstin && (
            <p className="text-sm text-gray-600"><strong>GSTIN:</strong> {po.vendorGstin}</p>
          )}
        </div>

        <div className="mb-8 border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-zinc-700">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Sr.</th>
                <th className="py-3 px-4 text-left font-semibold">Item Description</th>
                <th className="py-3 px-4 text-center font-semibold">Qty</th>
                <th className="py-3 px-4 text-right font-semibold">Rate (₹)</th>
                <th className="py-3 px-4 text-right font-semibold">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {po.lines.map((line, index) => (
                <tr key={line.id}>
                  <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{line.description}</td>
                  <td className="py-3 px-4 text-center text-gray-900">{line.qty} {line.uom}</td>
                  <td className="py-3 px-4 text-right text-gray-900">{line.rate.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-gray-900 font-medium">
                    {(line.qty * line.rate).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={4} className="py-3 px-4 text-right font-bold text-gray-900">Subtotal:</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={4} className="py-3 px-4 text-right font-bold text-gray-900">GST (18%):</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">₹{gst.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-t border-gray-200 bg-zinc-100">
                <td colSpan={4} className="py-3 px-4 text-right font-bold text-gray-900 text-lg">Grand Total:</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900 text-lg">₹{grandTotal.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {po.remarks && (
          <p className="text-sm text-gray-600 mb-8"><strong>Remarks:</strong> {po.remarks}</p>
        )}

        <div className="mb-12 text-sm text-gray-600">
          <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
          <ul className="list-decimal pl-5 space-y-1">
            <li>Material must be supplied with original Test Certificate (MTC).</li>
            <li>Delivery required at Makarpura factory by the date above.</li>
            <li>Payment: 45 days PDC from date of receipt of material (GRN).</li>
            <li>Rejection: Any defective material will be debit noted and returned at vendor&apos;s cost.</li>
          </ul>
        </div>

        <div className="flex justify-end pt-12 border-t border-gray-200">
          <div className="text-center w-64">
            <p className="text-zinc-500 text-sm mb-16">For Sumesh Petroleum Pvt. Ltd.</p>
            <div className="border-t border-zinc-400" />
            <p className="text-gray-800 font-semibold mt-2 text-sm">Authorized Signatory</p>
            <p className="text-zinc-500 text-xs">Purchase Department</p>
          </div>
        </div>
      </div>
    </div>
  );
}
