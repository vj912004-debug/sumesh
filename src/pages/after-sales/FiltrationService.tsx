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
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, Plus, Search, Calendar, ShieldCheck, Wrench, Droplet, UserCheck, Trash2, CheckCircle2, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

type PassLog = {
  passNo: number;
  bdv: number;       // Breakdown Voltage in kV (Target: >70)
  moisture: number;  // Moisture Content in PPM (Target: <5)
  vacuum: number;    // Degassing Vacuum in Torr (Target: <1.0)
};

type FiltrationJob = {
  id: string;
  customerName: string;
  location: string;
  transformerSno: string;
  oilCapacity: number; // in Liters
  mobilePlant: string; // e.g. "SP-10K Mobile"
  leadEngineer: string;
  startDate: string;
  status: 'Scheduled' | 'Active' | 'Completed';
  passLogs: PassLog[];
};

export default function FiltrationService() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Scheduled' | 'Active' | 'Completed'>('All');
  
  // Default interactive state with 3 default filtration jobs
  const [jobs, setJobs] = useState<FiltrationJob[]>([
    {
      id: 'FS-26-401',
      customerName: 'Tata Power Substation B',
      location: 'Kalyan Grid, MH',
      transformerSno: 'BHEL-50MVA-901',
      oilCapacity: 12000,
      mobilePlant: 'SP-10K Mobile Unit A',
      leadEngineer: 'Anoop Singh',
      startDate: '2026-06-28',
      status: 'Active',
      passLogs: [
        { passNo: 0, bdv: 24, moisture: 48, vacuum: 760 }, // initial state
        { passNo: 1, bdv: 38, moisture: 28, vacuum: 4.5 },
        { passNo: 2, bdv: 52, moisture: 15, vacuum: 1.8 },
        { passNo: 3, bdv: 68, moisture: 7, vacuum: 0.9 }
      ]
    },
    {
      id: 'FS-26-402',
      customerName: 'Reliance Industries Refineries',
      location: 'Jamnagar Plot 14, GJ',
      transformerSno: 'ABB-80MVA-442',
      oilCapacity: 22000,
      mobilePlant: 'SP-10K Mobile Unit B',
      leadEngineer: 'M. R. Dave',
      startDate: '2026-06-30',
      status: 'Active',
      passLogs: [
        { passNo: 0, bdv: 18, moisture: 60, vacuum: 760 },
        { passNo: 1, bdv: 32, moisture: 35, vacuum: 5.2 }
      ]
    },
    {
      id: 'FS-26-398',
      customerName: 'L&T Construction Site',
      location: 'Hazira Heavy Eng, GJ',
      transformerSno: 'CGL-25MVA-112',
      oilCapacity: 6500,
      mobilePlant: 'SP-6K Skid Unit C',
      leadEngineer: 'Nirav Patel',
      startDate: '2026-06-15',
      status: 'Completed',
      passLogs: [
        { passNo: 0, bdv: 22, moisture: 52, vacuum: 760 },
        { passNo: 1, bdv: 42, moisture: 22, vacuum: 3.1 },
        { passNo: 2, bdv: 65, moisture: 9, vacuum: 1.2 },
        { passNo: 3, bdv: 76, moisture: 4, vacuum: 0.7 }
      ]
    }
  ]);

  // Modal State for New Filtration Job
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTransSno, setNewTransSno] = useState('');
  const [newCapacity, setNewCapacity] = useState(10000);
  const [newPlant, setNewPlant] = useState('SP-10K Mobile Unit A');
  const [newEngineer, setNewEngineer] = useState('');
  const [newStartDate, setNewStartDate] = useState('');

  // Modal State for Logging Parameters / Performance charts
  const [activeJobForLog, setActiveJobForLog] = useState<FiltrationJob | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
  // Input fields for logging new pass parameters
  const [inputPassNo, setInputPassNo] = useState(0);
  const [inputBdv, setInputBdv] = useState(70);
  const [inputMoisture, setInputMoisture] = useState(5);
  const [inputVacuum, setInputVacuum] = useState(0.5);

  // Statistics
  const activeJobsCount = jobs.filter(j => j.status === 'Active').length;
  const totalLitersProcessed = jobs.reduce((sum, j) => sum + j.oilCapacity, 0);
  const avgInitialBdv = jobs.reduce((sum, j) => sum + (j.passLogs[0]?.bdv || 0), 0) / jobs.length;
  const avgFinalBdv = jobs.reduce((sum, j) => {
    const lastLog = j.passLogs[j.passLogs.length - 1];
    return sum + (lastLog?.bdv || 0);
  }, 0) / jobs.length;

  const handleOpenLogModal = (job: FiltrationJob) => {
    setActiveJobForLog(job);
    setInputPassNo(job.passLogs.length); // next pass number
    setInputBdv(72);
    setInputMoisture(4);
    setInputVacuum(0.5);
    setIsLogModalOpen(true);
  };

  const handleLogPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJobForLog) return;

    const newPass: PassLog = {
      passNo: inputPassNo,
      bdv: inputBdv,
      moisture: inputMoisture,
      vacuum: inputVacuum
    };

    const updatedJobs = jobs.map(j => {
      if (j.id === activeJobForLog.id) {
        const updatedLogs = [...j.passLogs, newPass];
        // If final pass reaches target (BDV >= 70 & moisture <= 5), suggest complete
        return {
          ...j,
          passLogs: updatedLogs
        };
      }
      return j;
    });

    setJobs(updatedJobs);
    
    // Update local modal data
    const updatedJobObj = updatedJobs.find(j => j.id === activeJobForLog.id);
    if (updatedJobObj) {
      setActiveJobForLog(updatedJobObj);
      setInputPassNo(updatedJobObj.passLogs.length);
    }
  };

  const handleCompleteJob = (jobId: string) => {
    setJobs(jobs.map(j => {
      if (j.id === jobId) {
        return { ...j, status: 'Completed' };
      }
      return j;
    }));
    setIsLogModalOpen(false);
  };

  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: FiltrationJob = {
      id: `FS-26-${Math.floor(403 + Math.random() * 100)}`,
      customerName: newCustomer,
      location: newLocation,
      transformerSno: newTransSno,
      oilCapacity: newCapacity,
      mobilePlant: newPlant,
      leadEngineer: newEngineer,
      startDate: newStartDate || format(new Date(), 'yyyy-MM-dd'),
      status: 'Scheduled',
      passLogs: [
        { passNo: 0, bdv: 20, moisture: 50, vacuum: 760 } // Initial site check values
      ]
    };

    setJobs([newJob, ...jobs]);
    setIsNewJobModalOpen(false);
    // Reset Form
    setNewCustomer('');
    setNewLocation('');
    setNewTransSno('');
    setNewCapacity(10000);
    setNewEngineer('');
    setNewStartDate('');
  };

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.leadEngineer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.transformerSno.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && j.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-800">Filtration Service Management</h2>
          <p className="text-zinc-500">Log, monitor, and analyze on-site transformer oil dehydration, degasification, and purification operations.</p>
        </div>
        <Dialog open={isNewJobModalOpen} onOpenChange={setIsNewJobModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-transform active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> Schedule On-Site Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <form onSubmit={handleCreateJobSubmit}>
              <DialogHeader>
                <DialogTitle>Schedule Filtration Job</DialogTitle>
                <DialogDescription>Assign a mobile filtration plant and log details for on-site transformer oil filtration.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-600">Customer Name</label>
                    <Input 
                      placeholder="e.g. NTPC Ramagundam" 
                      value={newCustomer} 
                      onChange={e => setNewCustomer(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-600">Site Location</label>
                    <Input 
                      placeholder="e.g. Karimnagar, TS" 
                      value={newLocation} 
                      onChange={e => setNewLocation(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-600">Transformer Serial No</label>
                    <Input 
                      placeholder="e.g. CGL-60MVA-04" 
                      value={newTransSno} 
                      onChange={e => setNewTransSno(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-600">Oil Capacity (Liters)</label>
                    <Input 
                      type="number" 
                      placeholder="15000" 
                      value={newCapacity} 
                      onChange={e => setNewCapacity(parseInt(e.target.value) || 10000)} 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-600">Mobile Plant Assigned</label>
                    <select 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={newPlant}
                      onChange={e => setNewPlant(e.target.value)}
                    >
                      <option value="SP-10K Mobile Unit A">SP-10K Mobile Unit A (10000 LPH)</option>
                      <option value="SP-10K Mobile Unit B">SP-10K Mobile Unit B (10000 LPH)</option>
                      <option value="SP-6K Skid Unit C">SP-6K Skid Unit C (6000 LPH)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-600">Lead Field Engineer</label>
                    <Input 
                      placeholder="e.g. S. G. Vyas" 
                      value={newEngineer} 
                      onChange={e => setNewEngineer(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-600">Job Start Date</label>
                  <Input 
                    type="date" 
                    value={newStartDate} 
                    onChange={e => setNewStartDate(e.target.value)} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewJobModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Create Job Schedule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Active Filtration Sites</CardTitle>
            <Activity className="h-4 w-4 text-teal-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-800">{activeJobsCount}</div>
            <p className="text-xs text-zinc-400">Plants actively circulating oil</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Total Volume Serviced</CardTitle>
            <Droplet className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600">{totalLitersProcessed.toLocaleString('en-IN')} L</div>
            <p className="text-xs text-zinc-400">Aggregated transformer oil capacity</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Avg BDV Value (Initial)</CardTitle>
            <Wrench className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-600">{avgInitialBdv.toFixed(1)} kV</div>
            <p className="text-xs text-zinc-400">Initial breakdown voltage</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Avg BDV Value (Current)</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {avgFinalBdv ? avgFinalBdv.toFixed(1) : 0} kV
            </div>
            <p className="text-xs text-emerald-500 font-medium">
              +{avgInitialBdv ? (((avgFinalBdv - avgInitialBdv) / avgInitialBdv) * 100).toFixed(0) : 0}% Quality Improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Register Table */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-zinc-800">Filtration Operations Logs</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search site, client, or engineer..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex bg-zinc-100 p-1 rounded-md text-xs">
                {(['All', 'Scheduled', 'Active', 'Completed'] as const).map(status => (
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
                <TableHead>Job ID</TableHead>
                <TableHead>Client & Substation Site</TableHead>
                <TableHead>Transformer Info</TableHead>
                <TableHead>Plant Assigned</TableHead>
                <TableHead>Passes Run</TableHead>
                <TableHead>Quality Status</TableHead>
                <TableHead>Lead Engineer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map(job => {
                const lastLog = job.passLogs[job.passLogs.length - 1];
                const initialLog = job.passLogs[0];
                return (
                  <TableRow key={job.id} className="hover:bg-zinc-50/50">
                    <TableCell className="font-semibold text-teal-600 text-xs">{job.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-zinc-800">{job.customerName}</div>
                      <div className="text-[10px] text-zinc-400">{job.location}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium text-zinc-700">{job.transformerSno}</div>
                      <div className="text-[10px] text-zinc-400">{job.oilCapacity.toLocaleString('en-IN')} Liters</div>
                    </TableCell>
                    <TableCell className="text-zinc-600 text-xs font-medium">{job.mobilePlant}</TableCell>
                    <TableCell className="text-center font-bold text-zinc-700">{job.passLogs.length - 1}</TableCell>
                    <TableCell className="text-xs">
                      {lastLog ? (
                        <div className="space-y-0.5">
                          <div>
                            <span className="font-semibold text-zinc-700">BDV:</span>{' '}
                            <span className={lastLog.bdv >= 70 ? 'text-emerald-600 font-bold' : 'text-zinc-600'}>
                              {lastLog.bdv} kV
                            </span>
                            <span className="text-[10px] text-zinc-400 ml-1">(init {initialLog?.bdv}kV)</span>
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-700">Moisture:</span>{' '}
                            <span className={lastLog.moisture <= 5 ? 'text-emerald-600 font-bold' : 'text-zinc-600'}>
                              {lastLog.moisture} PPM
                            </span>
                            <span className="text-[10px] text-zinc-400 ml-1">(init {initialLog?.moisture}ppm)</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-400">No logs yet</span>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-600 font-medium text-xs">{job.leadEngineer}</TableCell>
                    <TableCell>
                      <Badge variant={
                        job.status === 'Completed' ? 'default' : 
                        job.status === 'Active' ? 'secondary' : 'outline'
                      }>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant={job.status === 'Active' ? 'default' : 'ghost'} 
                        className={job.status === 'Active' ? 'bg-zinc-800 hover:bg-zinc-900 text-white' : ''}
                        onClick={() => handleOpenLogModal(job)}
                      >
                        {job.status === 'Active' ? 'Log & Track' : 'View Logs'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-zinc-400">
                    No filtration service jobs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Parameters & View Charts Dialog */}
      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          {activeJobForLog && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Activity className="h-5 w-5 text-teal-500 animate-pulse" />
                  Filtration Parameters & Performance Chart
                </DialogTitle>
                <DialogDescription>
                  Site: <span className="font-semibold text-zinc-800">{activeJobForLog.customerName}</span> | Plant: {activeJobForLog.mobilePlant}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-6 py-4">
                {/* Left: Chart Visualization */}
                <div className="col-span-2 space-y-4">
                  <div className="border p-4 rounded-lg bg-zinc-50/50 shadow-inner h-[280px]">
                    <h4 className="text-xs font-bold text-zinc-600 mb-2 uppercase text-center tracking-wide">
                      Oil Filtration Pass Curve (BDV vs Moisture)
                    </h4>
                    <ResponsiveContainer width="100%" height="90%">
                      <LineChart
                        data={activeJobForLog.passLogs}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="passNo" 
                          label={{ value: 'Filtration Cycle Pass #', position: 'insideBottom', offset: -5 }} 
                          tickFormatter={(v) => v === 0 ? 'Init' : `Pass ${v}`}
                        />
                        <YAxis yAxisId="left" label={{ value: 'BDV (kV)', angle: -90, position: 'insideLeft', offset: 10 }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Moisture (PPM)', angle: 90, position: 'insideRight', offset: 10 }} />
                        <Tooltip />
                        <Legend verticalAlign="top" height={36}/>
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="bdv" 
                          stroke="#10b981" 
                          name="BDV (kV) - Target >70" 
                          strokeWidth={3} 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="moisture" 
                          stroke="#ef4444" 
                          name="Moisture (PPM) - Target <5" 
                          strokeWidth={3} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Logs History Table */}
                  <div className="border rounded-md max-h-[150px] overflow-y-auto">
                    <table className="w-full text-xs text-center">
                      <thead className="bg-zinc-100 font-semibold sticky top-0">
                        <tr>
                          <th className="py-1.5 border-b">Pass</th>
                          <th className="py-1.5 border-b">BDV (kV)</th>
                          <th className="py-1.5 border-b">Moisture (PPM)</th>
                          <th className="py-1.5 border-b">Vacuum (Torr)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {activeJobForLog.passLogs.map((log) => (
                          <tr key={log.passNo} className={log.passNo === 0 ? 'bg-zinc-50 font-medium' : ''}>
                            <td className="py-1.5">{log.passNo === 0 ? 'Initial Test' : `Pass ${log.passNo}`}</td>
                            <td className={`py-1.5 font-bold ${log.bdv >= 70 ? 'text-emerald-600' : 'text-zinc-700'}`}>{log.bdv} kV</td>
                            <td className={`py-1.5 font-bold ${log.moisture <= 5 ? 'text-emerald-600' : 'text-zinc-700'}`}>{log.moisture} PPM</td>
                            <td className="py-1.5 text-zinc-500">{log.vacuum} Torr</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Parameter Entry Form */}
                <div className="col-span-1 border rounded-lg p-4 bg-white shadow-sm space-y-4">
                  {activeJobForLog.status === 'Active' ? (
                    <form onSubmit={handleLogPassSubmit} className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-700 uppercase border-b pb-1">
                        Log Pass #{inputPassNo} Results
                      </h4>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase">Pass Number</label>
                        <Input 
                          type="number" 
                          value={inputPassNo} 
                          onChange={e => setInputPassNo(parseInt(e.target.value) || 0)} 
                          className="h-8"
                          required 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase">Breakdown Voltage (kV)</label>
                        <Input 
                          type="number" 
                          value={inputBdv} 
                          onChange={e => setInputBdv(parseInt(e.target.value) || 0)} 
                          className="h-8"
                          required 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase">Moisture Content (PPM)</label>
                        <Input 
                          type="number" 
                          value={inputMoisture} 
                          onChange={e => setInputMoisture(parseInt(e.target.value) || 0)} 
                          className="h-8"
                          required 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase">Degassing Vacuum (Torr)</label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={inputVacuum} 
                          onChange={e => setInputVacuum(parseFloat(e.target.value) || 0.1)} 
                          className="h-8"
                          required 
                        />
                      </div>
                      <Button type="submit" className="w-full h-8 mt-2 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                        Record Pass Parameters
                      </Button>
                    </form>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-2 text-zinc-400 space-y-2">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                      <div>
                        <p className="font-semibold text-zinc-700 text-xs">Job Completed</p>
                        <p className="text-[10px] mt-0.5">Parameters are locked as oil reaches target specifications.</p>
                      </div>
                    </div>
                  )}

                  {activeJobForLog.status === 'Active' && (
                    <div className="pt-2 border-t mt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full text-red-500 border-red-200 hover:bg-red-50 text-xs h-8"
                        onClick={() => handleCompleteJob(activeJobForLog.id)}
                      >
                        Finalize & Close Job
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="border-t pt-3">
                <Button variant="outline" size="sm" onClick={() => setIsLogModalOpen(false)}>Close Window</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
