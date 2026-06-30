import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PackageCheck, ArrowDownToLine, CheckCircle2 } from 'lucide-react';

export default function GoodsReceipt() {
  const grnList = [
    { grnNo: 'GRN-26-401', date: '30-Jun-2026', poNo: 'PO-26-050', vendor: 'Laxmi Steels & Alloys', status: 'QC Pending', billStatus: 'Pending' },
    { grnNo: 'GRN-26-400', date: '28-Jun-2026', poNo: 'PO-26-048', vendor: 'Siemens India Ltd', status: 'Accepted', billStatus: 'Bill Booked' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Goods Receipt (GRN) & Purchase Bills</h2>
          <p className="text-muted-foreground">Receive vendor materials, perform inward QC, and book purchase bills.</p>
        </div>
        <Button>
          <ArrowDownToLine className="mr-2 h-4 w-4" /> Create GRN
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>GRN No.</TableHead>
                <TableHead>Receipt Date</TableHead>
                <TableHead>Against PO</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Inward QC Status</TableHead>
                <TableHead>Purchase Bill</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grnList.map((grn) => (
                <TableRow key={grn.grnNo}>
                  <TableCell className="font-medium">{grn.grnNo}</TableCell>
                  <TableCell>{grn.date}</TableCell>
                  <TableCell className="text-primary hover:underline cursor-pointer">{grn.poNo}</TableCell>
                  <TableCell>{grn.vendor}</TableCell>
                  <TableCell>
                    <Badge variant={grn.status === 'Accepted' ? 'default' : 'secondary'}>
                      {grn.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={grn.billStatus === 'Bill Booked' ? 'default' : 'outline'}>
                      {grn.billStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {grn.status === 'QC Pending' ? (
                      <Button variant="ghost" size="sm">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Clear QC
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm">
                        <PackageCheck className="mr-2 h-4 w-4" /> Book Bill
                      </Button>
                    )}
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
