const TICKETS_KEY = 'sp2_service_tickets';

export type ServiceTicketType = 'Warranty' | 'AMC Routine' | 'Breakdown' | 'Commissioning';
export type ServiceTicketStatus = 'Open' | 'Scheduled' | 'In Progress' | 'Closed';

export type ServiceTicket = {
  id: string;
  customer: string;
  customerId?: string;
  machine: string;
  type: ServiceTicketType;
  status: ServiceTicketStatus;
  date: string;
  sparesUsed?: string;
  enquiryId?: string;
  quotationId?: string;
  notes?: string;
};

const SEED: ServiceTicket[] = [
  { id: 'SRV-26-401', customer: 'Tata Power', customerId: 'CUST-002', machine: 'SP/26/1012', type: 'Warranty', status: 'Open', date: '2026-06-29' },
  { id: 'SRV-26-402', customer: 'Reliance Ind.', customerId: 'CUST-001', machine: 'SP/24/0905', type: 'AMC Routine', status: 'Scheduled', date: '2026-07-05' },
  { id: 'SRV-26-403', customer: 'Adani Electricity', customerId: 'CUST-004', machine: 'SP/21/0401', type: 'Breakdown', status: 'In Progress', date: '2026-06-30', sparesUsed: 'Filter Cartridges (x2)' },
];

function readAll(): ServiceTicket[] {
  try {
    const saved = localStorage.getItem(TICKETS_KEY);
    if (saved) {
      const parsed: ServiceTicket[] = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  localStorage.setItem(TICKETS_KEY, JSON.stringify(SEED));
  return SEED;
}

function saveAll(tickets: ServiceTicket[]): void {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

export function loadServiceTickets(): ServiceTicket[] {
  return readAll();
}

export function createServiceTicket(
  input: Omit<ServiceTicket, 'id' | 'date' | 'status'> & { status?: ServiceTicketStatus; date?: string }
): ServiceTicket {
  const all = readAll();
  const nums = all.map(t => Number(t.id.match(/SRV-26-(\d+)/)?.[1] ?? 0));
  const next = nums.length ? Math.max(...nums) + 1 : 401;
  const ticket: ServiceTicket = {
    id: `SRV-26-${next}`,
    date: input.date ?? new Date().toISOString().split('T')[0],
    status: input.status ?? 'Open',
    customer: input.customer,
    customerId: input.customerId,
    machine: input.machine,
    type: input.type,
    sparesUsed: input.sparesUsed,
    enquiryId: input.enquiryId,
    quotationId: input.quotationId,
    notes: input.notes,
  };
  saveAll([ticket, ...all]);
  return ticket;
}

export function updateServiceTicket(id: string, patch: Partial<ServiceTicket>): ServiceTicket {
  const all = readAll();
  const idx = all.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Service ticket not found.');
  all[idx] = { ...all[idx], ...patch };
  saveAll(all);
  return all[idx];
}
