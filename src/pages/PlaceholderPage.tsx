import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus, Search, Download, Eye, Edit2, AlertCircle, Trash2, X, CheckCircle,
} from 'lucide-react';
import { getModuleProfile, buildSeedRows, generateRef, type MetricFilterKey, type RowFieldKey, type ModuleFormField } from '@/lib/moduleProfiles';

type MetricFilter = MetricFilterKey;

interface PlaceholderPageProps {
  title: string;
  description: string;
  modulePath?: string;
  actionLabel?: string;
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

function storageKey(modulePath: string, title: string) {
  const key = modulePath.replace(/^\//, '').replace(/\//g, '_') || title.replace(/\s+/g, '_').toLowerCase();
  return `sp2_module_${key}`;
}

export default function PlaceholderPage({
  title,
  description,
  modulePath = '',
  actionLabel,
  tableHeaders: tableHeadersProp,
  mockData,
  onActionClick,
}: PlaceholderPageProps) {
  const today = new Date().toISOString().split('T')[0];
  const profile = useMemo(() => getModuleProfile(modulePath || `/${title}`, title), [modulePath, title]);
  const form = profile.form!;
  const tableHeaders = tableHeadersProp ?? profile.tableHeaders;

  const seedData: Row[] = mockData ?? buildSeedRows(profile, title, today, modulePath || `/${title}`);

  const [data, setData] = useState<Row[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey(modulePath, title));
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
  const [formValues, setFormValues] = useState<Record<RowFieldKey, string>>({
    ref: '', date: '', category: '', desc: '', status: '',
  });

  const setField = (key: RowFieldKey, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const emptyForm = (): Record<RowFieldKey, string> => ({
    ref: generateRef(form),
    date: today,
    category: form.defaultCategory,
    desc: '',
    status: form.defaultStatus,
  });

  const rowToForm = (row: Row): Record<RowFieldKey, string> => ({
    ref: row.ref,
    date: row.date,
    category: row.category,
    desc: row.desc,
    status: row.status,
  });

  const formToRow = (values: Record<RowFieldKey, string>, id?: string): Row => ({
    id: id ?? String(Date.now()),
    ref: values.ref,
    date: values.date,
    category: values.category,
    desc: values.desc,
    status: values.status,
  });

  useEffect(() => {
    localStorage.setItem(storageKey(modulePath, title), JSON.stringify(data));
  }, [data, title, modulePath]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const stats = useMemo(() => {
    const { activeStatuses, completedStatus } = profile;
    const active = data.filter(d => activeStatuses.includes(d.status)).length;
    const completedToday = data.filter(d => d.status === completedStatus && d.date === today).length;
    const completed = data.filter(d => d.status === completedStatus).length;
    const growth = data.length > 0 ? Math.round((completed / data.length) * 100) : 0;
    return { total: data.length, active, completedToday, growth };
  }, [data, today, profile]);

  const metricCards: { label: string; value: string; icon: typeof profile.metricIcons[0]; color: string; filter: MetricFilter }[] = [
    { label: profile.metricLabels.all, value: String(stats.total), icon: profile.metricIcons[0], color: profile.metricColors[0], filter: 'all' },
    { label: profile.metricLabels.active, value: String(stats.active), icon: profile.metricIcons[1], color: profile.metricColors[1], filter: 'active' },
    { label: profile.metricLabels.completed, value: String(stats.completedToday), icon: profile.metricIcons[2], color: profile.metricColors[2], filter: 'completed' },
    { label: profile.metricLabels.growth, value: `${stats.growth}%`, icon: profile.metricIcons[3], color: profile.metricColors[3], filter: 'growth' },
  ];

  const filteredData = useMemo(() => {
    const { activeStatuses, completedStatus } = profile;
    let rows = data;
    if (metricFilter === 'active') {
      rows = rows.filter(d => activeStatuses.includes(d.status));
    } else if (metricFilter === 'completed') {
      rows = rows.filter(d => d.status === completedStatus && d.date === today);
    } else if (metricFilter === 'growth') {
      rows = rows.filter(d => d.status === completedStatus);
    }
    if (searchTerm) {
      rows = rows.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return rows;
  }, [data, metricFilter, searchTerm, today, profile]);

  const notify = (msg: string) => setToast(msg);

  const openAddModal = () => {
    setFormValues(emptyForm());
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = formToRow(formValues);
    setData(prev => [newEntry, ...prev]);
    setIsAddOpen(false);
    notify(`${form.fields[0].label} ${formValues.ref} added successfully.`);
    onActionClick?.();
  };

  const openEditModal = (row: Row) => {
    setSelectedRow(row);
    setFormValues(rowToForm(row));
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRow) return;
    const updated = formToRow(formValues, selectedRow.id);
    setData(prev => prev.map(item => item.id === selectedRow.id ? updated : item));
    setIsEditOpen(false);
    setSelectedRow(null);
    notify(`${form.fields[0].label} ${formValues.ref} updated.`);
  };

  const handleDelete = (row: Row) => {
    if (!window.confirm(`Delete ${form.fields[0].label} ${row.ref}?`)) return;
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
      case 'Received':
      case 'Filed':
      case 'Resolved':
      case 'Delivered':
        return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">{status}</Badge>;
      case 'Pending':
      case 'Awaiting':
      case 'QC Pending':
      case 'In Transit':
      case 'Open':
      case 'Pending Filing':
      case 'Pending Approval':
        return <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-50 border-teal-200">{status}</Badge>;
      case 'In Progress':
      case 'Issued':
      case 'Assigned':
        return <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-50 border-teal-200">{status}</Badge>;
      case 'Draft':
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const addLabel = actionLabel ?? `New ${title.split(' ')[0]}`;

  const renderFormField = (field: ModuleFormField) => {
    const value = formValues[field.key];
    if (field.type === 'date') {
      return (
        <Input type="date" value={value} onChange={e => setField(field.key, e.target.value)} required />
      );
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          className="w-full min-h-[88px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={value}
          onChange={e => setField(field.key, e.target.value)}
          placeholder={field.placeholder}
          required
        />
      );
    }
    if (field.type === 'select') {
      return (
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          value={value}
          onChange={e => setField(field.key, e.target.value)}
        >
          {(field.options ?? []).map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    return (
      <Input
        value={value}
        onChange={e => setField(field.key, e.target.value)}
        placeholder={field.placeholder}
        required
      />
    );
  };

  const renderFormFields = () => (
    <div className="space-y-4 py-4">
      {form.fields.map(field => (
        <div key={field.key} className="space-y-2">
          <label className="text-sm font-medium">{field.label}</label>
          {renderFormField(field)}
        </div>
      ))}
    </div>
  );

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
            {profile.logTitle}
            <span className="text-sm font-normal text-muted-foreground ml-2">({filteredData.length} records)</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder={form.searchPlaceholder}
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
            <DialogTitle>{title} Details</DialogTitle>
            <DialogDescription>{form.viewDescription}</DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-4 py-2 text-sm">
              {form.fields.map(field => (
                <div key={field.key} className="grid grid-cols-3 gap-2 border-b pb-2 last:border-0">
                  <span className="font-semibold text-zinc-500">{field.label}:</span>
                  <span className="col-span-2 whitespace-pre-wrap">
                    {field.key === 'status' ? getStatusBadge(selectedRow.status) : selectedRow[field.key]}
                  </span>
                </div>
              ))}
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
              <DialogDescription>{form.addDescription}</DialogDescription>
            </DialogHeader>
            {renderFormFields()}
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
              <DialogTitle>Edit {title}</DialogTitle>
              <DialogDescription>{form.editDescription}</DialogDescription>
            </DialogHeader>
            {renderFormFields()}
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
