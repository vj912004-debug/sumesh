import { useMemo, useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  Plus, Search, Calendar, RefreshCcw, Printer, ArrowLeftRight, AlertTriangle, CheckCircle,
  Package, BarChart3, RotateCcw,
} from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import {
  getAllRentalStockStatus,
  getAvailableSerials,
  getCustomerRentalReport,
  getNextChallanNo,
  peekNextChallanNo,
  getOverdueReturnReport,
  getRentalItemOptions,
  getRentalStockStatus,
  issueOutwardChallan,
  loadRentalChallans,
  loadRentalItems,
  recordReturn,
  saveRentalItem,
  validateIssueQty,
  type RentalChallan,
  type RentalReturnLog,
} from '@/lib/rentalAssetService';

const RENTAL_CATEGORIES = ['Laptop', 'Projector', 'Equipment', 'Furniture', 'Accessory', 'Other'];
const RETURN_CONDITIONS: RentalReturnLog['condition'][] = ['Good', 'Damaged', 'Under Repair'];

type NewItemRow = {
  rentalItemId: string;
  qty: number;
  serialNos: string[];
};

export default function ReturnableChallan() {
  const [refresh, setRefresh] = useState(0);
  const bump = () => setRefresh(n => n + 1);

  const challans = useMemo(() => loadRentalChallans(), [refresh]);
  const rentalItems = useMemo(() => loadRentalItems(), [refresh]);
  const stockStatus = useMemo(() => getAllRentalStockStatus(), [refresh]);
  const rentalItemOptions = useMemo(() => getRentalItemOptions(), [refresh]);
  const customerRentalReport = useMemo(() => getCustomerRentalReport(), [refresh]);
  const overdueReport = useMemo(() => getOverdueReturnReport(), [refresh]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RentalChallan['status']>('All');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('register');

  const nextChallanNo = useMemo(() => peekNextChallanNo(), [refresh, activeTab]);
  const challanDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Outward form
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerAddress, setNewBuyerAddress] = useState('');
  const [newBuyerGstin, setNewBuyerGstin] = useState('');
  const [newBuyerPhone, setNewBuyerPhone] = useState('');
  const [newExpectedDate, setNewExpectedDate] = useState('');
  const [newPurpose, setNewPurpose] = useState('');
  const [newItems, setNewItems] = useState<NewItemRow[]>([{ rentalItemId: '', qty: 1, serialNos: [] }]);

  // Master form
  const [masterName, setMasterName] = useState('');
  const [masterCategory, setMasterCategory] = useState('Laptop');
  const [masterQty, setMasterQty] = useState('1');
  const [masterUom, setMasterUom] = useState('Nos');
  const [masterSerials, setMasterSerials] = useState('');

  // Return form
  const [returnChallanId, setReturnChallanId] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnCondition, setReturnCondition] = useState<RentalReturnLog['condition']>('Good');
  const [returnRemarks, setReturnRemarks] = useState('');
  const [returnQtys, setReturnQtys] = useState<Record<string, number>>({});

  // Modals
  const [selectedChallan, setSelectedChallan] = useState<RentalChallan | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [modalReturnQtys, setModalReturnQtys] = useState<Record<string, number>>({});
  const [modalReturnCondition, setModalReturnCondition] = useState<RentalReturnLog['condition']>('Good');
  const [modalReturnDate, setModalReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printChallan, setPrintChallan] = useState<RentalChallan | null>(null);

  const openChallanOptions = useMemo(
    () =>
      challans
        .filter(c => c.status !== 'Returned')
        .map(c => ({
          value: c.id,
          label: c.id,
          sublabel: `${c.buyerName} · ${c.items.length} item(s)`,
          searchText: `${c.id} ${c.buyerName}`,
        })),
    [challans]
  );

  const returnChallan = returnChallanId ? challans.find(c => c.id === returnChallanId) : null;

  const totalRDCs = challans.length;
  const pendingRDCs = challans.filter(c => c.status !== 'Returned').length;
  const overdueRDCs = challans.filter(c => {
    if (c.status === 'Returned') return false;
    return c.status === 'Overdue' || isAfter(new Date(), parseISO(c.expectedReturnDate));
  }).length;

  const filteredChallans = challans.filter(c => {
    const matchesSearch =
      c.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.items.some(i => i.description.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && c.status === statusFilter;
  });

  const handleAddItemRow = () => {
    setNewItems([...newItems, { rentalItemId: '', qty: 1, serialNos: [] }]);
  };

  const handleRemoveItemRow = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, patch: Partial<NewItemRow>) => {
    const updated = [...newItems];
    updated[index] = { ...updated[index], ...patch };
    if (patch.rentalItemId !== undefined) {
      updated[index].serialNos = [];
      updated[index].qty = 1;
    }
    setNewItems(updated);
  };

  const toggleSerial = (index: number, serial: string) => {
    const row = newItems[index];
    const has = row.serialNos.includes(serial);
    const next = has ? row.serialNos.filter(s => s !== serial) : [...row.serialNos, serial];
    handleItemChange(index, { serialNos: next, qty: next.length || row.qty });
  };

  const handleIssueOutward = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      for (const row of newItems) {
        if (!row.rentalItemId) throw new Error('Select a rental item for every line.');
        const check = validateIssueQty(row.rentalItemId, row.qty);
        if (!check.ok) throw new Error(check.message);
        const item = rentalItems.find(i => i.id === row.rentalItemId)!;
        if (item.units?.length && row.serialNos.length !== row.qty) {
          throw new Error(`Select ${row.qty} serial number(s) for ${item.name}.`);
        }
      }

      const challan: RentalChallan = {
        id: getNextChallanNo(),
        dateIssued: new Date().toISOString().split('T')[0],
        expectedReturnDate: newExpectedDate,
        buyerName: newBuyerName,
        buyerAddress: newBuyerAddress,
        buyerGstin: newBuyerGstin,
        buyerPhone: newBuyerPhone,
        consigneeName: newBuyerName,
        consigneeAddress: newBuyerAddress,
        purpose: newPurpose,
        jobWorkNo: `RNT-${format(new Date(), 'yy')}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Pending',
        preparedBy: 'store',
        items: newItems.map((row, idx) => {
          const item = rentalItems.find(i => i.id === row.rentalItemId)!;
          return {
            id: String(idx + 1),
            rentalItemId: row.rentalItemId,
            itemCode: item.id,
            description: item.name,
            hsnSac: '997319',
            qtyDispatched: row.qty,
            qtyReturned: 0,
            uom: item.uom,
            serialNos: row.serialNos.length ? row.serialNos : undefined,
          };
        }),
      };

      issueOutwardChallan(challan);
      setNewBuyerName('');
      setNewBuyerAddress('');
      setNewBuyerGstin('');
      setNewBuyerPhone('');
      setNewExpectedDate('');
      setNewPurpose('');
      setNewItems([{ rentalItemId: '', qty: 1, serialNos: [] }]);
      bump();
      setActiveTab('register');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not issue challan.');
    }
  };

  const handleSaveMaster = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const qty = Number(masterQty);
    if (!masterName.trim() || qty <= 0) {
      setError('Item name and total quantity are required.');
      return;
    }
    const serialLines = masterSerials.split('\n').map(s => s.trim()).filter(Boolean);
    saveRentalItem({
      name: masterName.trim(),
      category: masterCategory,
      totalOwnedQty: qty,
      uom: masterUom,
      units: serialLines.length
        ? serialLines.map(sn => ({ serialNo: sn, status: 'available' as const }))
        : undefined,
    });
    setMasterName('');
    setMasterQty('1');
    setMasterSerials('');
    bump();
  };

  const handleReturnTabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnChallanId) return;
    setError(null);
    try {
      recordReturn(returnChallanId, returnDate, returnCondition, returnQtys, returnRemarks);
      setReturnChallanId('');
      setReturnQtys({});
      setReturnRemarks('');
      bump();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Return failed.');
    }
  };

  const handleOpenReturnDialog = (challan: RentalChallan) => {
    setSelectedChallan(challan);
    const initial: Record<string, number> = {};
    challan.items.forEach(item => { initial[item.id] = 0; });
    setModalReturnQtys(initial);
    setModalReturnDate(new Date().toISOString().split('T')[0]);
    setModalReturnCondition('Good');
    setIsReturnModalOpen(true);
  };

  const handleModalReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallan) return;
    setError(null);
    try {
      recordReturn(selectedChallan.id, modalReturnDate, modalReturnCondition, modalReturnQtys);
      setIsReturnModalOpen(false);
      setSelectedChallan(null);
      bump();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Return failed.');
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body, html { background: white !important; margin: 0 !important; overflow: visible !important; }
          aside, header, button, .print\\:hidden { display: none !important; }
          div[data-state="open"] > div:first-child, .bg-black\\/80 { display: none !important; }
          div[role="dialog"] {
            position: absolute !important; top: 0 !important; left: 0 !important;
            transform: none !important; width: 100% !important; max-width: 100% !important;
            border: none !important; box-shadow: none !important; background: transparent !important;
          }
          .print-doc-container { border: none !important; padding: 0 !important; margin: 0 !important; }
          tr { page-break-inside: avoid !important; }
        }
      `}</style>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-800">Rental & Returnable Challan</h2>
          <p className="text-zinc-500 font-medium">
            Maintain rental asset stock and issue returnable delivery challans with real-time availability checks.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto h-7 text-red-700" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Total Issued</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRDCs}</div>
            <p className="text-xs text-zinc-400">Outward returnable challans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Outstanding</CardTitle>
            <RefreshCcw className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{pendingRDCs}</div>
            <p className="text-xs text-zinc-400">Items still out on rent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueRDCs}</div>
            <p className="text-xs text-red-400">Past expected return date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500">Rental SKUs</CardTitle>
            <Package className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{rentalItems.length}</div>
            <p className="text-xs text-zinc-400">Items in rental master</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="master">Rental Master</TabsTrigger>
          <TabsTrigger value="outward">Issue Outward</TabsTrigger>
          <TabsTrigger value="register">Challan Register</TabsTrigger>
          <TabsTrigger value="return">Return Inward</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="master" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Rental Item</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveMaster} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Item Name</label>
                  <Input placeholder="Laptop - Dell Latitude 5540" value={masterName} onChange={e => setMasterName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Category</label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={masterCategory} onChange={e => setMasterCategory(e.target.value)}>
                    {RENTAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Total Owned Qty</label>
                  <Input type="number" min="1" value={masterQty} onChange={e => setMasterQty(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">UOM</label>
                  <Input value={masterUom} onChange={e => setMasterUom(e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium">Serial Nos / Asset Tags (optional, one per line)</label>
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="DL-LAT-001&#10;DL-LAT-002"
                    value={masterSerials}
                    onChange={e => setMasterSerials(e.target.value)}
                  />
                </div>
                <div>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Plus className="h-4 w-4 mr-2" /> Save to Master
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rental Stock (Real-Time)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total Owned</TableHead>
                    <TableHead className="text-right">Out on Rent</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Utilization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockStatus.map(s => (
                    <TableRow key={s.rentalItemId}>
                      <TableCell className="font-medium">{s.itemName}</TableCell>
                      <TableCell>{s.category}</TableCell>
                      <TableCell className="text-right">{s.totalOwned} {s.uom}</TableCell>
                      <TableCell className="text-right text-amber-700">{s.qtyOutOnRent}</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-700">{s.availableQty}</TableCell>
                      <TableCell className="text-right">{s.utilizationPct}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outward" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issue Returnable (Outward) Challan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIssueOutward} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 rounded-lg border border-teal-200 bg-teal-50/40 p-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-600">Challan No. (auto-generated)</label>
                    <Input value={nextChallanNo} readOnly className="font-mono font-semibold bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-600">Challan Date</label>
                    <Input type="date" value={challanDate} readOnly className="bg-white" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Customer Name</label>
                    <Input value={newBuyerName} onChange={e => setNewBuyerName(e.target.value)} placeholder="Customer / Buyer name" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Expected Return Date</label>
                    <Input type="date" value={newExpectedDate} onChange={e => setNewExpectedDate(e.target.value)} required />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-medium">Address</label>
                    <Input value={newBuyerAddress} onChange={e => setNewBuyerAddress(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">GSTIN</label>
                    <Input value={newBuyerGstin} onChange={e => setNewBuyerGstin(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Phone</label>
                    <Input value={newBuyerPhone} onChange={e => setNewBuyerPhone(e.target.value)} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-medium">Purpose</label>
                    <Input value={newPurpose} onChange={e => setNewPurpose(e.target.value)} placeholder="Reason for dispatch" required />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Rental Items to Issue</h4>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddItemRow}>+ Add Line</Button>
                  </div>
                  {newItems.map((row, index) => {
                    const stock = row.rentalItemId ? getRentalStockStatus(row.rentalItemId) : null;
                    const item = row.rentalItemId ? rentalItems.find(i => i.id === row.rentalItemId) : null;
                    const availableSerials = row.rentalItemId ? getAvailableSerials(row.rentalItemId) : [];
                    const exceeds = stock ? row.qty > stock.availableQty : false;

                    return (
                      <div key={index} className="rounded-lg border border-dashed p-3 space-y-3 bg-zinc-50/50">
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-medium text-zinc-600">Rental Item</label>
                            <SearchableSelect
                              options={rentalItemOptions}
                              value={row.rentalItemId}
                              onChange={v => handleItemChange(index, { rentalItemId: v })}
                              placeholder="Search rental item…"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-600">Qty to Issue</label>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={row.qty}
                              onChange={e => handleItemChange(index, { qty: Math.max(1, Number(e.target.value) || 1) })}
                              className={exceeds ? 'border-red-500' : ''}
                            />
                          </div>
                        </div>
                        {stock && (
                          <div className={`text-xs px-2 py-1.5 rounded ${stock.availableQty <= 0 ? 'bg-red-100 text-red-800' : exceeds ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                            {stock.availableQty <= 0
                              ? `All ${stock.totalOwned} units already out on rent — cannot issue.`
                              : exceeds
                                ? `Only ${stock.availableQty} ${stock.uom} available — ${stock.qtyOutOnRent} already on rent.`
                                : `${stock.availableQty} of ${stock.totalOwned} ${stock.uom} available (${stock.qtyOutOnRent} out on rent)`}
                          </div>
                        )}
                        {item?.units?.length ? (
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-600">Select Serial Nos ({row.serialNos.length}/{row.qty})</label>
                            <div className="flex flex-wrap gap-2">
                              {availableSerials.map(u => (
                                <button
                                  key={u.serialNo}
                                  type="button"
                                  onClick={() => toggleSerial(index, u.serialNo)}
                                  className={`text-xs px-2 py-1 rounded border ${row.serialNos.includes(u.serialNo) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-zinc-300'}`}
                                >
                                  {u.serialNo}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {newItems.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => handleRemoveItemRow(index)}>Remove line</Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" /> Issue Returnable Challan
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="mt-4">
          <Card>
            <CardHeader className="border-b pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-lg">Returnable Challan Register</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search buyer, challan, item…"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-9 pr-4 py-1.5 text-sm"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex bg-zinc-100 p-1 rounded-md text-xs">
                    {(['All', 'Pending', 'Partial', 'Returned', 'Overdue'] as const).map(status => (
                      <button
                        key={status}
                        className={`px-3 py-1.5 rounded-md font-medium ${statusFilter === status ? 'bg-white shadow-sm' : 'text-zinc-500'}`}
                        onClick={() => setStatusFilter(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Challan No</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items Out</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChallans.map(challan => {
                    const unitsOut = challan.items.reduce((s, i) => s + (i.qtyDispatched - i.qtyReturned), 0);
                    const isOverdue = challan.status !== 'Returned' && isAfter(new Date(), parseISO(challan.expectedReturnDate));
                    return (
                      <TableRow key={challan.id}>
                        <TableCell className="font-semibold text-teal-600 text-xs">{challan.id}</TableCell>
                        <TableCell>{format(new Date(challan.dateIssued), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{challan.buyerName}</TableCell>
                        <TableCell className="text-xs">
                          {unitsOut.toFixed(0)} unit(s)
                          <div className="text-zinc-400 truncate max-w-[200px]">
                            {challan.items.map(i => i.description).join(', ')}
                          </div>
                        </TableCell>
                        <TableCell className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                          {format(new Date(challan.expectedReturnDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={challan.status === 'Returned' ? 'default' : isOverdue ? 'destructive' : 'outline'}>
                            {isOverdue && challan.status !== 'Returned' ? 'Overdue' : challan.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => { setPrintChallan(challan); setIsPrintModalOpen(true); }}>
                            <Printer className="h-4 w-4" />
                          </Button>
                          {challan.status !== 'Returned' && (
                            <Button size="sm" className="h-8" onClick={() => handleOpenReturnDialog(challan)}>Return</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredChallans.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-zinc-400">No challans found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="return" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RotateCcw className="h-5 w-5" /> Return Challan (Inward)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReturnTabSubmit} className="space-y-4 max-w-2xl">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Reference Outward Challan</label>
                  <SearchableSelect
                    options={openChallanOptions}
                    value={returnChallanId}
                    onChange={id => {
                      setReturnChallanId(id);
                      const c = challans.find(x => x.id === id);
                      const qtys: Record<string, number> = {};
                      c?.items.forEach(i => { qtys[i.id] = 0; });
                      setReturnQtys(qtys);
                    }}
                    placeholder="Select open challan…"
                  />
                </div>
                {returnChallan && (
                  <>
                    <div className="text-sm bg-zinc-50 border rounded p-3">
                      <div><span className="font-medium">Customer:</span> {returnChallan.buyerName}</div>
                      <div><span className="font-medium">Issued:</span> {returnChallan.dateIssued}</div>
                    </div>
                    <div className="space-y-2">
                      {returnChallan.items.map(item => {
                        const max = item.qtyDispatched - item.qtyReturned;
                        if (max <= 0) return null;
                        return (
                          <div key={item.id} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <p className="font-medium text-sm">{item.description}</p>
                              <p className="text-xs text-zinc-500">Outstanding: {max} {item.uom}</p>
                            </div>
                            <Input
                              type="number"
                              min="0"
                              max={max}
                              className="w-24 text-right"
                              value={returnQtys[item.id] || 0}
                              onChange={e => setReturnQtys({ ...returnQtys, [item.id]: Math.min(max, Number(e.target.value) || 0) })}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Return Date</label>
                        <Input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Condition</label>
                        <select className="w-full h-10 rounded-md border px-3 text-sm" value={returnCondition} onChange={e => setReturnCondition(e.target.value as RentalReturnLog['condition'])}>
                          {RETURN_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Remarks</label>
                      <Input value={returnRemarks} onChange={e => setReturnRemarks(e.target.value)} placeholder="Optional condition notes" />
                    </div>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Book Return & Restore Stock</Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Rental Stock Status</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Total Owned</TableHead>
                    <TableHead className="text-right">Out on Rent</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">% Utilization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockStatus.map(s => (
                    <TableRow key={s.rentalItemId}>
                      <TableCell>{s.itemName}</TableCell>
                      <TableCell className="text-right">{s.totalOwned}</TableCell>
                      <TableCell className="text-right">{s.qtyOutOnRent}</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-700">{s.availableQty}</TableCell>
                      <TableCell className="text-right">{s.utilizationPct}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Customer-wise Rental</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty Out</TableHead>
                    <TableHead>Challan</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerRentalReport.map((r, i) => (
                    <TableRow key={`${r.challanNo}-${i}`}>
                      <TableCell>{r.customer}</TableCell>
                      <TableCell>{r.itemName}</TableCell>
                      <TableCell className="text-right">{r.qtyOut}</TableCell>
                      <TableCell className="font-mono text-xs">{r.challanNo}</TableCell>
                      <TableCell>{r.issueDate}</TableCell>
                      <TableCell>{r.expectedReturnDate}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === 'Overdue' ? 'destructive' : 'outline'}>{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {customerRentalReport.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-6 text-zinc-400">No active rentals.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Overdue Returns
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty Out</TableHead>
                    <TableHead>Challan</TableHead>
                    <TableHead>Expected Return</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueReport.map((r, i) => (
                    <TableRow key={`od-${i}`}>
                      <TableCell>{r.customer}</TableCell>
                      <TableCell>{r.itemName}</TableCell>
                      <TableCell className="text-right">{r.qtyOut}</TableCell>
                      <TableCell className="font-mono text-xs">{r.challanNo}</TableCell>
                      <TableCell className="text-red-600 font-medium">{r.expectedReturnDate}</TableCell>
                    </TableRow>
                  ))}
                  {overdueReport.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-zinc-400">No overdue returns.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedChallan && (
            <form onSubmit={handleModalReturnSubmit}>
              <DialogHeader>
                <DialogTitle>Log Material Return</DialogTitle>
                <DialogDescription>Challan {selectedChallan.id} — {selectedChallan.buyerName}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 text-sm">
                {selectedChallan.items.map(item => {
                  const max = item.qtyDispatched - item.qtyReturned;
                  if (max <= 0) return null;
                  return (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-xs text-zinc-500">Outstanding: {max} {item.uom}</p>
                      </div>
                      <Input
                        type="number" min="0" max={max} className="w-20"
                        value={modalReturnQtys[item.id] || 0}
                        onChange={e => setModalReturnQtys({ ...modalReturnQtys, [item.id]: Math.min(max, Number(e.target.value) || 0) })}
                      />
                    </div>
                  );
                })}
                <Input type="date" value={modalReturnDate} onChange={e => setModalReturnDate(e.target.value)} />
                <select className="w-full h-10 rounded-md border px-3 text-sm" value={modalReturnCondition} onChange={e => setModalReturnCondition(e.target.value as RentalReturnLog['condition'])}>
                  {RETURN_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReturnModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-teal-600 text-white">Save Return</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="sm:max-w-[760px] max-h-[95vh] overflow-y-auto p-0">
          {printChallan && (
            <div className="bg-white p-6">
              <div className="flex justify-end gap-2 mb-4 print:hidden">
                <Button variant="outline" size="sm" onClick={() => setIsPrintModalOpen(false)}>Close</Button>
                <Button size="sm" className="bg-teal-600 text-white" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" /> Print
                </Button>
              </div>
              <div className="border border-zinc-800 p-5 text-[11px] print-doc-container">
                <div className="text-center font-bold uppercase border-b py-2 mb-4">RETURNABLE CHALLAN</div>
                <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
                  <div>
                    <p className="font-bold">M/S. {printChallan.buyerName}</p>
                    <p>{printChallan.buyerAddress}</p>
                    <p>GSTIN: {printChallan.buyerGstin}</p>
                  </div>
                  <div className="text-right">
                    <p><strong>Challan No:</strong> {printChallan.id}</p>
                    <p><strong>Date:</strong> {format(new Date(printChallan.dateIssued), 'dd/MM/yyyy')}</p>
                    <p><strong>Expected Return:</strong> {format(new Date(printChallan.expectedReturnDate), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
                <table className="w-full border-collapse border border-zinc-800 text-[10px]">
                  <thead>
                    <tr className="bg-zinc-100">
                      <th className="border border-zinc-800 p-1">#</th>
                      <th className="border border-zinc-800 p-1">Item</th>
                      <th className="border border-zinc-800 p-1">Qty</th>
                      <th className="border border-zinc-800 p-1">UOM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printChallan.items.map((item, i) => (
                      <tr key={item.id}>
                        <td className="border border-zinc-800 p-1 text-center">{i + 1}</td>
                        <td className="border border-zinc-800 p-1">{item.description}</td>
                        <td className="border border-zinc-800 p-1 text-right">{item.qtyDispatched}</td>
                        <td className="border border-zinc-800 p-1">{item.uom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 text-[9px]"><strong>Purpose:</strong> {printChallan.purpose}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
