import { useParams, Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { mockCustomers, mockProducts } from '@/lib/mockData';
import { getQuotationById } from '@/lib/quotationService';
import { ArrowLeft, Printer, Send, Edit, FileCheck } from 'lucide-react';

export default function QuotationDetail() {
  const { id } = useParams();
  const quote = id ? getQuotationById(id) : undefined;
  const customer = mockCustomers.find(c => c.id === quote?.customerId);

  if (!quote || !customer) {
    return <div>Quotation not found</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Bar - Hidden during print */}
      <div className="flex items-center gap-4 print:hidden">
        <Link to="/quotations">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Quotation: {quote.id}</h2>
            <Badge variant={quote.status === 'Accepted' ? 'default' : 'secondary'}>
              {quote.status}
            </Badge>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
              Rev: v3
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Previous revisions: <span className="underline cursor-pointer">v1 (01-Jun)</span>, <span className="underline cursor-pointer">v2 (15-Jun)</span>
          </p>
        </div>
        <div className="flex gap-2 items-start">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Revise
          </Button>
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" /> Send to Client
          </Button>
          <Button>
            <FileCheck className="mr-2 h-4 w-4" /> Convert to Order
          </Button>
        </div>
      </div>

      {/* Printable Document Area */}
      <div className="bg-white text-black p-8 shadow-sm border rounded-lg max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
        {/* Header */}
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

        {/* Addresses */}
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div className="w-full md:w-1/2 pr-0 md:pr-4">
            <h3 className="font-semibold text-zinc-700 border-b border-gray-200 pb-1 mb-2">Quoted To:</h3>
            <p className="font-bold text-gray-900">{customer.name}</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{customer.address}</p>
            <p className="text-sm text-gray-600">{customer.city}, {customer.state}</p>
            <p className="text-sm text-gray-600 mt-2"><strong>Attn:</strong> {customer.contactPerson}</p>
            <p className="text-sm text-gray-600"><strong>GSTIN:</strong> {customer.gstin}</p>
          </div>
        </div>

        {/* Line Items */}
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
                      <div className="mt-2 text-xs text-gray-600 border-l-2 pl-2 border-gray-300">
                        <p>Includes:</p>
                        <ul className="list-disc pl-4">
                          <li>Vacuum Pump System (300m3/hr)</li>
                          <li>Filtration Vessel (SS 304)</li>
                          <li>Control Panel with PLC</li>
                        </ul>
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">Technical specifications attached as per annexure.</p>
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

        {/* Totals & Terms */}
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

        {/* Signatures */}
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
