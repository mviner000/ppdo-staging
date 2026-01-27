import { NavCategory, NavItem } from "./types";

export function groupItemsByCategory(items: NavItem[]): NavCategory[] {
  const categories: { [key: string]: NavItem[] } = {};

  items.forEach((item) => {
    const category = item.category || "Uncategorized";
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(item);
  });

  const order = ["My Workspace", "Department", "Cross Department", "Control Panel"];
  return order.filter((c) => categories[c]).map((c) => ({ name: c, items: categories[c] }));
}

export function getActiveExpandedKeys(items: NavItem[], pathname: string): Set<string> {
  const expanded = new Set<string>();

  function traverse(item: NavItem | import("./types").SubMenuItem): boolean {
    const itemKey = item.href || `nav-item-${item.name}`;

    // Direct match
    if (item.href === pathname) {
      return true;
    }

    // Check children
    if (item.submenu && item.submenu.length > 0) {
      let childMatched = false;
      for (const sub of item.submenu) {
        if (traverse(sub)) {
          childMatched = true;
        }
      }

      if (childMatched) {
        expanded.add(itemKey);
        return true;
      }
    }

    return false;
  }

  items.forEach(item => traverse(item));
  return expanded;
}
