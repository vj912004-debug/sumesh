import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Scale, Plus, Printer, Search, Download } from 'lucide-react';

const mockSlips = [
  { id: '1', slipNo: 'WB-9821', vehicleNo: 'GJ-06-ZZ-4012', driver: 'Rakesh Patel', material: 'Steel Plates', gross: 28400, tare: 12100, net: 16300, date: '2026-06-30' },
  { id: '2', slipNo: 'WB-9822', vehicleNo: 'MH-12-QQ-9823', driver: 'Sukhwinder Singh', material: 'Flanges & Rings', gross: 18200, tare: 8900, net: 9300, date: '2026-06-30' },
  { id: '3', slipNo: 'WB-9823', vehicleNo: 'GJ-03-AA-8819', driver: 'Anil Vasava', material: 'CNC Cut Profile Scrap', gross: 9100, tare: 5400, net: 3700, date: '2026-06-29' },
  { id: '4', slipNo: 'WB-9824', vehicleNo: 'GJ-06-XX-1120', driver: 'Karan Sharma', material: 'Raw Plates (Mild Steel)', gross: 42100, tare: 14200, net: 27900, date: '2026-06-28' },
];

export default function WeighBridge() {
  const [slips, setSlips] = useState(mockSlips);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Form states
  const [vehicleNo, setVehicleNo] = useState('');
  const [driver, setDriver] = useState('');
  const [material, setMaterial] = useState('');
  const [gross, setGross] = useState('');
  const [tare, setTare] = useState('');

  const handleCreateSlip = (e: React.FormEvent) => {
    e.preventDefault();
    const g = Number(gross);
    const t = Number(tare);
    const n = g - t;

    const newSlip = {
      id: String(slips.length + 1),
      slipNo: `WB-${Math.floor(9000 + Math.random() * 999)}`,
      vehicleNo,
      driver,
      material,
      gross: g,
      tare: t,
      net: n,
      date: new Date().toISOString().split('T')[0]
    };

    setSlips([newSlip, ...slips]);
    setIsDialogOpen(false);
    
    // Clear form
    setVehicleNo('');
    setDriver('');
    setMaterial('');
    setGross('');
    setTare('');
  };

  const filteredSlips = slips.filter(s => 
    s.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.material.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-sans">Weigh Bridge Logs</h2>
          <p className="text-muted-foreground">Record and manage gross, tare, and net weights for dispatch trucks.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Log Weighment Slip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Create Weighment Slip</DialogTitle>
              <DialogDescription>
                Input manual or scale readings for the incoming/outgoing truck.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSlip} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Registration Number</label>
                <Input value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} placeholder="GJ-06-XX-0000" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Driver Name</label>
                <Input value={driver} onChange={e => setDriver(e.target.value)} placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Material Description</label>
                <Input value={material} onChange={e => setMaterial(e.target.value)} placeholder="e.g. Mild Steel Plates / MS Scrap" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gross Weight (kg)</label>
                  <Input type="number" value={gross} onChange={e => setGross(e.target.value)} placeholder="28000" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tare Weight (kg)</label>
                  <Input type="number" value={tare} onChange={e => setTare(e.target.value)} placeholder="12000" required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Generate Slip
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Active Slips Today', value: '14 Slips', onClick: () => notify('Showing today\'s weighment slips') },
          { label: 'Net Weight Dispatched', value: '57.2 Tons', onClick: () => notify('Dispatch weight summary exported') },
          { label: 'Average Tare Time', value: '18 mins', onClick: () => notify('Tare time analytics opened') },
        ].map(card => (
          <button
            key={card.label}
            type="button"
            onClick={card.onClick}
            className="rounded-xl border bg-card text-card-foreground shadow-sm text-left p-6 cursor-pointer transition-all hover:shadow-md hover:border-primary/40"
          >
            <div className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{card.label}</span>
              <Scale className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold tracking-tight pt-1">{card.value}</div>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b border-zinc-100 flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-medium text-zinc-800">Weighment Slips Directory</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search vehicle or driver..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              const csv = 'Slip No,Vehicle,Driver,Material,Gross,Tare,Net,Date\n' +
                filteredSlips.map(s => `${s.slipNo},${s.vehicleNo},${s.driver},${s.material},${s.gross},${s.tare},${s.net},${s.date}`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'weighbridge_slips.csv';
              a.click();
              notify(`Exported ${filteredSlips.length} slips.`);
            }}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-zinc-400 font-semibold text-xs uppercase tracking-wider pb-3">
                  <th className="pb-3 text-left">Slip No</th>
                  <th className="pb-3 text-left">Vehicle No</th>
                  <th className="pb-3 text-left">Driver</th>
                  <th className="pb-3 text-left">Material</th>
                  <th className="pb-3 text-right">Gross (kg)</th>
                  <th className="pb-3 text-right">Tare (kg)</th>
                  <th className="pb-3 text-right">Net (kg)</th>
                  <th className="pb-3 text-left pl-6">Date</th>
                  <th className="pb-3 text-right">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y text-zinc-700">
                {filteredSlips.map(s => (
                  <tr key={s.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 font-medium text-xs">{s.slipNo}</td>
                    <td className="py-3.5 font-mono text-xs">{s.vehicleNo}</td>
                    <td className="py-3.5">{s.driver}</td>
                    <td className="py-3.5 text-xs">{s.material}</td>
                    <td className="py-3.5 text-right">{s.gross.toLocaleString()}</td>
                    <td className="py-3.5 text-right">{s.tare.toLocaleString()}</td>
                    <td className="py-3.5 text-right font-semibold text-primary">{s.net.toLocaleString()}</td>
                    <td className="py-3.5 pl-6 text-xs">{s.date}</td>
                    <td className="py-3.5 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900" onClick={() => { notify(`Printing slip ${s.slipNo}`); window.print(); }}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
