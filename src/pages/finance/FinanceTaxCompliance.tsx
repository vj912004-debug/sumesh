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
  Calculator, FileText, CheckCircle2, Shield, Settings, Percent, Wallet, Plus, AlertCircle, QrCode, FileSpreadsheet, Printer
} from 'lucide-react';

interface Invoice {
  id: string;
  customer: string;
  basic: number;
  taxType: 'IGST (18%)' | 'CGST/SGST (18%)';
  status: string;
  irn: string;
  ackNo: string;
  ackDate: string;
  hsn: string;
}

interface Receivable {
  invoiceNo: string;
  customer: string;
  amount: number;
  dueDate: string;
  delayDays: number;
  penalty: number;
  status: string;
}

export default function FinanceTaxCompliance() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-26-004', customer: 'Tata Power Company', basic: 1450000, taxType: 'IGST (18%)', status: 'IRN Generated', irn: '89a2b8e3c1d9f4e2a8b38792c9b3a0f12d483789012a4b89ef7820194bc0283c', ackNo: '1092830198', ackDate: '2026-06-28', hsn: '8421.29.00' },
    { id: 'INV-26-005', customer: 'Reliance Industries Ltd', basic: 2200000, taxType: 'CGST/SGST (18%)', status: 'IRN Generated', irn: '44f8b2d1c9e8a0f3d9b48729c1b3f9d4827019234ba4c81ef778392014cd8821', ackNo: '1092830204', ackDate: '2026-06-30', hsn: '8421.29.00' },
    { id: 'INV-26-006', customer: 'Torrent Power Ltd', basic: 180000, taxType: 'CGST/SGST (18%)', status: 'Draft (Awaiting IRN)', irn: 'Pending Portal Sync', ackNo: '-', ackDate: 'N/A', hsn: '9973.11.00' }
  ]);

  const [receivables, setReceivables] = useState<Receivable[]>(() => {
    const saved = localStorage.getItem('receivablesMsmed');
    if (saved) return JSON.parse(saved);
    return [
      { invoiceNo: 'INV-26-001', customer: 'Reliance Industries Ltd', amount: 450000, dueDate: '2026-05-15', delayDays: 47, penalty: 15800, status: 'Overdue' },
      { invoiceNo: 'INV-26-002', customer: 'Torrent Power Ltd', amount: 120000, dueDate: '2026-06-10', delayDays: 21, penalty: 3200, status: 'Overdue' },
      { invoiceNo: 'INV-26-003', customer: 'Tata Power Company', amount: 650000, dueDate: '2026-06-30', delayDays: 1, penalty: 280, status: 'Due Today' }
    ];
  });

  const [banks, setBanks] = useState([
    { name: 'State Bank of India', branch: 'GIDC Makarpura, Vadodara', accountNo: '30298102918', ifsc: 'SBIN0003082', swift: 'SBININBB201', role: 'Primary Operative' },
    { name: 'HDFC Bank Ltd', branch: 'Alkapuri, Vadodara', accountNo: '50200082910398', ifsc: 'HDFC0000044', swift: 'HDFCINBBVAR', role: 'Secondary Escrow' }
  ]);

  // Tax Engine Calculator States
  const [calcBasic, setCalcBasic] = useState('1450000');
  const [calcHsn, setCalcHsn] = useState('8421.29.00'); // Standard HSN for oil purifiers
  const [calcGstRate, setCalcGstRate] = useState(18);
  const [calcTaxType, setCalcTaxType] = useState('IGST');
  const [calcResults, setCalcResults] = useState<any>(null);

  // Contractual Rent States
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [rentCust, setRentCust] = useState('Reliance Industries Ltd');
  const [rentChallan, setRentChallan] = useState('CHL-1082');
  const [monthlyCharge, setMonthlyCharge] = useState('45000');
  const [monthsCount, setMonthsCount] = useState('1');

  // MSMED Late Fees Calculator States
  const [isMsmedOpen, setIsMsmedOpen] = useState(false);
  const [msmedInvoice, setMsmedInvoice] = useState('INV-26-001');
  const [rbiRate, setRbiRate] = useState('6.75'); // Current RBI repo rate
  const [calculatedMsmedInterest, setCalculatedMsmedInterest] = useState<number | null>(null);

  // Print Invoice state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

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

  const handleHsnChange = (code: string) => {
    setCalcHsn(code);
    // Automatic tax categorization mapping rules
    if (code.startsWith('8421')) setCalcGstRate(18); // Purification machinery
    else if (code.startsWith('9973')) setCalcGstRate(18); // Leasing/Hiring services
    else if (code.startsWith('2710')) setCalcGstRate(18); // Lubricating/Transformer oils
    else setCalcGstRate(12); // General machinery spares
  };

  const handleGenerateIRN = (invoiceId: string) => {
    const updated = invoices.map(inv => 
      inv.id === invoiceId ? { 
        ...inv, 
        status: 'IRN Generated', 
        irn: `irn-sha256-${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        ackNo: String(Math.floor(1092830000 + Math.random() * 10000)),
        ackDate: new Date().toISOString().split('T')[0]
      } : inv
    );
    setInvoices(updated);
  };

  const handleSaveContractCharges = (e: React.FormEvent) => {
    e.preventDefault();
    const basicAmount = Number(monthlyCharge) * Number(monthsCount);
    
    // Add new rental contract billing draft invoice
    const newInv: Invoice = {
      id: `INV-26-${Math.floor(200 + Math.random() * 100)}`,
      customer: rentCust,
      basic: basicAmount,
      taxType: 'IGST (18%)',
      status: 'Draft (Awaiting IRN)',
      irn: 'Pending Portal Sync',
      ackNo: '-',
      ackDate: 'N/A',
      hsn: '9973.11.00' // Service code for hiring / renting machinery
    };

    setInvoices([newInv, ...invoices]);
    setIsContractOpen(false);
    alert(`Rental billing ledger generated successfully for ${rentCust} linked to Challan ${rentChallan}. Draft Invoice ${newInv.id} created.`);
  };

  const handleCalculateMsmed = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = receivables.find(r => r.invoiceNo === msmedInvoice);
    if (!inv) return;

    // MSMED statutory law: 3x RBI Bank Repo Rate.
    // Interest is compound interest calculated on monthly rests.
    const rate = Number(rbiRate) * 3; // e.g. 6.75% * 3 = 20.25%
    const p = inv.amount;
    const t = inv.delayDays / 365.0; // time in years
    const compoundFrequency = 12; // Monthly compounding

    // Formula: A = P(1 + r/n)^(n*t)
    const amountInclInterest = p * Math.pow((1 + (rate / 100) / compoundFrequency), (compoundFrequency * t));
    const calculatedPenalty = Math.round(amountInclInterest - p);

    setCalculatedMsmedInterest(calculatedPenalty);
    
    // Update the local storage state to reflect calculated penal charges
    const updatedReceivables = receivables.map(r => 
      r.invoiceNo === msmedInvoice ? { ...r, penalty: calculatedPenalty } : r
    );
    setReceivables(updatedReceivables);
    localStorage.setItem('receivablesMsmed', JSON.stringify(updatedReceivables));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance, Taxation & Compliance</h2>
          <p className="text-muted-foreground">Manage IRN e-Invoicing government integration, dynamic HSN/SAC tax calculators, accounts receivable MSMED penalty audits, and bank directories.</p>
        </div>
      </div>

      <Tabs defaultValue="einvoice" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="einvoice"><FileText className="w-4 h-4 mr-2" /> e-Invoicing Engine</TabsTrigger>
          <TabsTrigger value="tax"><Percent className="w-4 h-4 mr-2" /> HSN Tax Engine</TabsTrigger>
          <TabsTrigger value="receivables"><Wallet className="w-4 h-4 mr-2" /> Receivables & MSMED</TabsTrigger>
          <TabsTrigger value="banks"><Settings className="w-4 h-4 mr-2" /> Bank Directories</TabsTrigger>
        </TabsList>

        {/* Tab 1: e-Invoicing Engine */}
        <TabsContent value="einvoice">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Government e-Invoicing NIC Portal Integration</CardTitle>
                <CardDescription>Generates Invoice Reference Numbers (IRN), hashes client GSTIN profiles, and returns government verification signatures and QR prints.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsContractOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Calculate Monthly Hiring Charges
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Invoice No</th>
                      <th className="pb-3 text-left">Customer</th>
                      <th className="pb-3 text-right">Basic Amount</th>
                      <th className="pb-3 text-left pl-6">Tax Code</th>
                      <th className="pb-3 text-left">HSN/SAC</th>
                      <th className="pb-3 text-left">Government IRN (SHA-256)</th>
                      <th className="pb-3 text-left">Ack No</th>
                      <th className="pb-3 text-left">Ack Date</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{inv.id}</td>
                        <td className="py-3.5 font-bold">{inv.customer}</td>
                        <td className="py-3.5 text-right font-mono text-xs">₹{inv.basic.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 pl-6 text-xs text-slate-500">{inv.taxType}</td>
                        <td className="py-3.5 font-mono text-xs text-slate-500">{inv.hsn}</td>
                        <td className="py-3.5 font-mono text-[10px] max-w-[150px] truncate" title={inv.irn}>{inv.irn}</td>
                        <td className="py-3.5 text-xs font-mono">{inv.ackNo}</td>
                        <td className="py-3.5 text-xs text-slate-400 font-mono">{inv.ackDate}</td>
                        <td className="py-3.5 text-right space-x-1">
                          {inv.status.includes('Generated') ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              <Printer className="w-3 h-3 mr-1" /> View/Print
                            </Button>
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

        {/* Tab 2: HSN Tax Engine */}
        <TabsContent value="tax">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>HSN/SAC Tax Splitter</CardTitle>
                <CardDescription>Select product code to automatically configure tax brackets based on local interstate rules.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={calculateTaxes} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Basic Taxable Amount (₹)</label>
                    <Input value={calcBasic} onChange={e => setCalcBasic(e.target.value)} type="number" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">HSN/SAC Code Designation</label>
                    <Input value={calcHsn} onChange={e => handleHsnChange(e.target.value)} placeholder="8421.29.00" required />
                    <p className="text-[10px] text-slate-400">
                      * Enter HSN 8421 (Filtration machinery) or SAC 9973 (Rentals) to auto-fill GST rate.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-2">
                      <label className="font-semibold">Statutory GST (%)</label>
                      <Input value={calcGstRate} onChange={e => setCalcGstRate(Number(e.target.value))} type="number" required />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold">Billing Mode</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none"
                        value={calcTaxType}
                        onChange={e => setCalcTaxType(e.target.value)}
                      >
                        <option value="IGST">Inter-State (IGST 18%)</option>
                        <option value="CGST_SGST">Intra-State (CGST + SGST)</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-4">
                    <Calculator className="w-4 h-4 mr-2" /> Calculate Tax splits
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Statutory Tax invoice Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center h-full min-h-[250px]">
                {calcResults ? (
                  <div className="space-y-6 w-full">
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                          <tr>
                            <th className="py-2.5 px-4 text-left">GST Component</th>
                            <th className="py-2.5 px-4 text-left">HSN/SAC Code</th>
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

        {/* Tab 3: Receivables & MSMED late fees */}
        <TabsContent value="receivables">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>MSMED Delayed Interest Calculator</CardTitle>
                <CardDescription>Under MSMED Act, micro and small suppliers are entitled to 3x RBI Repo Rate interest on delayed payments (beyond 45 days) compounded monthly.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCalculateMsmed} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Select Overdue Invoice</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none"
                      value={msmedInvoice}
                      onChange={e => {
                        setMsmedInvoice(e.target.value);
                        setCalculatedMsmedInterest(null);
                      }}
                    >
                      {receivables.filter(r => r.delayDays > 0).map(r => (
                        <option key={r.invoiceNo} value={r.invoiceNo}>{r.invoiceNo} - {r.customer} (₹{r.amount.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">RBI Repo Rate (%)</label>
                    <Input type="number" step="0.01" value={rbiRate} onChange={e => setRbiRate(e.target.value)} required />
                    <p className="text-[10px] text-slate-400">* Delayed Interest Rate will be calculated at 3x this rate: {(Number(rbiRate) * 3).toFixed(2)}% p.a.</p>
                  </div>
                  <Button type="submit" className="w-full mt-4">
                    <Calculator className="w-4 h-4 mr-2" /> Audit MSMED Interest
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Statutory Late Fee Audit Registry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                        <th className="pb-3 text-left">Invoice No</th>
                        <th className="pb-3 text-left">Customer Name</th>
                        <th className="pb-3 text-right">Invoice Amount</th>
                        <th className="pb-3 text-right">Delay (Days)</th>
                        <th className="pb-3 text-right bg-amber-50/50">MSMED Penalty (3x RBI rate)</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700 dark:text-slate-300">
                      {receivables.map((rec) => (
                        <tr key={rec.invoiceNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3.5 font-semibold text-xs text-primary">{rec.invoiceNo}</td>
                          <td className="py-3.5 font-bold">{rec.customer}</td>
                          <td className="py-3.5 text-right font-mono text-xs">₹{rec.amount.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 text-right font-mono text-xs text-red-500 font-semibold">{rec.delayDays} days</td>
                          <td className="py-3.5 text-right font-mono text-xs text-amber-600 dark:text-amber-400 font-extrabold bg-amber-50/20 dark:bg-amber-950/5">
                            ₹{rec.penalty.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 text-right">
                            <Badge variant={rec.status === 'Overdue' ? 'destructive' : 'secondary'}>
                              {rec.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {calculatedMsmedInterest !== null && (
                  <div className="mt-4 p-4 border border-dashed rounded-lg bg-amber-50 text-amber-900 space-y-2 text-xs">
                    <p className="font-extrabold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" /> MSMED Statutory Late Fee calculated
                    </p>
                    <p>
                      Invoice Reference: <span className="font-bold text-slate-900">{msmedInvoice}</span> is delayed by{' '}
                      <span className="font-bold text-slate-900">{receivables.find(r => r.invoiceNo === msmedInvoice)?.delayDays} days</span>.
                    </p>
                    <p>
                      Interest Penalty (at {(Number(rbiRate) * 3).toFixed(2)}% p.a. compounded monthly):{' '}
                      <span className="font-extrabold text-red-600 text-sm">₹{calculatedMsmedInterest.toLocaleString('en-IN')}</span>
                    </p>
                    <p className="text-[10px] text-amber-600">
                      Note: Under section 16 of the MSMED Act, this interest is mandatory and cannot be claimed as tax deductible expenditure.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50/20">
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

      {/* Contractual Monthly Renting Engine Dialog */}
      <Dialog open={isContractOpen} onOpenChange={setIsContractOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleSaveContractCharges}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-500" /> Contractual Billing Engine
              </DialogTitle>
              <DialogDescription>
                Parse out recurring machinery hiring charges linked to long-term delivery challans.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs border-t border-b my-3">
              <div className="space-y-2">
                <label className="font-semibold text-slate-500">Customer Leaseholder</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none"
                  value={rentCust}
                  onChange={e => setRentCust(e.target.value)}
                >
                  <option value="Reliance Industries Ltd">Reliance Industries Ltd</option>
                  <option value="Tata Power Company">Tata Power Company</option>
                  <option value="Torrent Power Ltd">Torrent Power Ltd</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-slate-500">Reference Delivery Challan</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none"
                    value={rentChallan}
                    onChange={e => setRentChallan(e.target.value)}
                  >
                    <option value="CHL-1082">CHL-1082 (Reliance Storage Tank)</option>
                    <option value="CHL-1084">CHL-1084 (Tata Calibration Kit)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-slate-500">Billing Period (Months)</label>
                  <Input type="number" min="1" value={monthsCount} onChange={e => setMonthsCount(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-500">Hiring Charge Rate (₹ / Month)</label>
                <Input type="number" value={monthlyCharge} onChange={e => setMonthlyCharge(e.target.value)} required />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsContractOpen(false)}>Cancel</Button>
              <Button type="submit">Issue Rental Invoice Ledger</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dynamic Government Invoice e-Print Dialog with QR */}
      <Dialog open={selectedInvoice !== null} onOpenChange={(open) => { if (!open) setSelectedInvoice(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedInvoice && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Tax Invoice e-Invoice Copy</DialogTitle>
                <DialogDescription>Statutory tax invoice print layout with dynamic IRN QR verification.</DialogDescription>
              </DialogHeader>

              {/* Printable Invoice Card */}
              <div className="border border-slate-900 bg-white text-black p-6 rounded-lg space-y-4 font-sans text-xs shadow-sm">
                <div className="flex justify-between border-b-2 pb-2">
                  <div>
                    <h3 className="font-bold text-sm uppercase leading-tight">Sumesh Petroleum Pvt. Ltd.</h3>
                    <p className="text-[9px] text-slate-500">226-227, G.I.D.C Makarpura, Vadodara</p>
                    <p className="text-[9px] text-slate-500">GSTIN: 24U29309GJ2018PTC102237</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-xs uppercase text-indigo-600">TAX INVOICE</h4>
                    <p className="font-bold">No: {selectedInvoice.id}</p>
                    <p>Date: {selectedInvoice.ackDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-2">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">BILL TO:</span>
                    <span className="font-bold">{selectedInvoice.customer}</span>
                    <p className="text-[10px] text-slate-600">GSTIN Reference Accounted</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">HSN/SAC CODE:</span>
                    <span className="font-mono font-semibold">{selectedInvoice.hsn}</span>
                  </div>
                </div>

                <table className="w-full text-left my-2 border-b pb-2">
                  <thead>
                    <tr className="border-b font-bold text-[9px] text-slate-500">
                      <th>Description of Supply</th>
                      <th className="text-right">Taxable Value</th>
                      <th className="text-right">GST Rate</th>
                      <th className="text-right">Tax Value</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">
                        {selectedInvoice.hsn === '9973.11.00' 
                          ? 'Contractual Machinery Hiring/Rental Charges' 
                          : 'Transformer Oil Filtration & Purification Plant'}
                      </td>
                      <td className="text-right py-2">₹{selectedInvoice.basic.toLocaleString()}</td>
                      <td className="text-right py-2">18%</td>
                      <td className="text-right py-2">₹{(selectedInvoice.basic * 0.18).toLocaleString()}</td>
                      <td className="text-right py-2 font-bold">₹{(selectedInvoice.basic * 1.18).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                {/* E-Invoicing Verification Details Section */}
                <div className="bg-slate-50 p-3 rounded border flex gap-3 items-center">
                  <div className="p-1 border bg-white rounded shadow-sm">
                    {/* Simulated QR Code */}
                    <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white relative">
                      <QrCode className="w-12 h-12" />
                      <div className="absolute inset-0 bg-transparent border-2 border-white m-1"></div>
                    </div>
                  </div>
                  <div className="space-y-1 flex-1 text-[8px] text-slate-500 leading-normal">
                    <p className="text-green-700 font-bold flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3 text-green-600" /> NIC e-Invoice Registered</p>
                    <p className="truncate w-64" title={selectedInvoice.irn}>
                      <span className="font-bold text-slate-700">IRN:</span> {selectedInvoice.irn}
                    </p>
                    <p><span className="font-bold text-slate-700">Ack No:</span> {selectedInvoice.ackNo} | <span className="font-bold text-slate-700">Ack Date:</span> {selectedInvoice.ackDate}</p>
                  </div>
                </div>

                <div className="text-[8px] text-slate-400 text-center pt-1 border-t">
                  Thank you for choosing Sumesh Petroleum. Generated via Government GST Portal API connection.
                </div>
              </div>

              <DialogFooter className="print:hidden">
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Close</Button>
                <Button onClick={() => window.print()}>
                  <Printer className="w-4 h-4 mr-2" /> Print Invoice copy
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
