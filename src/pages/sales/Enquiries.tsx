import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { EnquiryForm, type EnquiryFormData } from '@/components/forms/EnquiryForm';
import { PreviousOffersTable } from '@/components/sales/PreviousOffersTable';
import { EnquiryTypeBadge } from '@/components/sales/EnquiryTypeBadge';
import { api } from '@/lib/api';
import { formatQuotedAmount, getEnquiryQuoteStatusForEnquiry, getSubmittedOffers } from '@/lib/quotationService';
import { ENQUIRY_TYPES, type EnquiryType } from '@/lib/enquiryTypes';
import { mockCustomers } from '@/lib/mockData';
import EnquiryQuoteStatusBadge from '@/components/sales/EnquiryQuoteStatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [newEnquiryType, setNewEnquiryType] = useState<EnquiryType | undefined>();

  const fetchEnquiries = async () => {
    try {
      const response = await api.get('/crm/enquiries');
      setEnquiries(response.data);
    } catch (error) {
      console.error('Failed to fetch enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const previousOffers = useMemo(
    () => getSubmittedOffers().map(offer => ({
      ...offer,
      customerName: mockCustomers.find(c => c.id === offer.customerId)?.name,
    })),
    [enquiries]
  );

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: enquiries.length };
    ENQUIRY_TYPES.forEach(type => {
      counts[type.value] = enquiries.filter(e => e.enquiryType === type.value).length;
    });
    return counts;
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    if (activeTab === 'all' || activeTab === 'previous-offers') return enquiries;
    return enquiries.filter(e => e.enquiryType === activeTab);
  }, [enquiries, activeTab]);

  const openNewEnquiry = (type?: EnquiryType) => {
    setNewEnquiryType(type);
    setIsDialogOpen(true);
  };

  const handleCreateEnquiry = async (data: EnquiryFormData) => {
    setIsSubmitting(true);
    try {
      // transform nextFollowUp to ISO if present
      const payload = {
        ...data,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp).toISOString() : undefined
      };
      await api.post('/crm/enquiries', payload);
      setIsDialogOpen(false);
      setNewEnquiryType(undefined);
      fetchEnquiries();
      alert('Enquiry created! A follow-up task and WhatsApp/email alerts were auto-generated. Check Tasks and Communication pages.');
    } catch (error) {
      console.error('Failed to create enquiry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enquiries</h2>
          <p className="text-muted-foreground">Manage rental, supply, service, and spares enquiries.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setNewEnquiryType(undefined);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => openNewEnquiry(activeTab !== 'all' && activeTab !== 'previous-offers' ? activeTab as EnquiryType : undefined)}>
              <Plus className="mr-2 h-4 w-4" /> New Enquiry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Log New Enquiry</DialogTitle>
              <DialogDescription>
                Record a new customer requirement — rental, supply, service, or spares.
              </DialogDescription>
            </DialogHeader>
            <EnquiryForm 
              key={newEnquiryType ?? 'default'}
              defaultType={newEnquiryType}
              onSubmit={handleCreateEnquiry} 
              onCancel={() => setIsDialogOpen(false)} 
              isLoading={isSubmitting} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="all">
            All Enquiries
            {typeCounts.all > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{typeCounts.all}</Badge>
            )}
          </TabsTrigger>
          {ENQUIRY_TYPES.map(type => (
            <TabsTrigger key={type.value} value={type.value}>
              {type.label}
              {typeCounts[type.value] > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{typeCounts[type.value]}</Badge>
              )}
            </TabsTrigger>
          ))}
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
          <EnquiriesTable enquiries={filteredEnquiries} loading={loading} />
        </TabsContent>
        {ENQUIRY_TYPES.map(type => (
          <TabsContent key={type.value} value={type.value}>
            <EnquiriesTable enquiries={filteredEnquiries} loading={loading} emptyLabel={type.label} />
          </TabsContent>
        ))}

        <TabsContent value="previous-offers">
          <Card>
            <CardHeader>
              <CardTitle>Previous Offers Submitted</CardTitle>
              <p className="text-sm text-muted-foreground">
                All quotations sent to parties — use this tab to review past commercial offers by customer.
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

function EnquiriesTable({
  enquiries,
  loading,
  emptyLabel,
}: {
  enquiries: any[];
  loading: boolean;
  emptyLabel?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{emptyLabel ?? 'All Enquiries'}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : enquiries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No enquiries found{emptyLabel ? ` for ${emptyLabel.toLowerCase()}` : ''}.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enquiry ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Quotation (Past Rates)</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Expected Value</TableHead>
                <TableHead>Quote Status</TableHead>
                <TableHead>Next Follow-up</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries.map((enq) => (
                <TableRow key={enq.id}>
                  <TableCell className="font-medium text-xs">{enq.id}</TableCell>
                  <TableCell>
                    <EnquiryTypeBadge type={enq.enquiryType} />
                  </TableCell>
                  <TableCell>{format(new Date(enq.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{enq.customer?.name}</TableCell>
                  <TableCell>
                    {enq.pastQuotedRates?.length > 0 ? (
                      <div className="space-y-1">
                        {enq.pastQuotedRates.slice(0, 2).map((q: {
                          quotationId: string;
                          date: string;
                          totalAmount: number;
                          status: string;
                        }) => (
                          <div key={q.quotationId} className="text-sm leading-tight">
                            <Link
                              to={`/quotations/${q.quotationId}`}
                              className="font-medium text-primary hover:underline"
                              onClick={e => e.stopPropagation()}
                            >
                              {formatQuotedAmount(q.totalAmount)}
                            </Link>
                            <div className="text-[11px] text-muted-foreground">
                              {q.quotationId} · {format(new Date(q.date), 'dd MMM yyyy')} · {q.status}
                            </div>
                          </div>
                        ))}
                        {enq.pastQuotedRates.length > 2 && (
                          <p className="text-[11px] text-muted-foreground">
                            +{enq.pastQuotedRates.length - 2} earlier quote{enq.pastQuotedRates.length - 2 > 1 ? 's' : ''} for this party
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No prior quote for party</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{enq.source}</Badge>
                  </TableCell>
                  <TableCell>₹{enq.expectedValue?.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <EnquiryQuoteStatusBadge status={getEnquiryQuoteStatusForEnquiry(enq.id)} />
                  </TableCell>
                  <TableCell>
                    {enq.nextFollowUp ? (
                      <span className="text-cyan-600 font-medium text-sm">
                        {format(new Date(enq.nextFollowUp), 'dd MMM yyyy')}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={enq.status === 'Converted' ? 'default' : enq.status === 'Open' ? 'secondary' : 'outline'}>
                      {enq.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/enquiries/${enq.id}`}>
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
  );
}
