import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Plus, Search, Users, Calendar, Link, Clipboard, ShieldCheck, Mail, FileText, CheckCircle2, Paperclip, Barcode
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  gstin: string;
  billToAddress: string;
  shipToAddress: string;
}

interface Contract {
  id: string;
  customer: string;
  asset: string;
  rate: string;
  start: string;
  end: string;
  billingCycle: string;
  status: string;
}

interface PoLinkage {
  invoiceNo: string;
  date: string;
  customer: string;
  amount: string;
  clientPoRef: string;
  challanRef: string;
  manufacturingFile: string;
  serialArray: string[];
  matchingStatus: 'Matched' | 'PO Pending' | 'Verification Required';
}

export default function SalesRentalsBilling() {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 'CUST-001', name: 'Reliance Industries Ltd', contact: 'Ketan Shah', email: 'kshah@ril.com', gstin: '24AAACR8821B1Z2', billToAddress: 'Maker Chambers, Nariman Point, Mumbai', shipToAddress: 'Jamanagar Refinery, Block C, Gujarat' },
    { id: 'CUST-002', name: 'Tata Power Company Ltd', contact: 'M. Vasudevan', email: 'mvasu@tatapower.com', gstin: '27AAACT9012K1Z9', billToAddress: 'Carnac Bunder, Fort, Mumbai', shipToAddress: 'Trombay Thermal Station Yard, Mumbai' },
    { id: 'CUST-003', name: 'Torrent Power Ltd', contact: 'Amit Vyas', email: 'avyas@torrent.com', gstin: '24AAACT4412M1ZN', billToAddress: 'Sola Road HQ, Ahmedabad', shipToAddress: 'Sabarmati Power House Site, Ahmedabad' }
  ]);

  const [contracts, setContracts] = useState<Contract[]>([
    { id: 'RNT-201', customer: 'Reliance Industries Ltd', asset: '50000 Litre Storage Tank', rate: '₹45,000 / month', start: '2026-01-01', end: '2026-12-31', billingCycle: 'Monthly', status: 'Active' },
    { id: 'RNT-202', customer: 'Torrent Power Ltd', asset: 'High Vacuum Filtration Rig (6000LPH)', rate: '₹1,20,000 / month', start: '2026-05-15', end: '2026-08-15', billingCycle: 'Monthly', status: 'Active' },
    { id: 'RNT-203', customer: 'Tata Power Company Ltd', asset: 'Mobile Oil Trailer', rate: '₹25,000 / month', start: '2026-03-01', end: '2026-06-30', billingCycle: 'Quarterly', status: 'Expired' }
  ]);

  const [linkages, setLinkages] = useState<PoLinkage[]>([
    { invoiceNo: 'INV-26-004', date: '2026-06-28', customer: 'Tata Power Company Ltd', amount: '₹14,50,000', clientPoRef: 'PO/TP/2026/044', challanRef: 'CHL-1084', manufacturingFile: 'DWG-TP-102.pdf', serialArray: ['SMP-6000-092'], matchingStatus: 'Matched' },
    { invoiceNo: 'INV-26-005', date: '2026-06-30', customer: 'Reliance Industries Ltd', amount: '₹22,00,000', clientPoRef: 'PO/RIL-VAD/982', challanRef: 'CHL-1082', manufacturingFile: 'DWG-RIL-044-REV2.pdf', serialArray: ['SMP-10000-041', 'SMP-10000-042'], matchingStatus: 'Matched' },
    { invoiceNo: 'INV-26-006', date: '2026-06-30', customer: 'Torrent Power Ltd', amount: '₹1,80,000', clientPoRef: 'Awaiting PO Release', challanRef: 'CHL-1083', manufacturingFile: 'Not Attached', serialArray: [], matchingStatus: 'PO Pending' }
  ]);

  // Form States - Customer
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  const [cName, setCName] = useState('');
  const [cContact, setCContact] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cGst, setCGst] = useState('');
  const [cBillTo, setCBillTo] = useState('');
  const [cShipTo, setCShipTo] = useState('');

  // Form States - PO Binding Wizard
  const [isBindPoOpen, setIsBindPoOpen] = useState(false);
  const [bindInvoice, setBindInvoice] = useState('INV-26-006');
  const [bindPoRef, setBindPoRef] = useState('');
  const [bindDwgFile, setBindDwgFile] = useState('');
  const [bindSerials, setBindSerials] = useState('');

  const handleAddCust = (e: React.FormEvent) => {
    e.preventDefault();
    const newCust: Customer = {
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      name: cName,
      contact: cContact,
      email: cEmail,
      gstin: cGst || 'Unregistered',
      billToAddress: cBillTo,
      shipToAddress: cShipTo
    };
    setCustomers([...customers, newCust]);
    setIsAddCustOpen(false);
    setCName('');
    setCContact('');
    setCEmail('');
    setCGst('');
    setCBillTo('');
    setCShipTo('');
  };

  const handleBindPo = (e: React.FormEvent) => {
    e.preventDefault();
    const serialList = bindSerials.split(',').map(s => s.trim()).filter(Boolean);
    
    setLinkages(prev => prev.map(link => 
      link.invoiceNo === bindInvoice ? {
        ...link,
        clientPoRef: bindPoRef,
        manufacturingFile: bindDwgFile || 'DWG-GENERIC.pdf',
        serialArray: serialList,
        matchingStatus: 'Matched'
      } : link
    ));
    
    setIsBindPoOpen(false);
    setBindPoRef('');
    setBindDwgFile('');
    setBindSerials('');
    alert(`Purchase Order details bound successfully to Invoice ${bindInvoice}. Tracking serials & drawing coordinates initialized.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Plant Sales & CRM Directory</h2>
        <p className="text-muted-foreground">Manage Bill-To vs Ship-To client profiles, time-bound rentals, and complete Client PO tracking arrays.</p>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="customers"><Users className="w-4 h-4 mr-2" /> Customer & Consignee Registry</TabsTrigger>
          <TabsTrigger value="rentals"><Calendar className="w-4 h-4 mr-2" /> Service & Rentals Leases</TabsTrigger>
          <TabsTrigger value="linkage"><Link className="w-4 h-4 mr-2" /> Order & Client PO Tracking</TabsTrigger>
        </TabsList>

        {/* Tab 1: Customer Database */}
        <TabsContent value="customers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Customer Database & Delivery Profiles</CardTitle>
                <CardDescription>Setup distinct "Bill To" headquarters and "Ship To" factory site destinations alongside statutory GSTIN profiles.</CardDescription>
              </div>
              <Dialog open={isAddCustOpen} onOpenChange={setIsAddCustOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Register Customer</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handleAddCust}>
                    <DialogHeader>
                      <DialogTitle>Register Customer / Consignee</DialogTitle>
                      <DialogDescription>Setup statutory billing profiles and shipping addresses.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Company Name</label>
                          <Input value={cName} onChange={e => setCName(e.target.value)} placeholder="e.g. Torrent Power" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">GSTIN Reference</label>
                          <Input value={cGst} onChange={e => setCGst(e.target.value)} placeholder="e.g. 24AAACT4412M1ZN" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Contact Person</label>
                          <Input value={cContact} onChange={e => setCContact(e.target.value)} placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Email Address</label>
                          <Input type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} placeholder="john@acme.com" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold block text-indigo-600 font-bold">1. BILL TO ADDRESS (HQ Coordinates) *</label>
                        <textarea 
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                          value={cBillTo} 
                          onChange={e => setCBillTo(e.target.value)}
                          placeholder="Registered HQ Address for official tax invoicing..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold block text-green-600 font-bold">2. SHIP TO ADDRESS (Consignee Job Site) *</label>
                        <textarea 
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                          value={cShipTo} 
                          onChange={e => setCShipTo(e.target.value)}
                          placeholder="Factory delivery site location address..."
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddCustOpen(false)}>Cancel</Button>
                      <Button type="submit">Save Profile</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Customer ID</th>
                      <th className="pb-3 text-left">Company Name</th>
                      <th className="pb-3 text-left font-mono">GSTIN</th>
                      <th className="pb-3 text-left">Contact Point</th>
                      <th className="pb-3 text-left">Bill To HQ Address</th>
                      <th className="pb-3 text-left">Ship To Destination</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{c.id}</td>
                        <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">{c.name}</td>
                        <td className="py-3.5 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{c.gstin}</td>
                        <td className="py-3.5">
                          <p className="font-medium">{c.contact}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{c.email}</p>
                        </td>
                        <td className="py-3.5 text-xs text-slate-500 max-w-[150px] truncate" title={c.billToAddress}>{c.billToAddress}</td>
                        <td className="py-3.5 text-xs text-slate-500 max-w-[150px] truncate font-semibold" title={c.shipToAddress}>{c.shipToAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Rentals Manager */}
        <TabsContent value="rentals">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Rental Leases & Hirings</CardTitle>
              <CardDescription>Handles time-bound recurring equipment leases, rates, and active contract billing periods.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Contract ID</th>
                      <th className="pb-3 text-left">Client Leaseholder</th>
                      <th className="pb-3 text-left">Asset description</th>
                      <th className="pb-3 text-right">Rental Rate (INR)</th>
                      <th className="pb-3 text-left pl-6">Start Date</th>
                      <th className="pb-3 text-left">End Date</th>
                      <th className="pb-3 text-left">Billing Period</th>
                      <th className="pb-3 text-right">Lease Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {contracts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{c.id}</td>
                        <td className="py-3.5 font-bold">{c.customer}</td>
                        <td className="py-3.5 text-xs">{c.asset}</td>
                        <td className="py-3.5 text-right font-semibold text-indigo-600 dark:text-indigo-400 font-mono text-xs">{c.rate}</td>
                        <td className="py-3.5 pl-6 text-slate-500 text-xs font-mono">{c.start}</td>
                        <td className="py-3.5 text-slate-500 text-xs font-mono">{c.end}</td>
                        <td className="py-3.5 text-xs">{c.billingCycle}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant={c.status === 'Active' ? 'default' : 'secondary'} className={c.status === 'Active' ? 'text-green-600 border-green-200 bg-green-50' : 'text-slate-400'}>
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Order PO Linkage & Serial Tracker Arrays */}
        <TabsContent value="linkage">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Client PO Verification & Serial Tracking Arrays</CardTitle>
                <CardDescription>Bind manufacturing engineering files, product serial number databases, and invoice registers to the client Purchase Order.</CardDescription>
              </div>
              <Dialog open={isBindPoOpen} onOpenChange={setIsBindPoOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Bind PO Details</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                  <form onSubmit={handleBindPo}>
                    <DialogHeader>
                      <DialogTitle>Bind Client Purchase Order Details</DialogTitle>
                      <DialogDescription>Attach drawing references and product serial ranges to secure contract audit clearance.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-xs">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Select Invoice Reference</label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none"
                          value={bindInvoice}
                          onChange={e => setBindInvoice(e.target.value)}
                        >
                          {linkages.map(link => (
                            <option key={link.invoiceNo} value={link.invoiceNo}>{link.invoiceNo} - {link.customer}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Client PO Number</label>
                        <Input value={bindPoRef} onChange={e => setBindPoRef(e.target.value)} placeholder="e.g. PO/TORRENT/2026/991" required />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Engineering Drawing File Name</label>
                        <Input value={bindDwgFile} onChange={e => setBindDwgFile(e.target.value)} placeholder="e.g. DWG-TP-105-HEATER.pdf" required />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Manufactured Equipment Serial Array (Comma-separated)</label>
                        <Input value={bindSerials} onChange={e => setBindSerials(e.target.value)} placeholder="e.g. SMP-FILT-900A, SMP-FILT-900B" required />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsBindPoOpen(false)}>Cancel</Button>
                      <Button type="submit">Bind PO Details</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Invoice No</th>
                      <th className="pb-3 text-left">Billing Date</th>
                      <th className="pb-3 text-left">Client Company</th>
                      <th className="pb-3 text-left pl-6">Client PO Reference</th>
                      <th className="pb-3 text-left">Engineering File</th>
                      <th className="pb-3 text-left">Product Serial Array</th>
                      <th className="pb-3 text-right">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {linkages.map((link) => (
                      <tr key={link.invoiceNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{link.invoiceNo}</td>
                        <td className="py-3.5 text-slate-500 text-xs font-mono">{link.date}</td>
                        <td className="py-3.5 font-bold">{link.customer}</td>
                        <td className="py-3.5 pl-6 font-mono text-xs text-slate-800 dark:text-slate-200 font-semibold">{link.clientPoRef}</td>
                        <td className="py-3.5 text-xs text-slate-500">
                          {link.manufacturingFile !== 'Not Attached' ? (
                            <span className="inline-flex items-center text-xs text-blue-600 font-semibold gap-1">
                              <Paperclip className="w-3 h-3 text-blue-500" /> {link.manufacturingFile}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium italic">No Drawing Bound</span>
                          )}
                        </td>
                        <td className="py-3.5">
                          {link.serialArray.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {link.serialArray.map((ser, index) => (
                                <span key={index} className="inline-flex items-center text-[10px] font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                                  <Barcode className="w-2.5 h-2.5 mr-0.5 text-indigo-500" /> {ser}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Awaiting Serials</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <Badge variant={link.matchingStatus === 'Matched' ? 'default' : 'destructive'} className={
                            link.matchingStatus === 'Matched' 
                              ? 'text-green-600 border-green-200 bg-green-50/50' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }>
                            {link.matchingStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
