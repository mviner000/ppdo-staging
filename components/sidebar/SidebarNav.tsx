"use client";

import React from "react";
import Link from "next/link";
import { NavCategory } from "./types";

interface SidebarNavProps {
  categories: NavCategory[];
  isMinimized: boolean;
  pathname: string;
  accentColor: string;
  expanded: Set<string>;
  setExpanded: (next: Set<string>) => void;
}

export function SidebarNav({ categories, isMinimized, pathname, accentColor, expanded, setExpanded }: SidebarNavProps) {
  return (
    <nav className="flex-1 overflow-y-auto p-4">
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.name} className="space-y-2">
            {!isMinimized && (
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{category.name}</h3>
              </div>
            )}

            <ul className="space-y-2">
              {category.items.map((item, itemIndex) => {
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const itemKey = item.href || `nav-item-${category.name}-${itemIndex}`;
                const isExpanded = expanded.has(itemKey);
                const isActive = item.href ? pathname === item.href : item.submenu?.some((sub) => pathname === sub.href);

                if (hasSubmenu) {
                  return (
                    <li key={itemKey}>
                      <button
                        onClick={() => {
                          if (isMinimized || item.disabled) return;
                          const next = new Set(expanded);
                          if (next.has(itemKey)) next.delete(itemKey); else next.add(itemKey);
                          setExpanded(next);
                        }}
                        disabled={item.disabled}
                        className={`w-full flex items-center rounded-xl transition-all duration-200 group relative ${isMinimized ? "md:justify-center md:px-3 md:py-3" : "gap-3 px-4 py-3 justify-between"} ${item.disabled ? "cursor-not-allowed text-zinc-700 dark:text-zinc-300" : isActive ? "font-medium" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                        style={isActive ? { backgroundColor: `${accentColor}10`, color: accentColor } : undefined}
                        title={isMinimized ? item.name : undefined}
                      >
                        {item.isNew && !isMinimized && (
                          <span className="absolute -top-1 left-2 inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                            NEW
                          </span>
                        )}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={isMinimized ? "shrink-0" : ""} style={isActive ? { color: accentColor } : undefined}>{item.icon}</span>
                          <span className={`transition-all duration-300 truncate ${isMinimized ? "md:hidden" : ""}`}>{item.name}</span>
                        </div>
                        {!isMinimized && (
                          <svg className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>

                      {!isMinimized && isExpanded && item.submenu && (
                        <ul className="ml-4 mt-1 space-y-1 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4">
                          {item.submenu.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <li key={subItem.href}>
                                <Link
                                  href={subItem.href}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative ${isSubActive ? "font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                                  style={isSubActive ? { backgroundColor: `${accentColor}10`, color: accentColor } : undefined}
                                >
                                  {subItem.isNew && (
                                    <span className="absolute -top-1 left-1 inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                                      NEW
                                    </span>
                                  )}
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubActive ? "" : "bg-zinc-400 dark:bg-zinc-600"}`} style={isSubActive ? { backgroundColor: accentColor } : undefined} />
                                  <span className="truncate">{subItem.name}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                if (item.disabled) {
                  return (
                    <li key={itemKey}>
                      <div className={`flex items-center rounded-xl transition-all duration-200 relative ${isMinimized ? "md:justify-center md:px-3 md:py-3" : "gap-3 px-4 py-3"} cursor-not-allowed text-zinc-700 dark:text-zinc-300`} title={isMinimized ? item.name : "Coming soon"}>
                        <span className={isMinimized ? "shrink-0" : ""}>{item.icon}</span>
                        <span className={`transition-all duration-300 truncate ${isMinimized ? "md:hidden" : ""}`}>{item.name}</span>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={itemKey}>
                    <Link
                      href={item.href || "#"}
                      className={`flex items-center rounded-xl transition-all duration-200 group relative ${isMinimized ? "md:justify-center md:px-3 md:py-3" : "gap-3 px-4 py-3"} ${isActive ? "font-medium" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                      style={isActive ? { backgroundColor: `${accentColor}10`, color: accentColor } : undefined}
                      title={isMinimized ? item.name : undefined}
                    >
                      {item.isNew && !isMinimized && (
                        <span className="absolute -top-1 left-2 inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                          NEW
                        </span>
                      )}
                      <span className={isMinimized ? "shrink-0" : ""} style={isActive ? { color: accentColor } : undefined}>{item.icon}</span>
                      <span className={`transition-all duration-300 truncate ${isMinimized ? "md:hidden" : ""}`}>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}