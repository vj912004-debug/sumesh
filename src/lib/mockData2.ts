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
  unitCost: number;
};

export type BOMItem = {
  inventoryItemId: string;
  quantity: number;
};

export type BOM = {
  id: string;
  productId: string;
  version: string;
  status: 'Draft' | 'Approved' | 'Obsolete';
  lastUpdated: string;
  items: BOMItem[];
};

// Mock Work Orders
export const mockWorkOrders: WorkOrder[] = [
  { id: 'WO-26-101', orderId: 'SO-26-001', productId: 'PROD-005', startDate: '2026-06-25', endDate: '2026-07-10', status: 'Assembly', progress: 60 },
  { id: 'WO-26-102', orderId: 'SO-26-002', productId: 'PROD-002', startDate: '2026-05-15', endDate: '2026-06-20', status: 'Testing', progress: 90 },
  { id: 'WO-26-103', orderId: 'SO-26-004', productId: 'PROD-003', startDate: '2026-07-01', endDate: '2026-07-15', status: 'Material Kitting', progress: 10 },
];

// Mock Inventory
export const mockInventory: InventoryItem[] = [
  { id: 'INV-1001', partNumber: 'MS-PL-10MM', name: 'MS Plate 10mm IS2062', category: 'Raw Material', stockMain: 4500, stockSubcon: 1200, uom: 'Kg', reorderLevel: 2000, unitCost: 85 },
  { id: 'INV-1002', partNumber: 'PUMP-GEAR-50', name: 'Gear Pump 50 LPM', category: 'Component', stockMain: 12, stockSubcon: 0, uom: 'Nos', reorderLevel: 5, unitCost: 45000 },
  { id: 'INV-1003', partNumber: 'HTR-3KW', name: 'Heater Element 3KW', category: 'Component', stockMain: 45, stockSubcon: 0, uom: 'Nos', reorderLevel: 20, unitCost: 1200 },
  { id: 'INV-1004', partNumber: 'FLT-EL-5M', name: 'Filter Element 5 Micron', category: 'Consumable', stockMain: 150, stockSubcon: 0, uom: 'Nos', reorderLevel: 50, unitCost: 3500 },
  { id: 'INV-1005', partNumber: 'VLV-BLL-1IN', name: 'Ball Valve 1" SS304', category: 'Component', stockMain: 34, stockSubcon: 5, uom: 'Nos', reorderLevel: 15, unitCost: 1800 },
];

// Mock BOMs
export const mockBOMs: BOM[] = [
  {
    id: 'BOM-SP1012',
    productId: 'PROD-001',
    version: 'v1.0',
    status: 'Approved',
    lastUpdated: '2026-06-22',
    items: [
      { inventoryItemId: 'INV-1001', quantity: 800 },
      { inventoryItemId: 'INV-1002', quantity: 1 },
      { inventoryItemId: 'INV-1003', quantity: 6 },
      { inventoryItemId: 'INV-1004', quantity: 3 },
      { inventoryItemId: 'INV-1005', quantity: 12 }
    ]
  },
  {
    id: 'BOM-SP1013',
    productId: 'PROD-002',
    version: 'v1.1',
    status: 'Approved',
    lastUpdated: '2026-06-25',
    items: [
      { inventoryItemId: 'INV-1001', quantity: 1200 },
      { inventoryItemId: 'INV-1002', quantity: 2 },
      { inventoryItemId: 'INV-1003', quantity: 10 },
      { inventoryItemId: 'INV-1004', quantity: 5 },
      { inventoryItemId: 'INV-1005', quantity: 20 }
    ]
  },
  {
    id: 'BOM-SP1014',
    productId: 'PROD-003',
    version: 'v1.0',
    status: 'Draft',
    lastUpdated: '2026-06-28',
    items: [
      { inventoryItemId: 'INV-1001', quantity: 150 },
      { inventoryItemId: 'INV-1003', quantity: 4 },
      { inventoryItemId: 'INV-1005', quantity: 6 }
    ]
  }
];

