import { getMockOrders } from './mockData';
import { type WorkOrder } from './mockData2';
import { calculateMaterialEstimate, getDefaultRequirementSpec } from './costingService';
import { getCostEstimates } from './costEstimateData';
import { getQuotations } from './quotationService';

export type BuildProfitRecord = {
  id: string;
  workOrderId: string;
  orderId: string;
  productId: string;
  completedAt: string;
  revenue: number;
  estimatedCost: number;
  actualMaterialCost: number;
  actualLaborCost: number;
  actualOverheadCost: number;
  totalActualCost: number;
  profitLoss: number;
  profitMarginPct: number;
  laborHours: number;
  materialVariancePct: number;
  status: 'Profit' | 'Loss' | 'Break-even';
};

const STORAGE_KEY = 'sp2_build_profit';
const LABOR_KEY = 'sp2_wo_labor';
const LABOR_RATE = 450;
const SHOP_OVERHEAD_PCT = 12;

const seed: BuildProfitRecord[] = [
  {
    id: 'PL-26-001',
    workOrderId: 'WO-26-102',
    orderId: 'SO-26-002',
    productId: 'PROD-002',
    completedAt: '2026-06-18',
    revenue: 2200000,
    estimatedCost: 285000,
    actualMaterialCost: 312400,
    actualLaborCost: 54000,
    actualOverheadCost: 43968,
    totalActualCost: 410368,
    profitLoss: 1789632,
    profitMarginPct: 81.3,
    laborHours: 120,
    materialVariancePct: 9.6,
    status: 'Profit',
  },
];

function load(): BuildProfitRecord[] {
  if (typeof window === 'undefined') return seed;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(saved);
  } catch {
    return seed;
  }
}

function save(records: BuildProfitRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getBuildProfitRecords(): BuildProfitRecord[] {
  return load();
}

export function getBuildProfitByWorkOrder(workOrderId: string): BuildProfitRecord | undefined {
  return load().find(r => r.workOrderId === workOrderId);
}

export function getLaborHours(workOrderId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const data = JSON.parse(localStorage.getItem(LABOR_KEY) || '{}');
    return data[workOrderId] ?? 0;
  } catch {
    return 0;
  }
}

export function addLaborHours(workOrderId: string, hours: number): number {
  const total = getLaborHours(workOrderId) + hours;
  if (typeof window !== 'undefined') {
    const data = JSON.parse(localStorage.getItem(LABOR_KEY) || '{}');
    data[workOrderId] = total;
    localStorage.setItem(LABOR_KEY, JSON.stringify(data));
  }
  return total;
}

function varianceFactor(workOrderId: string): number {
  let hash = 0;
  for (let i = 0; i < workOrderId.length; i++) {
    hash = workOrderId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 0.92 + (Math.abs(hash) % 21) / 100;
}

function getEstimatedCostForOrder(orderId: string, productId: string): number {
  const orders = getMockOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    const est = calculateMaterialEstimate(productId, getDefaultRequirementSpec(productId));
    return est.totalBuildCost;
  }

  const quotation = getQuotations().find(q => q.id === order.quotationId);
  const estimate = quotation?.enquiryId
    ? getCostEstimates().find(e => e.enquiryId === quotation.enquiryId)
    : undefined;

  if (estimate) return estimate.buildCost;

  const calc = calculateMaterialEstimate(productId, getDefaultRequirementSpec(productId));
  return calc.totalBuildCost;
}

function defaultLaborHours(productId: string, progress: number): number {
  const base: Record<string, number> = {
    'PROD-001': 180,
    'PROD-002': 240,
    'PROD-003': 96,
    'PROD-004': 72,
    'PROD-005': 160,
  };
  const hours = base[productId] ?? 120;
  return Math.round(hours * (progress / 100));
}

export function calculateBuildProfit(
  wo: WorkOrder,
  laborHoursOverride?: number
): Omit<BuildProfitRecord, 'id'> {
  const order = getMockOrders().find(o => o.id === wo.orderId);
  const revenue = order?.totalAmount ?? 0;
  const estimatedCost = getEstimatedCostForOrder(wo.orderId, wo.productId);

  const spec = getDefaultRequirementSpec(wo.productId);
  const materialEst = calculateMaterialEstimate(wo.productId, spec);
  const variance = varianceFactor(wo.id);
  const actualMaterialCost = Math.round(materialEst.totalMaterialCost * variance);

  const loggedHours = laborHoursOverride ?? getLaborHours(wo.id);
  const laborHours = loggedHours > 0 ? loggedHours : defaultLaborHours(wo.productId, wo.progress);
  const actualLaborCost = Math.round(laborHours * LABOR_RATE);

  const actualOverheadCost = Math.round(
    (actualMaterialCost + actualLaborCost) * (SHOP_OVERHEAD_PCT / 100)
  );
  const totalActualCost = actualMaterialCost + actualLaborCost + actualOverheadCost;
  const profitLoss = revenue - totalActualCost;
  const profitMarginPct = revenue > 0 ? (profitLoss / revenue) * 100 : 0;
  const materialVariancePct = estimatedCost > 0
    ? ((actualMaterialCost - materialEst.totalMaterialCost) / materialEst.totalMaterialCost) * 100
    : 0;

  let status: BuildProfitRecord['status'] = 'Break-even';
  if (profitLoss > 0) status = 'Profit';
  else if (profitLoss < 0) status = 'Loss';

  return {
    workOrderId: wo.id,
    orderId: wo.orderId,
    productId: wo.productId,
    completedAt: new Date().toISOString().split('T')[0],
    revenue,
    estimatedCost,
    actualMaterialCost,
    actualLaborCost,
    actualOverheadCost,
    totalActualCost,
    profitLoss,
    profitMarginPct,
    laborHours,
    materialVariancePct,
    status,
  };
}

export function finalizeBuildProfit(wo: WorkOrder): BuildProfitRecord {
  const existing = getBuildProfitByWorkOrder(wo.id);
  if (existing) return existing;

  const calc = calculateBuildProfit(wo);
  const records = load();
  const doc: BuildProfitRecord = {
    ...calc,
    id: `PL-26-${String(records.length + 1).padStart(3, '0')}`,
  };
  save([doc, ...records]);
  return doc;
}

export function getProfitSummary() {
  const records = load();
  const totalRevenue = records.reduce((s, r) => s + r.revenue, 0);
  const totalCost = records.reduce((s, r) => s + r.totalActualCost, 0);
  const totalProfit = records.reduce((s, r) => s + r.profitLoss, 0);
  const profitCount = records.filter(r => r.status === 'Profit').length;
  const lossCount = records.filter(r => r.status === 'Loss').length;
  const avgMargin = records.length
    ? records.reduce((s, r) => s + r.profitMarginPct, 0) / records.length
    : 0;

  return { totalRevenue, totalCost, totalProfit, profitCount, lossCount, avgMargin, count: records.length };
}

export function getMaterialLinesForWorkOrder(productId: string, workOrderId: string) {
  const spec = getDefaultRequirementSpec(productId);
  const est = calculateMaterialEstimate(productId, spec);
  const variance = varianceFactor(workOrderId);

  return est.lines.map(line => ({
    ...line,
    plannedCost: line.lineCost,
    actualQty: Math.round(line.adjustedQty * variance * 100) / 100,
    actualCost: Math.round(line.lineCost * variance),
    variancePct: Math.round((variance - 1) * 1000) / 10,
  }));
}

export { LABOR_RATE, SHOP_OVERHEAD_PCT };
