import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnquiryTypeBadge } from '@/components/sales/EnquiryTypeBadge';
import {
  getPendingClientPoSummary,
  type ClientPoCategory,
  type PendingClientPoRow,
} from '@/lib/pendingClientPo';
import { Factory, Package, Wrench, Clock, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function PendingPoTable({ rows }: { rows: PendingClientPoRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-10 text-sm">
        No pending client PO in this category.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Quotation</TableHead>
          <TableHead>Enquiry</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Days Pending</TableHead>
          <TableHead>Quote Status</TableHead>
          <TableHead>Requirements</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(row => (
          <TableRow key={row.quotationId} className="bg-amber-50/30">
            <TableCell className="font-mono text-xs font-medium">
              <Link to={`/quotations/${row.quotationId}`} className="text-primary hover:underline">
                {row.quotationId}
              </Link>
            </TableCell>
            <TableCell className="text-xs">
              {row.enquiryId !== '—' ? (
                <Link to={`/enquiries/${row.enquiryId}`} className="text-primary hover:underline">
                  {row.enquiryId}
                </Link>
              ) : '—'}
            </TableCell>
            <TableCell className="text-sm">{row.customerName}</TableCell>
            <TableCell className="text-xs">{format(new Date(row.quotationDate), 'dd MMM yyyy')}</TableCell>
            <TableCell className="text-right font-medium">{fmt(row.totalAmount)}</TableCell>
            <TableCell className="text-right">
              <Badge variant={row.daysPending > 14 ? 'destructive' : 'secondary'} className="gap-1">
                <Clock className="h-3 w-3" />
                {row.daysPending}d
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{row.quotationStatus}</Badge>
            </TableCell>
            <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground" title={row.requirements}>
              {row.requirements}
            </TableCell>
            <TableCell className="text-right">
              <Link to={`/quotations/${row.quotationId}`}>
                <Button size="sm" variant="outline">Award PO</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const TAB_CONFIG: Array<{
  value: ClientPoCategory;
  label: string;
  icon: typeof Factory;
  description: string;
}> = [
  {
    value: 'manufacturing',
    label: 'Manufacturing PO',
    icon: Factory,
    description: 'Plant / machine supply quotations awaiting client purchase order',
  },
  {
    value: 'spares',
    label: 'Spares PO',
    icon: Package,
    description: 'Spare parts quotations awaiting client PO',
  },
  {
    value: 'service',
    label: 'Service PO',
    icon: Wrench,
    description: 'Service & AMC quotations awaiting client PO',
  },
];

export default function PendingClientPo() {
  const [refresh, setRefresh] = useState(0);
  const summary = useMemo(() => getPendingClientPoSummary(), [refresh]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pending Client PO</h2>
          <p className="text-muted-foreground">
            Quotations sent or accepted — waiting for client PO. Grouped by Manufacturing, Spares, and Service.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRefresh(n => n + 1)}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {TAB_CONFIG.map(tab => {
          const count = summary[tab.value].length;
          const value = summary[tab.value].reduce((s, r) => s + r.totalAmount, 0);
          const Icon = tab.icon;
          return (
            <Card key={tab.value}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Icon className="h-8 w-8 text-primary opacity-70 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{tab.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground mt-1">{fmt(value)} pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="pt-6 flex items-center gap-3">
            <IndianRupee className="h-8 w-8 text-amber-700 opacity-80" />
            <div>
              <p className="text-sm font-medium text-amber-900">Total Pending</p>
              <p className="text-2xl font-bold text-amber-900">{summary.total}</p>
              <p className="text-xs text-amber-800">{fmt(summary.totalValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manufacturing" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          {TAB_CONFIG.map(tab => {
            const Icon = tab.icon;
            const count = summary[tab.value].length;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                <Icon className="h-4 w-4" />
                {tab.label}
                {count > 0 && (
                  <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-amber-500 text-white border-0">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TAB_CONFIG.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label} — Awaiting Client PO
                </CardTitle>
                <p className="text-sm text-muted-foreground">{tab.description}</p>
              </CardHeader>
              <CardContent>
                {summary[tab.value].length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {summary[tab.value].map(row => (
                      <div key={row.quotationId} className="text-xs flex items-center gap-2 border rounded-md px-2 py-1">
                        <EnquiryTypeBadge type={row.enquiryType} />
                        <span className="text-muted-foreground">{row.quotationId}</span>
                      </div>
                    ))}
                  </div>
                )}
                <PendingPoTable rows={summary[tab.value]} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
