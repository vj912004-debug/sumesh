import type { LucideIcon } from 'lucide-react';
import {
  FileText, Clock, CheckCircle, TrendingUp, Package, Truck, Wallet,
  BarChart3, LineChart, Users, Wrench, ShieldCheck, Database, Settings,
  ClipboardList, Building2, Layers,
} from 'lucide-react';
import {
  getModuleBlueprint,
  blueprintToTableHeaders,
  type ModuleBlueprint,
  type BlueprintField,
} from '@/lib/moduleBlueprints';

export type { ModuleBlueprint, BlueprintField };
export { getModuleBlueprint };

export type MetricFilterKey = 'all' | 'active' | 'completed' | 'growth';

export type RowFieldKey = 'ref' | 'date' | 'category' | 'desc' | 'status';

export type ModuleFormField = {
  key: RowFieldKey;
  label: string;
  type: 'text' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
};

export type ModuleFormConfig = {
  refPrefix: string;
  defaultCategory: string;
  defaultStatus: string;
  statusOptions: string[];
  searchPlaceholder: string;
  addDescription: string;
  editDescription: string;
  viewDescription: string;
  fields: ModuleFormField[];
};

export type ModuleProfile = {
  metricLabels: Record<MetricFilterKey, string>;
  metricIcons: [LucideIcon, LucideIcon, LucideIcon, LucideIcon];
  metricColors: [string, string, string, string];
  tableHeaders: string[];
  logTitle: string;
  activeStatuses: string[];
  completedStatus: string;
  seedCategories: string[];
  seedDescriptions: string[];
  form?: ModuleFormConfig;
  blueprint?: ModuleBlueprint | null;
};

const DEFAULT_ICONS: ModuleProfile['metricIcons'] = [FileText, Clock, CheckCircle, TrendingUp];
const DEFAULT_COLORS: ModuleProfile['metricColors'] = [
  'text-primary',
  'text-teal-500',
  'text-green-500',
  'text-emerald-500',
];

function profile(
  partial: Partial<ModuleProfile> & Pick<ModuleProfile, 'metricLabels' | 'tableHeaders'>
): ModuleProfile {
  const base: ModuleProfile = {
    metricIcons: partial.metricIcons ?? DEFAULT_ICONS,
    metricColors: partial.metricColors ?? DEFAULT_COLORS,
    logTitle: partial.logTitle ?? 'Operational Log',
    activeStatuses: partial.activeStatuses ?? ['Pending', 'In Progress', 'Draft', 'Open', 'QC Pending'],
    completedStatus: partial.completedStatus ?? 'Completed',
    seedCategories: partial.seedCategories ?? ['General', 'Urgent', 'Review', 'Bulk', 'Archive'],
    seedDescriptions: partial.seedDescriptions ?? [
      'Awaiting commercial review and verification',
      'Material logs synchronized from system',
      'Awaiting manager approval',
      'Historical data migration complete',
      'Standard processing queue entry',
    ],
    ...partial,
  };
  return base;
}

function refPrefixForPath(path: string): string {
  if (path.includes('/inventory/register')) return 'STK-REG-';
  if (path.startsWith('/inventory/')) return 'STK-';
  if (path.startsWith('/purchase/')) return 'PO-';
  if (path.startsWith('/sales/')) return 'SO-';
  if (path.startsWith('/admin/')) return 'CFG-';
  if (path.startsWith('/service/')) return 'SVC-';
  if (path.startsWith('/statutory/')) return 'GST-';
  if (path.startsWith('/transport/')) return 'LR-';
  if (path.startsWith('/production/')) return 'WO-';
  if (path.startsWith('/graphical/')) return 'DATA-';
  if (path.startsWith('/mis/')) return 'MIS-';
  if (path.startsWith('/accounts/')) return 'VCH-';
  if (path.startsWith('/engineering/')) return 'ENG-';
  if (path.startsWith('/master/')) return 'MST-';
  if (path.startsWith('/fixed-assets/')) return 'AST-';
  if (path.startsWith('/reports/')) return 'RPT-';
  return 'TXN-';
}

