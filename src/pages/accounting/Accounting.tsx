import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { getProformaInvoices, getTaxInvoices } from '@/lib/billingData';
import { mockCustomers, mockOrders } from '@/lib/mockData';
import { FileText, Receipt, Plus } from 'lucide-react';

export default function Accounting() {
  const location = useLocation();
  const navigate = useNavigate();
  const defaultTab = location.pathname.includes('ti-entry') ? 'ti' : 'pi';
  const proformaInvoices = getProformaInvoices();
  const taxInvoices = getTaxInvoices();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentOpen(false);
    notify(`Payment of ₹${Number(paymentAmount).toLocaleString('en-IN')} recorded for ${paymentRef}.`);
    setPaymentAmount('');
    setPaymentRef('');
  };

  const handleNewPI = () => {
    const order = mockOrders[0];
    if (order) navigate(`/accounting/proforma/${order.id}`);
    else notify('No orders found. Create a sales order first.');
  };

  const handleNewTI = () => {
    const order = mockOrders.find(o => o.status === 'Dispatched' || o.status === 'Ready for Dispatch') ?? mockOrders[0];
    if (order) navigate(`/accounting/ti/${order.id}`);
    else notify('No orders available for tax invoice.');
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance & Billing</h2>
          <p className="text-muted-foreground">Manage Proforma Invoices (PI), Tax Invoices (TI), and receivables.</p>
        </div>
        <Button onClick={() => setPaymentOpen(true)}>
          <Receipt className="mr-2 h-4 w-4" /> Receive Payment
        </Button>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pi"><FileText className="w-4 h-4 mr-2" /> Proforma Invoice (PI)</TabsTrigger>
          <TabsTrigger value="ti"><Receipt className="w-4 h-4 mr-2" /> Tax Invoice (TI)</TabsTrigger>
        </TabsList>

        <TabsContent value="pi">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Proforma Invoices (PI)</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Issued for advance payment before dispatch.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleNewPI}>
                <Plus className="mr-2 h-4 w-4" /> New PI
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PI No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order Ref</TableHead>
                    <TableHead>Amount (Inc. GST)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proformaInvoices.map(pi => {
                    const customer = mockCustomers.find(c => c.id === pi.customerId);
                    return (
                      <TableRow key={pi.id} className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/accounting/proforma/${pi.orderId}`)}>
                        <TableCell className="font-medium text-teal-700">{pi.id}</TableCell>
                        <TableCell>{pi.date}</TableCell>
                        <TableCell>{customer?.name}</TableCell>
                        <TableCell className="font-mono text-xs">{pi.orderId}</TableCell>
                        <TableCell>₹{pi.grandTotal.toLocaleString('en-IN')}</TableCell>
                        <TableCell><Badge variant="outline">{pi.status}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={pi.paymentStatus === 'Paid' ? 'default' : pi.paymentStatus === 'Partial' ? 'secondary' : 'destructive'}>
                            {pi.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                          <Link to={`/accounting/proforma/${pi.orderId}`}>
                            <Button variant="ghost" size="sm"><FileText className="mr-2 h-4 w-4" /> View PI</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ti">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tax Invoices (TI)</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">GST tax invoices with IRN for dispatched goods.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleNewTI}>
                <Plus className="mr-2 h-4 w-4" /> New TI
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TI No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Linked PI</TableHead>
                    <TableHead>Amount (Inc. GST)</TableHead>
                    <TableHead>IRN Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxInvoices.map(ti => {
                    const customer = mockCustomers.find(c => c.id === ti.customerId);
                    return (
                      <TableRow key={ti.id} className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/accounting/ti/${ti.orderId}`)}>
                        <TableCell className="font-medium text-primary">{ti.id}</TableCell>
                        <TableCell>{ti.date}</TableCell>
                        <TableCell>{customer?.name}</TableCell>
                        <TableCell className="font-mono text-xs text-teal-600">{ti.linkedPiId || '—'}</TableCell>
                        <TableCell>₹{ti.grandTotal.toLocaleString('en-IN')}</TableCell>
                        <TableCell><span className="text-sm font-medium text-green-600">{ti.status}</span></TableCell>
                        <TableCell>
                          <Badge variant={ti.paymentStatus === 'Paid' ? 'default' : 'destructive'}>{ti.paymentStatus}</Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                          <Link to={`/accounting/ti/${ti.orderId}`}>
                            <Button variant="ghost" size="sm"><FileText className="mr-2 h-4 w-4" /> View TI</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <form onSubmit={handleReceivePayment}>
            <DialogHeader>
              <DialogTitle>Receive Payment</DialogTitle>
              <DialogDescription>Record a customer payment against an invoice.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Invoice / PI / TI Ref</label>
                <Input value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="e.g. PI-26-101" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (₹)</label>
                <Input type="number" min="1" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
              <Button type="submit">Record Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
