import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, CheckCircle2 } from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';

export default function Payroll() {
  const payrollData = [
    { empId: 'EMP-01', name: 'Ramesh Bhai', trade: 'Welder', daysPresent: 26, otHours: 12, basicSalary: 18000, totalPay: 20400 },
    { empId: 'EMP-02', name: 'Suresh Kumar', trade: 'Fitter', daysPresent: 24, otHours: 0, basicSalary: 16000, totalPay: 14769 },
    { empId: 'EMP-03', name: 'Dinesh Patel', trade: 'Electrician', daysPresent: 26, otHours: 5, basicSalary: 18000, totalPay: 19150 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">HR & Payroll</h2>
          <p className="text-muted-foreground">Process monthly salaries, track attendance, and overtime.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calculator className="mr-2 h-4 w-4" /> Calculate Salary (Jun 2026)
          </Button>
          <Button>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Process Payout
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Payroll Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹ 2,45,000</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total OT Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 Hrs</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary Register - June 2026</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emp ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Trade</TableHead>
                <TableHead className="text-center">Days Present</TableHead>
                <TableHead className="text-center">OT Hrs</TableHead>
                <TableHead className="text-right">Basic</TableHead>
                <TableHead className="text-right">Net Payable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollData.map((emp) => (
                <TableRow key={emp.empId}>
                  <TableCell className="font-medium">{emp.empId}</TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.trade}</TableCell>
                  <TableCell className="text-center">{emp.daysPresent}/26</TableCell>
                  <TableCell className="text-center">{emp.otHours}</TableCell>
                  <TableCell className="text-right">₹{emp.basicSalary.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right font-bold text-green-700">₹{emp.totalPay.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