function statusOptionsForProfile(p: ModuleProfile, path: string): string[] {
  if (path.startsWith('/inventory/')) {
    return ['Received', 'Issued', 'In Transit', 'Adjusted', 'QC Pending', 'Completed'];
  }
  if (path.startsWith('/purchase/')) {
    return ['Draft', 'Pending Approval', 'PO Sent', 'Partial GRN', 'Received', 'Completed'];
  }
  if (path.startsWith('/statutory/')) {
    return ['Draft', 'Pending Filing', 'Filed', 'Amended', 'Completed'];
  }
  if (path.startsWith('/service/')) {
    return ['Open', 'Assigned', 'In Progress', 'On Hold', 'Resolved', 'Completed'];
  }
  if (path.startsWith('/transport/')) {
    return ['Booked', 'In Transit', 'At Weighbridge', 'Delivered', 'Completed'];
  }
  if (path.startsWith('/production/')) {
    return ['Planned', 'In Progress', 'QC Pending', 'On Hold', 'Completed'];
  }
  if (path.startsWith('/admin/')) {
    return ['Draft', 'Active', 'Inactive', 'Archived', 'Completed'];
  }
  return ['Draft', 'Pending', 'In Progress', 'Awaiting', 'Completed'];
}

export function buildFormConfig(p: ModuleProfile, moduleName: string, path: string): ModuleFormConfig {
  if (p.form) return p.form;

  const headers = p.tableHeaders;
  const h = (i: number, fallback: string) => headers[i] ?? fallback;
  const categoryIsSelect = p.seedCategories.length > 1;
  const useTextarea = path.startsWith('/inventory/') || path.startsWith('/purchase/') ||
    path.startsWith('/service/') || path.startsWith('/engineering/') || path.startsWith('/mis/');

  const statusOptions = statusOptionsForProfile(p, path);

  return {
    refPrefix: refPrefixForPath(path),
    defaultCategory: p.seedCategories[0] ?? 'General',
    defaultStatus: statusOptions.includes('Pending') ? 'Pending' : statusOptions[0],
    statusOptions,
    searchPlaceholder: `Search ${moduleName.toLowerCase()}...`,
    addDescription: `Enter ${moduleName.toLowerCase()} details below. All fields map to the register columns.`,
    editDescription: `Update this ${moduleName.toLowerCase()} record.`,
    viewDescription: `Full ${moduleName.toLowerCase()} record details.`,
    fields: [
      {
        key: 'ref',
        label: h(0, 'Reference'),
        type: 'text',
        placeholder: `${refPrefixForPath(path)}XXXX`,
      },
      {
        key: 'date',
        label: h(1, 'Date'),
        type: 'date',
      },
      {
        key: 'category',
        label: h(2, 'Category'),
        type: categoryIsSelect ? 'select' : 'text',
        options: categoryIsSelect ? p.seedCategories : undefined,
        placeholder: categoryIsSelect ? undefined : `e.g. ${p.seedCategories[0]}`,
      },
      {
        key: 'desc',
        label: h(3, 'Description'),
        type: useTextarea ? 'textarea' : 'text',
        placeholder: path.startsWith('/inventory/')
          ? 'e.g. MS Plate 10mm — 500 Kg, Batch B-2606'
          : path.startsWith('/purchase/')
            ? 'e.g. Vendor: Laxmi Steels — ₹4,50,000'
            : `Details for this ${moduleName.toLowerCase()} entry`,
      },
      {
        key: 'status',
        label: h(4, 'Status'),
        type: 'select',
        options: statusOptions,
      },
    ],
  };
}

