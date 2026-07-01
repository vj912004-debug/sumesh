import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
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
  mockBOMs, mockInventory
} from '@/lib/mockData2';
import type { BOM, BOMItem, InventoryItem } from '@/lib/mockData2';
import { mockProducts } from '@/lib/mockData';
import { 
  ArrowLeft, Plus, Trash2, Printer, CheckCircle, Sliders, DollarSign, ListChecks, Layers, Info
} from 'lucide-react';

export default function BOMDetail() {
  const { productId } = useParams();

  // Find product
  const product = mockProducts.find(p => p.id === productId);

  // Load initial BOM or mock a new one if it doesn't exist
  const [bom, setBom] = useState<BOM>(() => {
    const existing = mockBOMs.find(b => b.productId === productId);
    if (existing) return existing;
    
    // Create default draft BOM if none exists
    return {
      id: `BOM-SP${Math.floor(1000 + Math.random() * 9000)}`,
      productId: productId || '',
      version: 'v1.0',
      status: 'Draft',
      lastUpdated: new Date().toISOString().split('T')[0],
      items: []
    };
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [addQty, setAddQty] = useState('1');

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Product not found</p>
        <Link to="/master/items" className="text-primary hover:underline mt-2 inline-block">Back to Products</Link>
      </div>
    );
  }

  // Cost Roll-up Calculations
  const calculatedItems = bom.items.map(item => {
    const invItem = mockInventory.find(inv => inv.id === item.inventoryItemId);
    const totalCost = invItem ? item.quantity * invItem.unitCost : 0;
    return {
      ...item,
      details: invItem,
      totalCost
    };
  });

  const totalMaterialCost = calculatedItems.reduce((sum, item) => sum + item.totalCost, 0);
  const profitMargin = product.basePrice > 0 ? ((product.basePrice - totalMaterialCost) / product.basePrice) * 100 : 0;
  
  // Handlers
  const handleUpdateQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) return;
    const updatedItems = bom.items.map(item => 
      item.inventoryItemId === itemId ? { ...item, quantity: newQty } : item
    );
    setBom({
      ...bom,
      items: updatedItems,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = bom.items.filter(item => item.inventoryItemId !== itemId);
    setBom({
      ...bom,
      items: updatedItems,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(addQty);
    if (!selectedItemId || isNaN(qty) || qty <= 0) return;

    // Check if component already exists
    const exists = bom.items.some(item => item.inventoryItemId === selectedItemId);
    let updatedItems: BOMItem[];

    if (exists) {
      updatedItems = bom.items.map(item => 
        item.inventoryItemId === selectedItemId ? { ...item, quantity: item.quantity + qty } : item
      );
    } else {
      updatedItems = [...bom.items, { inventoryItemId: selectedItemId, quantity: qty }];
    }

    setBom({
      ...bom,
      items: updatedItems,
      lastUpdated: new Date().toISOString().split('T')[0]
    });

    setIsAddOpen(false);
    setSelectedItemId('');
    setAddQty('1');
  };

  const handleStatusChange = (newStatus: 'Draft' | 'Approved' | 'Obsolete') => {
    setBom({
      ...bom,
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    
    // Also save back to session mock list
    const idx = mockBOMs.findIndex(b => b.id === bom.id);
    if (idx !== -1) {
      mockBOMs[idx].status = newStatus;
    }
  };

  const handleVersionChange = (newVersion: string) => {
    setBom({
      ...bom,
      version: newVersion,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  // Filter items in database that can be added
  const availableInventory = mockInventory.filter(inv => 
    !bom.items.some(item => item.inventoryItemId === inv.id)
  );

  return (
    <div className="space-y-6">
      {/* Top action bar - hidden in print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden bg-white dark:bg-slate-950 p-4 border rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/master/items">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">Bill of Materials: {bom.id}</h2>
              <Badge variant={
                bom.status === 'Approved' ? 'default' :
                bom.status === 'Obsolete' ? 'destructive' :
                'outline'
              } className={
                bom.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200' :
                bom.status === 'Obsolete' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200' :
                'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200'
              }>
                {bom.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">For Product: {product.name} ({product.model})</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status switches */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border p-1 rounded-lg text-xs gap-1">
            {(['Draft', 'Approved', 'Obsolete'] as const).map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  bom.status === s 
                    ? 'bg-white dark:bg-slate-800 shadow-sm font-semibold text-primary' 
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print BOM
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3 print:hidden">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Materials Cost</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">₹{totalMaterialCost.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Based on active inventory rates</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Catalog Price</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">₹{product.basePrice.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-slate-400 mt-1">MSRP / Commercial sales rate</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estimated Gross Margin</p>
              <h3 className={`text-3xl font-bold mt-1 ${profitMargin > 20 ? 'text-green-600' : 'text-amber-600'}`}>
                {profitMargin.toFixed(1)}%
              </h3>
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mt-1.5">
                <div 
                  className={`h-full ${profitMargin > 20 ? 'bg-green-600' : 'bg-amber-600'}`} 
                  style={{ width: `${Math.min(100, Math.max(0, profitMargin))}%` }}
                ></div>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${profitMargin > 20 ? 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400' : 'bg-amber-100 text-amber-600'}`}>
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Printable Area - wraps the document details */}
        <div className="md:col-span-2 space-y-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 lg:p-8 text-black dark:text-white relative shadow-sm">
          {/* Print only company logo header */}
          <div className="hidden print:block text-center border-b-2 border-double pb-4 mb-6">
            <h1 className="text-3xl font-extrabold tracking-wide">SUMESH PETROLEUM PVT. LTD.</h1>
            <p className="text-xs text-slate-500 font-medium uppercase mt-1">Industrial Equipment Division • Oil Filtration Systems</p>
            <p className="text-sm mt-1">Plot No. 880, Makarpura GIDC, Vadodara, Gujarat - 390010, India</p>
            <div className="inline-block border bg-slate-100 px-6 py-1 mt-3">
              <h2 className="text-base font-bold uppercase tracking-wider">Bill of Materials Details</h2>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">Engineering Bill of Materials</h3>
              <p className="text-xs text-slate-500">Defines required assembly items for production work orders.</p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Component
              </Button>
            </div>
          </div>

          {/* Details header block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">BOM Reference No.</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{bom.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">BOM Status</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{bom.status}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Revision Version</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-100">{bom.version}</span>
                <button 
                  onClick={() => {
                    const next = prompt('Enter new version code (e.g. v1.1):', bom.version);
                    if (next) handleVersionChange(next);
                  }}
                  className="text-[9px] text-blue-600 hover:underline print:hidden font-semibold"
                >
                  Edit
                </button>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Last Updated Date</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{bom.lastUpdated}</span>
            </div>
          </div>

          {/* Components list */}
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="font-semibold w-12 text-center">Sr.</TableHead>
                <TableHead className="font-semibold w-32">Part Number</TableHead>
                <TableHead className="font-semibold">Component Name</TableHead>
                <TableHead className="font-semibold text-center w-28">Required Qty</TableHead>
                <TableHead className="font-semibold text-right w-24">Unit Cost</TableHead>
                <TableHead className="font-semibold text-right w-28">Total Cost</TableHead>
                <TableHead className="font-semibold text-right w-12 print:hidden"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculatedItems.length === 0 ? (
                <TableRow>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                    No components added yet. Click "+ Add Component" to add items from inventory.
                  </td>
                </TableRow>
              ) : (
                calculatedItems.map((item, idx) => (
                  <TableRow key={item.inventoryItemId} className="hover:bg-slate-50/20">
                    <td className="text-center font-medium text-xs">{idx + 1}</td>
                    <td className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {item.details?.partNumber || 'N/A'}
                    </td>
                    <td className="text-xs">
                      <p className="font-semibold">{item.details?.name || 'Unknown part'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.details?.category}</p>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input 
                          type="number" 
                          min={1}
                          value={item.quantity} 
                          onChange={(e) => handleUpdateQty(item.inventoryItemId, Number(e.target.value))}
                          className="w-16 h-7 bg-slate-50 dark:bg-slate-900 border rounded text-center text-xs font-bold text-slate-800 dark:text-slate-100 print:border-none print:bg-transparent"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">{item.details?.uom}</span>
                      </div>
                    </td>
                    <td className="text-right text-xs">
                      ₹{item.details?.unitCost.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="text-right text-xs font-bold">
                      ₹{item.totalCost.toLocaleString('en-IN')}
                    </td>
                    <td className="text-right print:hidden">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        onClick={() => handleDeleteItem(item.inventoryItemId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </TableRow>
                ))
              )}
              {/* Cost Subtotal */}
              {calculatedItems.length > 0 && (
                <TableRow className="bg-slate-50 dark:bg-slate-900 font-bold">
                  <td colSpan={5} className="text-right text-xs uppercase pr-4">Total Materials Cost:</td>
                  <td className="text-right text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    ₹{totalMaterialCost.toLocaleString('en-IN')}
                  </td>
                  <td className="print:hidden"></td>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Print only signature fields */}
          <div className="hidden print:flex justify-between items-end mt-16 pt-8 border-t text-xs">
            <div className="text-center w-56 border h-20 relative flex items-end justify-center p-2">
              <span className="absolute top-1 left-2 text-[8px] text-slate-400 uppercase font-bold">Checked By (QA Engineer)</span>
              <span className="text-slate-400">Signature</span>
            </div>
            <div className="text-center w-56 border h-20 relative flex items-end justify-center p-2">
              <span className="absolute top-1 left-2 text-[8px] text-slate-400 uppercase font-bold">Approved By (Production Head)</span>
              <span className="text-slate-400">Signature</span>
            </div>
          </div>
        </div>

        {/* Product meta card */}
        <div className="md:col-span-1 space-y-6 print:hidden">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Product ID</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{product.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Product Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{product.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block mb-0.5">Model Code</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{product.model}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{product.category}</span>
                </div>
              </div>
              <div className="pt-3 border-t">
                <span className="text-slate-400 block mb-0.5">Current Stock in Warehouse</span>
                <Badge variant={product.stock > 0 ? 'secondary' : 'outline'} className="mt-1">
                  {product.stock} units available
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-indigo-500" />
                BOM Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs text-slate-600 dark:text-slate-400 space-y-3">
              <div className="flex gap-2.5">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Approved Status:</strong> Lock the BOM to prevent accidental changes when actively used in work orders.
                </p>
              </div>
              <div className="flex gap-2.5">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Cost Roll-up:</strong> Costs are based on standard purchase rates in inventory. Margin represents basic retail markup over materials.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Component Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleAddComponent}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" /> Add BOM Component
              </DialogTitle>
              <DialogDescription>
                Select raw materials or custom parts from the registered inventory.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 border-b border-t my-3 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-slate-500 uppercase">Select Inventory Item *</label>
                <select 
                  value={selectedItemId} 
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">-- Choose Item --</option>
                  {availableInventory.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.partNumber}) - ₹{inv.unitCost}/{inv.uom}
                    </option>
                  ))}
                  {availableInventory.length === 0 && (
                    <option disabled>No additional items available in inventory</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-500 uppercase">Required Quantity *</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    min="1"
                    placeholder="e.g. 100" 
                    value={addQty} 
                    onChange={e => setAddQty(e.target.value)} 
                    required 
                    className="h-9"
                  />
                  <span className="font-bold text-slate-400">
                    {selectedItemId ? mockInventory.find(i => i.id === selectedItemId)?.uom : ''}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={!selectedItemId}>
                Add to BOM
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
