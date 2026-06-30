import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, MessageSquare, Mail, RefreshCw, Send, CheckCircle2 
} from 'lucide-react';

export default function CommunicationAlerts() {
  const [whatsappLogs, setWhatsappLogs] = useState([
    { id: 'WA-801', recipient: 'Sukhwinder Singh (Driver)', type: 'Transport Alert', message: 'Gate pass GP-9018 issued. Route: Vadodara to Navi Mumbai. e-Way Link: ewb.gov.in/EWB-26-9921', status: 'Delivered', timestamp: '2026-06-30 11:34 AM' },
    { id: 'WA-802', recipient: 'Tata Power (QA Inspector)', type: 'QC Notification', message: 'Inspections for Transformer Oil Plant complete. Certificate TC-26-085 is ready for review.', status: 'Delivered', timestamp: '2026-06-28 04:32 PM' },
    { id: 'WA-803', recipient: 'Ketan Shah (Reliance Customer)', type: 'Order Dispatch', message: 'Dear Ketan, Your order SO-26-004 has been dispatched via truck GJ-06-ZZ-4012.', status: 'Read', timestamp: '2026-06-30 11:40 AM' }
  ]);

  const [emailLogs, setEmailLogs] = useState([
    { id: 'EM-190', recipient: 'procurement@tatapower.com', type: 'Tax Invoice & Challan', subject: 'Tax Invoice INV-26-004 & Challan CHL-1084 - Sumesh Petroleum', attachment: 'INV-26-004.pdf, CHL-1084.pdf', status: 'Relayed', timestamp: '2026-06-28 05:00 PM' },
    { id: 'EM-191', recipient: 'plant.operations@reliance.com', type: 'FAT Drawing Certificate', subject: 'QA Inspection Release Certificate FAT-892 - Sumesh Petroleum', attachment: 'FAT-892_Certified.pdf', status: 'Delayed (SMTP Retry)', timestamp: '2026-06-30 12:00 PM' }
  ]);

  const handleResendMail = (logId: string) => {
    setEmailLogs(emailLogs.map(log => 
      log.id === logId ? { ...log, status: 'Relayed', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) } : log
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Communication & Automated Alerts Engine</h2>
        <p className="text-muted-foreground">Monitor automated WhatsApp delivery logs, transactional SMTP email Relays, and digitally certified PDF attachments.</p>
      </div>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="whatsapp"><MessageSquare className="w-4 h-4 mr-2" /> WhatsApp Gateway</TabsTrigger>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" /> Transactional Email Hub</TabsTrigger>
        </TabsList>

        {/* Tab 1: WhatsApp Gateway */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Notification Gateway status & dispatch logs</CardTitle>
              <CardDescription>Monitors alerts sent to drivers, plant supervisors, and customer procurement stakeholders.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Message ID</th>
                      <th className="pb-3 text-left">Recipient</th>
                      <th className="pb-3 text-left">Alert Type</th>
                      <th className="pb-3 text-left">Message Content Template</th>
                      <th className="pb-3 text-left">Sent Timestamp</th>
                      <th className="pb-3 text-right">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {whatsappLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{log.id}</td>
                        <td className="py-3.5 font-bold">{log.recipient}</td>
                        <td className="py-3.5">
                          <Badge variant="outline" className="text-slate-500">
                            {log.type}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-xs text-slate-600 dark:text-slate-400 max-w-sm">{log.message}</td>
                        <td className="py-3.5 text-xs text-slate-400 font-mono">{log.timestamp}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant={log.status === 'Read' ? 'default' : 'secondary'} className={log.status === 'Read' ? 'text-green-600 border-green-200 bg-green-50' : 'text-blue-600 border-blue-200 bg-blue-50'}>
                            {log.status}
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

        {/* Tab 2: Transactional Email Hub */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Transactional SMTP Email Hub & Attachment Relays</CardTitle>
              <CardDescription>Tracks relayed PDF tax invoices, challans, and drawing compliance files to corporate stakeholder groups.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-semibold text-xs uppercase tracking-wider pb-3">
                      <th className="pb-3 text-left">Email ID</th>
                      <th className="pb-3 text-left">Recipient Stakeholder</th>
                      <th className="pb-3 text-left">Category</th>
                      <th className="pb-3 text-left">Subject Line</th>
                      <th className="pb-3 text-left">Digitally Signed Attachments</th>
                      <th className="pb-3 text-left">Relayed Timestamp</th>
                      <th className="pb-3 text-right">Relay Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {emailLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-xs text-primary">{log.id}</td>
                        <td className="py-3.5 font-bold">{log.recipient}</td>
                        <td className="py-3.5 text-xs">{log.type}</td>
                        <td className="py-3.5 text-xs text-slate-500 font-medium truncate max-w-xs">{log.subject}</td>
                        <td className="py-3.5 font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{log.attachment}</td>
                        <td className="py-3.5 text-xs text-slate-400 font-mono">{log.timestamp}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant={log.status === 'Relayed' ? 'default' : 'destructive'} className={log.status === 'Relayed' ? 'text-green-600 border-green-200 bg-green-50' : 'animate-pulse'}>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleResendMail(log.id)} className="h-8 w-8 text-slate-400 hover:text-slate-900" title="Resend Notification">
                            <RefreshCw className="h-3.5 h-3.5" />
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
      </Tabs>
    </div>
  );
}
