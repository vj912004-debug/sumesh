import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Plus } from 'lucide-react';

export default function JobWorkOutward() {
  const outwardChallans = [
    { challanNo: 'DC-JW-26-010', date: '28-Jun-2026', subcontractor: 'Shreeji Laser Cutting', item: 'MS Plate 10mm (Raw)', qty: '500 Kg', process: 'Laser Cutting', status: 'Pending Receipt' },
    { challanNo: 'DC-JW-26-011', date: '29-Jun-2026', subcontractor: 'Om Fabricators', item: 'Tank Shell Assembly', qty: '1 Set', process: 'Welding', status: 'Pending Receipt' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Work (Outward)</h2>
          <p className="text-muted-foreground">Issue raw materials and semi-finished goods to subcontractors.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Issue Material (57F4)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open Outward Challans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Challan No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Subcontractor</TableHead>
                <TableHead>Material Issued</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Process Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outwardChallans.map((challan) => (
                <TableRow key={challan.challanNo}>
                  <TableCell className="font-medium">{challan.challanNo}</TableCell>
                  <TableCell>{challan.date}</TableCell>
                  <TableCell>{challan.subcontractor}</TableCell>
                  <TableCell>{challan.item}</TableCell>
                  <TableCell>{challan.qty}</TableCell>
                  <TableCell>{challan.process}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{challan.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Truck className="mr-2 h-4 w-4" /> Receive Inward
                    </Button>
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