/** Exact path overrides */
const PATH_PROFILES: Record<string, ModuleProfile> = {
  '/graphical/business': profile({
    metricLabels: {
      all: 'Total Business Data Points',
      active: 'Active Chart Series',
      completed: 'Points Added Today',
      growth: 'Revenue Growth Rate',
    },
    metricIcons: [LineChart, BarChart3, TrendingUp, TrendingUp],
    tableHeaders: ['Period', 'Date', 'Business Segment', 'Metric Value (₹ Lakhs)', 'Status'],
    logTitle: 'Business Graph Data',
    seedCategories: ['Domestic Sales', 'Export Sales', 'Rental Income', 'Service AMC', 'Spares'],
    seedDescriptions: [
      'Q2 transformer plant installations — Western region',
      'Vacuum pump systems export to Middle East',
      'Atlas Filtration monthly rental billing cycle',
      'On-site oil filtration service revenue',
      'Spare parts & consumables dispatch',
    ],
  }),
  '/graphical/enquiry': profile({
    metricLabels: {
      all: 'Total Enquiry Trends',
      active: 'Open Enquiry Pipeline',
      completed: 'Enquiries Logged Today',
      growth: 'Enquiry Conversion %',
    },
    metricIcons: [LineChart, Users, CheckCircle, TrendingUp],
    tableHeaders: ['Reference', 'Date', 'Source', 'Enquiry Type', 'Status'],
    logTitle: 'Enquiry Graph Series',
    seedCategories: ['IndiaMart', 'Direct Call', 'Tender', 'Referral', 'Website'],
  }),
  '/graphical/sales-order': profile({
    metricLabels: {
      all: 'Total Order Data Points',
      active: 'Orders In Pipeline',
      completed: 'Orders Booked Today',
      growth: 'Order Booking Growth',
    },
    metricIcons: [BarChart3, ClipboardList, CheckCircle, TrendingUp],
    tableHeaders: ['SO Ref', 'Date', 'Customer Segment', 'Order Value', 'Status'],
    logTitle: 'Sales Order Graph',
  }),
  '/graphical/sales': profile({
    metricLabels: {
      all: 'Total Sales Data Points',
      active: 'Pending Invoicing',
      completed: 'Invoiced Today',
      growth: 'Sales Growth %',
    },
    metricIcons: [Wallet, Clock, CheckCircle, TrendingUp],
    tableHeaders: ['Invoice Ref', 'Date', 'Product Line', 'Amount (₹)', 'Status'],
    logTitle: 'Sales Graph Register',
  }),
  '/graphical/purchase': profile({
    metricLabels: {
      all: 'Total Purchase Data Points',
      active: 'Open PO Value',
      completed: 'GRN Received Today',
      growth: 'Procurement Savings %',
    },
    metricIcons: [Package, Clock, CheckCircle, TrendingUp],
    tableHeaders: ['PO Ref', 'Date', 'Vendor Category', 'Amount (₹)', 'Status'],
    logTitle: 'Purchase Graph Data',
  }),
  '/graphical/stock': profile({
    metricLabels: {
      all: 'Total Stock Data Points',
      active: 'Below Reorder Level',
      completed: 'Stock Updated Today',
      growth: 'Inventory Turnover %',
    },
    metricIcons: [Layers, Clock, CheckCircle, TrendingUp],
    tableHeaders: ['Part No.', 'Date', 'Warehouse', 'Stock Qty', 'Status'],
    logTitle: 'Stock Graph Series',
  }),
  '/graphical/receivables-payments': profile({
    metricLabels: {
      all: 'Total Cash Flow Points',
      active: 'Outstanding Receivables',
      completed: 'Payments Received Today',
      growth: 'Collection Efficiency %',
    },
    metricIcons: [Wallet, Clock, CheckCircle, TrendingUp],
    tableHeaders: ['Voucher Ref', 'Date', 'Party Name', 'Amount (₹)', 'Status'],
    logTitle: 'Receivables vs Payments',
  }),
  '/admin/billing-templates': profile({
    metricLabels: {
      all: 'Total Billing Templates',
      active: 'Active Templates',
      completed: 'Updated Today',
      growth: 'Template Usage %',
    },
    metricIcons: [FileText, Settings, CheckCircle, TrendingUp],
    tableHeaders: ['Template ID', 'Date', 'Document Type', 'Description', 'Status'],
    logTitle: 'Billing Template Registry',
    seedCategories: ['Proforma Invoice', 'Tax Invoice', 'Delivery Challan', 'Quotation', 'PO Format'],
    seedDescriptions: [
      'Standard PI format with 30% advance terms',
      'GST TI with IRN QR code block',
      'ODC dispatch challan with e-Way fields',
      'Technical quotation with annexure pages',
      'Purchase order — pumps & heaters',
    ],
    form: {
      refPrefix: 'TPL-',
      defaultCategory: 'Proforma Invoice',
      defaultStatus: 'Draft',
      statusOptions: ['Draft', 'Active', 'Inactive', 'Archived', 'Completed'],
      searchPlaceholder: 'Search billing templates...',
      addDescription: 'Define a new billing document template (PI, TI, challan, etc.).',
      editDescription: 'Update billing template layout and fields.',
      viewDescription: 'Billing template configuration details.',
      fields: [
        { key: 'ref', label: 'Template ID', type: 'text', placeholder: 'TPL-PI-001' },
        { key: 'date', label: 'Last Revised', type: 'date' },
        {
          key: 'category',
          label: 'Document Type',
          type: 'select',
          options: ['Proforma Invoice', 'Tax Invoice', 'Delivery Challan', 'Quotation', 'Purchase Order', 'Credit Note'],
        },
        {
          key: 'desc',
          label: 'Template Description',
          type: 'textarea',
          placeholder: 'e.g. Standard PI with advance %, GST breakup, and bank details footer',
        },
        {
          key: 'status',
          label: 'Template Status',
          type: 'select',
          options: ['Draft', 'Active', 'Inactive', 'Archived', 'Completed'],
        },
      ],
    },
  }),
  '/admin/default-templates': profile({
    metricLabels: {
      all: 'Total Default Templates',
      active: 'System Defaults Active',
      completed: 'Synced Today',
      growth: 'Default Coverage %',
    },
    metricIcons: [FileText, Settings, CheckCircle, TrendingUp],
    tableHeaders: ['Template Code', 'Date', 'Module', 'Description', 'Status'],
    logTitle: 'Default Template Library',
  }),
  '/admin/company': profile({
    metricLabels: {
      all: 'Total Company Profiles',
      active: 'Pending Updates',
      completed: 'Verified Today',
      growth: 'Profile Completeness %',
    },
    metricIcons: [Building2, Clock, ShieldCheck, TrendingUp],
    tableHeaders: ['Field Group', 'Date', 'Category', 'Value / Setting', 'Status'],
    logTitle: 'Company Profile Settings',
  }),
  '/service/service-call': profile({
    metricLabels: {
      all: 'Total Service Calls',
      active: 'Open Complaints',
      completed: 'Resolved Today',
      growth: 'SLA Compliance %',
    },
    metricIcons: [Wrench, Clock, CheckCircle, TrendingUp],
    tableHeaders: ['Call No.', 'Date', 'Complaint Type', 'Customer / Site', 'Status'],
    logTitle: 'Service Call Register',
    seedCategories: ['Breakdown', 'AMC Visit', 'Oil Leak', 'Vacuum Issue', 'Electrical'],
  }),
  '/inventory/summary': profile({
    metricLabels: {
      all: 'Total Stock SKUs',
      active: 'Below Reorder Level',
      completed: 'Updated Today',
      growth: 'Stock Accuracy %',
    },
    metricIcons: [Layers, Package, CheckCircle, TrendingUp],
    tableHeaders: ['Part No.', 'Date', 'Category', 'Stock Qty', 'Status'],
    logTitle: 'Stock Summary Register',
  }),
  '/inventory/register': profile({
    metricLabels: {
      all: 'Total Stock Transactions',
      active: 'Pending / In Transit',
      completed: 'Posted Today',
      growth: 'Register Accuracy %',
    },
    metricIcons: [Layers, Package, CheckCircle, TrendingUp],
    tableHeaders: ['Txn No.', 'Date', 'Warehouse', 'Item & Quantity', 'Status'],
    logTitle: 'Stock Register',
    seedCategories: ['WH-1 Main Factory', 'WH-2 Subcon Yard', 'FG Store', 'Raw Material Yard', 'Scrap Yard'],
    seedDescriptions: [
      'MS Plate 10mm received — 500 Kg, Batch B-2606',
      'Vacuum pump assembly issued to WO-26-101',
      'SS 304 fittings transfer to subcon yard',
      'Finished 6000 LPH plant moved to FG store',
      'Consumables issue — welding rods & flux',
    ],
    activeStatuses: ['Received', 'Issued', 'In Transit', 'QC Pending', 'Adjusted'],
    form: {
      refPrefix: 'STK-REG-',
      defaultCategory: 'WH-1 Main Factory',
      defaultStatus: 'Received',
      statusOptions: ['Received', 'Issued', 'In Transit', 'Transfer', 'Adjusted', 'Completed'],
      searchPlaceholder: 'Search stock transactions...',
      addDescription: 'Record a stock receipt, issue, transfer, or adjustment in the register.',
      editDescription: 'Update this stock register transaction.',
      viewDescription: 'Stock register transaction details.',
      fields: [
        { key: 'ref', label: 'Stock Txn No.', type: 'text', placeholder: 'STK-REG-XXXX' },
        { key: 'date', label: 'Transaction Date', type: 'date' },
        {
          key: 'category',
          label: 'Warehouse / Godown',
          type: 'select',
          options: ['WH-1 Main Factory', 'WH-2 Subcon Yard', 'FG Store', 'Raw Material Yard', 'Scrap Yard'],
        },
        {
          key: 'desc',
          label: 'Item / Part & Quantity',
          type: 'textarea',
          placeholder: 'e.g. MS Plate 10mm — 500 Kg · Part: PLT-10MM · Batch: B-2606',
        },
        {
          key: 'status',
          label: 'Movement Type',
          type: 'select',
          options: ['Received', 'Issued', 'In Transit', 'Transfer', 'Adjusted', 'Completed'],
        },
      ],
    },
  }),
  '/mis/sales-pipeline': profile({
    metricLabels: {
      all: 'Total Pipeline Stages',
      active: 'Deals In Progress',
      completed: 'Converted Today',
      growth: 'Pipeline Win Rate %',
    },
    metricIcons: [BarChart3, Clock, CheckCircle, TrendingUp],
    tableHeaders: ['Deal Ref', 'Date', 'Stage', 'Expected Value (₹)', 'Status'],
    logTitle: 'Sales Pipeline (Enq→Inv)',
    seedCategories: ['Enquiry', 'Quotation', 'Order', 'PI Issued', 'Dispatched'],
  }),
  '/statutory/gst-return': profile({
    metricLabels: {
      all: 'Total GST Returns',
      active: 'Pending Filing',
      completed: 'Filed This Month',
      growth: 'Compliance Rate %',
    },
    metricIcons: [FileText, Clock, ShieldCheck, TrendingUp],
    tableHeaders: ['Return Type', 'Date', 'Tax Period', 'Tax Liability (₹)', 'Status'],
    logTitle: 'GST Return Register',
    seedCategories: ['GSTR-1', 'GSTR-3B', 'GSTR-2B', 'ITC-04', 'Annual Return'],
  }),
};

