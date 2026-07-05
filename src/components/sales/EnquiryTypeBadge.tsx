import { Badge } from '@/components/ui/badge';
import { ENQUIRY_TYPE_STYLES, getEnquiryTypeLabel, normalizeEnquiryType } from '@/lib/enquiryTypes';

export function EnquiryTypeBadge({ type }: { type?: string }) {
  const normalized = normalizeEnquiryType(type);
  return (
    <Badge variant="outline" className={ENQUIRY_TYPE_STYLES[normalized]}>
      {getEnquiryTypeLabel(normalized)}
    </Badge>
  );
}
