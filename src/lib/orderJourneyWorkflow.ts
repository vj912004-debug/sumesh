/**
 * The Journey of One Order — end-to-end business flow for Sumesh Petroleum ERP.
 * Each step maps to a live module path in the application.
 */

export type JourneyPhaseId =
  | 'sales-quote'
  | 'buy-stock'
  | 'make-move'
  | 'finish-deliver'
  | 'after-sales'
  | 'finance-history';

export type OrderJourneyStep = {
  step: number;
  title: string;
  /** Plain-language story (what happens on the shop floor) */
  narrative: string;
  module: string;
  path: string;
  phase: JourneyPhaseId;
  /** Extra modules involved in this step */
  related?: Array<{ label: string; path: string }>;
  /** Key data that must flow to the next step */
  handoff?: string;
};

export const JOURNEY_PHASES: Record<JourneyPhaseId, { label: string; subtitle: string; color: string }> = {
  'sales-quote': {
    label: 'Sales & Engineering',
    subtitle: 'Lead → Quote → Client PO → Work Order',
    color: 'teal',
  },
  'buy-stock': {
    label: 'Purchase & Stores',
    subtitle: 'Buy material → Receive at gate',
    color: 'blue',
  },
  'make-move': {
    label: 'Production & Job Work',
    subtitle: 'Issue material → Outside work → Return leftovers → Test',
    color: 'amber',
  },
  'finish-deliver': {
    label: 'Finish & Dispatch',
    subtitle: 'FG costing → Ship → Install',
    color: 'emerald',
  },
  'after-sales': {
    label: 'Service, Warranty & Rental',
    subtitle: 'AMC visits → Warranty returns → Rental tracking',
    color: 'violet',
  },
  'finance-history': {
    label: 'Spares, MIS & Customer 360°',
    subtitle: 'Direct spares sales → Month-end → Full customer history',
    color: 'zinc',
  },
};