type PrefixRule = { prefix: string; build: (name: string) => ModuleProfile };

const PREFIX_RULES: PrefixRule[] = [
  {
    prefix: '/graphical/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Points`,
        active: 'Active Data Series',
        completed: 'Updated Today',
        growth: 'Trend Growth %',
      },
      metricIcons: [LineChart, BarChart3, CheckCircle, TrendingUp],
      tableHeaders: ['Period', 'Date', 'Segment', 'Value', 'Status'],
      logTitle: `${name} Data`,
    }),
  },
  {
    prefix: '/inventory/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Records`,
        active: 'Pending / In Transit',
        completed: 'Processed Today',
        growth: 'Inventory Accuracy %',
      },
      metricIcons: [Layers, Package, CheckCircle, TrendingUp],
      tableHeaders: ['Reference', 'Date', 'Item / Batch', 'Quantity', 'Status'],
      logTitle: 'Inventory Transaction Log',
      seedCategories: ['Raw Material', 'WIP', 'Finished Goods', 'Consumables', 'Spares'],
    }),
  },
  {
    prefix: '/purchase/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Entries`,
        active: 'Pending GRN / Approval',
        completed: 'Received Today',
        growth: 'PO Fulfillment %',
      },
      metricIcons: [Package, Clock, CheckCircle, TrendingUp],
      tableHeaders: ['PO / GRN Ref', 'Date', 'Vendor', 'Amount (₹)', 'Status'],
      logTitle: 'Purchase Register',
      seedCategories: ['Pumps', 'Heaters', 'Steel Plates', 'Electrical', 'Pipes'],
    }),
  },
  {
    prefix: '/sales/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Records`,
        active: 'Pending Action',
        completed: 'Closed Today',
        growth: 'Conversion Rate %',
      },
      metricIcons: [ClipboardList, Clock, CheckCircle, TrendingUp],
      tableHeaders: ['Reference', 'Date', 'Customer', 'Value (₹)', 'Status'],
      logTitle: 'Sales Register',
    }),
  },
  {
    prefix: '/mis/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Rows`,
        active: 'Pending Review',
        completed: 'Generated Today',
        growth: 'Report Coverage %',
      },
      metricIcons: [BarChart3, Clock, FileText, TrendingUp],
      tableHeaders: ['Report Ref', 'Date', 'Category', 'Summary', 'Status'],
      logTitle: 'MIS Report Log',
    }),
  },
  {
    prefix: '/admin/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name}`,
        active: 'Pending Setup',
        completed: 'Updated Today',
        growth: 'Configuration %',
      },
      metricIcons: [Settings, Clock, CheckCircle, TrendingUp],
      tableHeaders: ['Config ID', 'Date', 'Category', 'Setting / Value', 'Status'],
      logTitle: 'Admin Configuration Log',
    }),
  },
  {
    prefix: '/service/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Records`,
        active: 'Open Service Calls',
        completed: 'Resolved Today',
        growth: 'SLA Compliance %',
      },
      metricIcons: [Wrench, Clock, CheckCircle, TrendingUp],
      tableHeaders: ['Ticket No.', 'Date', 'Service Type', 'Customer Site', 'Status'],
      logTitle: 'Service Register',
      seedCategories: ['AMC', 'Breakdown', 'Commissioning', 'Oil Filtration', 'Warranty'],
    }),
  },
  {
    prefix: '/statutory/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Filings`,
        active: 'Pending Submission',
        completed: 'Filed Today',
        growth: 'Compliance Rate %',
      },
      metricIcons: [ShieldCheck, Clock, CheckCircle, TrendingUp],
      tableHeaders: ['Filing Ref', 'Date', 'Return Type', 'Tax Period', 'Status'],
      logTitle: 'Statutory Filing Log',
    }),
  },
  {
    prefix: '/fixed-assets/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Assets`,
        active: 'Under Maintenance',
        completed: 'Registered Today',
        growth: 'Asset Utilization %',
      },
      metricIcons: [Building2, Wrench, CheckCircle, TrendingUp],
      tableHeaders: ['Asset ID', 'Date', 'Location', 'Asset Description', 'Status'],
      logTitle: 'Fixed Asset Register',
    }),
  },
  {
    prefix: '/engineering/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Entries`,
        active: 'Pending Revision',
        completed: 'Updated Today',
        growth: 'BOM Accuracy %',
      },
      metricIcons: [Settings, Clock, CheckCircle, TrendingUp],
      tableHeaders: ['Drawing / BOM Ref', 'Date', 'Product', 'Revision Note', 'Status'],
      logTitle: 'Engineering Change Log',
    }),
  },
  {
    prefix: '/master/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Records`,
        active: 'Pending Validation',
        completed: 'Added Today',
        growth: 'Master Coverage %',
      },
      metricIcons: [Database, Clock, CheckCircle, TrendingUp],
      tableHeaders: ['Master Code', 'Date', 'Category', 'Description', 'Status'],
      logTitle: 'Master Data Log',
    }),
  },
  {
    prefix: '/accounts/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Entries`,
        active: 'Outstanding Items',
        completed: 'Posted Today',
        growth: 'Reconciliation %',
      },
      metricIcons: [Wallet, Clock, CheckCircle, TrendingUp],
      tableHeaders: ['Voucher Ref', 'Date', 'Ledger', 'Amount (₹)', 'Status'],
      logTitle: 'Accounts Register',
    }),
  },
  {
    prefix: '/transport/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Records`,
        active: 'In Transit / Pending',
        completed: 'Cleared Today',
        growth: 'On-Time Delivery %',
      },
      metricIcons: [Truck, Clock, CheckCircle, TrendingUp],
      tableHeaders: ['LR / Bill No.', 'Date', 'Transporter', 'Freight (₹)', 'Status'],
      logTitle: 'Transport Register',
    }),
  },
  {
    prefix: '/production/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Jobs`,
        active: 'In Production',
        completed: 'Completed Today',
        growth: 'Production Efficiency %',
      },
      metricIcons: [Wrench, Clock, CheckCircle, TrendingUp],
      tableHeaders: ['WO Ref', 'Date', 'Machine Model', 'Stage', 'Status'],
      logTitle: 'Production Log',
      seedCategories: ['Fabrication', 'Assembly', 'Testing', 'Painting', 'Dispatch Prep'],
    }),
  },
  {
    prefix: '/reports/',
    build: name => profile({
      metricLabels: {
        all: `Total ${name} Entries`,
        active: 'Pending Sign-off',
        completed: 'Published Today',
        growth: 'Report Coverage %',
      },
      metricIcons: [FileText, ClipboardList, CheckCircle, TrendingUp],
      tableHeaders: ['Report Ref', 'Date', 'Category', 'Summary', 'Status'],
      logTitle: 'Report Register',
    }),
  },
];

