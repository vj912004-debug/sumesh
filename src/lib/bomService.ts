import { mockBOMs, type BOM } from './mockData2';

const BOM_STORAGE_KEY = 'sp2_boms';

export function loadBoms(): BOM[] {
  if (typeof window === 'undefined') return mockBOMs;
  try {
    const saved = localStorage.getItem(BOM_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  localStorage.setItem(BOM_STORAGE_KEY, JSON.stringify(mockBOMs));
  return mockBOMs;
}

export function saveBoms(boms: BOM[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOM_STORAGE_KEY, JSON.stringify(boms));
}

export function getBomForProduct(productId: string): BOM | undefined {
  return loadBoms().find(b => b.productId === productId);
}

export function saveBom(bom: BOM): void {
  const boms = loadBoms();
  const idx = boms.findIndex(b => b.productId === bom.productId || b.id === bom.id);
  if (idx >= 0) {
    boms[idx] = bom;
  } else {
    boms.push(bom);
  }
  saveBoms(boms);
}

export function createDraftBom(productId: string): BOM {
  return {
    id: `BOM-SP${Math.floor(1000 + Math.random() * 9000)}`,
    productId,
    version: 'v1.0',
    status: 'Draft',
    lastUpdated: new Date().toISOString().split('T')[0],
    items: [],
  };
}
