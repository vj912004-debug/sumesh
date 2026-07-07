/**
 * Live demo: creates one Oil Filtration Plant order through the full ERP chain.
 */
import { api } from './api';
import type { Enquiry } from './mockData';
import { getMockOrders, saveMockOrders } from './mockData';
import { mockWorkOrders, type WorkOrder } from './mockData2';
import { createEstimateFromEnquiry } from './estimateFromEnquiry';
import { updateCostEstimate } from './costEstimateData';
import { createQuotationFromEstimate, updateQuotation } from './quotationService';
import { addQuotationBomLine, approveQuotationEstimatedBom } from './quotationEstimatedBom';
import { awardPoAndCreateWorkOrders } from './quoteAwardService';
import { createPurchaseOrder } from './purchaseOrderService';
import {
  issueMaterialToWo,
  loadInventory,
  returnMaterialFromWo,
  saveInventory,
} from './woMaterialIssue';
import { issueJobWorkOutward, recordJobWorkInward } from './jobWorkChallanService';
import { receiveFinishedGoodsFromWo, markFgQaPassed } from './finishedGoodsService';
import { processErpEvent } from './erpEvents';
import {
  getNextChallanNo,
  getPendingItemListRows,
  issueOutwardChallan,
  loadRentalItems,
  recordReturn,
  type RentalChallan,
} from './rentalAssetService';
import {
  issueWarrantyOutward,
  recordWarrantyInward,
} from './warrantyRepairService';
import {
  createServiceTicket,
  updateServiceTicket,
} from './serviceTicketService';
import {
  addProductToQuotation,
  createDirectQuotation,
} from './quotationService';

export type DemoRunResult = {
  results: DemoStepResult[];
  summary: Record<string, string | undefined>;
};

export type DemoStepResult = {
  step: number;
  title: string;
  phase: string;
  status: 'ok' | 'error' | 'skipped';
  detail: string;
  documentId?: string;
  path?: string;
  values?: Record<string, string | number>;
};

export type DemoProgressCallback = (
  result: DemoStepResult,
  ctx: { summary: Record<string, string | undefined> }
) => void | Promise<void>;

export type DemoRunOptions = {
  onStep?: DemoProgressCallback;
  onBeforeStep?: DemoProgressCallback;
  signal?: AbortSignal;
};

const DEMO_CUSTOMER_ID = 'CUST-002'; // Tata Power
const DEMO_ITEM_PLATE = 'INV-1001';
const DEMO_ITEM_MOTOR = 'INV-1011';

async function emitStep(
  results: DemoStepResult[],
  result: DemoStepResult,
  onStep: DemoProgressCallback | undefined,
  summary: Record<string, string | undefined>,
  signal?: AbortSignal
): Promise<boolean> {
  if (signal?.aborted) return false;
  results.push(result);
  if (onStep) await onStep(result, { summary });
  return !signal?.aborted;
}

async function pushStep(
  results: DemoStepResult[],
  step: number,
  title: string,
  phase: string,
  run: () => { detail: string; documentId?: string; path?: string; values?: Record<string, string | number> },
  onStep: DemoProgressCallback | undefined,
  summary: Record<string, string | undefined>,
  signal?: AbortSignal,
  onBeforeStep?: DemoProgressCallback
): Promise<boolean> {
  if (signal?.aborted) return false;
  const pending: DemoStepResult = { step, title, phase, status: 'ok', detail: '' };
  if (onBeforeStep) {
    await onBeforeStep({ ...pending, detail: `Opening ${title}…` }, { summary });
    if (signal?.aborted) return false;
  }
  let result: DemoStepResult;
  try {
    const out = run();
    result = { step, title, phase, status: 'ok', ...out };
  } catch (err) {
    result = {
      step,
      title,
      phase,
      status: 'error',
      detail: err instanceof Error ? err.message : 'Step failed.',
    };
  }
  results.push(result);
  if (onStep) await onStep(result, { summary });
  return !signal?.aborted;
}

