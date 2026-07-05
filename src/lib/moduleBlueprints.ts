/** Sumesh Petroleum Pvt. Ltd. (Vadodara) — per-screen field, grid & button blueprints */

export type BlueprintFieldType =
  | 'text'
  | 'date'
  | 'datetime'
  | 'textarea'
  | 'select'
  | 'number'
  | 'currency'
  | 'checkbox'
  | 'readonly';

export type BlueprintField = {
  key: string;
  label: string;
  type: BlueprintFieldType;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  readOnly?: boolean;
};

export type BlueprintButton = {
  label: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary';
};

export type ModuleBlueprint = {
  detailFields: BlueprintField[];
  buttons: BlueprintButton[];
  gridColumns?: string[];
  gridTitle?: string;
};

function f(
  key: string,
  label: string,
  type: BlueprintFieldType,
  extra?: Partial<Omit<BlueprintField, 'key' | 'label' | 'type'>>
): BlueprintField {
  return { key, label, type, ...extra };
}

function btn(label: string, variant?: BlueprintButton['variant']): BlueprintButton {
  return { label, variant };
}

const MECH_ELEC_STRUCT_CAL = ['Mechanical', 'Electrical', 'Structural', 'Calibration'];
const SEVERITY = ['Critical', 'High', 'Medium', 'Low'];
const PRIORITY = ['Low', 'Medium', 'High'];
const CONTRACT_TYPES = ['Comprehensive AMC', 'Non-Comprehensive AMC', 'Warranty'];
const SERVICE_FREQ = ['Quarterly', 'Half-Yearly', 'Annual'];
const TICKET_STATUS = ['Open', 'In-Progress', 'Resolved', 'Closed'];
const RESPONSE_TYPES = ['Rating 1-5', 'Yes-No', 'Text'];
const MODULE_ORIGIN = ['Service', 'Sales', 'Commissioning'];
const REPORT_FILTERS = ['Pending Tickets', 'AMC Expiry List', 'Customer Satisfaction Index'];
const DEPT_SHOPS = ['Fabrication Shop', 'Electrical Assembly', 'Maintenance', 'Fabrication Bay'];
const TXN_TYPES = ['Receipt', 'Issue', 'Adjustment', 'Return', 'Scrap Declaration', 'Write-off'];
const CHALLAN_TYPES = ['Returnable', 'Non-Returnable'];
const DEPRECIATION = ['Straight Line', 'WDV', 'Units of Production'];
const INV_REPORTS = ['Stock Ledger', 'Fast Moving Items', 'Aging Analysis', 'Reorder Level Summary'];

