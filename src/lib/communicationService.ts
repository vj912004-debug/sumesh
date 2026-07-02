import { getIntegrationSettings } from './integrationConfig';

export type WhatsAppLog = {
  id: string;
  recipient: string;
  phone?: string;
  type: string;
  message: string;
  status: 'Queued' | 'Delivered' | 'Read' | 'Failed';
  timestamp: string;
  sourceRef?: string;
};

export type EmailLog = {
  id: string;
  recipient: string;
  type: string;
  subject: string;
  body?: string;
  attachment?: string;
  status: 'Queued' | 'Relayed' | 'Delayed (SMTP Retry)' | 'Failed';
  timestamp: string;
  sourceRef?: string;
};

const WA_KEY = 'whatsappLogs';
const EM_KEY = 'emailLogs';

const DEFAULT_WA: WhatsAppLog[] = [
  { id: 'WA-801', recipient: 'Sukhwinder Singh (Driver)', type: 'Transport Alert', message: 'Gate pass GP-9018 issued. Route: Vadodara to Navi Mumbai.', status: 'Delivered', timestamp: '2026-06-30 11:34 AM' },
  { id: 'WA-802', recipient: 'Tata Power (QA Inspector)', type: 'QC Notification', message: 'Inspections for Transformer Oil Plant complete. Certificate TC-26-085 is ready.', status: 'Delivered', timestamp: '2026-06-28 04:32 PM' },
];

const DEFAULT_EM: EmailLog[] = [
  { id: 'EM-190', recipient: 'procurement@tatapower.com', type: 'Tax Invoice & Challan', subject: 'Tax Invoice INV-26-004 & Challan CHL-1084 - Sumesh Petroleum', attachment: 'INV-26-004.pdf, CHL-1084.pdf', status: 'Relayed', timestamp: '2026-06-28 05:00 PM' },
  { id: 'EM-191', recipient: 'plant.operations@reliance.com', type: 'FAT Drawing Certificate', subject: 'QA Inspection Release Certificate FAT-892', attachment: 'FAT-892_Certified.pdf', status: 'Delayed (SMTP Retry)', timestamp: '2026-06-30 12:00 PM' },
];

function nowTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function loadLogs<T>(key: string, defaults: T[]): T[] {
  if (typeof window === 'undefined') return defaults;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaults;
  } catch {
    return defaults;
  }
}

function saveLogs<T>(key: string, logs: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(logs));
}

export function getWhatsAppLogs(): WhatsAppLog[] {
  return loadLogs(WA_KEY, DEFAULT_WA);
}

export function getEmailLogs(): EmailLog[] {
  return loadLogs(EM_KEY, DEFAULT_EM);
}

export function formatPhoneForWhatsApp(phone: string): string {
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) digits = '91' + digits;
  return digits;
}

export function openWhatsAppDeepLink(phone: string, message: string): void {
  const url = `https://api.whatsapp.com/send?phone=${formatPhoneForWhatsApp(phone)}&text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export type SendWhatsAppInput = {
  recipient: string;
  phone?: string;
  type: string;
  message: string;
  sourceRef?: string;
};

export async function sendWhatsApp(input: SendWhatsAppInput): Promise<WhatsAppLog> {
  const settings = getIntegrationSettings();
  const log: WhatsAppLog = {
    id: `WA-${Date.now().toString().slice(-6)}`,
    recipient: input.recipient,
    phone: input.phone,
    type: input.type,
    message: input.message,
    status: settings.whatsapp.enabled ? 'Queued' : 'Failed',
    timestamp: nowTimestamp(),
    sourceRef: input.sourceRef,
  };

  if (!settings.whatsapp.enabled) {
    log.status = 'Failed';
    prependLog(WA_KEY, log, DEFAULT_WA);
    return log;
  }

  await new Promise(r => setTimeout(r, 400));

  if (settings.whatsapp.mode === 'deep_link' && input.phone) {
    openWhatsAppDeepLink(input.phone, input.message);
    log.status = 'Delivered';
  } else if (settings.whatsapp.mode === 'api' && settings.whatsapp.phoneNumberId && settings.whatsapp.accessToken) {
    // Production: POST to Meta Graph API via your backend proxy
    log.status = 'Delivered';
  } else {
    log.status = 'Delivered';
  }

  prependLog(WA_KEY, log, DEFAULT_WA);
  notifyCommunicationUpdate();
  return log;
}

export type SendEmailInput = {
  to: string;
  type: string;
  subject: string;
  body: string;
  attachment?: string;
  sourceRef?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<EmailLog> {
  const settings = getIntegrationSettings();
  const log: EmailLog = {
    id: `EM-${Date.now().toString().slice(-6)}`,
    recipient: input.to,
    type: input.type,
    subject: input.subject,
    body: input.body,
    attachment: input.attachment,
    status: settings.email.enabled ? 'Queued' : 'Failed',
    timestamp: nowTimestamp(),
    sourceRef: input.sourceRef,
  };

  if (!settings.email.enabled) {
    log.status = 'Failed';
    prependLog(EM_KEY, log, DEFAULT_EM);
    return log;
  }

  await new Promise(r => setTimeout(r, 600));

  if (settings.email.mode === 'smtp' && settings.email.smtpHost && settings.email.smtpUser) {
    log.status = 'Relayed';
  } else {
    log.status = 'Relayed';
  }

  prependLog(EM_KEY, log, DEFAULT_EM);
  notifyCommunicationUpdate();
  return log;
}

export async function resendEmail(logId: string): Promise<void> {
  const logs = getEmailLogs();
  const updated = logs.map(log =>
    log.id === logId ? { ...log, status: 'Relayed' as const, timestamp: nowTimestamp() } : log
  );
  saveLogs(EM_KEY, updated);
  notifyCommunicationUpdate();
}

function prependLog<T extends { id: string }>(key: string, entry: T, defaults: T[]): void {
  const existing = loadLogs(key, defaults);
  saveLogs(key, [entry, ...existing]);
}

export function notifyCommunicationUpdate(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('erp-communication-update'));
  }
}
