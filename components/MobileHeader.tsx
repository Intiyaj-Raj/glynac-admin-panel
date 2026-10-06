"use client";

import { useState } from "react";

// Reusable mobile menu toggle - shows nav links in a dropdown on small screens
export default function MobileHeader({
  navItems,
}: {
  navItems: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <h1 className="text-base font-bold">Glynac Admin</h1>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-slate-800"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {open && (
        <nav className="absolute top-full left-0 right-0 bg-slate-900 border-t border-slate-700 flex flex-col py-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-6 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
