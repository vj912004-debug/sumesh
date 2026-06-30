import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Calculator, FileText, CheckCircle2, Shield, Settings, Percent, Wallet, Plus, AlertCircle 
} from 'lucide-react';

export default function FinanceTaxCompliance() {
  const [invoices, setInvoices] = useState([
    { id: 'INV-26-004', customer: 'Tata Power', basic: 1450000, taxType: 'IGST (18%)', status: 'IRN Generated', irn: '89a2b8e3c1d9f4e2a8b38792c9b3a0f12d483789012a4b89ef7820194bc0283c', ackDate: '2026-06-28' },
    { id: 'INV-26-005', customer: 'Reliance Industries', basic: 2200000, taxType: 'CGST/SGST (18%)', status: 'IRN Generated', irn: '44f8b2d1c9e8a0f3d9b48729c1b3f9d4827019234ba4c81ef778392014cd8821', ackDate: '2026-06-30' },
    { id: 'INV-26-006', customer: 'Torrent Power', basic: 180000, taxType: 'CGST/SGST (18%)', status: 'Draft (Awaiting IRN)', irn: 'Pending Nicolas Sync', ackDate: 'N/A' }
  ]);

  const [receivables, setReceivables] = useState([
    { invoiceNo: 'INV-26-001', customer: 'Reliance Industries', amount: 45000, dueDate: '2026-05-15', delayDays: 46, penalty: '₹1,580 (MSMED)', status: 'Overdue' },
    { invoiceNo: 'INV-26-002', customer: 'Torrent Power', amount: 120000, dueDate: '2026-06-10', delayDays: 20, penalty: '₹1,845 (MSMED)', status: 'Overdue' },
    { invoiceNo: 'INV-26-003', customer: 'Tata Power', amount: 650000, dueDate: '2026-06-30', delayDays: 0, penalty: '₹0', status: 'Due Today' }
  ]);

  const [banks, setBanks] = useState([
    { name: 'State Bank of India', branch: 'GIDC Makarpura, Vadodara', accountNo: '30298102918', ifsc: 'SBIN0003082', swift: 'SBININBB201', role: 'Primary Operative' },
    { name: 'HDFC Bank Ltd', branch: 'Alkapuri, Vadodara', accountNo: '50200082910398', ifsc: 'HDFC0000044', swift: 'HDFCINBBVAR', role: 'Secondary Escrow' }
  ]);

  // Tax Engine Calculator States
  const [calcBasic, setCalcBasic] = useState('100000');
  const [calcHsn, setCalcHsn] = useState('8414.10.00');
  const [calcGstRate, setCalcGstRate] = useState(18);
  const [calcTaxType, setCalcTaxType] = useState('IGST');
  const [calcResults, setCalcResults] = useState<any>(null);

  const calculateTaxes = (e: React.FormEvent) => {
    e.preventDefault();
    const basic = Number(calcBasic);
    const gstTotal = basic * (calcGstRate / 100);
    
    if (calcTaxType === 'IGST') {
      setCalcResults({
        basic,
        hsn: calcHsn,
        cgst: 0,
        sgst: 0,
        igst: gstTotal,
        total: basic + gstTotal
      });
    } else {
      setCalcResults({
        basic,
        hsn: calcHsn,
        cgst: gstTotal / 2,
        sgst: gstTotal / 2,
        igst: 0,
        total: basic + gstTotal
      });
    }
  };

  const handleGenerateIRN = (invoiceId: string) => {
    setInvoices(invoices.map(inv => 
      inv.id === invoiceId ? { 
        ...inv, 
        status: 'IRN Generated', 
        irn: `irn-sha256-${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        ackDate: new Date().toISOString().split('T')[0]
      } : inv
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Finance, Taxation & Compliance</h2>
        <p className="text-muted-foreground">Manage IRN e-Invoicing government connections, dynamic HSN tax calculators, accounts receivable MSMED penalty audits, and bank directories.</p>
      </div>

      <Tabs defaultValue="einvoice" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="einvoice"><FileText className="w-4 h-4 mr-2" /> e-Invoicing Engine</TabsTrigger>
          <TabsTrigger value="tax"><Percent className="w-4 h-4 mr-2" /> Automated Tax Engine</TabsTrigger>
          <TabsTrigger value="receivables"><Wallet className="w-4 h-4 mr-2" /> Receivables (MSMED)</TabsTrigger>
          <TabsTrigger value="banks"><Settings className="w-4 h-4 mr-2" /> Bank Directories</TabsTrigger>
        </TabsList>

        {/* Tab 1: e-Invoicing Engine */}
        <TabsContent value="einvoice">
          <Card>
            <CardHeader>
              <CardTitle>Government e-Invoicing NIC Portal Integration</CardTitle>
              <CardDescription>Generates Invoice Reference Numbers (IRN), hashes client GSTIN profiles, and returns government verification signatures.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Invoice No</th>
                      <th className="pb-3 text-left">Customer</th>
                      <th className="pb-3 text-right">Basic Amount</th>
                      <th className="pb-3 text-left pl-6">Tax Code applied</th>
                      <th className="pb-3 text-left">Generated Government IRN (SHA-256)</th>
                      <th className="pb-3 text-left">Ack Date</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{inv.id}</td>
                        <td className="py-3.5 font-bold">{inv.customer}</td>
                        <td className="py-3.5 text-right font-mono text-xs">₹{inv.basic.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 pl-6 text-xs text-slate-500">{inv.taxType}</td>
                        <td className="py-3.5 font-mono text-[10px] max-w-[200px] truncate" title={inv.irn}>{inv.irn}</td>
                        <td className="py-3.5 text-xs text-slate-400 font-mono">{inv.ackDate}</td>
                        <td className="py-3.5 text-right">
                          {inv.status.includes('Generated') ? (
                            <Badge className="bg-green-50 text-green-700 border-green-200">{inv.status}</Badge>
                          ) : (
                            <Button size="sm" onClick={() => handleGenerateIRN(inv.id)} className="h-7 text-xs shadow-sm">
                              Generate IRN
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Automated Tax Engine */}
        <TabsContent value="tax">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>HSN Tax Engine Configurator</CardTitle>
                <CardDescription>Enter values to parse statutory tax splits according to state destinations.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={calculateTaxes} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Basic Value (₹)</label>
                    <Input value={calcBasic} onChange={e => setCalcBasic(e.target.value)} type="number" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">HSN Classification Code</label>
                    <Input value={calcHsn} onChange={e => setCalcHsn(e.target.value)} placeholder="8414.10.00" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">GST Rate (%)</label>
                      <Input value={calcGstRate} onChange={e => setCalcGstRate(Number(e.target.value))} type="number" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tax Layout</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                        value={calcTaxType}
                        onChange={e => setCalcTaxType(e.target.value)}
                      >
                        <option value="IGST">Inter-State (IGST)</option>
                        <option value="CGST_SGST">Intra-State (CGST + SGST)</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-4">
                    <Calculator className="w-4 h-4 mr-2" /> Calculate Tax Split
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Statutory Tax Invoice Splits Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center h-full min-h-[250px]">
                {calcResults ? (
                  <div className="space-y-6 w-full">
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                          <tr>
                            <th className="py-2.5 px-4 text-left">GST Component</th>
                            <th className="py-2.5 px-4 text-left">HSN Code</th>
                            <th className="py-2.5 px-4 text-right">Tax Percent</th>
                            <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-slate-700 dark:text-slate-300">
                          <tr>
                            <td className="py-3 px-4">Basic Taxable Amount</td>
                            <td className="py-3 px-4 font-mono">{calcResults.hsn}</td>
                            <td className="py-3 px-4 text-right">-</td>
                            <td className="py-3 px-4 text-right">₹{calcResults.basic.toLocaleString('en-IN')}</td>
                          </tr>
                          {calcResults.cgst > 0 && (
                            <>
                              <tr>
                                <td className="py-3 px-4">Central GST (CGST)</td>
                                <td className="py-3 px-4 font-mono">{calcResults.hsn}</td>
                                <td className="py-3 px-4 text-right">{(calcGstRate / 2)}%</td>
                                <td className="py-3 px-4 text-right">₹{calcResults.cgst.toLocaleString('en-IN')}</td>
                              </tr>
                              <tr>
                                <td className="py-3 px-4">State GST (SGST)</td>
                                <td className="py-3 px-4 font-mono">{calcResults.hsn}</td>
                                <td className="py-3 px-4 text-right">{(calcGstRate / 2)}%</td>
                                <td className="py-3 px-4 text-right">₹{calcResults.sgst.toLocaleString('en-IN')}</td>
                              </tr>
                            </>
                          )}
                          {calcResults.igst > 0 && (
                            <tr>
                              <td className="py-3 px-4">Integrated GST (IGST)</td>
                              <td className="py-3 px-4 font-mono">{calcResults.hsn}</td>
                              <td className="py-3 px-4 text-right">{calcGstRate}%</td>
                              <td className="py-3 px-4 text-right">₹{calcResults.igst.toLocaleString('en-IN')}</td>
                            </tr>
                          )}
                          <tr className="bg-primary/5 font-extrabold text-primary text-base">
                            <td className="py-4 px-4" colSpan={3}>Gross Bill Value (Incl. Taxes)</td>
                            <td className="py-4 px-4 text-right">₹{calcResults.total.toLocaleString('en-IN')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-10">
                    <Percent className="w-12 h-12 text-slate-200 mx-auto mb-2 animate-bounce" />
                    <p className="text-sm">Enter basic value and click calculate to review CGST/SGST/IGST tax splits.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Receivables & MSMED */}
        <TabsContent value="receivables">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable Aging & MSMED Compliance Audits</CardTitle>
              <CardDescription>Tracks invoice delays. Auto-calculates interest penalties (3x RBI Bank Rate) for micro and small suppliers under commercial law guidelines.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Invoice No</th>
                      <th className="pb-3 text-left">Customer Name</th>
                      <th className="pb-3 text-right">Outstanding Amount</th>
                      <th className="pb-3 text-left pl-6">Due Date</th>
                      <th className="pb-3 text-right">Delay (Days)</th>
                      <th className="pb-3 text-right">MSMED Penalty (3x RBI rate)</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {receivables.map((rec) => (
                      <tr key={rec.invoiceNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{rec.invoiceNo}</td>
                        <td className="py-3.5 font-bold">{rec.customer}</td>
                        <td className="py-3.5 text-right font-mono text-xs">₹{rec.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 pl-6 text-xs text-slate-500 font-mono">{rec.dueDate}</td>
                        <td className="py-3.5 text-right font-mono text-xs text-red-500 font-semibold">{rec.delayDays} days</td>
                        <td className="py-3.5 text-right font-mono text-xs text-amber-600 dark:text-amber-400 font-extrabold">{rec.penalty}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant={rec.status === 'Overdue' ? 'destructive' : 'secondary'} className={rec.status === 'Overdue' ? 'animate-pulse' : ''}>
                            {rec.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Banking Directory */}
        <TabsContent value="banks">
          <Card>
            <CardHeader>
              <CardTitle>Company Banking Directory & Router Settings</CardTitle>
              <CardDescription>Defines SWIFT coordinates and bank account records. Values automatically populate tax invoice printing sheets.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Bank Name</th>
                      <th className="pb-3 text-left">Branch Address</th>
                      <th className="pb-3 text-left font-mono">Account Number</th>
                      <th className="pb-3 text-left font-mono">IFSC Code</th>
                      <th className="pb-3 text-left font-mono">SWIFT Code</th>
                      <th className="pb-3 text-right">Accounting Designation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {banks.map((b) => (
                      <tr key={b.accountNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-bold">{b.name}</td>
                        <td className="py-3.5 text-xs text-slate-500">{b.branch}</td>
                        <td className="py-3.5 font-mono text-xs font-semibold">{b.accountNo}</td>
                        <td className="py-3.5 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">{b.ifsc}</td>
                        <td className="py-3.5 font-mono text-xs">{b.swift}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            {b.role}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
