// src/lib/mockData.ts

export type CustomerContact = {
  designation: string;
  name: string;
  phone: string;
  email?: string;
};

export type Customer = {
  id: string;
  name: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  contactPerson: string;
  email: string;
  phone: string;
  contacts?: CustomerContact[];
};

export type Product = {
  id: string;
  name: string;
  model: string;
  category: string;
  basePrice: number;
  stock: number;
};

export type Enquiry = {
  id: string;
  date: string;
  customerId: string;
  source: 'Website' | 'Email' | 'Phone' | 'Direct';
  status: 'Open' | 'Quoted' | 'Lost' | 'Converted';
  requirements: string;
  expectedValue: number;
};

export type Quotation = {
  id: string;
  date: string;
  enquiryId: string;
  customerId: string;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  items: { productId: string; quantity: number; unitPrice: number }[];
};

export type Order = {
  id: string;
  date: string;
  quotationId: string;
  customerId: string;
  status: 'Pending' | 'In Production' | 'Ready for Dispatch' | 'Dispatched' | 'Delivered';
  totalAmount: number;
};

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: 'CUST-001', name: 'Reliance Industries Ltd', gstin: '24AAACR4063A1Z5',
    address: 'Reliance Corporate Park, Ghansoli', city: 'Navi Mumbai', state: 'Maharashtra',
    contactPerson: 'Rajeev Sharma', email: 'rajeev.sharma@ril.com', phone: '+91 9876543210',
    contacts: [
      { designation: 'Purchase Manager', name: 'Rajeev Sharma', phone: '+91 9876543210', email: 'rajeev.sharma@ril.com' },
      { designation: 'Plant Engineer', name: 'Priya Nair', phone: '+91 9876543211' },
      { designation: 'Accounts', name: 'Suresh Iyer', phone: '+91 9876543212' },
    ],
  },
  {
    id: 'CUST-002', name: 'Tata Power', gstin: '27AAACT2727Q1Z8',
    address: 'Bombay House, Homi Mody Street', city: 'Mumbai', state: 'Maharashtra',
    contactPerson: 'Sneha Patel', email: 'sneha.patel@tatapower.com', phone: '+91 8765432109',
    contacts: [
      { designation: 'Project Head', name: 'Sneha Patel', phone: '+91 8765432109', email: 'sneha.patel@tatapower.com' },
      { designation: 'Maintenance In-Charge', name: 'Karan Mehta', phone: '+91 8765432110' },
    ],
  },
  {
    id: 'CUST-003', name: 'Larsen & Toubro', gstin: '24AAACL0140P1Z1',
    address: 'L&T Knowledge City, NH 8', city: 'Vadodara', state: 'Gujarat',
    contactPerson: 'Amit Desai', email: 'amit.desai@larsentoubro.com', phone: '+91 7654321098',
    contacts: [
      { designation: 'Procurement Officer', name: 'Amit Desai', phone: '+91 7654321098', email: 'amit.desai@larsentoubro.com' },
    ],
  },
  {
    id: 'CUST-004', name: 'Adani Green Energy', gstin: '24AAACA5376Q1Z9',
    address: 'Adani Corporate House, Shantigram', city: 'Ahmedabad', state: 'Gujarat',
    contactPerson: 'Vikram Singh', email: 'vikram.singh@adani.com', phone: '+91 6543210987',
    contacts: [
      { designation: 'Technical Manager', name: 'Vikram Singh', phone: '+91 6543210987', email: 'vikram.singh@adani.com' },
      { designation: 'Site Supervisor', name: 'Deepak Rao', phone: '+91 6543210988' },
    ],
  },
  {
    id: 'CUST-005', name: 'Torrent Power', gstin: '24AAACT8765R1Z3',
    address: 'Samanvay, Tapovan', city: 'Ahmedabad', state: 'Gujarat',
    contactPerson: 'Meera Joshi', email: 'meera.joshi@torrentpower.com', phone: '+91 9988776655',
    contacts: [
      { designation: 'Operations Manager', name: 'Meera Joshi', phone: '+91 9988776655', email: 'meera.joshi@torrentpower.com' },
    ],
  },
];

// Mock Products
export const mockProducts: Product[] = [
  { id: 'PROD-001', name: 'Transformer Oil Filtration Plant', model: '6000 LPH', category: 'Filtration Plant', basePrice: 1500000, stock: 2 },
  { id: 'PROD-002', name: 'Transformer Oil Filtration Plant', model: '10000 LPH', category: 'Filtration Plant', basePrice: 2200000, stock: 1 },
  { id: 'PROD-003', name: 'Dry Air Generator', model: 'DAG-50', category: 'Generator', basePrice: 850000, stock: 4 },
  { id: 'PROD-004', name: 'Mobile Storage Tank', model: '20 KL', category: 'Storage', basePrice: 450000, stock: 5 },
  { id: 'PROD-005', name: 'Vacuum System', model: 'VS-500', category: 'Vacuum', basePrice: 1200000, stock: 0 },
];

// Mock Enquiries
export const mockEnquiries: Enquiry[] = [
  { id: 'ENQ-2026-001', date: '2026-06-15', customerId: 'CUST-001', source: 'Website', status: 'Quoted', requirements: 'Need a 6000 LPH Filtration Plant for new substation.', expectedValue: 1500000 },
  { id: 'ENQ-2026-002', date: '2026-06-18', customerId: 'CUST-003', source: 'Direct', status: 'Open', requirements: 'DAG-50 for site operation in Rajasthan.', expectedValue: 850000 },
  { id: 'ENQ-2026-003', date: '2026-06-20', customerId: 'CUST-005', source: 'Email', status: 'Converted', requirements: 'Vacuum system VS-500 urgent requirement.', expectedValue: 1200000 },
  { id: 'ENQ-2026-004', date: '2026-06-25', customerId: 'CUST-002', source: 'Phone', status: 'Open', requirements: 'Mobile Storage Tanks (20 KL) - Qty 2', expectedValue: 900000 },
  { id: 'ENQ-2026-005', date: '2026-06-28', customerId: 'CUST-004', source: 'Website', status: 'Open', requirements: '10000 LPH Filtration plant', expectedValue: 2200000 },
];

