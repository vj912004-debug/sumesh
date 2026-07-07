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
import { createDirectQuotation, createQuotationFromEnquiry, getEnquiriesForQuotation, getPendingQuotationEnquiries, getSubmittedOffers } from '@/lib/quotationService';
import { mockCustomers } from '@/lib/mockData';
import { EnquiryTypeBadge } from '@/components/sales/EnquiryTypeBadge';
import EnquiryQuoteStatusBadge from '@/components/sales/EnquiryQuoteStatusBadge';
import { Plus, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Quotations() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [enquiryId, setEnquiryId] = useState('');
  const [creating, setCreating] = useState(false);
  const [enquiryRefresh, setEnquiryRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState('enquiries');

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

  useEffect(() => {
    const onFocus = () => setEnquiryRefresh(n => n + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    if (createOpen) setEnquiryRefresh(n => n + 1);
  }, [createOpen]);

  const previousOffers = useMemo(
    () => getSubmittedOffers().map(offer => ({
      ...offer,
      customerName: mockCustomers.find(c => c.id === offer.customerId)?.name,
    })),
    [quotations]
  );

  const draftQuotations = quotations.filter((q: { status: string }) => q.status === 'Draft');

  const enquiriesForQuote = useMemo(
    () => getEnquiriesForQuotation(),
    [quotations, enquiryRefresh, createOpen]
  );

  const openEnquiries = useMemo(() => {
    return enquiriesForQuote;
  }, [enquiriesForQuote]);

  const pendingQuotations = useMemo(
    () => getPendingQuotationEnquiries(),
    [enquiriesForQuote]
  );

  const handleCreateFromEnquiry = (enquiryId: string) => {
    const enq = enquiriesForQuote.find(e => e.id === enquiryId);
    if (!enq) return;
    setCreating(true);
    try {
      const quote = createQuotationFromEnquiry(enq);
      navigate(`/quotations/${quote.id}`);
    } finally {
      setCreating(false);
    }
  };

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
      setEnquiryRefresh(n => n + 1);
      navigate(`/quotations/${quote.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6" data-demo-page="quotations">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quotations</h2>
          <p className="text-muted-foreground">Manage techno-commercial quotes and revisions.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Quotation
        </Button>
      </div>

      {pendingQuotations.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/60">
          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">
                  {pendingQuotations.length} enquiry{pendingQuotations.length > 1 ? 'ies' : ''} — Quotation Pending
                </p>
                <p className="text-sm text-amber-800/90">
                  New enquiries appear here until a quotation is created and linked.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-amber-400 bg-white shrink-0" onClick={() => setActiveTab('enquiries')}>
              View pending list
            </Button>
          </CardContent>
        </Card>
      )}

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
                <label className="text-sm font-medium">Link to Enquiry</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={enquiryId}
                  onChange={e => {
                    const id = e.target.value;
                    setEnquiryId(id);
                    if (id) {
                      const enq = openEnquiries.find(x => x.id === id);
                      if (enq) setCustomerId(enq.customerId);
                    }
                  }}
                >
                  <option value="">None — direct quotation</option>
                  {openEnquiries.map(enq => (
                    <option key={enq.id} value={enq.id}>
                      {enq.id} — {mockCustomers.find(c => c.id === enq.customerId)?.name}
                      {enq.linkedQuotationId ? ` (has ${enq.linkedQuotationId})` : ''}
                    </option>
                  ))}
                </select>
                {openEnquiries.length === 0 && (
                  <p className="text-xs text-muted-foreground">No open enquiries — create one under Sales → Enquiries first.</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Customer *</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={customerId}
                  onChange={e => {
                    setCustomerId(e.target.value);
                    if (enquiryId) {
                      const enq = openEnquiries.find(x => x.id === enquiryId);
                      if (enq && enq.customerId !== e.target.value) setEnquiryId('');
                    }
                  }}
                  required
                >
                  <option value="">Select customer…</option>
                  {mockCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="enquiries">
            Quotation Pending
            {pendingQuotations.length > 0 && (
              <Badge className="ml-2 h-5 px-1.5 text-[10px] bg-amber-500 text-white border-0">
                {pendingQuotations.length}
              </Badge>
            )}
          </TabsTrigger>
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

        <TabsContent value="enquiries">
          <Card>
            <CardHeader>
              <CardTitle>Enquiries — Quotation Pending</CardTitle>
              <p className="text-sm text-muted-foreground">
                When an enquiry is logged, it shows here with status <strong>Quotation Pending</strong> until you create a linked quote.
              </p>
            </CardHeader>
            <CardContent>
              {enquiriesForQuote.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No open enquiries yet.</p>
                  <Link to="/enquiries" className="text-primary hover:underline text-sm mt-2 inline-block">
                    Go to Enquiries → create one
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Enquiry ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Requirements</TableHead>
                      <TableHead className="text-right">Expected Value</TableHead>
                      <TableHead>Quote Status</TableHead>
                      <TableHead>Quotation Ref</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enquiriesForQuote.map(enq => (
                      <TableRow
                        key={enq.id}
                        className={enq.quotePipelineStatus === 'quotation_pending' ? 'bg-amber-50/50' : undefined}
                      >
                        <TableCell className="font-medium text-xs">
                          <Link to={`/enquiries/${enq.id}`} className="text-primary hover:underline">
                            {enq.id}
                          </Link>
                        </TableCell>
                        <TableCell>{format(new Date(enq.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{mockCustomers.find(c => c.id === enq.customerId)?.name}</TableCell>
                        <TableCell><EnquiryTypeBadge type={enq.enquiryType} /></TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground" title={enq.requirements}>
                          {enq.requirements}
                        </TableCell>
                        <TableCell className="text-right">₹{enq.expectedValue.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <EnquiryQuoteStatusBadge status={enq.quotePipelineStatus} />
                        </TableCell>
                        <TableCell className="text-xs">
                          {enq.linkedQuotationId ? (
                            <Link to={`/quotations/${enq.linkedQuotationId}`} className="text-primary hover:underline">
                              {enq.linkedQuotationId}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {enq.quotePipelineStatus === 'quotation_pending' ? (
                            <Button
                              size="sm"
                              disabled={creating}
                              onClick={() => handleCreateFromEnquiry(enq.id)}
                            >
                              <FileText className="mr-1 h-3 w-3" /> Create Quote
                            </Button>
                          ) : enq.linkedQuotationId ? (
                            <Link to={`/quotations/${enq.linkedQuotationId}`}>
                              <Button variant="ghost" size="sm">Open Quote</Button>
                            </Link>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Quotations &amp; Pending Enquiries</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enquiries without a quote show as <strong>Quotation Pending</strong> at the top.
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote / Enquiry</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Enquiry Ref</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingQuotations.map(enq => (
                      <TableRow key={`pending-${enq.id}`} className="bg-amber-50/60">
                        <TableCell className="font-medium text-xs text-amber-900">—</TableCell>
                        <TableCell>{format(new Date(enq.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{mockCustomers.find(c => c.id === enq.customerId)?.name}</TableCell>
                        <TableCell className="text-xs">
                          <Link to={`/enquiries/${enq.id}`} className="text-primary hover:underline font-medium">
                            {enq.id}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">₹{enq.expectedValue.toLocaleString('en-IN')} (est.)</TableCell>
                        <TableCell>
                          <EnquiryQuoteStatusBadge status="quotation_pending" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" disabled={creating} onClick={() => handleCreateFromEnquiry(enq.id)}>
                            Create Quote
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {quotations.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium text-xs">{quote.id}</TableCell>
                        <TableCell>{format(new Date(quote.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{quote.customer?.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {quote.enquiryId ? (
                            <Link to={`/enquiries/${quote.enquiryId}`} className="text-primary hover:underline">
                              {quote.enquiryId}
                            </Link>
                          ) : (
                            'Direct'
                          )}
                        </TableCell>
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
