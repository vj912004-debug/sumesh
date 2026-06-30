import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowDownToLine } from 'lucide-react';

export default function JobWorkInward() {
  const inwardReceipts = [
    { receiptNo: 'JWR-26-105', date: '30-Jun-2026', subcontractor: 'Shreeji Laser Cutting', refChallan: 'DC-JW-26-005', item: 'MS Profiles (Cut)', qty: '250 Kg', scrap: '10 Kg', status: 'QC Pending' },
    { receiptNo: 'JWR-26-104', date: '28-Jun-2026', subcontractor: 'Perfect Powder Coating', refChallan: 'DC-JW-26-008', item: 'Panel Covers (Blue)', qty: '5 Sets', scrap: '0', status: 'Accepted' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Work (Inward)</h2>
          <p className="text-muted-foreground">Receive processed goods and scrap material back from subcontractors.</p>
        </div>
        <Button>
          <ArrowDownToLine className="mr-2 h-4 w-4" /> Receive Material
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts & QC</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Subcontractor</TableHead>
                <TableHead>Ref Challan</TableHead>
                <TableHead>Material Received</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Scrap Recv.</TableHead>
                <TableHead>QC Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inwardReceipts.map((receipt) => (
                <TableRow key={receipt.receiptNo}>
                  <TableCell className="font-medium">{receipt.receiptNo}</TableCell>
                  <TableCell>{receipt.date}</TableCell>
                  <TableCell>{receipt.subcontractor}</TableCell>
                  <TableCell className="text-muted-foreground">{receipt.refChallan}</TableCell>
                  <TableCell>{receipt.item}</TableCell>
                  <TableCell>{receipt.qty}</TableCell>
                  <TableCell>{receipt.scrap}</TableCell>
                  <TableCell>
                    <Badge variant={receipt.status === 'Accepted' ? 'default' : 'secondary'}>
                      {receipt.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {receipt.status === 'QC Pending' ? (
                      <Button variant="ghost" size="sm">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Clear QC
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm">View</Button>
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
