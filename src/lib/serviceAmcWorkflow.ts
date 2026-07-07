import type { WorkflowDefinition } from './workflowTypes';

export type ServiceAmcPhaseId =
  | 'contract'
  | 'field-ops'
  | 'spares'
  | 'breakdown'
  | 'warranty'
  | 'renewal';

const PHASE_RING: Record<ServiceAmcPhaseId, string> = {
  contract: 'border-violet-500 bg-violet-50 text-violet-800',
  'field-ops': 'border-teal-500 bg-teal-50 text-teal-800',
  spares: 'border-amber-500 bg-amber-50 text-amber-800',
  breakdown: 'border-red-500 bg-red-50 text-red-800',
  warranty: 'border-blue-500 bg-blue-50 text-blue-800',
  renewal: 'border-emerald-500 bg-emerald-50 text-emerald-800',
};

export const SERVICE_AMC_WORKFLOW: WorkflowDefinition = {
  id: 'service-amc',
  title: 'Service & AMC Workflow',
  subtitle: 'Contract → scheduled visits → on-site reports → spares → breakdown → warranty → renewal',
  phaseRing: PHASE_RING,
  phaseOrder: ['contract', 'field-ops', 'spares', 'breakdown', 'warranty', 'renewal'],
  phases: {
    contract: {
      label: 'AMC Contract',
      subtitle: 'Customer signs AMC — equipment, visits, value logged',
      color: 'violet',
    },
    'field-ops': {
      label: 'Field Operations',
      subtitle: 'Schedule visit → engineer on-site → service report',
      color: 'teal',
    },
    spares: {
      label: 'Spares During Visit',
      subtitle: 'Filter/gasket issue — AMC-covered or billable',
      color: 'amber',
    },
    breakdown: {
      label: 'Breakdown Calls',
      subtitle: 'Unscheduled tickets outside AMC calendar',
      color: 'red',
    },
    warranty: {
      label: 'Warranty Repair',
      subtitle: 'OEM return via warranty challan — no repair bill',
      color: 'blue',
    },
    renewal: {
      label: 'AMC Renewal',
      subtitle: 'Contract end flagged — Customer 360° drives renewal',
      color: 'emerald',
    },
  },
  steps: [
    {
      step: 1,
      title: 'AMC Contract Starts',
      narrative:
        'Customer signs an AMC for their transformer oil filtration plant — periodic servicing, oil testing, preventive maintenance. Logged as AMC Master: customer, equipment covered, contract period, visits included, contract value.',
      module: 'AMC Quotation & Contract',
      path: '/quotations',
      phase: 'contract',
      related: [
        { label: 'AMC Service Tickets', path: '/after-sales' },
        { label: 'Customer Registry', path: '/sales/client-profiles' },
        { label: 'Fixed Asset Maintenance', path: '/fixed-assets/maintenance' },
      ],
      handoff: 'Customer, machine serial, visits/year, contract value, start & end dates',
    },
    {
      step: 2,
      title: 'Visit Gets Scheduled',
      narrative:
        'Based on AMC terms (e.g. quarterly), a service visit is scheduled — automatically by the system or manually by the service coordinator.',
      module: 'Tasks & Scheduling',
      path: '/tasks',
      phase: 'field-ops',
      related: [
        { label: 'AMC Service Tickets', path: '/after-sales' },
        { label: 'Communication Alerts', path: '/communication' },
      ],
      handoff: 'Visit date, assigned engineer, linked AMC contract & machine',
    },
    {
      step: 3,
      title: 'Engineer Goes On-Site',
      narrative:
        'Service engineer visits — oil sampling, filtration check, inspection. Findings recorded in a Service Report: what was checked, condition, issues found.',
      module: 'Service Reports',
      path: '/service/reports',
      phase: 'field-ops',
      related: [
        { label: 'AMC Service Tickets', path: '/after-sales' },
        { label: 'QC / Oil Test Logs', path: '/qc' },
      ],
      handoff: 'Service report no., oil BDV/PPM readings, pass/fail, next visit due',
    },
    {
      step: 4,
      title: 'Spares Needed During Visit',
      narrative:
        'Filter or gasket needs replacing — triggers Spares Issue against that service call. If covered under AMC, no separate bill; if not covered, billable spares sale on the spot.',
      module: 'Spares Issue & PO',
      path: '/after-sales',
      phase: 'spares',
      related: [
        { label: 'Material Issue', path: '/inventory/material-issue' },
        { label: 'Purchase Orders (Spares)', path: '/purchase/orders' },
        { label: 'Tax Invoice (Billable)', path: '/sales/ti-entry' },
      ],
      handoff: 'Spares consumed on ticket, AMC-covered flag, billable qty if any',
    },
    {
      step: 5,
      title: 'Breakdown Call (Outside Schedule)',
      narrative:
        'Customer calls with a sudden problem — creates a Service Call/Ticket independent of the AMC calendar. Engineer dispatched; same reporting and spares logic, but usually billed separately unless under AMC/warranty.',
      module: 'Service Call / Complaint',
      path: '/service/service-call',
      phase: 'breakdown',
      related: [
        { label: 'AMC Service Tickets', path: '/after-sales' },
        { label: 'Enquiries (Service)', path: '/enquiries' },
      ],
      handoff: 'Breakdown ticket no., priority, dispatch time, billable vs AMC-covered',
    },
    {
      step: 6,
      title: 'Warranty — Part Sent to OEM',
      narrative:
        'Pump or component fails under warranty — sent to OEM via Returnable Challan tagged "Under Warranty". No repair cost to you or customer. OEM repairs/replaces; inward return; engineer reinstalls at site.',
      module: 'Warranty Repair Challan',
      path: '/inventory/warranty-repair',
      phase: 'warranty',
      related: [
        { label: 'Returnable Challan', path: '/inventory/returnable-challan' },
        { label: 'AMC Service Tickets', path: '/after-sales' },
      ],
      handoff: 'Warranty challan outward/inward, OEM vendor, repair status, reinstall date',
    },
    {
      step: 7,
      title: 'AMC Renewal Follow-Up',
      narrative:
        'As contract end date approaches, system flags renewal follow-up. Customer 360° history — past visits, issues, spares used — helps decide renewal terms and pricing.',
      module: 'Customer 360° & Renewal',
      path: '/sales/client-profiles',
      phase: 'renewal',
      related: [
        { label: 'Enquiries (AMC Renewal)', path: '/enquiries' },
        { label: 'Quotations', path: '/quotations' },
        { label: 'Pending Quotation Follow-up', path: '/sales/pending-quotations' },
      ],
      handoff: 'Renewal enquiry, revised AMC quote, updated contract dates',
    },
  ],
};
