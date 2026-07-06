import { loadInventory, saveInventory } from './woMaterialIssue';
import type { InventoryItem } from './mockData2';

export type ItemMasterRecord = InventoryItem & {
  hsnSac?: string;
  description?: string;
  status?: 'Active' | 'Inactive';
};

export const ITEM_CATEGORIES = [
  'Raw Material',
  'Component',
  'Finished Good',
  'Consumable',
  'Spares',
  'Service',
] as const;

export const ITEM_UOMS = ['Nos', 'Kg', 'Ltr', 'Mtr', 'Set', 'Box', 'Roll'] as const;

export function loadItemMaster(): ItemMasterRecord[] {
  return loadInventory() as ItemMasterRecord[];
}

export function saveItemMasterItem(
  input: Omit<ItemMasterRecord, 'id'> & { id?: string }
): ItemMasterRecord {
  const items = loadItemMaster();

  if (input.id) {
    const idx = items.findIndex(i => i.id === input.id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...input, id: input.id };
      saveInventory(items);
      return items[idx];
    }
  }

  const nums = items.map(i => Number(i.id.match(/INV-(\d+)/)?.[1] ?? 0));
  const next = nums.length ? Math.max(...nums) + 1 : 1001;
  const created: ItemMasterRecord = {
    id: `INV-${next}`,
    partNumber: input.partNumber,
    name: input.name,
    category: input.category,
    stockMain: input.stockMain ?? 0,
    stockSubcon: input.stockSubcon ?? 0,
    uom: input.uom,
    reorderLevel: input.reorderLevel ?? 0,
    unitCost: input.unitCost ?? 0,
    hsnSac: input.hsnSac,
    description: input.description,
    status: input.status ?? 'Active',
  };
  saveInventory([...items, created]);
  return created;
}

export function deleteItemMasterItem(id: string): void {
  saveInventory(loadItemMaster().filter(i => i.id !== id));
}

export function searchItemMaster(query: string, category?: string): ItemMasterRecord[] {
  const q = query.trim().toLowerCase();
  return loadItemMaster().filter(item => {
    if (category && category !== 'All' && item.category !== category) return false;
    if (!q) return true;
    return (
      item.id.toLowerCase().includes(q) ||
      item.partNumber.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.hsnSac?.toLowerCase().includes(q)
    );
  });
}

export function getItemMasterStats() {
  const items = loadItemMaster();
  const active = items.filter(i => i.status !== 'Inactive').length;
  const lowStock = items.filter(i => i.stockMain + i.stockSubcon <= i.reorderLevel).length;
  return { total: items.length, active, lowStock };
}
