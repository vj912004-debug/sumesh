export type IntegrationSettings = {
  whatsapp: {
    enabled: boolean;
    mode: 'simulation' | 'deep_link' | 'api';
    businessPhone: string;
    phoneNumberId: string;
    accessToken: string;
    notifyOnDispatch: boolean;
    notifyOnEnquiry: boolean;
    notifyOnWorkOrder: boolean;
  };
  email: {
    enabled: boolean;
    mode: 'simulation' | 'smtp';
    fromName: string;
    fromEmail: string;
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
    notifyOnDispatch: boolean;
    notifyOnEnquiry: boolean;
    notifyOnWorkOrder: boolean;
    ccInternal: string;
  };
  autoTasks: {
    enabled: boolean;
    notifyAssigneeViaWhatsApp: boolean;
    notifyAssigneeViaEmail: boolean;
  };
};

const SETTINGS_KEY = 'sp2_integration_settings';

export const defaultIntegrationSettings: IntegrationSettings = {
  whatsapp: {
    enabled: true,
    mode: 'simulation',
    businessPhone: '+91 9876543210',
    phoneNumberId: '',
    accessToken: '',
    notifyOnDispatch: true,
    notifyOnEnquiry: true,
    notifyOnWorkOrder: true,
  },
  email: {
    enabled: true,
    mode: 'simulation',
    fromName: 'Sumesh Petroleum ERP',
    fromEmail: 'erp@sumeshpetroleum.com',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    notifyOnDispatch: true,
    notifyOnEnquiry: true,
    notifyOnWorkOrder: true,
    ccInternal: 'admin@sumeshpetroleum.com, logistics@sumeshpetroleum.com',
  },
  autoTasks: {
    enabled: true,
    notifyAssigneeViaWhatsApp: false,
    notifyAssigneeViaEmail: true,
  },
};

export function getIntegrationSettings(): IntegrationSettings {
  if (typeof window === 'undefined') return defaultIntegrationSettings;
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return defaultIntegrationSettings;
    return { ...defaultIntegrationSettings, ...JSON.parse(saved) };
  } catch {
    return defaultIntegrationSettings;
  }
}

export function saveIntegrationSettings(settings: IntegrationSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
