import { Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/lib/mockData';
import { Truck, Plus } from 'lucide-react';

export default function Dispatch() {
  const dispatchableOrders = mockOrders.filter(o => o.status === 'Ready for Dispatch' || o.status === 'Dispatched');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dispatch & Logistics</h2>
          <p className="text-muted-foreground">Manage delivery challans, e-way bills, and transport.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Non-Sale Challan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dispatch Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle / Mode</TableHead>
                <TableHead>E-Way Bill</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispatchableOrders.map((order) => {
                const isDispatched = order.status === 'Dispatched';
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>Tata Power</TableCell>
                    <TableCell>{isDispatched ? 'GJ-06-XX-1234 (ODC)' : '-'}</TableCell>
                    <TableCell>
                      {isDispatched ? (
                        <span className="text-sm font-medium text-green-600">Generated</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isDispatched ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/dispatch/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          <Truck className="mr-2 h-4 w-4" /> Challan
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
