import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, ArrowUpRight, Clock, CheckCircle2, 
  ShieldAlert, Database, HelpCircle, Code, Layers, FileText, Send, 
  MessageSquare, Mail, Play, RotateCcw, AlertTriangle, ShieldCheck,
  Truck, Wallet, Shield
} from 'lucide-react';

// Sparkline Data
const revSparkData = [{ v: 30 }, { v: 45 }, { v: 35 }, { v: 60 }, { v: 40 }, { v: 75 }, { v: 80 }];
const invSparkData = [{ v: 50 }, { v: 30 }, { v: 40 }, { v: 25 }, { v: 45 }, { v: 35 }, { v: 38 }];
const orderSparkData = [{ v: 20 }, { v: 30 }, { v: 25 }, { v: 50 }, { v: 45 }, { v: 60 }, { v: 65 }];
const projSparkData = [{ v: 8 }, { v: 10 }, { v: 9 }, { v: 12 }, { v: 11 }, { v: 13 }, { v: 13 }];

// Main Monthly Area Data
const areaData = [
  { name: 'Jan', revenue: 240 },
  { name: 'Feb', revenue: 380 },
  { name: 'Mar', revenue: 300 },
  { name: 'Apr', revenue: 510 },
  { name: 'May', revenue: 420 },
  { name: 'Jun', revenue: 640 },
  { name: 'Jul', revenue: 580 },
  { name: 'Aug', revenue: 750 },
];

// Expense Pie Data
const pieData = [
  { name: 'Raw Materials', value: 45 },
  { name: 'Logistics/Freight', value: 25 },
  { name: 'Labor & Wages', value: 18 },
  { name: 'Admin & Taxes', value: 12 },
];
const COLORS = ['#1e3a8a', '#3b82f6', '#0d9488', '#34d399']; // navy, cobalt, teal, mint green

