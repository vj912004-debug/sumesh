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
  FileText, Activity, ShieldCheck, Award, Zap, Sliders, CheckCircle2, AlertCircle, Plus, Clipboard, Beaker, Check, ShieldAlert
} from 'lucide-react';

interface FatLog {
  id: string;
  drawingNo: string;
  asPerDrawing: string; // Target tolerance
  obtainedValue: string; // Measured dimension
  tolerance: string;
  inspector: string;
  status: 'Passed' | 'Failed';
  date: string;
}

interface PowerLog {
  id: string;
  equipment: string;
  phase: 'Single-Phase' | 'Three-Phase';
  voltage: number; // Volts
  ampsArray: number[]; // [R, Y, B] for 3-phase, [Phase] for 1-phase
  powerFactor: number;
  rpm: number | 'N/A';
  status: 'Stable' | 'High Load' | 'Imbalance';
}

interface ChemicalLog {
  id: string;
  sampleNo: string;
  preBdv: number; // kV
  postBdv: number; // kV
  preMoisture: number; // ppm
  postMoisture: number; // ppm
  preGas: number; // %
  postGas: number; // %
  status: 'Cleared' | 'Failed';
}

export default function QualityManagement() {
  const [fatLogs, setFatLogs] = useState<FatLog[]>([
    { id: 'FAT-892', drawingNo: 'DWG-TP-102', asPerDrawing: '2500x6000x16 mm', tolerance: '±0.5mm', obtainedValue: '2500.2x6000.1x16.0 mm', inspector: 'Hitesh Amin', status: 'Passed', date: '2026-06-30' },
    { id: 'FAT-893', drawingNo: 'DWG-RP-921', asPerDrawing: '1500x3000x10 mm', tolerance: '±0.3mm', obtainedValue: '1500.4x3000.2x10.1 mm', inspector: 'Ramesh Patel', status: 'Passed', date: '2026-06-29' },
    { id: 'FAT-894', drawingNo: 'DWG-FL-402', asPerDrawing: 'OD 600, ID 400 mm', tolerance: '±0.2mm', obtainedValue: 'OD 600.5, ID 399.9 mm', inspector: 'Hitesh Amin', status: 'Failed', date: '2026-06-28' }
  ]);

  const [powerLogs, setPowerLogs] = useState<PowerLog[]>([
    { id: 'PWR-71', equipment: 'Vacuum Pump Motor 15HP', phase: 'Three-Phase', voltage: 415, ampsArray: [21.5, 21.8, 22.1], powerFactor: 0.86, rpm: 1440, status: 'Stable' },
    { id: 'PWR-72', equipment: 'Oil Circulation Pump 5HP', phase: 'Three-Phase', voltage: 412, ampsArray: [7.2, 7.5, 7.3], powerFactor: 0.84, rpm: 2880, status: 'Stable' },
    { id: 'PWR-73', equipment: 'Degassing Chamber Heater 30kW', phase: 'Single-Phase', voltage: 230, ampsArray: [43.1], powerFactor: 0.98, rpm: 'N/A', status: 'High Load' }
  ]);

  const [chemicalLogs, setChemicalLogs] = useState<ChemicalLog[]>([
    { id: 'CHM-101', sampleNo: 'SMP-26-440', preBdv: 19, postBdv: 74, preMoisture: 45, postMoisture: 2.6, preGas: 2.4, postGas: 0.1, status: 'Cleared' },
    { id: 'CHM-102', sampleNo: 'SMP-26-441', preBdv: 22, postBdv: 76, preMoisture: 48, postMoisture: 2.8, preGas: 2.6, postGas: 0.1, status: 'Cleared' }
  ]);

  const [coatingLogs, setCoatingLogs] = useState([
    { id: 'COAT-90', component: 'Vacuum Chamber Outer', sandblast: 'SA 2.5', primer: 'Zinc Rich Epoxy (75μm)', topcoat: 'Polyurethane RAL 5012 (60μm)', inspector: 'R. Desai', status: 'Approved' },
    { id: 'COAT-91', component: 'Structural Frame Base', sandblast: 'SA 2.0', primer: 'Red Oxide (50μm)', topcoat: 'Epoxy Enamel Grey (55μm)', inspector: 'R. Desai', status: 'Approved' }
  ]);

  const [approvals, setApprovals] = useState([
    { id: 'WO-26-004', client: 'Tata Power', item: '6000 LPH Plant', tests: { final: 'OK', trial: 'OK', power: 'OK', performance: 'OK', panel: 'OK', paint: 'OK' }, status: 'Approved', signoff: 'Pending Senior QC Signature' },
    { id: 'WO-26-005', client: 'Reliance Industries', item: '10000 LPH Mobile', tests: { final: 'OK', trial: 'OK', power: 'OK', performance: 'Pending', panel: 'OK', paint: 'OK' }, status: 'Pending', signoff: 'Pending QC Manager Review' }
  ]);

  // Form States - FAT
  const [isAddFatOpen, setIsAddFatOpen] = useState(false);
  const [drawNo, setDrawNo] = useState('');
  const [asPerDwg, setAsPerDwg] = useState('');
  const [tolVal, setTolVal] = useState('±0.5mm');
  const [obsVal, setObsVal] = useState('');
  const [inspStatus, setInspStatus] = useState<'Passed' | 'Failed'>('Passed');

  // Form States - Electrical
  const [isAddElecOpen, setIsAddElecOpen] = useState(false);
  const [elecEquip, setElecEquip] = useState('');
  const [elecPhase, setElecPhase] = useState<'Single-Phase' | 'Three-Phase'>('Three-Phase');
  const [elecVolt, setElecVolt] = useState('415');
  const [elecAmpsR, setElecAmpsR] = useState('22');
  const [elecAmpsY, setElecAmpsY] = useState('22');
  const [elecAmpsB, setElecAmpsB] = useState('22');
  const [elecPf, setElecPf] = useState('0.85');
  const [elecRpm, setElecRpm] = useState('1440');

  // Form States - Chemical
  const [isAddChemOpen, setIsAddChemOpen] = useState(false);
  const [chemSample, setChemSample] = useState('');
  const [preBdvVal, setPreBdvVal] = useState('19');
  const [postBdvVal, setPostBdvVal] = useState('74');
  const [preMoistVal, setPreMoistVal] = useState('45');
  const [postMoistVal, setPostMoistVal] = useState('2.6');
  const [preGasVal, setPreGasVal] = useState('2.5');
  const [postGasVal, setPostGasVal] = useState('0.1');

  const handleLogFat = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: FatLog = {
      id: `FAT-${Math.floor(900 + Math.random() * 100)}`,
      drawingNo: drawNo,
      asPerDrawing: asPerDwg,
      tolerance: tolVal,
      obtainedValue: obsVal,
      inspector: 'Hitesh Amin (QC)',
      status: inspStatus,
      date: new Date().toISOString().split('T')[0]
    };
    setFatLogs([newLog, ...fatLogs]);
    setIsAddFatOpen(false);
    setDrawNo('');
    setAsPerDwg('');
    setObsVal('');
  };

  const handleLogElectrical = (e: React.FormEvent) => {
    e.preventDefault();
    const amps = elecPhase === 'Three-Phase' 
      ? [Number(elecAmpsR), Number(elecAmpsY), Number(elecAmpsB)] 
      : [Number(elecAmpsR)];
    
    // Check imbalance or overload status
    let status: 'Stable' | 'High Load' | 'Imbalance' = 'Stable';
    if (elecPhase === 'Three-Phase') {
      const maxAmps = Math.max(...amps);
      const minAmps = Math.min(...amps);
      if (maxAmps - minAmps > 3) status = 'Imbalance';
      else if (maxAmps > 35) status = 'High Load';
    } else {
      if (amps[0] > 40) status = 'High Load';
    }

    const newLog: PowerLog = {
      id: `PWR-${Math.floor(80 + Math.random() * 20)}`,
      equipment: elecEquip,
      phase: elecPhase,
      voltage: Number(elecVolt),
      ampsArray: amps,
      powerFactor: Number(elecPf),
      rpm: elecRpm ? Number(elecRpm) : 'N/A',
      status
    };

    setPowerLogs([newLog, ...powerLogs]);
    setIsAddElecOpen(false);
    setElecEquip('');
  };

  const handleLogChemical = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: ChemicalLog = {
      id: `CHM-${Math.floor(103 + Math.random() * 100)}`,
      sampleNo: chemSample,
      preBdv: Number(preBdvVal),
      postBdv: Number(postBdvVal),
      preMoisture: Number(preMoistVal),
      postMoisture: Number(postMoistVal),
      preGas: Number(preGasVal),
      postGas: Number(postGasVal),
      status: Number(postBdvVal) >= 60 && Number(postMoistVal) <= 10 ? 'Cleared' : 'Failed'
    };

    setChemicalLogs([newLog, ...chemicalLogs]);
    setIsAddChemOpen(false);
    setChemSample('');
  };

  const handleApproveQC = (woId: string) => {
    setApprovals(approvals.map(app => 
      app.id === woId ? { 
        ...app, 
        signoff: 'Digitally Signed by QC Manager (Suketu Shah)', 
        status: 'Approved', 
        tests: { ...app.tests, performance: 'OK' } 
      } : app
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quality Management System (QMS)</h2>
          <p className="text-muted-foreground">Log engineering drawing tolerances, electrical parameter arrays, laboratory purification baseline shifts, and final FAT inspections.</p>
        </div>
      </div>

      <Tabs defaultValue="fat" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="fat"><Clipboard className="w-4 h-4 mr-2" /> FAT Tolerances</TabsTrigger>
          <TabsTrigger value="electrical"><Zap className="w-4 h-4 mr-2" /> Electrical Logger</TabsTrigger>
          <TabsTrigger value="chemical"><Activity className="w-4 h-4 mr-2" /> Laboratory Analytics</TabsTrigger>
          <TabsTrigger value="coating"><Sliders className="w-4 h-4 mr-2" /> Coating Ledger</TabsTrigger>
          <TabsTrigger value="testing-checklists"><ShieldCheck className="w-4 h-4 mr-2" /> Testing Cycles & Sign-offs</TabsTrigger>
        </TabsList>

        {/* Tab 1: FAT & Tolerance Logs */}
        <TabsContent value="fat">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mechanical Drawing Tolerance Log</CardTitle>
                <CardDescription>Compares "As Per Drawing" target dimension specs against actual "Obtained Values" at GIDC factory shop-floor.</CardDescription>
              </div>
              <Dialog open={isAddFatOpen} onOpenChange={setIsAddFatOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Log Dimension Check</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                  <form onSubmit={handleLogFat}>
                    <DialogHeader>
                      <DialogTitle>Add Structural Inspection Log</DialogTitle>
                      <DialogDescription>Input tolerances as per approved drawing and record actual values.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-xs">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Drawing Reference Number</label>
                        <Input value={drawNo} onChange={e => setDrawNo(e.target.value)} placeholder="e.g. DWG-TP-105-REV3" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Specification "As Per Drawing"</label>
                        <Input value={asPerDwg} onChange={e => setAsPerDwg(e.target.value)} placeholder="e.g. Length 4500 mm / Dia 1200 mm" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Allowed Tolerance</label>
                          <Input value={tolVal} onChange={e => setTolVal(e.target.value)} placeholder="e.g. ±0.5 mm" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Obtained Value</label>
                          <Input value={obsVal} onChange={e => setObsVal(e.target.value)} placeholder="e.g. 4500.3 mm / 1200.1 mm" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Visual Inspection Result</label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                          value={inspStatus} 
                          onChange={e => setInspStatus(e.target.value as any)}
                        >
                          <option value="Passed">Passed (Meets Standard)</option>
                          <option value="Failed">Failed (Requires Rework)</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddFatOpen(false)}>Cancel</Button>
                      <Button type="submit">Submit Dimension Log</Button>
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
                      <th className="pb-3 text-left">Inspection ID</th>
                      <th className="pb-3 text-left">Drawing No</th>
                      <th className="pb-3 text-left">"As Per Drawing" Spec</th>
                      <th className="pb-3 text-left">Tolerance</th>
                      <th className="pb-3 text-left">"Obtained Value" Measured</th>
                      <th className="pb-3 text-left">QC Inspector</th>
                      <th className="pb-3 text-left">Date</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-zinc-700 dark:text-zinc-300">
                    {fatLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 font-semibold text-xs text-primary">{log.id}</td>
                        <td className="py-3 font-mono text-xs">{log.drawingNo}</td>
                        <td className="py-3 font-medium">{log.asPerDrawing}</td>
                        <td className="py-3 text-zinc-500 font-mono text-xs">{log.tolerance}</td>
                        <td className="py-3 font-bold text-cyan-600 dark:text-cyan-400">{log.obtainedValue}</td>
                        <td className="py-3 text-xs">{log.inspector}</td>
                        <td className="py-3 text-zinc-400 text-xs">{log.date}</td>
                        <td className="py-3 text-right">
                          <Badge variant={log.status === 'Passed' ? 'default' : 'destructive'} className={log.status === 'Passed' ? 'bg-green-100 text-green-800 border-green-200' : ''}>
                            {log.status === 'Passed' ? 'OK (Passed)' : 'Defect (Failed)'}
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

        {/* Tab 2: Electrical Parameter Logger */}
        <TabsContent value="electrical">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Electrical Parameter & Amperage Array Logger</CardTitle>
                <CardDescription>Track voltage levels and amperage balance metrics for multi-phase vacuum pump motors and heating zones.</CardDescription>
              </div>
              <Dialog open={isAddElecOpen} onOpenChange={setIsAddElecOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Log Electrical parameters</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                  <form onSubmit={handleLogElectrical}>
                    <DialogHeader>
                      <DialogTitle>Log Equipment Electrical Load</DialogTitle>
                      <DialogDescription>Record phase voltage and structural multi-phase amperage balance configurations.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-xs">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Equipment / Motor Description</label>
                        <Input value={elecEquip} onChange={e => setElecEquip(e.target.value)} placeholder="e.g. Primary High-Vacuum Root Pump 20HP" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Phase Layout</label>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                            value={elecPhase} 
                            onChange={e => setElecPhase(e.target.value as any)}
                          >
                            <option value="Three-Phase">Three-Phase (3φ)</option>
                            <option value="Single-Phase">Single-Phase (1φ)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Voltage (Volts)</label>
                          <Input type="number" value={elecVolt} onChange={e => setElecVolt(e.target.value)} required />
                        </div>
                      </div>

                      {elecPhase === 'Three-Phase' ? (
                        <div className="space-y-2 border p-3 rounded-lg bg-zinc-50/50">
                          <label className="text-sm font-semibold text-zinc-600 block mb-1">Amperage Array Readings [I_R, I_Y, I_B] (Amps)</label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-[10px] text-red-500 font-bold">Phase R</span>
                              <Input type="number" value={elecAmpsR} onChange={e => setElecAmpsR(e.target.value)} required />
                            </div>
                            <div>
                              <span className="text-[10px] text-teal-500 font-bold">Phase Y</span>
                              <Input type="number" value={elecAmpsY} onChange={e => setElecAmpsY(e.target.value)} required />
                            </div>
                            <div>
                              <span className="text-[10px] text-teal-500 font-bold">Phase B</span>
                              <Input type="number" value={elecAmpsB} onChange={e => setElecAmpsB(e.target.value)} required />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Load Current (Amps)</label>
                          <Input type="number" value={elecAmpsR} onChange={e => setElecAmpsR(e.target.value)} required />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Power Factor (Cos φ)</label>
                          <Input type="number" step="0.01" value={elecPf} onChange={e => setElecPf(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Speed RPM (or N/A)</label>
                          <Input value={elecRpm} onChange={e => setElecRpm(e.target.value)} required />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddElecOpen(false)}>Cancel</Button>
                      <Button type="submit">Save Electrical Log</Button>
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
                      <th className="pb-3 text-left">Log ID</th>
                      <th className="pb-3 text-left">Equipment / Motor Description</th>
                      <th className="pb-3 text-left">Phase</th>
                      <th className="pb-3 text-right">Voltage</th>
                      <th className="pb-3 text-center">Multi-Phase Amperage Array</th>
                      <th className="pb-3 text-right">Avg Load (Amps)</th>
                      <th className="pb-3 text-right">Cos φ</th>
                      <th className="pb-3 text-right">Speed (RPM)</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-zinc-700 dark:text-zinc-300">
                    {powerLogs.map((log) => {
                      const avgAmps = (log.ampsArray.reduce((a, b) => a + b, 0) / log.ampsArray.length).toFixed(1);
                      return (
                        <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="py-3.5 font-semibold text-xs text-primary">{log.id}</td>
                          <td className="py-3.5 font-bold">{log.equipment}</td>
                          <td className="py-3.5 text-xs">{log.phase}</td>
                          <td className="py-3.5 text-right font-mono text-xs">{log.voltage} V</td>
                          <td className="py-3.5 text-center font-mono text-xs">
                            <span className="text-red-500 font-semibold">{log.ampsArray[0]}A</span>
                            {log.ampsArray[1] && <span className="text-zinc-400 mx-1">/</span>}
                            {log.ampsArray[1] && <span className="text-teal-500 font-semibold">{log.ampsArray[1]}A</span>}
                            {log.ampsArray[2] && <span className="text-zinc-400 mx-1">/</span>}
                            {log.ampsArray[2] && <span className="text-teal-500 font-semibold">{log.ampsArray[2]}A</span>}
                          </td>
                          <td className="py-3.5 text-right font-mono text-xs text-cyan-600 dark:text-cyan-400 font-bold">{avgAmps} A</td>
                          <td className="py-3.5 text-right font-mono text-xs">{log.powerFactor}</td>
                          <td className="py-3.5 text-right font-mono text-xs">{log.rpm}</td>
                          <td className="py-3.5 text-right">
                            <Badge variant={log.status === 'Stable' ? 'outline' : 'secondary'} className={
                              log.status === 'Stable' 
                                ? 'text-green-600 border-green-200 bg-green-50/50' 
                                : log.status === 'Imbalance' 
                                  ? 'text-red-600 border-red-200 bg-red-50/50 animate-pulse' 
                                  : 'text-teal-600 border-teal-200 bg-teal-50/50'
                            }>
                              {log.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Laboratory Analytics (Chemical Shifts) */}
        <TabsContent value="chemical">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Transformer Oil Performance & Laboratory Analytics</CardTitle>
                <CardDescription>Monitor baseline filtration shifts. Clears plants when Breakdown Voltage (BDV) scales up and moisture drops to standard PPM limits.</CardDescription>
              </div>
              <Dialog open={isAddChemOpen} onOpenChange={setIsAddChemOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Log Purification Sample</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                  <form onSubmit={handleLogChemical}>
                    <DialogHeader>
                      <DialogTitle>Log Lab Oil Analysis Result</DialogTitle>
                      <DialogDescription>Input baseline pre-treatment vs post-treatment purification results.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-xs">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Sample Reference Label</label>
                        <Input value={chemSample} onChange={e => setChemSample(e.target.value)} placeholder="e.g. SMP-26-445" required />
                      </div>
                      
                      <div className="border p-3 rounded-lg space-y-3 bg-zinc-50/50">
                        <h4 className="font-bold text-zinc-700">1. Breakdown Voltage (BDV) Parameters</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-zinc-500 font-bold block mb-1">Pre-Treatment BDV (kV)</span>
                            <Input type="number" value={preBdvVal} onChange={e => setPreBdvVal(e.target.value)} required />
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 font-bold block mb-1">Post-Treatment BDV (kV) *</span>
                            <Input type="number" value={postBdvVal} onChange={e => setPostBdvVal(e.target.value)} required />
                          </div>
                        </div>
                      </div>

                      <div className="border p-3 rounded-lg space-y-3 bg-zinc-50/50">
                        <h4 className="font-bold text-zinc-700">2. Moisture Content (Karl Fischer)</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-zinc-500 font-bold block mb-1">Pre-Treatment Moisture (PPM)</span>
                            <Input type="number" step="0.1" value={preMoistVal} onChange={e => setPreMoistVal(e.target.value)} required />
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 font-bold block mb-1">Post-Treatment Moisture (PPM) *</span>
                            <Input type="number" step="0.1" value={postMoistVal} onChange={e => setPostMoistVal(e.target.value)} required />
                          </div>
                        </div>
                      </div>

                      <div className="border p-3 rounded-lg space-y-3 bg-zinc-50/50">
                        <h4 className="font-bold text-zinc-700">3. Dissolved Gas Content (DGA)</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-zinc-500 font-bold block mb-1">Pre-Treatment Gas (%)</span>
                            <Input type="number" step="0.1" value={preGasVal} onChange={e => setPreGasVal(e.target.value)} required />
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 font-bold block mb-1">Post-Treatment Gas (%)</span>
                            <Input type="number" step="0.1" value={postGasVal} onChange={e => setPostGasVal(e.target.value)} required />
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddChemOpen(false)}>Cancel</Button>
                      <Button type="submit">Submit Laboratory Log</Button>
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
                      <th className="pb-3 text-left">Sample ID</th>
                      <th className="pb-3 text-left">Ref Label</th>
                      <th className="pb-3 text-center bg-red-50/30 dark:bg-red-950/10">Pre-BDV</th>
                      <th className="pb-3 text-center bg-green-50/30 dark:bg-green-950/10">Post-BDV</th>
                      <th className="pb-3 text-center">BDV Scale-Up</th>
                      <th className="pb-3 text-center bg-red-50/30 dark:bg-red-950/10">Pre-Moisture</th>
                      <th className="pb-3 text-center bg-green-50/30 dark:bg-green-950/10">Post-Moisture</th>
                      <th className="pb-3 text-center">Moisture Drop</th>
                      <th className="pb-3 text-right">Lab Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-zinc-700 dark:text-zinc-300">
                    {chemicalLogs.map((log) => {
                      const bdvScale = (((log.postBdv - log.preBdv) / log.preBdv) * 100).toFixed(0);
                      const moistDrop = (((log.preMoisture - log.postMoisture) / log.preMoisture) * 100).toFixed(1);
                      return (
                        <tr key={log.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                          <td className="py-3.5 font-semibold text-xs text-primary">{log.id}</td>
                          <td className="py-3.5 font-mono text-xs">{log.sampleNo}</td>
                          <td className="py-3.5 text-center font-mono text-xs text-red-500 font-medium bg-red-50/20 dark:bg-red-950/5">{log.preBdv} kV</td>
                          <td className="py-3.5 text-center font-mono text-xs text-green-600 font-bold bg-green-50/20 dark:bg-green-950/5">{log.postBdv} kV</td>
                          <td className="py-3.5 text-center">
                            <span className="inline-flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                              +{bdvScale}% Improvement
                            </span>
                          </td>
                          <td className="py-3.5 text-center font-mono text-xs text-red-500 font-medium bg-red-50/20 dark:bg-red-950/5">{log.preMoisture} ppm</td>
                          <td className="py-3.5 text-center font-mono text-xs text-green-600 font-bold bg-green-50/20 dark:bg-green-950/5">{log.postMoisture} ppm</td>
                          <td className="py-3.5 text-center">
                            <span className="inline-flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                              -{moistDrop}% Drop
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <Badge className={log.status === 'Cleared' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}>
                              {log.status === 'Cleared' ? 'Purification OK' : 'Failed QA'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Coating Ledger */}
        <TabsContent value="coating">
          <Card>
            <CardHeader>
              <CardTitle>Surface Preparation & Coating (SA 2.5 Standard)</CardTitle>
              <CardDescription>Track sandblasting profiles, red oxide/epoxy primers, and polyurethane thickness logs.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-zinc-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Record ID</th>
                      <th className="pb-3 text-left">Structural Component</th>
                      <th className="pb-3 text-left">Sandblasting Grade</th>
                      <th className="pb-3 text-left">Primer / Undercoat Spec</th>
                      <th className="pb-3 text-left">Epoxy Resin / Topcoat Paint</th>
                      <th className="pb-3 text-left">Inspector</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-zinc-700 dark:text-zinc-300">
                    {coatingLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{log.id}</td>
                        <td className="py-3.5 font-bold">{log.component}</td>
                        <td className="py-3.5 font-mono text-xs">{log.sandblast}</td>
                        <td className="py-3.5 text-xs text-zinc-600 dark:text-zinc-400">{log.primer}</td>
                        <td className="py-3.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400">{log.topcoat}</td>
                        <td className="py-3.5 text-xs">{log.inspector}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50/20">
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

        {/* Tab 5: Testing Cycles & Sign-offs */}
        <TabsContent value="testing-checklists">
          <Card>
            <CardHeader>
              <CardTitle>Plant Assembly Testing Checklists & Release Queue</CardTitle>
              <CardDescription>Verifies the 6 key testing cycles before Senior QC digital release sign-off.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvals.map((app) => (
                  <div key={app.id} className="p-6 border rounded-xl space-y-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-primary">{app.id}</span>
                          <span className="text-zinc-300">|</span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{app.client}</span>
                          <span className="text-zinc-300">|</span>
                          <span className="text-xs text-zinc-500 font-medium">{app.item}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">QC Authority Sign-off: <span className="font-semibold text-foreground">{app.signoff}</span></p>
                      </div>

                      <div>
                        {app.status === 'Approved' ? (
                          <div className="inline-flex items-center text-green-700 bg-green-100 border border-green-300 px-4 py-1.5 rounded-lg text-xs font-bold gap-1.5 uppercase shadow-sm">
                            <Award className="w-4 h-4 text-green-600 animate-pulse" /> QC Release Certified
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => handleApproveQC(app.id)} className="shadow-sm">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve senior Sign-Off
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
                      <div className="p-3 border rounded-lg bg-white dark:bg-zinc-900 text-center">
                        <span className="text-[10px] font-bold text-zinc-400 block mb-1">1. Final Inspection</span>
                        <Badge className="bg-emerald-500 text-white text-[10px] h-5">OK (Passed)</Badge>
                      </div>
                      <div className="p-3 border rounded-lg bg-white dark:bg-zinc-900 text-center">
                        <span className="text-[10px] font-bold text-zinc-400 block mb-1">2. Trial Running</span>
                        <Badge className="bg-emerald-500 text-white text-[10px] h-5">OK (8 Hours)</Badge>
                      </div>
                      <div className="p-3 border rounded-lg bg-white dark:bg-zinc-900 text-center">
                        <span className="text-[10px] font-bold text-zinc-400 block mb-1">3. Power Consumption</span>
                        <Badge className="bg-emerald-500 text-white text-[10px] h-5">OK (Verified)</Badge>
                      </div>
                      <div className="p-3 border rounded-lg bg-white dark:bg-zinc-900 text-center">
                        <span className="text-[10px] font-bold text-zinc-400 block mb-1">4. Performance Tests</span>
                        <Badge variant={app.tests.performance === 'OK' ? 'default' : 'secondary'} className={app.tests.performance === 'OK' ? 'bg-emerald-500 text-white text-[10px] h-5' : 'text-teal-600 bg-teal-50 h-5'}>
                          {app.tests.performance}
                        </Badge>
                      </div>
                      <div className="p-3 border rounded-lg bg-white dark:bg-zinc-900 text-center">
                        <span className="text-[10px] font-bold text-zinc-400 block mb-1">5. Control Panel QC</span>
                        <Badge className="bg-emerald-500 text-white text-[10px] h-5">OK (Interlock OK)</Badge>
                      </div>
                      <div className="p-3 border rounded-lg bg-white dark:bg-zinc-900 text-center">
                        <span className="text-[10px] font-bold text-zinc-400 block mb-1">6. Paint Thickness</span>
                        <Badge className="bg-emerald-500 text-white text-[10px] h-5">OK (RAL 5012)</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
