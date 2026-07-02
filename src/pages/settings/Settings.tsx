import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Users, FileText, Bell, MessageSquare, Mail, Cpu } from 'lucide-react';
import {
  getIntegrationSettings,
  saveIntegrationSettings,
  type IntegrationSettings,
} from '@/lib/integrationConfig';

export default function Settings() {
  const [integration, setIntegration] = useState<IntegrationSettings>(() => getIntegrationSettings());
  const [saved, setSaved] = useState(false);

  const updateIntegration = (path: string, value: unknown) => {
    setIntegration(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...(obj[keys[i]] as Record<string, unknown>) };
        obj = obj[keys[i]] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    setSaved(false);
  };

  const handleSaveIntegrations = () => {
    saveIntegrationSettings(integration);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Company profile, notifications, and WhatsApp/email integrations.</p>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="integrations"><MessageSquare className="w-4 h-4 mr-2" /> Integrations</TabsTrigger>
          <TabsTrigger value="company"><Building2 className="w-4 h-4 mr-2" /> Company</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" /> Users</TabsTrigger>
          <TabsTrigger value="documents"><FileText className="w-4 h-4 mr-2" /> Documents</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" /> Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-green-600" /> WhatsApp Business Integration</CardTitle>
                <CardDescription>Configure WhatsApp for automated dispatch, enquiry, and production alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={integration.whatsapp.enabled} onChange={e => updateIntegration('whatsapp.enabled', e.target.checked)} className="w-4 h-4" />
                  Enable WhatsApp notifications
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mode</label>
                    <select className={inputClass} value={integration.whatsapp.mode} onChange={e => updateIntegration('whatsapp.mode', e.target.value)}>
                      <option value="simulation">Simulation (log only)</option>
                      <option value="deep_link">Deep Link (open WhatsApp Web)</option>
                      <option value="api">Business API (requires token)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Phone</label>
                    <Input value={integration.whatsapp.businessPhone} onChange={e => updateIntegration('whatsapp.businessPhone', e.target.value)} placeholder="+91 9876543210" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number ID (Meta API)</label>
                    <Input value={integration.whatsapp.phoneNumberId} onChange={e => updateIntegration('whatsapp.phoneNumberId', e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Access Token</label>
                    <Input type="password" value={integration.whatsapp.accessToken} onChange={e => updateIntegration('whatsapp.accessToken', e.target.value)} placeholder="Optional" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                  {(['notifyOnEnquiry', 'notifyOnDispatch', 'notifyOnWorkOrder'] as const).map(key => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={integration.whatsapp[key]} onChange={e => updateIntegration(`whatsapp.${key}`, e.target.checked)} className="w-4 h-4" />
                      Auto: {key.replace('notifyOn', '')}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> Email / SMTP Integration</CardTitle>
                <CardDescription>Configure outbound email for customer updates and internal alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={integration.email.enabled} onChange={e => updateIntegration('email.enabled', e.target.checked)} className="w-4 h-4" />
                  Enable email notifications
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mode</label>
                    <select className={inputClass} value={integration.email.mode} onChange={e => updateIntegration('email.mode', e.target.value)}>
                      <option value="simulation">Simulation (log only)</option>
                      <option value="smtp">SMTP Relay</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From Name</label>
                    <Input value={integration.email.fromName} onChange={e => updateIntegration('email.fromName', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From Email</label>
                    <Input type="email" value={integration.email.fromEmail} onChange={e => updateIntegration('email.fromEmail', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Internal CC (comma-separated)</label>
                    <Input value={integration.email.ccInternal} onChange={e => updateIntegration('email.ccInternal', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SMTP Host</label>
                    <Input value={integration.email.smtpHost} onChange={e => updateIntegration('email.smtpHost', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SMTP Port</label>
                    <Input value={integration.email.smtpPort} onChange={e => updateIntegration('email.smtpPort', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SMTP Username</label>
                    <Input value={integration.email.smtpUser} onChange={e => updateIntegration('email.smtpUser', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SMTP Password</label>
                    <Input type="password" value={integration.email.smtpPassword} onChange={e => updateIntegration('email.smtpPassword', e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                  {(['notifyOnEnquiry', 'notifyOnDispatch', 'notifyOnWorkOrder'] as const).map(key => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={integration.email[key]} onChange={e => updateIntegration(`email.${key}`, e.target.checked)} className="w-4 h-4" />
                      Auto: {key.replace('notifyOn', '')}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5 text-teal-600" /> Auto Task Generation</CardTitle>
                <CardDescription>Automatically create tasks when enquiries, orders, or work orders change.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={integration.autoTasks.enabled} onChange={e => updateIntegration('autoTasks.enabled', e.target.checked)} className="w-4 h-4" />
                  Enable auto task generation from ERP details
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={integration.autoTasks.notifyAssigneeViaWhatsApp} onChange={e => updateIntegration('autoTasks.notifyAssigneeViaWhatsApp', e.target.checked)} className="w-4 h-4" />
                  Notify assignee via WhatsApp when task is created
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={integration.autoTasks.notifyAssigneeViaEmail} onChange={e => updateIntegration('autoTasks.notifyAssigneeViaEmail', e.target.checked)} className="w-4 h-4" />
                  Notify assignee via email when task is created
                </label>
              </CardContent>
            </Card>

            <Button onClick={handleSaveIntegrations}>
              {saved ? 'Saved!' : 'Save Integration Settings'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update company details for invoices and communications.</CardDescription>
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
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>User Roles & Access</CardTitle></CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">User management module coming soon.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader><CardTitle>Document Numbering Series</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Proforma Invoice (PI)</label>
                <input className="w-full p-2 border rounded-md bg-muted" defaultValue="PI-26-" readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax Invoice (TI)</label>
                <input className="w-full p-2 border rounded-md bg-muted" defaultValue="TI-26-" readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Legacy Invoice Prefix</label>
                <input className="w-full p-2 border rounded-md bg-muted" defaultValue="INV-26-" readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Order Prefix</label>
                <input className="w-full p-2 border rounded-md bg-muted" defaultValue="WO-26-" readOnly />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>System Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><p className="font-medium">AMC Renewals</p><p className="text-sm text-muted-foreground">Alert 30 days before expiry.</p></div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><p className="font-medium">Low Inventory Stock</p><p className="text-sm text-muted-foreground">Alert when stock falls below reorder level.</p></div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
