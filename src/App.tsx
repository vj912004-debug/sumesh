import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { getErpRouteElements } from '@/components/routes/ErpModuleRoutes';

import EnquiryDetail from '@/pages/sales/EnquiryDetail';
import QuotationDetail from '@/pages/sales/QuotationDetail';
import OrderDetail from '@/pages/sales/OrderDetail';
import CustomerDetail from '@/pages/sales/CustomerDetail';
import WorkOrderDetail from '@/pages/production/WorkOrderDetail';
import BOMDetail from '@/pages/production/BOMDetail';
import CostEstimateDetail from '@/pages/production/CostEstimateDetail';
import PurchaseOrderDetail from '@/pages/inventory/PurchaseOrderDetail';
import DeliveryChallan from '@/pages/dispatch/DeliveryChallan';
import PackingListDetail from '@/pages/dispatch/PackingListDetail';
import InvoiceDetail from '@/pages/accounting/InvoiceDetail';
import ProformaInvoiceDetail from '@/pages/accounting/ProformaInvoiceDetail';
import BuildProfitDetail from '@/pages/reports/BuildProfitDetail';

import Login from '@/pages/auth/Login';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

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
            {getErpRouteElements()}

            {/* Detail / dynamic routes */}
            <Route path="enquiries/:id" element={<EnquiryDetail />} />
            <Route path="quotations/:id" element={<QuotationDetail />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="work-orders/:id" element={<WorkOrderDetail />} />
            <Route path="production/cost-estimate/:id" element={<CostEstimateDetail />} />
            <Route path="production/bom/:productId" element={<BOMDetail />} />
            <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
            <Route path="dispatch/:id" element={<DeliveryChallan />} />
            <Route path="dispatch/packing-list/:id" element={<PackingListDetail />} />
            <Route path="accounting/invoice/:id" element={<InvoiceDetail />} />
            <Route path="accounting/ti/:id" element={<InvoiceDetail />} />
            <Route path="accounting/proforma/:id" element={<ProformaInvoiceDetail />} />
            <Route path="reports/build-profit/:workOrderId" element={<BuildProfitDetail />} />

            {/* Legacy redirects */}
            <Route path="work-orders" element={<Navigate to="/production/list" replace />} />
            <Route path="products" element={<Navigate to="/master/items" replace />} />
            <Route path="purchase-orders" element={<Navigate to="/purchase/orders" replace />} />
            <Route path="grn" element={<Navigate to="/purchase/grn" replace />} />
            <Route path="job-work" element={<Navigate to="/inventory/job-work-out" replace />} />
            <Route path="job-work-inward" element={<Navigate to="/inventory/job-work-in" replace />} />
            <Route path="accounting" element={<Navigate to="/sales/invoice-entry" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
