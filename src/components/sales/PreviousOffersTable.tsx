import { Link } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatQuotedAmount, type PartyQuotedRate } from '@/lib/quotationService';
import { mockCustomers, mockProducts } from '@/lib/mockData';

export type PreviousOfferRow = PartyQuotedRate & {
  customerName?: string;
};

type PreviousOffersTableProps = {
  offers: PreviousOfferRow[];
  showParty?: boolean;
  showEnquiry?: boolean;
  emptyMessage?: string;
};

export function PreviousOffersTable({
  offers,
  showParty = true,
  showEnquiry = true,
  emptyMessage = 'No previous offers submitted.',
}: PreviousOffersTableProps) {
  if (offers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8 border rounded-md bg-muted/30">
        {emptyMessage}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Quote No.</TableHead>
          <TableHead>Submitted</TableHead>
          {showParty && <TableHead>Party</TableHead>}
          {showEnquiry && <TableHead>Enquiry Ref</TableHead>}
          <TableHead>Offer Summary</TableHead>
          <TableHead className="text-right">Quoted Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {offers.map(offer => {
          const partyName = offer.customerName
            ?? mockCustomers.find(c => c.id === offer.customerId)?.name
            ?? '—';
          const itemSummary = offer.items
            .map(item => {
              const product = mockProducts.find(p => p.id === item.productId);
              return `${product?.model ?? item.productId} @ ${formatQuotedAmount(item.unitPrice)}`;
            })
            .join(' · ');

          return (
            <TableRow key={offer.quotationId}>
              <TableCell className="font-medium text-xs">{offer.quotationId}</TableCell>
              <TableCell>{format(new Date(offer.date), 'dd MMM yyyy')}</TableCell>
              {showParty && <TableCell>{partyName}</TableCell>}
              {showEnquiry && (
                <TableCell className="text-xs text-muted-foreground">
                  {offer.enquiryId ? (
                    <Link to={`/enquiries/${offer.enquiryId}`} className="text-primary hover:underline">
                      {offer.enquiryId}
                    </Link>
                  ) : (
                    'Direct'
                  )}
                </TableCell>
              )}
              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={itemSummary}>
                {itemSummary || '—'}
              </TableCell>
              <TableCell className="text-right font-semibold">{formatQuotedAmount(offer.totalAmount)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    offer.status === 'Accepted' ? 'default'
                      : offer.status === 'Rejected' ? 'destructive'
                        : 'secondary'
                  }
                >
                  {offer.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link to={`/quotations/${offer.quotationId}`}>
                  <span className="text-sm text-primary hover:underline">View offer</span>
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
