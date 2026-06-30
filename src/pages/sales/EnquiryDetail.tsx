import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockEnquiries, mockCustomers } from '@/lib/mockData';
import { ArrowLeft, Edit, FileText } from 'lucide-react';

export default function EnquiryDetail() {
  const { id } = useParams();
  const enquiry = mockEnquiries.find(e => e.id === id);
  const customer = mockCustomers.find(c => c.id === enquiry?.customerId);

  if (!enquiry) {
    return <div>Enquiry not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/enquiries">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{enquiry.id}</h2>
            <Badge variant={enquiry.status === 'Converted' ? 'default' : 'secondary'}>
              {enquiry.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">Received on {enquiry.date} via {enquiry.source}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" /> Generate Quote
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="font-medium text-base">{customer?.name}</div>
            <div><strong>Contact:</strong> {customer?.contactPerson}</div>
            <div><strong>Email:</strong> {customer?.email}</div>
            <div><strong>Phone:</strong> {customer?.phone}</div>
            <div><strong>Location:</strong> {customer?.city}, {customer?.state}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enquiry Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-semibold mb-1">Expected Value</div>
              <div className="text-2xl font-bold text-accent">₹{enquiry.expectedValue.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">Requirements</div>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md min-h-[80px]">
                {enquiry.requirements}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication Timeline */}
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
    </div>
  );
}
