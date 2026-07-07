import { useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus } from 'lucide-react';
import { getPoTotal, loadPurchaseOrders } from '@/lib/purchaseOrderService';

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const orders = useMemo(() => loadPurchaseOrders(), [location.key]);

  return (
    <div className="space-y-6" data-demo-page="purchase-orders">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
          <p className="text-muted-foreground">Manage vendor POs and track incoming materials.</p>
        </div>
        <Button onClick={() => navigate('/purchase/orders/new')}>
          <Plus className="mr-2 h-4 w-4" /> Create PO
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>PO For</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(po => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">
                    <Link to={`/purchase-orders/${po.id}`} className="text-primary hover:underline">
                      {po.id}
                    </Link>
                  </TableCell>
                  <TableCell>{po.poDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{po.poPurpose}</Badge>
                  </TableCell>
                  <TableCell>{po.vendorName}</TableCell>
                  <TableCell className="text-right">₹{getPoTotal(po).toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge variant={po.status === 'Received' ? 'default' : po.status === 'Pending' ? 'secondary' : 'outline'}>
                      {po.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        po.status === 'Pending'
                          ? navigate('/purchase/grn')
                          : navigate(`/purchase-orders/${po.id}`)
                      }
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {po.status === 'Pending' ? 'Receive (GRN)' : 'View'}
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
