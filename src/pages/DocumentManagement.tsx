import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, UploadCloud, FolderOpen, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';

interface DocumentItem {
  id: string;
  name: string;
  category: string;
  date: string;
  size: string;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: 'DOC-01', name: 'GA Drawing - 10KLPH Filtration Plant.pdf', category: 'CAD Drawings', date: '15-Jun-2026', size: '2.4 MB' },
    { id: 'DOC-02', name: 'O&M Manual SP Series.pdf', category: 'Manuals', date: '20-May-2026', size: '5.1 MB' },
    { id: 'DOC-03', name: 'MTC - SS Sheet 304 Jindal.pdf', category: 'Test Certificates', date: '28-Jun-2026', size: '1.2 MB' },
    { id: 'DOC-04', name: 'Tata Power PO Copy.pdf', category: 'Customer PO', date: '10-Jun-2026', size: '0.8 MB' },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('CAD Drawings');
  const [size, setSize] = useState('1.5 MB');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: DocumentItem = {
      id: `DOC-0${documents.length + 1}`,
      name: name.endsWith('.pdf') ? name : `${name}.pdf`,
      category,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      size
    };
    setDocuments([newDoc, ...documents]);
    setIsOpen(false);
    setName('');
    setSize('1.5 MB');
  };

  const handleDownload = (docName: string) => {
    const content = `=====================================================
SUMESH PETROLEUM VAULT SECURE DOWNLOAD
=====================================================
Document: ${docName}
Accessed: ${new Date().toLocaleString()}
Integrity SHA-256: d8d7a123f898de1c882837bc9
-----------------------------------------------------
This is a secure prototype simulated file download for:
${docName}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', docName.replace('.pdf', '.txt'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDocCountByCategory = (cat: string) => {
    return documents.filter(d => d.category === cat).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Document Management</h2>
          <p className="text-muted-foreground">Centralized vault for CAD drawings, manuals, MTCs, and order documents.</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4 flex items-center gap-4">
            <FolderOpen className="h-8 w-8" />
            <div>
              <div className="font-bold text-lg">CAD Drawings</div>
              <div className="text-sm opacity-80">{getDocCountByCategory('CAD Drawings') + 40} Files</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <FolderOpen className="h-8 w-8 text-blue-500" />
            <div>
              <div className="font-bold text-lg">O&M Manuals</div>
              <div className="text-sm text-muted-foreground">{getDocCountByCategory('Manuals') + 10} Files</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <FolderOpen className="h-8 w-8 text-green-500" />
            <div>
              <div className="font-bold text-lg">Test Certs (MTC)</div>
              <div className="text-sm text-muted-foreground">{getDocCountByCategory('Test Certificates') + 125} Files</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <FolderOpen className="h-8 w-8 text-orange-500" />
            <div>
              <div className="font-bold text-lg">Order Docs</div>
              <div className="text-sm text-muted-foreground">{getDocCountByCategory('Customer PO') + 80} Files</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Vault Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate max-w-[300px] md:max-w-[450px]" title={doc.name}>
                      {doc.name}
                    </span>
                  </TableCell>
                  <TableCell>{doc.category}</TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.name)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleUpload}>
            <DialogHeader>
              <DialogTitle>Upload Vault Document</DialogTitle>
              <DialogDescription>
                Add design blueprints, manuals, MTC, or PO files into the secure ERP document store.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document File Name</label>
                <Input 
                  placeholder="e.g. GA Drawing - 10KLPH Filtration Plant.pdf" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="CAD Drawings">CAD Drawings</option>
                  <option value="Manuals">Manuals</option>
                  <option value="Test Certificates">Test Certificates (MTC)</option>
                  <option value="Customer PO">Customer PO</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Simulated File Size</label>
                <Input 
                  placeholder="e.g. 2.4 MB" 
                  value={size} 
                  onChange={e => setSize(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Upload File</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