export const ORDER_JOURNEY_STEPS: OrderJourneyStep[] = [
  {
    step: 1,
    title: 'Lead / Enquiry',
    narrative:
      'A power plant or transformer company calls or emails — they need an Oil Filtration Plant. This is your Lead.',
    module: 'Enquiries',
    path: '/enquiries',
    phase: 'sales-quote',
    handoff: 'Customer, requirements, enquiry type (manufacture / rental / spares)',
  },
  {
    step: 2,
    title: 'Quotation & Estimated BOM',
    narrative:
      'Technical team sizes the job (tank, pump, filters) and builds an estimated BOM — a shopping list with prices — to arrive at the quoted amount.',
    module: 'Quotations',
    path: '/quotations',
    phase: 'sales-quote',
    related: [
      { label: 'Cost Estimate', path: '/production/list' },
      { label: 'Bill of Material', path: '/master/items' },
      { label: 'Item Master', path: '/master/item-master' },
    ],
    handoff: 'Approved BOM lines, rates, quoted value',
  },
  {
    step: 3,
    title: 'Client PO → Sales Order',
    narrative:
      'Customer says yes and sends their PO. It becomes your Sales Order; for custom designs, drawings are approved before build starts.',
    module: 'Pending Client PO',
    path: '/sales/pending-po',
    phase: 'sales-quote',
    related: [
      { label: 'Client PO Tracking', path: '/sales/po-tracking' },
      { label: 'Drawing Master', path: '/engineering/drawing-master' },
    ],
    handoff: 'SO number, delivery date, client PO reference',
  },
  {
    step: 4,
    title: 'Work Order Opens',
    narrative:
      'A Work Order (WO) is created. The estimated BOM becomes the plan — what should go into this job.',
    module: 'Work Orders',
    path: '/production/list',
    phase: 'sales-quote',
    related: [{ label: 'WO Shortage Report', path: '/mis/work-order-shortage' }],
    handoff: 'WO number, planned BOM, sanctioned qty per item',
  },
  {
    step: 5,
    title: 'Purchase — Raw Material & Spares',
    narrative:
      'Purchase team buys raw material, spares, or services. Pending POs are tracked by type (Manufacture / Sales / Rental) so nothing is lost among 20–30 open orders.',
    module: 'Purchase Orders',
    path: '/purchase/orders',
    phase: 'buy-stock',
    related: [{ label: 'Pending PO List', path: '/purchase/orders' }],
    handoff: 'PO number, WO reference, item & qty, PO purpose',
  },
  {
    step: 6,
    title: 'Material Arrives — GRN',
    narrative: 'Material arrives at store, is checked at gate, and stocked. Inventory goes up; PO can be matched on bill.',
    module: 'Gate GRN & Inward',
    path: '/purchase/grn',
    phase: 'buy-stock',
    related: [
      { label: 'Stock Summary', path: '/inventory/summary' },
      { label: 'GRN View', path: '/inventory/grn-view' },
    ],
    handoff: 'GRN qty, PO link, stock ledger update',
  },
  {
    step: 7,
    title: 'Material Issue to WO',
    narrative:
      'Production starts. Workers raise a Requisition Slip or store does a Direct Issue — either way it is logged against the WO and store stock goes down.',
    module: 'Material Requisition & Issue',
    path: '/inventory/material-issue',
    phase: 'make-move',
    handoff: 'WO tag, item, issued qty, store balance',
  },
  {
    step: 8,
    title: 'Job Work Challan (Outside)',
    narrative:
      'Parts go outside — e.g. tank body to painter. Not a sale: Job Work Challan tracks what left, what came back (painted), cost — still on the same WO.',
    module: 'Job Work Challan',
    path: '/inventory/job-work-challan',
    phase: 'make-move',
    related: [
      { label: 'Job Work Outward', path: '/inventory/job-work-out' },
      { label: 'Job Work Inward', path: '/inventory/job-work-in' },
      { label: 'Contractor Bills', path: '/inventory/contractor-bills' },
    ],
    handoff: 'JW challan no., WO ref, outward/inward qty & cost',
  },
  {
    step: 9,
    title: 'Material Return to Store',
    narrative:
      'Leftover material comes back — if painter used less than issued, it is returned, not deleted. Store stock goes up; WO cost corrects.',
    module: 'Material Return (same module)',
    path: '/inventory/material-issue',
    phase: 'make-move',
    handoff: 'Return qty to WO, reason, restored stock',
  },
  {
    step: 10,
    title: 'QC & Testing',
    narrative: 'Job passes testing — leaks, performance, safety checks before it can move to finished goods.',
    module: 'QC Tests',
    path: '/qc',
    phase: 'make-move',
    related: [
      { label: 'FAT & QA Logs', path: '/qms' },
      { label: 'MTC / Vessel Certs', path: '/production/mtc' },
    ],
    handoff: 'Pass/fail, batch release, reject loop if needed',
  },
  {
    step: 11,
    title: 'Finished Goods & Costing',
    narrative:
      'Unit is finished — total cost (material + job work + labor) is known. It moves to Finished Goods ready for dispatch.',
    module: 'Finish Item Stock',
    path: '/inventory/finish-stock',
    phase: 'finish-deliver',
    related: [{ label: 'Build Profit & Loss', path: '/reports/build-profit' }],
    handoff: 'FG qty, landed cost, WO cost rollup',
  },
  {
    step: 12,
    title: 'Dispatch & Installation',
    narrative:
      'Dispatched with Delivery Challan — ownership transfers, nothing comes back. Team installs on-site and trains operators.',
    module: 'Dispatch Entry',
    path: '/sales/dispatch-entry',
    phase: 'finish-deliver',
    related: [
      { label: 'Packing Lists', path: '/dispatch/packing-lists' },
      { label: 'E-Way Bills', path: '/eway-bills' },
      { label: 'Tax Invoice', path: '/sales/ti-entry' },
    ],
    handoff: 'Challan no., SO link, delivered qty',
  },
  {
    step: 13,
    title: 'AMC & Warranty Repair',
    narrative:
      'Service begins under AMC — periodic visits, oil checks. Warranty breakdown goes to OEM via Returnable Challan; it comes back, no bill.',
    module: 'AMC Service Tickets',
    path: '/after-sales',
    phase: 'after-sales',
    related: [{ label: 'Warranty Repair Challan', path: '/inventory/warranty-repair' }],
    handoff: 'Service ticket, warranty challan outward/inward',
  },
  {
    step: 14,
    title: 'Rental — Returnable Challan',
    narrative:
      'Some customers rent — Dry Air Plant or Vacuum Pump goes on Returnable Challan. Track days pending at customer site.',
    module: 'Returnable Challan',
    path: '/inventory/returnable-challan',
    phase: 'after-sales',
    related: [
      { label: 'Pending Item List', path: '/inventory/pending-items' },
      { label: 'Asset Availability & Ageing', path: '/inventory/asset-availability' },
      { label: 'Rental Billing', path: '/rentals/billing' },
    ],
    handoff: 'Challan no., customer, address, qty sent vs returned',
  },
  {
    step: 15,
    title: 'Spares Sales (No WO)',
    narrative:
      'Customers order spares only — filters, gaskets — simple sale, no work order involved.',
    module: 'Tax Invoice / PI',
    path: '/sales/ti-entry',
    phase: 'finance-history',
    related: [
      { label: 'Proforma Invoice', path: '/sales/invoice-entry' },
      { label: 'Enquiry for Spares', path: '/enquiries' },
    ],
    handoff: 'Invoice, item, qty, no WO tag',
  },
  {
    step: 16,
    title: 'Month-end MIS',
    narrative:
      'Accounts pull it together — actual WO cost vs quote, revenue from sales vs AMC vs rental vs spares.',
    module: 'Build Profit & MIS',
    path: '/reports/build-profit',
    phase: 'finance-history',
    related: [
      { label: 'Sales Dashboard', path: '/reports/sales-dashboard' },
      { label: 'Sales Pipeline MIS', path: '/mis/sales-pipeline' },
      { label: 'Finance & Compliance', path: '/finance' },
    ],
    handoff: 'Variance report, revenue split by stream',
  },
  {
    step: 17,
    title: 'Customer 360° History',
    narrative:
      'Full customer history stays visible — what they bought, what is on rent, what is under warranty — so renewals and follow-ups are not missed.',
    module: 'Customer Registry',
    path: '/sales/client-profiles',
    phase: 'finance-history',
    related: [
      { label: 'Area-wise Customer Report', path: '/reports/customers-by-area' },
      { label: 'Pending Item List', path: '/inventory/pending-items' },
      { label: 'Asset Availability', path: '/inventory/asset-availability' },
    ],
    handoff: 'Unified view: sales, rental, warranty, AMC',
  },
];

export function getJourneyStepsByPhase(phase: JourneyPhaseId): OrderJourneyStep[] {
  return ORDER_JOURNEY_STEPS.filter(s => s.phase === phase);
}

export const JOURNEY_PHASE_ORDER: JourneyPhaseId[] = [
  'sales-quote',
  'buy-stock',
  'make-move',
  'finish-deliver',
  'after-sales',
  'finance-history',
];
