import type { WorkflowDefinition } from './workflowTypes';

export type RentalWorkflowPhaseId =
  | 'enquiry'
  | 'availability'
  | 'dispatch'
  | 'with-customer'
  | 'billing'
  | 'return'
  | 'stock';

const PHASE_RING: Record<RentalWorkflowPhaseId, string> = {
  enquiry: 'border-teal-500 bg-teal-50 text-teal-800',
  availability: 'border-blue-500 bg-blue-50 text-blue-800',
  dispatch: 'border-violet-500 bg-violet-50 text-violet-800',
  'with-customer': 'border-amber-500 bg-amber-50 text-amber-800',
  billing: 'border-emerald-500 bg-emerald-50 text-emerald-800',
  return: 'border-orange-500 bg-orange-50 text-orange-800',
  stock: 'border-zinc-500 bg-zinc-50 text-zinc-800',
};

export const EQUIPMENT_RENTAL_WORKFLOW: WorkflowDefinition = {
  id: 'equipment-rental',
  title: 'Equipment Rental Workflow',
  subtitle: 'Enquiry → availability check → outward challan → tracking → billing → return → available again',
  phaseRing: PHASE_RING,
  phaseOrder: ['enquiry', 'availability', 'dispatch', 'with-customer', 'billing', 'return', 'stock'],
  phases: {
    enquiry: {
      label: 'Rental Enquiry',
      subtitle: 'Customer wants equipment for short-term job — not a purchase',
      color: 'teal',
    },
    availability: {
      label: 'Availability Check',
      subtitle: 'Rental Asset Master — units owned vs out on rent',
      color: 'blue',
    },
    dispatch: {
      label: 'Issue Equipment',
      subtitle: 'Returnable Challan outward — customer, serial, terms',
      color: 'violet',
    },
    'with-customer': {
      label: 'With Customer',
      subtitle: 'Days-with-customer counter, overdue flags',
      color: 'amber',
    },
    billing: {
      label: 'Rental Billing',
      subtitle: 'Periodic invoice while equipment is still out',
      color: 'emerald',
    },
    return: {
      label: 'Equipment Returns',
      subtitle: 'Inward return linked to outward — condition check',
      color: 'orange',
    },
    stock: {
      label: 'Available Again',
      subtitle: 'Unit checked and ready for next rental',
      color: 'zinc',
    },
  },
  steps: [
    {
      step: 1,
      title: 'Customer Wants to Rent',
      narrative:
        'Customer needs a Dry Air Plant or Moisture Meter for a short-term job — rental enquiry, not a full purchase. Terms discussed: rate per day/week/month, expected duration.',
      module: 'Rental Enquiry',
      path: '/enquiries',
      phase: 'enquiry',
      related: [
        { label: 'Rental Quotation', path: '/quotations' },
        { label: 'Customer Registry', path: '/sales/client-profiles' },
      ],
      handoff: 'Customer, equipment type, hire period, expected rate',
    },
    {
      step: 2,
      title: 'Check Availability',
      narrative:
        'Before confirming, check Rental Asset Master — how many units you own and how many are already out with other customers. System shows Available vs Not Available per SKU/serial.',
      module: 'Asset Availability & Ageing',
      path: '/inventory/asset-availability',
      phase: 'availability',
      related: [
        { label: 'Returnable Challan', path: '/inventory/returnable-challan' },
        { label: 'Pending Item List', path: '/inventory/pending-items' },
      ],
      handoff: 'SKU, serial no., available qty, next free date if all out',
    },
    {
      step: 3,
      title: 'Issue the Equipment',
      narrative:
        'If available, issue a Returnable Challan (Outward): customer, equipment/serial, date sent, expected return, rental rate. Stock flips to "Not Available"; Days With Customer counter starts.',
      module: 'Returnable Challan (Outward)',
      path: '/inventory/returnable-challan',
      phase: 'dispatch',
      related: [
        { label: 'Rental Quotation', path: '/quotations' },
        { label: 'Dispatch Entry', path: '/sales/dispatch-entry' },
      ],
      handoff: 'Challan no., serial, outward date, expected return, rental terms',
    },
    {
      step: 4,
      title: 'Equipment With Customer',
      narrative:
        'While out, dashboard shows equipment under that customer\'s name with day-count increasing. If it crosses expected return date, flag as overdue for follow-up.',
      module: 'Pending Item List',
      path: '/inventory/pending-items',
      phase: 'with-customer',
      related: [
        { label: 'Asset Availability', path: '/inventory/asset-availability' },
        { label: 'Customer Registry', path: '/sales/client-profiles' },
      ],
      handoff: 'Qty pending, days ageing, delivery address, overdue alert',
    },
    {
      step: 5,
      title: 'Billing During Rental Period',
      narrative:
        'Per your terms (daily/weekly/monthly), raise Rental Invoice periodically while equipment is still out — linked to the same Outward Challan reference.',
      module: 'Rental Billing Register',
      path: '/rentals/billing',
      phase: 'billing',
      related: [
        { label: 'Proforma Invoice', path: '/sales/invoice-entry' },
        { label: 'Tax Invoice', path: '/sales/ti-entry' },
      ],
      handoff: 'Invoice no., challan ref, billing period, recurring amount',
    },
    {
      step: 6,
      title: 'Equipment Comes Back',
      narrative:
        'Customer returns equipment — Inward Return Challan linked to original Outward. Condition checked (Good/Damaged). If damaged, may trigger internal repair WO before next rental.',
      module: 'Returnable Challan (Inward)',
      path: '/inventory/returnable-challan',
      phase: 'return',
      related: [
        { label: 'Pending Item List', path: '/inventory/pending-items' },
        { label: 'Work Orders (Repair)', path: '/production/list' },
      ],
      handoff: 'Inward date, condition, qty returned, repair flag if damaged',
    },
    {
      step: 7,
      title: 'Stock Available Again',
      narrative:
        'Once returned and checked, unit flips back to "Available" in the dashboard — ready to rent to the next customer.',
      module: 'Asset Availability',
      path: '/inventory/asset-availability',
      phase: 'stock',
      related: [
        { label: 'Returnable Challan', path: '/inventory/returnable-challan' },
        { label: 'Rental Enquiries', path: '/enquiries' },
      ],
      handoff: 'Unit status = Available, last rental closed, ready for next outward',
    },
  ],
};
