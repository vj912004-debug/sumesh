import { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Plus, Search, Calendar, RefreshCcw, Printer, ArrowLeftRight, AlertTriangle, CheckCircle
} from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';

type ChallanItem = {
  id: string;
  itemCode: string;
  description: string;
  hsnSac: string;
  qtyDispatched: number;
  qtyReturned: number;
  uom: string;
};

type ReturnableChallanType = {
  id: string; // Challan No (e.g. RD000003810)
  dateIssued: string;
  expectedReturnDate: string;
  buyerName: string;
  buyerAddress: string;
  buyerGstin: string;
  buyerPhone: string;
  consigneeName: string;
  consigneeAddress: string;
  purpose: string;
  jobWorkNo: string;
  status: 'Pending' | 'Partial' | 'Returned' | 'Overdue';
  items: ChallanItem[];
  operatorName?: string;
  driverDetails?: string;
  transporter?: string;
  vehicleNo?: string;
  lrNoDate?: string;
  preparedBy?: string;
};

export default function ReturnableChallan() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Partial' | 'Returned' | 'Overdue'>('All');
  
  // Interactive mock data pre-populated with the exact document details from user image
  const [challans, setChallans] = useState<ReturnableChallanType[]>([
    {
      id: 'RD000003810',
      dateIssued: '2026-03-12',
      expectedReturnDate: '2026-04-12',
      buyerName: 'SKIPPERSEIL LIMITED',
      buyerAddress: 'PLOT NO SP 9A, SKIPPERSEIL LTD, KARARANI, BHIWADI, Alwar, Rajasthan, 301019',
      buyerGstin: '08AAACS3970N1ZM',
      buyerPhone: '9887468329',
      consigneeName: 'SKIPPERSEIL LIMITED',
      consigneeAddress: 'C/O SKIPPERSEIL LTD PLOT NO SP 9A, KARARANI, BHIWADI, RAJASTHAN-301019',
      purpose: 'Evacuation System & Accessories Sent for On-site Testing',
      jobWorkNo: 'JW-26-0038',
      status: 'Pending',
      operatorName: 'Anoop Singh',
      driverDetails: '9887468329',
      transporter: 'Universal Logistics',
      vehicleNo: 'DL01LAFB056',
      lrNoDate: 'LR-90181 / 12-Mar-2026',
      preparedBy: 'chirag',
      items: [
        { 
          id: '1', 
          itemCode: 'SAEQ00000031', 
          description: 'EVACUATION SYSTEM - VIJAY MAKE PUMP + SMB C36 (BLUE)\nSUMESH PETROLEUM MAKE EVACUATION SYSTEM SR NO: SP/EVS/SKD/31\n\nVIJAY MAKE VACUUM PUMP\nMODEL NO: V3-22\nSR NO: 236501\n\nABB MAKE MOTOR\nHP: 10\nSR NO: 487527\n\nBOOSTER PUMP\nSHINKO SEIKI MAKE\nSMB-C36\nSR NO: 110030\n\nCG MAKE MOTOR\nKW/HP-3 (RPM-2850)\nSR NO: UPGM 2687', 
          hsnSac: '997319', 
          qtyDispatched: 1.000, 
          qtyReturned: 0, 
          uom: 'Nos.' 
        },
        { 
          id: '2', 
          itemCode: 'SPPE00000040', 
          description: 'VACUUM HOSE PIPE 2"', 
          hsnSac: '84219900', 
          qtyDispatched: 1.000, 
          qtyReturned: 0, 
          uom: 'Nos.' 
        },
        { 
          id: '3', 
          itemCode: 'SCABL0000054', 
          description: '10 SQ MM 4 CORE CABLE 10 MTR LONG', 
          hsnSac: '84819090', 
          qtyDispatched: 1.000, 
          qtyReturned: 0, 
          uom: 'Nos.' 
        },
        { 
          id: '4', 
          itemCode: 'SCIL00000001', 
          description: 'VACUUM OIL 10 LTR', 
          hsnSac: '2710', 
          qtyDispatched: 1.000, 
          qtyReturned: 0, 
          uom: 'Ltr.' 
        }
      ]
    },
    {
      id: 'RDC-26-0085',
      dateIssued: '2026-06-20',
      expectedReturnDate: '2026-07-05',
      buyerName: 'TATA POWER COMPANY LTD',
      buyerAddress: 'Kalyan Substation, GIDC Phase II, Kalyan, Maharashtra, 421301',
      buyerGstin: '27AAACT2727Q1Z8',
      buyerPhone: '9988776655',
      consigneeName: 'TATA POWER COMPANY LTD',
      consigneeAddress: 'Kalyan Substation, GIDC Phase II, Kalyan, Maharashtra, 421301',
      purpose: 'Stress Relieving & Hardening of Shafts',
      jobWorkNo: 'JW-26-0048',
      status: 'Pending',
      operatorName: 'R. K. Verma',
      driverDetails: '9001122334',
      transporter: 'VRL Logistics',
      vehicleNo: 'MH04GP9012',
      lrNoDate: 'VRL-77810 / 20-Jun-2026',
      preparedBy: 'chirag',
      items: [
        { id: '1', itemCode: 'SHFT-90181', description: 'Roots Pump Drive Shafts (EN9)', hsnSac: '84831090', qtyDispatched: 5.000, qtyReturned: 0, uom: 'Nos.' }
      ]
    }
  ]);

  // Modal State for New Challan
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newChallanNo, setNewChallanNo] = useState('');
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerAddress, setNewBuyerAddress] = useState('');
  const [newBuyerGstin, setNewBuyerGstin] = useState('');
  const [newBuyerPhone, setNewBuyerPhone] = useState('');
  const [newConsigneeName, setNewConsigneeName] = useState('');
  const [newConsigneeAddress, setNewConsigneeAddress] = useState('');
  const [newPurpose, setNewPurpose] = useState('');
  const [newJobWork, setNewJobWork] = useState('');
  const [newExpectedDate, setNewExpectedDate] = useState('');
  const [newTransporter, setNewTransporter] = useState('');
  const [newVehicleNo, setNewVehicleNo] = useState('');
  const [newLrNoDate, setNewLrNoDate] = useState('');
  const [newOperatorName, setNewOperatorName] = useState('');
  const [newDriverDetails, setNewDriverDetails] = useState('');
  const [newItems, setNewItems] = useState<{ itemCode: string; description: string; hsnSac: string; qty: number; uom: string }[]>([
    { itemCode: '', description: '', hsnSac: '', qty: 1.000, uom: 'Nos.' }
  ]);

  // Modal State for Return Receipt
  const [selectedChallan, setSelectedChallan] = useState<ReturnableChallanType | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnQtys, setReturnQtys] = useState<Record<string, number>>({});

  // Modal State for Gate Pass Print Preview
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printChallan, setPrintChallan] = useState<ReturnableChallanType | null>(null);

  // Statistics
  const totalRDCs = challans.length;
  const pendingRDCs = challans.filter(c => c.status === 'Pending' || c.status === 'Partial' || c.status === 'Overdue').length;
  const overdueRDCs = challans.filter(c => {
    if (c.status === 'Returned') return false;
    return c.status === 'Overdue' || isAfter(new Date(), parseISO(c.expectedReturnDate));
  }).length;
  
  // Filtered list
  const filteredChallans = challans.filter(c => {
    const matchesSearch = c.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.items.some(i => i.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && c.status === statusFilter;
  });

  const handleAddNewItemField = () => {
    setNewItems([...newItems, { itemCode: '', description: '', hsnSac: '', qty: 1.000, uom: 'Nos.' }]);
  };

  const handleRemoveNewItemField = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const handleItemFieldChange = (index: number, field: 'itemCode' | 'description' | 'hsnSac' | 'qty' | 'uom', value: any) => {
    const updated = [...newItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewItems(updated);
  };

  // Submit New Challan
  const handleCreateChallanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = format(new Date(), 'yyyy-MM-dd');
    const newChallanObj: ReturnableChallanType = {
      id: newChallanNo || `RD${Math.floor(10000000 + Math.random() * 90000000)}`,
      dateIssued: formattedDate,
      expectedReturnDate: newExpectedDate,
      buyerName: newBuyerName,
      buyerAddress: newBuyerAddress,
      buyerGstin: newBuyerGstin,
      buyerPhone: newBuyerPhone,
      consigneeName: newConsigneeName || newBuyerName,
      consigneeAddress: newConsigneeAddress || newBuyerAddress,
      purpose: newPurpose,
      jobWorkNo: newJobWork || `JW-26-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
      operatorName: newOperatorName,
      driverDetails: newDriverDetails,
      transporter: newTransporter,
      vehicleNo: newVehicleNo,
      lrNoDate: newLrNoDate,
      preparedBy: 'chirag',
      items: newItems.map((item, index) => ({
        id: (index + 1).toString(),
        itemCode: item.itemCode || `ITM-${Math.floor(10000 + Math.random() * 90000)}`,
        description: item.description,
        hsnSac: item.hsnSac || '8421',
        qtyDispatched: item.qty,
        qtyReturned: 0,
        uom: item.uom
      }))
    };

    setChallans([newChallanObj, ...challans]);
    setIsNewModalOpen(false);
    
    // Reset Form fields
    setNewChallanNo('');
    setNewBuyerName('');
    setNewBuyerAddress('');
    setNewBuyerGstin('');
    setNewBuyerPhone('');
    setNewConsigneeName('');
    setNewConsigneeAddress('');
    setNewPurpose('');
    setNewJobWork('');
    setNewExpectedDate('');
    setNewTransporter('');
    setNewVehicleNo('');
    setNewLrNoDate('');
    setNewOperatorName('');
    setNewDriverDetails('');
    setNewItems([{ itemCode: '', description: '', hsnSac: '', qty: 1.000, uom: 'Nos.' }]);
  };

  const handleOpenReturnDialog = (challan: ReturnableChallanType) => {
    setSelectedChallan(challan);
    const initialQtys: Record<string, number> = {};
    challan.items.forEach(item => {
      initialQtys[item.id] = 0;
    });
    setReturnQtys(initialQtys);
    setIsReturnModalOpen(true);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallan) return;

    const updatedChallans = challans.map(c => {
      if (c.id === selectedChallan.id) {
        let allReturned = true;
        let anyReturned = false;

        const updatedItems = c.items.map(item => {
          const retQty = returnQtys[item.id] || 0;
          const newReturned = Math.min(item.qtyDispatched, item.qtyReturned + retQty);
          
          if (newReturned < item.qtyDispatched) {
            allReturned = false;
          }
          if (newReturned > 0) {
            anyReturned = true;
          }

          return {
            ...item,
            qtyReturned: newReturned
          };
        });

        const status = allReturned ? 'Returned' : anyReturned ? 'Partial' : 'Pending';

        return {
          ...c,
          items: updatedItems,
          status: status as any
        };
      }
      return c;
    });

    setChallans(updatedChallans);
    setIsReturnModalOpen(false);
    setSelectedChallan(null);
  };

  const handleOpenPrintPreview = (challan: ReturnableChallanType) => {
    setPrintChallan(challan);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Printing Style Tag to resolve dialog background overlap and clipping */}
      <style>{`
        @media print {
          /* Force page background to white and hide layout wrappers */
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
          }
          
          /* Hide navigation panels, header bars, and print control buttons */
          aside, header, button, .print\\:hidden {
            display: none !important;
          }
          
          /* Remove dark overlay backgrounds & focus locks of Radix Dialog */
          div[data-state="open"] > div:first-child,
          .bg-black\\/80,
          [data-radix-focus-guard] {
            display: none !important;
            background: transparent !important;
            opacity: 0 !important;
          }
          
          /* Overcome fixed position absolute centering offsets on DialogContent */
          div[role="dialog"] {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: none !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          
          /* Hide Radix default cross button */
          div[role="dialog"] button {
            display: none !important;
          }
          
          /* Eliminate card padding for layout alignment on paper */
          .print-doc-container {
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          /* Ensure print page splits inside tables behave correctly */
          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-800">Returnable Challan Register</h2>
          <p className="text-zinc-500 font-medium">Log, monitor, and print official Returnable Delivery Challans for subcontracting services and job work activities.</p>
        </div>
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-transform active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> New Returnable Challan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateChallanSubmit}>
              <DialogHeader>
                <DialogTitle className="text-xl">Create Returnable Challan</DialogTitle>
                <DialogDescription>Input official buyer, consignee, material details, and logistics information.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 text-xs">
                {/* Basic Challan details */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600">Challan Number</label>
                    <Input placeholder="e.g. RD000003810" value={newChallanNo} onChange={e => setNewChallanNo(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600">Expected Return Date</label>
                    <Input type="date" value={newExpectedDate} onChange={e => setNewExpectedDate(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600">Job Work Order Ref</label>
                    <Input placeholder="e.g. JW-26-0038" value={newJobWork} onChange={e => setNewJobWork(e.target.value)} />
                  </div>
                </div>

                {/* Buyer / M/s. Details */}
                <div className="grid grid-cols-2 gap-4 border-t pt-2">
                  <div className="space-y-2">
                    <h4 className="font-bold text-zinc-700">Buyer (M/S) Details</h4>
                    <div className="space-y-1">
                      <Input placeholder="Buyer Name (e.g. SKIPPERSEIL LIMITED)" value={newBuyerName} onChange={e => setNewBuyerName(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Input placeholder="Address (Plot, Sector, City, State)" value={newBuyerAddress} onChange={e => setNewBuyerAddress(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="GSTIN (e.g. 08AAACS3970N1ZM)" value={newBuyerGstin} onChange={e => setNewBuyerGstin(e.target.value)} />
                      <Input placeholder="Phone / Mobile" value={newBuyerPhone} onChange={e => setNewBuyerPhone(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-zinc-700">Consignee (M/S) Details</h4>
                    <div className="space-y-1">
                      <Input placeholder="Consignee Name (same if blank)" value={newConsigneeName} onChange={e => setNewConsigneeName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Input placeholder="Delivery Address (same if blank)" value={newConsigneeAddress} onChange={e => setNewConsigneeAddress(e.target.value)} />
                    </div>
                    <div className="text-[10px] text-zinc-400">Leave blank if Consignee address is identical to Buyer address.</div>
                  </div>
                </div>

                {/* Dispatch Purpose & Transport */}
                <div className="grid grid-cols-3 gap-3 border-t pt-2">
                  <div className="space-y-1 col-span-3">
                    <label className="font-semibold text-zinc-600">Dispatch Purpose Description</label>
                    <Input placeholder="e.g. Evacuation System Accessories Sent for Calibration" value={newPurpose} onChange={e => setNewPurpose(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600">Transporter</label>
                    <Input placeholder="e.g. Universal Cargo" value={newTransporter} onChange={e => setNewTransporter(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600">Vehicle Number</label>
                    <Input placeholder="e.g. DL01LAFB056" value={newVehicleNo} onChange={e => setNewVehicleNo(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600">L.R. No & Date</label>
                    <Input placeholder="e.g. LR-90181 / 12-Mar" value={newLrNoDate} onChange={e => setNewLrNoDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600">Operator Name</label>
                    <Input placeholder="e.g. chirag" value={newOperatorName} onChange={e => setNewOperatorName(e.target.value)} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="font-semibold text-zinc-600">Driver Phone / Details</label>
                    <Input placeholder="e.g. 9887468329" value={newDriverDetails} onChange={e => setNewDriverDetails(e.target.value)} />
                  </div>
                </div>

                {/* Items Block */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-zinc-700">Challan Items List</h4>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddNewItemField}>
                      + Add Item Row
                    </Button>
                  </div>
                  {newItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start bg-zinc-50 p-2 rounded border border-dashed">
                      <div className="w-28 space-y-1">
                        <label className="text-[10px] text-zinc-400">Item Code</label>
                        <Input placeholder="SAEQ00000031" value={item.itemCode} onChange={e => handleItemFieldChange(index, 'itemCode', e.target.value)} required />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] text-zinc-400">Item Details / Specs</label>
                        <textarea 
                          placeholder="specs, motors, model, serial no..." 
                          value={item.description} 
                          className="w-full text-xs p-2 bg-white border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20 h-16"
                          onChange={e => handleItemFieldChange(index, 'description', e.target.value)}
                          required 
                        />
                      </div>
                      <div className="w-20 space-y-1">
                        <label className="text-[10px] text-zinc-400">HSN/SAC</label>
                        <Input placeholder="997319" value={item.hsnSac} onChange={e => handleItemFieldChange(index, 'hsnSac', e.target.value)} required />
                      </div>
                      <div className="w-16 space-y-1">
                        <label className="text-[10px] text-zinc-400">Qty</label>
                        <Input type="number" step="0.001" placeholder="1.0" value={item.qty} onChange={e => handleItemFieldChange(index, 'qty', parseFloat(e.target.value) || 1.0)} required />
                      </div>
                      <div className="w-16 space-y-1">
                        <label className="text-[10px] text-zinc-400">UOM</label>
                        <Input placeholder="Nos." value={item.uom} onChange={e => handleItemFieldChange(index, 'uom', e.target.value)} required />
                      </div>
                      {newItems.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0 mt-4" 
                          onClick={() => handleRemoveNewItemField(index)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Generate Returnable Challan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards Dashboard */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Total Issued</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-800">{totalRDCs}</div>
            <p className="text-xs text-zinc-400">Outward returnable gate passes</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Outstanding Challans</CardTitle>
            <RefreshCcw className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{pendingRDCs}</div>
            <p className="text-xs text-zinc-400">Waiting material return logs</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Overdue Reminders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueRDCs}</div>
            <p className="text-xs text-red-400 font-semibold">Exceeded expected dates</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Returned Clearance</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {challans.filter(c => c.status === 'Returned').length}
            </div>
            <p className="text-xs text-zinc-400">100% material closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-zinc-800">Returnable Challan Register</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by buyer, item description..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Status Filters */}
              <div className="flex bg-zinc-100 p-1 rounded-md text-xs">
                {(['All', 'Pending', 'Partial', 'Returned', 'Overdue'] as const).map(status => (
                  <button
                    key={status}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      statusFilter === status 
                        ? 'bg-white text-zinc-800 shadow-sm font-semibold' 
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Challan No</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead>Buyer (M/s)</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Reconcile Progress</TableHead>
                <TableHead>Expected Return</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChallans.map((challan) => {
                const totalPendingItemsCount = challan.items.reduce(
                  (sum, item) => sum + (item.qtyDispatched - item.qtyReturned), 0
                );
                const isItemOverdue = challan.status !== 'Returned' && isAfter(new Date(), parseISO(challan.expectedReturnDate));

                return (
                  <TableRow key={challan.id} className="hover:bg-zinc-50/50">
                    <TableCell className="font-semibold text-teal-600 text-xs">
                      {challan.id}
                      <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">{challan.jobWorkNo}</span>
                    </TableCell>
                    <TableCell>{format(new Date(challan.dateIssued), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="font-medium text-zinc-700">{challan.buyerName}</TableCell>
                    <TableCell className="text-zinc-500 text-xs max-w-[200px] truncate">{challan.purpose}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-zinc-700">{totalPendingItemsCount.toFixed(1)}</span>
                      <span className="text-zinc-400 text-xs font-normal"> units due</span>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[150px] mt-0.5">
                        {challan.items.map(i => `${i.itemCode}: (${i.qtyReturned}/${i.qtyDispatched})`).join(', ')}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        <span className={isItemOverdue ? 'text-red-500 font-semibold' : 'text-zinc-600'}>
                          {format(new Date(challan.expectedReturnDate), 'dd MMM yyyy')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        challan.status === 'Returned' ? 'default' : 
                        challan.status === 'Overdue' || isItemOverdue ? 'destructive' : 
                        challan.status === 'Partial' ? 'secondary' : 'outline'
                      }>
                        {challan.status === 'Returned' ? 'Returned' : isItemOverdue ? 'Overdue' : challan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 text-teal-600 hover:text-teal-800" onClick={() => handleOpenPrintPreview(challan)}>
                        <Printer className="h-4 w-4 mr-1" /> View/Print
                      </Button>
                      {challan.status !== 'Returned' && (
                        <Button 
                          size="sm" 
                          className="h-8 bg-zinc-800 hover:bg-zinc-900 text-white"
                          onClick={() => handleOpenReturnDialog(challan)}
                        >
                          Log Return
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredChallans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-zinc-400">
                    No returnable challans matching the filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for Record Return Receipt */}
      <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedChallan && (
            <form onSubmit={handleReturnSubmit}>
              <DialogHeader>
                <DialogTitle>Log Material Return</DialogTitle>
                <DialogDescription>
                  Enter returning quantities for items sent to <span className="font-semibold text-zinc-800">{selectedChallan.buyerName}</span>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 text-xs">
                <div className="bg-zinc-50 p-3 rounded-md border text-zinc-600 space-y-1">
                  <div><span className="font-medium">Challan No:</span> {selectedChallan.id}</div>
                  <div><span className="font-medium">Job Work Ref:</span> {selectedChallan.jobWorkNo}</div>
                  <div><span className="font-medium">Purpose:</span> {selectedChallan.purpose}</div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-zinc-700">Enter Quantities Received back:</h4>
                  {selectedChallan.items.map((item) => {
                    const maxAllowed = item.qtyDispatched - item.qtyReturned;
                    return (
                      <div key={item.id} className="flex justify-between items-center border-b pb-2">
                        <div className="flex-1 pr-4">
                          <p className="font-semibold text-zinc-800">{item.itemCode}</p>
                          <p className="text-[10px] text-zinc-500 whitespace-pre-line leading-normal truncate max-w-[250px]">
                            {item.description.split('\n')[0]}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            Sent: {item.qtyDispatched} {item.uom} | Reconciled: {item.qtyReturned} {item.uom}
                          </p>
                        </div>
                        <div className="w-24">
                          <label className="block text-[10px] text-zinc-400 text-right mb-0.5">Recv Qty</label>
                          <Input 
                            type="number" 
                            step="0.001"
                            min="0"
                            max={maxAllowed}
                            value={returnQtys[item.id] || 0}
                            className="text-right h-8 text-xs"
                            onChange={e => setReturnQtys({
                              ...returnQtys,
                              [item.id]: Math.min(maxAllowed, parseFloat(e.target.value) || 0)
                            })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReturnModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Save Return Entry</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for Gate Pass Print Preview - Styled EXACTLY like the user upload */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="sm:max-w-[760px] max-h-[95vh] overflow-y-auto p-0 border-0 bg-transparent print-page-wrapper">
          {printChallan && (
            <div className="bg-white p-6 rounded-md shadow-xl border relative print-page-wrapper">
              <div className="flex justify-end gap-2 mb-4 print:hidden px-4 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsPrintModalOpen(false)}>Close</Button>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" /> Print Challan
                </Button>
              </div>
              
              {/* Document Printable Area matching the layout of image */}
              <div className="border border-zinc-800 p-5 bg-white text-zinc-900 text-[11px] font-sans leading-relaxed min-h-[900px] flex flex-col justify-between print-doc-container">
                
                {/* Header Container */}
                <div>
                  <div className="flex border-b border-zinc-800 pb-3">
                    {/* Left logo emblem */}
                    <div className="w-1/4 flex flex-col items-center justify-center border-r border-zinc-800 pr-3">
                      <div className="bg-[#ea580c] text-white p-2 rounded flex flex-col items-center justify-center w-16 h-16 shadow-sm border border-orange-700">
                        <span className="text-lg font-black tracking-tighter leading-none">SUMESH</span>
                        <div className="w-8 h-[1px] bg-white my-1"></div>
                        <span className="text-[7px] font-bold uppercase leading-none tracking-widest text-orange-100">Petroleum</span>
                      </div>
                    </div>

                    {/* Middle Company details */}
                    <div className="w-1/2 px-4 text-center flex flex-col justify-center">
                      <h1 className="text-lg font-bold text-[#143157] leading-tight tracking-wide">Sumesh Petroleum Pvt. Ltd.</h1>
                      <p className="text-[9px] text-zinc-500 font-semibold">(Formerly Sumesh Petroleum)</p>
                      <p className="text-[9px] font-bold text-zinc-700 mt-1 uppercase tracking-wider">ISO 9001 : 2015 Certified Company</p>
                      <p className="text-[9px] text-zinc-600 font-medium">CIN NO : U29309GJ2018PTC102237</p>
                      <p className="text-[9px] font-bold text-[#143157] mt-0.5">GST NO : 24ABACS2821F1ZT</p>
                    </div>

                    {/* Right Address & TABU logo */}
                    <div className="w-1/4 pl-3 border-l border-zinc-800 flex flex-col justify-center text-left text-[9px] text-zinc-600 space-y-0.5">
                      <div className="flex justify-end mb-2">
                        <div className="border border-red-600 text-red-600 rounded px-1.5 py-0.5 text-[10px] font-extrabold italic tracking-wider uppercase leading-none">
                          tabu
                        </div>
                      </div>
                      <p className="font-semibold text-zinc-800">226 - 227, G.I.D.C. Estate, Makarpura,</p>
                      <p>Vadodara-390 010, Gujarat, India.</p>
                      <p>Ph.: +91-265-2656545, 2632084</p>
                      <p>Fax: +91-265-2638320</p>
                      <p className="truncate">E-mail: sumeshpetroleum@gmail.com</p>
                      <p>Web: www.sumesh.in</p>
                      <p>Mobile: 097277 05851, 083479 66001</p>
                    </div>
                  </div>

                  {/* Document Title header */}
                  <div className="text-center font-bold tracking-widest uppercase border-b border-zinc-800 py-1.5 bg-zinc-50 text-xs text-zinc-800">
                    RETURNABLE CHALLAN
                  </div>

                  {/* Buyer & Consignee details grid */}
                  <div className="grid grid-cols-2 border-b border-zinc-800 text-[10px] divide-x divide-zinc-800">
                    {/* Buyer Side */}
                    <div className="p-3 space-y-1">
                      <p className="font-bold text-zinc-500 uppercase tracking-wider text-[9px]">Buyer's Name & Address</p>
                      <p className="font-bold text-[#143157] text-[11px]">M/S.  {printChallan.buyerName}</p>
                      <p className="text-zinc-600 leading-tight whitespace-pre-wrap">{printChallan.buyerAddress}</p>
                      <p className="pt-2 font-medium"><span className="font-semibold">Ph. No. :</span> {printChallan.buyerPhone}</p>
                      <p className="font-bold text-zinc-800"><span className="font-semibold">GSTIN :</span> {printChallan.buyerGstin}</p>
                      <p className="text-zinc-400">Kind. Attn. :</p>
                    </div>

                    {/* Consignee & Challan Numbers Side */}
                    <div className="flex flex-col">
                      {/* Top Part: Challan meta */}
                      <div className="p-2 border-b border-zinc-800 grid grid-cols-2 text-[10px] bg-zinc-50/50">
                        <div><span className="font-bold text-zinc-600">Challan No.</span> &nbsp;&nbsp;&nbsp;: <span className="font-bold text-zinc-900">{printChallan.id}</span></div>
                        <div><span className="font-bold text-zinc-600">Challan Date</span> : <span className="font-bold text-zinc-900">{format(new Date(printChallan.dateIssued), 'dd/MM/yyyy')}</span></div>
                      </div>
                      {/* Bottom Part: Consignee name/address */}
                      <div className="p-3 flex-1 space-y-1">
                        <p className="font-bold text-zinc-500 uppercase tracking-wider text-[9px]">Consignee's Name & Address</p>
                        <p className="font-bold text-[#143157] text-[11px]">M/S.  {printChallan.consigneeName}</p>
                        <p className="text-zinc-600 leading-tight whitespace-pre-wrap">{printChallan.consigneeAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items Table - Rendered with full black borders */}
                  <table className="w-full text-left border-collapse border-b border-zinc-800">
                    <thead>
                      <tr className="bg-zinc-100 text-[10px] font-bold border-b border-zinc-800">
                        <th className="border-r border-zinc-800 py-2 px-2 text-center w-10">No.</th>
                        <th className="border-r border-zinc-800 py-2 px-2 w-28">Item Code</th>
                        <th className="border-r border-zinc-800 py-2 px-2">Item Details</th>
                        <th className="border-r border-zinc-800 py-2 px-2 text-center w-24">HSN/SAC</th>
                        <th className="border-r border-zinc-800 py-2 px-2 text-center w-16">UOM</th>
                        <th className="py-2 px-2 text-right w-20">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printChallan.items.map((item, index) => (
                        <tr key={item.id} className="text-[10px] align-top border-b border-zinc-300">
                          <td className="border-r border-zinc-800 py-2 px-2 text-center">{index + 1}</td>
                          <td className="border-r border-zinc-800 py-2 px-2 font-mono font-semibold text-zinc-700">{item.itemCode}</td>
                          <td className="border-r border-zinc-800 py-2 px-2">
                            <div className="font-bold text-zinc-800 leading-tight whitespace-pre-wrap font-sans">
                              {item.description}
                            </div>
                          </td>
                          <td className="border-r border-zinc-800 py-2 px-2 text-center text-zinc-500 font-semibold">{item.hsnSac}</td>
                          <td className="border-r border-zinc-800 py-2 px-2 text-center text-zinc-600">{item.uom}</td>
                          <td className="py-2 px-2 text-right font-bold text-zinc-800">{item.qtyDispatched.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Section */}
                <div className="mt-4 space-y-3">
                  {/* Remarks block */}
                  <div className="text-[9px] text-zinc-700 space-y-1 border border-zinc-800 p-2.5 rounded-sm bg-zinc-50/50 leading-relaxed">
                    <p><span className="font-bold">Remark :-</span> We hereby request the vendor to check first and then receive each and every material as mentioned in this challan copy. If anything is LESS/MORE or in IMPROPER condition, please IMMEDIATELY contact the management, as the complaint will not be entertained at the time of RETURNING of GOOD's. And you are also requested to return the signed & stamped DUPLICATE COPY of this RETURNABLE CHALLAN during the returning of GOOD's.</p>
                    <div className="grid grid-cols-2 pt-1.5 border-t border-zinc-300 mt-1">
                      <div><span className="font-bold text-zinc-800">Company's Operator Name:-</span> {printChallan.operatorName || '-'}</div>
                      <div className="text-right"><span className="font-bold text-zinc-800">Driver's Detail's:-</span> {printChallan.driverDetails || '-'}</div>
                    </div>
                  </div>

                  {/* GSTIN / PAN & Signatory */}
                  <div className="grid grid-cols-2 text-[10px] border border-zinc-800 divide-x divide-zinc-800">
                    <div className="p-3 space-y-1.5 self-center">
                      <div><span className="font-bold text-zinc-500">GSTIN</span> &nbsp;&nbsp;&nbsp;: <span className="font-bold text-slate-850">24ABACS2821F1ZT</span></div>
                      <div><span className="font-bold text-zinc-500">PAN</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <span className="font-bold text-slate-850">ABACS2821F</span></div>
                    </div>
                    <div className="p-3 text-right flex flex-col justify-between h-20 bg-zinc-50/30">
                      <p className="font-bold text-slate-750">For, Sumesh Petroleum Pvt. Ltd.</p>
                      <p className="text-[9px] font-bold text-zinc-500 tracking-wider">Authorized Signatory</p>
                    </div>
                  </div>

                  {/* Transporter Details & Sign-offs */}
                  <div className="grid grid-cols-3 text-[9px] text-zinc-600 gap-4 pt-2">
                    <div className="space-y-1 font-medium">
                      <div><span className="font-semibold">Transporter:</span> {printChallan.transporter || '-'}</div>
                      <div><span className="font-semibold">Vehicle No.:</span> <span className="font-bold text-zinc-800">{printChallan.vehicleNo || '-'}</span></div>
                      <div><span className="font-semibold">L.R.No. & Date:</span> {printChallan.lrNoDate || '-'}</div>
                    </div>
                    <div className="text-center flex flex-col justify-end h-16">
                      <div className="border-b border-dashed border-zinc-400 w-3/4 mx-auto mb-1"></div>
                      <p className="font-bold text-zinc-700">Prepared By</p>
                      <p className="text-[8px] text-zinc-500">( {printChallan.preparedBy || 'chirag'} )</p>
                    </div>
                    <div className="text-center flex flex-col justify-end h-16">
                      <div className="border-b border-dashed border-zinc-400 w-3/4 mx-auto mb-1"></div>
                      <p className="font-bold text-zinc-700">Received By</p>
                      <p className="text-[8px] text-zinc-500">( Signature & Stamp )</p>
                    </div>
                  </div>

                  {/* Page index footer */}
                  <div className="text-center text-[8px] text-zinc-400 pt-2 border-t border-slate-250 flex justify-between uppercase font-semibold mt-3">
                    <span>SUMESH PETROLEUM</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
