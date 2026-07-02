import { Link, useLocation } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProformaInvoices, getTaxInvoices } from '@/lib/billingData';
import { mockCustomers } from '@/lib/mockData';
import { FileText, Receipt, Plus } from 'lucide-react';

export default function Accounting() {
  const location = useLocation();
  const defaultTab = location.pathname.includes('ti-entry') ? 'ti' : 'pi';
  const proformaInvoices = getProformaInvoices();
  const taxInvoices = getTaxInvoices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance & Billing</h2>
          <p className="text-muted-foreground">Manage Proforma Invoices (PI), Tax Invoices (TI), and receivables.</p>
        </div>
        <Button>
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
                <p className="text-sm text-muted-foreground mt-1">Issued for advance payment before dispatch. Not a tax document.</p>
              </div>
              <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> New PI</Button>
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
                      <TableRow key={pi.id}>
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
                        <TableCell className="text-right">
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
              <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> New TI</Button>
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
                      <TableRow key={ti.id}>
                        <TableCell className="font-medium text-primary">{ti.id}</TableCell>
                        <TableCell>{ti.date}</TableCell>
                        <TableCell>{customer?.name}</TableCell>
                        <TableCell className="font-mono text-xs text-teal-600">{ti.linkedPiId || '—'}</TableCell>
                        <TableCell>₹{ti.grandTotal.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-green-600">{ti.status}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ti.paymentStatus === 'Paid' ? 'default' : 'destructive'}>{ti.paymentStatus}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
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
    </div>
  );
}
