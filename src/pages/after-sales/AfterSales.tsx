import { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Wrench, PhoneCall, Plus } from 'lucide-react';

interface ServiceTicket {
  id: string;
  customer: string;
  machine: string;
  type: string;
  status: string;
  date: string;
  sparesUsed?: string;
}

export default function AfterSales() {
  const [tickets, setTickets] = useState<ServiceTicket[]>([
    { id: 'SRV-26-401', customer: 'Tata Power', machine: 'SP/26/1012', type: 'Warranty', status: 'Open', date: '2026-06-29' },
    { id: 'SRV-26-402', customer: 'Reliance Ind.', machine: 'SP/24/0905', type: 'AMC Routine', status: 'Scheduled', date: '2026-07-05' },
    { id: 'SRV-26-403', customer: 'Adani Electricity', machine: 'SP/21/0401', type: 'Breakdown', status: 'In Progress', date: '2026-06-30', sparesUsed: 'Filter Cartridges (x2)' },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [customer, setCustomer] = useState('');
  const [machine, setMachine] = useState('');
  const [callType, setCallType] = useState('Warranty');
  const [spares, setSpares] = useState('');

  const handleLogCall = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `SRV-26-${401 + tickets.length}`;
    const newTicket: ServiceTicket = {
      id: newId,
      customer,
      machine,
      type: callType,
      status: 'Open',
      date: new Date().toISOString().split('T')[0],
      sparesUsed: spares || '-'
    };
    setTickets([...tickets, newTicket]);
    setIsOpen(false);
    setCustomer('');
    setMachine('');
    setSpares('');
  };

  const handleDispatch = (id: string) => {
    setTickets(tickets.map(t => {
      if (t.id === id) {
        let nextStatus = 'In Progress';
        if (t.status === 'In Progress') nextStatus = 'Closed';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">After-Sales & AMC</h2>
          <p className="text-muted-foreground">Manage service tickets, field engineers, and maintenance contracts.</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <PhoneCall className="mr-2 h-4 w-4" /> Log Service Call
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Service Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Machine S.No</TableHead>
                <TableHead>Call Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Spares Consumed</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.date}</TableCell>
                  <TableCell>{ticket.customer}</TableCell>
                  <TableCell>{ticket.machine}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={ticket.status === 'Open' ? 'destructive' : ticket.status === 'In Progress' ? 'default' : ticket.status === 'Closed' ? 'outline' : 'secondary'}
                      className={ticket.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.sparesUsed || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {ticket.status !== 'Closed' && (
                      <Button variant="ghost" size="sm" onClick={() => handleDispatch(ticket.id)}>
                        <Wrench className="mr-2 h-4 w-4" /> 
                        {ticket.status === 'In Progress' ? 'Close Ticket' : 'Dispatch Team'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleLogCall}>
            <DialogHeader>
              <DialogTitle>Log Service Call</DialogTitle>
              <DialogDescription>
                Create a new service support ticket for customer maintenance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Name</label>
                <Input 
                  placeholder="e.g. Adani Electricity" 
                  value={customer} 
                  onChange={e => setCustomer(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Machine Serial Number</label>
                <Input 
                  placeholder="e.g. SP/26/1024" 
                  value={machine} 
                  onChange={e => setMachine(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Call Type</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={callType} 
                  onChange={e => setCallType(e.target.value)}
                >
                  <option value="Warranty">Warranty</option>
                  <option value="AMC Routine">AMC Routine</option>
                  <option value="Breakdown">Breakdown</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Spares Consumed (Optional)</label>
                <Input 
                  placeholder="e.g. Filter Cartridges, gaskets" 
                  value={spares} 
                  onChange={e => setSpares(e.target.value)} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Log Ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

