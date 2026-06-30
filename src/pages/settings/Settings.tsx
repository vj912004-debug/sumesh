import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, FileText, Bell } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage company profile, user access, and system configurations.</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="company">
            <Building2 className="w-4 h-4 mr-2" /> Company Profile
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" /> User Management
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" /> Document Series
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details, GSTIN, and logo for invoice printing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <input className="w-full p-2 border rounded-md" defaultValue="Sumesh Petroleum Pvt. Ltd." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GSTIN</label>
                  <input className="w-full p-2 border rounded-md" defaultValue="24AAACSXXXXA1Z5" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Registered Address</label>
                  <textarea className="w-full p-2 border rounded-md" rows={3} defaultValue="Makarpura GIDC, Vadodara, Gujarat - 390010" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Roles & Access</CardTitle>
              <CardDescription>Manage employee accounts and module permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                User Management module is currently empty in this prototype.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Numbering Series</CardTitle>
              <CardDescription>Configure auto-generated prefixes for Invoices, Orders, and Challans.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sales Invoice Prefix</label>
                  <input className="w-full p-2 border rounded-md bg-muted" defaultValue="INV-26-" readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Work Order Prefix</label>
                  <input className="w-full p-2 border rounded-md bg-muted" defaultValue="WO-26-" readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>Configure email and SMS alerts for critical events.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">AMC Renewals</p>
                    <p className="text-sm text-muted-foreground">Alert 30 days before contract expiry.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Low Inventory Stock</p>
                    <p className="text-sm text-muted-foreground">Alert when raw material falls below reorder level.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
