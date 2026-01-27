import type React from "react";

export interface SubMenuItem {
  name: string;
  href: string;
  isNew?: boolean;
  badgeCount?: number;
  badgeColor?: string;
  badgeComponent?: React.ComponentType<any>;
  submenu?: SubMenuItem[];
}

export interface NavItem {
  name: string;
  href?: string;
  icon: React.ReactNode;
  submenu?: SubMenuItem[];
  category?: string;
  disabled?: boolean;
  isNew?: boolean;
  badgeCount?: number;
  badgeColor?: string;
  badgeComponent?: React.ComponentType<any>;
}

export interface NavCategory {
  name: string;
  items: NavItem[];
}

export interface SidebarProps {
  navItems?: NavItem[];
}