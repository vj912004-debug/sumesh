import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  mockPackingLists, mockCustomers, mockOrders, mockQuotations, mockProducts
} from '@/lib/mockData';
import type { PackingList } from '@/lib/mockData';
import { Printer, ArrowLeft, Send, CheckCircle2, Truck, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PackingListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packingList, setPackingList] = useState<PackingList | undefined>(() => {
    return mockPackingLists.find(p => p.id === id);
  });

  if (!packingList) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-zinc-300" />
        <h3 className="text-xl font-bold">Packing List Not Found</h3>
        <p className="text-muted-foreground text-sm">The packing list you are trying to view does not exist.</p>
        <Link to="/dispatch/packing-lists">
          <Button>Back to Packing Lists</Button>
        </Link>
      </div>
    );
  }

  const order = mockOrders.find(o => o.id === packingList.orderId);
  const customer = mockCustomers.find(c => c.id === packingList.customerId);

  const handlePrint = () => window.print();

  const handleStatusChange = (newStatus: 'Finalized' | 'Shipped') => {
    setPackingList(prev => prev ? { ...prev, status: newStatus } : undefined);
    // Also update mock data array for consistency in current session
    const idx = mockPackingLists.findIndex(pl => pl.id === id);
    if (idx !== -1) {
      mockPackingLists[idx].status = newStatus;
    }
  };

  // Group items to show a consolidated list
  const consolidatedItems: Record<string, number> = {};
  packingList.packages.forEach(pkg => {
    pkg.items.forEach(item => {
      consolidatedItems[item.productId] = (consolidatedItems[item.productId] || 0) + item.quantity;
    });
  });

  const totalPackages = packingList.packages.length;
  const totalGrossWeight = packingList.packages.reduce((sum, pkg) => sum + pkg.grossWeight, 0);
  const totalNetWeight = packingList.packages.reduce((sum, pkg) => sum + pkg.netWeight, 0);

  return (
    <div className="space-y-6">
      {/* Top Action Bar - hidden in print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden bg-white dark:bg-zinc-950 p-4 border rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/dispatch/packing-lists">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">Packing List: {packingList.id}</h2>
              <Badge variant={
                packingList.status === 'Shipped' ? 'default' :
                packingList.status === 'Finalized' ? 'secondary' :
                'outline'
              } className={
                packingList.status === 'Shipped' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200' :
                packingList.status === 'Finalized' ? 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-200' :
                'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-200'
              }>
                {packingList.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">For Order {packingList.orderId} • Challan {packingList.challanNo}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {packingList.status === 'Draft' && (
            <Button 
              variant="outline" 
              className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={() => handleStatusChange('Finalized')}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Finalize
            </Button>
          )}
          {packingList.status === 'Finalized' && (
            <Button 
              variant="outline" 
              className="text-cyan-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950"
              onClick={() => handleStatusChange('Shipped')}
            >
              <Truck className="mr-2 h-4 w-4" /> Dispatch Shipment
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Document
          </Button>
        </div>
      </div>

      {/* Printable Packing Sheet */}
      <div className="bg-white text-black p-8 shadow-sm border rounded-xl max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 font-sans border-zinc-200">
        
        {/* Company Header */}
        <div className="text-center border-b-2 border-double border-zinc-400 pb-6 mb-6">
          <h1 className="text-3xl font-extrabold tracking-wide text-zinc-900">SUMESH PETROLEUM PVT. LTD.</h1>
          <p className="text-xs text-zinc-500 font-medium uppercase mt-1">Industrial Equipment Division • Oil Filtration Systems</p>
          <p className="text-sm text-zinc-600 mt-1">Plot No. 880, Makarpura GIDC, Vadodara, Gujarat - 390010, India</p>
          <p className="text-xs text-zinc-500 mt-1">Phone: +91-265-264XXXX | Email: logistics@sumeshpetroleum.com | GSTIN: 24AAACSXXXXA1Z5</p>
          <div className="inline-block border border-zinc-900 bg-zinc-100/50 px-8 py-1.5 mt-4">
            <h2 className="text-lg font-bold tracking-widest uppercase text-zinc-800">Packing List</h2>
          </div>
        </div>

        {/* Consignee and Document Meta Details */}
        <div className="flex border border-zinc-400 mb-6 text-xs">
          <div className="w-1/2 border-r border-zinc-400 p-4 space-y-1">
            <h3 className="font-bold text-zinc-500 uppercase tracking-wider mb-2 border-b pb-1">Consignee (Ship To):</h3>
            {customer ? (
              <>
                <p className="font-bold text-sm text-zinc-900">{customer.name}</p>
                <p className="text-zinc-700 whitespace-pre-line leading-relaxed">{customer.address}</p>
                <p className="text-zinc-700 font-semibold mt-1">{customer.city}, {customer.state}</p>
                <p className="mt-2 text-zinc-800"><strong>GSTIN:</strong> {customer.gstin}</p>
                <p className="text-zinc-800"><strong>Attn:</strong> {customer.contactPerson} ({customer.phone})</p>
              </>
            ) : (
              <p className="text-rose-500 font-semibold">Customer details not available.</p>
            )}
          </div>
          <div className="w-1/2 flex flex-col divide-y divide-zinc-400">
            <div className="flex divide-x divide-zinc-400">
              <div className="w-1/2 p-2.5">
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Packing List No.</span>
                <span className="font-bold text-sm text-zinc-800">{packingList.id}</span>
              </div>
              <div className="w-1/2 p-2.5">
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Date</span>
                <span className="font-bold text-sm text-zinc-800">{packingList.date}</span>
              </div>
            </div>
            <div className="flex divide-x divide-zinc-400">
              <div className="w-1/2 p-2.5">
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Delivery Challan No.</span>
                <span className="font-bold text-zinc-800">{packingList.challanNo}</span>
              </div>
              <div className="w-1/2 p-2.5">
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Sales Order Reference</span>
                <span className="font-bold text-zinc-800">{packingList.orderId}</span>
              </div>
            </div>
            <div className="flex divide-x divide-zinc-400">
              <div className="w-1/2 p-2.5">
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Carrier / Transporter</span>
                <span className="font-bold text-zinc-800">{packingList.carrierName}</span>
              </div>
              <div className="w-1/2 p-2.5">
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Vehicle Number</span>
                <span className="font-bold text-zinc-800">{packingList.vehicleNo}</span>
              </div>
            </div>
            <div className="p-2.5">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">LR / Consignment Note No.</span>
              <span className="font-bold text-zinc-800">{packingList.lrNumber}</span>
            </div>
          </div>
        </div>

        {/* Detailed Packages Breakdown Table */}
        <h4 className="font-bold text-xs text-zinc-600 uppercase tracking-wider mb-2">Package Wise Packing Breakdown:</h4>
        <table className="w-full border-collapse border border-zinc-400 text-xs mb-6">
          <thead className="bg-zinc-100 text-zinc-800">
            <tr>
              <th className="border border-zinc-400 p-2 text-center w-12">Sr.</th>
              <th className="border border-zinc-400 p-2 text-left w-24">Pkg Number</th>
              <th className="border border-zinc-400 p-2 text-left w-28">Pkg Type</th>
              <th className="border border-zinc-400 p-2 text-center w-32">Dimensions</th>
              <th className="border border-zinc-400 p-2 text-right w-24">Net Wt (kg)</th>
              <th className="border border-zinc-400 p-2 text-right w-24">Gross Wt (kg)</th>
              <th className="border border-zinc-400 p-2 text-left">Detailed Contents Breakdown</th>
            </tr>
          </thead>
          <tbody className="align-top divide-y divide-zinc-300">
            {packingList.packages.map((pkg, idx) => (
              <tr key={pkg.packageNo} className="hover:bg-zinc-50/50">
                <td className="border border-zinc-400 p-2 text-center font-medium">{idx + 1}</td>
                <td className="border border-zinc-400 p-2 font-bold text-zinc-900">{pkg.packageNo}</td>
                <td className="border border-zinc-400 p-2 font-medium">{pkg.type}</td>
                <td className="border border-zinc-400 p-2 text-center font-mono">{pkg.dimensions}</td>
                <td className="border border-zinc-400 p-2 text-right">{pkg.netWeight}</td>
                <td className="border border-zinc-400 p-2 text-right font-semibold">{pkg.grossWeight}</td>
                <td className="border border-zinc-400 p-2 space-y-1">
                  {pkg.items.map((pi, pIdx) => {
                    const prod = mockProducts.find(p => p.id === pi.productId);
                    return (
                      <div key={pIdx} className="flex justify-between">
                        <span className="font-semibold text-zinc-800">{prod?.name}</span>
                        <span className="font-bold text-zinc-900">{pi.quantity} Nos</span>
                      </div>
                    );
                  })}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-zinc-100 font-bold">
              <td colSpan={4} className="border border-zinc-400 p-2 text-right uppercase">Consolidated Totals:</td>
              <td className="border border-zinc-400 p-2 text-right">{totalNetWeight} kg</td>
              <td className="border border-zinc-400 p-2 text-right text-zinc-900">{totalGrossWeight} kg</td>
              <td className="border border-zinc-400 p-2 text-left bg-zinc-100 font-bold">{totalPackages} Packages Configured</td>
            </tr>
          </tbody>
        </table>

        {/* Consolidated Item summary for receipt verification */}
        <h4 className="font-bold text-xs text-zinc-600 uppercase tracking-wider mb-2">Consolidated Items Summary (Total quantities loaded):</h4>
        <table className="w-full border-collapse border border-zinc-400 text-xs mb-8">
          <thead className="bg-zinc-50 text-zinc-700">
            <tr>
              <th className="border border-zinc-400 p-2 text-left w-12">Sr.</th>
              <th className="border border-zinc-400 p-2 text-left">Item Name & Specification</th>
              <th className="border border-zinc-400 p-2 text-center w-28">Model No</th>
              <th className="border border-zinc-400 p-2 text-center w-24">Total Qty Packed</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(consolidatedItems).map(([productId, quantity], index) => {
              const product = mockProducts.find(p => p.id === productId);
              return (
                <tr key={productId} className="hover:bg-zinc-50/50">
                  <td className="border border-zinc-400 p-2 text-center">{index + 1}</td>
                  <td className="border border-zinc-400 p-2 font-semibold">{product?.name}</td>
                  <td className="border border-zinc-400 p-2 text-center font-mono">{product?.model}</td>
                  <td className="border border-zinc-400 p-2 text-center font-bold text-zinc-900">{quantity} Nos</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="text-[10px] text-zinc-500 mb-16 border-t pt-4 leading-relaxed">
          <p><strong>Logistics Declaration:</strong> This packing list has been cross-checked physically against the delivery invoice and dispatch ledger before gate exit. The buyer is advised to verify package numbers, weights, and box-wise item counts upon receiving the material before signing the acknowledgement challan.</p>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end text-xs">
          <div className="text-center w-64 border border-zinc-400 h-24 relative flex items-end justify-center p-2 bg-zinc-50/30">
            <span className="absolute top-2 left-2 text-[10px] text-zinc-400 uppercase font-bold">Receiver's Signature / stamp</span>
            <span className="text-zinc-400 italic">Signature of consignee/driver</span>
          </div>
          <div className="text-center w-64 border border-zinc-400 h-24 relative flex items-end justify-center p-2 bg-zinc-50/30">
            <span className="absolute top-2 left-2 text-[10px] text-zinc-400 uppercase font-bold">For Sumesh Petroleum Pvt. Ltd.</span>
            <span className="font-bold text-xs uppercase text-zinc-800">Authorized Dispatcher</span>
          </div>
        </div>

      </div>
    </div>
  );
}
