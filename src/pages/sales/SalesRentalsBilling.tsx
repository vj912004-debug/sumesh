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
  Plus, Search, Users, Calendar, Link, Clipboard, ShieldCheck, Mail 
} from 'lucide-react';

export default function SalesRentalsBilling() {
  const [customers, setCustomers] = useState([
    { id: 'CUST-001', name: 'Reliance Industries Ltd', contact: 'Ketan Shah', email: 'kshah@ril.com', gstin: '24AAACR8821B1Z2', address: 'Jamanagar Refinery, Gujarat', billingAddress: 'Maker Chambers, Nariman Point, Mumbai' },
    { id: 'CUST-002', name: 'Tata Power Company', contact: 'M. Vasudevan', email: 'mvasu@tatapower.com', gstin: '27AAACT9012K1Z9', address: 'Trombay Thermal Station, Mumbai', billingAddress: 'Carnac Bunder, Mumbai' },
    { id: 'CUST-003', name: 'Torrent Power Ltd', contact: 'Amit Vyas', email: 'avyas@torrent.com', gstin: '24AAACT4412M1ZN', address: 'Sabarmati Power House, Ahmedabad', billingAddress: 'Sola Road, Ahmedabad' }
  ]);

  const [contracts, setContracts] = useState([
    { id: 'RNT-201', customer: 'Reliance Industries Ltd', asset: '50000 Litre Storage Tank', rate: '₹45,000 / month', start: '2026-01-01', end: '2026-12-31', billingCycle: 'Monthly', status: 'Active' },
    { id: 'RNT-202', customer: 'Torrent Power Ltd', asset: 'High Vacuum Filtration Rig (6000LPH)', rate: '₹1,20,000 / month', start: '2026-05-15', end: '2026-08-15', billingCycle: 'Monthly', status: 'Active' },
    { id: 'RNT-203', customer: 'Tata Power Company', asset: 'Mobile Oil Trailer', rate: '₹25,000 / month', start: '2026-03-01', end: '2026-06-30', billingCycle: 'Quarterly', status: 'Expired' }
  ]);

  const [linkages, setLinkages] = useState([
    { invoiceNo: 'INV-26-004', date: '2026-06-28', customer: 'Tata Power Company', amount: '₹14,50,000', clientPoRef: 'PO/TP/2026/044', challanRef: 'CHL-1084', matchingStatus: 'Matched' },
    { invoiceNo: 'INV-26-005', date: '2026-06-30', customer: 'Reliance Industries Ltd', amount: '₹22,00,000', clientPoRef: 'PO/RIL-VAD/982', challanRef: 'CHL-1082', matchingStatus: 'Matched' },
    { invoiceNo: 'INV-26-006', date: '2026-06-30', customer: 'Torrent Power Ltd', amount: '₹1,80,000', clientPoRef: 'Awaiting PO Release', challanRef: 'CHL-1083', matchingStatus: 'PO Pending' }
  ]);

  // Form States
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  const [cName, setCName] = useState('');
  const [cContact, setCContact] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cGst, setCGst] = useState('');
  const [cAddress, setCAddress] = useState('');

  const handleAddCust = (e: React.FormEvent) => {
    e.preventDefault();
    const newCust = {
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      name: cName,
      contact: cContact,
      email: cEmail,
      gstin: cGst || 'Unregistered',
      address: cAddress,
      billingAddress: cAddress
    };
    setCustomers([...customers, newCust]);
    setIsAddCustOpen(false);
    setCName('');
    setCContact('');
    setCEmail('');
    setCGst('');
    setCAddress('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sales, Rentals & Billing</h2>
        <p className="text-muted-foreground">Manage client directories, time-bound rental lease agreements, and order-to-invoice PO matching logs.</p>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="customers"><Users className="w-4 h-4 mr-2" /> Customers & Consignees</TabsTrigger>
          <TabsTrigger value="rentals"><Calendar className="w-4 h-4 mr-2" /> Service & Rental Leases</TabsTrigger>
          <TabsTrigger value="linkage"><Link className="w-4 h-4 mr-2" /> PO & Invoice Linkage</TabsTrigger>
        </TabsList>

        {/* Tab 1: Customer Database */}
        <TabsContent value="customers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Client Registry Profiles</CardTitle>
                <CardDescription>Billing coordinates, dispatch destinations, and regional GSTIN registries.</CardDescription>
              </div>
              <Dialog open={isAddCustOpen} onOpenChange={setIsAddCustOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Client</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handleAddCust}>
                    <DialogHeader>
                      <DialogTitle>Register Customer / Consignee</DialogTitle>
                      <DialogDescription>Setup statutory billing profiles and shipping addresses.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Company Name</label>
                          <Input value={cName} onChange={e => setCName(e.target.value)} placeholder="Acme Ltd" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Regional GSTIN</label>
                          <Input value={cGst} onChange={e => setCGst(e.target.value)} placeholder="24AAAAA0000A1Z1" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Contact Person</label>
                          <Input value={cContact} onChange={e => setCContact(e.target.value)} placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email Address</label>
                          <Input type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} placeholder="john@acme.com" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Registered Address (Billing/Shipping)</label>
                        <textarea 
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                          value={cAddress} 
                          onChange={e => setCAddress(e.target.value)}
                          placeholder="Registered company address details..."
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
                      <th className="pb-3 text-left">Contact Name</th>
                      <th className="pb-3 text-left">Email Address</th>
                      <th className="pb-3 text-left font-mono">GSTIN</th>
                      <th className="pb-3 text-left">Billing HQ Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 font-semibold text-xs text-primary">{c.id}</td>
                        <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{c.name}</td>
                        <td className="py-3 font-medium">{c.contact}</td>
                        <td className="py-3 text-xs">{c.email}</td>
                        <td className="py-3 font-mono text-xs text-slate-500">{c.gstin}</td>
                        <td className="py-3 text-xs truncate max-w-xs">{c.billingAddress}</td>
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
              <CardTitle>Equipment Rental & Service Contracts</CardTitle>
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

        {/* Tab 3: PO Linkage */}
        <TabsContent value="linkage">
          <Card>
            <CardHeader>
              <CardTitle>PO to Invoice Linkage Register</CardTitle>
              <CardDescription>Links outward invoices back to original client Purchase Orders and delivery challan histories.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Invoice No</th>
                      <th className="pb-3 text-left">Billing Date</th>
                      <th className="pb-3 text-left">Customer</th>
                      <th className="pb-3 text-right">Total Amount</th>
                      <th className="pb-3 text-left pl-6">Client PO Reference</th>
                      <th className="pb-3 text-left">Challan Ref</th>
                      <th className="pb-3 text-right">Match Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {linkages.map((link) => (
                      <tr key={link.invoiceNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{link.invoiceNo}</td>
                        <td className="py-3.5 text-slate-500 text-xs font-mono">{link.date}</td>
                        <td className="py-3.5 font-medium">{link.customer}</td>
                        <td className="py-3.5 text-right font-semibold font-mono text-xs">{link.amount}</td>
                        <td className="py-3.5 pl-6 font-mono text-xs text-slate-800 dark:text-slate-200 font-semibold">{link.clientPoRef}</td>
                        <td className="py-3.5 font-mono text-xs text-primary">{link.challanRef}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant={link.matchingStatus === 'Matched' ? 'default' : 'destructive'} className={link.matchingStatus === 'Matched' ? 'text-green-600 border-green-200 bg-green-50' : 'bg-red-50 text-red-700 border-red-200'}>
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
