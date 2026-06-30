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
  FileText, Truck, Calendar, MapPin, Calculator, Plus, Eye, Send, CheckCircle2 
} from 'lucide-react';

export default function SupplyChainLogistics() {
  const [challans, setChallans] = useState([
    { id: 'CHL-1082', type: 'Returnable', item: 'Hydraulic Flushing Rig', qty: 1, customer: 'Reliance Industries', dispatchDate: '2026-06-25', expectedReturn: '2026-07-25', status: 'Deployed' },
    { id: 'CHL-1083', type: 'Non-Returnable', item: 'Transformer Oil (50 Drums)', qty: 50, customer: 'Torrent Power', dispatchDate: '2026-06-28', expectedReturn: 'N/A', status: 'Delivered' },
    { id: 'CHL-1084', type: 'Returnable', item: 'LPH Testing Calibration Kit', qty: 2, customer: 'Tata Power', dispatchDate: '2026-06-29', expectedReturn: '2026-07-15', status: 'Awaiting Return' }
  ]);

  const [fleet, setFleet] = useState([
    { id: 'FLT-01', transporter: 'Gujarat Cargo Carriers', vehicleNo: 'GJ-06-ZZ-4012', type: 'Over Dimensional (ODC)', driver: 'Sukhwinder Singh', phone: '+91 98210 xxxxx', status: 'In Transit' },
    { id: 'FLT-02', transporter: 'Vrindavan Logistics', vehicleNo: 'MH-12-QQ-9823', type: 'Regular (Open Body)', driver: 'Rakesh Patel', phone: '+91 88451 xxxxx', status: 'Available' },
    { id: 'FLT-03', transporter: 'Balaji Freight Movers', vehicleNo: 'GJ-03-AA-8819', type: 'Regular (Closed Box)', driver: 'Anil Vasava', phone: '+91 76002 xxxxx', status: 'Loading' }
  ]);

  const [gateLogs, setGateLogs] = useState([
    { id: 'GAT-8902', type: 'Outward', vehicleNo: 'GJ-06-ZZ-4012', driver: 'Sukhwinder Singh', timestamp: '2026-06-30 11:32 AM', passNo: 'GP-9018', status: 'Passed Gate' },
    { id: 'GAT-8903', type: 'Inward', vehicleNo: 'GJ-03-AA-8819', driver: 'Anil Vasava', timestamp: '2026-06-30 02:15 PM', passNo: 'GP-9019', status: 'Passed Gate' },
    { id: 'GAT-8904', type: 'Outward', vehicleNo: 'MH-12-QQ-9823', driver: 'Rakesh Patel', timestamp: '2026-06-30 04:55 PM', passNo: 'GP-9020', status: 'Inspecting' }
  ]);

  // E-Way Bill Engine Simulator States
  const [fromPin, setFromPin] = useState('390010'); // Vadodara
  const [toPin, setToPin] = useState('400701');   // Navi Mumbai
  const [vehicleInput, setVehicleInput] = useState('GJ-06-ZZ-4012');
  const [distance, setDistance] = useState<number | null>(null);
  const [ewayBillNo, setEwayBillNo] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form States for Challan
  const [isAddChallanOpen, setIsAddChallanOpen] = useState(false);
  const [challanType, setChallanType] = useState('Returnable');
  const [itemText, setItemText] = useState('');
  const [qtyVal, setQtyVal] = useState(1);
  const [clientName, setClientName] = useState('');

  const calculateEwayBill = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setTimeout(() => {
      // Fake math based on pins
      const calculatedDistance = Math.abs(Number(fromPin) - Number(toPin)) % 600 + 100;
      const billNo = `EWB-26-${Math.floor(100000000 + Math.random() * 900000000)}`;
      setDistance(calculatedDistance);
      setEwayBillNo(billNo);
      setIsSyncing(false);
    }, 1200);
  };

  const handleAddChallan = (e: React.FormEvent) => {
    e.preventDefault();
    const newChallan = {
      id: `CHL-${Math.floor(1000 + Math.random() * 9000)}`,
      type: challanType,
      item: itemText,
      qty: Number(qtyVal),
      customer: clientName,
      dispatchDate: new Date().toISOString().split('T')[0],
      expectedReturn: challanType === 'Returnable' ? new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] : 'N/A',
      status: 'Awaiting Dispatch'
    };
    setChallans([newChallan, ...challans]);
    setIsAddChallanOpen(false);
    setItemText('');
    setQtyVal(1);
    setClientName('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Supply Chain, Logistics & Gate Pass</h2>
        <p className="text-muted-foreground">Manage delivery challans, national e-Way Bill tax syncs, fleet registries, and gate traffic.</p>
      </div>

      <Tabs defaultValue="challan" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="challan"><FileText className="w-4 h-4 mr-2" /> Challan Registry</TabsTrigger>
          <TabsTrigger value="eway"><Calculator className="w-4 h-4 mr-2" /> e-Way Bill Automation</TabsTrigger>
          <TabsTrigger value="fleet"><Truck className="w-4 h-4 mr-2" /> Transporter & Fleet</TabsTrigger>
          <TabsTrigger value="gate"><Calendar className="w-4 h-4 mr-2" /> Gate Logs & Passes</TabsTrigger>
        </TabsList>

        {/* Tab 1: Challan Management */}
        <TabsContent value="challan">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Returnable & Non-Returnable Challans</CardTitle>
                <CardDescription>Document outward equipment or assets deployed at remote customer fabrication yards.</CardDescription>
              </div>
              <Dialog open={isAddChallanOpen} onOpenChange={setIsAddChallanOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Issue Challan</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                  <form onSubmit={handleAddChallan}>
                    <DialogHeader>
                      <DialogTitle>Create Outward Delivery Challan</DialogTitle>
                      <DialogDescription>Register goods or assets dispatched under local tax code declarations.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Challan Type</label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                          value={challanType}
                          onChange={e => setChallanType(e.target.value)}
                        >
                          <option value="Returnable">Returnable (Asset/Tool Deployment)</option>
                          <option value="Non-Returnable">Non-Returnable (Raw supply/oil)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Consignee Customer</label>
                        <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Tata Power Co" required />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-2">
                          <label className="text-sm font-medium">Item Description</label>
                          <Input value={itemText} onChange={e => setItemText(e.target.value)} placeholder="Hydraulic Rig / Oil Tank" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Quantity</label>
                          <Input type="number" value={qtyVal} onChange={e => setQtyVal(Number(e.target.value))} required />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddChallanOpen(false)}>Cancel</Button>
                      <Button type="submit">Issue Challan</Button>
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
                      <th className="pb-3 text-left">Challan No</th>
                      <th className="pb-3 text-left">Type</th>
                      <th className="pb-3 text-left">Consignee Customer</th>
                      <th className="pb-3 text-left">Dispatched Item</th>
                      <th className="pb-3 text-right">Qty</th>
                      <th className="pb-3 text-left pl-6">Issued Date</th>
                      <th className="pb-3 text-left">Exp. Return</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {challans.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 font-semibold text-xs text-primary">{c.id}</td>
                        <td className="py-3">
                          <Badge variant={c.type === 'Returnable' ? 'outline' : 'default'} className={c.type === 'Returnable' ? 'text-indigo-600 border-indigo-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}>
                            {c.type}
                          </Badge>
                        </td>
                        <td className="py-3 font-medium">{c.customer}</td>
                        <td className="py-3 text-xs">{c.item}</td>
                        <td className="py-3 text-right font-mono text-xs">{c.qty}</td>
                        <td className="py-3 pl-6 text-slate-500 text-xs">{c.dispatchDate}</td>
                        <td className="py-3 text-slate-500 text-xs font-mono">{c.expectedReturn}</td>
                        <td className="py-3 text-right">
                          <Badge variant={c.status === 'Deployed' ? 'secondary' : c.status === 'Delivered' ? 'default' : 'outline'}>
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

        {/* Tab 2: E-Way Bill Automation */}
        <TabsContent value="eway">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>NIC e-Way Bill Router</CardTitle>
                <CardDescription>Direct linkage simulator with national taxation e-Way portal API networks.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={calculateEwayBill} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source Pin Code</label>
                    <Input value={fromPin} onChange={e => setFromPin(e.target.value)} placeholder="390010" maxLength={6} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Destination Pin Code</label>
                    <Input value={toPin} onChange={e => setToPin(e.target.value)} placeholder="400701" maxLength={6} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Transport Vehicle ID</label>
                    <Input value={vehicleInput} onChange={e => setVehicleInput(e.target.value)} placeholder="GJ-06-ZZ-4012" required />
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={isSyncing}>
                    {isSyncing ? 'Syncing Tax Portal...' : 'Calculate Distance & Sync'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>e-Way Bill Details & Distance Matrix</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center h-full min-h-[250px]">
                {distance && ewayBillNo ? (
                  <div className="space-y-6 w-full">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg border">
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Estimated Distance</span>
                        <span className="text-2xl font-bold text-primary">{distance} Kilometers</span>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg border">
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">NIC System Sync Code</span>
                        <span className="text-lg font-mono font-bold text-green-600 dark:text-green-400">{ewayBillNo}</span>
                      </div>
                    </div>
                    <div className="p-4 border border-dashed rounded-lg bg-green-50/20 text-sm space-y-2">
                      <p className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-600" /> Active Supply Route Synchronized
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">
                        The vehicle {vehicleInput} is authorized to clear state checks for a total travel validity window of 3 days. Distance matrix automatically logged.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-10">
                    <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-2 animate-bounce" />
                    <p className="text-sm">Input source/destination pins and request router calculation.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Transporter Fleet */}
        <TabsContent value="fleet">
          <Card>
            <CardHeader>
              <CardTitle>Transporter Directory & Fleet Registry</CardTitle>
              <CardDescription>Registry of third-party logistics firms, registered configurations (Regular vs. Over Dimensional), and driver details.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Fleet ID</th>
                      <th className="pb-3 text-left">Transporter Firm</th>
                      <th className="pb-3 text-left">Vehicle No</th>
                      <th className="pb-3 text-left">Vehicle Category</th>
                      <th className="pb-3 text-left">Assigned Driver</th>
                      <th className="pb-3 text-left">Driver Contact</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {fleet.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{f.id}</td>
                        <td className="py-3.5 font-medium">{f.transporter}</td>
                        <td className="py-3.5 font-mono text-xs">{f.vehicleNo}</td>
                        <td className="py-3.5">
                          <Badge variant="outline" className={f.type.includes('ODC') ? 'text-amber-600 border-amber-200' : 'text-slate-500'}>
                            {f.type}
                          </Badge>
                        </td>
                        <td className="py-3.5 font-medium">{f.driver}</td>
                        <td className="py-3.5 font-mono text-xs">{f.phone}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant={f.status === 'Available' ? 'default' : 'secondary'}>
                            {f.status}
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

        {/* Tab 4: Gate Logs */}
        <TabsContent value="gate">
          <Card>
            <CardHeader>
              <CardTitle>Gate Pass Operations & Yard Traffic Logs</CardTitle>
              <CardDescription>Monitors outward and inward physical stock crossing the main gate boundaries.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Gate Log ID</th>
                      <th className="pb-3 text-left">Traffic Type</th>
                      <th className="pb-3 text-left">Vehicle Registry</th>
                      <th className="pb-3 text-left">Driver Name</th>
                      <th className="pb-3 text-left">Gate Pass Reference</th>
                      <th className="pb-3 text-left">Gate Timestamp</th>
                      <th className="pb-3 text-right">Yard Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {gateLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{log.id}</td>
                        <td className="py-3.5">
                          <Badge variant={log.type === 'Inward' ? 'outline' : 'default'} className={log.type === 'Inward' ? 'text-green-600 border-green-200 bg-green-50' : 'bg-blue-600 text-white'}>
                            {log.type}
                          </Badge>
                        </td>
                        <td className="py-3.5 font-mono text-xs">{log.vehicleNo}</td>
                        <td className="py-3.5 font-medium">{log.driver}</td>
                        <td className="py-3.5 font-mono text-xs text-primary">{log.passNo}</td>
                        <td className="py-3.5 text-slate-500 text-xs font-mono">{log.timestamp}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant={log.status === 'Passed Gate' ? 'default' : 'secondary'}>
                            {log.status}
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
