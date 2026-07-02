import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function Quotations() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await api.get('/sales/quotations');
        setQuotations(response.data);
      } catch (error) {
        console.error('Failed to fetch quotations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quotations</h2>
          <p className="text-muted-foreground">Manage techno-commercial quotes and revisions.</p>
        </div>
        <Button onClick={() => navigate('/enquiries')}>
          <Plus className="mr-2 h-4 w-4" /> New Quotation
        </Button>
      </div>

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
                {quotations.map((quote) => {
                  return (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium text-xs">{quote.id}</TableCell>
                      <TableCell>{format(new Date(quote.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{quote.customer?.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{quote.enquiryId || 'Direct'}</TableCell>
                      <TableCell>₹{quote.totalAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Badge variant={
                          quote.status === 'Accepted' ? 'default' : 
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
