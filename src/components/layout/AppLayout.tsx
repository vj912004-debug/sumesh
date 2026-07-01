import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, ShoppingCart,
  Package, Wrench, Truck, 
  Receipt, Bell, Search, Settings as SettingsIcon, Factory, Headset,
  Database, ShoppingBag, Layers, ChevronDown, ChevronUp, Wallet, BarChart3, Sliders,
  Sun, Moon, Menu, X, ShieldCheck, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const navGroups = [
  {
    title: 'Overview',
    isCollapsible: false,
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Tasks', path: '/tasks', icon: Bell },
      { name: 'Visitor Pass & Gate Registry', path: '/visitor-registry', icon: Users },
      { name: 'Communication Alerts', path: '/communication', icon: Mail }
    ]
  },
  {
    title: 'Master Data',
    isCollapsible: true,
    icon: Database,
    items: [
      { name: 'Master Configurations', path: '/master/saved-data' },
      { name: 'Client & Party Master', path: '/master/parties' },
      { name: 'Plant Catalog (Item Master)', path: '/master/items' },
      { name: 'Grade & Alloy Master', path: '/master/grades' },
      { name: 'Worker Directory', path: '/master/workers' },
      { name: 'Transporter Master', path: '/master/transports' }
    ]
  },
  {
    title: 'Plant Sales & Service Rentals',
    isCollapsible: true,
    icon: ShoppingCart,
    items: [
      { name: 'New Plant Order Entry', path: '/sales/order-entry' },
      { name: 'Pending Quotation Follow-up', path: '/sales/pending-quotations' },
      { name: 'Plant Order Book', path: '/sales/orders' },
      { name: 'Pending Advance Orders', path: '/sales/pending-orders' },
      { name: 'Dispatch Entry', path: '/sales/dispatch-entry' },
      { name: 'Despatch Report', path: '/sales/dispatch-reports' },
      { name: 'Packing Lists', path: '/dispatch/packing-lists' },
      { name: 'Invoice Entry', path: '/sales/invoice-entry' },
      { name: 'Sales Reports', path: '/sales/reports' },
      { name: 'Rental Contracts & Billing', path: '/sales-billing' }
    ]
  },
  {
    title: 'Plant Fabrication & FAT Testing',
    isCollapsible: true,
    icon: Factory,
    items: [
      { name: 'CNC Fabrication List', path: '/production/worker-cutting' },
      { name: 'Ready For Dispatch List', path: '/production/ready-dispatch' },
      { name: 'Plant Assembly Orders', path: '/production/list' },
      { name: 'Products & BOM', path: '/master/items' },
      { name: 'Production & Bed Status', path: '/production/status' },
      { name: 'TC Management', path: '/production/tc-management' },
      { name: 'MTC & Vacuum Vessel Certs', path: '/production/mtc' },
      { name: 'FAT & QA Inspection Logs', path: '/qms' }
    ]
  },
  {
    title: 'Procurement & Sourcing',
    isCollapsible: true,
    icon: ShoppingBag,
    items: [
      { name: 'PO (Pumps, Heaters, Spares)', path: '/purchase/orders' },
      { name: 'Purchase Rejections & Returns', path: '/purchase/returns' },
      { name: 'Supplier Ledger', path: '/purchase/ledgers' },
      { name: 'Gate GRN & Inward Check', path: '/purchase/grn' }
    ]
  },
  {
    title: 'Inventory & Spares Control',
    isCollapsible: true,
    icon: Layers,
    items: [
      { name: 'Stock Summary', path: '/inventory/summary' },
      { name: 'Stock Register', path: '/inventory/register' },
      { name: 'Outsourced Machining (Job Work)', path: '/inventory/job-work-out' },
      { name: 'Job Work Inward Receipt', path: '/inventory/job-work-in' },
      { name: 'Job Work Pending Report', path: '/inventory/job-work-pending' },
      { name: 'Returnable Challan', path: '/inventory/returnable-challan' },
      { name: 'Inventory Control', path: '/inventory-control' }
    ]
  },
  {
    title: 'Finance, Billing & GST',
    isCollapsible: true,
    icon: Wallet,
    items: [
      { name: 'Ledger Registry', path: '/accounts/ledger' },
      { name: 'Outstanding Receivables', path: '/accounts/outstanding' },
      { name: 'Payments Journal', path: '/accounts/payments' },
      { name: 'Challan Reconciliation', path: '/accounts/challans' },
      { name: 'Finance & Compliance', path: '/finance' }
    ]
  },
  {
    title: 'Heavy Logistics & ODC Cargo',
    isCollapsible: true,
    icon: Truck,
    items: [
      { name: 'Weighbridge Logs', path: '/transport/weigh-bridge' },
      { name: 'Packing Lists', path: '/dispatch/packing-lists' },
      { name: 'Transport Bill Entry', path: '/transport/bill-entry' },
      { name: 'Transport Bill Register', path: '/transport/bills' },
      { name: 'Pending Heavy Freight Dispatch', path: '/transport/pending' },
      { name: 'Transport Wise Summary', path: '/transport/summary' },
      { name: 'Supply Chain & Heavy Fleet', path: '/logistics' }
    ]
  },
  {
    title: 'AMC & On-site Filtration',
    isCollapsible: true,
    icon: Headset,
    items: [
      { name: 'AMC Service Tickets', path: '/after-sales' },
      { name: 'On-site Oil Filtration Log', path: '/after-sales/filtration-service' }
    ]
  },
  {
    title: 'Operational Analytics',
    isCollapsible: true,
    icon: BarChart3,
    items: [
      { name: 'Purchase Reports', path: '/reports/purchase' },
      { name: 'Production Reports', path: '/reports/production' },
      { name: 'Stock Reports', path: '/reports/stock' },
      { name: 'Material Receipt Reports', path: '/reports/receipts' },
      { name: 'Material Pending Reports', path: '/reports/pending' },
      { name: 'Sales Dashboard', path: '/reports/sales-dashboard' },
      { name: 'Final Inspection Reports', path: '/reports/final' }
    ]
  },
  {
    title: 'System Preferences',
    isCollapsible: true,
    icon: SettingsIcon,
    items: [
      { name: 'Company Profile', path: '/settings/company-profile' },
      { name: 'Users & Roles', path: '/settings/users-roles' },
      { name: 'Preferences', path: '/settings/preferences' },
      { name: 'Alert Center', path: '/settings/alert-center' }
    ]
  },
  {
    title: 'System',
    isCollapsible: false,
    items: [
      { name: 'Document Management', path: '/documents', icon: FileText }
    ]
  }
];

