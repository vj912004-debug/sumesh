/**
 * Visual scenes — bot opens each module screen and fills details in front of the user.
 */
import type { DemoStepResult } from './demoOrderJourney';
import type { VisualDriver } from './visualDemoDriver';

export type DemoKind = 'manufacture' | 'rental' | 'service';

export type SceneContext = {
  kind: DemoKind;
  step: DemoStepResult;
  summary?: Record<string, string | undefined>;
  navigate: (path: string) => void;
  driver: VisualDriver;
};

async function fillFormField(
  driver: VisualDriver,
  selector: string,
  field: string,
  value: string
): Promise<void> {
  const el = await driver.waitForSelector(selector);
  await driver.moveTo(el);
  await driver.highlight(el, 250);
  window.dispatchEvent(new CustomEvent('demo-fill-field', { detail: { field, value } }));
  await driver.wait(Math.max(500, value.length * 35));
}

async function go(ctx: SceneContext, path: string, pageSelector?: string): Promise<void> {
  ctx.navigate(path);
  await ctx.driver.wait(700);
  if (pageSelector) {
    try {
      await ctx.driver.waitForSelector(pageSelector, 6000);
    } catch { /* page may use generic marker */ }
  }
  await ctx.driver.pulsePage();
}

export async function playVisualScene(ctx: SceneContext): Promise<void> {
  const { kind, step, driver } = ctx;
  const key = `${kind}-${step.step}`;

  switch (key) {
    // ── Manufacture ──────────────────────────────────────────────
    case 'manufacture-1':
      await go(ctx, '/enquiries', '[data-demo-page="enquiries"]');
      await driver.narrate('Opening Enquiries — logging new supply enquiry for Tata Power…');
      await driver.click('[data-demo="new-enquiry"]');
      await driver.wait(500);
      await fillFormField(driver, '[data-demo="enquiry-type"]', 'enquiryType', 'supply');
      await fillFormField(driver, '[data-demo="enquiry-customer"]', 'customerId', 'CUST-002');
      await fillFormField(driver, '[data-demo="enquiry-source"]', 'source', 'Cold Call');
      await fillFormField(driver, '[data-demo="enquiry-value"]', 'expectedValue', '1580000');
      await fillFormField(
        driver,
        '[data-demo="enquiry-requirements"]',
        'requirements',
        '6000 LPH Oil Filtration Plant for Kalyan substation — MS tank 10mm, 5 micron filtration, qty 1.'
      );
      await driver.narrate('Saving enquiry…');
      break;

    case 'manufacture-2':
      await driver.narrate('Building cost estimate & BOM, then raising quotation…');
      await go(ctx, '/quotations', '[data-demo-page="quotations"]');
      break;

    case 'manufacture-3':
      await driver.narrate('Client PO received — creating Sales Order & Work Order…');
      await go(ctx, '/quotations', '[data-demo-page="quotations"]');
      break;

    case 'manufacture-4':
      await driver.narrate('Work Order released to production — material kitting…');
      await go(ctx, '/production/list', '[data-demo-page="work-orders"]');
      break;

    case 'manufacture-5':
      await go(ctx, '/purchase/orders/new', '[data-demo-page="po-create"]');
      await driver.narrate('Raising Manufacture PO to Laxmi Steels for MS plate…');
      await driver.click('[data-demo="po-purpose-manufacture"]');
      await driver.typeInto('[data-demo="po-vendor"]', 'Laxmi Steels & Alloys');
      await driver.typeInto('[data-demo="po-gstin"]', '24AABCL1234F1Z9');
      await driver.typeInto('[data-demo="po-wo-ref"]', ctx.summary?.workOrderId ?? 'WO-DEMO');
      await driver.typeInto('[data-demo="po-line-qty"]', '500');
      await driver.narrate('PO ready to submit…');
      break;

    case 'manufacture-6':
      await driver.narrate('Gate GRN — receiving 500 Kg MS plate into store…');
      await go(ctx, '/purchase/grn', '[data-demo-page="grn"]');
      break;

    case 'manufacture-7':
      await driver.narrate('Material Issue — sending plate to Fabrication Bay…');
      await go(ctx, '/inventory/material-issue', '[data-demo-page="material-issue"]');
      break;

    case 'manufacture-8':
      await driver.narrate('Job Work outward — tank body to powder coating…');
      await go(ctx, '/inventory/job-work-challan', '[data-demo-page="job-work"]');
      break;

    case 'manufacture-9':
      await driver.narrate('Job Work inward — painted body received…');
      await go(ctx, '/inventory/job-work-challan', '[data-demo-page="job-work"]');
      break;

    case 'manufacture-10':
      await driver.narrate('Returning excess material to store…');
      await go(ctx, '/inventory/material-issue', '[data-demo-page="material-issue"]');
      break;

    case 'manufacture-11':
      await driver.narrate('QC passed — booking Finished Goods receipt…');
      await go(ctx, '/inventory/finish-stock', '[data-demo-page="finish-stock"]');
      break;

    case 'manufacture-12':
      await driver.narrate('Order ready for dispatch — packing & delivery challan…');
      await go(ctx, '/sales/dispatch-entry', '[data-demo-page="dispatch"]');
      break;

    // ── Rental ───────────────────────────────────────────────────
    case 'rental-1':
      await go(ctx, '/enquiries', '[data-demo-page="enquiries"]');
      await driver.narrate('Torrent Power — new rental enquiry for Dry Air Plant + Filtration Rig…');
      await driver.click('[data-demo="new-enquiry"]');
      await driver.wait(500);
      await fillFormField(driver, '[data-demo="enquiry-type"]', 'enquiryType', 'rental');
      await fillFormField(driver, '[data-demo="enquiry-customer"]', 'customerId', 'CUST-005');
      await fillFormField(driver, '[data-demo="enquiry-source"]', 'source', 'Cold Call');
      await fillFormField(driver, '[data-demo="enquiry-value"]', 'expectedValue', '320000');
      await fillFormField(
        driver,
        '[data-demo="enquiry-requirements"]',
        'requirements',
        'Dry Air Plant DAG-50 and Filtration Rig 6000 LPH on monthly hire — 6 months at site.'
      );
      break;

    case 'rental-2':
      await driver.narrate('Preparing rental quotation…');
      await go(ctx, '/quotations', '[data-demo-page="quotations"]');
      break;

    case 'rental-3':
      await go(ctx, '/purchase/orders/new', '[data-demo-page="po-create"]');
      await driver.narrate('Rental fleet spares PO…');
      await driver.click('[data-demo="po-purpose-rental"]');
      await driver.typeInto('[data-demo="po-vendor"]', 'Gujarat Pipes');
      break;

    case 'rental-4':
      await driver.narrate('Returnable challan — dispatching filtration rig to customer site…');
      await go(ctx, '/inventory/returnable-challan', '[data-demo-page="returnable-challan"]');
      break;

    case 'rental-5':
      await driver.narrate('Checking Pending Item List — qty at customer site…');
      await go(ctx, '/inventory/pending-items', '[data-demo-page="pending-items"]');
      break;

    case 'rental-6':
      await driver.narrate('Inward return — rig received back in good condition…');
      await go(ctx, '/inventory/returnable-challan', '[data-demo-page="returnable-challan"]');
      break;

    case 'rental-7':
      await driver.narrate('Rental billing register — recurring invoice ready…');
      await go(ctx, '/rentals/billing');
      break;

    // ── Service / AMC ────────────────────────────────────────────
    case 'service-1':
      await go(ctx, '/enquiries', '[data-demo-page="enquiries"]');
      await driver.narrate('Reliance Industries — AMC renewal enquiry…');
      await driver.click('[data-demo="new-enquiry"]');
      await driver.wait(500);
      await fillFormField(driver, '[data-demo="enquiry-type"]', 'enquiryType', 'service');
      await fillFormField(driver, '[data-demo="enquiry-customer"]', 'customerId', 'CUST-001');
      await fillFormField(driver, '[data-demo="enquiry-source"]', 'source', 'Existing Client');
      await fillFormField(driver, '[data-demo="enquiry-value"]', 'expectedValue', '185000');
      await fillFormField(
        driver,
        '[data-demo="enquiry-requirements"]',
        'requirements',
        'Annual AMC for SMP-6000 Filtration Plant — quarterly oil check & filter replacement.'
      );
      break;

    case 'service-2':
      await driver.narrate('AMC service quotation…');
      await go(ctx, '/quotations', '[data-demo-page="quotations"]');
      break;

    case 'service-3':
      await go(ctx, '/after-sales', '[data-demo-page="after-sales"]');
      await driver.narrate('Opening service ticket for Q3 AMC visit…');
      await driver.click('[data-demo="log-service-call"]');
      await driver.wait(400);
      await driver.typeInto('[data-demo="service-customer"]', 'Reliance Industries Ltd');
      await driver.typeInto('[data-demo="service-machine"]', 'SP/26/1044 — SMP-6000');
      await driver.selectValue('[data-demo="service-type"]', 'AMC Routine');
      break;

    case 'service-4':
      await driver.narrate('Dispatching field engineer…');
      await go(ctx, '/after-sales', '[data-demo-page="after-sales"]');
      break;

    case 'service-5':
      await driver.narrate('Logging spares consumed & raising stock PO…');
      await go(ctx, '/purchase/orders', '[data-demo-page="purchase-orders"]');
      break;

    case 'service-6':
      await driver.narrate('Warranty repair outward — vacuum pump to OEM…');
      await go(ctx, '/inventory/warranty-repair', '[data-demo-page="warranty-repair"]');
      break;

    case 'service-7':
      await driver.narrate('Warranty repair inward — unit tested OK…');
      await go(ctx, '/inventory/warranty-repair', '[data-demo-page="warranty-repair"]');
      break;

    case 'service-8':
      await driver.narrate('Closing AMC visit — updating customer history…');
      await go(ctx, '/after-sales', '[data-demo-page="after-sales"]');
      break;

    default:
      if (step.path) {
        await go(ctx, step.path.split('/').slice(0, 2).join('/') || step.path);
      }
      await driver.narrate(step.title);
  }
}

export async function playResultScene(
  ctx: SceneContext & { documentId?: string }
): Promise<void> {
  const { step, driver, navigate, documentId } = ctx;
  if (!step.path) return;

  navigate(step.path);
  await driver.wait(800);
  await driver.pulsePage();

  if (documentId) {
    try {
      const row = await driver.waitForSelector(`[data-demo-doc="${documentId}"]`, 3000);
      await driver.highlight(row, 1500);
    } catch {
      await driver.narrate(`Document ${documentId} created ✓`, 1200);
    }
  } else {
    await driver.narrate(step.detail, 1200);
  }
  driver.clearHighlight();
}
