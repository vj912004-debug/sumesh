/** ERP manufacturing workflow — steps, interlocks, and configuration guidance */

export type ErpWorkflowStep = {
  step: number;
  title: string;
  module: string;
  description: string;
  path: string;
  /** Planning chain ends at GRN; execution chain runs shop floor → billing */
  phase: 'order-to-stock' | 'shop-floor-to-bill';
};

export type ErpInterlock = {
  id: string;
  name: string;
  fromModule: string;
  toModule: string;
  dataPassed: string;
  fromPath: string;
  toPath: string;
  /** Step number this interlock connects (hand-off after step N) */
  afterStep: number;
  failureModes: string[];
};

export const ERP_WORKFLOW_STEPS: ErpWorkflowStep[] = [
  {
    step: 1,
    title: 'Sales order',
    module: 'Sales',
    description:
      'Customer order is booked in the Sales module. This creates the trigger record everything downstream reads from — order quantity, delivery date, customer, and price.',
    path: '/sales/po-tracking',
    phase: 'order-to-stock',
  },
  {
    step: 2,
    title: 'MRP planning',
    module: 'Planning / MRP',
    description:
      'The MRP engine explodes the Bill of Materials (BOM) against the sales order and current stock, and generates a production plan plus a list of shortages.',
    path: '/engineering/bom-reports',
    phase: 'order-to-stock',
  },
  {
    step: 3,
    title: 'Procurement',
    module: 'Purchase',
    description:
      'Shortage items become purchase requisitions, then purchase orders sent to vendors. This module reads directly from MRP output.',
    path: '/purchase/orders',
    phase: 'order-to-stock',
  },
  {
    step: 4,
    title: 'Inventory (GRN)',
    module: 'Inventory',
    description:
      'When materials arrive, a Goods Receipt Note updates stock quantities and triggers a three-way match (PO, GRN, invoice) for finance.',
    path: '/purchase/grn',
    phase: 'order-to-stock',
  },
  {
    step: 5,
    title: 'Production / shop floor',
    module: 'Production',
    description:
      'A work order is released once material availability is confirmed. Consumption of raw materials and labor/machine hours is logged in real time, decrementing inventory automatically.',
    path: '/production/ready-dispatch',
    phase: 'shop-floor-to-bill',
  },
  {
    step: 6,
    title: 'Quality control',
    module: 'Quality control',
    description:
      'Finished units (and often in-process units) are inspected against QC parameters before being allowed to move to stock. Rejects loop back to production or scrap.',
    path: '/qc',
    phase: 'shop-floor-to-bill',
  },
  {
    step: 7,
    title: 'FG warehouse',
    module: 'FG warehouse',
    description:
      'Approved finished goods are transferred into the warehouse module, updating available-to-promise stock.',
    path: '/inventory/finish-stock',
    phase: 'shop-floor-to-bill',
  },
  {
    step: 8,
    title: 'Dispatch',
    module: 'Dispatch',
    description:
      'Goods are picked, packed, and shipped against the original sales order; a delivery note is generated.',
    path: '/sales/dispatch-entry',
    phase: 'shop-floor-to-bill',
  },
  {
    step: 9,
    title: 'Finance / invoice',
    module: 'Finance',
    description:
      'Delivery confirmation triggers invoicing, which posts to accounts receivable, updates the general ledger, and closes the loop back to the original sales order.',
    path: '/finance',
    phase: 'shop-floor-to-bill',
  },
];

