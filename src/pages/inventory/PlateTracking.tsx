import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Search, Plus, Layers, Shield, FileText, Download } from 'lucide-react';

const mockPlates = [
  { id: '1', plateNo: 'PL-3091', grade: 'IS 2062 Gr B', dimensions: '2500 x 6000 x 16', weight: '1884 kg', heatNo: 'HT-9018', location: 'Rack A-3', status: 'In Stock' },
  { id: '2', plateNo: 'PL-3092', grade: 'SS304', dimensions: '2000 x 6000 x 12', weight: '1130 kg', heatNo: 'HT-9281', location: 'Rack C-1', status: 'In Stock' },
  { id: '3', plateNo: 'PL-3093', grade: 'Hardox 400', dimensions: '1500 x 3000 x 20', weight: '706 kg', heatNo: 'HT-4712', location: 'Rack A-1', status: 'Reserved' },
  { id: '4', plateNo: 'PL-3094', grade: 'IS 2062 Gr B', dimensions: '2500 x 6000 x 25', weight: '2943 kg', heatNo: 'HT-8829', location: 'Cutting Bed 1', status: 'In Cutting' },
  { id: '5', plateNo: 'PL-3095', grade: 'SS316L', dimensions: '1500 x 3000 x 10', weight: '353 kg', heatNo: 'HT-3310', location: 'Rack C-4', status: 'Scrapped' },
];

export default function PlateTracking() {
  const [plates, setPlates] = useState(mockPlates);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [plateNo, setPlateNo] = useState('');
  const [grade, setGrade] = useState('IS 2062 Gr B');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [thickness, setThickness] = useState('');
  const [heatNo, setHeatNo] = useState('');
  const [location, setLocation] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Calculate steel plate weight: Width (m) * Length (m) * Thickness (mm) * 7.85 kg/m2
    const wM = Number(width) / 1000;
    const lM = Number(length) / 1000;
    const th = Number(thickness);
    const weightCalc = Math.round(wM * lM * th * 7.85);

    const newPlate = {
      id: String(plates.length + 1),
      plateNo: plateNo || `PL-${Math.floor(1000 + Math.random() * 9000)}`,
      grade,
      dimensions: `${width} x ${length} x ${thickness}`,
      weight: `${weightCalc} kg`,
      heatNo: heatNo || 'HT-GEN',
      location: location || 'Warehouse yard',
      status: 'In Stock'
    };

    setPlates([newPlate, ...plates]);
    setIsDialogOpen(false);
    // Reset Form
    setPlateNo('');
    setWidth('');
    setLength('');
    setThickness('');
    setHeatNo('');
    setLocation('');
  };

  const filteredPlates = plates.filter(p => 
    p.plateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.heatNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Plate Tracking</h2>
          <p className="text-muted-foreground">Register and track individual raw steel plates by heat number and grade.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Register New Plate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Register Steel Plate</DialogTitle>
              <DialogDescription>
                Log physical plate details received from transport/grn.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plate ID / Number</label>
                  <Input value={plateNo} onChange={e => setPlateNo(e.target.value)} placeholder="PL-4012" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Material Grade</label>
                  <select 
                    value={grade} 
                    onChange={e => setGrade(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="IS 2062 Gr B">IS 2062 Gr B (Mild Steel)</option>
                    <option value="SS304">SS304 (Stainless Steel)</option>
                    <option value="Hardox 400">Hardox 400 (Wear Plate)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width (mm)</label>
                  <Input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="2500" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Length (mm)</label>
                  <Input type="number" value={length} onChange={e => setLength(e.target.value)} placeholder="6000" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thick (mm)</label>
                  <Input type="number" value={thickness} onChange={e => setThickness(e.target.value)} placeholder="16" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Heat Certificate No</label>
                  <Input value={heatNo} onChange={e => setHeatNo(e.target.value)} placeholder="HT-5021" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Storage Location</label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Rack A-4" required />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Plate
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Plates In Stock</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">410 Plates</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Steel Tonnage</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">842.1 Tons</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MTC Certificates Linked</CardTitle>
            <FileText className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">98.2% Traceable</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-medium text-slate-800">Plate Inventory Registry</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search plate or grade..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Export Inventory
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                  <th className="pb-3 text-left">Plate No</th>
                  <th className="pb-3 text-left">Material Grade</th>
                  <th className="pb-3 text-left">Dimensions (W x L x T)</th>
                  <th className="pb-3 text-right">Weight</th>
                  <th className="pb-3 text-left pl-6">Heat No</th>
                  <th className="pb-3 text-left">Storage Location</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {filteredPlates.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-medium text-xs">{p.plateNo}</td>
                    <td className="py-3.5">{p.grade}</td>
                    <td className="py-3.5 text-xs font-mono">{p.dimensions} mm</td>
                    <td className="py-3.5 text-right font-medium">{p.weight}</td>
                    <td className="py-3.5 pl-6 font-mono text-xs">{p.heatNo}</td>
                    <td className="py-3.5">{p.location}</td>
                    <td className="py-3.5 text-center">
                      <Badge variant={p.status === 'In Stock' ? 'default' : p.status === 'Reserved' ? 'secondary' : 'outline'}>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
