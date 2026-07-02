import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus, Search, FileText, CheckCircle, Clock,
  TrendingUp, Download, Eye, Edit2, AlertCircle, Trash2, X,
} from 'lucide-react';

type MetricFilter = 'all' | 'active' | 'completed' | 'growth';

interface PlaceholderPageProps {
  title: string;
  description: string;
  actionLabel?: string;
  metrics?: { label: string; value: string; icon: any; color?: string; filter?: MetricFilter }[];
  tableHeaders?: string[];
  mockData?: any[];
  onActionClick?: () => void;
}

type Row = {
  id: string;
  ref: string;
  date: string;
  category: string;
  desc: string;
  status: string;
};

function storageKey(title: string) {
  return `sp2_module_${title.replace(/\s+/g, '_').toLowerCase()}`;
}

export default function PlaceholderPage({
  title,
  description,
  actionLabel,
  tableHeaders = ['Reference', 'Date', 'Category', 'Description', 'Status'],
  mockData,
  onActionClick,
}: PlaceholderPageProps) {
  const today = new Date().toISOString().split('T')[0];

  const seedData: Row[] = mockData ?? [
    { id: '1', ref: 'TXN-9021', date: today, category: 'General', desc: `Sample entry for ${title}`, status: 'Completed' },
    { id: '2', ref: 'TXN-9022', date: today, category: 'Urgent', desc: 'Awaiting commercial review and verification', status: 'Pending' },
    { id: '3', ref: 'TXN-9023', date: '2026-06-28', category: 'Bulk Order', desc: 'Material logs synchronized from system', status: 'In Progress' },
    { id: '4', ref: 'TXN-9024', date: '2026-06-27', category: 'Review', desc: 'Awaiting manager approval', status: 'Draft' },
    { id: '5', ref: 'TXN-9025', date: '2026-06-26', category: 'Archive', desc: 'Historical data migration complete', status: 'Completed' },
  ];

  const [data, setData] = useState<Row[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey(title));
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return seedData;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formRef, setFormRef] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('Pending');

  useEffect(() => {
    localStorage.setItem(storageKey(title), JSON.stringify(data));
  }, [data, title]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const stats = useMemo(() => {
    const active = data.filter(d => ['Pending', 'In Progress', 'Draft'].includes(d.status)).length;
    const completedToday = data.filter(d => d.status === 'Completed' && d.date === today).length;
    const completed = data.filter(d => d.status === 'Completed').length;
    const growth = data.length > 0 ? Math.round((completed / data.length) * 100) : 0;
    return { total: data.length, active, completedToday, growth };
  }, [data, today]);

  const metricCards = [
    { label: `Total ${title}`, value: String(stats.total), icon: FileText, color: 'text-primary', filter: 'all' as MetricFilter },
    { label: 'Active Tasks', value: String(stats.active), icon: Clock, color: 'text-teal-500', filter: 'active' as MetricFilter },
    { label: 'Completed Today', value: String(stats.completedToday), icon: CheckCircle, color: 'text-green-500', filter: 'completed' as MetricFilter },
    { label: 'Completion Rate', value: `${stats.growth}%`, icon: TrendingUp, color: 'text-emerald-500', filter: 'growth' as MetricFilter },
  ];

  const filteredData = useMemo(() => {
    let rows = data;
    if (metricFilter === 'active') {
      rows = rows.filter(d => ['Pending', 'In Progress', 'Draft'].includes(d.status));
    } else if (metricFilter === 'completed') {
      rows = rows.filter(d => d.status === 'Completed' && d.date === today);
    } else if (metricFilter === 'growth') {
      rows = rows.filter(d => d.status === 'Completed');
    }
    if (searchTerm) {
      rows = rows.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return rows;
  }, [data, metricFilter, searchTerm, today]);

  const notify = (msg: string) => setToast(msg);

  const openAddModal = () => {
    setFormRef(`TXN-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormDate(today);
    setFormCategory('General');
    setFormDesc('');
    setFormStatus('Pending');
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: Row = {
      id: String(Date.now()),
      ref: formRef,
      date: formDate,
      category: formCategory,
      desc: formDesc,
      status: formStatus,
    };
    setData(prev => [newEntry, ...prev]);
    setIsAddOpen(false);
    notify(`Record ${formRef} added successfully.`);
    onActionClick?.();
  };

  const openEditModal = (row: Row) => {
    setSelectedRow(row);
    setFormRef(row.ref);
    setFormDate(row.date);
    setFormCategory(row.category);
    setFormDesc(row.desc);
    setFormStatus(row.status);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRow) return;
    setData(prev => prev.map(item => item.id === selectedRow.id ? {
      ...item,
      ref: formRef,
      date: formDate,
      category: formCategory,
      desc: formDesc,
      status: formStatus,
    } : item));
    setIsEditOpen(false);
    setSelectedRow(null);
    notify(`Record ${formRef} updated.`);
  };

  const handleDelete = (row: Row) => {
    if (!window.confirm(`Delete record ${row.ref}?`)) return;
    setData(prev => prev.filter(item => item.id !== row.id));
    notify(`Record ${row.ref} deleted.`);
  };

  const handleExport = () => {
    const headers = tableHeaders.join(',') + '\n';
    const rows = filteredData.map(row =>
      [row.ref, row.date, row.category, row.desc, row.status].map(v => `"${v}"`).join(',')
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify(`Exported ${filteredData.length} records to CSV.`);
  };

  const handleMetricClick = (filter: MetricFilter, label: string) => {
    setMetricFilter(filter);
    notify(`Showing: ${label}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Active':
      case 'Approved':
        return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">{status}</Badge>;
      case 'Pending':
      case 'Awaiting':
      case 'QC Pending':
        return <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-50 border-teal-200">{status}</Badge>;
      case 'In Progress':
        return <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-50 border-teal-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const addLabel = actionLabel ?? `Add ${title.split(' ')[0]}`;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-zinc-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="ml-2 text-zinc-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button onClick={openAddModal} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> {addLabel}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {metricCards.map(m => {
          const Icon = m.icon;
          const isActive = metricFilter === m.filter;
          return (
            <button
              key={m.filter}
              type="button"
              onClick={() => handleMetricClick(m.filter, m.label)}
              className={`rounded-xl border bg-card text-card-foreground shadow-sm text-left p-6 cursor-pointer transition-all hover:shadow-md hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                isActive ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''
              }`}
            >
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {m.label}
                </span>
                <Icon className={`h-4 w-4 ${m.color || 'text-zinc-400'}`} />
              </div>
              <div className="text-2xl font-bold tracking-tight pt-2">{m.value}</div>
              {isActive && <p className="text-[10px] text-primary mt-1 font-medium">Filter active · click again to keep</p>}
            </button>
          );
        })}
      </div>

      {metricFilter !== 'all' && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Filter: {metricCards.find(m => m.filter === metricFilter)?.label}</Badge>
          <Button variant="ghost" size="sm" onClick={() => { setMetricFilter('all'); notify('Showing all records.'); }}>
            Clear filter
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="border-b border-zinc-100 flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-medium text-zinc-800">
            Operational Log
            <span className="text-sm font-normal text-muted-foreground ml-2">({filteredData.length} records)</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                  {tableHeaders.map((header, index) => (
                    <th key={index} className={`pb-3 text-left ${index === tableHeaders.length - 1 ? 'text-right' : ''}`}>
                      {header}
                    </th>
                  ))}
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-zinc-700">
                {filteredData.length > 0 ? (
                  filteredData.map(row => (
                    <tr
                      key={row.id}
                      className="hover:bg-zinc-50/50 transition-colors cursor-pointer"
                      onClick={() => { setSelectedRow(row); setIsViewOpen(true); }}
                    >
                      <td className="py-3.5 font-medium">{row.ref}</td>
                      <td className="py-3.5">{row.date}</td>
                      <td className="py-3.5">{row.category}</td>
                      <td className="py-3.5">{row.desc}</td>
                      <td className="py-3.5 text-right">{getStatusBadge(row.status)}</td>
                      <td className="py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View"
                            onClick={() => { setSelectedRow(row); setIsViewOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit"
                            onClick={() => openEditModal(row)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-700" title="Delete"
                            onClick={() => handleDelete(row)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={tableHeaders.length + 1} className="py-8 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="h-8 w-8 text-zinc-300" />
                        <span>No records match your filter or search.</span>
                        <Button variant="outline" size="sm" onClick={openAddModal}>
                          <Plus className="h-4 w-4 mr-1" /> Add first record
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>View Details</DialogTitle>
            <DialogDescription>Full record details for entry reference.</DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-zinc-500">Reference:</span>
                <span className="col-span-2 font-medium">{selectedRow.ref}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-zinc-500">Date:</span>
                <span className="col-span-2">{selectedRow.date}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-zinc-500">Category:</span>
                <span className="col-span-2">{selectedRow.category}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-zinc-500">Description:</span>
                <span className="col-span-2 whitespace-pre-wrap">{selectedRow.desc}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pb-2">
                <span className="font-semibold text-zinc-500">Status:</span>
                <span className="col-span-2">{getStatusBadge(selectedRow.status)}</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedRow && (
              <Button variant="outline" onClick={() => { setIsViewOpen(false); openEditModal(selectedRow); }}>
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>{addLabel}</DialogTitle>
              <DialogDescription>Create a new record in {title}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reference</label>
                <Input value={formRef} onChange={e => setFormRef(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input value={formCategory} onChange={e => setFormCategory(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input value={formDesc} onChange={e => setFormDesc(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Entry</DialogTitle>
              <DialogDescription>Modify the details of this record.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reference</label>
                <Input value={formRef} onChange={e => setFormRef(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input value={formCategory} onChange={e => setFormCategory(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input value={formDesc} onChange={e => setFormDesc(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