export const ERP_INTERLOCKS: ErpInterlock[] = [
  {
    id: 'order-to-plan',
    name: 'Order-to-plan',
    fromModule: 'Sales order',
    toModule: 'MRP planning',
    dataPassed: 'Quantity, due date, BOM',
    fromPath: '/sales/po-tracking',
    toPath: '/engineering/bom-reports',
    afterStep: 1,
    failureModes: ['Wrong BOM revision', 'Delivery date not copied to plan'],
  },
  {
    id: 'plan-to-buy',
    name: 'Plan-to-buy',
    fromModule: 'MRP planning',
    toModule: 'Procurement',
    dataPassed: 'Shortage list, required-by date',
    fromPath: '/engineering/bom-reports',
    toPath: '/purchase/orders',
    afterStep: 2,
    failureModes: ['Manual PO entry bypasses shortage list', 'Lead time not respected'],
  },
  {
    id: 'buy-to-stock',
    name: 'Buy-to-stock',
    fromModule: 'Procurement',
    toModule: 'Inventory',
    dataPassed: 'PO reference, quantity for GRN match',
    fromPath: '/purchase/orders',
    toPath: '/purchase/grn',
    afterStep: 3,
    failureModes: ['GRN without PO reference', 'Three-way match broken'],
  },
  {
    id: 'stock-to-shop',
    name: 'Stock-to-shop floor',
    fromModule: 'Inventory',
    toModule: 'Production',
    dataPassed: 'Material availability check',
    fromPath: '/inventory',
    toPath: '/production/ready-dispatch',
    afterStep: 4,
    failureModes: ['Work order released before stock confirmed', 'Phantom inventory'],
  },
  {
    id: 'shop-to-qc',
    name: 'Shop floor-to-QC',
    fromModule: 'Production',
    toModule: 'Quality control',
    dataPassed: 'Batch/lot number, work order ID',
    fromPath: '/production/ready-dispatch',
    toPath: '/qc',
    afterStep: 5,
    failureModes: ['Uninspected goods moved to stock', 'Lost batch traceability'],
  },
  {
    id: 'qc-to-warehouse',
    name: 'QC-to-warehouse',
    fromModule: 'Quality control',
    toModule: 'FG warehouse',
    dataPassed: 'Pass/fail status, batch release',
    fromPath: '/qc',
    toPath: '/inventory/finish-stock',
    afterStep: 6,
    failureModes: ['Rejected units booked as FG', 'ATP stock overstated'],
  },
  {
    id: 'warehouse-to-dispatch',
    name: 'Warehouse-to-dispatch',
    fromModule: 'FG warehouse',
    toModule: 'Dispatch',
    dataPassed: 'Stock allocation against sales order',
    fromPath: '/inventory/finish-stock',
    toPath: '/sales/dispatch-entry',
    afterStep: 7,
    failureModes: ['Dispatch without SO allocation', 'Missed partial shipments'],
  },
  {
    id: 'dispatch-to-finance',
    name: 'Dispatch-to-finance',
    fromModule: 'Dispatch',
    toModule: 'Finance',
    dataPassed: 'Delivery note, triggers invoice',
    fromPath: '/sales/dispatch-entry',
    toPath: '/finance',
    afterStep: 8,
    failureModes: ['Invoice qty ≠ delivered qty', 'Delivery note not linked'],
  },
  {
    id: 'finance-to-sales',
    name: 'Finance-to-sales (loop close)',
    fromModule: 'Finance',
    toModule: 'Sales order',
    dataPassed: 'Invoice status, order closure',
    fromPath: '/finance',
    toPath: '/mis/sales-register',
    afterStep: 9,
    failureModes: ['Open SO after full billing', 'AR not posted to GL'],
  },
];

export const ERP_CONFIGURATION_NOTES = [
  {
    title: 'Module mapping',
    body: 'Treat each workflow step as a distinct module or transaction type. SAP (PP/MM/SD/FI), Oracle, Odoo, and Sumesh ERP all mirror this structure.',
  },
  {
    title: 'Configuration priority',
    body: 'Get BOM and routing right first — they feed MRP. Then configure document flow (order → PO → GRN → invoice) so each transaction auto-copies references from the prior step. That is what interlocking means in practice.',
  },
  {
    title: 'Master data discipline',
    body: 'Item codes, BOMs, vendor codes, and customer codes must be created once in Master Data and reused across every module. Broken or duplicate master data is the most common cause of failed interlocks.',
  },
  {
    title: 'Mandatory integration points',
    body: 'Each interlock row is a mandatory system link. If any link is broken or manually re-keyed instead of interlocked, you get overstocking, missed shipments, or invoices that do not match delivered quantity.',
  },
];

export function getInterlockById(id: string): ErpInterlock | undefined {
  return ERP_INTERLOCKS.find(i => i.id === id);
}

export function getInterlockAfterStep(step: number): ErpInterlock | undefined {
  return ERP_INTERLOCKS.find(i => i.afterStep === step);
}
