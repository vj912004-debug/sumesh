/**
 * Master ERP Journey — 37 steps across Manufacturing, Service/AMC, Rental, and Rollup.
 * Single end-to-end map from first customer contact through delivery, after-sales, rental, and MIS.
 */
import type { WorkflowDefinition } from './workflowTypes';

export type MasterJourneyPhaseId = 'manufacturing' | 'service-amc' | 'rental' | 'rollup';

const PHASE_RING: Record<MasterJourneyPhaseId, string> = {
  manufacturing: 'border-teal-500 bg-teal-50 text-teal-800',
  'service-amc': 'border-violet-500 bg-violet-50 text-violet-800',
  rental: 'border-amber-500 bg-amber-50 text-amber-800',
  rollup: 'border-zinc-500 bg-zinc-50 text-zinc-800',
};

export const MASTER_ERP_JOURNEY: WorkflowDefinition = {
  id: 'master-journey',
  title: 'Complete ERP Journey',
  subtitle: '37 steps — Manufacturing (1–19) → Service & AMC (20–27) → Rental (28–34) → Rollup (35–37)',
  phaseRing: PHASE_RING,
  phaseOrder: ['manufacturing', 'service-amc', 'rental', 'rollup'],
  phases: {
    manufacturing: {
      label: 'Part A — Manufacturing',
      subtitle: 'Order to Delivery (Steps 1–19)',
      color: 'teal',
    },
    'service-amc': {
      label: 'Part B — Service & AMC',
      subtitle: 'Starts After Delivery (Steps 20–27)',
      color: 'violet',
    },
    rental: {
      label: 'Part C — Equipment Rental',
      subtitle: 'Independent Revenue Line (Steps 28–34)',
      color: 'amber',
    },
    rollup: {
      label: 'Part D — Rollup',
      subtitle: 'Ongoing Across All Three (Steps 35–37)',
      color: 'zinc',
    },
  },
  steps: [
    // ── PART A: MANUFACTURING ─────────────────────────────────────
    {
      step: 1,
      title: 'Enquiry Comes In',
      narrative:
        'Customer contacts you (call, email, exhibition, referral) needing a Transformer Oil Filtration Plant. Logged as Lead/Enquiry with customer details, requirement, and urgency.',
      module: 'Enquiries',
      path: '/enquiries',
      phase: 'manufacturing',
      handoff: 'Customer, requirement text, enquiry type, expected value, urgency',
    },
    {
      step: 2,
      title: 'Technical Understanding',
      narrative:
        'Technical team collects specs — flow rate, tank capacity, voltage class, site conditions — before quoting.',
      module: 'Enquiries / Cost Estimate',
      path: '/enquiries',
      phase: 'manufacturing',
      related: [
        { label: 'Cost Estimates', path: '/production/list' },
        { label: 'Plant Catalog', path: '/master/items' },
      ],
      handoff: 'Flow rate, tank spec, voltage class, site constraints',
    },
    {
      step: 3,
      title: 'Quotation BOM Built',
      narrative:
        'Open a Quotation, pick items from Item Catalog (searchable dropdown), add each with estimated qty — tank, pump, motor, filters, paint, electricals. System auto-calculates Total Estimated Cost; add margin for quoted price.',
      module: 'Quotations & BOM',
      path: '/quotations',
      phase: 'manufacturing',
      related: [
        { label: 'Item Master', path: '/master/item-master' },
        { label: 'Bill of Material', path: '/master/items' },
      ],
      handoff: 'Quoted BOM lines, estimated cost, margin, quoted amount',
    },
    {
      step: 4,
      title: 'Quotation Sent & Revised',
      narrative:
        'Quotation sent to customer. They may negotiate — edit BOM (add/remove/replace items) and re-quote until accepted.',
      module: 'Quotations',
      path: '/quotations',
      phase: 'manufacturing',
      related: [{ label: 'Pending Quotation Follow-up', path: '/sales/pending-quotations' }],
      handoff: 'Final accepted quotation version, revised BOM',
    },
    {
      step: 5,
      title: 'Customer Approves — PO Received',
      narrative:
        "Customer's PO converts Quotation into Sales Order — payment terms and delivery date fixed here.",
      module: 'Pending Client PO',
      path: '/sales/pending-po',
      phase: 'manufacturing',
      related: [
        { label: 'Client PO Tracking', path: '/sales/po-tracking' },
        { label: 'Quotations', path: '/quotations' },
      ],
      handoff: 'Sales Order no., client PO ref, delivery date, payment terms',
    },
    {
      step: 6,
      title: 'Design Approval (If Custom)',
      narrative:
        'For non-standard builds, GA drawing goes to customer for sign-off before manufacturing starts.',
      module: 'Drawing Master',
      path: '/engineering/drawing-master',
      phase: 'manufacturing',
      related: [{ label: 'BOM Reports', path: '/engineering/bom-reports' }],
      handoff: 'Approved drawing revision, customer sign-off date',
    },
    {
      step: 7,
      title: 'Work Order Opened',
      narrative:
        "Sales Order raises a Work Order (WO). The Quotation's BOM becomes this WO's Planned BOM — the target.",
      module: 'Work Orders',
      path: '/production/list',
      phase: 'manufacturing',
      related: [{ label: 'WO Shortage Report', path: '/mis/work-order-shortage' }],
      handoff: 'WO number, planned BOM, sanctioned qty per item',
    },
    {
      step: 8,
      title: 'Purchase Team Acts in Parallel',
      narrative:
        'Material not in stock → Purchase Order raised, tagged Manufacturing PO / Spares PO / Service PO — tracked on Pending PO dashboard among 20–30 open POs.',
      module: 'Purchase Orders',
      path: '/purchase/orders',
      phase: 'manufacturing',
      related: [{ label: 'Create PO', path: '/purchase/orders/new' }],
      handoff: 'PO number, WO reference, PO purpose, item & qty',
    },
    {
      step: 9,
      title: 'Material Arrives — GRN Done',
      narrative:
        'Vendor delivers → Store checks quality → Goods Receipt Note (GRN) → stock updated in Item Master.',
      module: 'Gate GRN & Inward',
      path: '/purchase/grn',
      phase: 'manufacturing',
      related: [
        { label: 'Stock Summary', path: '/inventory/summary' },
        { label: 'GRN View', path: '/inventory/grn-view' },
      ],
      handoff: 'GRN no., PO link, qty received, stock ledger update',
    },
    {
      step: 10,
      title: 'Material Requested for Production',
      narrative:
        'Two paths: Supervisor raises Material Requisition Slip (MRS) against WO → store reviews Planned/Issued/Balance → approves full/partial → issues. Or Direct Issue against WO. Stock reduces; WO Actual BOM fills (tagged Direct or Via-MRS).',
      module: 'Material Requisition & Issue',
      path: '/inventory/material-issue',
      phase: 'manufacturing',
      handoff: 'Issue ref, WO tag, qty issued, Direct vs Via-MRS',
    },
    {
      step: 11,
      title: 'Production / Assembly',
      narrative:
        'Tank fabrication, pump/motor assembly, piping, electricals, control panel wiring — in-house work; material consumption tracked against the WO.',
      module: 'Work Orders',
      path: '/production/list',
      phase: 'manufacturing',
      handoff: 'WO progress %, material consumed vs planned',
    },
    {
      step: 12,
      title: 'Job Work Sent Out',
      narrative:
        'Tank body needs painting — not in-house. Job Work Challan: item sent, qty, job worker, nature of work, linked to WO. In-house stock reduces; item stays part of the WO.',
      module: 'Job Work Challan (Outward)',
      path: '/inventory/job-work-challan',
      phase: 'manufacturing',
      related: [{ label: 'Job Work Outward', path: '/inventory/job-work-out' }],
      handoff: 'JW challan no., WO ref, qty sent, subcontractor',
    },
    {
      step: 13,
      title: 'Job Work Returns',
      narrative:
        'Painter returns tank — painted. Record Qty Received (transformed item), wastage, and Job Work Charge — adds to WO total cost.',
      module: 'Job Work Challan (Inward)',
      path: '/inventory/job-work-challan',
      phase: 'manufacturing',
      related: [{ label: 'Job Work Inward', path: '/inventory/job-work-in' }],
      handoff: 'Qty returned, scrap, job work charge, WO cost update',
    },
    {
      step: 14,
      title: 'Contractor Bill Booked',
      narrative:
        "Painter's bill may cover multiple jobs — split one bill into line items, each tagged to its own WO. Split must sum exactly to total bill amount.",
      module: 'Contractor Bill Booking',
      path: '/inventory/contractor-bills',
      phase: 'manufacturing',
      handoff: 'Bill no., WO-wise split lines, validated total',
    },
    {
      step: 15,
      title: 'Unused Material Returned',
      narrative:
        'Store issued 5L paint but only 4L used — Return entry booked (not delete). Stock goes up; WO BOM and cost correct; reason and user logged for audit.',
      module: 'Material Return',
      path: '/inventory/material-issue',
      phase: 'manufacturing',
      handoff: 'Return qty, reason, restored stock, WO cost correction',
    },
    {
      step: 16,
      title: 'Testing',
      narrative:
        'Before dispatch: filtration performance, vacuum levels, electrical safety, leak tests — quality report generated.',
      module: 'QC Tests',
      path: '/qc',
      phase: 'manufacturing',
      related: [
        { label: 'FAT & QA Logs', path: '/qms' },
        { label: 'MTC / Vessel Certs', path: '/production/mtc' },
      ],
      handoff: 'QC pass/fail, test report, batch release',
    },
    {
      step: 17,
      title: 'WO Closes → Finished Goods',
      narrative:
        'BOM fully consumed and job tested OK → WO marked complete → Material + Labor + Job Work + Testing Cost → Finished Goods entry with cost-per-unit → FG stock.',
      module: 'Finish Item Stock',
      path: '/inventory/finish-stock',
      phase: 'manufacturing',
      related: [{ label: 'Build Profit & Loss', path: '/reports/build-profit' }],
      handoff: 'FG receipt ref, serial no., landed cost per unit',
    },
    {
      step: 18,
      title: 'Dispatch',
      narrative:
        'Packing → Delivery Challan/Invoice → transport arranged → item leaves premises (ownership transfers, nothing expected back).',
      module: 'Dispatch Entry',
      path: '/sales/dispatch-entry',
      phase: 'manufacturing',
      related: [
        { label: 'Packing Lists', path: '/dispatch/packing-lists' },
        { label: 'E-Way Bills', path: '/eway-bills' },
        { label: 'Tax Invoice', path: '/sales/ti-entry' },
      ],
      handoff: 'Delivery challan no., SO link, dispatched qty',
    },
    {
      step: 19,
      title: 'Installation & Commissioning',
      narrative:
        'Service engineer on-site — erects, commissions, trains operator — billed separately or bundled with supply.',
      module: 'After-Sales / Commissioning',
      path: '/after-sales',
      phase: 'manufacturing',
      related: [{ label: 'Service Reports', path: '/service/reports' }],
      handoff: 'Commissioning report, operator training sign-off',
    },

    // ── PART B: SERVICE & AMC ─────────────────────────────────────
    {
      step: 20,
      title: 'AMC Contract Signed',
      narrative:
        'Customer signs AMC — contract period, number of visits, coverage terms logged in AMC Master.',
      module: 'AMC Quotation & Contract',
      path: '/quotations',
      phase: 'service-amc',
      related: [
        { label: 'AMC Service Tickets', path: '/after-sales' },
        { label: 'Fixed Asset Maintenance', path: '/fixed-assets/maintenance' },
      ],
      handoff: 'AMC contract ID, visits/year, coverage, contract value & dates',
    },
    {
      step: 21,
      title: 'Visit Scheduled',
      narrative:
        'Based on AMC terms (e.g. quarterly), a service visit is scheduled — auto or by coordinator.',
      module: 'Tasks & Scheduling',
      path: '/tasks',
      phase: 'service-amc',
      related: [{ label: 'AMC Service Tickets', path: '/after-sales' }],
      handoff: 'Visit date, assigned engineer, linked AMC & machine',
    },
    {
      step: 22,
      title: 'Engineer Visits — Reports Findings',
      narrative:
        'Oil sampling, filtration check, inspection — recorded in a Service Report.',
      module: 'Service Reports',
      path: '/service/reports',
      phase: 'service-amc',
      handoff: 'Service report no., oil BDV/PPM, condition, issues found',
    },
    {
      step: 23,
      title: 'Spares Issue During Visit',
      narrative:
        'Filter/gasket needs replacing — issued against service call. AMC-covered → no bill; not covered → Spares Sale on the spot.',
      module: 'Spares Issue',
      path: '/after-sales',
      phase: 'service-amc',
      related: [
        { label: 'Material Issue', path: '/inventory/material-issue' },
        { label: 'Tax Invoice (Billable)', path: '/sales/ti-entry' },
      ],
      handoff: 'Spares on ticket, AMC-covered flag, billable amount if any',
    },
    {
      step: 24,
      title: 'Breakdown Call (Outside Schedule)',
      narrative:
        'Sudden issue reported → Service Ticket independent of AMC calendar → same visit/report/spares logic, typically billed unless covered.',
      module: 'Service Call / Complaint',
      path: '/service/service-call',
      phase: 'service-amc',
      related: [{ label: 'AMC Service Tickets', path: '/after-sales' }],
      handoff: 'Breakdown ticket no., priority, billable vs AMC-covered',
    },
    {
      step: 25,
      title: 'Warranty Failure',
      narrative:
        'Pump/component fails under warranty → sent to OEM via Returnable Challan tagged "Under Warranty" — system blocks repair cost from being billed.',
      module: 'Warranty Repair Challan',
      path: '/inventory/warranty-repair',
      phase: 'service-amc',
      handoff: 'Warranty challan outward, OEM vendor, zero bill flag',
    },
    {
      step: 26,
      title: 'Repair Completed — Item Returns',
      narrative:
        'OEM repairs/replaces → Inward Return Challan linked to outward → status (Repaired/Replaced/Not Repairable) → engineer reinstalls at site.',
      module: 'Warranty Repair (Inward)',
      path: '/inventory/warranty-repair',
      phase: 'service-amc',
      handoff: 'Inward date, repair status, reinstall confirmation',
    },
    {
      step: 27,
      title: 'AMC Renewal',
      narrative:
        'Contract end nears → system flags renewal — full service history drives renewal terms and pricing.',
      module: 'Customer 360°',
      path: '/sales/client-profiles',
      phase: 'service-amc',
      related: [
        { label: 'Enquiries (Renewal)', path: '/enquiries' },
        { label: 'Quotations', path: '/quotations' },
      ],
      handoff: 'Renewal enquiry, revised AMC quote, new contract dates',
    },

    // ── PART C: EQUIPMENT RENTAL ──────────────────────────────────
    {
      step: 28,
      title: 'Rental Enquiry',
      narrative:
        'Customer wants to rent equipment — e.g. Dry Air Plant — instead of buying.',
      module: 'Rental Enquiry',
      path: '/enquiries',
      phase: 'rental',
      related: [{ label: 'Rental Quotation', path: '/quotations' }],
      handoff: 'Customer, equipment type, hire period, rate',
    },
    {
      step: 29,
      title: 'Availability Check',
      narrative:
        'Rental Asset Master — Total Owned vs Qty Already Out on Rent → Available vs Not Available.',
      module: 'Asset Availability',
      path: '/inventory/asset-availability',
      phase: 'rental',
      handoff: 'SKU, serial, available qty, next free date',
    },
    {
      step: 30,
      title: 'Equipment Issued',
      narrative:
        'Outward Returnable Challan — customer, item/serial, date sent, expected return, rental rate. Status → Not Available; Days-With-Customer ageing starts.',
      module: 'Returnable Challan (Outward)',
      path: '/inventory/returnable-challan',
      phase: 'rental',
      handoff: 'Challan no., serial, outward date, expected return, rate',
    },
    {
      step: 31,
      title: 'Equipment Stays With Customer',
      narrative:
        'Dashboard shows item under customer; ageing counter increases. Past expected return → flagged overdue.',
      module: 'Pending Item List',
      path: '/inventory/pending-items',
      phase: 'rental',
      handoff: 'Qty pending, days ageing, overdue alert',
    },
    {
      step: 32,
      title: 'Rental Billing',
      narrative:
        'Rental Invoice raised periodically (daily/weekly/monthly) while equipment is still out.',
      module: 'Rental Billing Register',
      path: '/rentals/billing',
      phase: 'rental',
      related: [{ label: 'Tax Invoice', path: '/sales/ti-entry' }],
      handoff: 'Invoice no., challan ref, billing period, amount',
    },
    {
      step: 33,
      title: 'Equipment Returned',
      narrative:
        'Inward Return Challan linked to original outward — condition checked (Good/Damaged).',
      module: 'Returnable Challan (Inward)',
      path: '/inventory/returnable-challan',
      phase: 'rental',
      handoff: 'Inward date, condition, qty returned',
    },
    {
      step: 34,
      title: 'Stock Available Again',
      narrative:
        'Item flips to Available — ready for next rental. If damaged, may trigger internal repair WO first.',
      module: 'Asset Availability',
      path: '/inventory/asset-availability',
      phase: 'rental',
      related: [{ label: 'Work Orders (Repair)', path: '/production/list' }],
      handoff: 'Unit status = Available, repair flag if damaged',
    },

    // ── PART D: ROLLUP ────────────────────────────────────────────
    {
      step: 35,
      title: 'Costing Rollup',
      narrative:
        'WO-wise report: Material (net of returns) + Labor + Job Work + Testing vs Quotation/Sanctioned → job-wise profitability.',
      module: 'Build Profit & Loss',
      path: '/reports/build-profit',
      phase: 'rollup',
      related: [
        { label: 'Sales Dashboard', path: '/reports/sales-dashboard' },
        { label: 'Finance & Compliance', path: '/finance' },
      ],
      handoff: 'Variance report, margin %, cost breakdown by WO',
    },
    {
      step: 36,
      title: 'Customer 360° View',
      narrative:
        'Per customer: what they bought, what is on rent, under warranty, active AMC — one place for renewals and cross-selling.',
      module: 'Customer Registry',
      path: '/sales/client-profiles',
      phase: 'rollup',
      related: [
        { label: 'Pending Item List', path: '/inventory/pending-items' },
        { label: 'Asset Availability', path: '/inventory/asset-availability' },
        { label: 'After-Sales', path: '/after-sales' },
      ],
      handoff: 'Unified view: sales, rental, warranty, AMC history',
    },
    {
      step: 37,
      title: 'Consolidated Challan Register',
      narrative:
        'One register: every Delivery, Returnable, and Job Work Challan — status, ageing, closure — nothing untracked.',
      module: 'Challan Reconciliation',
      path: '/accounts/challans',
      phase: 'rollup',
      related: [
        { label: 'Returnable Challan', path: '/inventory/returnable-challan' },
        { label: 'Job Work Challan', path: '/inventory/job-work-challan' },
        { label: 'Dispatch Entry', path: '/sales/dispatch-entry' },
      ],
      handoff: 'Challan type, status, ageing, open vs closed',
    },
  ],
};