function loadWorkOrders(): WorkOrder[] {
  try {
    const saved = localStorage.getItem('mockWorkOrders');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return mockWorkOrders;
}

function saveWorkOrders(wos: WorkOrder[]): void {
  localStorage.setItem('mockWorkOrders', JSON.stringify(wos));
}

function simulateGrn(poNo: string, itemId: string, qty: number): string {
  const inv = loadInventory();
  const item = inv.find(i => i.id === itemId);
  if (!item) throw new Error(`Item ${itemId} not in stock master.`);
  item.stockMain += qty;
  saveInventory(inv);
  const yy = String(new Date().getFullYear()).slice(-2);
  const grnNo = `GRN-${yy}-${String(Date.now()).slice(-4)}`;
  return `${grnNo} (+${qty} ${item.uom} for PO ${poNo})`;
}

export async function runDemoOilFiltrationOrder(options?: DemoRunOptions): Promise<DemoRunResult> {
  const { onStep, onBeforeStep, signal } = options ?? {};
  const results: DemoStepResult[] = [];
  const summary: Record<string, string | undefined> = {};
  const today = new Date().toISOString().split('T')[0];
  const stamp = Date.now();

  let enquiry: Enquiry | undefined;
  let quoteId: string | undefined;
  let orderId: string | undefined;
  let woId: string | undefined;
  let poId: string | undefined;
  let jwChallanId: string | undefined;
  let fgReceiptRef: string | undefined;

  try {
    if (signal?.aborted) return { results, summary };
    if (onBeforeStep) {
      await onBeforeStep({
        step: 1,
        title: 'Lead / Enquiry',
        phase: 'Sales & Engineering',
        status: 'ok',
        detail: 'Opening enquiry form for Tata Power…',
      }, { summary });
      if (signal?.aborted) return { results, summary };
    }
    const res = await api.post('/crm/enquiries', {
      customerId: DEMO_CUSTOMER_ID,
      enquiryType: 'supply',
      source: 'Phone',
      requirements:
        '6000 LPH Oil Filtration Plant for Kalyan substation — MS tank 10mm, 5 micron filtration, qty 1.',
      expectedValue: 1580000,
    });
    enquiry = res.data as Enquiry;
    summary.enquiryId = enquiry.id;
    const ok = await emitStep(results, {
      step: 1,
      title: 'Lead / Enquiry',
      phase: 'Sales & Engineering',
      status: 'ok',
      detail: `Enquiry logged for Tata Power — Oil Filtration Plant requirement.`,
      documentId: enquiry.id,
      path: `/enquiries/${enquiry.id}`,
      values: { expectedValue: enquiry.expectedValue },
    }, onStep, summary, signal);
    if (!ok) return { results, summary };
  } catch (err) {
    await emitStep(results, {
      step: 1,
      title: 'Lead / Enquiry',
      phase: 'Sales & Engineering',
      status: 'error',
      detail: err instanceof Error ? err.message : 'Could not create enquiry.',
    }, onStep, summary, signal);
    return { results, summary };
  }

  if (!(await pushStep(results, 2, 'Cost Estimate & BOM', 'Sales & Engineering', () => {
    const estimate = createEstimateFromEnquiry(enquiry!);
    updateCostEstimate(estimate.id, { status: 'Approved' });
    const quote = createQuotationFromEstimate(estimate);
    quoteId = quote.id;
    summary.quotationId = quote.id;
    addQuotationBomLine(quote.id, DEMO_ITEM_PLATE, 800);
    addQuotationBomLine(quote.id, DEMO_ITEM_MOTOR, 1);
    approveQuotationEstimatedBom(quote.id);
    updateQuotation(quote.id, { status: 'Accepted' });
    return {
      detail: `Estimate ${estimate.id} approved → Quotation ${quote.id} with BOM (MS plate 800 Kg + Motor 1 No).`,
      documentId: quote.id,
      path: `/quotations/${quote.id}`,
      values: { estimateId: estimate.id, quotedAmount: quote.totalAmount },
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 3, 'Client PO → Sales Order', 'Sales & Engineering', () => {
    const award = awardPoAndCreateWorkOrders({
      quotationId: quoteId!,
      clientPoNumber: `CPO-DEMO-${stamp}`,
      clientPoDate: today,
      targetDeliveryDate: new Date(Date.now() + 45 * 86_400_000).toISOString().split('T')[0],
    });
    orderId = award.orderId;
    woId = award.workOrderIds[0];
    summary.orderId = orderId;
    summary.workOrderId = woId;
    return {
      detail: `Client PO ${award.clientPoNumber} awarded → Sales Order ${orderId} with Work Order ${woId}.`,
      documentId: orderId,
      path: `/orders/${orderId}`,
      values: { workOrderId: woId!, clientPo: award.clientPoNumber },
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 4, 'Work Order Plan', 'Sales & Engineering', () => ({
    detail: `WO ${woId} in Material Kitting — estimated BOM linked from quotation.`,
    documentId: woId,
    path: `/work-orders/${woId}`,
  }), onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 5, 'Purchase Order', 'Purchase & Stores', () => {
    const po = createPurchaseOrder({
      poPurpose: 'Manufacture',
      vendorName: 'Laxmi Steels & Alloys',
      vendorGstin: '24AABCL1234F1Z9',
      deliveryDate: new Date(Date.now() + 14 * 86_400_000).toISOString().split('T')[0],
      workOrderRef: woId,
      remarks: `Demo PO for ${woId} — MS plate procurement`,
      lines: [{ inventoryItemId: DEMO_ITEM_PLATE, qty: 500, rate: 65 }],
    });
    poId = po.id;
    summary.poId = po.id;
    return {
      detail: `Manufacture PO raised to Laxmi Steels — 500 Kg MS plate for ${woId}.`,
      documentId: po.id,
      path: `/purchase-orders/${po.id}`,
      values: { poPurpose: 'Manufacture', lines: 1 },
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 6, 'GRN — Material Received', 'Purchase & Stores', () => {
    const grnRef = simulateGrn(poId!, DEMO_ITEM_PLATE, 500);
    summary.grnRef = grnRef;
    return {
      detail: `Gate GRN booked — stock increased. ${grnRef}`,
      documentId: grnRef.split(' ')[0],
      path: '/purchase/grn',
      values: { qtyReceived: 500 },
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 7, 'Material Issue to WO', 'Production', () => {
    const issue = issueMaterialToWo({
      woId: woId!,
      inventoryItemId: DEMO_ITEM_PLATE,
      quantity: 200,
      issueDate: today,
      issuedTo: 'Fabrication Bay',
      doneBy: 'Store Admin',
      userRole: 'admin',
      sourceType: 'Direct',
    });
    return {
      detail: `200 Kg MS plate issued to ${woId} — store stock reduced.`,
      documentId: issue.issueRef,
      path: '/inventory/material-issue',
      values: { qtyIssued: 200 },
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 8, 'Job Work Challan (Outward)', 'Production', () => {
    const jw = issueJobWorkOutward({
      subcontractorName: 'Shreeji Powder Coating',
      workOrderRef: woId,
      processDescription: 'Powder Coating',
      expectedReturnDate: new Date(Date.now() + 7 * 86_400_000).toISOString().split('T')[0],
      items: [{ inventoryItemId: DEMO_ITEM_PLATE, qty: 50 }],
    });
    jwChallanId = jw.id;
    return {
      detail: `Tank body sent for powder coating — Form 57F4 challan ${jw.id}.`,
      documentId: jw.id,
      path: '/inventory/job-work-challan',
      values: { qtySent: 50 },
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 9, 'Job Work Inward', 'Production', () => {
    recordJobWorkInward(jwChallanId!, today, { '1': 48 }, 2, 'Accepted', 'Painted body received');
    return {
      detail: `48 Kg returned painted, 2 Kg scrap — linked to ${jwChallanId}.`,
      documentId: jwChallanId,
      path: '/inventory/job-work-challan',
      values: { qtyReturned: 48, scrap: 2 },
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 10, 'Material Return to Store', 'Production', () => {
    const ret = returnMaterialFromWo({
      woId: woId!,
      inventoryItemId: DEMO_ITEM_PLATE,
      qtyToReturn: 15,
      returnDate: today,
      reason: 'Excess Issued',
      doneBy: 'Store Admin',
      userRole: 'admin',
    });
    return {
      detail: `15 Kg leftover plate returned to store — WO cost corrected.`,
      documentId: ret.issueRef,
      path: '/inventory/material-issue',
      values: { qtyReturned: 15 },
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 11, 'QC & Finished Goods', 'Finish & Dispatch', () => {
    const wos = loadWorkOrders();
    const idx = wos.findIndex(w => w.id === woId);
    if (idx === -1) throw new Error('Work order not found.');
    wos[idx] = { ...wos[idx], status: 'Completed', progress: 100 };
    saveWorkOrders(wos);
    const receipt = receiveFinishedGoodsFromWo(wos[idx], 'QC Inspector');
    markFgQaPassed(receipt.receiptRef);
    fgReceiptRef = receipt.receiptRef;
    summary.fgReceiptRef = receipt.receiptRef;
    return {
      detail: `QC passed → FG receipt ${receipt.receiptRef} (${receipt.serialNo}) in FG storage.`,
      documentId: receipt.receiptRef,
      path: '/inventory/finish-stock',
      values: { materialCost: receipt.materialCost, serialNo: receipt.serialNo },
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  await pushStep(results, 12, 'Ready for Dispatch', 'Finish & Dispatch', () => {
    const orders = getMockOrders();
    saveMockOrders(
      orders.map(o =>
        o.id === orderId ? { ...o, status: 'Ready for Dispatch' as const } : o
      )
    );
    processErpEvent('order.ready_for_dispatch', {
      orderId,
      customerId: DEMO_CUSTOMER_ID,
      customerName: 'Tata Power',
    });
    return {
      detail: `Sales Order ${orderId} marked Ready for Dispatch — packing & delivery challan can be raised.`,
      documentId: orderId,
      path: '/sales/dispatch-entry',
    };
  }, onStep, summary, signal, onBeforeStep);

  return { results, summary };
}

const RENTAL_CUSTOMER_ID = 'CUST-005'; // Torrent Power
const SERVICE_CUSTOMER_ID = 'CUST-001'; // Reliance
const RENTAL_ITEM_ID = 'RNT-003'; // Filtration Rig

/** Rental journey: enquiry → rental quote → returnable challan → pending tracking → return */
export async function runDemoRentalOrder(options?: DemoRunOptions): Promise<DemoRunResult> {
  const { onStep, onBeforeStep, signal } = options ?? {};
  const results: DemoStepResult[] = [];
  const summary: Record<string, string | undefined> = {};
  const today = new Date().toISOString().split('T')[0];
  const expectedReturn = new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0];

  let enquiry: Enquiry | undefined;
  let quoteId: string | undefined;
  let challanId: string | undefined;

  try {
    if (signal?.aborted) return { results, summary };
    if (onBeforeStep) {
      await onBeforeStep({
        step: 1,
        title: 'Rental Enquiry',
        phase: 'Sales & Rental',
        status: 'ok',
        detail: 'Opening rental enquiry for Torrent Power…',
      }, { summary });
      if (signal?.aborted) return { results, summary };
    }
    const res = await api.post('/crm/enquiries', {
      customerId: RENTAL_CUSTOMER_ID,
      enquiryType: 'rental',
      source: 'Phone',
      requirements:
        'Dry Air Plant DAG-50 and Filtration Rig 6000 LPH on monthly hire — Qty 1 each for 6 months at Torrent Power site.',
      expectedValue: 320000,
    });
    enquiry = res.data as Enquiry;
    summary.enquiryId = enquiry.id;
    const ok = await emitStep(results, {
      step: 1,
      title: 'Rental Enquiry',
      phase: 'Sales & Rental',
      status: 'ok',
      detail: 'Torrent Power requests Dry Air Plant + Filtration Rig on monthly rental.',
      documentId: enquiry.id,
      path: `/enquiries/${enquiry.id}`,
    }, onStep, summary, signal);
    if (!ok) return { results, summary };
  } catch (err) {
    await emitStep(results, {
      step: 1,
      title: 'Rental Enquiry',
      phase: 'Sales & Rental',
      status: 'error',
      detail: err instanceof Error ? err.message : 'Failed.',
    }, onStep, summary, signal);
    return { results, summary };
  }

  if (!(await pushStep(results, 2, 'Rental Quotation', 'Sales & Rental', () => {
    const quote = createDirectQuotation({ customerId: RENTAL_CUSTOMER_ID, enquiryId: enquiry!.id });
    addProductToQuotation(quote.id, 'PROD-003', 1, 45000);
    updateQuotation(quote.id, { status: 'Accepted', totalAmount: 270000 });
    quoteId = quote.id;
    summary.quotationId = quote.id;
    return {
      detail: `Rental quote ${quote.id} — DAG-50 @ ₹45,000/month × 6 months.`,
      documentId: quote.id,
      path: `/quotations/${quote.id}`,
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 3, 'Rental PO (Fleet Spares)', 'Purchase', () => {
    const po = createPurchaseOrder({
      poPurpose: 'Rental',
      vendorName: 'Gujarat Pipes',
      deliveryDate: new Date(Date.now() + 10 * 86_400_000).toISOString().split('T')[0],
      remarks: 'Hose & fittings for rental fleet maintenance',
      lines: [{ inventoryItemId: 'INV-1013', qty: 50, rate: 320 }],
    });
    summary.poId = po.id;
    return {
      detail: `Rental-purpose PO ${po.id} for fleet spares (not linked to WO).`,
      documentId: po.id,
      path: `/purchase-orders/${po.id}`,
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 4, 'Returnable Challan (Outward)', 'Rental Dispatch', () => {
    const rentalItems = loadRentalItems();
    const item = rentalItems.find(i => i.id === RENTAL_ITEM_ID)!;
    challanId = getNextChallanNo();
    const challan: RentalChallan = {
      id: challanId,
      dateIssued: today,
      expectedReturnDate: expectedReturn,
      buyerName: 'Torrent Power',
      buyerAddress: 'Sabarmati Power House Site, Ahmedabad, Gujarat',
      buyerGstin: '24AAACT8765R1Z3',
      buyerPhone: '9876543210',
      consigneeName: 'Torrent Power',
      consigneeAddress: 'Sabarmati Power House Site, Ahmedabad — Gate 2',
      reason: 'Rental',
      purpose: 'Filtration rig monthly hire',
      jobWorkNo: `RNT-${today.replace(/-/g, '')}`,
      status: 'Pending',
      preparedBy: 'store',
      items: [{
        id: '1',
        rentalItemId: RENTAL_ITEM_ID,
        itemCode: item.id,
        description: item.name,
        hsnSac: '997319',
        qtyDispatched: 1,
        qtyReturned: 0,
        uom: item.uom,
      }],
    };
    issueOutwardChallan(challan);
    summary.challanNo = challanId;
    return {
      detail: `Returnable challan ${challanId} issued — 1 unit ${item.name} to customer site.`,
      documentId: challanId,
      path: '/inventory/returnable-challan',
      values: { qtySent: 1, expectedReturn },
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 5, 'Pending Balance Tracking', 'Rental Tracking', () => {
    const pending = getPendingItemListRows().filter(
      r => r.challanNo === challanId && r.qtyPending > 0
    );
    if (!pending.length) throw new Error('Pending row not found after outward challan.');
    return {
      detail: `Pending Item List shows ${pending[0].qtyPending} unit pending at ${pending[0].deliveryAddress} (${pending[0].daysPending} days ageing).`,
      documentId: challanId,
      path: '/inventory/pending-items',
      values: { qtyPending: pending[0].qtyPending },
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 6, 'Returnable Challan (Inward)', 'Rental Return', () => {
    recordReturn(challanId!, today, 'Good', { '1': 1 }, 'Rig returned in good condition', 'Store Admin');
    return {
      detail: `Inward return booked — qty pending now 0, line closed.`,
      documentId: challanId,
      path: '/inventory/returnable-challan',
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  await pushStep(results, 7, 'Rental Billing Ready', 'Finance', () => {
    processErpEvent('manual.message', {
      customerId: RENTAL_CUSTOMER_ID,
      status: `Rental period complete — invoice draft for quote ${quoteId}`,
    });
    return {
      detail: 'Rental billing register can raise recurring invoice against rental contract.',
      path: '/rentals/billing',
    };
  }, onStep, summary, signal, onBeforeStep);

  return { results, summary };
}

/** Service / AMC journey: enquiry → AMC ticket → visit → warranty repair → close */
export async function runDemoServiceOrder(options?: DemoRunOptions): Promise<DemoRunResult> {
  const { onStep, onBeforeStep, signal } = options ?? {};
  const results: DemoStepResult[] = [];
  const summary: Record<string, string | undefined> = {};
  const today = new Date().toISOString().split('T')[0];

  let enquiry: Enquiry | undefined;
  let quoteId: string | undefined;
  let ticketId: string | undefined;
  let warrantyChallanId: string | undefined;

  try {
    if (signal?.aborted) return { results, summary };
    if (onBeforeStep) {
      await onBeforeStep({
        step: 1,
        title: 'Service Enquiry',
        phase: 'Service & AMC',
        status: 'ok',
        detail: 'Opening service enquiry for Reliance…',
      }, { summary });
      if (signal?.aborted) return { results, summary };
    }
    const res = await api.post('/crm/enquiries', {
      customerId: SERVICE_CUSTOMER_ID,
      enquiryType: 'service',
      source: 'Existing Client',
      requirements:
        'Annual AMC for SMP-6000 Filtration Plant at Jamnagar — quarterly oil check, filter replacement, vacuum pump inspection.',
      expectedValue: 185000,
    });
    enquiry = res.data as Enquiry;
    summary.enquiryId = enquiry.id;
    const ok = await emitStep(results, {
      step: 1,
      title: 'Service Enquiry',
      phase: 'Service & AMC',
      status: 'ok',
      detail: 'Reliance Industries logs AMC renewal enquiry for existing filtration plant.',
      documentId: enquiry.id,
      path: `/enquiries/${enquiry.id}`,
    }, onStep, summary, signal);
    if (!ok) return { results, summary };
  } catch (err) {
    await emitStep(results, {
      step: 1,
      title: 'Service Enquiry',
      phase: 'Service & AMC',
      status: 'error',
      detail: err instanceof Error ? err.message : 'Failed.',
    }, onStep, summary, signal);
    return { results, summary };
  }

  if (!(await pushStep(results, 2, 'AMC Service Quotation', 'Service & AMC', () => {
    const quote = createDirectQuotation({ customerId: SERVICE_CUSTOMER_ID, enquiryId: enquiry!.id });
    addProductToQuotation(quote.id, 'PROD-001', 1, 185000);
    updateQuotation(quote.id, { status: 'Accepted' });
    quoteId = quote.id;
    summary.quotationId = quote.id;
    return {
      detail: `AMC service quote ${quote.id} accepted — ₹1,85,000 annual contract.`,
      documentId: quote.id,
      path: `/quotations/${quote.id}`,
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 3, 'AMC Service Ticket', 'Service & AMC', () => {
    const ticket = createServiceTicket({
      customer: 'Reliance Industries Ltd',
      customerId: SERVICE_CUSTOMER_ID,
      machine: 'SP/26/1044 — SMP-6000',
      type: 'AMC Routine',
      enquiryId: enquiry!.id,
      quotationId: quoteId,
      notes: 'Q3 AMC visit — oil sample + filter check',
    });
    ticketId = ticket.id;
    summary.ticketId = ticket.id;
    return {
      detail: `Service ticket ${ticket.id} opened and assigned.`,
      documentId: ticket.id,
      path: '/after-sales',
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 4, 'Engineer Dispatch', 'Service & AMC', () => {
    updateServiceTicket(ticketId!, { status: 'In Progress' });
    return {
      detail: `Engineer dispatched — ticket ${ticketId} in progress.`,
      documentId: ticketId,
      path: '/after-sales',
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 5, 'Spares Consumed', 'Service & Stores', () => {
    updateServiceTicket(ticketId!, { sparesUsed: 'Filter Element 5 Micron (x2), Gasket NBR 2" (x4)' });
    const po = createPurchaseOrder({
      poPurpose: 'General',
      vendorName: 'Gujarat Pipes',
      deliveryDate: new Date(Date.now() + 7 * 86_400_000).toISOString().split('T')[0],
      remarks: `Service spares for ${ticketId}`,
      lines: [{ inventoryItemId: 'INV-1004', qty: 2, rate: 3500 }],
    });
    summary.poId = po.id;
    return {
      detail: `Spares logged on ticket; general stock PO ${po.id} for filter cartridges.`,
      documentId: po.id,
      path: '/purchase/orders',
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 6, 'Warranty Repair (Outward)', 'Warranty', () => {
    const wr = issueWarrantyOutward({
      assetId: 'AST-003',
      vendorName: 'Leybold GmbH (India)',
      warrantyStatus: 'Under Warranty',
      reasonForReturn: 'Vacuum drop detected during AMC visit — send to OEM',
      customerName: 'Reliance Industries Ltd',
      expectedReturnDate: new Date(Date.now() + 21 * 86_400_000).toISOString().split('T')[0],
      serviceCharge: 0,
    });
    warrantyChallanId = wr.id;
    summary.warrantyChallanNo = wr.id;
    return {
      detail: `Warranty returnable challan ${wr.id} — pump sent to OEM (no bill, under warranty).`,
      documentId: wr.id,
      path: '/inventory/warranty-repair',
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  if (!(await pushStep(results, 7, 'Warranty Repair (Inward)', 'Warranty', () => {
    recordWarrantyInward(warrantyChallanId!, {
      returnDate: today,
      repairStatus: 'Repaired & OK',
      repairRemarks: 'OEM replaced seals — unit tested OK',
    });
    return {
      detail: `Unit returned from OEM — warranty challan ${warrantyChallanId} closed.`,
      documentId: warrantyChallanId,
      path: '/inventory/warranty-repair',
    };
  }, onStep, summary, signal, onBeforeStep))) return { results, summary };

  await pushStep(results, 8, 'AMC Visit Closed', 'Service & AMC', () => {
    updateServiceTicket(ticketId!, { status: 'Closed' });
    processErpEvent('manual.message', {
      customerId: SERVICE_CUSTOMER_ID,
      status: `AMC visit ${ticketId} closed — next visit in 90 days`,
    });
    return {
      detail: `Service ticket ${ticketId} closed. Customer 360° updated with AMC history.`,
      documentId: ticketId,
      path: '/after-sales',
    };
  }, onStep, summary, signal, onBeforeStep);

  return { results, summary };
}
