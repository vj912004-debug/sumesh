import { Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardHat, Plus } from 'lucide-react';

export default function Workers() {
  const workers = [
    { id: 'EMP-01', name: 'Ramesh Bhai', trade: 'Welder (Argon)', status: 'On Shift', activeTask: 'WO-26-101 (Fabrication)' },
    { id: 'EMP-02', name: 'Suresh Kumar', trade: 'Fitter', status: 'On Shift', activeTask: 'WO-26-101 (Assembly)' },
    { id: 'EMP-03', name: 'Dinesh Patel', trade: 'Electrician', status: 'On Leave', activeTask: 'None' },
    { id: 'EMP-04', name: 'Mahesh Machhi', trade: 'Helper', status: 'On Shift', activeTask: 'Stores / Kitting' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shop Floor Workers</h2>
          <p className="text-muted-foreground">Manage production staff, trades, and shift availability.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/worker-tasks">
            <Button variant="outline">
              <HardHat className="mr-2 h-4 w-4" /> Assign Tasks
            </Button>
          </Link>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Worker
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Worker Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emp ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Trade / Skill</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Active Job Card</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium">{worker.id}</TableCell>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{worker.trade}</TableCell>
                  <TableCell>
                    <Badge variant={worker.status === 'On Shift' ? 'default' : 'outline'}>
                      {worker.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{worker.activeTask}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View Profile</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
