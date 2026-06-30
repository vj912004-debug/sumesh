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
  FileText, Activity, ShieldCheck, Award, Zap, Sliders, CheckCircle2, AlertCircle, Plus, Clipboard 
} from 'lucide-react';

export default function QualityManagement() {
  const [fatLogs, setFatLogs] = useState([
    { id: 'FAT-892', drawingNo: 'DWG-TP-102', dimensionTarget: '2500x6000x16', tolerance: '±0.5mm', observed: '2500.2 x 6000.1 x 16.0', inspector: 'Hitesh Amin', status: 'Passed', date: '2026-06-30' },
    { id: 'FAT-893', drawingNo: 'DWG-RP-921', dimensionTarget: '1500x3000x10', tolerance: '±0.3mm', observed: '1500.4 x 3000.2 x 10.1', inspector: 'Ramesh Patel', status: 'Passed', date: '2026-06-29' },
    { id: 'FAT-894', drawingNo: 'DWG-FL-402', dimensionTarget: 'OD 600, ID 400', tolerance: '±0.2mm', observed: 'OD 600.5, ID 399.9', inspector: 'Hitesh Amin', status: 'Failed', date: '2026-06-28' }
  ]);

  const [powerLogs, setPowerLogs] = useState([
    { id: 'PWR-71', equipment: 'Vacuum Motor 15HP', phase: 'Three-Phase', voltage: '415 V', current: '21.5 A', powerFactor: '0.86', rpm: '1440', status: 'Stable' },
    { id: 'PWR-72', equipment: 'Oil Circulation Pump 5HP', phase: 'Three-Phase', voltage: '412 V', current: '7.2 A', powerFactor: '0.84', rpm: '2880', status: 'Stable' },
    { id: 'PWR-73', equipment: 'Degassing Chamber Heater', phase: 'Single-Phase', voltage: '230 V', current: '43.1 A', powerFactor: '0.98', rpm: 'N/A', status: 'High Load' }
  ]);

  const [chemicalLogs, setChemicalLogs] = useState([
    { id: 'CHM-101', sampleNo: 'SMP-26-440', preBdv: '32 kV', postBdv: '78 kV', preMoisture: '45 ppm', postMoisture: '8 ppm', preGas: '2.4%', postGas: '0.1%', status: 'Cleared' },
    { id: 'CHM-102', sampleNo: 'SMP-26-441', preBdv: '28 kV', postBdv: '74 kV', preMoisture: '52 ppm', postMoisture: '9 ppm', preGas: '2.8%', postGas: '0.1%', status: 'Cleared' }
  ]);

  const [coatingLogs, setCoatingLogs] = useState([
    { id: 'COAT-90', component: 'Vacuum Chamber Outer', sandblast: 'SA 2.5', primer: 'Zinc Rich Epoxy (75μm)', topcoat: 'Polyurethane RAL 5012 (60μm)', inspector: 'R. Desai', status: 'Approved' },
    { id: 'COAT-91', component: 'Structural Frame Base', sandblast: 'SA 2.0', primer: 'Red Oxide (50μm)', topcoat: 'Epoxy Enamel Grey (55μm)', inspector: 'R. Desai', status: 'Approved' }
  ]);

  const [approvals, setApprovals] = useState([
    { id: 'WO-26-004', client: 'Tata Power', item: '6000 LPH Plant', fat: 'Approved', electrical: 'Approved', chemical: 'Approved', signoff: 'Pending Senior QC Signature' },
    { id: 'WO-26-005', client: 'Reliance Industries', item: '10000 LPH Mobile', fat: 'Approved', electrical: 'Approved', chemical: 'Pending Analysis', signoff: 'Pending QC Manager Review' }
  ]);

  // Form States
  const [isAddFatOpen, setIsAddFatOpen] = useState(false);
  const [drawNo, setDrawNo] = useState('');
  const [targetDim, setTargetDim] = useState('');
  const [tolVal, setTolVal] = useState('±0.5mm');
  const [obsVal, setObsVal] = useState('');
  const [inspStatus, setInspStatus] = useState('Passed');

  const handleLogFat = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = {
      id: `FAT-${Math.floor(900 + Math.random() * 100)}`,
      drawingNo: drawNo,
      dimensionTarget: targetDim,
      tolerance: tolVal,
      observed: obsVal,
      inspector: 'Admin QC',
      status: inspStatus,
      date: new Date().toISOString().split('T')[0]
    };
    setFatLogs([newLog, ...fatLogs]);
    setIsAddFatOpen(false);
    setDrawNo('');
    setTargetDim('');
    setObsVal('');
  };

  const handleApproveQC = (woId: string) => {
    setApprovals(approvals.map(app => 
      app.id === woId ? { ...app, signoff: 'Digitally Signed & Certified', chemical: 'Approved' } : app
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">QMS & Inspections</h2>
          <p className="text-muted-foreground">Log manufacturing inspections, motor loads, oil quality parameters, and sign-offs.</p>
        </div>
      </div>

      <Tabs defaultValue="fat" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="fat"><Clipboard className="w-4 h-4 mr-2" /> FAT Logger</TabsTrigger>
          <TabsTrigger value="electrical"><Zap className="w-4 h-4 mr-2" /> Power Analytics</TabsTrigger>
          <TabsTrigger value="chemical"><Activity className="w-4 h-4 mr-2" /> Chemical Tracker</TabsTrigger>
          <TabsTrigger value="coating"><Sliders className="w-4 h-4 mr-2" /> Coating Ledger</TabsTrigger>
          <TabsTrigger value="signoff"><ShieldCheck className="w-4 h-4 mr-2" /> QC Sign-off</TabsTrigger>
        </TabsList>

        {/* Tab 1: FAT Logger */}
        <TabsContent value="fat">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Factory Acceptance Testing (FAT)</CardTitle>
                <CardDescription>Dimensional inspection registry against mechanical engineering drawings.</CardDescription>
              </div>
              <Dialog open={isAddFatOpen} onOpenChange={setIsAddFatOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Log Inspection</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                  <form onSubmit={handleLogFat}>
                    <DialogHeader>
                      <DialogTitle>Add FAT Structural Inspection</DialogTitle>
                      <DialogDescription>Log target vs observed measurements relative to approved tolerances.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Drawing Reference No</label>
                        <Input value={drawNo} onChange={e => setDrawNo(e.target.value)} placeholder="DWG-TP-105" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Target Dimension</label>
                        <Input value={targetDim} onChange={e => setTargetDim(e.target.value)} placeholder="e.g. 2500 x 6000 x 16" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tolerance Standard</label>
                          <Input value={tolVal} onChange={e => setTolVal(e.target.value)} placeholder="e.g. ±0.5mm" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Observed Value</label>
                          <Input value={obsVal} onChange={e => setObsVal(e.target.value)} placeholder="e.g. 2500.1 x 5999.8 x 16.1" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Visual Quality Status</label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          value={inspStatus} 
                          onChange={e => setInspStatus(e.target.value)}
                        >
                          <option value="Passed">Passed (OK)</option>
                          <option value="Failed">Failed (Requires Rework)</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddFatOpen(false)}>Cancel</Button>
                      <Button type="submit">Submit Log</Button>
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
                      <th className="pb-3 text-left">Inspection ID</th>
                      <th className="pb-3 text-left">Drawing No</th>
                      <th className="pb-3 text-left">Target Dimensions</th>
                      <th className="pb-3 text-left">Tolerance</th>
                      <th className="pb-3 text-left">Observed Value</th>
                      <th className="pb-3 text-left">Inspector</th>
                      <th className="pb-3 text-left">Date</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {fatLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 font-semibold text-xs text-primary">{log.id}</td>
                        <td className="py-3 font-mono text-xs">{log.drawingNo}</td>
                        <td className="py-3">{log.dimensionTarget}</td>
                        <td className="py-3 text-slate-500 font-mono text-xs">{log.tolerance}</td>
                        <td className="py-3 font-medium">{log.observed}</td>
                        <td className="py-3 text-xs">{log.inspector}</td>
                        <td className="py-3 text-slate-400 text-xs">{log.date}</td>
                        <td className="py-3 text-right">
                          <Badge variant={log.status === 'Passed' ? 'default' : 'destructive'}>
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

        {/* Tab 2: Electrical Analytics */}
        <TabsContent value="electrical">
          <Card>
            <CardHeader>
              <CardTitle>Electrical & Power Quality Logs</CardTitle>
              <CardDescription>Volts, Amps, and RPM tracking for active vacuum pumps, heating coils, and filtration motors.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Log ID</th>
                      <th className="pb-3 text-left">Equipment Part Name</th>
                      <th className="pb-3 text-left">Phase Layout</th>
                      <th className="pb-3 text-right">Target Voltage</th>
                      <th className="pb-3 text-right">Measured Load (Amps)</th>
                      <th className="pb-3 text-right">Power Factor (Cos φ)</th>
                      <th className="pb-3 text-right">Motor Speed (RPM)</th>
                      <th className="pb-3 text-right">Load Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {powerLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{log.id}</td>
                        <td className="py-3.5 font-medium">{log.equipment}</td>
                        <td className="py-3.5 text-xs">{log.phase}</td>
                        <td className="py-3.5 text-right font-mono text-xs">{log.voltage}</td>
                        <td className="py-3.5 text-right font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{log.current}</td>
                        <td className="py-3.5 text-right font-mono text-xs">{log.powerFactor}</td>
                        <td className="py-3.5 text-right font-mono text-xs">{log.rpm}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant={log.status === 'Stable' ? 'outline' : 'secondary'} className={log.status === 'Stable' ? 'text-green-600 border-green-200' : 'text-amber-600 border-amber-200'}>
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

        {/* Tab 3: Chemical & Performance */}
        <TabsContent value="chemical">
          <Card>
            <CardHeader>
              <CardTitle>Chemical Quality & Performance Metrics</CardTitle>
              <CardDescription>Break Down Voltage (BDV) tests, moisture analysis, and dissolved gas content tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Sample ID</th>
                      <th className="pb-3 text-left">Sample Ref</th>
                      <th className="pb-3 text-center" colSpan={2}>Breakdown Voltage (BDV)</th>
                      <th className="pb-3 text-center" colSpan={2}>Moisture Content</th>
                      <th className="pb-3 text-center" colSpan={2}>Dissolved Gas (DGA)</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                    <tr className="border-b text-slate-400 text-[10px] uppercase">
                      <th colSpan={2}></th>
                      <th className="pb-2 text-center text-red-500">Pre-Treatment</th>
                      <th className="pb-2 text-center text-green-600">Post-Treatment</th>
                      <th className="pb-2 text-center text-red-500">Pre-Treatment</th>
                      <th className="pb-2 text-center text-green-600">Post-Treatment</th>
                      <th className="pb-2 text-center text-red-500">Pre-Treatment</th>
                      <th className="pb-2 text-center text-green-600">Post-Treatment</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {chemicalLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{log.id}</td>
                        <td className="py-3.5 font-mono text-xs">{log.sampleNo}</td>
                        <td className="py-3.5 text-center font-mono text-xs text-red-500">{log.preBdv}</td>
                        <td className="py-3.5 text-center font-mono text-xs text-green-600 font-bold">{log.postBdv}</td>
                        <td className="py-3.5 text-center font-mono text-xs text-red-500">{log.preMoisture}</td>
                        <td className="py-3.5 text-center font-mono text-xs text-green-600 font-bold">{log.postMoisture}</td>
                        <td className="py-3.5 text-center font-mono text-xs text-red-500">{log.preGas}</td>
                        <td className="py-3.5 text-center font-mono text-xs text-green-600 font-bold">{log.postGas}</td>
                        <td className="py-3.5 text-right">
                          <Badge className="bg-green-50 text-green-700 border-green-200">{log.status}</Badge>
                        </td>
                      </tr>
                    ))}
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
              <CardTitle>Surface Treatment & Coating Ledger</CardTitle>
              <CardDescription>Records sandblasting profile levels, primer microns thickness, and final powder coat inspections.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Record ID</th>
                      <th className="pb-3 text-left">Structural Component</th>
                      <th className="pb-3 text-left">Sandblasting Grade</th>
                      <th className="pb-3 text-left">Primer / Undercoat Spec</th>
                      <th className="pb-3 text-left">Epoxy Resin / Topcoat Paint</th>
                      <th className="pb-3 text-left">Inspector</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {coatingLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{log.id}</td>
                        <td className="py-3.5 font-medium">{log.component}</td>
                        <td className="py-3.5 font-mono text-xs">{log.sandblast}</td>
                        <td className="py-3.5 text-xs text-slate-600 dark:text-slate-400">{log.primer}</td>
                        <td className="py-3.5 text-xs font-medium">{log.topcoat}</td>
                        <td className="py-3.5 text-xs">{log.inspector}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant="outline" className="text-green-600 border-green-200">
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

        {/* Tab 5: QC Sign-off */}
        <TabsContent value="signoff">
          <Card>
            <CardHeader>
              <CardTitle>QC Sign-off & Factory Approvals Queue</CardTitle>
              <CardDescription>Digitally approve ready-to-dispatch systems. Requires QC Manager credentials approval.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvals.map((app) => (
                  <div key={app.id} className="p-5 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-primary">{app.id}</span>
                        <span className="text-slate-400 text-xs">|</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{app.client}</span>
                        <span className="text-slate-400 text-xs">|</span>
                        <span className="text-sm font-medium text-slate-500">{app.item}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-blue-500" /> FAT Check: <span className="font-semibold text-green-600">{app.fat}</span></span>
                        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Electrical: <span className="font-semibold text-green-600">{app.electrical}</span></span>
                        <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-indigo-500" /> Chemical: <span className={`font-semibold ${app.chemical === 'Approved' ? 'text-green-600' : 'text-amber-500'}`}>{app.chemical}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-500">Sign-off Status</p>
                        <p className={`text-xs font-medium ${app.signoff.includes('Signed') ? 'text-green-600' : 'text-amber-600'}`}>{app.signoff}</p>
                      </div>
                      {app.signoff.includes('Pending') ? (
                        <Button size="sm" onClick={() => handleApproveQC(app.id)} className="shadow-sm">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Certify Release
                        </Button>
                      ) : (
                        <div className="flex items-center text-green-600 border border-green-200 px-3 py-1 rounded bg-green-50 text-xs font-bold gap-1 animate-pulse">
                          <Award className="w-4 h-4 text-green-600" /> RELEASE APPROVED
                        </div>
                      )}
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
