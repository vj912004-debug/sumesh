import { Badge } from '@/components/ui/badge';
import {
  getEnquiryQuoteStatusLabel,
  type EnquiryQuotePipelineStatus,
} from '@/lib/quotationService';

const STYLE: Record<EnquiryQuotePipelineStatus, string> = {
  quotation_pending: 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse',
  draft: 'bg-slate-100 text-slate-800 border-slate-200',
  sent: 'bg-blue-100 text-blue-800 border-blue-200',
  accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  po_awarded: 'bg-primary/10 text-primary border-primary/30',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

type Props = {
  status: EnquiryQuotePipelineStatus;
  className?: string;
};

export default function EnquiryQuoteStatusBadge({ status, className = '' }: Props) {
  return (
    <Badge variant="outline" className={`${STYLE[status]} ${className}`}>
      {getEnquiryQuoteStatusLabel(status)}
    </Badge>
  );
}
