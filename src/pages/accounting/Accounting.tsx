import { Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockOrders, mockCustomers } from '@/lib/mockData';
import { FileText, Receipt } from 'lucide-react';

export default function Accounting() {
  const invoiceableOrders = mockOrders.filter(o => o.status === 'Dispatched' || o.status === 'Ready for Dispatch');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance & Accounting</h2>
          <p className="text-muted-foreground">Manage accounts receivable, tax invoices, and ledgers.</p>
        </div>
        <Button>
          <Receipt className="mr-2 h-4 w-4" /> Receive Payment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount (Inc. GST)</TableHead>
                <TableHead>IRN Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceableOrders.map((order, idx) => {
                const customer = mockCustomers.find(c => c.id === order.customerId);
                const invoiceId = `INV-26-${1240 + idx}`;
                const isPaid = idx % 2 !== 0;
                
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{invoiceId}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{customer?.name}</TableCell>
                    <TableCell>₹{(order.totalAmount * 1.18).toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-green-600">Generated</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isPaid ? 'default' : 'destructive'}>
                        {isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/accounting/invoice/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          <FileText className="mr-2 h-4 w-4" /> View Invoice
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
