import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, Truck, Link2, AlertTriangle } from 'lucide-react';

export default function EWayBills() {
  const ewayBills = [
    { ewbNo: '131000142345', date: '30-Jun-2026', docNo: 'INV-26-1240', customer: 'Tata Power', status: 'Active', validUpto: '10-Jul-2026' },
    { ewbNo: '141000567890', date: '25-Jun-2026', docNo: 'INV-26-1235', customer: 'Reliance Ind.', status: 'Expired', validUpto: '28-Jun-2026' },
    { ewbNo: '151000987654', date: '29-Jun-2026', docNo: 'DC-26-879', customer: 'L&T', status: 'Part-B Pending', validUpto: 'N/A' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">E-Way Bills</h2>
          <p className="text-muted-foreground">Manage E-Way Bill generation, Part-B updates, and validity tracking.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Link2 className="mr-2 h-4 w-4" /> Consolidate EWB
          </Button>
          <Button>Generate New EWB</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bills</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Currently in transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Part-B Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">4</div>
            <p className="text-xs text-muted-foreground">Requires vehicle assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Map className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">2</div>
            <p className="text-xs text-muted-foreground">Within next 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>E-Way Bill Register</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>EWB No.</TableHead>
                <TableHead>Generated On</TableHead>
                <TableHead>Linked Doc</TableHead>
                <TableHead>Consignee</TableHead>
                <TableHead>Valid Upto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ewayBills.map((bill) => (
                <TableRow key={bill.ewbNo}>
                  <TableCell className="font-medium">{bill.ewbNo}</TableCell>
                  <TableCell>{bill.date}</TableCell>
                  <TableCell>
                    <span className="font-medium text-primary hover:underline cursor-pointer">
                      {bill.docNo}
                    </span>
                  </TableCell>
                  <TableCell>{bill.customer}</TableCell>
                  <TableCell>{bill.validUpto}</TableCell>
                  <TableCell>
                    <Badge variant={
                      bill.status === 'Active' ? 'default' : 
                      bill.status === 'Part-B Pending' ? 'secondary' : 'destructive'
                    }>
                      {bill.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      {bill.status === 'Part-B Pending' ? 'Update Part-B' : 'Print / View'}
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
