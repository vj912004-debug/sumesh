import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Plus, Search, List, ChevronRight, Layers, FileText, Activity, AlertTriangle 
} from 'lucide-react';

export default function InventoryControl() {
  const [items, setItems] = useState([
    { code: 'ITM-9021', name: 'Vacuum Pump Booster 300m3', uom: 'Nos', category: 'Electrical Machinery', hsn: '8414.10.00', stock: 12, reorder: 4 },
    { code: 'ITM-9022', name: 'High-Temperature Silicone Gasket', uom: 'Mtrs', category: 'Raw Consumable', hsn: '4016.93.90', stock: 150, reorder: 50 },
    { code: 'ITM-9023', name: 'Mineral Vacuum Oil SP-100', uom: 'Ltrs', category: 'Fluids & Lubricants', hsn: '2710.19.80', stock: 450, reorder: 200 },
    { code: 'ITM-9024', name: 'Flange Weldneck ANSI 600', uom: 'Nos', category: 'Forgings & Rings', hsn: '7307.21.00', stock: 32, reorder: 10 }
  ]);

  const [nestedComponents, setNestedComponents] = useState([
    { id: 'SER-TP-401', parentMachine: 'Transformer Oil Filter 6000LPH (SP-26-1012)', partName: 'Rotary Vane Vacuum Pump', manufacturer: 'Leybold GmbH', serialNo: 'LB-902187-X', warranty: '2027-12-31' },
    { id: 'SER-TP-402', parentMachine: 'Transformer Oil Filter 6000LPH (SP-26-1012)', partName: 'Heater Contactor Relay', manufacturer: 'Schneider Electric', serialNo: 'SE-CON-44', warranty: '2026-10-15' },
    { id: 'SER-TP-403', parentMachine: 'Transformer Oil Filter 10000LPH (SP-26-1013)', partName: 'Positive Displacement Pump', manufacturer: 'Tushaco Pumps', serialNo: 'TSH-7721-P', warranty: '2028-01-31' }
  ]);

  const [fluidLedger, setFluidLedger] = useState([
    { id: 'FL-202', fluidName: 'Mineral Vacuum Oil SP-100', batchNo: 'BCH-26-08', viscosity: '95 cSt', moisture: '12 ppm', acidity: '0.02 mg KOH/g', status: 'Optimal', testDate: '2026-06-30' },
    { id: 'FL-203', fluidName: 'Silicon Heat Transfer Fluid HF-2', batchNo: 'BCH-26-03', viscosity: '48 cSt', moisture: '34 ppm', acidity: '0.08 mg KOH/g', status: 'Warning (High Moisture)', testDate: '2026-06-25' }
  ]);

  // Form States
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemUom, setItemUom] = useState('Nos');
  const [itemCat, setItemCat] = useState('Raw Consumable');
  const [itemHsn, setItemHsn] = useState('');
  const [itemStock, setItemStock] = useState(10);
  const [itemReorder, setItemReorder] = useState(5);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      code: itemCode || `ITM-${Math.floor(1000 + Math.random() * 9000)}`,
      name: itemName,
      uom: itemUom,
      category: itemCat,
      hsn: itemHsn || '8414.00.00',
      stock: Number(itemStock),
      reorder: Number(itemReorder)
    };
    setItems([newItem, ...items]);
    setIsAddItemOpen(false);
    setItemCode('');
    setItemName('');
    setItemHsn('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Inventory Control & Asset Management</h2>
        <p className="text-muted-foreground">Manage parts directory, trace nested components to factory serial keys, and log fluid volatility audits.</p>
      </div>

      <Tabs defaultValue="master" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="master"><List className="w-4 h-4 mr-2" /> Item Master Directory</TabsTrigger>
          <TabsTrigger value="trace"><Layers className="w-4 h-4 mr-2" /> Component Traceability</TabsTrigger>
          <TabsTrigger value="fluids"><Activity className="w-4 h-4 mr-2" /> Fluid Volatility Audits</TabsTrigger>
        </TabsList>

        {/* Tab 1: Item Master */}
        <TabsContent value="master">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Master Parts Directory</CardTitle>
                <CardDescription>HSN registry, Unit of Measure (UOM) configurations, and reorder alerts.</CardDescription>
              </div>
              <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Part Entry</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                  <form onSubmit={handleAddItem}>
                    <DialogHeader>
                      <DialogTitle>Register Master Part</DialogTitle>
                      <DialogDescription>Define statutory HSN codes and inventory UOM boundaries.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Part Code</label>
                          <Input value={itemCode} onChange={e => setItemCode(e.target.value)} placeholder="ITM-9031" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Statutory HSN / SAC Code</label>
                          <Input value={itemHsn} onChange={e => setItemHsn(e.target.value)} placeholder="8414.10.00" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Part Name / Description</label>
                        <Input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Vacuum Booster Pump" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Unit of Measure (UOM)</label>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                            value={itemUom}
                            onChange={e => setItemUom(e.target.value)}
                          >
                            <option value="Nos">Nos (Single unit)</option>
                            <option value="Ltrs">Ltrs (Liquid volume)</option>
                            <option value="Mtrs">Mtrs (Length)</option>
                            <option value="Kgs">Kgs (Weight)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Category</label>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                            value={itemCat}
                            onChange={e => setItemCat(e.target.value)}
                          >
                            <option value="Electrical Machinery">Electrical Machinery</option>
                            <option value="Forgings & Rings">Forgings & Rings</option>
                            <option value="Fluids & Lubricants">Fluids & Lubricants</option>
                            <option value="Raw Consumable">Raw Consumable</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Initial Stock Quantity</label>
                          <Input type="number" value={itemStock} onChange={e => setItemStock(Number(e.target.value))} required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Reorder Alert Trigger</label>
                          <Input type="number" value={itemReorder} onChange={e => setItemReorder(Number(e.target.value))} required />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddItemOpen(false)}>Cancel</Button>
                      <Button type="submit">Register Part</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-zinc-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Part Code</th>
                      <th className="pb-3 text-left">Description</th>
                      <th className="pb-3 text-left">Category</th>
                      <th className="pb-3 text-left">UOM</th>
                      <th className="pb-3 text-left font-mono">HSN Code</th>
                      <th className="pb-3 text-right">Current Stock</th>
                      <th className="pb-3 text-right">Reorder Point</th>
                      <th className="pb-3 text-right">Stock Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-zinc-700 dark:text-zinc-300">
                    {items.map((item) => {
                      const isLow = item.stock <= item.reorder;
                      return (
                        <tr key={item.code} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="py-3 font-semibold text-xs text-primary">{item.code}</td>
                          <td className="py-3 font-medium">{item.name}</td>
                          <td className="py-3 text-xs">{item.category}</td>
                          <td className="py-3 font-mono text-xs">{item.uom}</td>
                          <td className="py-3 font-mono text-xs text-zinc-500">{item.hsn}</td>
                          <td className="py-3 text-right font-semibold font-mono text-xs">{item.stock}</td>
                          <td className="py-3 text-right font-mono text-xs text-zinc-400">{item.reorder}</td>
                          <td className="py-3 text-right">
                            {isLow ? (
                              <Badge variant="destructive" className="text-[10px] animate-pulse">
                                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-green-600 border-green-200">
                                Adequate
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Nested Component Traceability */}
        <TabsContent value="trace">
          <Card>
            <CardHeader>
              <CardTitle>Nested Sub-Component Traceability</CardTitle>
              <CardDescription>Links specific motors, relays, or oil booster pumps to parent machinery serial keys for warranty tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-zinc-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Link ID</th>
                      <th className="pb-3 text-left">Parent Machinery Unit</th>
                      <th className="pb-3 text-left">Sub-Component Part</th>
                      <th className="pb-3 text-left">Original Manufacturer</th>
                      <th className="pb-3 text-left">Manufacturer Serial No</th>
                      <th className="pb-3 text-right">Warranty Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-zinc-700 dark:text-zinc-300">
                    {nestedComponents.map((comp) => (
                      <tr key={comp.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{comp.id}</td>
                        <td className="py-3.5 font-medium">{comp.parentMachine}</td>
                        <td className="py-3.5 font-medium text-zinc-800 dark:text-zinc-200">{comp.partName}</td>
                        <td className="py-3.5">{comp.manufacturer}</td>
                        <td className="py-3.5 font-mono text-xs text-cyan-600 dark:text-cyan-400 font-bold">{comp.serialNo}</td>
                        <td className="py-3.5 text-right font-mono text-xs text-zinc-400">{comp.warranty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Fluids Auditing */}
        <TabsContent value="fluids">
          <Card>
            <CardHeader>
              <CardTitle>Fluid Volatility & Degas Auditing Logs</CardTitle>
              <CardDescription>Monitor viscosity breakdown, moisture counts, and acid levels for testing oil batches.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-zinc-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Audit ID</th>
                      <th className="pb-3 text-left">Audited Fluid Name</th>
                      <th className="pb-3 text-left">Batch No</th>
                      <th className="pb-3 text-right">Measured Viscosity</th>
                      <th className="pb-3 text-right">Moisture Density (PPM)</th>
                      <th className="pb-3 text-right">Neutralization Acidity</th>
                      <th className="pb-3 text-left pl-6">Analysis Date</th>
                      <th className="pb-3 text-right">Status Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-zinc-700 dark:text-zinc-300">
                    {fluidLedger.map((fluid) => (
                      <tr key={fluid.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{fluid.id}</td>
                        <td className="py-3.5 font-medium">{fluid.fluidName}</td>
                        <td className="py-3.5 font-mono text-xs">{fluid.batchNo}</td>
                        <td className="py-3.5 text-right font-mono text-xs">{fluid.viscosity}</td>
                        <td className="py-3.5 text-right font-mono text-xs text-cyan-600 dark:text-cyan-400 font-bold">{fluid.moisture}</td>
                        <td className="py-3.5 text-right font-mono text-xs">{fluid.acidity}</td>
                        <td className="py-3.5 pl-6 text-xs text-zinc-400">{fluid.testDate}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant={fluid.status === 'Optimal' ? 'default' : 'secondary'} className={fluid.status === 'Optimal' ? 'text-green-600 border-green-200' : 'text-teal-600 border-teal-200 bg-teal-50 dark:bg-teal-950/20'}>
                            {fluid.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
