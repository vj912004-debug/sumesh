import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getAreaWiseCustomerReport,
  getReportSummary,
  getUniqueStates,
  type CityAreaSummary,
  type StateAreaSummary,
} from '@/lib/customerAreaReport';
import { MapPin, Users, Building2, IndianRupee, ChevronDown, ChevronRight } from 'lucide-react';

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function CityBlock({ city }: { city: CityAreaSummary }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold">{city.city}</span>
          <span className="text-muted-foreground text-sm">· {city.state}</span>
        </div>
        <div className="flex flex-wrap gap-2 justify-end text-xs">
          <Badge variant="secondary">{city.customerCount} customers</Badge>
          <Badge variant="outline">{city.enquiryCount} enquiries</Badge>
          {city.quotationValue > 0 && <Badge variant="outline">{fmt(city.quotationValue)} quoted</Badge>}
        </div>
      </button>
      {open && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Enquiries</TableHead>
              <TableHead className="text-right">Quotes</TableHead>
              <TableHead className="text-right">Quote Value</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {city.customers.map(c => (
              <TableRow key={c.customerId}>
                <TableCell>
                  <div className="font-medium text-sm">{c.customerName}</div>
                  <div className="text-xs text-muted-foreground font-mono">{c.customerId}</div>
                </TableCell>
                <TableCell className="text-sm">
                  <div>{c.contactPerson}</div>
                  <div className="text-xs text-muted-foreground">{c.phone}</div>
                </TableCell>
                <TableCell className="text-right">
                  {c.enquiryCount}
                  {c.openEnquiries > 0 && (
                    <span className="text-xs text-amber-600 block">{c.openEnquiries} open</span>
                  )}
                </TableCell>
                <TableCell className="text-right">{c.quotationCount}</TableCell>
                <TableCell className="text-right">{fmt(c.quotationValue)}</TableCell>
                <TableCell className="text-right">
                  {c.orderCount}
                  {c.orderValue > 0 && <span className="text-xs text-muted-foreground block">{fmt(c.orderValue)}</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Link to={`/master/parties`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function StateSection({ state }: { state: StateAreaSummary }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {state.state}
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge>{state.customerCount} customers</Badge>
            <Badge variant="outline">{state.cityCount} cities</Badge>
            <Badge variant="outline">{state.enquiryCount} enquiries</Badge>
            <Badge variant="secondary">{fmt(state.quotationValue)} quoted</Badge>
            <Badge variant="secondary">{fmt(state.orderValue)} orders</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {state.cities.map(city => (
          <CityBlock key={`${state.state}-${city.city}`} city={city} />
        ))}
      </CardContent>
    </Card>
  );
}

export default function AreaWiseCustomerReport() {
  const [stateFilter, setStateFilter] = useState('');
  const [refresh, setRefresh] = useState(0);

  const allStates = useMemo(() => getAreaWiseCustomerReport(), [refresh]);
  const summary = useMemo(() => getReportSummary(allStates), [allStates]);
  const stateOptions = useMemo(() => getUniqueStates(allStates), [allStates]);

  const filtered = useMemo(
    () => (stateFilter ? allStates.filter(s => s.state === stateFilter) : allStates),
    [allStates, stateFilter]
  );

  const flatCities = useMemo(() => {
    const rows: Array<CityAreaSummary & { rank: number }> = [];
    for (const st of filtered) {
      for (const city of st.cities) {
        rows.push({ ...city, rank: 0 });
      }
    }
    return rows
      .sort((a, b) => b.customerCount - a.customerCount || b.quotationValue - a.quotationValue)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Area-wise Customer Report</h2>
          <p className="text-muted-foreground">
            Customers grouped by state and city — with enquiry, quotation, and order activity per area.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRefresh(n => n + 1)}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary opacity-80" />
            <div>
              <p className="text-2xl font-bold">{summary.totalCustomers}</p>
              <p className="text-xs text-muted-foreground">Total customers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{summary.totalStates}</p>
            <p className="text-xs text-muted-foreground">States / regions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{summary.totalCities}</p>
            <p className="text-xs text-muted-foreground">Cities / areas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <IndianRupee className="h-8 w-8 text-emerald-600 opacity-80" />
            <div>
              <p className="text-2xl font-bold text-sm">{fmt(summary.totalQuotationValue)}</p>
              <p className="text-xs text-muted-foreground">Quotation value</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-sm">{fmt(summary.totalOrderValue)}</p>
            <p className="text-xs text-muted-foreground">Order value</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium">Filter by State</label>
        <select
          className="flex h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[180px]"
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
        >
          <option value="">All states</option>
          {stateOptions.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="by-state" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-state">By State &amp; City</TabsTrigger>
          <TabsTrigger value="city-rank">City Ranking</TabsTrigger>
          <TabsTrigger value="customer-list">Customer List</TabsTrigger>
        </TabsList>

        <TabsContent value="by-state" className="space-y-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No customers in master — add customers under Client &amp; Party Master.
              </CardContent>
            </Card>
          ) : (
            filtered.map(st => <StateSection key={st.state} state={st} />)
          )}
        </TabsContent>

        <TabsContent value="city-rank">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Areas by Customer Count</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead className="text-right">Customers</TableHead>
                    <TableHead className="text-right">Enquiries</TableHead>
                    <TableHead className="text-right">Quote Value</TableHead>
                    <TableHead className="text-right">Order Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flatCities.map(row => (
                    <TableRow key={`${row.state}-${row.city}`}>
                      <TableCell className="text-muted-foreground">{row.rank}</TableCell>
                      <TableCell className="font-medium">{row.city}</TableCell>
                      <TableCell>{row.state}</TableCell>
                      <TableCell className="text-right font-semibold">{row.customerCount}</TableCell>
                      <TableCell className="text-right">{row.enquiryCount}</TableCell>
                      <TableCell className="text-right">{fmt(row.quotationValue)}</TableCell>
                      <TableCell className="text-right">{fmt(row.orderValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer-list">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Customers — Area Wise</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Enquiries</TableHead>
                    <TableHead className="text-right">Quote Value</TableHead>
                    <TableHead className="text-right">Order Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.flatMap(st =>
                    st.cities.flatMap(c =>
                      c.customers.map(cust => (
                        <TableRow key={cust.customerId}>
                          <TableCell className="font-medium text-sm">{cust.customerName}</TableCell>
                          <TableCell>{cust.city}</TableCell>
                          <TableCell>{cust.state}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{cust.contactPerson}</TableCell>
                          <TableCell className="text-right">{cust.enquiryCount}</TableCell>
                          <TableCell className="text-right">{fmt(cust.quotationValue)}</TableCell>
                          <TableCell className="text-right">{fmt(cust.orderValue)}</TableCell>
                        </TableRow>
                      ))
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
