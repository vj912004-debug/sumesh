import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Mail, RefreshCw, Send, Settings2, CheckCircle2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getWhatsAppLogs,
  getEmailLogs,
  sendWhatsApp,
  sendEmail,
  resendEmail,
  type WhatsAppLog,
  type EmailLog,
} from '@/lib/communicationService';
import { getIntegrationSettings } from '@/lib/integrationConfig';

export default function CommunicationAlerts() {
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [settings] = useState(() => getIntegrationSettings());

  const [waRecipient, setWaRecipient] = useState('');
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [emTo, setEmTo] = useState('');
  const [emSubject, setEmSubject] = useState('');
  const [emBody, setEmBody] = useState('');
  const [sending, setSending] = useState(false);

  const refresh = useCallback(() => {
    setWhatsappLogs(getWhatsAppLogs());
    setEmailLogs(getEmailLogs());
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('erp-communication-update', handler);
    window.addEventListener('erp-event', handler);
    return () => {
      window.removeEventListener('erp-communication-update', handler);
      window.removeEventListener('erp-event', handler);
    };
  }, [refresh]);

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await sendWhatsApp({ recipient: waRecipient, phone: waPhone, type: 'Manual Message', message: waMessage });
    setWaRecipient('');
    setWaPhone('');
    setWaMessage('');
    setSending(false);
    refresh();
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await sendEmail({ to: emTo, type: 'Manual Email', subject: emSubject, body: emBody });
    setEmTo('');
    setEmSubject('');
    setEmBody('');
    setSending(false);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communication & Automated Alerts</h2>
          <p className="text-muted-foreground">
            WhatsApp and email integrations log all automated and manual messages. Configure credentials in Settings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
          <Link to="/settings">
            <Button variant="outline"><Settings2 className="mr-2 h-4 w-4" /> Integration Settings</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-teal-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-green-600" /> WhatsApp Gateway</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>Mode: <strong className="text-foreground">{settings.whatsapp.mode}</strong> · {settings.whatsapp.enabled ? 'Enabled' : 'Disabled'}</p>
            <p>Auto-alerts: Enquiry {settings.whatsapp.notifyOnEnquiry ? '✓' : '✗'} · Dispatch {settings.whatsapp.notifyOnDispatch ? '✓' : '✗'} · Production {settings.whatsapp.notifyOnWorkOrder ? '✓' : '✗'}</p>
          </CardContent>
        </Card>
        <Card className="border-teal-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Email (SMTP)</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>Mode: <strong className="text-foreground">{settings.email.mode}</strong> · From: {settings.email.fromEmail}</p>
            <p>Auto-alerts: Enquiry {settings.email.notifyOnEnquiry ? '✓' : '✗'} · Dispatch {settings.email.notifyOnDispatch ? '✓' : '✗'} · Production {settings.email.notifyOnWorkOrder ? '✓' : '✗'}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="whatsapp"><MessageSquare className="w-4 h-4 mr-2" /> WhatsApp Logs</TabsTrigger>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" /> Email Logs</TabsTrigger>
          <TabsTrigger value="compose"><Send className="w-4 h-4 mr-2" /> Compose</TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp dispatch logs</CardTitle>
              <CardDescription>Automated alerts from enquiries, dispatch, and production events.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                      <th className="pb-3 text-left">ID</th>
                      <th className="pb-3 text-left">Recipient</th>
                      <th className="pb-3 text-left">Type</th>
                      <th className="pb-3 text-left">Message</th>
                      <th className="pb-3 text-left">Time</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {whatsappLogs.map(log => (
                      <tr key={log.id} className="hover:bg-muted/30">
                        <td className="py-3 font-semibold text-xs text-primary">{log.id}</td>
                        <td className="py-3 font-bold">{log.recipient}</td>
                        <td className="py-3"><Badge variant="outline">{log.type}</Badge></td>
                        <td className="py-3 text-xs text-muted-foreground max-w-sm truncate">{log.message}</td>
                        <td className="py-3 text-xs font-mono text-muted-foreground">{log.timestamp}</td>
                        <td className="py-3 text-right">
                          <Badge className={log.status === 'Read' || log.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' : ''}>{log.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email relay logs</CardTitle>
              <CardDescription>Transactional emails with attachment references.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                      <th className="pb-3 text-left">ID</th>
                      <th className="pb-3 text-left">To</th>
                      <th className="pb-3 text-left">Type</th>
                      <th className="pb-3 text-left">Subject</th>
                      <th className="pb-3 text-left">Time</th>
                      <th className="pb-3 text-right">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {emailLogs.map(log => (
                      <tr key={log.id} className="hover:bg-muted/30">
                        <td className="py-3 font-semibold text-xs text-primary">{log.id}</td>
                        <td className="py-3 font-bold">{log.recipient}</td>
                        <td className="py-3 text-xs">{log.type}</td>
                        <td className="py-3 text-xs truncate max-w-xs">{log.subject}</td>
                        <td className="py-3 text-xs font-mono text-muted-foreground">{log.timestamp}</td>
                        <td className="py-3 text-right">
                          <Badge variant={log.status === 'Relayed' ? 'default' : 'destructive'}>{log.status}</Badge>
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { resendEmail(log.id); refresh(); }}>
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Send WhatsApp</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSendWhatsApp} className="space-y-3">
                  <Input placeholder="Recipient name" value={waRecipient} onChange={e => setWaRecipient(e.target.value)} required />
                  <Input placeholder="Phone (+91...)" value={waPhone} onChange={e => setWaPhone(e.target.value)} />
                  <textarea className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Message..." value={waMessage} onChange={e => setWaMessage(e.target.value)} required />
                  <Button type="submit" disabled={sending} className="w-full"><Send className="mr-2 h-4 w-4" /> Send WhatsApp</Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Send Email</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} className="space-y-3">
                  <Input type="email" placeholder="To email" value={emTo} onChange={e => setEmTo(e.target.value)} required />
                  <Input placeholder="Subject" value={emSubject} onChange={e => setEmSubject(e.target.value)} required />
                  <textarea className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Body..." value={emBody} onChange={e => setEmBody(e.target.value)} required />
                  <Button type="submit" disabled={sending} className="w-full"><Mail className="mr-2 h-4 w-4" /> Send Email</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/30">
        <CardContent className="pt-6 flex items-start gap-3 text-sm text-muted-foreground">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <p>
            When you create an enquiry, mark an order ready for dispatch, or advance a work order, the system automatically creates tasks and sends WhatsApp/email alerts based on your integration settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
