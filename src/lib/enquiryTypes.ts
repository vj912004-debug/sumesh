export const ENQUIRY_TYPES = [
  { value: 'rental', label: 'Enquiry for Rental' },
  { value: 'supply', label: 'Enquiry for Supply' },
  { value: 'service', label: 'Enquiry for Service' },
  { value: 'spares', label: 'Enquiry for Spares' },
] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number]['value'];

export const DEFAULT_ENQUIRY_TYPE: EnquiryType = 'supply';

export function getEnquiryTypeLabel(type?: string): string {
  return ENQUIRY_TYPES.find(t => t.value === type)?.label ?? ENQUIRY_TYPES.find(t => t.value === DEFAULT_ENQUIRY_TYPE)!.label;
}

export function normalizeEnquiryType(type?: string): EnquiryType {
  if (type && ENQUIRY_TYPES.some(t => t.value === type)) {
    return type as EnquiryType;
  }
  return DEFAULT_ENQUIRY_TYPE;
}

export const ENQUIRY_TYPE_STYLES: Record<EnquiryType, string> = {
  rental: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950 dark:text-violet-200',
  supply: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200',
  service: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200',
  spares: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200',
};