function fallbackProfile(name: string): ModuleProfile {
  const short = name.replace(/\s*\(.*\)/, '').trim();
  return profile({
    metricLabels: {
      all: `Total ${short}`,
      active: `Open ${short}`,
      completed: `Processed Today`,
      growth: `Completion Rate %`,
    },
    tableHeaders: ['Reference', 'Date', 'Category', 'Description', 'Status'],
    logTitle: `${short} Register`,
    seedDescriptions: [
      `Sample entry for ${short}`,
      'Awaiting commercial review and verification',
      'Material logs synchronized from system',
      'Awaiting manager approval',
      'Historical data migration complete',
    ],
  });
}

export function getModuleProfile(modulePath: string, moduleName: string): ModuleProfile {
  const path = modulePath.startsWith('/') ? modulePath : `/${modulePath}`;
  const blueprint = getModuleBlueprint(path);

  let result: ModuleProfile;
  if (PATH_PROFILES[path]) {
    result = PATH_PROFILES[path];
  } else {
    const prefixRule = PREFIX_RULES.find(rule => path.startsWith(rule.prefix));
    result = prefixRule ? prefixRule.build(moduleName) : fallbackProfile(moduleName);
  }

  if (blueprint) {
    result = {
      ...result,
      tableHeaders: blueprintToTableHeaders(blueprint),
      logTitle: `${moduleName} Register`,
    };
  }

  const form = buildFormConfig(result, moduleName, path);
  return { ...result, form, blueprint };
}

export function generateRef(form: ModuleFormConfig): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${form.refPrefix}${num}`;
}

export function buildSeedRows(
  profile: ModuleProfile,
  moduleName: string,
  today: string,
  modulePath = ''
): Array<{ id: string; ref: string; date: string; category: string; desc: string; status: string }> {
  const form = profile.form ?? buildFormConfig(profile, moduleName, modulePath);
  const statuses = [
    profile.completedStatus,
    form.statusOptions[1] ?? 'Pending',
    form.statusOptions[2] ?? 'In Progress',
    form.statusOptions[0] ?? 'Draft',
    profile.completedStatus,
  ];
  return [1, 2, 3, 4, 5].map((n, i) => ({
    id: String(n),
    ref: `${form.refPrefix}${9000 + n}`,
    date: i < 2 ? today : `2026-06-${28 - i}`,
    category: profile.seedCategories[i % profile.seedCategories.length],
    desc: profile.seedDescriptions[i % profile.seedDescriptions.length] ?? `Entry for ${moduleName}`,
    status: statuses[i % statuses.length],
  }));
}
