import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Plus, Search, FileText, CheckCircle, Clock, 
  TrendingUp, Download, Eye, Edit2, AlertCircle 
} from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  actionLabel?: string;
  metrics?: { label: string; value: string; icon: any; color?: string }[];
  tableHeaders?: string[];
  mockData?: any[];
  onActionClick?: () => void;
}

export default function PlaceholderPage({ 
  title, 
  description, 
  actionLabel,
  metrics,
  tableHeaders = ['Reference', 'Date', 'Category', 'Description', 'Status'],
  mockData,
  onActionClick
}: PlaceholderPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const defaultMetrics = metrics || [
    { label: `Total ${title}`, value: '42', icon: FileText, color: 'text-primary' },
    { label: 'Active Tasks', value: '12', icon: Clock, color: 'text-amber-500' },
    { label: 'Completed Today', value: '8', icon: CheckCircle, color: 'text-green-500' },
    { label: 'Monthly Growth', value: '+14.2%', icon: TrendingUp, color: 'text-emerald-500' },
  ];

  const defaultMockData = mockData || [
    { id: '1', ref: 'TXN-9021', date: '2026-06-30', category: 'General', desc: `Sample entry for ${title} records`, status: 'Completed' },
    { id: '2', ref: 'TXN-9022', date: '2026-06-29', category: 'Urgent', desc: 'Awaiting commercial review and verification', status: 'Pending' },
    { id: '3', ref: 'TXN-9023', date: '2026-06-28', category: 'Bulk Order', desc: 'Material logs synchronized from system logs', status: 'In Progress' },
    { id: '4', ref: 'TXN-9024', date: '2026-06-27', category: 'Review', desc: 'Awaiting manager approval token signature', status: 'Draft' },
    { id: '5', ref: 'TXN-9025', date: '2026-06-26', category: 'Archive', desc: 'Historical data migration complete', status: 'Completed' },
  ];

  const [data, setData] = useState<any[]>(defaultMockData);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states for Add/Edit
  const [formRef, setFormRef] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('Pending');

  const openAddModal = () => {
    setFormRef(`TXN-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormCategory('General');
    setFormDesc('');
    setFormStatus('Pending');
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: String(data.length + 1),
      ref: formRef,
      date: formDate,
      category: formCategory,
      desc: formDesc,
      status: formStatus
    };
    setData([newEntry, ...data]);
    setIsAddOpen(false);
    if (onActionClick) {
      onActionClick();
    }
  };

  const openEditModal = (row: any) => {
    setSelectedRow(row);
    setFormRef(row.ref || '');
    setFormDate(row.date || '');
    setFormCategory(row.category || '');
    setFormDesc(row.desc || '');
    setFormStatus(row.status || 'Pending');
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRow) return;
    setData(data.map(item => item.id === selectedRow.id ? {
      ...item,
      ref: formRef,
      date: formDate,
      category: formCategory,
      desc: formDesc,
      status: formStatus
    } : item));
    setIsEditOpen(false);
    setSelectedRow(null);
  };

  const handleExport = () => {
    const headers = tableHeaders.join(',') + '\n';
    const rows = data.map(row => 
      Object.keys(row).filter(key => key !== 'id').map(key => `"${row[key]}"`).join(',')
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Active':
      case 'Approved':
        return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">{status}</Badge>;
      case 'Pending':
      case 'Awaiting':
      case 'QC Pending':
        return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">{status}</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {actionLabel && (
          <Button onClick={openAddModal} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> {actionLabel}
          </Button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-4">
        {defaultMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {m.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${m.color || 'text-slate-400'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{m.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <Card>
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-medium text-slate-800">Operational Log</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
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
                <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  {tableHeaders.map((header, index) => (
                    <th 
                      key={index} 
                      className={`pb-3 text-left ${index === tableHeaders.length - 1 ? 'text-right' : ''}`}
                    >
                      {header}
                    </th>
                  ))}
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      {Object.keys(row).filter(key => key !== 'id').map((key, colIndex) => (
                        <td key={key} className={`py-3.5 ${colIndex === Object.keys(row).length - 2 ? 'text-right font-medium' : ''}`}>
                          {key === 'status' ? getStatusBadge(row[key]) : row[key]}
                        </td>
                      ))}
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-slate-900"
                            onClick={() => {
                              setSelectedRow(row);
                              setIsViewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-slate-900"
                            onClick={() => openEditModal(row)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={tableHeaders.length + 1} className="py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="h-8 w-8 text-slate-300" />
                        <span>No records match your search query.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>View Details</DialogTitle>
            <DialogDescription>Full record details for entry reference.</DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-slate-500">Reference:</span>
                <span className="col-span-2 font-medium">{selectedRow.ref}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-slate-500">Date:</span>
                <span className="col-span-2">{selectedRow.date}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-slate-500">Category:</span>
                <span className="col-span-2">{selectedRow.category}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-slate-500">Description:</span>
                <span className="col-span-2 whitespace-pre-wrap">{selectedRow.desc}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pb-2">
                <span className="font-semibold text-slate-500">Status:</span>
                <span className="col-span-2">{getStatusBadge(selectedRow.status)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>{actionLabel || 'Add Entry'}</DialogTitle>
              <DialogDescription>Create a new ERP operational log entry.</DialogDescription>
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
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Entry</DialogTitle>
              <DialogDescription>Modify the details of this log entry.</DialogDescription>
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
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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

