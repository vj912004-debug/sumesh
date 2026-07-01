import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { 
  Users, UserCheck, ShieldAlert, Plus, Search, Eye, CheckCircle2, XCircle, Printer, Calendar
} from 'lucide-react';

interface Visitor {
  passId: string;
  name: string;
  phone: string;
  company: string;
  purpose: string;
  host: string;
  entryTime: string;
  exitTime?: string;
  status: 'Checked-In' | 'Checked-Out';
  remarks?: string;
}

export default function VisitorRegistry() {
  const [visitors, setVisitors] = useState<Visitor[]>(() => {
    const saved = localStorage.getItem('visitorRegistry');
    if (saved) return JSON.parse(saved);
    
    // Initial mock data
    return [
      { passId: 'PASS-8901', name: 'Rakesh Mehta', phone: '98250XXXXX', company: 'Adani Power', purpose: 'Client Meeting', host: 'Suketu Shah', entryTime: '2026-07-01 10:15 AM', status: 'Checked-In', remarks: 'Needs security escort to Block B' },
      { passId: 'PASS-8902', name: 'John Doe', phone: '90011XXXXX', company: 'TUV Nord India', purpose: 'Audit', host: 'Sneha Patel', entryTime: '2026-07-01 09:30 AM', status: 'Checked-In', remarks: 'Annual ISO 9001 QMS auditor' },
      { passId: 'PASS-8900', name: 'Vikram Patel', phone: '87654XXXXX', company: 'VRL Transporters', purpose: 'Vendor Delivery', host: 'Logistics Desk', entryTime: '2026-07-01 08:00 AM', exitTime: '2026-07-01 11:30 AM', status: 'Checked-Out', remarks: 'Material delivery receipt check' },
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Checked-In' | 'Checked-Out'>('All');

  // Checkin Modal
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [purpose, setPurpose] = useState('Client Meeting');
  const [host, setHost] = useState('');
  const [remarks, setRemarks] = useState('');

  // Print Pass modal
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    localStorage.setItem('visitorRegistry', JSON.stringify(visitors));
  }, [visitors]);

  const handleCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const entryTime = now.toISOString().replace('T', ' ').substring(0, 16);
    
    const newVisitor: Visitor = {
      passId: `PASS-${Math.floor(8903 + Math.random() * 1000)}`,
      name,
      phone,
      company,
      purpose,
      host,
      entryTime,
      status: 'Checked-In',
      remarks
    };

    setVisitors([newVisitor, ...visitors]);
    setIsCheckinOpen(false);
    
    // Clear fields
    setName('');
    setPhone('');
    setCompany('');
    setPurpose('Client Meeting');
    setHost('');
    setRemarks('');
  };

  const handleCheckout = (passId: string) => {
    const now = new Date();
    const exitTime = now.toISOString().replace('T', ' ').substring(0, 16);
    setVisitors(visitors.map(v => 
      v.passId === passId ? { ...v, status: 'Checked-Out', exitTime } : v
    ));
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter visitors
  const filteredVisitors = visitors.filter(v => {
    const searchStr = `${v.name} ${v.company} ${v.host} ${v.passId}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = visitors.filter(v => v.status === 'Checked-In').length;
  const totalToday = visitors.length;

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Visitor Management & Gate Registry</h2>
          <p className="text-muted-foreground">Manage visitor logs, security clearances, and check-outs.</p>
        </div>
        <Button onClick={() => setIsCheckinOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Register Visitor
        </Button>
      </div>

      {/* KPI stats */}
      <div className="grid gap-4 sm:grid-cols-3 print:hidden">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Visitors On-Site</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{activeCount}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Visitors Today</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{totalToday}</h3>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security Clearances</p>
              <Badge variant="outline" className="mt-1 text-green-600 border-green-600 bg-green-50/50">
                100% Cleared
              </Badge>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registry Table */}
      <Card className="shadow-sm print:shadow-none print:border-none">
        <CardHeader className="pb-3 border-b print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl font-bold">Gate Logs</CardTitle>
            
            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
              <div className="relative flex-1 md:w-64 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search Visitor, Company, Host..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Status Tab Filters */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border text-xs font-medium">
                {(['All', 'Checked-In', 'Checked-Out'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      statusFilter === tab 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-semibold' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="font-semibold py-4 pl-6 w-28">Pass ID</TableHead>
                <TableHead className="font-semibold">Visitor Name</TableHead>
                <TableHead className="font-semibold">Company Represented</TableHead>
                <TableHead className="font-semibold">Purpose</TableHead>
                <TableHead className="font-semibold">Host / Meet</TableHead>
                <TableHead className="font-semibold">Entry Time</TableHead>
                <TableHead className="font-semibold">Exit Time</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-right pr-6 print:hidden">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisitors.length === 0 ? (
                <TableRow>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground text-sm">
                    No visitor logs found matching the filters.
                  </td>
                </TableRow>
              ) : (
                filteredVisitors.map((v) => (
                  <TableRow key={v.passId} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="font-mono font-bold text-xs pl-6 py-3.5 text-blue-600 dark:text-blue-400">{v.passId}</td>
                    <td className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      <p>{v.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{v.phone}</p>
                    </td>
                    <td className="text-slate-700 dark:text-slate-300 font-medium text-xs">{v.company}</td>
                    <td className="text-xs">
                      <Badge variant="outline" className="text-slate-600 dark:text-slate-400">{v.purpose}</Badge>
                    </td>
                    <td className="text-xs font-semibold text-slate-800 dark:text-slate-200">{v.host}</td>
                    <td className="text-xs font-mono text-slate-400">{v.entryTime}</td>
                    <td className="text-xs font-mono text-slate-400">{v.exitTime || '-'}</td>
                    <td className="text-center">
                      <Badge variant={v.status === 'Checked-In' ? 'default' : 'secondary'} className={
                        v.status === 'Checked-In' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }>
                        {v.status === 'Checked-In' ? 'On Site' : 'Checked Out'}
                      </Badge>
                    </td>
                    <td className="text-right pr-6 space-x-1 print:hidden">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-slate-800 dark:hover:text-white" 
                        title="Print visitor pass"
                        onClick={() => setSelectedVisitor(v)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {v.status === 'Checked-In' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-950" 
                          title="Checkout Visitor"
                          onClick={() => handleCheckout(v.passId)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Checkin Form Modal */}
      <Dialog open={isCheckinOpen} onOpenChange={setIsCheckinOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCheckin}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Security Gate Check-In
              </DialogTitle>
              <DialogDescription>
                Register guest details for security clearance and gate logs.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 border-b border-t my-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-bold text-slate-500 block">Visitor Full Name *</label>
                  <Input placeholder="e.g. Ramesh Shah" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-slate-500 block">Contact Phone *</label>
                  <Input placeholder="e.g. 98765 XXXXX" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-bold text-slate-500 block">Company Name *</label>
                  <Input placeholder="e.g. Reliance, VRL Transports" value={company} onChange={e => setCompany(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-slate-500 block">Purpose of Visit *</label>
                  <select 
                    value={purpose} 
                    onChange={e => setPurpose(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Client Meeting">Client Meeting</option>
                    <option value="Vendor Delivery">Vendor Delivery</option>
                    <option value="Audit">Audit</option>
                    <option value="Interview">Interview</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="General">General / Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-500 block">Host Person / Dept *</label>
                <Input placeholder="e.g. Suketu Shah, Purchasing Team" value={host} onChange={e => setHost(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-500 block">Special Remarks / Security Instructions</label>
                <Input placeholder="e.g. Carry laptop, requires visitor escort badge" value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Check-In Guest</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Visitor Badge Print Modal */}
      <Dialog open={selectedVisitor !== null} onOpenChange={(open) => { if(!open) setSelectedVisitor(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          {selectedVisitor && (
            <div className="space-y-4">
              <DialogHeader className="print:hidden">
                <DialogTitle>Visitor Pass</DialogTitle>
                <DialogDescription>Print visitor pass for GIDC industrial entry badge.</DialogDescription>
              </DialogHeader>

              {/* Printable Visitor Pass Card */}
              <div className="border border-slate-900 bg-white text-black p-6 rounded-lg text-center space-y-4 font-sans max-w-sm mx-auto shadow-sm">
                <div className="border-b-2 pb-2">
                  <h3 className="font-bold text-lg leading-tight uppercase">Sumesh Petroleum Pvt. Ltd.</h3>
                  <p className="text-[9px] text-slate-500 tracking-wider">MAKARPURA GIDC, VADODARA</p>
                </div>
                
                <div className="inline-block border border-red-500 bg-red-50 text-red-600 font-extrabold px-4 py-0.5 rounded text-xs uppercase tracking-wider">
                  Visitor Pass
                </div>

                <div className="py-2 border rounded-lg bg-slate-50/50 flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Pass Identifier</span>
                  <span className="font-mono text-base font-extrabold text-blue-600">{selectedVisitor.passId}</span>
                </div>

                <div className="space-y-1.5 text-xs text-left">
                  <div className="flex border-b pb-1">
                    <span className="w-24 text-slate-400 font-bold">Visitor:</span>
                    <span className="font-bold text-slate-950">{selectedVisitor.name}</span>
                  </div>
                  <div className="flex border-b pb-1">
                    <span className="w-24 text-slate-400 font-bold">Company:</span>
                    <span className="font-semibold">{selectedVisitor.company}</span>
                  </div>
                  <div className="flex border-b pb-1">
                    <span className="w-24 text-slate-400 font-bold">Host Person:</span>
                    <span className="font-bold">{selectedVisitor.host}</span>
                  </div>
                  <div className="flex border-b pb-1">
                    <span className="w-24 text-slate-400 font-bold">Purpose:</span>
                    <span>{selectedVisitor.purpose}</span>
                  </div>
                  <div className="flex pb-1">
                    <span className="w-24 text-slate-400 font-bold">Checked-In:</span>
                    <span className="font-mono text-[10px]">{selectedVisitor.entryTime}</span>
                  </div>
                </div>

                <div className="text-[8px] text-slate-400 border-t pt-2 font-medium">
                  Valid on check-in date only. Must display this badge at all times on site. Return pass at gate exit.
                </div>
              </div>

              <DialogFooter className="print:hidden">
                <Button variant="outline" onClick={() => setSelectedVisitor(null)}>Close</Button>
                <Button onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" /> Print Badge
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
