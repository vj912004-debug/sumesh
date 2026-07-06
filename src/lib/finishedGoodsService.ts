import { mockProducts, type Product } from './mockData';
import { getWoLedger } from './woMaterialIssue';
import type { WorkOrder } from './mockData2';

const PRODUCTS_KEY = 'sp2_products';
const FG_RECEIPTS_KEY = 'sp2_fg_receipts';

export type FgReceipt = {
  id: string;
  receiptRef: string;
  woId: string;
  orderId: string;
  productId: string;
  productName: string;
  productModel: string;
  quantity: number;
  serialNo: string;
  materialCost: number;
  unitValue: number;
  location: 'FG Storage';
  qaStatus: 'Pending QA' | 'Passed';
  receivedAt: string;
  receivedBy: string;
};

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function loadProducts(): Product[] {
  if (typeof window === 'undefined') return mockProducts;
  try {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mockProducts));
  return mockProducts;
}

export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function loadFgReceipts(): FgReceipt[] {
  try {
    return JSON.parse(localStorage.getItem(FG_RECEIPTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveFgReceipts(receipts: FgReceipt[]): void {
  localStorage.setItem(FG_RECEIPTS_KEY, JSON.stringify(receipts));
}

function nextReceiptRef(): string {
  const receipts = loadFgReceipts();
  const nums = receipts
    .map(r => r.receiptRef.match(/FGR-26-(\d+)/)?.[1])
    .filter(Boolean)
    .map(Number);
  const next = nums.length ? Math.max(...nums) + 1 : 501;
  return `FGR-26-${next}`;
}

function nextSerialNo(product: Product, woId: string): string {
  const suffix = woId.replace('WO-26-', '');
  const modelCode = product.model.replace(/\s+/g, '').slice(0, 8).toUpperCase();
  return `FG/${modelCode}/${suffix}`;
}

export function getFgReceiptByWo(woId: string): FgReceipt | undefined {
  return loadFgReceipts().find(r => r.woId === woId);
}

export function getFgReceipts(): FgReceipt[] {
  return loadFgReceipts().sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export function getFinishedGoodsStock(): Array<Product & { fgLocation: string }> {
  return loadProducts().map(p => ({
    ...p,
    fgLocation: 'FG Storage',
  }));
}

/** Receive completed WO output into finished goods stock */
export function receiveFinishedGoodsFromWo(
  wo: WorkOrder,
  doneBy = 'Production'
): FgReceipt {
  const existing = getFgReceiptByWo(wo.id);
  if (existing) return existing;

  const products = loadProducts();
  const product = products.find(p => p.id === wo.productId);
  if (!product) throw new Error('Product not found for this work order.');

  const qty = wo.quantity ?? 1;
  const ledger = getWoLedger(wo.id);
  const materialCost = ledger.totalMaterialCost;
  const unitValue = product.basePrice;

  const receipt: FgReceipt = {
    id: `FG-${Date.now()}`,
    receiptRef: nextReceiptRef(),
    woId: wo.id,
    orderId: wo.orderId,
    productId: product.id,
    productName: product.name,
    productModel: product.model,
    quantity: qty,
    serialNo: nextSerialNo(product, wo.id),
    materialCost,
    unitValue,
    location: 'FG Storage',
    qaStatus: 'Pending QA',
    receivedAt: today(),
    receivedBy: doneBy,
  };

  const idx = products.findIndex(p => p.id === product.id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], stock: products[idx].stock + qty };
    saveProducts(products);
  }

  saveFgReceipts([receipt, ...loadFgReceipts()]);
  return receipt;
}

export function markFgQaPassed(receiptRef: string): FgReceipt {
  const receipts = loadFgReceipts();
  const idx = receipts.findIndex(r => r.receiptRef === receiptRef);
  if (idx === -1) throw new Error('FG receipt not found.');
  receipts[idx] = { ...receipts[idx], qaStatus: 'Passed' };
  saveFgReceipts(receipts);
  return receipts[idx];
}

export function getFgStockSummary(): {
  totalUnits: number;
  totalValue: number;
  productCount: number;
  pendingQa: number;
} {
  const products = loadProducts();
  const receipts = loadFgReceipts();
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + p.stock * p.basePrice, 0);
  return {
    totalUnits,
    totalValue,
    productCount: products.filter(p => p.stock > 0).length,
    pendingQa: receipts.filter(r => r.qaStatus === 'Pending QA').length,
  };
}
