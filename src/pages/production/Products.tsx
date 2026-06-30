import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/lib/mockData';
import { PackageSearch, Network } from 'lucide-react';

export default function Products() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products & BOM</h2>
          <p className="text-muted-foreground">Manage machine catalog and Engineering Bill of Materials.</p>
        </div>
        <Button>
          <PackageSearch className="mr-2 h-4 w-4" /> New Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Master Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Base Price</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.model}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">₹{product.basePrice.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Network className="mr-2 h-4 w-4" /> View BOM
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
