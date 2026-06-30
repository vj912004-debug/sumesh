export type WorkOrder = {
  id: string;
  orderId: string;
  productId: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Material Kitting' | 'Assembly' | 'Testing' | 'Completed';
  progress: number;
};

export type InventoryItem = {
  id: string;
  partNumber: string;
  name: string;
  category: 'Raw Material' | 'Component' | 'Finished Good' | 'Consumable';
  stockMain: number;
  stockSubcon: number;
  uom: string;
  reorderLevel: number;
};

// Mock Work Orders
export const mockWorkOrders: WorkOrder[] = [
  { id: 'WO-26-101', orderId: 'SO-26-001', productId: 'PROD-005', startDate: '2026-06-25', endDate: '2026-07-10', status: 'Assembly', progress: 60 },
  { id: 'WO-26-102', orderId: 'SO-26-002', productId: 'PROD-002', startDate: '2026-05-15', endDate: '2026-06-20', status: 'Testing', progress: 90 },
  { id: 'WO-26-103', orderId: 'SO-26-004', productId: 'PROD-003', startDate: '2026-07-01', endDate: '2026-07-15', status: 'Material Kitting', progress: 10 },
];

// Mock Inventory
export const mockInventory: InventoryItem[] = [
  { id: 'INV-1001', partNumber: 'MS-PL-10MM', name: 'MS Plate 10mm IS2062', category: 'Raw Material', stockMain: 4500, stockSubcon: 1200, uom: 'Kg', reorderLevel: 2000 },
  { id: 'INV-1002', partNumber: 'PUMP-GEAR-50', name: 'Gear Pump 50 LPM', category: 'Component', stockMain: 12, stockSubcon: 0, uom: 'Nos', reorderLevel: 5 },
  { id: 'INV-1003', partNumber: 'HTR-3KW', name: 'Heater Element 3KW', category: 'Component', stockMain: 45, stockSubcon: 0, uom: 'Nos', reorderLevel: 20 },
  { id: 'INV-1004', partNumber: 'FLT-EL-5M', name: 'Filter Element 5 Micron', category: 'Consumable', stockMain: 150, stockSubcon: 0, uom: 'Nos', reorderLevel: 50 },
  { id: 'INV-1005', partNumber: 'VLV-BLL-1IN', name: 'Ball Valve 1" SS304', category: 'Component', stockMain: 34, stockSubcon: 5, uom: 'Nos', reorderLevel: 15 },
];