export default function Dashboard() {
  const [marketFilter, setMarketFilter] = useState('All markets');

  // Simulation state logs
  const [simLogs, setSimLogs] = useState<string[]>([
    'System Initialized. Awaiting trial run completions, dispatch flags, or billing cycle cycles...'
  ]);

  // Simulator Progress States
  const [qmsStep, setQmsStep] = useState(0);
  const [logStep, setLogStep] = useState(0);
  const [finStep, setFinStep] = useState(0);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSimLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 15));
  };

  // QMS simulation handlers
  const triggerQmsStep = () => {
    if (qmsStep === 0) {
      setQmsStep(1);
      addLog('[QMS] Trial run logged as "Satisfactory" by Hardik Patel (Technician).');
      addLog('[DB] Auto-generated task: "Review and Digitally Sign Performance Test Report for Serial SP/DHV/T/717" (assigned to Dhruv Shah, QC Manager, 24h deadline).');
    } else if (qmsStep === 1) {
      setQmsStep(2);
      addLog('[QC] Performance Report signed off digitally by Dhruv Shah (QC Manager).');
      addLog('[PDF Engine] Compiled all 6 inspection sheets into: "Final reports 717_2.pdf".');
      addLog('[SMTP Relay] PDF dispatched to Powergrid Corporation engineering team (procurement.eng@powergrid.in).');
    } else if (qmsStep === 2) {
      setQmsStep(3);
      addLog('[WhatsApp Gateway] Notification sent to internal supervisor: "Task Completed: QC Sign-off for Powergrid machine SP/DHV/T/717 is complete. BDV achieved: 74 KV. Client notified via email."');
    }
  };

  const resetQms = () => {
    setQmsStep(0);
    addLog('[QMS] Simulator reset.');
  };

  // Logistics simulation handlers
  const triggerLogisticsStep = () => {
    if (logStep === 0) {
      setLogStep(1);
      addLog('[Logistics] Sales order marked as "Ready to Dispatch" for Returnable Challan R000003810.');
      addLog('[DB] Auto-generated task: "Generate e-Way Bill and assign vehicle for R000003810" (assigned to Logistics Team).');
    } else if (logStep === 1) {
      setLogStep(2);
      addLog('[Logistics] Vehicle No. "DL01LAF8056" assigned. Driver phone 9887468329 retrieved.');
      addLog('[WhatsApp Gateway] Dispatched loading instructions to driver: "Hi, you are assigned to vehicle DL01LAF8056 for delivery to Skipper Seil Ltd, Bhiwadi. Please tap link to confirm loading."');
    } else if (logStep === 2) {
      setLogStep(3);
      addLog('[NIC Tax Link] e-Way Bill generated. Outbound email pushed to customer\'s warehouse team (receiving@skipperseil.com) with shipping details.');
    }
  };

  const resetLogistics = () => {
    setLogStep(0);
    addLog('[Logistics] Simulator reset.');
  };

  // Finance simulation handlers
  const triggerFinanceStep = () => {
    if (finStep === 0) {
      setFinStep(1);
      addLog('[Finance] Calendar cycle reached 4th of month (cycle 05.03.2026 to 04.04.2026).');
      addLog('[DB] Auto-generated billing task: "Review and Post Recurring Invoice No. 11 for Atlas Filtration" (assigned to Accounts Team).');
    } else if (finStep === 1) {
      setFinStep(2);
      addLog('[NIC Tax Link] e-Invoice posted. IRN and QR code returned.');
      addLog('[SMTP Relay] Legally compliant invoice emailed to AP department (ap@atlasfiltration.com).');
    } else if (finStep === 2) {
      setFinStep(3);
      addLog('[Finance] Payment term "Immediate" unpaid after 3 days. Task escalated to "Overdue".');
      addLog('[WhatsApp Gateway] Automated alert sent to Atlas: "Late invoice warning. Penalties and interest applied under MSMED framework guidelines."');
    }
  };

  const resetFinance = () => {
    setFinStep(0);
    addLog('[Finance] Simulator reset.');
  };

  return (
    <div className="space-y-6">
      {/* Top Greeting */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          Welcome back, Sarah Jones!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Corporate Operations overview and system-wide ERP modules control center.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <Card className="bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-800 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-1">
                  $1,501.8K
                </h3>
                <span className="inline-flex items-center text-xs font-bold text-green-600 mt-2 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14.2%
                </span>
              </div>
              <div className="w-24 h-10 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revSparkData}>
                    <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-800 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Pending Invoices
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-1">
                  1,139
                </h3>
                <span className="inline-flex items-center text-xs font-bold text-blue-600 mt-2 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded">
                  Active Reviews
                </span>
              </div>
              <div className="w-24 h-10 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={invSparkData}>
                    <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-800 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Open Orders
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-1">
                  322
                </h3>
                <span className="inline-flex items-center text-xs font-bold text-blue-600 mt-2 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded">
                  Awaiting Delivery
                </span>
              </div>
              <div className="w-24 h-10 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={orderSparkData}>
                    <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-800 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Active Projects
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-1">
                  13
                </h3>
                <span className="inline-flex items-center text-xs font-bold text-teal-600 mt-2 bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded">
                  Live Operations
                </span>
              </div>
              <div className="w-24 h-10 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projSparkData}>
                    <Line type="monotone" dataKey="v" stroke="#0d9488" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Activity Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
        {/* Monthly Revenue Trend - Spans 60% (3/5 cols) */}
        <Card className="bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-800 shadow-sm rounded-xl lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Monthly Revenue Trend
              </CardTitle>
              <CardDescription>Smooth area chart showing cumulative revenue indicators.</CardDescription>
            </div>
            <select 
              value={marketFilter} 
              onChange={e => setMarketFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded px-2.5 py-1 text-slate-600 dark:text-slate-400 focus:outline-none"
            >
              <option value="All markets">All markets</option>
              <option value="Domestic">Domestic</option>
              <option value="Exports">Exports</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="#888888" />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#888888" tickFormatter={(value) => `$${value}k`} />
                  <Tooltip formatter={(value) => [`$${value}K`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTeal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown Donut Chart - Spans 20% (1/5 cols) */}
        <Card className="bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-800 shadow-sm rounded-xl lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Expenses
            </CardTitle>
            <CardDescription>Cool tones distribution.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-between items-center h-[300px]">
            <div className="w-full h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">₹8.4M</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Outlay</span>
              </div>
            </div>
            <div className="w-full space-y-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[i] }} />
                    {d.name}
                  </span>
                  <span className="font-bold">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed - Spans 20% (1/5 cols) */}
        <Card className="bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-800 shadow-sm rounded-xl lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Recent Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] overflow-y-auto pr-1">
            <div className="space-y-4">
              {[
                { title: 'New Purchase Order #1234', desc: 'Material supply order posted by Reliance.', time: '2 hours ago' },
                { title: 'e-Way Bill Assigned', desc: 'Vehicle DL01LAF8056 registered for dispatch.', time: '5 hours ago' },
                { title: 'QMS Signed Off', desc: 'Dhruv Shah approved machine release reports.', time: '1 day ago' },
                { title: 'Atlas Invoice Pending', desc: 'Recurring bill posted for storage tank hire.', time: '2 days ago' }
              ].map((activity, i) => (
                <div key={i} className="pb-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
                  <div className="flex justify-between items-start gap-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {activity.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {activity.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Workflow Simulator widget */}
      <Card className="bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-800 shadow-sm rounded-xl">
        <CardHeader className="border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                ERP Integration & Communication Workflows Simulator
              </CardTitle>
              <CardDescription>
                Simulate end-to-end triggers, task creation states, automatic emails, and webhook responses.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSimLogs(['Console cleared. ready to log events.'])}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
            
            {/* Control Column */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Pathway 1: QMS */}
              <div className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      1. QMS trial run & Release sign-off
                    </h4>
                  </div>
                  <Badge variant={qmsStep === 3 ? 'default' : 'secondary'} className={qmsStep === 3 ? 'bg-green-50 text-green-700' : ''}>
                    {qmsStep === 0 ? 'Idle' : qmsStep === 1 ? 'Task Assigned' : qmsStep === 2 ? 'PDF Emailed' : 'Complete'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Engineering trial run ➡️ QC task for Dhruv Shah ➡️ Auto-compile 6 sheets to PDF ➡️ Send to Powergrid.
                </p>
                <div className="flex gap-2">
                  {qmsStep < 3 ? (
                    <Button size="sm" onClick={triggerQmsStep}>
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      {qmsStep === 0 ? 'Log Trial Run "Satisfactory"' : qmsStep === 1 ? 'Sign off as Dhruv Shah (QC)' : 'Fire WhatsApp Confirmation'}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={resetQms}>
                      Reset Simulator
                    </Button>
                  )}
                </div>
                {/* Simulated Output progress visualizer */}
                {qmsStep > 0 && (
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${qmsStep >= 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={qmsStep >= 1 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>
                        Hardik Patel logged "Satisfactory" trial run on SP/DHV/T/717.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${qmsStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={qmsStep >= 2 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>
                        Dhruv Shah signed. System generated <strong>Final reports 717_2.pdf</strong>.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${qmsStep >= 3 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={qmsStep >= 3 ? 'text-slate-800 dark:text-slate-200 text-green-600' : 'text-slate-400'}>
                        WhatsApp notification dispatched to project supervisor.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pathway 2: Logistics */}
              <div className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      2. Logistics, Dispatch & Gate Pass
                    </h4>
                  </div>
                  <Badge variant={logStep === 3 ? 'default' : 'secondary'} className={logStep === 3 ? 'bg-blue-50 text-blue-700' : ''}>
                    {logStep === 0 ? 'Idle' : logStep === 1 ? 'e-Way Task' : logStep === 2 ? 'Driver Notified' : 'Complete'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Ready to Dispatch ➡️ Logistics task (Challan R000003810) ➡️ Assign truck DL01LAF8056 ➡️ Driver WhatsApp alert.
                </p>
                <div className="flex gap-2">
                  {logStep < 3 ? (
                    <Button size="sm" onClick={triggerLogisticsStep}>
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      {logStep === 0 ? 'Mark SO "Ready to Dispatch"' : logStep === 1 ? 'Assign Truck DL01LAF8056' : 'Dispatched: Leave Gate'}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={resetLogistics}>
                      Reset Simulator
                    </Button>
                  )}
                </div>
                {/* Visualizer */}
                {logStep > 0 && (
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${logStep >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      <span className={logStep >= 1 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>
                        Challan R000003810 flagged. Logistics team assigned to routing task.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${logStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      <span className={logStep >= 2 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>
                        WhatsApp sent to driver (9887468329): "Hi, you are assigned to vehicle DL01LAF8056..."
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${logStep >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      <span className={logStep >= 3 ? 'text-slate-800 dark:text-slate-200 text-blue-600' : 'text-slate-400'}>
                        Gate release confirmed. e-Way bill emailed to receiving@skipperseil.com.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pathway 3: Finance & Rentals */}
              <div className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      3. Finance, Billing & MSMED Escalations
                    </h4>
                  </div>
                  <Badge variant={finStep === 3 ? 'destructive' : 'secondary'} className={finStep === 3 ? 'animate-pulse' : ''}>
                    {finStep === 0 ? 'Idle' : finStep === 1 ? 'Billing Task' : finStep === 2 ? 'Invoice Posted' : 'MSMED Escalated'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Billing cycle closes on 4th ➡️ accounts review task ➡️ post e-Invoice ➡️ late fee payment follow-up escalation.
                </p>
                <div className="flex gap-2">
                  {finStep < 3 ? (
                    <Button size="sm" onClick={triggerFinanceStep}>
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      {finStep === 0 ? 'Cycle Ends: Trigger 4th of Month' : finStep === 1 ? 'Post e-Invoice (IRN Portal)' : 'Simulate 3 Days Unpaid Delay'}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={resetFinance}>
                      Reset Simulator
                    </Button>
                  )}
                </div>
                {/* Visualizer */}
                {finStep > 0 && (
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${finStep >= 1 ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                      <span className={finStep >= 1 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>
                        Accounts review task generated for Atlas Filtration (billing cycle 05.03.2026 to 04.04.2026).
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${finStep >= 2 ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                      <span className={finStep >= 2 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>
                        e-Invoice posted. SWIFT banking details mapped. IRN generated.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${finStep >= 3 ? 'bg-red-500' : 'bg-gray-300'}`} />
                      <span className={finStep >= 3 ? 'text-red-600 font-semibold' : 'text-slate-400'}>
                        Payment overdue (3 days). Fired MSMED compliance WhatsApp collection warning.
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Simulated Live Logs Terminal */}
            <div className="lg:col-span-4 flex flex-col h-full min-h-[300px]">
              <div className="flex items-center justify-between bg-slate-900 text-slate-400 px-4 py-2 rounded-t-lg text-xs font-mono">
                <span>Integration live logs</span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
              </div>
              <div className="bg-slate-950 text-green-400 font-mono p-4 rounded-b-lg flex-1 h-[360px] overflow-y-auto text-[11px] space-y-2.5 select-all">
                {simLogs.map((log, i) => (
                  <p key={i} className="leading-relaxed border-l border-green-950 pl-2">
                    {log}
                  </p>
                ))}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Developer Guidelines Tabbed Spec Sheet Card */}
      <Card className="bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-800 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-blue-600" /> CORP-ERP Developer System Guidelines
          </CardTitle>
          <CardDescription>Statutory schema guidelines, messaging webhooks, and SMTP relay specs for engineers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="db" className="w-full">
            <TabsList className="mb-4 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
              <TabsTrigger value="db" className="text-xs">Database Schema</TabsTrigger>
              <TabsTrigger value="webhooks" className="text-xs">WhatsApp API Webhooks</TabsTrigger>
              <TabsTrigger value="smtp" className="text-xs">Email PDF Generation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="db">
              <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/30 text-xs font-mono space-y-2 whitespace-pre-wrap">
{`-- Centralized Tasks Schema
CREATE TABLE tasks (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  assigned_to VARCHAR(100) NOT NULL,
  status VARCHAR(30) DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Awaiting QC Approval', 'Completed', 'Escalated'
  due_date TIMESTAMP NOT NULL,
  client_id VARCHAR(50) REFERENCES clients(id),
  invoice_id VARCHAR(50) REFERENCES invoices(id),
  equipment_serial VARCHAR(50) REFERENCES equipment_serial_numbers(id),
  escalated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MSMED Accounts penalization logs
CREATE TABLE msmed_escalation_logs (
  id SERIAL PRIMARY KEY,
  invoice_id VARCHAR(50) REFERENCES invoices(id),
  interest_rate_multiplier NUMERIC(4,2) DEFAULT 3.00, -- 3x RBI bank rate
  late_days INT NOT NULL,
  accrued_penalty_amount NUMERIC(12,2) NOT NULL,
  whatsapp_sent BOOLEAN DEFAULT FALSE
);`}
              </div>
            </TabsContent>

            <TabsContent value="webhooks">
              <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/30 text-xs font-mono space-y-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Webhook Listener (Meta API Endpoints):</p>
                <div className="p-3 bg-slate-950 text-green-400 rounded">
{`POST /webhooks/whatsapp/inbound
Request Body:
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "9887468329",
          "text": { "body": "Delayed due to traffic" }
        }]
      }
    }]
  }]
}`}
                </div>
                <p className="text-slate-500 leading-relaxed mt-2 text-[11px]">
                  <strong>System Action:</strong> The webhook intercepts the inbound message body, queries the `tasks` table for an active delivery mapping matching phone number `9887468329`, and logs the text response under that specific dispatch run in real-time.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="smtp">
              <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/30 text-xs space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold font-mono">
                  <Shield className="w-4 h-4" /> Amazon SES Security Rule
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  <strong>Strict Attachment Verification Policy:</strong> Manual attachments are completely disabled in code to avoid operators uploading incorrect audit sheets or invoices. 
                </p>
                <div className="p-3 bg-slate-950 text-green-400 rounded font-mono text-[11px]">
{`// Transactional Document Generation Code (Amazon SES integration)
async function dispatchDocument(invoiceId) {
  const schemaDetails = await db.fetchInvoiceWithItems(invoiceId);
  const pdfBuffer = await pdfGenerator.compileHtmlTemplate(schemaDetails);
  
  await ses.sendEmailWithAttachment({
    to: schemaDetails.clientEmail,
    subject: \`Tax Invoice \${schemaDetails.invoiceNo} - Sumesh Petroleum\`,
    body: "Please find attached your legally compliant tax invoice.",
    attachmentName: \`\${schemaDetails.invoiceNo}.pdf\`,
    attachmentBuffer: pdfBuffer
  });
}`}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
