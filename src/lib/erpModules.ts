import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Bell, Database, ShoppingCart, Settings, Factory,
  ClipboardList, ShoppingBag, Layers, Truck, ShieldCheck, BarChart3,
  Wrench, Headset, Building2, FileSpreadsheet, Sliders, LineChart, Mail,
  Users, Wallet, FileText, Calendar,
} from 'lucide-react';

export type ErpNavItem = {
  name: string;
  path: string;
  icon?: LucideIcon;
  description?: string;
  componentKey?: string;
};

export type ErpNavGroup = {
  title: string;
  isCollapsible: boolean;
  icon?: LucideIcon;
  items: ErpNavItem[];
};

const p = (slug: string) => `/${slug.replace(/^\//, '')}`;

/** Unified ST-ERP + CORP-ERP navigation (deduplicated by path per group) */
export const appNavGroups: ErpNavGroup[] = [
  {
    title: 'Overview',
    isCollapsible: false,
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard, componentKey: 'dashboard' },
      { name: 'Tasks', path: '/tasks', icon: Bell, componentKey: 'tasks' },
      { name: 'Visitor Pass & Gate Registry', path: p('visitor-registry'), icon: Users, componentKey: 'visitor-registry' },
      { name: 'Communication Alerts', path: p('communication'), icon: Mail, componentKey: 'communication' },
    ],
  },
  {
    title: 'Master Data',
    isCollapsible: true,
    icon: Database,
    items: [
      { name: 'Master Configurations', path: p('master/saved-data'), description: 'System configurations and rate sheets.' },
      { name: 'Client & Party Master', path: p('master/parties'), componentKey: 'customers' },
      { name: 'Plant Catalog (Item Master)', path: p('master/items'), componentKey: 'products' },
      { name: 'Grade & Alloy Master', path: p('master/grades') },
      { name: 'Worker Directory', path: p('master/workers'), componentKey: 'workers' },
      { name: 'Transporter Master', path: p('master/transports') },
    ],
  },
  {
    title: 'Sales',
    isCollapsible: true,
    icon: ShoppingCart,
    items: [
      { name: 'Enquiries', path: p('enquiries'), componentKey: 'enquiries' },
      { name: 'Quotations', path: p('quotations'), componentKey: 'quotations' },
      { name: 'Pending Quotation Follow-up', path: p('sales/pending-quotations') },
      { name: 'Proforma Invoice (PI)', path: p('sales/invoice-entry'), componentKey: 'accounting' },
      { name: 'Tax Invoice (TI)', path: p('sales/ti-entry'), componentKey: 'accounting-ti' },
      { name: 'Customer & Consignee Registry', path: p('sales/client-profiles'), componentKey: 'sales-client-profiles' },
      { name: 'Client PO Tracking', path: p('sales/po-tracking'), componentKey: 'sales-po-tracking' },
      { name: 'Sales Reports', path: p('sales/reports'), componentKey: 'sales-reports' },
      { name: 'Sales Register', path: p('mis/sales-register') },
    ],
  },
  {
    title: 'Rentals',
    isCollapsible: true,
    icon: Calendar,
    items: [
      { name: 'Rental Billing Register', path: p('rentals/billing'), description: 'Recurring rental invoice ledger and challan linkage.' },
    ],
  },
  {
    title: 'Engineering & BOM',
    isCollapsible: true,
    icon: Settings,
    items: [
      { name: 'Bill Of Material', path: p('master/items'), componentKey: 'products' },
      { name: 'Replace Item In BOM', path: p('engineering/replace-bom-item') },
      { name: 'Replace Sales Order Items', path: p('engineering/replace-so-items') },
      { name: 'Drawing Master', path: p('engineering/drawing-master') },
      { name: 'BOM Reports', path: p('engineering/bom-reports') },
    ],
  },
  {
    title: 'Production & Fabrication',
    isCollapsible: true,
    icon: Factory,
    items: [
      { name: 'CNC Fabrication List', path: p('production/worker-cutting') },
      { name: 'Work Order Printing', path: p('mis/work-order-printing') },
      { name: 'Production & Bed Status', path: p('production/status') },
      { name: 'Work Order Shortage Report', path: p('mis/work-order-shortage') },
      { name: 'MTC & Vacuum Vessel Certs', path: p('production/mtc'), componentKey: 'mtc' },
      { name: 'TC Management', path: p('production/tc-management') },
      { name: 'Build Profit & Loss', path: p('reports/build-profit'), componentKey: 'build-profit' },
      { name: 'FAT & QA Inspection Logs', path: p('qms'), componentKey: 'qms' },
      { name: 'QC Tests', path: p('qc'), componentKey: 'qc' },
    ],
  },
  {
    title: 'Purchase & Procurement',
    isCollapsible: true,
    icon: ShoppingBag,
    items: [
      { name: 'PO (Pumps, Heaters, Spares)', path: p('purchase/orders'), componentKey: 'purchase-orders' },
      { name: 'Gate GRN & Inward Check', path: p('purchase/grn'), componentKey: 'grn' },
      { name: 'Purchase Returns', path: p('purchase/returns') },
      { name: 'Supplier Ledger', path: p('purchase/ledgers') },
      { name: 'Purchase Summary', path: p('mis/purchase-summary') },
      { name: 'Purchase Register', path: p('mis/purchase-register') },
    ],
  },
  {
    title: 'Inventory & Stores',
    isCollapsible: true,
    icon: Layers,
    items: [
      { name: 'Stock Summary', path: p('inventory/summary') },
      { name: 'Stock Register', path: p('inventory/register') },
      { name: 'Item Stock Status', path: p('inventory'), componentKey: 'inventory' },
      { name: 'Finish Item Stock Status', path: p('inventory/finish-stock') },
      { name: 'Inventory Control', path: p('inventory-control'), componentKey: 'inventory-control' },
      { name: 'GRN View', path: p('inventory/grn-view') },
      { name: 'GRN Modifications', path: p('inventory/grn-modifications') },
      { name: 'GRN Item Serial No.', path: p('inventory/grn-serial') },
      { name: 'Material Issue', path: p('inventory/material-issue') },
      { name: 'Issue Material Against SO', path: p('inventory/issue-against-so') },
      { name: 'Material Issue Against Project', path: p('inventory/issue-project') },
      { name: 'GIR (Gate Inward)', path: p('inventory/gir') },
      { name: 'Opening Stock', path: p('inventory/opening-stock') },
      { name: 'Stock Transactions', path: p('inventory/transaction') },
      { name: 'Stock Transfer (Stores)', path: p('inventory/stock-transfer-stores') },
      { name: 'Stock Transfer (Godowns)', path: p('inventory/stock-transfer-godowns') },
      { name: 'Returnable/Non-Returnable Challan', path: p('inventory/returnable-challan'), componentKey: 'returnable-challan' },
      { name: 'Returnable Receipt', path: p('inventory/returnable-receipt') },
      { name: 'Serial No. Tracking', path: p('inventory/serial-tracking') },
      { name: 'Inventory Reports', path: p('inventory/reports') },
    ],
  },
  {
    title: 'Despatch & Logistics',
    isCollapsible: true,
    icon: Truck,
    items: [
      { name: 'Dispatch Entry', path: p('sales/dispatch-entry'), componentKey: 'dispatch' },
      { name: 'Despatch Report', path: p('sales/dispatch-reports') },
      { name: 'Packing Lists', path: p('dispatch/packing-lists'), componentKey: 'packing-lists' },
      { name: 'E-Way Bills', path: p('eway-bills'), componentKey: 'eway-bills' },
      { name: 'Transport Bill Entry', path: p('transport/bill-entry') },
      { name: 'Transport Wise Summary', path: p('transport/summary') },
    ],
  },
  {
    title: 'Job Work',
    isCollapsible: true,
    icon: Wrench,
    items: [
      { name: 'Job Work Outward', path: p('inventory/job-work-out'), componentKey: 'job-work-out' },
      { name: 'Job Work Inward', path: p('inventory/job-work-in'), componentKey: 'job-work-in' },
      { name: 'Job Work Pending Report', path: p('inventory/job-work-pending') },
    ],
  },
  {
    title: 'Service & AMC',
    isCollapsible: true,
    icon: Headset,
    items: [
      { name: 'AMC Service Tickets', path: p('after-sales'), componentKey: 'after-sales' },
      { name: 'Service Call/Complaint', path: p('service/service-call') },
      { name: 'Feedback Answer Master', path: p('service/feedback-answers') },
      { name: 'Feedback Template', path: p('service/feedback-template') },
      { name: 'Service Reports', path: p('service/reports') },
    ],
  },
  {
    title: 'Finance, Billing & GST',
    isCollapsible: true,
    icon: Wallet,
    items: [
      { name: 'Ledger Registry', path: p('accounts/ledger') },
      { name: 'Outstanding Receivables', path: p('accounts/outstanding') },
      { name: 'Payments Journal', path: p('accounts/payments') },
      { name: 'Challan Reconciliation', path: p('accounts/challans') },
      { name: 'Finance & Compliance', path: p('finance'), componentKey: 'finance' },
      { name: 'GST Return', path: p('statutory/gst-return') },
      { name: 'GST Summary - Sales', path: p('statutory/gst-sales') },
      { name: 'GST Summary - Purchase', path: p('statutory/gst-purchase') },
      { name: 'GST ITC-04', path: p('statutory/gst-itc04') },
    ],
  },
  {
    title: 'Fixed Assets',
    isCollapsible: true,
    icon: Building2,
    items: [
      { name: 'Fixed Asset Master', path: p('fixed-assets/master') },
      { name: 'Asset Location Master', path: p('fixed-assets/locations') },
      { name: 'Maintenance/Service Details', path: p('fixed-assets/maintenance') },
      { name: 'Insurance Details', path: p('fixed-assets/insurance') },
      { name: 'Fixed Asset Reports', path: p('fixed-assets/reports') },
    ],
  },
  {
    title: 'MIS & Analytics',
    isCollapsible: true,
    icon: BarChart3,
    items: [
      { name: 'Sales Dashboard', path: p('reports/sales-dashboard'), componentKey: 'reports-dashboard' },
      { name: 'Quotation Summary (MIS)', path: p('mis/quotation-summary') },
      { name: 'Sales Activity', path: p('mis/sales-activity') },
      { name: 'Sales Order Summary', path: p('mis/sales-order-summary') },
      { name: 'Sales Order Summary (MIS)', path: p('mis/sales-order-summary-mis') },
      { name: 'Sales Summary', path: p('mis/sales-summary') },
      { name: 'Sales Summary (MIS)', path: p('mis/sales-summary-mis') },
      { name: 'MIS Sales Pipeline (Enq→Inv)', path: p('mis/sales-pipeline') },
      { name: 'Sales Agent Performance', path: p('mis/sales-agent-performance') },
      { name: 'Sales Target Summary', path: p('mis/sales-target') },
      { name: 'Sales Target (Group Wise)', path: p('mis/sales-target-group') },
      { name: 'Delay Quotation Report', path: p('mis/delay-quotation') },
      { name: 'Purchase Reports', path: p('reports/purchase') },
      { name: 'Production Reports', path: p('reports/production') },
      { name: 'Stock Reports', path: p('reports/stock') },
      { name: 'Material Receipt Reports', path: p('reports/receipts') },
      { name: 'Material Pending Reports', path: p('reports/pending') },
      { name: 'Final Inspection Reports', path: p('reports/final'), componentKey: 'final-reports' },
    ],
  },
  {
    title: 'Graphical Reports',
    isCollapsible: true,
    icon: LineChart,
    items: [
      { name: 'Enquiry Graph', path: p('graphical/enquiry') },
      { name: 'Sales Order Graph', path: p('graphical/sales-order') },
      { name: 'Sales Graph', path: p('graphical/sales') },
      { name: 'Receivables Vs Payments', path: p('graphical/receivables-payments') },
      { name: 'Purchase Graph', path: p('graphical/purchase') },
      { name: 'Stock Graph', path: p('graphical/stock') },
      { name: 'Business Graph', path: p('graphical/business') },
    ],
  },
  {
    title: 'Administration & Setup',
    isCollapsible: true,
    icon: Sliders,
    items: [
      { name: 'Company Profile', path: p('admin/company') },
      { name: 'Users Management', path: p('admin/users'), componentKey: 'users-management' },
      { name: 'Users & Roles (Settings)', path: p('settings/users-roles') },
      { name: 'Serial Number Master', path: p('admin/serial-numbers') },
      { name: 'Billing Templates', path: p('admin/billing-templates') },
      { name: 'Default Templates', path: p('admin/default-templates') },
      { name: 'Report Parameters', path: p('admin/report-parameters') },
      { name: 'Report Designing', path: p('admin/report-designing') },
      { name: 'Backup', path: p('admin/backup') },
      { name: 'Year End Process', path: p('admin/year-end') },
      { name: 'Import Data', path: p('admin/import-data') },
      { name: 'Invoice Type', path: p('admin/invoice-type') },
      { name: 'Sales Order Type', path: p('admin/sales-order-type') },
      { name: 'Auto Mail Parameters', path: p('admin/auto-mail') },
      { name: 'Auto SMS Parameters', path: p('admin/auto-sms') },
      { name: 'System Settings', path: p('settings'), componentKey: 'settings' },
      { name: 'Alert Center', path: p('settings/alert-center') },
      { name: 'Payroll', path: p('payroll'), componentKey: 'payroll' },
      { name: 'Document Management', path: p('documents'), icon: FileText, componentKey: 'documents' },
    ],
  },
];

