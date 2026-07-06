import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import WoBillAllocationPanel from '@/components/purchase/WoBillAllocationPanel';
import { PackageCheck, ArrowDownToLine, CheckCircle2 } from 'lucide-react';

type GrnRow = {
  grnNo: string;
  date: string;
  poNo: string;
  vendor: string;
  status: string;
  billStatus: string;
  itemCode?: string;
  qty?: number;
};

export default function GoodsReceipt() {
  const [toast, setToast] = useState<string | null>(null);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [activeGrn, setActiveGrn] = useState<GrnRow | null>(null);

  const grnList: GrnRow[] = [
    {
      grnNo: 'GRN-26-401', date: '30-Jun-2026', poNo: 'PO-26-050',
      vendor: 'Laxmi Steels & Alloys', status: 'QC Pending', billStatus: 'Pending',
    },
    {
      grnNo: 'GRN-26-400', date: '28-Jun-2026', poNo: 'PO-26-048',
      vendor: 'Siemens India Ltd', status: 'Accepted', billStatus: 'Bill Booked',
      itemCode: 'HTR-3KW', qty: 12,
    },
  ];

  const openBillBooking = (grn: GrnRow) => {
    setActiveGrn(grn);
    setBillDialogOpen(true);
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
          <h2 className="text-3xl font-bold tracking-tight">Goods Receipt (GRN) & Purchase Bills</h2>
          <p className="text-muted-foreground">
            Receive vendor materials, perform inward QC, and book purchase bills with automatic WO allocation (FIFO).
          </p>
        </div>
        <Button onClick={() => setToast('GRN-26-402 created — awaiting inward QC.')}>
          <ArrowDownToLine className="mr-2 h-4 w-4" /> Create GRN
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>GRN No.</TableHead>
                <TableHead>Receipt Date</TableHead>
                <TableHead>Against PO</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Inward QC Status</TableHead>
                <TableHead>Purchase Bill</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grnList.map((grn) => (
                <TableRow key={grn.grnNo}>
                  <TableCell className="font-medium">{grn.grnNo}</TableCell>
                  <TableCell>{grn.date}</TableCell>
                  <TableCell className="text-primary hover:underline cursor-pointer">{grn.poNo}</TableCell>
                  <TableCell>{grn.vendor}</TableCell>
                  <TableCell>
                    <Badge variant={grn.status === 'Accepted' ? 'default' : 'secondary'}>
                      {grn.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={grn.billStatus === 'Bill Booked' ? 'default' : 'outline'}>
                      {grn.billStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {grn.status === 'QC Pending' ? (
                      <Button variant="ghost" size="sm" onClick={() => setToast(`${grn.grnNo} QC cleared — stock updated.`)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Clear QC
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => openBillBooking(grn)}>
                        <PackageCheck className="mr-2 h-4 w-4" /> Book Bill
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WO Auto-Allocation on Bill Entry</CardTitle>
          <p className="text-sm text-muted-foreground">
            Match purchased items to pending Work Orders: WO tag on PO → FIFO by oldest WO → split if needed → flag excess.
          </p>
        </CardHeader>
        <CardContent>
          <WoBillAllocationPanel
            onBooked={(msg) => {
              setToast(msg);
              setBillDialogOpen(false);
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={billDialogOpen} onOpenChange={setBillDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Purchase Bill — {activeGrn?.grnNo}</DialogTitle>
            <DialogDescription>
              Allocate bill quantity against pending Work Orders for {activeGrn?.vendor}.
            </DialogDescription>
          </DialogHeader>
          {activeGrn && (
            <WoBillAllocationPanel
              initialBillRef={`BILL-${activeGrn.grnNo}`}
              initialPoRef={activeGrn.poNo}
              initialVendor={activeGrn.vendor}
              initialDate="2026-06-28"
              onBooked={(msg) => {
                setToast(msg);
                setBillDialogOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
