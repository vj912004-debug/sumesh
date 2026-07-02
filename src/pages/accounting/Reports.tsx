import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, PieChart } from 'lucide-react';

export default function AccountingReports() {
  const downloadReport = (reportName: string) => {
    const content = `=====================================================
SUMESH PETROLEUM PVT. LTD.
Makarpura GIDC, Vadodara, Gujarat - 390010
=====================================================
Financial Report: ${reportName}
Generated On: ${new Date().toLocaleString()}
Status: Approved & Verified
-----------------------------------------------------
Reference: ERP-MOCK-EX-99124
-----------------------------------------------------

[MOCK REPORT TRANSACTION DATA]
- Jun-2026 Opening Balance: INR 4,22,45,000.00
- Total Invoiced Sales:   INR 1,12,30,500.00
- Total Collections:      INR   94,80,000.00
- Outstanding Ageing > 30d: INR 17,50,500.00

This is a prototype simulated export file.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
          <p className="text-muted-foreground">GST returns, Profit & Loss, and Ledgers.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* GST Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-500" />
              GST Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">GSTR-1 (Outward Supplies)</span>
              <Button size="sm" variant="ghost" onClick={() => downloadReport('GSTR-1 Outward Supplies')}><Download className="w-4 h-4" /></Button>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">GSTR-2B (ITC Match)</span>
              <Button size="sm" variant="ghost" onClick={() => downloadReport('GSTR-2B ITC Match')}><Download className="w-4 h-4" /></Button>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm font-medium">GSTR-3B (Summary)</span>
              <Button size="sm" variant="ghost" onClick={() => downloadReport('GSTR-3B Summary')}><Download className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Core Financials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-500" />
              Core Financials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Profit & Loss Statement</span>
              <Button size="sm" variant="ghost" onClick={() => downloadReport('Profit & Loss Statement')}><Download className="w-4 h-4" /></Button>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Balance Sheet</span>
              <Button size="sm" variant="ghost" onClick={() => downloadReport('Balance Sheet')}><Download className="w-4 h-4" /></Button>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm font-medium">Trial Balance</span>
              <Button size="sm" variant="ghost" onClick={() => downloadReport('Trial Balance')}><Download className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Ledgers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-purple-500" />
              Ledgers & Cashflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Customer Receivables</span>
              <Button size="sm" variant="ghost" onClick={() => downloadReport('Customer Receivables')}><Download className="w-4 h-4" /></Button>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Vendor Payables</span>
              <Button size="sm" variant="ghost" onClick={() => downloadReport('Vendor Payables')}><Download className="w-4 h-4" /></Button>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm font-medium">Bank & Cash Book</span>
              <Button size="sm" variant="ghost" onClick={() => downloadReport('Bank & Cash Book')}><Download className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