/** @deprecated use appNavGroups */
export const erpNavGroups = appNavGroups;

export function getErpModuleRoutes(): ErpNavItem[] {
  const seen = new Set<string>();
  const routes: ErpNavItem[] = [];
  for (const group of appNavGroups) {
    for (const item of group.items) {
      if (!seen.has(item.path)) {
        seen.add(item.path);
        routes.push(item);
      }
    }
  }
  return routes;
}

export const USER_RIGHTS_MODULES = [
  'Masters',
  'Sales',
  'Rentals',
  'Engineering',
  'Production Planning',
  'Material Requirement Planning',
  'Purchase',
  'Inventory',
  'Despatch',
  'Quality Control',
  'Administration & Setup',
  'MIS Reports',
  'Bill Passing',
  'Job Work',
  'Excise',
  'Service',
  'Fixed Assets',
  'Graphical Reports',
  'Utility',
  'Statutory Reports',
] as const;

export const SEED_USERS = [
  { userName: 'Administrator', userId: 'Administrator' },
  { userName: 'R.M. Patel', userId: 'RMPatel' },
  { userName: 'Suketu Shah', userId: 'Suketu' },
  { userName: 'Mansi Shah', userId: 'Mansi' },
  { userName: 'Ramesh Patel', userId: 'Production' },
  { userName: 'Vraj Patel', userId: 'Vraj' },
];
