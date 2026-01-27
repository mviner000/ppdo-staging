import { STATIC_NAV_ITEMS } from "./config";
import { NavItem } from "./types";

// Simply return the static config which now includes component references
export function useNavItems(): NavItem[] {
  return STATIC_NAV_ITEMS;
}

export const defaultNavItems = STATIC_NAV_ITEMS;