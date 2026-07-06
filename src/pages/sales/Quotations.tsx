import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { PreviousOffersTable } from '@/components/sales/PreviousOffersTable';
import { api } from '@/lib/api';
import { createDirectQuotation, getSubmittedOffers } from '@/lib/quotationService';
import { mockCustomers, getStoredEnquiries } from '@/lib/mockData';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function Quotations() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [enquiryId, setEnquiryId] = useState('');
  const [creating, setCreating] = useState(false);

  const loadQuotations = async () => {
    try {
      const response = await api.get('/sales/quotations');
      setQuotations(response.data);
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const previousOffers = useMemo(
    () => getSubmittedOffers().map(offer => ({
      ...offer,
      customerName: mockCustomers.find(c => c.id === offer.customerId)?.name,
    })),
    [quotations]
  );

  const draftQuotations = quotations.filter((q: { status: string }) => q.status === 'Draft');

  const openEnquiries = useMemo(() => {
    const all = getStoredEnquiries().filter(e => e.status === 'Open' || e.status === 'Quoted');
    if (!customerId) return all;
    return all.filter(e => e.customerId === customerId);
  }, [customerId, createOpen]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    setCreating(true);
    try {
      const quote = createDirectQuotation({
        customerId,
        enquiryId: enquiryId || undefined,
      });
      setCreateOpen(false);
      setCustomerId('');
      setEnquiryId('');
      navigate(`/quotations/${quote.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quotations</h2>
          <p className="text-muted-foreground">Manage techno-commercial quotes and revisions.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Quotation
        </Button>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create Quotation</DialogTitle>
              <DialogDescription>
                Select customer, optionally link an enquiry, then add products from Plant Catalog.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Customer *</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={customerId}
                  onChange={e => {
                    setCustomerId(e.target.value);
                    setEnquiryId('');
                  }}
                  required
                >
                  <option value="">Select customer…</option>
                  {mockCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Link to Enquiry (optional)</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={enquiryId}
                  onChange={e => {
                    const id = e.target.value;
                    setEnquiryId(id);
                    if (id) {
                      const enq = getStoredEnquiries().find(x => x.id === id);
                      if (enq) setCustomerId(enq.customerId);
                    }
                  }}
                >
                  <option value="">None — direct quotation</option>
                  {openEnquiries.map(enq => (
                    <option key={enq.id} value={enq.id}>
                      {enq.id} — {mockCustomers.find(c => c.id === enq.customerId)?.name}
                    </option>
                  ))}
                </select>
                {customerId && openEnquiries.length === 0 && (
                  <p className="text-xs text-muted-foreground">No open enquiries for this customer.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!customerId || creating}>
                {creating ? 'Creating…' : 'Create Quotation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Quotations</TabsTrigger>
          <TabsTrigger value="previous-offers">
            Previous Offers Submitted
            {previousOffers.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                {previousOffers.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Recent Quotations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Enquiry Ref</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium text-xs">{quote.id}</TableCell>
                        <TableCell>{format(new Date(quote.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{quote.customer?.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{quote.enquiryId || 'Direct'}</TableCell>
                        <TableCell>₹{quote.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Badge variant={
                            quote.status === 'PO Awarded' || quote.status === 'Accepted' ? 'default' :
                            quote.status === 'Sent' ? 'secondary' :
                            quote.status === 'Rejected' ? 'destructive' : 'outline'
                          }>
                            {quote.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/quotations/${quote.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="previous-offers">
          <Card>
            <CardHeader>
              <CardTitle>Previous Offers Submitted</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sent, accepted, and rejected quotations — grouped by party for commercial reference.
                {draftQuotations.length > 0 && (
                  <span className="block mt-1 text-xs">
                    {draftQuotations.length} draft quote{draftQuotations.length > 1 ? 's' : ''} excluded until sent.
                  </span>
                )}
              </p>
            </CardHeader>
            <CardContent>
              <PreviousOffersTable offers={previousOffers} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
