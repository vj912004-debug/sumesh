import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockInventory } from '@/lib/mockData2';
import { ArrowUpDown, Search } from 'lucide-react';

export default function Inventory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">Manage raw materials, components, and finished goods stock.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ArrowUpDown className="mr-2 h-4 w-4" /> Stock Transfer
          </Button>
          <Button>Material Receipt (GRN)</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Current Stock</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search part number..."
                className="w-full bg-background pl-8 border rounded-md h-9 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Number</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location / Bin</TableHead>
                <TableHead>Batch / Lot</TableHead>
                <TableHead className="text-right">Main Factory</TableHead>
                <TableHead className="text-right">Subcon Yard</TableHead>
                <TableHead className="text-right">Total Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInventory.map((item, idx) => {
                const totalStock = item.stockMain + item.stockSubcon;
                const isLowStock = totalStock <= item.reorderLevel;
                const location = idx % 2 === 0 ? 'WH-1 (A-12)' : 'WH-2 (B-05)';
                const batch = idx % 2 === 0 ? 'B-2606' : 'N/A';
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.partNumber}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{location}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{batch}</TableCell>
                    <TableCell className="text-right">{item.stockMain} {item.uom}</TableCell>
                    <TableCell className="text-right">{item.stockSubcon} {item.uom}</TableCell>
                    <TableCell className={`text-right font-bold ${isLowStock ? 'text-destructive' : ''}`}>
                      {totalStock} {item.uom}
                    </TableCell>
                    <TableCell className="text-center">
                      {isLowStock ? (
                        <Badge variant="destructive">Reorder</Badge>
                      ) : (
                        <Badge variant="secondary">Adequate</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
