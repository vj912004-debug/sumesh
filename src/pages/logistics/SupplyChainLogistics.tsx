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
  FileText, Truck, Calendar, MapPin, Calculator, Plus, Eye, Send, CheckCircle2, QrCode
} from 'lucide-react';

interface Challan {
  id: string;
  type: string;
  item: string;
  qty: number;
  customer: string;
  dispatchDate: string;
  expectedReturn: string;
  status: string;
  ewayBillNo?: string;
  vehicleNo?: string;
}

interface Fleet {
  id: string;
  transporter: string;
  vehicleNo: string;
  type: string;
  driver: string;
  phone: string;
  status: string;
}

interface GateLog {
  id: string;
  type: 'Inward' | 'Outward';
  vehicleNo: string;
  driver: string;
  timestamp: string;
  passNo: string;
  challanRef: string;
  transitDistance: number; // KM
  status: string;
}

export default function SupplyChainLogistics() {
  const [challans, setChallans] = useState<Challan[]>([
    { id: 'CHL-1082', type: 'Returnable', item: 'Hydraulic Flushing Rig', qty: 1, customer: 'Reliance Industries', dispatchDate: '2026-06-25', expectedReturn: '2026-07-25', status: 'Deployed', ewayBillNo: 'EWB-26-881920381', vehicleNo: 'GJ-06-ZZ-4012' },
    { id: 'CHL-1083', type: 'Non-Returnable', item: 'Transformer Oil (50 Drums)', qty: 50, customer: 'Torrent Power', dispatchDate: '2026-06-28', expectedReturn: 'N/A', status: 'Delivered', ewayBillNo: 'EWB-26-921820471', vehicleNo: 'GJ-03-AA-8819' },
    { id: 'CHL-1084', type: 'Returnable', item: 'LPH Testing Calibration Kit', qty: 2, customer: 'Tata Power', dispatchDate: '2026-06-29', expectedReturn: '2026-07-15', status: 'Awaiting Return', ewayBillNo: 'Pending Sync', vehicleNo: 'MH-12-QQ-9823' }
  ]);

  const [fleet, setFleet] = useState<Fleet[]>([
    { id: 'FLT-01', transporter: 'Gujarat Cargo Carriers', vehicleNo: 'GJ-06-ZZ-4012', type: 'Over Dimensional (ODC)', driver: 'Sukhwinder Singh', phone: '+91 98210 xxxxx', status: 'In Transit' },
    { id: 'FLT-02', transporter: 'Vrindavan Logistics', vehicleNo: 'MH-12-QQ-9823', type: 'Regular (Open Body)', driver: 'Rakesh Patel', phone: '+91 88451 xxxxx', status: 'Available' },
    { id: 'FLT-03', transporter: 'Balaji Freight Movers', vehicleNo: 'GJ-03-AA-8819', type: 'Regular (Closed Box)', driver: 'Anil Vasava', phone: '+91 76002 xxxxx', status: 'Loading' }
  ]);

  const [gateLogs, setGateLogs] = useState<GateLog[]>([
    { id: 'GAT-8902', type: 'Outward', vehicleNo: 'GJ-06-ZZ-4012', driver: 'Sukhwinder Singh', timestamp: '2026-06-30 11:32 AM', passNo: 'GP-9018', challanRef: 'CHL-1082', transitDistance: 420, status: 'Passed Gate' },
    { id: 'GAT-8903', type: 'Inward', vehicleNo: 'GJ-03-AA-8819', driver: 'Anil Vasava', timestamp: '2026-06-30 02:15 PM', passNo: 'GP-9019', challanRef: 'CHL-1083', transitDistance: 120, status: 'Passed Gate' },
    { id: 'GAT-8904', type: 'Outward', vehicleNo: 'MH-12-QQ-9823', driver: 'Rakesh Patel', timestamp: '2026-06-30 04:55 PM', passNo: 'GP-9020', challanRef: 'CHL-1084', transitDistance: 280, status: 'Inspecting' }
  ]);

  // E-Way Bill Engine Simulator States
  const [fromPin, setFromPin] = useState('390010'); // Vadodara GIDC
  const [toPin, setToPin] = useState('400701');   // Client Site
  const [vehicleInput, setVehicleInput] = useState('GJ-06-ZZ-4012');
  const [transporterInput, setTransporterInput] = useState('Gujarat Cargo Carriers');
  const [selectedChallanId, setSelectedChallanId] = useState<string>('CHL-1084');
  const [distance, setDistance] = useState<number | null>(null);
  const [ewayBillNo, setEwayBillNo] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEwayOpen, setIsEwayOpen] = useState(false);

  // Form States for Challan
  const [isAddChallanOpen, setIsAddChallanOpen] = useState(false);
  const [challanType, setChallanType] = useState('Returnable');
  const [itemText, setItemText] = useState('');
  const [qtyVal, setQtyVal] = useState(1);
  const [clientName, setClientName] = useState('');
  const [assignedVehicle, setAssignedVehicle] = useState('GJ-06-ZZ-4012');

  // Form States for Gate Log
  const [isAddGateLogOpen, setIsAddGateLogOpen] = useState(false);
  const [gateLogType, setGateLogType] = useState<'Inward' | 'Outward'>('Outward');
  const [gateVehicle, setGateVehicle] = useState('');
  const [gateDriver, setGateDriver] = useState('');
  const [gateChallan, setGateChallan] = useState('');
  const [gateDistance, setGateDistance] = useState('350');

  const triggerEwayRoute = (challanId: string, client: string, vehicle?: string) => {
    setSelectedChallanId(challanId);
    setVehicleInput(vehicle || 'GJ-06-ZZ-4012');
    // Pre-fill pin based on client name
    if (client.includes('Reliance')) setToPin('396195'); // Jamnagar
    else if (client.includes('Tata')) setToPin('400074');      // Mumbai
    else setToPin('380009'); // Ahmedabad
    setDistance(null);
    setEwayBillNo(null);
    setIsEwayOpen(true);
  };

  const calculateEwayBill = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setTimeout(() => {
      const calculatedDistance = Math.abs(Number(fromPin) - Number(toPin)) % 600 + 100;
      const billNo = `EWB-26-${Math.floor(100000000 + Math.random() * 900000000)}`;
      setDistance(calculatedDistance);
      setEwayBillNo(billNo);
      setIsSyncing(false);

      // Update the eway bill in the table
      setChallans(prev => prev.map(c => 
        c.id === selectedChallanId ? { ...c, ewayBillNo: billNo } : c
      ));

      // Append to Gate Logs automatically
      const newGate: GateLog = {
        id: `GAT-${Math.floor(8905 + Math.random() * 100)}`,
        type: 'Outward',
        vehicleNo: vehicleInput,
        driver: fleet.find(f => f.vehicleNo === vehicleInput)?.driver || 'Transporter Driver',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        passNo: `GP-${Math.floor(9021 + Math.random() * 100)}`,
        challanRef: selectedChallanId,
        transitDistance: calculatedDistance,
        status: 'Inspecting'
      };
      setGateLogs(prev => [newGate, ...prev]);

    }, 1200);
  };

  const handleAddChallan = (e: React.FormEvent) => {
    e.preventDefault();
    const newChallan: Challan = {
      id: `CHL-${Math.floor(1085 + Math.random() * 100)}`,
      type: challanType,
      item: itemText,
      qty: Number(qtyVal),
      customer: clientName,
      dispatchDate: new Date().toISOString().split('T')[0],
      expectedReturn: challanType === 'Returnable' ? new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] : 'N/A',
      status: 'Awaiting Dispatch',
      ewayBillNo: 'Pending Sync',
      vehicleNo: assignedVehicle
    };
    setChallans([newChallan, ...challans]);
    setIsAddChallanOpen(false);
    setItemText('');
    setQtyVal(1);
    setClientName('');
  };

  const handleAddGateLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: GateLog = {
      id: `GAT-${Math.floor(8905 + Math.random() * 100)}`,
      type: gateLogType,
      vehicleNo: gateVehicle,
      driver: gateDriver,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      passNo: `GP-${Math.floor(9021 + Math.random() * 100)}`,
      challanRef: gateChallan,
      transitDistance: Number(gateDistance),
      status: 'Passed Gate'
    };
    setGateLogs([newLog, ...gateLogs]);
    setIsAddGateLogOpen(false);
    setGateVehicle('');
    setGateDriver('');
    setGateChallan('');
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
          <TabsTrigger value="fleet"><Truck className="w-4 h-4 mr-2" /> Transporter & Fleet</TabsTrigger>
          <TabsTrigger value="gate"><Calendar className="w-4 h-4 mr-2" /> Gate Logs & Passes</TabsTrigger>
        </TabsList>

        {/* Tab 1: Challan Management */}
        <TabsContent value="challan">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Delivery Challan & Dispatch Compliance</CardTitle>
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
                    <div className="space-y-4 py-4 text-xs">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Challan Type</label>
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
                        <label className="text-sm font-semibold">Consignee Customer</label>
                        <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Reliance Industries" required />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-2">
                          <label className="text-sm font-semibold">Item Description</label>
                          <Input value={itemText} onChange={e => setItemText(e.target.value)} placeholder="Hydraulic Rig / Oil Tank" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Quantity</label>
                          <Input type="number" value={qtyVal} onChange={e => setQtyVal(Number(e.target.value))} required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Assign Transporter Vehicle</label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                          value={assignedVehicle}
                          onChange={e => setAssignedVehicle(e.target.value)}
                        >
                          {fleet.map(f => (
                            <option key={f.id} value={f.vehicleNo}>{f.transporter} - {f.vehicleNo}</option>
                          ))}
                        </select>
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
                    <tr className="border-b text-zinc-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Challan No</th>
                      <th className="pb-3 text-left">Type</th>
                      <th className="pb-3 text-left">Consignee Customer</th>
                      <th className="pb-3 text-left">Dispatched Item</th>
                      <th className="pb-3 text-right">Qty</th>
                      <th className="pb-3 text-left pl-6">Vehicle No</th>
                      <th className="pb-3 text-left">e-Way Bill No</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-zinc-700 dark:text-zinc-300">
                    {challans.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 font-semibold text-xs text-primary">{c.id}</td>
                        <td className="py-3">
                          <Badge variant={c.type === 'Returnable' ? 'outline' : 'default'} className={c.type === 'Returnable' ? 'text-cyan-600 border-orange-200 bg-orange-50/20' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}>
                            {c.type}
                          </Badge>
                        </td>
                        <td className="py-3 font-bold">{c.customer}</td>
                        <td className="py-3 text-xs">{c.item}</td>
                        <td className="py-3 text-right font-mono text-xs">{c.qty}</td>
                        <td className="py-3 pl-6 font-mono text-xs text-zinc-500">{c.vehicleNo || '-'}</td>
                        <td className="py-3">
                          {c.ewayBillNo && c.ewayBillNo !== 'Pending Sync' ? (
                            <Badge className="bg-green-500 text-white font-mono text-[10px]">{c.ewayBillNo}</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-teal-600 bg-teal-50">Pending Sync</Badge>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {(!c.ewayBillNo || c.ewayBillNo === 'Pending Sync') ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs border-teal-200 text-teal-600 hover:bg-teal-50"
                              onClick={() => triggerEwayRoute(c.id, c.customer, c.vehicleNo)}
                            >
                              <Calculator className="w-3 h-3 mr-1" /> Generate E-Way
                            </Button>
                          ) : (
                            <span className="text-green-600 text-xs font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Transporter Fleet */}
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
                    <tr className="border-b text-zinc-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Fleet ID</th>
                      <th className="pb-3 text-left">Transporter Firm</th>
                      <th className="pb-3 text-left">Vehicle No</th>
                      <th className="pb-3 text-left">Vehicle Category</th>
                      <th className="pb-3 text-left">Assigned Driver</th>
                      <th className="pb-3 text-left">Driver Contact</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-zinc-700 dark:text-zinc-300">
                    {fleet.map((f) => (
                      <tr key={f.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{f.id}</td>
                        <td className="py-3.5 font-bold">{f.transporter}</td>
                        <td className="py-3.5 font-mono text-xs">{f.vehicleNo}</td>
                        <td className="py-3.5">
                          <Badge variant="outline" className={f.type.includes('ODC') ? 'text-teal-600 border-teal-200 bg-teal-50/20' : 'text-zinc-500'}>
                            {f.type}
                          </Badge>
                        </td>
                        <td className="py-3.5 font-medium">{f.driver}</td>
                        <td className="py-3.5 font-mono text-xs">{f.phone}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant={f.status === 'Available' ? 'default' : 'secondary'} className={f.status === 'Available' ? 'bg-green-100 text-green-800' : ''}>
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

        {/* Tab 3: Gate Logs & Transit Distances */}
        <TabsContent value="gate">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gate Pass Operations & Yard Traffic Logs</CardTitle>
                <CardDescription>Monitors outward and inward physical stock crossing the main gate boundaries, tracking transit distances.</CardDescription>
              </div>
              <Dialog open={isAddGateLogOpen} onOpenChange={setIsAddGateLogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Log Gate Entry</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                  <form onSubmit={handleAddGateLog}>
                    <DialogHeader>
                      <DialogTitle>Log New Vehicle In/Out at Gate</DialogTitle>
                      <DialogDescription>Input vehicle registration details and gate pass records.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Traffic Type</label>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                            value={gateLogType} 
                            onChange={e => setGateLogType(e.target.value as any)}
                          >
                            <option value="Outward">Outward (Dispatch)</option>
                            <option value="Inward">Inward (Receipt/Supplies)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Vehicle Number</label>
                          <Input value={gateVehicle} onChange={e => setGateVehicle(e.target.value)} placeholder="GJ-06-ZZ-4012" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Driver Name</label>
                          <Input value={gateDriver} onChange={e => setGateDriver(e.target.value)} placeholder="e.g. Ramesh Singh" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Challan Ref</label>
                          <Input value={gateChallan} onChange={e => setGateChallan(e.target.value)} placeholder="e.g. CHL-1084" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Approx Transit Distance (KM)</label>
                        <Input type="number" value={gateDistance} onChange={e => setGateDistance(e.target.value)} placeholder="350" required />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddGateLogOpen(false)}>Cancel</Button>
                      <Button type="submit">Submit Gate Log</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-zinc-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Gate Log ID</th>
                      <th className="pb-3 text-left">Traffic Type</th>
                      <th className="pb-3 text-left">Vehicle Registry</th>
                      <th className="pb-3 text-left">Driver Name</th>
                      <th className="pb-3 text-left">Challan Ref</th>
                      <th className="pb-3 text-left">Gate Pass Reference</th>
                      <th className="pb-3 text-right">Transit Distance</th>
                      <th className="pb-3 text-left pl-6">Gate Timestamp</th>
                      <th className="pb-3 text-right">Yard Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-zinc-700 dark:text-zinc-300">
                    {gateLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{log.id}</td>
                        <td className="py-3.5">
                          <Badge variant={log.type === 'Inward' ? 'outline' : 'default'} className={log.type === 'Inward' ? 'text-green-600 border-green-200 bg-green-50' : 'bg-teal-600 text-white'}>
                            {log.type}
                          </Badge>
                        </td>
                        <td className="py-3.5 font-mono text-xs font-bold">{log.vehicleNo}</td>
                        <td className="py-3.5 font-medium">{log.driver}</td>
                        <td className="py-3.5 font-mono text-xs">{log.challanRef}</td>
                        <td className="py-3.5 font-mono text-xs text-primary">{log.passNo}</td>
                        <td className="py-3.5 text-right font-mono text-xs text-cyan-600 dark:text-cyan-400 font-bold">{log.transitDistance} KM</td>
                        <td className="py-3.5 pl-6 text-zinc-500 text-xs font-mono">{log.timestamp}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant={log.status === 'Passed Gate' ? 'default' : 'secondary'} className={log.status === 'Passed Gate' ? 'bg-green-100 text-green-800' : ''}>
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

      {/* NIC e-Way Bill Router Dialog */}
      <Dialog open={isEwayOpen} onOpenChange={setIsEwayOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={calculateEwayBill}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-teal-500 animate-pulse" /> NIC e-Way Bill Portal Linkage
              </DialogTitle>
              <DialogDescription>
                Synchronize dispatch details directly with the national taxation network to authorize transport logistics.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs border-t border-b my-3">
              <div className="p-3 bg-teal-50 rounded-lg text-teal-700 space-y-1">
                <p className="font-bold">Consigner (From Address):</p>
                <p>Sumesh Petroleum Ltd, 226-227, G.I.D.C Makarpura, Vadodara (GSTIN: 24U29309GJ2018PTC102237)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-zinc-500">Source Pin Code</label>
                  <Input value={fromPin} onChange={e => setFromPin(e.target.value)} maxLength={6} required />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-zinc-500">Destination Pin Code</label>
                  <Input value={toPin} onChange={e => setToPin(e.target.value)} maxLength={6} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-zinc-500">Carrier Transporter</label>
                  <Input value={transporterInput} onChange={e => setTransporterInput(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-zinc-500">Carrier Vehicle ID</label>
                  <Input value={vehicleInput} onChange={e => setVehicleInput(e.target.value)} required />
                </div>
              </div>

              {distance && ewayBillNo && (
                <div className="p-3 bg-green-50 rounded-lg text-green-700 space-y-1 text-xs border border-green-200">
                  <p className="font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-600" /> Government Sync Complete!</p>
                  <p>Generated e-Way Bill Code: <span className="font-mono font-bold text-zinc-900">{ewayBillNo}</span></p>
                  <p>NIC Calculated Distance: <span className="font-bold text-zinc-900">{distance} Kilometers</span></p>
                  <p className="text-[10px] text-green-600 font-medium">Valid for single transit journey. State border check clearances updated.</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEwayOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSyncing}>
                {isSyncing ? 'Linking NIC Gateway...' : (ewayBillNo ? 'Close & Update' : 'Establish Route & Issue e-Way')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
