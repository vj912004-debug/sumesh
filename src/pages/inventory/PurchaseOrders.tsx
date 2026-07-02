import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus } from 'lucide-react';

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const mockPOs = [
    { id: 'PO-26-050', vendor: 'Laxmi Steels', date: '2026-06-25', amount: 450000, status: 'Received' },
    { id: 'PO-26-051', vendor: 'ABB India Ltd', date: '2026-06-28', amount: 1200000, status: 'Pending' },
    { id: 'PO-26-052', vendor: 'Gujarat Pipes', date: '2026-06-29', amount: 85000, status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
          <p className="text-muted-foreground">Manage vendor POs and track incoming materials.</p>
        </div>
        <Button onClick={() => setToast('New PO draft created — PO-26-053')}>
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
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPOs.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.id}</TableCell>
                  <TableCell>{po.date}</TableCell>
                  <TableCell>{po.vendor}</TableCell>
                  <TableCell>₹{po.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge variant={po.status === 'Received' ? 'default' : 'secondary'}>
                      {po.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => po.status === 'Pending' ? navigate('/purchase/grn') : navigate(`/purchase-orders/${po.id}`)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" /> {po.status === 'Pending' ? 'Receive (GRN)' : 'View'}
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
