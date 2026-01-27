"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { NavCategory, NavItem, SubMenuItem } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarNavProps {
  categories: NavCategory[];
  isMinimized: boolean;
  pathname: string;
  accentColor: string;
  expanded: Set<string>;
  setExpanded: (next: Set<string>) => void;
}

interface SidebarNavItemProps {
  item: NavItem | SubMenuItem;
  isMinimized: boolean;
  pathname: string;
  accentColor: string;
  expanded: Set<string>;
  setExpanded: (next: Set<string>) => void;
  lastClicked: string | null;
  setLastClicked: (id: string) => void;
  level?: number;
}

function SidebarNavItem({
  item,
  isMinimized,
  pathname,
  accentColor,
  expanded,
  setExpanded,
  lastClicked,
  setLastClicked,
  level = 0,
}: SidebarNavItemProps) {
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const itemKey = item.href || `nav-item-${item.name}`;
  const isExpanded = expanded.has(itemKey);

  // Check active state
  // If it's a leaf node (no submenu), specific match.
  // If it has submenu, check if any child is active.
  const isActive = item.href
    ? pathname === item.href
    : item.submenu?.some((sub) => pathname === sub.href) ?? false;

  const tooltipContent = item.name + (("disabled" in item && item.disabled) ? " (Coming soon)" : "");
  const paddingLeft = level > 0 ? `${level * 12 + 12}px` : undefined;

  const renderItemContent = (
    <>
      {"isNew" in item && item.isNew && !isMinimized && (
        <span className="absolute -top-1 left-2 inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          NEW
        </span>
      )}
      {"icon" in item && (
        <span
          className={isMinimized ? "shrink-0" : ""}
          style={isActive ? { color: accentColor } : undefined}
        >
          {item.icon}
        </span>
      )}
      <span
        className={`transition-all duration-300 truncate ${isMinimized ? "md:hidden" : ""}`}
      >
        {item.name}
      </span>
      {item.badgeComponent && (
        // Render the component if it exists (lazy loaded badge)
        <item.badgeComponent />
      )}
      {item.badgeCount !== undefined && item.badgeCount > 0 && !item.badgeComponent && (
        <span
          className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-medium ${item.badgeColor === "green"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : item.badgeColor === "blue"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
        >
          {item.badgeCount}
        </span>
      )}
    </>
  );

  if (hasSubmenu) {
    return (
      <li key={itemKey}>
        {isMinimized && level === 0 ? (
          // Top level minimized behavior with Tooltip
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                disabled={"disabled" in item && item.disabled}
                className={`w-full flex items-center rounded-xl transition-all duration-200 group relative md:justify-center md:px-3 md:py-3 cursor-pointer`}
              >
                {renderItemContent}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        ) : (
          // Normal Expanded behavior (recursive)
          <>
            <button
              onClick={() => {
                if (isMinimized || ("disabled" in item && item.disabled)) return;
                const next = new Set(expanded);
                if (next.has(itemKey)) next.delete(itemKey);
                else next.add(itemKey);
                setExpanded(next);
              }}
              disabled={"disabled" in item && item.disabled}
              className={`w-full flex items-center rounded-xl transition-all duration-200 group relative ${isMinimized ? "md:justify-center md:px-3 md:py-3" : "gap-3 px-4 py-3 justify-between"
                } ${("disabled" in item && item.disabled)
                  ? "cursor-not-allowed text-zinc-700 dark:text-zinc-300"
                  : isActive
                    ? "font-medium cursor-pointer"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                }`}
              style={{
                ...(isActive ? { backgroundColor: `${accentColor}10`, color: accentColor } : undefined),
                paddingLeft: !isMinimized && level > 0 ? paddingLeft : undefined
              }}
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {renderItemContent}
              </div>
              {!isMinimized && (
                <svg
                  className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {!isMinimized && isExpanded && item.submenu && (
              <ul className={`mt-1 space-y-1 ${level === 0 ? "border-l-2 border-zinc-200 dark:border-zinc-800 pl-4 ml-4" : ""}`}>
                {item.submenu.map((subItem, idx) => (
                  <SidebarNavItem
                    key={subItem.href || idx}
                    item={subItem}
                    isMinimized={isMinimized}
                    pathname={pathname}
                    accentColor={accentColor}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    lastClicked={lastClicked}
                    setLastClicked={setLastClicked}
                    level={level + 1}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </li>
    );
  }

  // Leaf node
  const linkContent = (
    <Link
      href={item.href || "#"}
      onClick={() => {
        const key = item.href || itemKey;
        try {
          localStorage.setItem("ppdo:lastClickedNav", key);
        } catch { }
        setLastClicked(key);
      }}
      className={`flex items-center rounded-xl transition-all duration-200 group relative ${isMinimized ? "md:justify-center md:px-3 md:py-3" : "gap-3 px-4 py-3"
        } ${isActive
          ? "font-medium"
          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        } ${("disabled" in item && item.disabled) ? "cursor-not-allowed opacity-60" : ""}`}
      style={{
        ...(isActive ? { backgroundColor: `${accentColor}10`, color: accentColor } : undefined),
        paddingLeft: !isMinimized && level > 0 ? paddingLeft : undefined
      }}
      aria-label={tooltipContent}
      aria-current={isActive ? "page" : undefined}
    >
      {level > 0 && !("icon" in item) && (
        // Dot indicator for subitems without icons
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "" : "bg-zinc-400 dark:bg-zinc-600"}`} style={isActive ? { backgroundColor: accentColor } : undefined} />
      )}
      {renderItemContent}
    </Link>
  );

  return (
    <li key={itemKey}>
      {isMinimized && level === 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      ) : (
        linkContent
      )}
    </li>
  );
}

export function SidebarNav({ categories, isMinimized, pathname, accentColor, expanded, setExpanded }: SidebarNavProps) {
  const [lastClicked, setLastClicked] = useState<string | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem("ppdo:lastClickedNav");
      if (v) setLastClicked(v);
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex-1 overflow-y-auto p-4" aria-label="Main Navigation">
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.name} className="space-y-2">
              {!isMinimized && (
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {category.name}
                  </h3>
                </div>
              )}
              <ul className="space-y-2">
                {category.items.map((item, index) => (
                  <SidebarNavItem
                    key={item.href || index}
                    item={item}
                    isMinimized={isMinimized}
                    pathname={pathname}
                    accentColor={accentColor}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    lastClicked={lastClicked}
                    setLastClicked={setLastClicked}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </TooltipProvider>
  );
}