/** Path → blueprint (routes from erpModules.ts) */
export const MODULE_BLUEPRINTS: Record<string, ModuleBlueprint> = {
  // ─── 1. SERVICE MODULE ───────────────────────────────────────────────
  '/service/service-call': {
    detailFields: [
      f('ticketNo', 'Ticket No (Auto)', 'readonly'),
      f('dateTime', 'Date & Time', 'datetime'),
      f('site', 'Customer Site Location', 'select', { options: ['Makarpura GIDC', 'Halol Plant', 'Ankleshwar Refinery', 'Dahej SEZ'] }),
      f('serialNo', 'Equipment Serial No', 'select', { options: ['SP/26/1012', 'SP/24/0905', 'SP/21/0401'] }),
      f('amcContract', 'Linked AMC Contract No.', 'readonly'),
      f('complaintType', 'Complaint Type', 'select', { options: ['Vacuum Leakage', 'Heater Coil Burnout', 'Pump Cavitation', 'Oil Leak'] }),
      f('description', 'Problem Description', 'textarea'),
      f('engineer', 'Assigned Engineer', 'select', { options: ['Ramesh Patel', 'Suresh Mehta', 'Amit Shah'] }),
      f('status', 'Current Status', 'select', { options: TICKET_STATUS }),
    ],
    gridColumns: ['Item Code', 'Qty Required'],
    gridTitle: 'Spare Parts for Site Deployment',
    buttons: [btn('Log Complaint'), btn('Assign Technician'), btn('Send Customer SMS', 'outline'), btn('Close Ticket')],
  },
  '/service/feedback-answers': {
    detailFields: [
      f('answerId', 'Answer ID', 'text'),
      f('questionId', 'Linked Question ID', 'text'),
      f('response', 'Customer Score / Response', 'text'),
      f('technicianId', 'Technician ID Reference', 'text'),
      f('mgmtReview', 'Flag for Management Review (< 3 stars)', 'checkbox'),
      f('remarks', 'Remarks', 'textarea'),
    ],
    buttons: [btn('Save Response'), btn('Clear', 'outline')],
  },
  '/service/feedback-template': {
    detailFields: [
      f('templateId', 'Template ID / Code', 'text'),
      f('templateName', 'Template Name', 'text', { placeholder: 'e.g. Post-Filtration Plant Commissioning Feedback' }),
      f('isActive', 'Is Active', 'checkbox', { defaultValue: 'true' }),
    ],
    gridColumns: ['Question ID', 'Question Text', 'Order', 'Selected'],
    gridTitle: 'Selected Questions (checklist & order)',
    buttons: [btn('Create Template'), btn('Preview Template', 'outline'), btn('Assign to Service Type')],
  },
  '/service/reports': {
    detailFields: [
      f('reportType', 'Report Type', 'select', { options: REPORT_FILTERS }),
      f('dateFrom', 'Date Range — From', 'date'),
      f('dateTo', 'Date Range — To', 'date'),
      f('technician', 'Technician Name', 'select', { options: ['All', 'Ramesh Patel', 'Suresh Mehta', 'Amit Shah'] }),
      f('customer', 'Customer Name', 'select', { options: ['All', 'Tata Power', 'Reliance Ind.', 'Adani Electricity'] }),
      f('plantModel', 'Plant Model', 'text', { placeholder: 'e.g. 6000 LPH Vacuum Dehydration Plant' }),
    ],
    buttons: [btn('Excel Export'), btn('PDF View', 'outline'), btn('Email Report', 'outline')],
  },

  // ─── 2. INVENTORY MODULE ─────────────────────────────────────────────
  '/purchase/grn': {
    detailFields: [
      f('grnNo', 'GRN No', 'text'),
      f('grnDate', 'GRN Date', 'date'),
      f('poNumber', 'PO Number', 'select', { options: ['PO-26-050', 'PO-26-048', 'PO-26-052'] }),
      f('supplier', 'Supplier Name', 'text'),
      f('challanNo', 'Challan / Invoice No', 'text'),
      f('challanDate', 'Challan Date', 'date'),
      f('girRef', 'GIR No Reference', 'text'),
      f('gateEntry', 'Gate Entry Receipt Number', 'select', { options: ['GIR-26-101', 'GIR-26-102'] }),
    ],
    gridColumns: ['Item Code', 'PO Qty', 'Received Qty', 'Accepted Qty', 'Rejected Qty', 'Heat/Batch No'],
    gridTitle: 'GRN Line Items',
    buttons: [btn('Save Draft', 'outline'), btn('Post GRN'), btn('Upload Mill Test Certificate', 'outline'), btn('Cancel', 'destructive')],
  },
  '/inventory/material-issue': {
    detailFields: [
      f('issueSlipNo', 'Issue Slip No', 'text'),
      f('issueDate', 'Issue Date', 'date'),
      f('department', 'Department / Shop Floor', 'select', { options: DEPT_SHOPS }),
      f('issuedTo', 'Issued To (Employee)', 'select', { options: ['Ramesh Patel', 'Suresh Mehta', 'Welding Bay Team'] }),
    ],
    gridColumns: ['Item Code', 'Available Stock', 'Qty Demanded', 'Qty Issued', 'UOM', 'Purpose Code'],
    gridTitle: 'Material Issue Lines',
    buttons: [btn('Process Issue'), btn('Print Slip', 'outline'), btn('Verify Stock Availability', 'secondary')],
  },
  '/inventory/gir': {
    detailFields: [
      f('girNo', 'GIR No', 'text'),
      f('arrivalDateTime', 'Arrival Date & Time', 'datetime'),
      f('supplier', 'Supplier Name', 'text'),
      f('transporter', 'Transporter Name', 'text'),
      f('vehicleNo', 'Vehicle Number', 'text'),
      f('driverName', 'Driver Name & Mobile', 'text'),
      f('challanLr', 'Challan / LR Number', 'text'),
      f('grossWeight', 'Gross Weight (Kg)', 'number'),
      f('netWeight', 'Net Weight (Kg)', 'number'),
      f('packageCount', 'Package Count', 'number'),
    ],
    buttons: [btn('Generate Gate Pass'), btn('Allow Vehicle Entry'), btn('Print Inward Slip', 'outline')],
  },
  '/inventory/opening-stock': {
    detailFields: [
      f('financialYear', 'Financial Year', 'readonly', { defaultValue: '2026-27' }),
      f('itemCategory', 'Item Category Filter', 'select', { options: ['All', 'Raw Material', 'Consumables', 'Spares', 'Finished Goods'] }),
      f('asOfDate', 'As of Date', 'date'),
    ],
    gridColumns: ['Item Code', 'Item Description', 'Warehouse/Godown', 'UOM', 'Opening Qty', 'Unit Cost (₹)', 'Total Value (₹)'],
    gridTitle: 'Opening Stock Ledger',
    buttons: [btn('Update Stock Ledger'), btn('Import Excel File', 'outline'), btn('Freeze Opening Stock'), btn('Clear All', 'destructive')],
  },
  '/inventory/transaction': {
    detailFields: [
      f('txnId', 'Transaction ID', 'text'),
      f('txnRef', 'Transaction Reference No.', 'text'),
      f('txnType', 'Transaction Type', 'select', { options: TXN_TYPES }),
      f('authorizedBy', 'Authorized By', 'select', { options: ['R.M. Patel', 'Suketu Shah', 'Administrator'] }),
      f('sourceLoc', 'Source Location', 'text'),
      f('destLoc', 'Destination Location', 'text'),
      f('refDoc', 'Reference Document No.', 'text'),
    ],
    gridColumns: ['Item Code', 'Before Qty', 'Adjustment (+/-)', 'After Qty', 'Reason Code'],
    gridTitle: 'Adjustment Lines',
    buttons: [btn('Commit Ledger Entry'), btn('View Details', 'outline'), btn('Export Audit Log', 'outline')],
  },
  '/inventory/stock-transfer-stores': {
    detailFields: [
      f('transferNo', 'Transfer No', 'text'),
      f('transferDate', 'Date', 'date'),
      f('sourceStore', 'Source Store', 'select', { options: ['Main Consumable Store', 'Main Steel Yard', 'Electrical Component Rack'] }),
      f('destStore', 'Destination Store', 'select', { options: ['CNC Cutting Floor Store', 'Fabrication Bay Store', 'Assembly Store'] }),
    ],
    gridColumns: ['Item Code', 'Current Qty', 'Transfer Qty'],
    gridTitle: 'Transfer Items',
    buttons: [btn('Initiate Transfer'), btn('Approve & Receive')],
  },
  '/inventory/stock-transfer-godowns': {
    detailFields: [
      f('transferId', 'Transfer ID', 'text'),
      f('transferDate', 'Date', 'date'),
      f('fromGodown', 'From Godown', 'select', { options: ['Makarpura Factory Yard', 'Makarpura Main Warehouse', 'Offsite Storage Silo Yard'] }),
      f('toGodown', 'To Godown', 'select', { options: ['Finished Goods Storage', 'Raw Material Yard', 'FG Store'] }),
      f('vehicleDetails', 'Transporter / Vehicle Details', 'text'),
    ],
    gridColumns: ['Item Code', 'Batch/Heat No', 'Quantity'],
    gridTitle: 'Inter-Godown Items',
    buttons: [btn('Dispatch From Godown'), btn('Acknowledge Delivery')],
  },
  '/inventory/finish-stock': {
    detailFields: [
      f('productCode', 'Finished Product Code', 'text'),
      f('plantModel', 'Plant Model / Type', 'text', { placeholder: 'e.g. 3000 LPH Filtration Machine' }),
      f('serialNo', 'Serial Number', 'text'),
      f('location', 'Current Location', 'select', { options: ['Testing Bay', 'FG Storage', 'Dispatch Prep'] }),
      f('qaStatus', 'Testing Clearance Status', 'select', { options: ['Passed', 'Pending QA', 'Failed'] }),
    ],
    buttons: [btn('View QA Certificate', 'outline'), btn('Mark Ready for Despatch')],
  },
  '/inventory/issue-project': {
    detailFields: [
      f('workOrderNo', 'Project / Work Order No', 'text'),
      f('clientName', 'Client Name', 'text'),
      f('authorizedBy', 'Authorized By', 'select', { options: ['R.M. Patel', 'Ramesh Patel'] }),
    ],
    gridColumns: ['Raw Material Code', 'BOM Required Qty', 'Already Issued', 'Now Issuing Qty'],
    gridTitle: 'BOM Issue Lines',
    buttons: [btn('Issue to Project'), btn('Check BOM Compliance', 'outline')],
  },
  '/inventory/returnable-challan': {
    detailFields: [
      f('challanNo', 'Challan No', 'text'),
      f('challanType', 'Challan Type', 'select', { options: CHALLAN_TYPES }),
      f('receiver', 'Receiver Name / Vendor', 'text'),
      f('purpose', 'Purpose', 'textarea', { placeholder: 'e.g. Outer body powder coating / Demonstration' }),
      f('expectedReturn', 'Expected Return Date', 'date'),
    ],
    gridColumns: ['Item Name', 'Qty', 'Value (₹)'],
    gridTitle: 'Challan Items',
    buttons: [btn('Generate Delivery Challan'), btn('Print Challan', 'outline')],
  },
  '/inventory/returnable-receipt': {
    detailFields: [
      f('receiptNo', 'Receipt No', 'text'),
      f('originalChallan', 'Original Returnable Challan Ref', 'text'),
      f('vendor', 'Vendor Name', 'text'),
      f('condition', 'Condition Assessment', 'select', { options: ['Accepted', 'Damaged', 'Rework Required'] }),
    ],
    gridColumns: ['Item', 'Sent Qty', 'Returned Qty Now', 'Pending Qty'],
    gridTitle: 'Return Lines',
    buttons: [btn('Log Return Receipt'), btn('Close Challan Balance')],
  },
  '/inventory/grn-modifications': {
    detailFields: [
      f('originalGrn', 'Original GRN No', 'text'),
      f('reason', 'Reason for Modification', 'textarea', { placeholder: 'e.g. Typo in received weight / wrong heat no.' }),
      f('supervisorCode', 'Supervisor Authorization Code', 'text'),
    ],
    gridColumns: ['Item Code', 'Field Changed', 'Old Value', 'New Value'],
    gridTitle: 'Updated Item Values',
    buttons: [btn('Authorize & Update GRN'), btn('View History Log', 'outline')],
  },
  '/inventory/grn-serial': {
    detailFields: [
      f('linkedGrn', 'Linked GRN No', 'text'),
      f('itemCode', 'Item Code', 'text'),
      f('qtyReceived', 'Quantity Received', 'number'),
    ],
    gridColumns: ['S.No', 'Manufacturer Serial No', 'Barcode'],
    gridTitle: 'Serial Number Assignment',
    buttons: [btn('Save Serial Numbers'), btn('Generate Barcodes', 'outline')],
  },
  '/inventory/grn-view': {
    detailFields: [
      f('search', 'Search (Vendor / PO / GRN No)', 'text'),
      f('dateFrom', 'Date From', 'date'),
      f('dateTo', 'Date To', 'date'),
      f('status', 'Status Flag', 'select', { options: ['All', 'Draft', 'Posted', 'Cancelled'] }),
    ],
    buttons: [btn('Open Form', 'outline'), btn('Export Summary to Excel')],
  },
  '/inventory/issue-against-so': {
    detailFields: [
      f('soNumber', 'Sales Order Number', 'text'),
      f('customer', 'Customer Name', 'text'),
      f('specLink', 'Custom Equipment Specifications', 'text'),
    ],
    gridColumns: ['Component Code', 'Required Qty', 'Allocated Qty', 'Pick Qty'],
    gridTitle: 'SO Component Allocation',
    buttons: [btn('Allocate to SO'), btn('Print Picking List', 'outline')],
  },
  '/inventory/serial-tracking': {
    detailFields: [
      f('serialNo', 'Component Serial No', 'text'),
      f('currentStatus', 'Current Status', 'select', { options: ['In-Store', 'Issued', 'Sold to Customer'] }),
      f('parentMachine', 'Parent Machine Serial No', 'text'),
    ],
    buttons: [btn('Track Component Lifecycle'), btn('View Warranty History', 'outline')],
  },
  '/inventory/reports': {
    detailFields: [
      f('reportType', 'Report Selection', 'select', { options: INV_REPORTS }),
      f('dateFrom', 'Date From', 'date'),
      f('dateTo', 'Date To', 'date'),
    ],
    buttons: [btn('Generate PDF'), btn('Export to CSV', 'outline')],
  },

  // ─── 3. FIXED ASSETS MODULE ──────────────────────────────────────────
  '/fixed-assets/master': {
    detailFields: [
      f('assetCode', 'Asset Identification Code', 'text'),
      f('assetName', 'Asset Name', 'text', { placeholder: 'e.g. Plate Bending Machine #1' }),
      f('category', 'Asset Category', 'select', { options: ['Machinery', 'Vehicle', 'Office Equipment', 'Testing Equipment'] }),
      f('commissionDate', 'Date of Commissioning', 'date'),
      f('invoiceRef', 'Purchase Invoice Ref', 'text'),
      f('purchaseCost', 'Purchase Cost (₹)', 'currency'),
      f('depreciationMethod', 'Depreciation Method', 'select', { options: DEPRECIATION }),
      f('bookValue', 'Current Book Value (₹)', 'currency'),
    ],
    buttons: [btn('Register Asset'), btn('Dispose/Sell Asset', 'destructive'), btn('Calculate Depreciation', 'outline')],
  },
  '/fixed-assets/locations': {
    detailFields: [
      f('locationCode', 'Location Code', 'text'),
      f('description', 'Location Description', 'text', { placeholder: 'e.g. Makarpura GIDC Block A, Assembly Bay B' }),
      f('inCharge', 'In-Charge Person Name', 'text'),
    ],
    buttons: [btn('Add Location'), btn('Update Assignment', 'outline')],
  },
  '/fixed-assets/maintenance': {
    detailFields: [
      f('assetCode', 'Asset Code', 'text'),
      f('maintType', 'Maintenance Type', 'select', { options: ['Preventive', 'Breakdown', 'Calibration'] }),
      f('vendor', 'Service Vendor / Internal Engineer', 'text'),
      f('workDone', 'Work Done Description', 'textarea'),
      f('partsReplaced', 'Parts Replaced', 'text'),
      f('cost', 'Cost Incurred (₹)', 'currency'),
      f('nextSchedule', 'Next Maintenance Schedule Date', 'date'),
    ],
    buttons: [btn('Log Maintenance'), btn('Set Preventive Alert', 'outline')],
  },
  '/fixed-assets/insurance': {
    detailFields: [
      f('assetCovered', 'Asset / Machinery Covered', 'text'),
      f('policyNo', 'Insurance Policy Number', 'text'),
      f('provider', 'Insurance Provider Name', 'text'),
      f('premium', 'Policy Premium Amount (₹)', 'currency'),
      f('sumInsured', 'Sum Insured Value (₹)', 'currency'),
      f('startDate', 'Start Date', 'date'),
      f('expiryDate', 'Expiry Date', 'date'),
    ],
    buttons: [btn('Save Policy'), btn('Track Renewal Document', 'outline')],
  },
  '/fixed-assets/reports': {
    detailFields: [
      f('assetCategory', 'Asset Category', 'select', { options: ['All', 'Machinery', 'Vehicle', 'Office Equipment'] }),
      f('location', 'Location', 'text'),
      f('costCenter', 'Cost Center', 'text'),
      f('reportType', 'Report Variation', 'select', { options: ['Depreciation Schedule', 'Asset Register Report', 'Maintenance Cost Analysis'] }),
    ],
    buttons: [btn('View Report'), btn('Export Sheet', 'outline')],
  },

  // ─── 4. ADMINISTRATION & SETUP ───────────────────────────────────────
  '/admin/company': {
    detailFields: [
      f('legalName', 'Company Legal Name', 'text', { defaultValue: 'Sumesh Petroleum Private Limited' }),
      f('registeredAddress', 'Registered Address', 'textarea'),
      f('factoryAddress', 'Factory Unit Addresses', 'textarea', { placeholder: 'Makarpura GIDC, Vadodara' }),
      f('gstin', 'GSTIN Number', 'text'),
      f('pan', 'PAN Number', 'text'),
      f('financialYear', 'Financial Year Configuration', 'text', { defaultValue: '2026-27' }),
    ],
    buttons: [btn('Save Configuration'), btn('Edit Details', 'outline')],
  },
  '/admin/users': {
    detailFields: [
      f('userId', 'User Login ID', 'text'),
      f('fullName', 'User Full Name', 'text'),
      f('designation', 'Designation & Department', 'text'),
      f('mobile', 'Contact Mobile', 'text'),
      f('email', 'Email', 'text'),
      f('role', 'Security Role', 'select', { options: ['Administrator', 'Sales', 'Production', 'Inventory', 'Accounts'] }),
      f('active', 'Active Status', 'checkbox', { defaultValue: 'true' }),
    ],
    buttons: [btn('Create User'), btn('Reset Credentials', 'outline'), btn('Manage Permissions Grid', 'outline')],
  },
  '/admin/serial-numbers': {
    detailFields: [
      f('docType', 'Document Type Group', 'select', { options: ['GRN', 'Work Order', 'Invoice', 'Challan', 'Service Ticket'] }),
      f('prefix', 'Prefix Formula', 'text'),
      f('suffix', 'Suffix Formula', 'text'),
      f('padding', 'Counter Padding', 'number', { defaultValue: '4' }),
      f('resetFreq', 'Reset Frequency', 'select', { options: ['Yearly', 'Monthly', 'Never'] }),
    ],
    buttons: [btn('Lock Number Sequence', 'outline'), btn('Preview Generation')],
  },
  '/admin/billing-templates': {
    detailFields: [
      f('templateCode', 'Template Code', 'text'),
      f('layoutStyle', 'Template Layout Style', 'select', { options: ['Standard A4', 'Letterhead', 'Compact', 'Export Format'] }),
      f('taxHeaders', 'Tax Headers Configuration', 'textarea'),
      f('bankDetails', 'Bank Account Details Display', 'text'),
      f('terms', 'Standard Terms & Payment Conditions', 'textarea'),
    ],
    buttons: [btn('Save Template Layout'), btn('Preview Print Draft', 'outline')],
  },
  '/admin/default-templates': {
    detailFields: [
      f('defaultPO', 'Default Purchase Order Layout', 'select', { options: ['Standard PO', 'Import PO', 'Service PO'] }),
      f('defaultServiceReport', 'Default Service Report Structure', 'select', { options: ['AMC Visit Report', 'Breakdown Report', 'Commissioning Report'] }),
      f('defaultFont', 'System Default Font', 'select', { options: ['Arial', 'Calibri', 'Times New Roman'] }),
      f('emailFooter', 'Email Footer Layout', 'textarea'),
    ],
    buttons: [btn('Set System Defaults')],
  },
  '/admin/report-parameters': {
    detailFields: [
      f('headerLine1', 'Global Report Header Line 1', 'text', { defaultValue: 'Sumesh Petroleum Private Limited' }),
      f('headerLine2', 'Global Report Header Line 2', 'text', { defaultValue: 'Makarpura GIDC, Vadodara — Gujarat' }),
      f('pagination', 'Pagination Rules', 'select', { options: ['50 rows/page', '100 rows/page', 'Fit to page'] }),
      f('exportType', 'Standard Export File Type', 'select', { options: ['PDF', 'Excel', 'CSV', 'All'] }),
      f('currency', 'Default Currency Display', 'select', { options: ['INR (₹)', 'USD ($)', 'EUR (€)'] }),
    ],
    buttons: [btn('Apply Parameters')],
  },
  '/admin/report-designing': {
    detailFields: [
      f('reportName', 'Custom Report Name', 'text'),
      f('queryPanel', 'Custom Query Designer', 'textarea'),
      f('groupBy', 'Group By Default', 'text'),
      f('sortBy', 'Sort By Default', 'text'),
    ],
    gridColumns: ['Column Name', 'Display Label', 'Width', 'Visible'],
    gridTitle: 'Column Selection',
    buttons: [btn('Compile Custom Report'), btn('Save Design Blueprint', 'outline')],
  },
  '/admin/backup': {
    detailFields: [
      f('backupPath', 'Backup Path', 'select', { options: ['Local Drive', 'Secure Server', 'Cloud Storage'] }),
      f('compression', 'Compression Type', 'select', { options: ['ZIP', 'GZIP', 'None'] }),
      f('autoInterval', 'Auto-Backup Interval', 'select', { options: ['Daily', 'Weekly', 'Monthly', 'Disabled'] }),
    ],
    buttons: [btn('Run Immediate Database Backup'), btn('Schedule Auto-Backup', 'outline')],
  },
  '/admin/year-end': {
    detailFields: [
      f('closingDate', 'Current FY Closing Date', 'date'),
      f('newFyPrefix', 'New Financial Year Prefix', 'text', { placeholder: '2027-28' }),
      f('carryStock', 'Carry Forward Stock Quantities', 'checkbox', { defaultValue: 'true' }),
      f('carryBalances', 'Carry Forward Outstanding Balances', 'checkbox', { defaultValue: 'true' }),
    ],
    buttons: [btn('Execute Year End Closing Procedure', 'destructive')],
  },
  '/admin/import-data': {
    detailFields: [
      f('targetTable', 'Target Data Table', 'select', { options: ['Item Master', 'Customer List', 'Vendor Master', 'Worker Directory'] }),
      f('uploadFile', 'Excel/CSV Upload', 'text', { placeholder: 'Select file to upload...' }),
    ],
    gridColumns: ['Source Column', 'Target Field', 'Data Type', 'Mapped'],
    gridTitle: 'Column Mapping',
    buttons: [btn('Validate Upload File', 'outline'), btn('Execute Core Import Process')],
  },
  '/admin/invoice-type': {
    detailFields: [
      f('typeCode', 'Invoice Type Code', 'text'),
      f('typeName', 'Type Name', 'text', { placeholder: 'e.g. Domestic Tax Invoice, Export Invoice, SEZ Supply' }),
      f('taxProfile', 'Tax Calculation Profile Link', 'select', { options: ['GST 18%', 'GST 12%', 'GST 5%', 'Export Zero-Rated', 'SEZ'] }),
    ],
    buttons: [btn('Save Invoice Type')],
  },
  '/admin/sales-order-type': {
    detailFields: [
      f('typeCode', 'Sales Order Type Code', 'text'),
      f('typeName', 'Type Classification Name', 'text', { placeholder: 'e.g. Equipment Manufacturing, Plant Rental, Maintenance Service' }),
    ],
    buttons: [btn('Save Type Class')],
  },
  '/admin/auto-mail': {
    detailFields: [
      f('smtpServer', 'SMTP Mail Server', 'text'),
      f('smtpPort', 'Port', 'number', { defaultValue: '587' }),
      f('emailLogin', 'System Email Login', 'text'),
      f('triggers', 'Event Notification Triggers', 'select', { options: ['On GRN Submission', 'On New Work Order', 'On Invoice', 'On Service Call'] }),
    ],
    buttons: [btn('Verify SMTP Connection via Test Mail')],
  },
  '/admin/auto-sms': {
    detailFields: [
      f('apiUrl', 'SMS Gateway API URL', 'text'),
      f('authToken', 'Authentication Token Key', 'text'),
      f('templateHeader', 'SMS Template Header', 'text', { defaultValue: 'SUMESHPT' }),
    ],
    buttons: [btn('Save SMS Configuration')],
  },

  // ─── 5. MIS / REPORT LIST (standard filter pattern) ──────────────────
  '/mis/quotation-summary': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('party', 'Customer / Party', 'select', { options: ['All'] }),
      f('item', 'Item / Product', 'select', { options: ['All'] }),
    ],
    gridColumns: ['Quote No', 'Date', 'Party', 'Items Quoted', 'Total Amount (₹)', 'Deal Status'],
    gridTitle: 'Quotation Summary',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline'), btn('Export to PDF', 'outline'), btn('Email Directly', 'outline')],
  },
  '/mis/sales-activity': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('agent', 'Sales Agent', 'select', { options: ['All', 'R.M. Patel', 'Suketu Shah'] }),
    ],
    gridColumns: ['Date', 'Activity Type', 'Client', 'Notes', 'Outcome'],
    gridTitle: 'Daily Sales Activity Log',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline'), btn('Export to PDF', 'outline')],
  },
  '/mis/sales-order-summary': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('customer', 'Customer', 'select', { options: ['All'] }),
    ],
    gridColumns: ['SO No', 'Date', 'Customer', 'Plant Model', 'Value (₹)', 'Deadline', 'Status'],
    gridTitle: 'Active Sales Orders',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline'), btn('Export to PDF', 'outline')],
  },
  '/mis/sales-order-summary-mis': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('productLine', 'Product Line', 'select', { options: ['All', 'Filtration Plants', 'Storage Tanks', 'Vacuum Systems'] }),
    ],
    gridColumns: ['SO No', 'Customer', 'Plant Type', 'Order Value', 'Execution Status'],
    gridTitle: 'Sales Order MIS',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline'), btn('Export to PDF', 'outline')],
  },
  '/mis/sales-summary': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('region', 'Geographic Destination', 'select', { options: ['All', 'Domestic', 'Export'] }),
    ],
    gridColumns: ['Invoice No', 'Date', 'Product Line', 'Region', 'Amount (₹)'],
    gridTitle: 'Sales Summary',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline'), btn('Export to PDF', 'outline')],
  },
  '/mis/sales-summary-mis': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('productLine', 'Financial Product Line', 'select', { options: ['All', 'Filtration Units', 'Storage Assets', 'AMC Services'] }),
    ],
    gridColumns: ['Period', 'Product Line', 'Invoiced (₹)', 'Target (₹)', 'Achievement %'],
    gridTitle: 'Sales Summary MIS',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline')],
  },
  '/mis/sales-pipeline': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('stage', 'Pipeline Stage', 'select', { options: ['All', 'Enquiry', 'Quotation', 'Order', 'Invoice'] }),
    ],
    gridColumns: ['Deal Ref', 'Enquiry', 'Quotation', 'SO', 'Invoice', 'Status'],
    gridTitle: 'Enquiry → Invoice Pipeline',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline')],
  },
  '/mis/sales-agent-performance': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('agent', 'Sales Agent', 'select', { options: ['R.M. Patel', 'Suketu Shah', 'Mansi Shah'] }),
    ],
    gridColumns: ['Agent', 'Target (₹)', 'Achieved (₹)', 'Conversion %', 'Deals Won'],
    gridTitle: 'Agent Performance',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline')],
  },
  '/mis/sales-target': {
    detailFields: [
      f('fy', 'Financial Year', 'text', { defaultValue: '2026-27' }),
      f('period', 'Period', 'select', { options: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'] }),
    ],
    gridColumns: ['Category', 'Target (₹)', 'Achieved (₹)', 'Variance %'],
    gridTitle: 'Sales Target Summary',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline')],
  },
  '/mis/sales-target-group': {
    detailFields: [
      f('fy', 'Financial Year', 'text', { defaultValue: '2026-27' }),
      f('group', 'Machine Category Group', 'select', { options: ['Filtration Units', 'Storage Assets', 'Vacuum Systems', 'All'] }),
    ],
    gridColumns: ['Group', 'Target', 'Booked', 'Dispatched', 'Pending'],
    gridTitle: 'Group-Wise Target Progress',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline')],
  },
  '/mis/delay-quotation': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('threshold', 'Pending Beyond (Days)', 'number', { defaultValue: '15' }),
    ],
    gridColumns: ['Quote No', 'Date', 'Party', 'Days Pending', 'Assigned To'],
    gridTitle: 'Delayed Quotations',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline')],
  },
  '/mis/work-order-printing': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('woStatus', 'WO Status', 'select', { options: ['All', 'Planned', 'In Progress', 'QC Pending'] }),
    ],
    gridColumns: ['WO No', 'Date', 'Machine Model', 'Stage', 'Print Status'],
    gridTitle: 'Work Orders for Printing',
    buttons: [btn('Bulk Print'), btn('Export to Excel', 'outline')],
  },
  '/mis/work-order-shortage': {
    detailFields: [
      f('woNo', 'Work Order No', 'text'),
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
    ],
    gridColumns: ['WO No', 'Item Code', 'Required', 'Available', 'Shortage'],
    gridTitle: 'Material Shortages',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline')],
  },
  '/mis/purchase-summary': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('category', 'Item Category', 'select', { options: ['All', 'Pumps', 'Heaters', 'Steel Plates', 'Electrical'] }),
    ],
    gridColumns: ['PO No', 'Vendor', 'Category', 'Amount (₹)', 'GRN Status'],
    gridTitle: 'Purchase Summary',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline')],
  },
  '/mis/purchase-register': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('vendor', 'Vendor', 'select', { options: ['All'] }),
    ],
    gridColumns: ['Bill No', 'Date', 'Vendor', 'Taxable (₹)', 'GST (₹)', 'Total (₹)'],
    gridTitle: 'Purchase Register',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline'), btn('Export to PDF', 'outline')],
  },
  '/mis/sales-register': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('party', 'Party', 'select', { options: ['All'] }),
    ],
    gridColumns: ['Invoice No', 'Date', 'Party', 'Taxable (₹)', 'GST (₹)', 'Total (₹)'],
    gridTitle: 'Sales Register',
    buttons: [btn('View On Screen'), btn('Export to Excel', 'outline'), btn('Export to PDF', 'outline')],
  },

  // ─── 6. STATUTORY REPORTS ────────────────────────────────────────────
  '/statutory/gst-return': {
    detailFields: [
      f('taxPeriod', 'Tax Period', 'text', { placeholder: 'MM-YYYY' }),
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
    ],
    gridColumns: ['Return Type', 'Taxable Value (₹)', 'IGST (₹)', 'CGST (₹)', 'SGST (₹)'],
    gridTitle: 'GSTR-1 / GSTR-3B Summary',
    buttons: [btn('Compile Returns'), btn('Download JSON File', 'outline'), btn('Reconcile with Accounting Book', 'outline')],
  },
  '/statutory/gst-sales': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('hsnFilter', 'HSN Code Filter', 'text', { placeholder: 'e.g. 8421' }),
    ],
    gridColumns: ['HSN', 'Description', 'Tax Rate', 'Taxable (₹)', 'Tax (₹)', 'Customer Type'],
    gridTitle: 'Outward Sales GST Summary',
    buttons: [btn('Compile Returns'), btn('Download JSON File', 'outline')],
  },
  '/statutory/gst-purchase': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('vendor', 'Vendor', 'select', { options: ['All'] }),
    ],
    gridColumns: ['Vendor GSTIN', 'Invoice No', 'Taxable (₹)', 'ITC Eligible (₹)', 'Status'],
    gridTitle: 'Inward Purchase ITC Ledger',
    buttons: [btn('Compile Returns'), btn('Download JSON File', 'outline')],
  },
  '/statutory/gst-itc04': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('jobWorker', 'Job Worker', 'select', { options: ['All', 'Powder Coating Unit', 'CNC Machining Shop'] }),
    ],
    gridColumns: ['Challan No', 'Item Sent', 'Qty', 'Job Worker', 'Return Status'],
    gridTitle: 'Job Work ITC-04 Statement',
    buttons: [btn('Compile Returns'), btn('Download JSON File', 'outline')],
  },

  // ─── 7. GRAPHICAL / MIS REPORTS ──────────────────────────────────────
  '/graphical/enquiry': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('chartStyle', 'Chart Style', 'select', { options: ['Bar', 'Line', 'Pie'] }),
    ],
    buttons: [btn('Refresh Chart Data'), btn('Change Chart Style', 'outline'), btn('Save Chart Image', 'outline')],
  },
  '/graphical/sales-order': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('chartStyle', 'Chart Style', 'select', { options: ['Bar', 'Line', 'Pie'] }),
    ],
    buttons: [btn('Refresh Chart Data'), btn('Change Chart Style', 'outline'), btn('Save Chart Image', 'outline')],
  },
  '/graphical/sales': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('market', 'Market', 'select', { options: ['Domestic', 'International', 'Both'] }),
      f('chartStyle', 'Chart Style', 'select', { options: ['Bar', 'Line', 'Pie'] }),
    ],
    buttons: [btn('Refresh Chart Data'), btn('Change Chart Style', 'outline'), btn('Save Chart Image', 'outline')],
  },
  '/graphical/receivables-payments': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('chartStyle', 'Chart Style', 'select', { options: ['Bar', 'Line', 'Area'] }),
    ],
    buttons: [btn('Refresh Chart Data'), btn('Change Chart Style', 'outline'), btn('Save Chart Image', 'outline')],
  },
  '/graphical/purchase': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('category', 'Material Category', 'select', { options: ['All', 'Steel Plates', 'Pumps', 'Heaters'] }),
      f('chartStyle', 'Chart Style', 'select', { options: ['Bar', 'Line', 'Pie'] }),
    ],
    buttons: [btn('Refresh Chart Data'), btn('Change Chart Style', 'outline'), btn('Save Chart Image', 'outline')],
  },
  '/graphical/stock': {
    detailFields: [
      f('warehouse', 'Warehouse', 'select', { options: ['All', 'Main Factory', 'FG Store', 'Raw Material Yard'] }),
      f('category', 'Item Category', 'select', { options: ['Steel Plates', 'Pumps', 'High-Cost Components'] }),
      f('chartStyle', 'Chart Style', 'select', { options: ['Bar', 'Line', 'Pie'] }),
    ],
    buttons: [btn('Refresh Chart Data'), btn('Change Chart Style', 'outline'), btn('Save Chart Image', 'outline')],
  },
  '/graphical/business': {
    detailFields: [
      f('dateFrom', 'Start Date', 'date'),
      f('dateTo', 'End Date', 'date'),
      f('chartStyle', 'Chart Style', 'select', { options: ['Bar', 'Line', 'Pie', 'Dashboard'] }),
    ],
    buttons: [btn('Refresh Chart Data'), btn('Change Chart Style', 'outline'), btn('Save Chart Image', 'outline')],
  },

  // ─── 8. ENGINEERING & BOM ────────────────────────────────────────────
  '/engineering/replace-bom-item': {
    detailFields: [
      f('existingCode', 'Existing Component Code', 'text', { placeholder: 'e.g. Obsolete Sensor Model' }),
      f('newCode', 'New Alternative Component Code', 'text'),
      f('applyScope', 'Target Application', 'select', { options: ['Apply to All Active BOMs', 'Select Specific Machinery Line'] }),
    ],
    buttons: [btn('Execute Bulk Global Replacement', 'destructive'), btn('Simulate Impact on Cost', 'outline')],
  },
  '/engineering/replace-so-items': {
    detailFields: [
      f('soId', 'Active Sales Order ID', 'text'),
      f('specLine', 'Customized Specification Line', 'text'),
      f('swapField', 'Component Swap Identification', 'text'),
      f('approvalNotes', 'Customer Engineering Approval Notes', 'textarea'),
    ],
    buttons: [btn('Process Custom Component Swap')],
  },
  '/engineering/drawing-master': {
    detailFields: [
      f('drawingId', 'Drawing Identifier Code', 'text'),
      f('title', 'Engineering Component Title', 'text', { placeholder: 'e.g. Vacuum Chamber Fabrication Blueprint' }),
      f('cadLink', 'CAD File Format Link', 'text'),
      f('engineer', 'Design Engineer Name', 'text'),
      f('revision', 'Revision History Stamp', 'text'),
    ],
    buttons: [btn('Upload CAD Blueprint Document', 'outline'), btn('Approve Revision Design')],
  },
  '/engineering/bom-reports': {
    detailFields: [
      f('productVariant', 'Product Variant', 'select', { options: ['1000 LPH Plant', '3000 LPH Plant', '6000 LPH Plant'] }),
      f('breakdownLevel', 'Multi-Level Breakdown', 'select', { options: ['Single Level', 'Full Explosion', 'Summarized'] }),
    ],
    gridColumns: ['Item Code', 'Description', 'Qty', 'UOM', 'Unit Cost (₹)', 'Extended Cost (₹)'],
    gridTitle: 'BOM Component Breakdown',
    buttons: [btn('Generate Materials Requirement Plan')],
  },
};

export function getModuleBlueprint(modulePath: string): ModuleBlueprint | null {
  const path = modulePath.startsWith('/') ? modulePath : `/${modulePath}`;
  return MODULE_BLUEPRINTS[path] ?? null;
}

/** Map first blueprint fields to legacy row columns for list display */
export function blueprintToTableHeaders(blueprint: ModuleBlueprint): string[] {
  const fields = blueprint.detailFields;
  if (fields.length >= 4) {
    return [fields[0].label, 'Date', fields[1].label, fields[fields.length - 1].label, 'Status'];
  }
  return ['Reference', 'Date', 'Category', 'Description', 'Status'];
}

export function blueprintDefaultExtras(blueprint: ModuleBlueprint): Record<string, string> {
  const extras: Record<string, string> = {};
  for (const field of blueprint.detailFields) {
    if (field.type === 'checkbox') {
      extras[field.key] = field.defaultValue ?? 'false';
    } else if (field.defaultValue) {
      extras[field.key] = field.defaultValue;
    } else {
      extras[field.key] = '';
    }
  }
  return extras;
}