// Mock Quotations (party-wise history for past quoted rate lookup)
export const mockQuotations: Quotation[] = [
  { id: 'QT-26-001', date: '2026-06-16', enquiryId: 'ENQ-2026-001', customerId: 'CUST-001', totalAmount: 1500000, status: 'Sent', items: [{ productId: 'PROD-001', quantity: 1, unitPrice: 1500000 }] },
  { id: 'QT-26-002', date: '2026-06-21', enquiryId: 'ENQ-2026-003', customerId: 'CUST-005', totalAmount: 1200000, status: 'Accepted', items: [{ productId: 'PROD-005', quantity: 1, unitPrice: 1200000 }] },
  { id: 'QT-26-003', date: '2026-05-08', enquiryId: '', customerId: 'CUST-003', totalAmount: 2200000, status: 'Sent', items: [{ productId: 'PROD-002', quantity: 1, unitPrice: 2200000 }] },
  { id: 'QT-26-004', date: '2026-04-10', enquiryId: '', customerId: 'CUST-002', totalAmount: 880000, status: 'Rejected', items: [{ productId: 'PROD-004', quantity: 2, unitPrice: 440000 }] },
  { id: 'QT-26-005', date: '2026-03-15', enquiryId: '', customerId: 'CUST-001', totalAmount: 1450000, status: 'Rejected', items: [{ productId: 'PROD-001', quantity: 1, unitPrice: 1450000 }] },
  { id: 'QT-26-006', date: '2026-02-20', enquiryId: '', customerId: 'CUST-004', totalAmount: 2100000, status: 'Sent', items: [{ productId: 'PROD-002', quantity: 1, unitPrice: 2100000 }] },
];

// Mock Orders
const initialOrders: Order[] = [
  { id: 'SO-26-001', date: '2026-06-22', quotationId: 'QT-26-002', customerId: 'CUST-005', status: 'In Production', totalAmount: 1200000 },
  { id: 'SO-26-002', date: '2026-05-10', quotationId: 'QT-26-000', customerId: 'CUST-003', status: 'Ready for Dispatch', totalAmount: 2200000 },
  { id: 'SO-26-003', date: '2026-04-15', quotationId: 'QT-26-000', customerId: 'CUST-002', status: 'Dispatched', totalAmount: 850000 },
];

if (typeof window !== 'undefined' && !localStorage.getItem('mockOrders')) {
  localStorage.setItem('mockOrders', JSON.stringify(initialOrders));
}

export const getMockOrders = (): Order[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('mockOrders');
    if (saved) return JSON.parse(saved);
  }
  return initialOrders;
};

export const saveMockOrders = (orders: Order[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mockOrders', JSON.stringify(orders));
  }
};

export const mockOrders: Order[] = typeof window !== 'undefined' && localStorage.getItem('mockOrders')
  ? JSON.parse(localStorage.getItem('mockOrders')!)
  : initialOrders;

export type PackageItem = {
  productId: string;
  quantity: number;
};

export type Package = {
  packageNo: string;
  type: string; // e.g. "Wooden Box", "Crate", "Carton", "Loose"
  dimensions: string; // e.g. "120x80x100 cm"
  grossWeight: number; // in kg
  netWeight: number; // in kg
  items: PackageItem[];
};

export type PackingList = {
  id: string;
  orderId: string;
  challanNo: string;
  date: string;
  customerId: string;
  packages: Package[];
  carrierName: string;
  vehicleNo: string;
  lrNumber: string;
  status: 'Draft' | 'Finalized' | 'Shipped';
};

export const mockPackingLists: PackingList[] = [
  {
    id: 'PL-26-880',
    orderId: 'SO-26-002',
    challanNo: 'DC-26-880',
    date: '2026-06-30',
    customerId: 'CUST-003',
    carrierName: 'Safe Express',
    vehicleNo: 'GJ-06-XX-1234',
    lrNumber: 'LR-9021',
    status: 'Finalized',
    packages: [
      {
        packageNo: 'BOX-01',
        type: 'Wooden Box',
        dimensions: '180x120x150 cm',
        grossWeight: 450,
        netWeight: 400,
        items: [{ productId: 'PROD-002', quantity: 1 }]
      },
      {
        packageNo: 'BOX-02',
        type: 'Carton',
        dimensions: '50x50x40 cm',
        grossWeight: 25,
        netWeight: 20,
        items: [{ productId: 'PROD-003', quantity: 1 }]
      }
    ]
  },
  {
    id: 'PL-26-881',
    orderId: 'SO-26-003',
    challanNo: 'DC-26-881',
    date: '2026-06-28',
    customerId: 'CUST-002',
    carrierName: 'VRL Logistics',
    vehicleNo: 'MH-12-PQ-9876',
    lrNumber: 'LR-1104',
    status: 'Shipped',
    packages: [
      {
        packageNo: 'PKG-01',
        type: 'Crate',
        dimensions: '120x120x100 cm',
        grossWeight: 180,
        netWeight: 150,
        items: [{ productId: 'PROD-004', quantity: 1 }]
      }
    ]
  }
];

export const getStoredEnquiries = (): Enquiry[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sp2_enquiries');
    if (saved) return JSON.parse(saved);
  }
  return mockEnquiries;
};