export function AppLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auto-expand active group
  useEffect(() => {
    const activeGroup = navGroups.find(group => 
      group.items.some(item => location.pathname === item.path || 
                              (item.path !== '/' && location.pathname.startsWith(item.path)))
    );
    if (activeGroup && activeGroup.isCollapsible) {
      setExpandedGroups(prev => ({ ...prev, [activeGroup.title]: true }));
    }
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const renderSidebarContent = () => (
    <>
      {/* Brand Logo area */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700 flex-shrink-0 bg-slate-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-400" />
          <span className="text-xl font-extrabold tracking-wider text-white">CORP-ERP</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-slate-400 hover:text-white"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation menu */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-3">
        {navGroups.map((group) => {
          const isCollapsed = group.isCollapsible && !expandedGroups[group.title];
          const GroupIcon = group.icon;
          
          return (
            <div key={group.title} className="space-y-1">
              {group.isCollapsible ? (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs font-semibold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {GroupIcon && <GroupIcon className="h-4 w-4 text-slate-500" />}
                    {group.title}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="h-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronUp className="h-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
              ) : (
                <div className="py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}

              {!isCollapsed && (
                <div className="space-y-0.5 pl-2 border-l border-slate-700/50 ml-3">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path || 
                                     (item.path !== '/' && location.pathname.startsWith(item.path));
                    const ItemIcon = (item as any).icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center px-4 py-2 text-sm font-medium transition-colors border-l-4 ${
                          isActive
                            ? 'bg-slate-700/50 text-white border-blue-500 font-semibold'
                            : 'text-slate-300 border-transparent hover:bg-slate-700/20 hover:text-white'
                        }`}
                      >
                        {ItemIcon && <ItemIcon className="mr-3 h-4 w-4 text-slate-400" />}
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Profile Panel */}
      <div className="p-4 border-t border-slate-700 bg-slate-900/60 flex items-center justify-between flex-shrink-0 text-slate-300">
        <div className="flex items-center gap-3">
          <div className="bg-slate-700 p-2 rounded-full text-blue-400">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">Suketu Shah</p>
            <p className="text-xs text-slate-500 mt-1">v2.1 Stable</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-xs text-slate-400 hover:text-white h-8 px-2 hover:bg-slate-700/50">
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 antialiased text-slate-900 dark:text-slate-100 font-sans">
      {/* Desktop Sidebar - Dark navy background */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col hidden md:flex text-slate-200 flex-shrink-0">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer Content */}
          <aside className="relative w-64 bg-slate-800 border-r border-slate-700 text-slate-200 flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header - White background */}
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 lg:px-8 shadow-sm z-10">
          <div className="flex items-center flex-1">
            {/* Hamburger Button for mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle mobile navigation</span>
            </Button>
            
            {/* Wide Search Bar in the Center */}
            <div className="relative w-full max-w-lg hidden sm:block">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources, documents, or systems..."
                className="w-full bg-gray-100 dark:bg-slate-900 border-0 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 dark:text-slate-200 placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5 text-amber-400" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Mail Icon */}
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 relative">
              <Mail className="h-5 w-5" />
              <span className="sr-only">Messages</span>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500"></span>
            </Button>

            {/* Notification Bell with red unread badge */}
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 relative">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border border-white dark:border-slate-950">
                3
              </span>
            </Button>

            {/* User Profile Avatar with dropdown */}
            <div className="flex items-center gap-2 border-l border-gray-100 dark:border-slate-800 pl-4 cursor-pointer hover:opacity-85">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                SS
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-none">Suketu Shah</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Admin Director</p>
              </div>
              <ChevronDown className="h-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
