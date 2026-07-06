import { useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, Package, AlertTriangle, Pencil } from 'lucide-react';
import {
  getItemMasterStats,
  ITEM_CATEGORIES,
  ITEM_UOMS,
  loadItemMaster,
  saveItemMasterItem,
  searchItemMaster,
  type ItemMasterRecord,
} from '@/lib/itemMasterService';
import type { InventoryItem } from '@/lib/mockData2';

const emptyForm = (): Omit<ItemMasterRecord, 'id'> => ({
  partNumber: '',
  name: '',
  category: 'Component',
  stockMain: 0,
  stockSubcon: 0,
  uom: 'Nos',
  reorderLevel: 0,
  unitCost: 0,
  hsnSac: '',
  description: '',
  status: 'Active',
});

export default function ItemMaster() {
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ItemMasterRecord | null>(null);
  const [form, setForm] = useState(emptyForm());

  const items = useMemo(
    () => searchItemMaster(search, categoryFilter),
    [search, categoryFilter, refresh]
  );
  const stats = useMemo(() => getItemMasterStats(), [refresh]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (item: ItemMasterRecord) => {
    setEditing(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.partNumber.trim() || !form.name.trim()) return;
    saveItemMasterItem(editing ? { ...form, id: editing.id } : form);
    setDialogOpen(false);
    setRefresh(n => n + 1);
  };

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Item Master</h2>
          <p className="text-muted-foreground">
            Central registry of parts, materials, and components — used in BOM, quotations, purchase, and material issue.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between">
            <CardTitle className="text-sm text-zinc-500">Total Items</CardTitle>
            <Package className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between">
            <CardTitle className="text-sm text-zinc-500">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.lowStock}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                className="pl-9"
                placeholder="Search by code, name, HSN…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="All">All categories</option>
              {ITEM_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Part No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>HSN/SAC</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Reorder</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => {
                const stock = item.stockMain + item.stockSubcon;
                const low = stock <= item.reorderLevel;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs text-teal-700">{item.id}</TableCell>
                    <TableCell className="font-mono text-xs font-medium">{item.partNumber}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500">{item.hsnSac ?? '—'}</TableCell>
                    <TableCell>{item.uom}</TableCell>
                    <TableCell className={`text-right font-semibold ${low ? 'text-amber-600' : ''}`}>
                      {stock.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right text-zinc-500">{item.reorderLevel}</TableCell>
                    <TableCell className="text-right">₹{item.unitCost.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Inactive' ? 'secondary' : 'default'}>
                        {item.status ?? 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-zinc-400">
                    No items match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Item' : 'Add Item'}</DialogTitle>
              <DialogDescription>
                Register item for BOM, quotations, purchase bills, and store transactions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Part Number / Item Code</label>
                  <Input
                    value={form.partNumber}
                    onChange={e => setField('partNumber', e.target.value)}
                    placeholder="MS-PL-10MM"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">HSN / SAC</label>
                  <Input
                    value={form.hsnSac ?? ''}
                    onChange={e => setField('hsnSac', e.target.value)}
                    placeholder="8414.10.00"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Item Name</label>
                <Input
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="MS Plate 10mm IS2062"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Description (optional)</label>
                <Input
                  value={form.description ?? ''}
                  onChange={e => setField('description', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="w-full h-10 rounded-md border px-3 text-sm"
                    value={form.category}
                    onChange={e => setField('category', e.target.value as InventoryItem['category'])}
                  >
                    {ITEM_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">UOM</label>
                  <select
                    className="w-full h-10 rounded-md border px-3 text-sm"
                    value={form.uom}
                    onChange={e => setField('uom', e.target.value)}
                  >
                    {ITEM_UOMS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Main Stock</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.stockMain}
                    onChange={e => setField('stockMain', Number(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Subcon Stock</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.stockSubcon}
                    onChange={e => setField('stockSubcon', Number(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Reorder Level</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.reorderLevel}
                    onChange={e => setField('reorderLevel', Number(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Unit Cost (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unitCost}
                    onChange={e => setField('unitCost', Number(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="w-full h-10 rounded-md border px-3 text-sm"
                    value={form.status ?? 'Active'}
                    onChange={e => setField('status', e.target.value as 'Active' | 'Inactive')}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Save Changes' : 'Add Item'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
