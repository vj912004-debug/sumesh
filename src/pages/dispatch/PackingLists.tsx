import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  mockPackingLists, mockOrders, mockCustomers, mockQuotations, mockProducts
} from '@/lib/mockData';
import type { PackingList, Package, PackageItem, Order } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { 
  Package as PackageIcon, Truck, Plus, Eye, Search, AlertCircle, Trash2, CheckCircle2, ShoppingBag, Calendar
} from 'lucide-react';

export default function PackingLists() {
  const [packingLists, setPackingLists] = useState<PackingList[]>(mockPackingLists);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Finalized' | 'Shipped'>('All');
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [lrNumber, setLrNumber] = useState('');
  const [packages, setPackages] = useState<Package[]>([]);
  
  // Helper items for packing
  const [currentPackageType, setCurrentPackageType] = useState('Wooden Box');
  const [currentDimensions, setCurrentDimensions] = useState('100x100x100 cm');
  const [currentGrossWeight, setCurrentGrossWeight] = useState(100);
  const [currentNetWeight, setCurrentNetWeight] = useState(80);
  const [packedItems, setPackedItems] = useState<Record<string, number>>({}); // productId -> qty

  // Filter orders that are ready to pack (e.g. status is Ready for Dispatch or In Production)
  const availableOrders = mockOrders.filter(o => o.status === 'Ready for Dispatch' || o.status === 'In Production');

  const selectedOrder = mockOrders.find(o => o.id === selectedOrderId);
  const selectedQuotation = mockQuotations.find(q => q.id === selectedOrder?.quotationId);
  const selectedCustomer = mockCustomers.find(c => c.id === selectedOrder?.customerId);

  // Compute total packing list statistics
  const totalWeight = packingLists.reduce((acc, curr) => {
    return acc + curr.packages.reduce((pAcc, p) => pAcc + p.grossWeight, 0);
  }, 0);
  
  const totalPackages = packingLists.reduce((acc, curr) => acc + curr.packages.length, 0);
  const shippedCount = packingLists.filter(p => p.status === 'Shipped').length;
  const draftCount = packingLists.filter(p => p.status === 'Draft').length;

  // Handlers
  const handleAddPackage = () => {
    if (Object.keys(packedItems).length === 0) {
      alert('Please add at least one item to this package.');
      return;
    }

    const packageNo = `PKG-${String(packages.length + 1).padStart(2, '0')}`;
    const newPackage: Package = {
      packageNo,
      type: currentPackageType,
      dimensions: currentDimensions,
      grossWeight: currentGrossWeight,
      netWeight: currentNetWeight,
      items: Object.entries(packedItems).map(([productId, quantity]) => ({
        productId,
        quantity
      })).filter(item => item.quantity > 0)
    };

    setPackages([...packages, newPackage]);
    // Reset package fields
    setPackedItems({});
    setCurrentGrossWeight(100);
    setCurrentNetWeight(80);
  };

  const handleRemovePackage = (index: number) => {
    const updated = packages.filter((_, i) => i !== index);
    // Re-index package numbers
    const reindexed = updated.map((pkg, i) => ({
      ...pkg,
      packageNo: `PKG-${String(i + 1).padStart(2, '0')}`
    }));
    setPackages(reindexed);
  };

  const handleCreatePackingList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      alert('Please select a valid Order.');
      return;
    }
    if (packages.length === 0) {
      alert('Please configure at least one package.');
      return;
    }

    const newPL: PackingList = {
      id: `PL-26-${880 + packingLists.length + 1}`,
      orderId: selectedOrderId,
      challanNo: `DC-26-${880 + packingLists.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      customerId: selectedCustomer?.id || '',
      packages,
      carrierName: carrierName || 'Self / Hand Delivery',
      vehicleNo: vehicleNo || 'N/A',
      lrNumber: lrNumber || 'N/A',
      status: 'Draft'
    };

    setPackingLists([newPL, ...packingLists]);
    setIsCreateOpen(false);
    // Reset Form
    setSelectedOrderId('');
    setCarrierName('');
    setVehicleNo('');
    setLrNumber('');
    setPackages([]);
  };

  const handleUpdateStatus = (id: string, newStatus: 'Draft' | 'Finalized' | 'Shipped') => {
    setPackingLists(prev => prev.map(pl => {
      if (pl.id === id) {
        return { ...pl, status: newStatus };
      }
      return pl;
    }));
  };

  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete Packing List ${id}?`)) {
      setPackingLists(prev => prev.filter(pl => pl.id !== id));
    }
  };

  // Filter lists based on search & tabs
  const filteredPackingLists = packingLists.filter(pl => {
    const customer = mockCustomers.find(c => c.id === pl.customerId);
    const searchStr = `${pl.id} ${pl.orderId} ${customer?.name || ''}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || pl.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with gradient background */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 p-6 md:p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-6 scale-150">
          <PackageIcon className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Packing & Packaging Lists</h2>
          <p className="text-blue-100 max-w-xl text-sm md:text-base">
            Create, manage, and print packing lists. Group order items into customized boxes, crates, or bags with dimensions and weights for shipping.
          </p>
        </div>
        <div className="relative z-10 flex-shrink-0">
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold border-0 shadow-md transition-all scale-100 hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5 font-bold" /> New Packing List
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Packing Lists</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{packingLists.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
              <PackageIcon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Packages Packed</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{totalPackages}</h3>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Gross Weight</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{totalWeight.toLocaleString()} kg</h3>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Shipped</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{draftCount + packingLists.filter(p => p.status === 'Finalized').length}</h3>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main List Management Container */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl font-bold">Registry of Packing Lists</CardTitle>
            
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search PL ID, Order, Client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Status Tab Filters */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border text-xs font-medium">
                {(['All', 'Draft', 'Finalized', 'Shipped'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      statusFilter === tab 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-semibold' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="font-semibold py-4 pl-6">Packing ID</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Sales Order</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold text-center">Packages</TableHead>
                <TableHead className="font-semibold text-right">Gross Weight</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackingLists.length === 0 ? (
                <TableRow>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground text-sm">
                    No packing lists found matching the filters.
                  </td>
                </TableRow>
              ) : (
                filteredPackingLists.map((pl) => {
                  const customer = mockCustomers.find(c => c.id === pl.customerId);
                  const pkgCount = pl.packages.length;
                  const plWeight = pl.packages.reduce((sum, pkg) => sum + pkg.grossWeight, 0);
                  
                  return (
                    <TableRow key={pl.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors">
                      <TableCell className="font-semibold py-4 pl-6 text-blue-600 dark:text-blue-400">
                        {pl.id}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-sm">
                        {pl.date}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                        {pl.orderId}
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                        {customer?.name}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        <Badge variant="outline" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {pkgCount} Pkg
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-800 dark:text-slate-200">
                        {plWeight} kg
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={
                          pl.status === 'Shipped' ? 'default' :
                          pl.status === 'Finalized' ? 'secondary' :
                          'outline'
                        } className={
                          pl.status === 'Shipped' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-950 dark:text-green-200' :
                          pl.status === 'Finalized' ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-200' :
                          'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-200'
                        }>
                          {pl.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 space-x-1">
                        <Link to={`/dispatch/packing-list/${pl.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 dark:hover:text-white" title="Print/View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {pl.status === 'Draft' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-950" 
                            title="Finalize List"
                            onClick={() => handleUpdateStatus(pl.id, 'Finalized')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {pl.status === 'Finalized' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950" 
                            title="Ship Carrier"
                            onClick={() => handleUpdateStatus(pl.id, 'Shipped')}
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950" 
                          title="Delete"
                          onClick={() => handleDelete(pl.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Creation Modal / Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreatePackingList}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-blue-500" />
                Configure New Packing List
              </DialogTitle>
              <DialogDescription>
                Bundle sales order items into custom boxes, dimensions, and weights for shipping.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-b border-t my-4">
              {/* Order Selection */}
              <div className="space-y-4 md:col-span-1">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Select Sales Order *</label>
                  <select 
                    value={selectedOrderId} 
                    onChange={(e) => {
                      setSelectedOrderId(e.target.value);
                      setPackages([]);
                      setPackedItems({});
                    }}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">-- Choose Order --</option>
                    {availableOrders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} ({o.status})</option>
                    ))}
                  </select>
                </div>

                {selectedOrder && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border text-xs space-y-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Customer Details</p>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">{selectedCustomer?.name}</p>
                    <p className="text-slate-500">{selectedCustomer?.city}, {selectedCustomer?.state}</p>
                    <p className="text-slate-400">GSTIN: {selectedCustomer?.gstin}</p>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Carrier / Transporter</label>
                    <Input 
                      placeholder="e.g. VRL Logistics" 
                      value={carrierName} 
                      onChange={(e) => setCarrierName(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Vehicle Number</label>
                    <Input 
                      placeholder="e.g. GJ-06-XX-5678" 
                      value={vehicleNo} 
                      onChange={(e) => setVehicleNo(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">LR Number (Consignment No)</label>
                    <Input 
                      placeholder="e.g. LR-4091" 
                      value={lrNumber} 
                      onChange={(e) => setLrNumber(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              {/* Package Builder and items mapping */}
              <div className="space-y-4 md:col-span-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Package Configuration Builder</h4>
                
                {selectedOrder ? (
                  <div className="border rounded-xl p-4 bg-slate-50/40 dark:bg-slate-900/40 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pkg Type</label>
                        <select 
                          value={currentPackageType} 
                          onChange={(e) => setCurrentPackageType(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border rounded-lg p-2 text-xs focus:outline-none"
                        >
                          <option value="Wooden Box">Wooden Box</option>
                          <option value="Crate">Crate</option>
                          <option value="Carton">Carton</option>
                          <option value="Loose">Loose</option>
                          <option value="Metal Palette">Metal Palette</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Dimensions (LxWxH)</label>
                        <Input 
                          placeholder="e.g. 100x100x120 cm" 
                          value={currentDimensions} 
                          onChange={(e) => setCurrentDimensions(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Gross Wt (kg)</label>
                        <Input 
                          type="number" 
                          value={currentGrossWeight} 
                          onChange={(e) => setCurrentGrossWeight(Number(e.target.value))}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Net Wt (kg)</label>
                        <Input 
                          type="number" 
                          value={currentNetWeight} 
                          onChange={(e) => setCurrentNetWeight(Number(e.target.value))}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    {/* Order items packing selectors */}
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-xs font-bold text-slate-500 mb-1">Assign Items to this Package:</p>
                      
                      {selectedQuotation?.items.map((item) => {
                        const product = mockProducts.find(p => p.id === item.productId);
                        // Calculate already packed quantities in other saved packages
                        const alreadyPacked = packages.reduce((acc, pkg) => {
                          const matchingItem = pkg.items.find(pi => pi.productId === item.productId);
                          return acc + (matchingItem?.quantity || 0);
                        }, 0);
                        const remaining = item.quantity - alreadyPacked;

                        return (
                          <div key={item.productId} className="flex items-center justify-between bg-white dark:bg-slate-950 p-2.5 rounded-lg border text-xs">
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{product?.name}</p>
                              <p className="text-slate-400">Total Ordered: {item.quantity} | Remaining: {remaining}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-slate-400">Pack Qty:</span>
                              <input 
                                type="number" 
                                min={0}
                                max={remaining}
                                value={packedItems[item.productId] || 0}
                                onChange={(e) => {
                                  const val = Math.min(remaining, Math.max(0, Number(e.target.value)));
                                  setPackedItems(prev => ({
                                    ...prev,
                                    [item.productId]: val
                                  }));
                                }}
                                className="w-16 bg-slate-50 border rounded px-2 py-1 text-center font-bold"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Button 
                      type="button" 
                      onClick={handleAddPackage}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs h-8"
                    >
                      + Add this Package to List
                    </Button>
                  </div>
                ) : (
                  <div className="h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs">
                    <AlertCircle className="w-8 h-8 mb-2 text-slate-300" />
                    Select a Sales Order on the left to configure packages.
                  </div>
                )}

                {/* Displaying configured packages */}
                {packages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configured Packages List ({packages.length})</p>
                    <div className="border rounded-xl divide-y max-h-40 overflow-y-auto">
                      {packages.map((pkg, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950">
                          <div>
                            <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">{pkg.packageNo}</span>
                            <span className="text-slate-500">({pkg.type} | {pkg.dimensions})</span>
                            <div className="flex gap-4 text-[10px] text-slate-400 mt-1">
                              <span>Gross Wt: <b>{pkg.grossWeight} kg</b></span>
                              <span>Net Wt: <b>{pkg.netWeight} kg</b></span>
                            </div>
                            <div className="mt-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                              Packed: {pkg.items.map(pi => {
                                const prod = mockProducts.find(p => p.id === pi.productId);
                                return `${prod?.name} (${pi.quantity} Nos)`;
                              }).join(', ')}
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemovePackage(idx)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={!selectedOrderId || packages.length === 0}>
                Save Packing List
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
