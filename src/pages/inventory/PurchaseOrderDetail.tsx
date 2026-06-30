import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Download, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  
  // Hardcoded mock for PO detail since we just need the visual representation
  const poId = id || 'PO-26-050';
  const vendor = {
    name: 'Laxmi Steels & Alloys',
    address: 'Plot 45, GIDC Makarpura,\nVadodara, Gujarat - 390010',
    gstin: '24AABCL1234F1Z9',
    contact: 'Rajesh Patel (+91 98980XXXXX)'
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 print:hidden">
        <Link to="/purchase-orders">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Purchase Order: {poId}</h2>
            <Badge variant="secondary">Pending GRN</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print PO
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" /> Email to Vendor
          </Button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white text-black p-8 shadow-sm border rounded-lg max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 font-sans">
        
        {/* Header */}
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
                  <th className="pr-4 py-1 font-semibold text-gray-700">PO No:</th>
                  <td className="text-gray-900 font-medium">{poId}</td>
                </tr>
                <tr>
                  <th className="pr-4 py-1 font-semibold text-gray-700">Date:</th>
                  <td className="text-gray-900">25-Jun-2026</td>
                </tr>
                <tr>
                  <th className="pr-4 py-1 font-semibold text-gray-700">Delivery Date:</th>
                  <td className="text-gray-900">05-Jul-2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor Details */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2">Vendor Details:</h3>
          <p className="font-bold text-gray-900">{vendor.name}</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">{vendor.address}</p>
          <p className="text-sm text-gray-600 mt-2"><strong>Contact:</strong> {vendor.contact}</p>
          <p className="text-sm text-gray-600"><strong>GSTIN:</strong> {vendor.gstin}</p>
        </div>

        {/* Line Items */}
        <div className="mb-8 border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Sr.</th>
                <th className="py-3 px-4 text-left font-semibold">Item Description</th>
                <th className="py-3 px-4 text-center font-semibold">Qty</th>
                <th className="py-3 px-4 text-right font-semibold">Rate (₹)</th>
                <th className="py-3 px-4 text-right font-semibold">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4 text-gray-600">1</td>
                <td className="py-3 px-4 font-semibold text-gray-900">MS Plate 10mm IS2062</td>
                <td className="py-3 px-4 text-center text-gray-900">5000 Kg</td>
                <td className="py-3 px-4 text-right text-gray-900">65.00</td>
                <td className="py-3 px-4 text-right text-gray-900 font-medium">3,25,000</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600">2</td>
                <td className="py-3 px-4 font-semibold text-gray-900">SS Sheet 304 2mm</td>
                <td className="py-3 px-4 text-center text-gray-900">1200 Kg</td>
                <td className="py-3 px-4 text-right text-gray-900">185.00</td>
                <td className="py-3 px-4 text-right text-gray-900 font-medium">2,22,000</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={4} className="py-3 px-4 text-right font-bold text-gray-900">Subtotal:</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">₹5,47,000</td>
              </tr>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={4} className="py-3 px-4 text-right font-bold text-gray-900">GST (18%):</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">₹98,460</td>
              </tr>
              <tr className="border-t border-gray-200 bg-gray-100">
                <td colSpan={4} className="py-3 px-4 text-right font-bold text-gray-900 text-lg">Grand Total:</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900 text-lg">₹6,45,460</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Terms */}
        <div className="mb-12 text-sm text-gray-600">
          <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
          <ul className="list-decimal pl-5 space-y-1">
            <li>Material must be supplied with original Test Certificate (MTC).</li>
            <li>Delivery required at Makarpura factory within 10 days.</li>
            <li>Payment: 45 days PDC from date of receipt of material (GRN).</li>
            <li>Rejection: Any defective material will be debit noted and returned at vendor's cost.</li>
          </ul>
        </div>

        {/* Signatures */}
        <div className="flex justify-end pt-12 border-t border-gray-200">
          <div className="text-center w-64">
            <p className="text-gray-500 text-sm mb-16">For Sumesh Petroleum Pvt. Ltd.</p>
            <div className="border-t border-gray-400"></div>
            <p className="text-gray-800 font-semibold mt-2 text-sm">Authorized Signatory</p>
            <p className="text-gray-500 text-xs">Purchase Department</p>
          </div>
        </div>

      </div>
    </div>
  );
}
