import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';

import Enquiries from '@/pages/sales/Enquiries';
import EnquiryDetail from '@/pages/sales/EnquiryDetail';
import Quotations from '@/pages/sales/Quotations';
import QuotationDetail from '@/pages/sales/QuotationDetail';
import Orders from '@/pages/sales/Orders';
import OrderDetail from '@/pages/sales/OrderDetail';
import Customers from '@/pages/sales/Customers';
import CustomerDetail from '@/pages/sales/CustomerDetail';

import Products from '@/pages/production/Products';
import WorkOrders from '@/pages/production/WorkOrders';
import WorkOrderDetail from '@/pages/production/WorkOrderDetail';
import QualityControl from '@/pages/production/QualityControl';
import BOMDetail from '@/pages/production/BOMDetail';
import CostEstimates from '@/pages/production/CostEstimates';
import CostEstimateDetail from '@/pages/production/CostEstimateDetail';
import Inventory from '@/pages/inventory/Inventory';
import PurchaseOrders from '@/pages/inventory/PurchaseOrders';
import Dispatch from '@/pages/dispatch/Dispatch';
import DeliveryChallan from '@/pages/dispatch/DeliveryChallan';
import PackingLists from '@/pages/dispatch/PackingLists';
import PackingListDetail from '@/pages/dispatch/PackingListDetail';
import AfterSales from '@/pages/after-sales/AfterSales';
import Accounting from '@/pages/accounting/Accounting';
import InvoiceDetail from '@/pages/accounting/InvoiceDetail';
import ProformaInvoiceDetail from '@/pages/accounting/ProformaInvoiceDetail';
import Settings from '@/pages/settings/Settings';
import PurchaseOrderDetail from '@/pages/inventory/PurchaseOrderDetail';
import EWayBills from '@/pages/dispatch/EWayBills';
import JobWorkOutward from '@/pages/inventory/JobWorkOutward';
import JobWorkInward from '@/pages/inventory/JobWorkInward';
import Workers from '@/pages/production/Workers';
import WorkerTasks from '@/pages/production/WorkerTasks';
import Tasks from '@/pages/Tasks';
import GoodsReceipt from '@/pages/inventory/GoodsReceipt';
import ReportsDashboard from '@/pages/ReportsDashboard';
import AccountingReports from '@/pages/accounting/Reports';
import DocumentManagement from '@/pages/DocumentManagement';
import Payroll from '@/pages/production/Payroll';

import Login from '@/pages/auth/Login';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

// New specialized views
import WeighBridge from '@/pages/transport/WeighBridge';
import MillTestCertificate from '@/pages/production/MillTestCertificate';
import PlaceholderPage from '@/pages/PlaceholderPage';
import VisitorRegistry from '@/pages/visitor/VisitorRegistry';

// New modules
import FinalReports from '@/pages/reports/FinalReports';
import BuildProfitLoss from '@/pages/reports/BuildProfitLoss';
import BuildProfitDetail from '@/pages/reports/BuildProfitDetail';
import FiltrationService from '@/pages/after-sales/FiltrationService';
import ReturnableChallan from '@/pages/inventory/ReturnableChallan';

