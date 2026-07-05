import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sourceFile = path.join(root, 'src/lib/erpModules.ts');
const outputDir = path.join(root, 'docs');
const outputFile = path.join(outputDir, 'ERP-Module-List.pdf');

function parseNavGroups(source) {
  const groups = [];
  const groupRegex = /title:\s*'([^']+)'[\s\S]*?items:\s*\[([\s\S]*?)\n\s*\],/g;
  let groupMatch;

  while ((groupMatch = groupRegex.exec(source)) !== null) {
    const title = groupMatch[1];
    const itemsBlock = groupMatch[2];
    const items = [];
    const itemRegex = /\{\s*name:\s*'((?:\\'|[^'])*)'[\s\S]*?path:\s*(?:p\('([^']*)'\)|'([^']*)')/g;
    let itemMatch;

    while ((itemMatch = itemRegex.exec(itemsBlock)) !== null) {
      const name = itemMatch[1].replace(/\\'/g, "'");
      const route = itemMatch[2] ? `/${itemMatch[2]}` : itemMatch[3];
      items.push({ name, route });
    }

    groups.push({ title, items });
  }

  return groups;
}

function parseUserRights(source) {
  const match = source.match(/export const USER_RIGHTS_MODULES = \[([\s\S]*?)\] as const;/);
  if (!match) return [];
  return [...match[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
}

function parseLegacyRoutes(source) {
  const block = source.match(/const LEGACY_MODULE_ROUTES[\s\S]*?=\s*\[([\s\S]*?)\];/);
  if (!block) return [];
  const items = [];
  const itemRegex = /\{\s*name:\s*'((?:\\'|[^'])*)'[\s\S]*?path:\s*p\('([^']*)'\)/g;
  let m;
  while ((m = itemRegex.exec(block[1])) !== null) {
    items.push({ name: m[1].replace(/\\'/g, "'"), route: `/${m[2]}` });
  }
  return items;
}

function drawHeader(doc, title, subtitle) {
  doc.fillColor('#0f172a').fontSize(22).font('Helvetica-Bold').text(title, { align: 'center' });
  doc.moveDown(0.3);
  doc.fillColor('#475569').fontSize(11).font('Helvetica').text(subtitle, { align: 'center' });
  doc.moveDown(1);
  doc.strokeColor('#cbd5e1').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.8);
}

function ensureSpace(doc, needed = 80) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
  }
}

function drawGroup(doc, group, index) {
  ensureSpace(doc, 100);
  doc.fillColor('#1e40af').fontSize(14).font('Helvetica-Bold')
    .text(`${index}. ${group.title} (${group.items.length})`);
  doc.moveDown(0.35);

  const colName = 70;
  const colRoute = 320;
  const rowHeight = 16;

  doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold');
  doc.text('#', 55, doc.y, { width: 20 });
  doc.text('Sub-module', colName, doc.y - 9, { width: 230 });
  doc.text('Route', colRoute, doc.y - 9, { width: 200 });
  doc.moveDown(0.5);

  doc.strokeColor('#e2e8f0').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.25);

  group.items.forEach((item, i) => {
    ensureSpace(doc, rowHeight + 8);
    const y = doc.y;
    doc.fillColor('#334155').fontSize(9).font('Helvetica');
    doc.text(String(i + 1), 55, y, { width: 20 });
    doc.text(item.name, colName, y, { width: 240 });
    doc.fillColor('#0369a1').text(item.route, colRoute, y, { width: 210 });
    doc.y = y + rowHeight;
  });

  doc.moveDown(0.8);
}

function drawBulletList(doc, title, items) {
  ensureSpace(doc, 60);
  doc.fillColor('#1e40af').fontSize(14).font('Helvetica-Bold').text(title);
  doc.moveDown(0.4);
  doc.fillColor('#334155').fontSize(10).font('Helvetica');
  items.forEach((item, i) => {
    ensureSpace(doc, 18);
    doc.text(`${i + 1}. ${item}`, 60);
  });
  doc.moveDown(0.8);
}

const source = fs.readFileSync(sourceFile, 'utf8');
const groups = parseNavGroups(source);
const userRights = parseUserRights(source);
const legacy = parseLegacyRoutes(source);
const totalSubModules = groups.reduce((sum, g) => sum + g.items.length, 0);

fs.mkdirSync(outputDir, { recursive: true });

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  info: {
    Title: 'Sumesh Petroleum ERP - Module List',
    Author: 'Sumesh Petroleum Pvt. Ltd.',
    Subject: 'ERP navigation modules and sub-modules',
  },
});

doc.pipe(fs.createWriteStream(outputFile));

drawHeader(
  doc,
  'Sumesh Petroleum ERP',
  'Complete Module & Sub-module List'
);

doc.fillColor('#334155').fontSize(10).font('Helvetica');
doc.text(`Generated: ${new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}`);
doc.text(`Main modules: ${groups.length}  |  Sub-modules: ${totalSubModules}  |  Legacy routes: ${legacy.length}`);
doc.moveDown(1);

groups.forEach((group, index) => drawGroup(doc, group, index + 1));

if (legacy.length > 0) {
  ensureSpace(doc, 80);
  doc.addPage();
  drawHeader(doc, 'Legacy Routes', 'Hidden from sidebar — kept for bookmarks');
  legacy.forEach((item, i) => {
    ensureSpace(doc, 20);
    doc.fillColor('#334155').fontSize(10).font('Helvetica')
      .text(`${i + 1}. ${item.name}  —  ${item.route}`, 60);
  });
  doc.moveDown(1);
}

ensureSpace(doc, 100);
doc.addPage();
drawHeader(doc, 'User Rights Modules', 'Permission modules used in Admin → Users Management');
drawBulletList(doc, 'Access control modules', userRights);

doc.end();

await new Promise((resolve, reject) => {
  doc.on('end', resolve);
  doc.on('error', reject);
});

console.log(`PDF created: ${outputFile}`);
console.log(`Modules: ${groups.length}, Sub-modules: ${totalSubModules}`);
