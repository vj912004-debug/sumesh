import { Link, useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockOrders, mockCustomers } from '@/lib/mockData';
import { Plus } from 'lucide-react';

export default function Orders() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Orders</h2>
          <p className="text-muted-foreground">Track order processing, production, and dispatch status.</p>
        </div>
        <Button onClick={() => navigate('/quotations')}>
          <Plus className="mr-2 h-4 w-4" /> New Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Delivery Status</TableHead>
                <TableHead>Advance</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => {
                const customer = mockCustomers.find(c => c.id === order.customerId);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{customer?.name}</TableCell>
                    <TableCell>₹{order.totalAmount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'Dispatched' ? 'default' : 
                        order.status === 'Ready for Dispatch' ? 'secondary' : 
                        'outline'
                      }>
                        {order.status === 'In Production' ? 'Partial (2/5)' : order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                        30% Rcvd
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
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