// Core ERP Modules
import QualityManagement from '@/pages/qms/QualityManagement';
import SupplyChainLogistics from '@/pages/logistics/SupplyChainLogistics';
import InventoryControl from '@/pages/inventory/InventoryControl';
import SalesRentalsBilling from '@/pages/sales/SalesRentalsBilling';
import FinanceTaxCompliance from '@/pages/finance/FinanceTaxCompliance';
import CommunicationAlerts from '@/pages/communication/CommunicationAlerts';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="visitor-registry" element={<VisitorRegistry />} />
            
            {/* Master Module */}
            <Route path="master/saved-data" element={<PlaceholderPage title="Master Saved Data" description="System configurations, cutting coefficients, and rate sheets." />} />
            <Route path="master/parties" element={<Customers />} />
            <Route path="master/items" element={<Products />} />
            <Route path="master/grades" element={<PlaceholderPage title="Grade Master" description="Configure metal grades, hardness, weight calculation formulas, and margins." />} />
            <Route path="master/workers" element={<Workers />} />
            <Route path="master/transports" element={<PlaceholderPage title="Transport Master" description="Database of registered logistics partners, drivers, and freight rates." />} />

            {/* Sales Module */}
            <Route path="sales/order-entry" element={<PlaceholderPage title="Order Entry" description="Log a new metal fabrication or raw steel cutting order." actionLabel="New Order Entry" />} />
            <Route path="sales/pending-quotations" element={<PlaceholderPage title="Pending Quotations" description="Follow up on commercial bids sent to clients." />} />
            <Route path="sales/orders" element={<Orders />} />
            <Route path="sales/pending-orders" element={<PlaceholderPage title="Pending Orders" description="Orders awaiting advance payment receipt or technical validation." />} />
            <Route path="sales/dispatch-entry" element={<Dispatch />} />
            <Route path="sales/dispatch-reports" element={<PlaceholderPage title="Dispatch Reports" description="History of delivery challans, weights, and transport bills." />} />
            <Route path="sales/invoice-entry" element={<Accounting />} />
            <Route path="sales/ti-entry" element={<Accounting />} />
            <Route path="sales/reports" element={<ReportsDashboard />} />

            {/* Production Module */}
            <Route path="production/worker-cutting" element={<PlaceholderPage title="Worker Cutting List" description="Assign and review worker tasks on CNC cutting beds." />} />
            <Route path="production/ready-dispatch" element={<PlaceholderPage title="Ready For Dispatch" description="Completed fabrication parts certified and waiting loading." />} />
            <Route path="production/list" element={<WorkOrders />} />
            <Route path="production/cost-estimates" element={<CostEstimates />} />
            <Route path="production/cost-estimate/:id" element={<CostEstimateDetail />} />
            <Route path="production/bom/:productId" element={<BOMDetail />} />
            <Route path="production/status" element={<PlaceholderPage title="Production Status" description="Real-time status overview of machine schedules and active cutting beds." />} />
            <Route path="production/tc-management" element={<PlaceholderPage title="Test Certificate Management" description="Verify raw plate mill certs and link QA certs to client invoices." />} />
            <Route path="production/mtc" element={<MillTestCertificate />} />

            {/* Purchase Module */}
            <Route path="purchase/orders" element={<PurchaseOrders />} />
            <Route path="purchase/returns" element={<PlaceholderPage title="Purchase Returns" description="Log raw plate rejections, credit notes, and weight discrepancies." />} />
            <Route path="purchase/ledgers" element={<PlaceholderPage title="Supplier Ledgers" description="Financial ledger records for material suppliers." />} />
            <Route path="purchase/grn" element={<GoodsReceipt />} />

            {/* Inventory Module */}
            <Route path="inventory/summary" element={<PlaceholderPage title="Stock Summary" description="Overview of raw steel, profiles, and finished parts." />} />
            <Route path="inventory/register" element={<PlaceholderPage title="Stock Ledger Register" description="Log of stock movements, receipts, issues, and adjustments." />} />
            <Route path="inventory/job-work-out" element={<JobWorkOutward />} />
            <Route path="inventory/job-work-in" element={<JobWorkInward />} />
            <Route path="inventory/job-work-pending" element={<PlaceholderPage title="Job Work Pending Report" description="Track delayed vendor machining and outsourcing." />} />
            <Route path="inventory/returnable-challan" element={<ReturnableChallan />} />

            {/* Accounts Module */}
            <Route path="accounts/ledger" element={<PlaceholderPage title="Accounts Ledger" description="Review financial registers, receipts, and client transactions." />} />
            <Route path="accounts/outstanding" element={<PlaceholderPage title="Outstanding Receivables" description="Track outstanding customer payments, ageing analysis, and payment reminders." />} />
            <Route path="accounts/payments" element={<PlaceholderPage title="Payments Journal" description="Log checks, drafts, and NEFT payments received." actionLabel="Log Payment" />} />
            <Route path="accounts/challans" element={<PlaceholderPage title="Challan Accounting" description="Log cost reconciliation on outgoing delivery challans vs final invoices." />} />

            {/* Settings Module */}
            <Route path="settings/company-profile" element={<PlaceholderPage title="Company Profile" description="Configure company details, GST registry, bank accounts, and addresses." />} />
            <Route path="settings/users-roles" element={<PlaceholderPage title="Users & Roles" description="Manage system access, worker assignments, and role permission policies." />} />
            <Route path="settings/preferences" element={<PlaceholderPage title="System Preferences" description="Configure localized currencies, decimal settings, cutting presets, and theme variables." />} />
            <Route path="settings/alert-center" element={<PlaceholderPage title="Alert Center" description="Manage automated warnings for low stock plates, late job works, and outstanding invoices." />} />

            {/* Transport Module */}
            <Route path="transport/weigh-bridge" element={<WeighBridge />} />
            <Route path="transport/bill-entry" element={<PlaceholderPage title="Transport Bill Entry" description="Log freight charges and transporter invoice entries." />} />
            <Route path="transport/bills" element={<PlaceholderPage title="Freight Invoices Registry" description="Registry of transport bills and payments." />} />
            <Route path="transport/pending" element={<PlaceholderPage title="Pending Dispatch Transport" description="Material packed and waiting for transport vehicle assignment." />} />
            <Route path="transport/summary" element={<PlaceholderPage title="Transport Wise Cost Summary" description="Transporter performance metrics, trip counts, and average freights." />} />

            {/* Reports Module */}
            <Route path="reports/purchase" element={<PlaceholderPage title="Purchase Analytical Reports" description="Supplier cost comparisons, material purchase histories, and price variance." />} />
            <Route path="reports/production" element={<PlaceholderPage title="Production Reports" description="CNC cutting time efficiency, worker outputs, and machine downtimes." />} />
            <Route path="reports/stock" element={<PlaceholderPage title="Stock Reports" description="Inventory valuations, plate consumption audits, and scrap analysis." />} />
            <Route path="reports/receipts" element={<PlaceholderPage title="Material Receipt Reports" description="Registry of GRNs, material inspections, and weight differences." />} />
            <Route path="reports/pending" element={<PlaceholderPage title="Pending Material Reports" description="List of unallocated raw plates and pending work orders." />} />
            <Route path="reports/sales-dashboard" element={<ReportsDashboard />} />
            <Route path="reports/final" element={<FinalReports />} />
            <Route path="reports/build-profit" element={<BuildProfitLoss />} />
            <Route path="reports/build-profit/:workOrderId" element={<BuildProfitDetail />} />

            {/* Standard Detail views and fallback compatibility */}
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="enquiries/:id" element={<EnquiryDetail />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="quotations/:id" element={<QuotationDetail />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="products" element={<Products />} />
            <Route path="work-orders" element={<WorkOrders />} />
            <Route path="work-orders/:id" element={<WorkOrderDetail />} />
            <Route path="workers" element={<Workers />} />
            <Route path="worker-tasks" element={<WorkerTasks />} />
            <Route path="qc" element={<QualityControl />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
            <Route path="grn" element={<GoodsReceipt />} />
            <Route path="job-work" element={<JobWorkOutward />} />
            <Route path="job-work-inward" element={<JobWorkInward />} />
            <Route path="dispatch" element={<Dispatch />} />
            <Route path="dispatch/:id" element={<DeliveryChallan />} />
            <Route path="dispatch/packing-lists" element={<PackingLists />} />
            <Route path="dispatch/packing-list/:id" element={<PackingListDetail />} />
            <Route path="eway-bills" element={<EWayBills />} />
            <Route path="after-sales" element={<AfterSales />} />
            <Route path="after-sales/filtration-service" element={<FiltrationService />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="accounting/invoice/:id" element={<InvoiceDetail />} />
            <Route path="accounting/ti/:id" element={<InvoiceDetail />} />
            <Route path="accounting/proforma/:id" element={<ProformaInvoiceDetail />} />
            <Route path="accounting/reports" element={<AccountingReports />} />
            <Route path="reports" element={<ReportsDashboard />} />
            <Route path="documents" element={<DocumentManagement />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="settings" element={<Settings />} />

            {/* Core ERP Modules */}
            <Route path="qms" element={<QualityManagement />} />
            <Route path="logistics" element={<SupplyChainLogistics />} />
            <Route path="inventory-control" element={<InventoryControl />} />
            <Route path="sales-billing" element={<SalesRentalsBilling />} />
            <Route path="finance" element={<FinanceTaxCompliance />} />
            <Route path="communication" element={<CommunicationAlerts />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
