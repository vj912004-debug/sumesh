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
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      fetchEnquiries();
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
          <p className="text-muted-foreground">Manage incoming sales enquiries and requirements.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Enquiry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Log New Enquiry</DialogTitle>
              <DialogDescription>
                Record a new sales lead or customer requirement.
              </DialogDescription>
            </DialogHeader>
            <EnquiryForm 
              onSubmit={handleCreateEnquiry} 
              onCancel={() => setIsDialogOpen(false)} 
              isLoading={isSubmitting} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Enquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enquiry ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Expected Value</TableHead>
                  <TableHead>Next Follow-up</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.map((enq) => {
                  return (
                    <TableRow key={enq.id}>
                      <TableCell className="font-medium text-xs">{enq.id}</TableCell>
                      <TableCell>{format(new Date(enq.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{enq.customer?.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{enq.source}</Badge>
                      </TableCell>
                      <TableCell>₹{enq.expectedValue?.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        {enq.nextFollowUp ? (
                          <span className="text-orange-600 font-medium text-sm">
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
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
