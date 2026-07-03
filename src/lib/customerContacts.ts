import type { Customer } from './mockData';

export type CustomerContact = {
  designation: string;
  name: string;
  phone: string;
  email?: string;
};

export function getCustomerContacts(customer: Partial<Customer> | null | undefined): CustomerContact[] {
  if (!customer) return [];
  if (customer.contacts?.length) return customer.contacts;
  if (customer.contactPerson || customer.phone) {
    return [{
      designation: 'Primary Contact',
      name: customer.contactPerson || '—',
      phone: customer.phone || '—',
      email: customer.email,
    }];
  }
  return [];
}

export function getPrimaryContact(customer: Partial<Customer> | null | undefined): CustomerContact | undefined {
  return getCustomerContacts(customer)[0];
}

export function syncLegacyContactFields<T extends { contacts?: CustomerContact[]; contactPerson?: string; phone?: string; email?: string }>(
  data: T
): T & { contactPerson: string; phone: string; email: string } {
  const primary = data.contacts?.[0];
  return {
    ...data,
    contactPerson: primary?.name ?? data.contactPerson ?? '',
    phone: primary?.phone ?? data.phone ?? '',
    email: primary?.email ?? data.email ?? '',
  };
}

export const EMPTY_CONTACT: CustomerContact = {
  designation: '',
  name: '',
  phone: '',
  email: '',
};
