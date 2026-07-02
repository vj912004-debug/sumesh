// src/lib/api.ts
import { mockCustomers, mockEnquiries, mockQuotations, mockOrders } from './mockData';
import { processErpEvent } from './erpEvents';

// Keys for localStorage
const CUSTOMERS_KEY = 'sp2_customers';
const ENQUIRIES_KEY = 'sp2_enquiries';
const QUOTATIONS_KEY = 'sp2_quotations';
const ORDERS_KEY = 'sp2_orders';

// Seeding function to initialize localStorage if empty
function initDatabase() {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem(CUSTOMERS_KEY)) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(mockCustomers));
    }
    if (!localStorage.getItem(ENQUIRIES_KEY)) {
      localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(mockEnquiries));
    }
    if (!localStorage.getItem(QUOTATIONS_KEY)) {
      localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(mockQuotations));
    }
    if (!localStorage.getItem(ORDERS_KEY)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(mockOrders));
    }
  }
}

// Call init immediately
initDatabase();

// Simulates a short network latency
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  get: async (url: string, _config?: any): Promise<{ data: any }> => {
    await delay();
    
    // Auth endpoints
    if (url === '/auth/me') {
      const token = localStorage.getItem('token');
      if (!token) {
        throw { response: { status: 401, data: { error: 'Unauthorized' } } };
      }
      return {
        data: {
          id: 'usr-1',
          email: 'admin@sumesh.com',
          name: 'Admin User',
          role: 'admin',
        }
      };
    }

    // Customers endpoints
    if (url === '/crm/customers') {
      const customers = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
      return { data: customers };
    }

    const customerMatch = url.match(/^\/crm\/customers\/([^/]+)$/);
    if (customerMatch) {
      const id = customerMatch[1];
      const customers = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
      const customer = customers.find((c: any) => c.id === id);
      if (!customer) {
        throw { response: { status: 404, data: { error: 'Customer not found' } } };
      }
      // Fetch orders history for this customer
      const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      const customerOrders = orders.filter((o: any) => o.customerId === id);
      return {
        data: {
          ...customer,
          orders: customerOrders
        }
      };
    }

    // Enquiries endpoints
    if (url === '/crm/enquiries') {
      const enquiries = JSON.parse(localStorage.getItem(ENQUIRIES_KEY) || '[]');
      const customers = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
      const populated = enquiries.map((enq: any) => {
        const customer = customers.find((c: any) => c.id === enq.customerId);
        return {
          ...enq,
          customer
        };
      });
      return { data: populated };
    }

    // Quotations endpoints
    if (url === '/sales/quotations') {
      const quotations = JSON.parse(localStorage.getItem(QUOTATIONS_KEY) || '[]');
      const customers = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
      const populated = quotations.map((quote: any) => {
        const customer = customers.find((c: any) => c.id === quote.customerId);
        return {
          ...quote,
          customer
        };
      });
      return { data: populated };
    }

    console.warn(`Mock API GET unhandled URL: ${url}`);
    throw { response: { status: 404, data: { error: `Not found: ${url}` } } };
  },

  post: async (url: string, data?: any, _config?: any): Promise<{ data: any }> => {
    await delay();

    // Login endpoint
    if (url === '/auth/login') {
      const { email, password } = data || {};
      if (email === 'admin@sumesh.com' && password === 'password123') {
        return {
          data: {
            token: 'mock-jwt-token',
            user: {
              id: 'usr-1',
              email: 'admin@sumesh.com',
              name: 'Admin User',
              role: 'admin',
            }
          }
        };
      } else {
        throw { response: { status: 400, data: { error: 'Invalid credentials. Use admin@sumesh.com / password123' } } };
      }
    }

    // Create Customer
    if (url === '/crm/customers') {
      const customers = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
      const newId = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
      const newCustomer = {
        id: newId,
        ...data
      };
      customers.push(newCustomer);
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
      return { data: newCustomer };
    }

    // Create Enquiry
    if (url === '/crm/enquiries') {
      const enquiries = JSON.parse(localStorage.getItem(ENQUIRIES_KEY) || '[]');
      const year = new Date().getFullYear();
      const newId = `ENQ-${year}-${String(enquiries.length + 1).padStart(3, '0')}`;
      const newEnquiry = {
        id: newId,
        date: new Date().toISOString().split('T')[0],
        status: 'Open',
        ...data
      };
      enquiries.push(newEnquiry);
      localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));

      const customers = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
      const customer = customers.find((c: any) => c.id === newEnquiry.customerId);

      processErpEvent('enquiry.created', {
        enquiryId: newEnquiry.id,
        customerId: newEnquiry.customerId,
        customerName: customer?.name,
        customerEmail: customer?.email,
        customerPhone: customer?.phone,
        contactPerson: customer?.contactPerson,
        requirements: newEnquiry.requirements,
        expectedValue: newEnquiry.expectedValue,
      });

      return { data: newEnquiry };
    }

    console.warn(`Mock API POST unhandled URL: ${url}`);
    throw { response: { status: 404, data: { error: `Not found: ${url}` } } };
  },

  put: async (url: string, data?: any, _config?: any): Promise<{ data: any }> => {
    await delay();

    // Update Customer
    const customerMatch = url.match(/^\/crm\/customers\/([^/]+)$/);
    if (customerMatch) {
      const id = customerMatch[1];
      const customers = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
      const index = customers.findIndex((c: any) => c.id === id);
      if (index === -1) {
        throw { response: { status: 404, data: { error: 'Customer not found' } } };
      }
      customers[index] = { ...customers[index], ...data };
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
      return { data: customers[index] };
    }

    console.warn(`Mock API PUT unhandled URL: ${url}`);
    throw { response: { status: 404, data: { error: `Not found: ${url}` } } };
  },

  delete: async (url: string, _config?: any): Promise<{ data: any }> => {
    await delay();

    // Delete Customer
    const customerMatch = url.match(/^\/crm\/customers\/([^/]+)$/);
    if (customerMatch) {
      const id = customerMatch[1];
      const customers = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
      const index = customers.findIndex((c: any) => c.id === id);
      if (index === -1) {
        throw { response: { status: 404, data: { error: 'Customer not found' } } };
      }
      const filtered = customers.filter((c: any) => c.id !== id);
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(filtered));
      return { data: { success: true } };
    }

    console.warn(`Mock API DELETE unhandled URL: ${url}`);
    throw { response: { status: 404, data: { error: `Not found: ${url}` } } };
  },

  // Dummy interceptors object to avoid compile errors
  interceptors: {
    request: {
      use: (_onFulfilled?: any, _onRejected?: any) => {
        return 0;
      }
    },
    response: {
      use: (_onFulfilled?: any, _onRejected?: any) => {
        return 0;
      }
    }
  }
};
