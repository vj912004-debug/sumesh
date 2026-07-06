import type { ReactNode } from 'react';
import { Route } from 'react-router-dom';
import PlaceholderPage from '@/pages/PlaceholderPage';
import { getErpModuleRoutes, type ErpNavItem } from '@/lib/erpModules';

import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import CommunicationAlerts from '@/pages/communication/CommunicationAlerts';
import Customers from '@/pages/sales/Customers';
import Products from '@/pages/production/Products';
import Workers from '@/pages/production/Workers';
import Enquiries from '@/pages/sales/Enquiries';
import Quotations from '@/pages/sales/Quotations';
import Accounting from '@/pages/accounting/Accounting';
import MillTestCertificate from '@/pages/production/MillTestCertificate';
import QualityManagement from '@/pages/qms/QualityManagement';
import BuildProfitLoss from '@/pages/reports/BuildProfitLoss';
import PurchaseOrders from '@/pages/inventory/PurchaseOrders';
import GoodsReceipt from '@/pages/inventory/GoodsReceipt';
import Inventory from '@/pages/inventory/Inventory';
import ReturnableChallan from '@/pages/inventory/ReturnableChallan';
import WarrantyRepairChallan from '@/pages/inventory/WarrantyRepairChallan';
import AssetAvailabilityDashboard from '@/pages/inventory/AssetAvailabilityDashboard';
import InventoryControl from '@/pages/inventory/InventoryControl';
import Dispatch from '@/pages/dispatch/Dispatch';
import PackingLists from '@/pages/dispatch/PackingLists';
import EWayBills from '@/pages/dispatch/EWayBills';
import QualityControl from '@/pages/production/QualityControl';
import JobWorkOutward from '@/pages/inventory/JobWorkOutward';
import JobWorkInward from '@/pages/inventory/JobWorkInward';
import JobWorkChallan from '@/pages/inventory/JobWorkChallan';
import ContractorBillBooking from '@/pages/inventory/ContractorBillBooking';
import WorkOrders from '@/pages/production/WorkOrders';
import MaterialIssue from '@/pages/inventory/MaterialIssue';
import FinishItemStock from '@/pages/inventory/FinishItemStock';
import AreaWiseCustomerReport from '@/pages/reports/AreaWiseCustomerReport';
import PendingClientPo from '@/pages/sales/PendingClientPo';
import AfterSales from '@/pages/after-sales/AfterSales';
import ReportsDashboard from '@/pages/ReportsDashboard';
import FinalReports from '@/pages/reports/FinalReports';
import FinanceTaxCompliance from '@/pages/finance/FinanceTaxCompliance';
import UsersManagement from '@/pages/admin/UsersManagement';
import Settings from '@/pages/settings/Settings';
import DocumentManagement from '@/pages/DocumentManagement';
import VisitorRegistry from '@/pages/visitor/VisitorRegistry';
import SalesRentalsBilling from '@/pages/sales/SalesRentalsBilling';
import Payroll from '@/pages/production/Payroll';
import ErpWorkflow from '@/pages/ErpWorkflow';
import ItemMaster from '@/pages/master/ItemMaster';

const COMPONENT_MAP: Record<string, ReactNode> = {
  dashboard: <Dashboard />,
  'erp-workflow': <ErpWorkflow />,
  tasks: <Tasks />,
  communication: <CommunicationAlerts />,
  customers: <Customers />,
  'item-master': <ItemMaster />,
  products: <Products />,
  workers: <Workers />,
  enquiries: <Enquiries />,
  quotations: <Quotations />,
  accounting: <Accounting />,
  'accounting-ti': <Accounting />,
  mtc: <MillTestCertificate />,
  qms: <QualityManagement />,
  'build-profit': <BuildProfitLoss />,
  'purchase-orders': <PurchaseOrders />,
  grn: <GoodsReceipt />,
  inventory: <Inventory />,
  'returnable-challan': <ReturnableChallan />,
  'warranty-repair': <WarrantyRepairChallan />,
  'asset-availability': <AssetAvailabilityDashboard />,
  'inventory-control': <InventoryControl />,
  dispatch: <Dispatch />,
  'packing-lists': <PackingLists />,
  'eway-bills': <EWayBills />,
  qc: <QualityControl />,
  'job-work-out': <JobWorkOutward />,
  'job-work-in': <JobWorkInward />,
  'job-work-challan': <JobWorkChallan />,
  'contractor-bills': <ContractorBillBooking />,
  'work-orders': <WorkOrders />,
  'material-issue': <MaterialIssue />,
  'finish-stock': <FinishItemStock />,
  'customers-by-area': <AreaWiseCustomerReport />,
  'pending-po': <PendingClientPo />,
  'after-sales': <AfterSales />,
  'reports-dashboard': <ReportsDashboard />,
  'final-reports': <FinalReports />,
  finance: <FinanceTaxCompliance />,
  'users-management': <UsersManagement />,
  settings: <Settings />,
  documents: <DocumentManagement />,
  'visitor-registry': <VisitorRegistry />,
  'sales-reports': <ReportsDashboard />,
  'sales-client-profiles': <SalesRentalsBilling section="customers" />,
  'sales-po-tracking': <SalesRentalsBilling section="linkage" />,
  payroll: <Payroll />,
};

function resolveElement(item: ErpNavItem) {
  if (item.componentKey && COMPONENT_MAP[item.componentKey]) {
    return COMPONENT_MAP[item.componentKey];
  }
  return (
    <PlaceholderPage
      title={item.name}
      modulePath={item.path}
      description={item.description ?? `Manage ${item.name} records and operations.`}
      actionLabel={`New ${item.name}`}
    />
  );
}

function routeElementsFromItems(items: ErpNavItem[]) {
  return items.map(item => {
    const isIndex = item.path === '/';
    const path = isIndex ? '' : item.path.replace(/^\//, '');
    const element = resolveElement(item);

    if (isIndex) {
      return <Route key="index" index element={element} />;
    }

    return <Route key={`route-${path}`} path={path} element={element} />;
  });
}

/** Must be rendered as direct children of a parent <Route> — not wrapped in a component. */
export function getErpRouteElements() {
  return routeElementsFromItems(getErpModuleRoutes());
}
