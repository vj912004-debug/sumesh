import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PreviousOffersTable } from '@/components/sales/PreviousOffersTable';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { mockCustomers } from '@/lib/mockData';
import type { Enquiry } from '@/lib/mockData';
import { api } from '@/lib/api';
import { EnquiryTypeBadge } from '@/components/sales/EnquiryTypeBadge';
import {
  createEstimateFromEnquiry,
  getCostEstimateByEnquiryId,
} from '@/lib/estimateFromEnquiry';
import {
  createQuotationFromEstimate,
  getEnquiryQuoteStatusForEnquiry,
  getSubmittedOffersForParty,
  getSubmittedOffersForEnquiry,
} from '@/lib/quotationService';
import EnquiryQuoteStatusBadge from '@/components/sales/EnquiryQuoteStatusBadge';
import { ArrowLeft, Edit, FileText, Calculator, ExternalLink } from 'lucide-react';
import { CustomerContactsList } from '@/components/sales/CustomerContactsList';
import { getCustomerContacts } from '@/lib/customerContacts';

export default function EnquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get('/crm/enquiries')
      .then(res => {
        const found = res.data.find((e: Enquiry) => e.id === id);
        setEnquiry(found ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const customer = mockCustomers.find(c => c.id === enquiry?.customerId);

  const quotePipelineStatus = id ? getEnquiryQuoteStatusForEnquiry(id) : 'quotation_pending';

  const linkedEstimate = useMemo(
    () => (id ? getCostEstimateByEnquiryId(id) : undefined),
    [id]
  );

  const enquiryOffers = useMemo(
    () => (id ? getSubmittedOffersForEnquiry(id) : []),
    [id]
  );

  const partyOffers = useMemo(
    () => (enquiry?.customerId
      ? getSubmittedOffersForParty(enquiry.customerId).map(o => ({
          ...o,
          customerName: customer?.name,
        }))
      : []),
    [enquiry?.customerId, customer?.name]
  );

  const [requirements, setRequirements] = useState('');
  const [expectedValue, setExpectedValue] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editReq, setEditReq] = useState('');
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (enquiry) {
      setRequirements(enquiry.requirements);
      setExpectedValue(enquiry.expectedValue);
    }
  }, [enquiry]);

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading enquiry...</div>;
  }

  if (!enquiry) {
    return <div>Enquiry not found</div>;
  }

  const handleCreateEstimate = () => {
    const estimate = createEstimateFromEnquiry(enquiry);
    navigate(`/production/cost-estimate/${estimate.id}`);
  };

  const handleGenerateQuote = () => {
    const estimate = linkedEstimate ?? createEstimateFromEnquiry(enquiry);

    if (estimate.status !== 'Approved' && estimate.status !== 'Reviewed') {
      const proceed = window.confirm(
        'Estimate is not yet reviewed/approved. Open the cost estimate to review material pricing before generating a quotation?'
      );
      if (proceed) {
        navigate(`/production/cost-estimate/${estimate.id}`);
      }
      return;
    }

    const quote = createQuotationFromEstimate(estimate);
    navigate(`/quotations/${quote.id}`);
  };

  const openEdit = () => {
    setEditReq(requirements);
    setEditValue(String(expectedValue));
    setIsEditOpen(true);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    setRequirements(editReq);
    setExpectedValue(Number(editValue));
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/enquiries">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-3xl font-bold tracking-tight">{enquiry.id}</h2>
            <EnquiryTypeBadge type={enquiry.enquiryType} />
            <Badge variant={enquiry.status === 'Converted' ? 'default' : 'secondary'}>
              {enquiry.status}
            </Badge>
            <EnquiryQuoteStatusBadge status={quotePipelineStatus} />
          </div>
          <p className="text-muted-foreground">Received on {enquiry.date} via {enquiry.source}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" onClick={handleCreateEstimate}>
            <Calculator className="mr-2 h-4 w-4" />
            {linkedEstimate ? 'Open Cost Estimate' : 'Pre-Build Estimate'}
          </Button>
          <Button onClick={handleGenerateQuote}>
            <FileText className="mr-2 h-4 w-4" /> Generate Quote
          </Button>
        </div>
      </div>

      {quotePipelineStatus === 'quotation_pending' && (
        <Card className="border-amber-300 bg-amber-50/60">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-amber-900">Quotation Pending</p>
              <p className="text-sm text-amber-800/90">
                This enquiry is visible on the Quotations page awaiting a linked quote.
              </p>
            </div>
            <Link to="/quotations">
              <Button size="sm" variant="outline" className="border-amber-400 bg-white">
                <FileText className="mr-2 h-4 w-4" /> Create Quotation
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {linkedEstimate && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">Linked Material Estimate: {linkedEstimate.id}</p>
              <p className="text-sm text-muted-foreground">
                Suggested build price: ₹{linkedEstimate.suggestedPrice.toLocaleString('en-IN')} · Status: {linkedEstimate.status}
              </p>
            </div>
            <Link to={`/production/cost-estimate/${linkedEstimate.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" /> View Estimate
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="previous-offers">
            Previous Offers
            {(enquiryOffers.length + partyOffers.length) > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                {partyOffers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="font-medium text-base">{customer?.name}</div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Contact Persons</div>
                  <CustomerContactsList contacts={getCustomerContacts(customer)} compact />
                </div>
                <div><strong>Email:</strong> {customer?.email}</div>
                <div><strong>Location:</strong> {customer?.city}, {customer?.state}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enquiry Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-1">Enquiry Type</div>
                  <EnquiryTypeBadge type={enquiry.enquiryType} />
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1">Expected Value</div>
                  <div className="text-2xl font-bold text-accent">₹{expectedValue.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1">Requirements</div>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md min-h-[80px]">
                    {requirements}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="previous-offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Offers for This Enquiry</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quotations submitted against {enquiry.id}.
              </p>
            </CardHeader>
            <CardContent>
              <PreviousOffersTable
                offers={enquiryOffers}
                showParty={false}
                showEnquiry={false}
                emptyMessage="No offers submitted for this enquiry yet."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Previous Offers — {customer?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Full party history to compare past commercial rates before submitting a new quote.
              </p>
            </CardHeader>
            <CardContent>
              <PreviousOffersTable
                offers={partyOffers}
                showParty={false}
                emptyMessage="No previous offers submitted for this party."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 border-b pb-4">
                  <div className="w-24 text-sm text-muted-foreground font-medium shrink-0">Today, 10:00 AM</div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Called client to confirm technical specs</div>
                    <p className="text-sm text-muted-foreground mt-1">Spoke to Mr. Sharma. He requested we include a 300m3/hr vacuum pump instead of the standard 150m3/hr. I said I will send a revised quote.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-24 text-sm text-muted-foreground font-medium shrink-0">28-Jun, 04:30 PM</div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Initial Inquiry Received</div>
                    <p className="text-sm text-muted-foreground mt-1">Received via IndiaMart. Standard 6000 LPH machine required for their new substation project.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleEditSave}>
            <DialogHeader>
              <DialogTitle>Edit Enquiry</DialogTitle>
              <DialogDescription>Update requirements and expected value.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Requirements</label>
                <textarea
                  className="w-full border rounded-md p-2 text-sm min-h-[100px]"
                  value={editReq}
                  onChange={e => setEditReq(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Value (₹)</label>
                <Input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
