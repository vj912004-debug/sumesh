import { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  FileCheck, Shield, Award, ClipboardCheck, ArrowUpRight, Search, Printer, CheckCircle, AlertCircle, FileText, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

type CheckItem = {
  id: string;
  name: string;
  category: 'Visual' | 'Dimensional' | 'Electrical';
  passed: boolean;
};

type OrderDossier = {
  id: string; // Machine S.No
  modelName: string;
  customerName: string;
  poRef: string;
  testDate: string;
  qcEngineer: string;
  isQcApproved: boolean;
  isMtcLinked: boolean;
  isDispatchCleared: boolean;
  vacuumData: { hour: string; vacuumVal: number }[]; // 6-hour leak test data
  checklist: CheckItem[];
};

export default function FinalReports() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Interactive dossiers state
  const [dossiers, setDossiers] = useState<OrderDossier[]>([
    {
      id: 'SP/26/1012',
      modelName: '10000 LPH Transformer Oil Filtration Plant',
      customerName: 'Tata Power',
      poRef: 'PO/TP/2026/044',
      testDate: '2026-06-28',
      qcEngineer: 'Rahul Desai',
      isQcApproved: true,
      isMtcLinked: true,
      isDispatchCleared: false,
      vacuumData: [
        { hour: '0h', vacuumVal: 0.1 },
        { hour: '1h', vacuumVal: 0.25 },
        { hour: '2h', vacuumVal: 0.38 },
        { hour: '3h', vacuumVal: 0.48 },
        { hour: '4h', vacuumVal: 0.55 },
        { hour: '5h', vacuumVal: 0.60 },
        { hour: '6h', vacuumVal: 0.62 } // stabilized, target <1.0 Torr leak
      ],
      checklist: [
        { id: '1', name: 'Overall skid framework dimensional matching GA drawing', category: 'Dimensional', passed: true },
        { id: '2', name: 'Chamber sandblasting and paint coat thickness check (>80 microns)', category: 'Visual', passed: true },
        { id: '3', name: 'Emergency stop pushbuttons & electrical panel earthing check', category: 'Electrical', passed: true },
        { id: '4', name: 'Root pump & vacuum booster coupling alignment runout test', category: 'Dimensional', passed: true },
        { id: '5', name: 'Low oil level interlock shutdown test', category: 'Electrical', passed: true }
      ]
    },
    {
      id: 'SP/26/1015',
      modelName: '6000 LPH High Vacuum Oil Purifier',
      customerName: 'Adani Green Energy',
      poRef: 'PO/ADANI/26/902',
      testDate: '2026-06-30',
      qcEngineer: 'S. G. Vyas',
      isQcApproved: false,
      isMtcLinked: true,
      isDispatchCleared: false,
      vacuumData: [
        { hour: '0h', vacuumVal: 0.15 },
        { hour: '1h', vacuumVal: 0.45 },
        { hour: '2h', vacuumVal: 0.78 },
        { hour: '3h', vacuumVal: 1.12 }, // leaking slightly above target
        { hour: '4h', vacuumVal: 1.45 },
        { hour: '5h', vacuumVal: 1.72 },
        { hour: '6h', vacuumVal: 1.95 }
      ],
      checklist: [
        { id: '1', name: 'Overall skid framework dimensional matching GA drawing', category: 'Dimensional', passed: true },
        { id: '2', name: 'Chamber sandblasting and paint coat thickness check (>80 microns)', category: 'Visual', passed: false }, // paint scratch
        { id: '3', name: 'Emergency stop pushbuttons & electrical panel earthing check', category: 'Electrical', passed: true },
        { id: '4', name: 'Root pump & vacuum booster coupling alignment runout test', category: 'Dimensional', passed: false },
        { id: '5', name: 'Low oil level interlock shutdown test', category: 'Electrical', passed: true }
      ]
    },
    {
      id: 'SP/25/0989',
      modelName: 'Dry Air Generator (DAG-50)',
      customerName: 'Reliance Industries',
      poRef: 'PO/RIL-JAM/8812',
      testDate: '2026-06-25',
      qcEngineer: 'Rahul Desai',
      isQcApproved: true,
      isMtcLinked: true,
      isDispatchCleared: true,
      vacuumData: [
        { hour: '0h', vacuumVal: 0.05 },
        { hour: '1h', vacuumVal: 0.12 },
        { hour: '2h', vacuumVal: 0.18 },
        { hour: '3h', vacuumVal: 0.22 },
        { hour: '4h', vacuumVal: 0.25 },
        { hour: '5h', vacuumVal: 0.27 },
        { hour: '6h', vacuumVal: 0.28 }
      ],
      checklist: [
        { id: '1', name: 'Overall skid framework dimensional matching GA drawing', category: 'Dimensional', passed: true },
        { id: '2', name: 'Chamber sandblasting and paint coat thickness check (>80 microns)', category: 'Visual', passed: true },
        { id: '3', name: 'Emergency stop pushbuttons & electrical panel earthing check', category: 'Electrical', passed: true },
        { id: '4', name: 'Root pump & vacuum booster coupling alignment runout test', category: 'Dimensional', passed: true },
        { id: '5', name: 'Low oil level interlock shutdown test', category: 'Electrical', passed: true }
      ]
    }
  ]);

  // Modal State for Dossier Compiler Drawer
  const [selectedDossier, setSelectedDossier] = useState<OrderDossier | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // Statistics
  const totalCompiled = dossiers.length;
  const pendingQC = dossiers.filter(d => !d.isQcApproved).length;
  const dispatchCleared = dossiers.filter(d => d.isDispatchCleared).length;
  
  // Toggle QC Checklist pass state
  const handleToggleChecklist = (checkId: string) => {
    if (!selectedDossier) return;
    
    const updatedChecklist = selectedDossier.checklist.map(item => {
      if (item.id === checkId) {
        return { ...item, passed: !item.passed };
      }
      return item;
    });

    const isAllChecked = updatedChecklist.every(item => item.passed);

    const updatedDossiers = dossiers.map(d => {
      if (d.id === selectedDossier.id) {
        return { 
          ...d, 
          checklist: updatedChecklist,
          isQcApproved: isAllChecked
        };
      }
      return d;
    });

    setDossiers(updatedDossiers);
    const refreshed = updatedDossiers.find(d => d.id === selectedDossier.id);
    if (refreshed) setSelectedDossier(refreshed);
  };

  // Toggle MTC traceability state
  const handleToggleMtc = () => {
    if (!selectedDossier) return;
    const updatedDossiers = dossiers.map(d => {
      if (d.id === selectedDossier.id) {
        return { ...d, isMtcLinked: !d.isMtcLinked };
      }
      return d;
    });
    setDossiers(updatedDossiers);
    const refreshed = updatedDossiers.find(d => d.id === selectedDossier.id);
    if (refreshed) setSelectedDossier(refreshed);
  };

  // Release Dispatch clearance
  const handleReleaseClearance = () => {
    if (!selectedDossier) return;
    const updatedDossiers = dossiers.map(d => {
      if (d.id === selectedDossier.id) {
        return { ...d, isDispatchCleared: true };
      }
      return d;
    });
    setDossiers(updatedDossiers);
    const refreshed = updatedDossiers.find(d => d.id === selectedDossier.id);
    if (refreshed) setSelectedDossier(refreshed);
  };

  // Search logic
  const filteredDossiers = dossiers.filter(d => {
    return d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
           d.modelName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenCompiler = (dossier: OrderDossier) => {
    setSelectedDossier(dossier);
    setIsDossierModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-800">Final Inspection & Dossier Reports</h2>
          <p className="text-zinc-500">Compile visual checkpoints, 6-hr factory vacuum holding logs, and chemical Mill Test Certificates (MTC) to authorize dispatch clearance.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Total Project Dossiers</CardTitle>
            <FileCheck className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-800">{totalCompiled}</div>
            <p className="text-xs text-zinc-400">Manufactured machine dossiers</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Pending QC Certification</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{pendingQC}</div>
            <p className="text-xs text-zinc-400">Failed visual or testing checkpoints</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Dispatch Clearances Issued</CardTitle>
            <Shield className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{dispatchCleared}</div>
            <p className="text-xs text-zinc-400">Dossiers signed off & released</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Dossier Clearance Rate</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {((dispatchCleared / totalCompiled) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-zinc-400">Quality-reconciled deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Register */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-zinc-800">Dispatch Clearance Dossier Registry</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by S.No, model, client..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Machine S.No</TableHead>
                <TableHead>Equipment Specifications</TableHead>
                <TableHead>Customer / Client</TableHead>
                <TableHead>Test Date</TableHead>
                <TableHead>QC Inspection</TableHead>
                <TableHead>MTC Verification</TableHead>
                <TableHead>Dispatch Clear</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDossiers.map(d => {
                const totalPassedChecks = d.checklist.filter(c => c.passed).length;
                const totalChecks = d.checklist.length;
                
                return (
                  <TableRow key={d.id} className="hover:bg-zinc-50/50">
                    <TableCell className="font-semibold text-teal-600 text-xs">
                      {d.id}
                      <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">{d.poRef}</span>
                    </TableCell>
                    <TableCell className="font-medium text-zinc-700 text-xs max-w-[200px] truncate">{d.modelName}</TableCell>
                    <TableCell className="text-zinc-800 font-medium">{d.customerName}</TableCell>
                    <TableCell className="text-zinc-500 text-xs">{format(new Date(d.testDate), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={d.isQcApproved ? 'default' : 'destructive'} className="text-[10px]">
                          {d.isQcApproved ? 'PASSED' : 'HOLD'}
                        </Badge>
                        <span className="text-[10px] text-zinc-400">({totalPassedChecks}/{totalChecks})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.isMtcLinked ? 'secondary' : 'outline'} className="text-[10px]">
                        {d.isMtcLinked ? 'VERIFIED' : 'PENDING'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.isDispatchCleared ? 'default' : 'outline'} className={d.isDispatchCleared ? 'bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]' : 'text-[10px]'}>
                        {d.isDispatchCleared ? 'CLEARED' : 'LOCKED'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant={d.isDispatchCleared ? 'ghost' : 'default'} 
                        className={!d.isDispatchCleared ? 'bg-zinc-800 hover:bg-zinc-900 text-white' : ''}
                        onClick={() => handleOpenCompiler(d)}
                      >
                        {d.isDispatchCleared ? 'View Dossier' : 'Compile & Clear'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredDossiers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-zinc-400">
                    No dossiers matching the filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dossier Compiler Dialog */}
      <Dialog open={isDossierModalOpen} onOpenChange={setIsDossierModalOpen}>
        <DialogContent className="sm:max-w-[850px] max-h-[92vh] overflow-y-auto">
          {selectedDossier && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Award className="h-5 w-5 text-teal-500" />
                  Quality & Dispatch Dossier Compiler
                </DialogTitle>
                <DialogDescription>
                  Equipment: <span className="font-semibold text-zinc-800">{selectedDossier.modelName}</span> (S.No: {selectedDossier.id})
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="checklist" className="mt-4 py-2">
                <TabsList className="grid grid-cols-4 bg-zinc-100 p-1 rounded-md mb-4 text-xs">
                  <TabsTrigger value="checklist" className="text-xs">1. visual & QAP Checklist</TabsTrigger>
                  <TabsTrigger value="vacuum" className="text-xs">2. Vacuum Leak Test Log</TabsTrigger>
                  <TabsTrigger value="mtc" className="text-xs">3. MTC Traceability</TabsTrigger>
                  <TabsTrigger value="dossier" className="text-xs">4. Consolidated Preview</TabsTrigger>
                </TabsList>

                {/* Tab 1: Checklist */}
                <TabsContent value="checklist" className="space-y-4">
                  <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-md border text-xs">
                    <div>
                      <span className="font-medium text-zinc-500">QC Inspector:</span> {selectedDossier.qcEngineer}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-700">Audit Result:</span>
                      <Badge variant={selectedDossier.isQcApproved ? 'default' : 'destructive'}>
                        {selectedDossier.isQcApproved ? 'ALL CRITERIA MET' : 'CRITERIA PENDING'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 border rounded-lg p-4 bg-white shadow-sm">
                    <h4 className="text-xs font-bold text-zinc-600 uppercase border-b pb-1">Quality Assurance visual & Dimensional Audits</h4>
                    <div className="divide-y text-xs">
                      {selectedDossier.checklist.map(item => (
                        <div key={item.id} className="flex justify-between items-center py-2.5">
                          <div className="flex-1 pr-6">
                            <span className="font-bold text-[10px] text-zinc-400 mr-2 uppercase">{item.category}</span>
                            <span className="text-zinc-800">{item.name}</span>
                          </div>
                          <button
                            type="button"
                            className={`flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                              item.passed 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                            onClick={() => handleToggleChecklist(item.id)}
                          >
                            {item.passed ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {item.passed ? 'PASSED' : 'FAILED'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Vacuum Decay */}
                <TabsContent value="vacuum" className="space-y-4">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 border p-4 rounded-lg bg-zinc-50/50 shadow-inner h-[250px]">
                      <h4 className="text-xs font-bold text-zinc-600 mb-2 uppercase text-center tracking-wide">
                        6-Hour Chamber Vacuum Holding Leak Test Curve
                      </h4>
                      <ResponsiveContainer width="100%" height="90%">
                        <AreaChart
                          data={selectedDossier.vacuumData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorVacuum" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="hour" />
                          <YAxis label={{ value: 'Vacuum (Torr)', angle: -90, position: 'insideLeft', offset: 10 }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="vacuumVal" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVacuum)" name="Vacuum Leak Rate (Torr) - Limit <1.0" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="col-span-1 border rounded-lg p-4 bg-white shadow-sm text-xs space-y-3">
                      <h4 className="font-bold text-zinc-700 uppercase border-b pb-1">Chamber Hold Metrics</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase font-semibold">Start Vacuum</p>
                          <p className="font-bold text-zinc-800">0.1 Torr</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase font-semibold">6-Hour End Vacuum</p>
                          <p className="font-bold text-zinc-800">
                            {selectedDossier.vacuumData[selectedDossier.vacuumData.length - 1]?.vacuumVal} Torr
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase font-semibold">Status</p>
                          {selectedDossier.vacuumData[selectedDossier.vacuumData.length - 1]?.vacuumVal < 1.0 ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              PASS (Leak Rate OK)
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              FAIL (Leak Detected)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: MTC Traceability */}
                <TabsContent value="mtc" className="space-y-4">
                  <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4 text-xs">
                    <h4 className="font-bold text-zinc-700 uppercase border-b pb-1">Steel Plate Heat Traceability Links</h4>
                    <p className="text-zinc-500">Every pressure/vacuum degassing chamber must be traceably linked to its raw Mill Test Certificate (MTC) chemical grades.</p>
                    
                    <div className="bg-zinc-50 p-4 rounded border grid grid-cols-2 gap-y-3 gap-x-6">
                      <div>
                        <span className="font-semibold text-zinc-500">Vacuum Chamber Shell Material:</span>
                        <p className="font-bold text-zinc-800">16mm Thick MS Plate (IS 2062 Gr B)</p>
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-500">Supplier Heat Number:</span>
                        <p className="font-bold text-zinc-800">HT-9018-TATA</p>
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-500">MTC Certificate Reference:</span>
                        <p className="font-bold text-zinc-800">MTC-881903-TATACLOSE</p>
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-500">Laboratory Radiography Report:</span>
                        <p className="font-bold text-zinc-800 text-emerald-600">PASSED (100% Weld Joint Radiography)</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold text-zinc-700">Approve Material Traceability Link?</span>
                      <button
                        type="button"
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-bold text-xs border transition-colors ${
                          selectedDossier.isMtcLinked 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700' 
                            : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300'
                        }`}
                        onClick={handleToggleMtc}
                      >
                        {selectedDossier.isMtcLinked ? <CheckCircle className="h-4 w-4" /> : null}
                        {selectedDossier.isMtcLinked ? 'Traceability Verified' : 'Verify Traceability'}
                      </button>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 4: Preview Print Dossier */}
                <TabsContent value="dossier" className="space-y-4">
                  <div className="border border-zinc-300 p-8 rounded-lg bg-white mt-2 text-zinc-800 text-xs font-sans max-w-2xl mx-auto space-y-4 shadow-sm leading-relaxed">
                    {/* Header */}
                    <div className="text-center border-b-2 border-zinc-800 pb-3">
                      <h2 className="text-lg font-bold tracking-wider text-zinc-900">SUMESH PETROLEUM PVT. LTD.</h2>
                      <p className="text-[10px] text-zinc-500">Regd. Office & Works: 247/A, GIDC Makarpura, Vadodara - 390010</p>
                      <p className="text-xs font-bold tracking-widest text-zinc-700 mt-2 uppercase">FINAL QUALITY INSPECTION & DISPATCH CLEARANCE CERTIFICATE</p>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 border-b pb-3">
                      <div><span className="font-semibold">Machine S.No:</span> {selectedDossier.id}</div>
                      <div><span className="font-semibold">Inspection Date:</span> {format(new Date(selectedDossier.testDate), 'dd-MMM-yyyy')}</div>
                      <div><span className="font-semibold">Equipment Name:</span> {selectedDossier.modelName}</div>
                      <div><span className="font-semibold">Client Name:</span> {selectedDossier.customerName}</div>
                      <div><span className="font-semibold">PO Reference:</span> {selectedDossier.poRef}</div>
                      <div><span className="font-semibold">Lead QC Auditor:</span> {selectedDossier.qcEngineer}</div>
                    </div>

                    {/* Quality Summary */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-[10px] text-zinc-700 uppercase">1. Quality Audits Status</h4>
                      <table className="w-full text-center border-collapse border border-zinc-300">
                        <thead className="bg-zinc-50 font-bold">
                          <tr>
                            <th className="border border-zinc-300 py-1.5 text-left px-2">QAP Compliance Checkpoints</th>
                            <th className="border border-zinc-300 py-1.5 w-24">Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-zinc-300 py-1.5 px-2 text-left">Chamber sandblasting and paint coat thickness check</td>
                            <td className="border border-zinc-300 py-1.5 font-semibold text-emerald-600">PASSED</td>
                          </tr>
                          <tr>
                            <td className="border border-zinc-300 py-1.5 px-2 text-left">Overall skid framework dimensional matching GA drawing</td>
                            <td className="border border-zinc-300 py-1.5 font-semibold text-emerald-600">PASSED</td>
                          </tr>
                          <tr>
                            <td className="border border-zinc-300 py-1.5 px-2 text-left">6-Hour degassing chamber vacuum holding drop leak test</td>
                            <td className="border border-zinc-300 py-1.5 font-semibold text-emerald-600">
                              {selectedDossier.vacuumData[selectedDossier.vacuumData.length - 1]?.vacuumVal < 1.0 ? 'PASSED' : 'FAILED'}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-zinc-300 py-1.5 px-2 text-left">Material traceability certificates & plate heat numbers</td>
                            <td className="border border-zinc-300 py-1.5 font-semibold text-emerald-600">
                              {selectedDossier.isMtcLinked ? 'VERIFIED' : 'PENDING'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Final Declaration */}
                    <div className="border p-3 bg-zinc-50 text-[10px] italic text-zinc-600">
                      We certify that the above equipment has undergone exhaustive inspection and testing at our works in accordance with the Quality Assurance Plan. The plant is found fully compliant with the technical delivery conditions and is cleared for dispatch.
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between items-end pt-8">
                      <div className="text-center w-40 relative">
                        <div className="absolute -top-6 left-0 right-0 flex justify-center opacity-85 pointer-events-none">
                          <div className="border border-emerald-600 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-bold -rotate-12 transform">
                            DIGITALLY APPROVED
                          </div>
                        </div>
                        <div className="border-b border-zinc-400 mb-1.5 h-10"></div>
                        <p className="font-semibold text-zinc-700">QC Inspector</p>
                      </div>
                      <div className="text-center w-40 relative">
                        {selectedDossier.isDispatchCleared && (
                          <div className="absolute -top-8 left-0 right-0 flex justify-center opacity-85 pointer-events-none">
                            <div className="border-2 border-teal-600 text-teal-600 px-3 py-1 rounded text-[10px] font-bold -rotate-6 transform uppercase tracking-widest">
                              RELEASE FOR SHIPMENT
                            </div>
                          </div>
                        )}
                        <div className="border-b border-zinc-400 mb-1.5 h-10"></div>
                        <p className="font-semibold text-zinc-700">Production Manager</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="border-t pt-3 mt-4 gap-2">
                <Button variant="outline" onClick={() => setIsDossierModalOpen(false)}>Close Window</Button>
                {selectedDossier.isQcApproved && selectedDossier.isMtcLinked && !selectedDossier.isDispatchCleared && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={handleReleaseClearance}>
                    Release Dispatch Clearance
                  </Button>
                )}
                {selectedDossier.isDispatchCleared && (
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" /> Print Final Dossier Pack
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
