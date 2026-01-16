"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Department Head", href: "/department-head" },
  { label: "Organizational Chart", href: "/org-chart" },
  { label: "Services", href: "/services" },
  { label: "News and Events", href: "/news-events" },
  { label: "Contact Us", href: "/contact-us" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className="sticky top-0 z-50 w-full bg-[#0a1a0a] text-white border-b-4 border-yellow-500"
      style={{ fontFamily: "var(--font-cinzel)" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">

        {/* DESKTOP NAV */}
        <ul className="hidden lg:flex justify-center gap-12 text-[15px] font-semibold tracking-wide">
          {navLinks.map((link, i) => (
            <li key={i}>
              <Link
                href={link.href}
                className={`transition-colors duration-300
                  ${
                    isActive(link.href)
                      ? "text-yellow-400"
                      : "text-white hover:text-yellow-400"
                  }
                `}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* MOBILE HEADER */}
        <div className="flex lg:hidden items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle Menu"
              className="transition-transform duration-300 hover:scale-110"
            >
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>

            <span className="text-lg font-bold tracking-wide">
              PPDO
            </span>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            open ? "max-h-96" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col items-start gap-5 py-4 text-sm font-semibold">
            {navLinks.map((link, i) => (
              <li key={i}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`transition-colors
                    ${
                      isActive(link.href)
                        ? "text-yellow-600"
                        : "text-[#012130] hover:text-yellow-600"
                    }
                  `}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </nav>
  );
}
