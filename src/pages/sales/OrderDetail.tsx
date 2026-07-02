import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { mockOrders, mockCustomers, mockQuotations, mockProducts, mockPackingLists, getMockOrders, saveMockOrders } from '@/lib/mockData';
import type { Order } from '@/lib/mockData';
import { processErpEvent } from '@/lib/erpEvents';
import { sendEmail, sendWhatsApp, openWhatsAppDeepLink } from '@/lib/communicationService';
import { getIntegrationSettings } from '@/lib/integrationConfig';
import { ArrowLeft, Truck, Wrench, Mail, Package, FileText, Receipt } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const [orders, setOrders] = useState<Order[]>(() => getMockOrders());
  const order = orders.find(o => o.id === id);
  const quotation = mockQuotations.find(q => q.id === order?.quotationId);
  const customer = mockCustomers.find(c => c.id === order?.customerId);
  const packingList = mockPackingLists.find(pl => pl.orderId === order?.id);

  // Email States
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState(customer?.email || '');
  const [emailSubject, setEmailSubject] = useState(`Order ${order?.id || ''} Status Update - Sumesh Petroleum`);
  const [emailBody, setEmailBody] = useState(() => {
    if (!order || !customer) return '';
    return `Dear ${customer.contactPerson},\n\n` +
      `Here is the update for your order ${order.id} on the Sumesh Petroleum ERP.\n\n` +
      `Order Summary:\n` +
      `- Order Date: ${order.date}\n` +
      `- Order Status: ${order.status}\n` +
      `- Total Amount: INR ${order.totalAmount.toLocaleString('en-IN')}\n\n` +
      `We will keep you updated as production progresses.\n\n` +
      `Best regards,\n` +
      `Sumesh Petroleum ERP Admin`;
  });
  const [isSending, setIsSending] = useState(false);

  const handleGenerateDispatch = async () => {
    if (!order || !customer) return;
    const updated = orders.map(o => o.id === order.id ? { ...o, status: 'Ready for Dispatch' as const } : o);
    setOrders(updated);
    saveMockOrders(updated);
    const result = await processErpEvent('order.ready_for_dispatch', {
      orderId: order.id,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      contactPerson: customer.contactPerson,
      totalAmount: order.totalAmount,
    });
    alert(`Dispatch workflow triggered!\n• ${result.tasksCreated.length} task(s) auto-created\n• ${result.notificationsSent} WhatsApp/email notification(s) sent\n\nCheck Tasks and Communication pages.`);
  };

  if (!order || !customer) {
    return <div>Order not found</div>;
  }

  const handleWhatsAppSend = async () => {
    const product = mockProducts.find(p => p.id === quotation?.items[0]?.productId);
    const message = `Hi *${customer.contactPerson}*,\n\nYour Order *${order.id}* for *${product?.name || 'equipment'}* has been updated.\n\n*Total:* ₹${order.totalAmount.toLocaleString('en-IN')}\n*Status:* ${order.status}\n*Date:* ${order.date}\n\nThank you,\nSumesh Petroleum`;

    const settings = getIntegrationSettings();
    if (settings.whatsapp.mode === 'deep_link') {
      openWhatsAppDeepLink(customer.phone, message);
    }
    await sendWhatsApp({
      recipient: `${customer.contactPerson} (${customer.name})`,
      phone: customer.phone,
      type: 'Order Update',
      message,
      sourceRef: order.id,
    });
    alert('WhatsApp message logged and sent.');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    await sendEmail({
      to: emailTo,
      type: 'Order Status Update',
      subject: emailSubject,
      body: emailBody,
      sourceRef: order.id,
    });
    setIsSending(false);
    setIsEmailOpen(false);
    alert(`Email sent to ${emailTo} and logged in Communication Hub.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/orders">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Order: {order.id}</h2>
            <Badge variant={order.status === 'Dispatched' ? 'default' : 'secondary'}>
              {order.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">Placed on {order.date} from {quotation?.id}</p>
        </div>
        <div className="flex gap-2">
          {packingList ? (
            <Link to={`/dispatch/packing-list/${packingList.id}`}>
              <Button variant="outline" className="text-teal-600 border-teal-200">
                <Package className="mr-2 h-4 w-4" /> Packing List
              </Button>
            </Link>
          ) : (
            (order.status === 'Ready for Dispatch' || order.status === 'In Production') && (
              <Link to="/dispatch/packing-lists">
                <Button variant="outline">
                  <Package className="mr-2 h-4 w-4" /> Create Packing List
                </Button>
              </Link>
            )
          )}
          <Link to={`/accounting/proforma/${order.id}`}>
            <Button variant="outline" className="text-teal-600 border-teal-200">
              <FileText className="mr-2 h-4 w-4" /> Proforma Invoice (PI)
            </Button>
          </Link>
          {(order.status === 'Dispatched' || order.status === 'Ready for Dispatch') && (
            <Link to={`/accounting/ti/${order.id}`}>
              <Button variant="outline" className="text-primary border-primary/30">
                <Receipt className="mr-2 h-4 w-4" /> Tax Invoice (TI)
              </Button>
            </Link>
          )}
          <Button variant="outline">
            <Wrench className="mr-2 h-4 w-4" /> Issue to Production
          </Button>
          <Button onClick={handleGenerateDispatch}>
            <Truck className="mr-2 h-4 w-4" /> Generate Dispatch
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <div className="font-semibold text-zinc-800 text-base">{customer.name}</div>
              <div className="text-zinc-500 mt-0.5">{customer.city}, {customer.state}</div>
              <div className="text-zinc-500 text-xs mt-1 font-medium">GSTIN: {customer.gstin}</div>
            </div>

            <div className="border-t border-zinc-100 pt-3 space-y-2">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Contact Person</div>
              <div className="font-medium text-zinc-800">{customer.contactPerson}</div>
              
              <div className="flex flex-col gap-1 text-zinc-600 mt-1">
                <span>Phone: {customer.phone}</span>
                <span className="truncate">Email: {customer.email}</span>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3 flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                onClick={handleWhatsAppSend}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 fill-current shrink-0">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.167 1.453 4.793 1.454 5.395 0 9.782-4.385 9.785-9.778.002-2.612-1.013-5.068-2.86-6.916C16.42 2.067 13.968 1.05 11.4 1.05 6.002 1.05 1.614 5.435 1.611 10.829c-.001 1.674.437 3.308 1.27 4.76l-.994 3.633 3.72-.976.05.03zm11.367-7.854c-.327-.164-1.938-.956-2.238-1.066-.3-.11-.519-.164-.738.164-.22.329-.85.164-1.04.1.282.822-1.396-1.12-1.745-.33-.312.443.18-.75-.405-.282.822 1.396.406.822 1.246-1.12s.931-.137 1.137-.027c.206.11 1.3.164.3.439.439.082 1.014.11 1.096.082.082-.027.274-.137.274-.3s.11-.329.082-.439-.137-.164-.466-.328zm-3.078-.962c-.11-.274-.22-.274-.329-.274-.082 0-.164-.027-.274-.027-.11 0-.274.055-.412.192-.137.137-.549.549-.549 1.344s.576 1.564.658 1.674c.082.11 1.137 1.742 2.766 2.443 1.353.582 1.628.466 1.916.439.288-.027.932-.384 1.066-.754.137-.37.137-.686.096-.754-.04-.068-.164-.11-.329-.192z"/>
                </svg>
                WhatsApp Customer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-cyan-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                onClick={() => setIsEmailOpen(true)}
              >
                <Mail className="w-4 h-4 mr-2 shrink-0" />
                Email Order Summary
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-x-auto w-full">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="py-2 px-4 text-left font-semibold">Product</th>
                    <th className="py-2 px-4 text-center font-semibold">Qty</th>
                    <th className="py-2 px-4 text-right font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quotation?.items.map((item, index) => {
                    const product = mockProducts.find(p => p.id === item.productId);
                    return (
                      <tr key={index}>
                        <td className="py-3 px-4">
                          <div className="font-medium">{product?.name}</div>
                          <div className="text-xs text-muted-foreground">{product?.model}</div>
                        </td>
                        <td className="py-3 px-4 text-center">{item.quantity}</td>
                        <td className="py-3 px-4 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm font-medium">
              <div>Total Value:</div>
              <div className="text-lg text-primary">₹{order.totalAmount.toLocaleString('en-IN')}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center relative py-4">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-muted -z-10 -translate-y-1/2"></div>
            {['Pending', 'In Production', 'Quality Check', 'Ready for Dispatch', 'Dispatched'].map((step, idx) => {
              const orderStatusIdx = ['Pending', 'In Production', 'Quality Check', 'Ready for Dispatch', 'Dispatched'].indexOf(order.status);
              const isActive = idx <= orderStatusIdx;
              return (
                <div key={step} className="flex flex-col items-center gap-2 bg-background px-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-muted bg-background text-muted-foreground'}`}>
                    {isActive ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{step}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Email Composition Dialog */}
      <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <form onSubmit={handleEmailSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-500" />
                Email Order Summary
              </DialogTitle>
              <DialogDescription>
                Compose and send the order receipt to the client.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Input value={emailTo} onChange={e => setEmailTo(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message Body</label>
                <textarea 
                  className="flex min-h-[160px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={emailBody} 
                  onChange={e => setEmailBody(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEmailOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Email'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

