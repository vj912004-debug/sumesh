import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Send } from 'lucide-react';
import { mockOrders, mockCustomers, mockQuotations, mockProducts } from '@/lib/mockData';

export default function DeliveryChallan() {
  const { id } = useParams();
  const order = mockOrders.find(o => o.id === id);
  const quotation = mockQuotations.find(q => q.id === order?.quotationId);
  const customer = mockCustomers.find(c => c.id === order?.customerId);

  if (!order || !customer) {
    return <div>Order not found</div>;
  }

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center gap-4 print:hidden">
        <Link to="/dispatch">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Delivery Challan</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" /> Generate E-Way Bill
          </Button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white text-black p-8 shadow-sm border rounded-lg max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 font-sans">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-1">SUMESH PETROLEUM PVT. LTD.</h1>
          <p className="text-sm text-gray-600">Makarpura GIDC, Vadodara, Gujarat - 390010</p>
          <p className="text-sm font-semibold mt-1">GSTIN: 24AAACSXXXXA1Z5</p>
          <div className="inline-block border-2 border-gray-800 px-6 py-1 mt-4">
            <h2 className="text-xl font-bold tracking-widest uppercase">Delivery Challan</h2>
          </div>
        </div>

        {/* Details Grid */}
        <div className="flex border border-zinc-400 mb-6 text-sm">
          <div className="w-1/2 border-r border-zinc-400 p-4">
            <h3 className="font-semibold text-zinc-700 mb-2 border-b border-gray-200 pb-1">Consignee (Ship To):</h3>
            <p className="font-bold text-gray-900">{customer.name}</p>
            <p className="text-zinc-700 whitespace-pre-line">{customer.address}</p>
            <p className="text-zinc-700">{customer.city}, {customer.state}</p>
            <p className="mt-2"><strong>GSTIN:</strong> {customer.gstin}</p>
          </div>
          <div className="w-1/2 p-0 flex flex-col">
            <div className="flex border-b border-zinc-400">
              <div className="w-1/2 border-r border-zinc-400 p-2">
                <span className="text-xs text-zinc-500 block">Challan No.</span>
                <span className="font-semibold">DC-26-880</span>
              </div>
              <div className="w-1/2 p-2">
                <span className="text-xs text-zinc-500 block">Date</span>
                <span className="font-semibold">30-Jun-2026</span>
              </div>
            </div>
            <div className="flex border-b border-zinc-400">
              <div className="w-1/2 border-r border-zinc-400 p-2">
                <span className="text-xs text-zinc-500 block">Buyer's Order No.</span>
                <span className="font-semibold">{order.id}</span>
              </div>
              <div className="w-1/2 p-2">
                <span className="text-xs text-zinc-500 block">Mode/Terms of Payment</span>
                <span className="font-semibold">Against Proforma</span>
              </div>
            </div>
            <div className="flex flex-1">
              <div className="w-1/2 border-r border-zinc-400 p-2">
                <span className="text-xs text-zinc-500 block">Dispatch Document No.</span>
                <span className="font-semibold">LR-9021</span>
              </div>
              <div className="w-1/2 p-2">
                <span className="text-xs text-zinc-500 block">Dispatched through</span>
                <span className="font-semibold">By Road (ODC)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full border-collapse border border-zinc-400 text-sm mb-6">
          <thead className="bg-zinc-100">
            <tr>
              <th className="border border-zinc-400 p-2 text-left w-12">Sr.</th>
              <th className="border border-zinc-400 p-2 text-left">Description of Goods</th>
              <th className="border border-zinc-400 p-2 text-center w-24">Quantity</th>
            </tr>
          </thead>
          <tbody className="h-48 align-top">
            {quotation?.items.map((item, index) => {
              const product = mockProducts.find(p => p.id === item.productId);
              return (
                <tr key={index}>
                  <td className="border-x border-zinc-400 p-3 text-center">{index + 1}</td>
                  <td className="border-x border-zinc-400 p-3">
                    <p className="font-semibold">{product?.name}</p>
                    <p className="text-gray-600 mt-1">Machine S.No: SP/26/1012</p>
                    <p className="text-gray-600">Standard Accessories Box attached.</p>
                  </td>
                  <td className="border-x border-zinc-400 p-3 text-center font-semibold">{item.quantity} Nos</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border border-zinc-400 bg-gray-50">
              <td colSpan={2} className="p-2 text-right font-bold">Total Quantity:</td>
              <td className="p-2 text-center font-bold">{quotation?.items.reduce((acc, curr) => acc + curr.quantity, 0)} Nos</td>
            </tr>
          </tfoot>
        </table>

        <div className="text-sm text-zinc-700 mb-16">
          <p><strong>Declaration:</strong> We declare that this delivery challan shows the actual quantity of the goods described and that all particulars are true and correct.</p>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end">
          <div className="text-center w-64 border border-zinc-400 h-24 relative flex items-end justify-center p-2">
            <span className="absolute top-2 left-2 text-xs text-zinc-500">Receiver's Signature / Stamp</span>
          </div>
          <div className="text-center w-64 border border-zinc-400 h-24 relative flex items-end justify-center p-2">
            <span className="absolute top-2 left-2 text-xs text-zinc-500">For Sumesh Petroleum Pvt. Ltd.</span>
            <span className="font-semibold text-sm">Authorized Signatory</span>
          </div>
        </div>

      </div>
    </div>
  );
}
