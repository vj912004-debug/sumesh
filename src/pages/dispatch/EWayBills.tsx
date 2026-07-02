import { useMemo, useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, Truck, Link2, AlertTriangle } from 'lucide-react';

type EwbFilter = 'all' | 'active' | 'partb' | 'expiring';

export default function EWayBills() {
  const [filter, setFilter] = useState<EwbFilter>('all');
  const [toast, setToast] = useState<string | null>(null);

  const ewayBills = [
    { ewbNo: '131000142345', date: '30-Jun-2026', docNo: 'INV-26-1240', customer: 'Tata Power', status: 'Active', validUpto: '10-Jul-2026' },
    { ewbNo: '141000567890', date: '25-Jun-2026', docNo: 'INV-26-1235', customer: 'Reliance Ind.', status: 'Expired', validUpto: '28-Jun-2026' },
    { ewbNo: '151000987654', date: '29-Jun-2026', docNo: 'DC-26-879', customer: 'L&T', status: 'Part-B Pending', validUpto: 'N/A' },
  ];

  const filtered = useMemo(() => {
    if (filter === 'active') return ewayBills.filter(b => b.status === 'Active');
    if (filter === 'partb') return ewayBills.filter(b => b.status === 'Part-B Pending');
    if (filter === 'expiring') return ewayBills.filter(b => b.status === 'Expired');
    return ewayBills;
  }, [filter, ewayBills]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">E-Way Bills</h2>
          <p className="text-muted-foreground">Manage E-Way Bill generation, Part-B updates, and validity tracking.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => notify('3 E-Way bills consolidated into single trip manifest.')}>
            <Link2 className="mr-2 h-4 w-4" /> Consolidate EWB
          </Button>
          <Button onClick={() => notify('New E-Way bill 161000112233 generated for pending dispatch.')}>
            Generate New EWB
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {([
          { key: 'active' as EwbFilter, title: 'Active Bills', value: '12', sub: 'Currently in transit', icon: Truck },
          { key: 'partb' as EwbFilter, title: 'Part-B Pending', value: '4', sub: 'Requires vehicle assignment', icon: AlertTriangle, valueClass: 'text-yellow-500', iconClass: 'text-yellow-500' },
          { key: 'expiring' as EwbFilter, title: 'Expiring Soon', value: '2', sub: 'Within next 24 hours', icon: Map, valueClass: 'text-destructive', iconClass: 'text-destructive' },
        ]).map(card => {
          const Icon = card.icon;
          const isActive = filter === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => { setFilter(card.key); notify(`Filter: ${card.title}`); }}
              className={`rounded-xl border bg-card text-card-foreground shadow-sm text-left p-6 cursor-pointer transition-all hover:shadow-md hover:border-primary/40 ${
                isActive ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''
              }`}
            >
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium">{card.title}</span>
                <Icon className={`h-4 w-4 ${card.iconClass || 'text-muted-foreground'}`} />
              </div>
              <div className={`text-2xl font-bold pt-2 ${card.valueClass || ''}`}>{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </button>
          );
        })}
      </div>

      {filter !== 'all' && (
        <Button variant="ghost" size="sm" onClick={() => { setFilter('all'); notify('Showing all E-Way bills.'); }}>
          Clear filter
        </Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle>E-Way Bill Register</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>EWB No.</TableHead>
                <TableHead>Generated On</TableHead>
                <TableHead>Linked Doc</TableHead>
                <TableHead>Consignee</TableHead>
                <TableHead>Valid Upto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bill) => (
                <TableRow key={bill.ewbNo}>
                  <TableCell className="font-medium">{bill.ewbNo}</TableCell>
                  <TableCell>{bill.date}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline"
                      onClick={() => notify(`Opening document ${bill.docNo}`)}
                    >
                      {bill.docNo}
                    </button>
                  </TableCell>
                  <TableCell>{bill.customer}</TableCell>
                  <TableCell>{bill.validUpto}</TableCell>
                  <TableCell>
                    <Badge variant={
                      bill.status === 'Active' ? 'default' : 
                      bill.status === 'Part-B Pending' ? 'secondary' : 'destructive'
                    }>
                      {bill.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => notify(
                        bill.status === 'Part-B Pending'
                          ? `Part-B updated for EWB ${bill.ewbNo} — vehicle GJ-06-XX-1234 assigned.`
                          : `EWB ${bill.ewbNo} opened for print.`
                      )}
                    >
                      {bill.status === 'Part-B Pending' ? 'Update Part-B' : 'Print / View'}
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
