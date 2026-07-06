import { getStoredEnquiries, getMockOrders, type Customer } from './mockData';
import { getQuotations } from './quotationService';

const CUSTOMERS_KEY = 'sp2_customers';

export type AreaCustomerRow = {
  customerId: string;
  customerName: string;
  city: string;
  state: string;
  address: string;
  gstin: string;
  contactPerson: string;
  phone: string;
  enquiryCount: number;
  openEnquiries: number;
  quotationCount: number;
  quotationValue: number;
  orderCount: number;
  orderValue: number;
};

export type CityAreaSummary = {
  city: string;
  state: string;
  customerCount: number;
  enquiryCount: number;
  openEnquiries: number;
  quotationCount: number;
  quotationValue: number;
  orderCount: number;
  orderValue: number;
  customers: AreaCustomerRow[];
};

export type StateAreaSummary = {
  state: string;
  customerCount: number;
  cityCount: number;
  enquiryCount: number;
  openEnquiries: number;
  quotationCount: number;
  quotationValue: number;
  orderCount: number;
  orderValue: number;
  cities: CityAreaSummary[];
};

export function loadCustomers(): Customer[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function buildCustomerRow(customer: Customer): AreaCustomerRow {
  const enquiries = getStoredEnquiries().filter(e => e.customerId === customer.id);
  const quotations = getQuotations().filter(q => q.customerId === customer.id);
  const orders = getMockOrders().filter(o => o.customerId === customer.id);

  return {
    customerId: customer.id,
    customerName: customer.name,
    city: customer.city?.trim() || '—',
    state: customer.state?.trim() || '—',
    address: customer.address ?? '',
    gstin: customer.gstin ?? '',
    contactPerson: customer.contactPerson ?? '',
    phone: customer.phone ?? '',
    enquiryCount: enquiries.length,
    openEnquiries: enquiries.filter(e => e.status === 'Open' || e.status === 'In Progress').length,
    quotationCount: quotations.length,
    quotationValue: quotations.reduce((s, q) => s + q.totalAmount, 0),
    orderCount: orders.length,
    orderValue: orders.reduce((s, o) => s + o.totalAmount, 0),
  };
}

export function getAreaWiseCustomerReport(): StateAreaSummary[] {
  const customers = loadCustomers().map(buildCustomerRow);
  const stateMap = new Map<string, Map<string, AreaCustomerRow[]>>();

  for (const c of customers) {
    const state = c.state || 'Unspecified';
    const city = c.city || 'Unspecified';
    if (!stateMap.has(state)) stateMap.set(state, new Map());
    const cityMap = stateMap.get(state)!;
    if (!cityMap.has(city)) cityMap.set(city, []);
    cityMap.get(city)!.push(c);
  }

  const states: StateAreaSummary[] = [];

  for (const [state, cityMap] of stateMap) {
    const cities: CityAreaSummary[] = [];
    for (const [city, rows] of cityMap) {
      cities.push({
        city,
        state,
        customerCount: rows.length,
        enquiryCount: rows.reduce((s, r) => s + r.enquiryCount, 0),
        openEnquiries: rows.reduce((s, r) => s + r.openEnquiries, 0),
        quotationCount: rows.reduce((s, r) => s + r.quotationCount, 0),
        quotationValue: rows.reduce((s, r) => s + r.quotationValue, 0),
        orderCount: rows.reduce((s, r) => s + r.orderCount, 0),
        orderValue: rows.reduce((s, r) => s + r.orderValue, 0),
        customers: rows.sort((a, b) => a.customerName.localeCompare(b.customerName)),
      });
    }
    cities.sort((a, b) => b.customerCount - a.customerCount || a.city.localeCompare(b.city));
    states.push({
      state,
      customerCount: cities.reduce((s, c) => s + c.customerCount, 0),
      cityCount: cities.length,
      enquiryCount: cities.reduce((s, c) => s + c.enquiryCount, 0),
      openEnquiries: cities.reduce((s, c) => s + c.openEnquiries, 0),
      quotationCount: cities.reduce((s, c) => s + c.quotationCount, 0),
      quotationValue: cities.reduce((s, c) => s + c.quotationValue, 0),
      orderCount: cities.reduce((s, c) => s + c.orderCount, 0),
      orderValue: cities.reduce((s, c) => s + c.orderValue, 0),
      cities,
    });
  }

  return states.sort((a, b) => b.customerCount - a.customerCount || a.state.localeCompare(b.state));
}

export function getReportSummary(states: StateAreaSummary[]) {
  return {
    totalCustomers: states.reduce((s, st) => s + st.customerCount, 0),
    totalStates: states.length,
    totalCities: states.reduce((s, st) => s + st.cityCount, 0),
    totalEnquiries: states.reduce((s, st) => s + st.enquiryCount, 0),
    totalQuotationValue: states.reduce((s, st) => s + st.quotationValue, 0),
    totalOrderValue: states.reduce((s, st) => s + st.orderValue, 0),
  };
}

export function getUniqueStates(states: StateAreaSummary[]): string[] {
  return states.map(s => s.state).sort();
}
