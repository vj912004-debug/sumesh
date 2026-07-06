export type WorkOrder = {
  id: string;
  orderId: string;
  productId: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Material Kitting' | 'Assembly' | 'Testing' | 'Completed';
  progress: number;
  quotationId?: string;
  clientPoNumber?: string;
  quantity?: number;
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
  { id: 'INV-1006', partNumber: 'SS-PL-3MM', name: 'SS Plate 3mm SS304', category: 'Raw Material', stockMain: 2200, stockSubcon: 400, uom: 'Kg', reorderLevel: 800, unitCost: 220 },
  { id: 'INV-1007', partNumber: 'MS-ANG-50', name: 'MS Angle 50x50x6', category: 'Raw Material', stockMain: 1800, stockSubcon: 0, uom: 'Kg', reorderLevel: 500, unitCost: 72 },
  { id: 'INV-1008', partNumber: 'PNT-EPX-PRM', name: 'Epoxy Primer Industrial', category: 'Consumable', stockMain: 80, stockSubcon: 0, uom: 'Ltr', reorderLevel: 30, unitCost: 420 },
  { id: 'INV-1009', partNumber: 'PNT-TOP-BLU', name: 'Top Coat Blue RAL 5015', category: 'Consumable', stockMain: 65, stockSubcon: 0, uom: 'Ltr', reorderLevel: 25, unitCost: 380 },
  { id: 'INV-1010', partNumber: 'GSK-NBR-2IN', name: 'Gasket NBR 2 Inch', category: 'Consumable', stockMain: 200, stockSubcon: 0, uom: 'Nos', reorderLevel: 50, unitCost: 45 },
  { id: 'INV-1011', partNumber: 'MTR-5HP-3PH', name: 'Motor 5HP 3 Phase', category: 'Component', stockMain: 8, stockSubcon: 2, uom: 'Nos', reorderLevel: 3, unitCost: 28500 },
  { id: 'INV-1012', partNumber: 'PLC-MOD-S7', name: 'PLC Module Siemens S7', category: 'Component', stockMain: 4, stockSubcon: 0, uom: 'Nos', reorderLevel: 2, unitCost: 42000 },
  { id: 'INV-1013', partNumber: 'HOSE-R4-1IN', name: 'Hydraulic Hose R4 1 Inch', category: 'Component', stockMain: 120, stockSubcon: 0, uom: 'Mtr', reorderLevel: 40, unitCost: 320 },
  { id: 'INV-1014', partNumber: 'FLG-BLND-4IN', name: 'Blind Flange 4 Inch CS', category: 'Component', stockMain: 24, stockSubcon: 0, uom: 'Nos', reorderLevel: 8, unitCost: 950 },
  { id: 'INV-1015', partNumber: 'BOLT-M16-80', name: 'Hex Bolt M16x80 Grade 8.8', category: 'Consumable', stockMain: 500, stockSubcon: 0, uom: 'Nos', reorderLevel: 200, unitCost: 18 },
  { id: 'INV-1016', partNumber: 'WLD-ELCT-3.2', name: 'Welding Electrode 3.2mm', category: 'Consumable', stockMain: 300, stockSubcon: 0, uom: 'Kg', reorderLevel: 100, unitCost: 145 },
  { id: 'INV-1017', partNumber: 'VAC-PMP-300', name: 'Vacuum Pump 300 m3/hr', category: 'Component', stockMain: 3, stockSubcon: 0, uom: 'Nos', reorderLevel: 1, unitCost: 185000 },
  { id: 'INV-1018', partNumber: 'PNL-CP-STD', name: 'Control Panel Standard', category: 'Component', stockMain: 5, stockSubcon: 0, uom: 'Nos', reorderLevel: 2, unitCost: 65000 },
  { id: 'INV-1019', partNumber: 'TANK-MS-5KL', name: 'MS Storage Tank 5 KL', category: 'Component', stockMain: 2, stockSubcon: 0, uom: 'Nos', reorderLevel: 1, unitCost: 125000 },
  { id: 'INV-1020', partNumber: 'SEAL-MECH-40', name: 'Mechanical Seal 40mm', category: 'Consumable', stockMain: 18, stockSubcon: 0, uom: 'Nos', reorderLevel: 6, unitCost: 4200 },
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

