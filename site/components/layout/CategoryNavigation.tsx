'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import type { Category } from '@/lib/types';

function hasActiveCategory(pathname: string, category: Category) {
  if (pathname.includes(`/category/${category.slug}`)) return true;
  return (category.children ?? [])
    .filter((child) => Boolean(child.slug))
    .some((child) => pathname.includes(`/category/${child.slug}`));
}

export default function CategoryNavigation({
  locale,
  categoryTree,
}: {
  locale: string;
  categoryTree: Category[];
}) {
  const pathname = usePathname();
  const validCategories = categoryTree.filter((category) => Boolean(category.slug));
  const containerRef = useRef<HTMLDivElement>(null);
  const [openRootId, setOpenRootId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedRootId, setExpandedRootId] = useState<string | null>(null);

  useEffect(() => {
    if (!openRootId) return;

    function onOutsideClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpenRootId(null);
      }
    }

    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenRootId(null);
    }

    document.addEventListener('mousedown', onOutsideClick);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onOutsideClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, [openRootId]);

  useEffect(() => {
    if (!mobileOpen) return;

    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }

    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [mobileOpen]);

  return (
    <>
      <button
        type="button"
        className="md:hidden inline-flex h-9 w-9 items-center justify-center text-charcoal order-0"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-square-menu-icon lucide-square-menu"
        >
          <rect
            width="18"
            height="18"
            x="3"
            y="3"
            rx="2"
          />
          <path d="M7 8h10" />
          <path d="M7 12h10" />
          <path d="M7 16h10" />
        </svg>
      </button>

      <div
        ref={containerRef}
        className="hidden md:flex items-center gap-5 text-sm text-charcoal-light shrink-0 relative"
      >
        <Link
          href="/category/all"
          locale={locale}
          className={`hover:text-terra ${pathname.includes('/category/all') ? 'text-terra' : ''}`}
        >
          Shop
        </Link>

        {validCategories.map((category) => {
          const children = (category.children ?? []).filter((child) =>
            Boolean(child.slug),
          );
          const active = hasActiveCategory(pathname, category);

          if (children.length === 0) {
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                locale={locale}
                className={`hover:text-terra ${active ? 'text-terra' : ''}`}
              >
                {category.name}
              </Link>
            );
          }

          return (
            <div
              key={category.id}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenRootId((prev) =>
                    prev === category.id ? null : category.id,
                  )
                }
                className={`cursor-pointer hover:text-terra ${active ? 'text-terra' : ''}`}
                aria-expanded={openRootId === category.id}
                aria-haspopup={children.length > 0}
              >
                {category.name}
              </button>

              {openRootId === category.id && children.length > 0 && (
                <div className="absolute left-0 top-full mt-3 min-w-60 rounded-sm border border-border bg-white p-4 shadow-sm z-50">
                  <Link
                    href={`/category/${category.slug}`}
                    locale={locale}
                    className="block text-sm font-medium text-charcoal hover:text-terra"
                    onClick={() => setOpenRootId(null)}
                  >
                    All {category.name}
                  </Link>
                  <div className="mt-3 space-y-2">
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/category/${child.slug}`}
                        locale={locale}
                        className="block text-sm text-charcoal-light hover:text-terra"
                        onClick={() => setOpenRootId(null)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu backdrop"
          />

          <aside className="absolute left-0 top-0 h-full w-[85%] max-w-xs bg-white border-r border-border p-4 overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-medium text-charcoal">Menu</p>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-2">
              <Link
                href="/category/all"
                locale={locale}
                className="block rounded-sm px-2 py-2 text-sm text-charcoal hover:bg-cream-dark"
                onClick={() => setMobileOpen(false)}
              >
                Shop
              </Link>

              {validCategories.map((category) => {
                const children = (category.children ?? []).filter((child) =>
                  Boolean(child.slug),
                );
                const expanded = expandedRootId === category.id;
                return (
                  <div
                    key={category.id}
                    className="rounded-sm border border-border"
                  >
                    <div className="flex items-center justify-between gap-2 px-2 py-2">
                      <Link
                        href={`/category/${category.slug}`}
                        locale={locale}
                        className="text-sm text-charcoal hover:text-terra"
                        onClick={() => setMobileOpen(false)}
                      >
                        {category.name}
                      </Link>
                      {children.length > 0 && (
                        <button
                          type="button"
                          className="px-1 text-charcoal-light"
                          aria-label={`Toggle ${category.name}`}
                          onClick={() =>
                            setExpandedRootId((prev) =>
                              prev === category.id ? null : category.id,
                            )
                          }
                        >
                          {expanded ? '−' : '+'}
                        </button>
                      )}
                    </div>

                    {expanded && children.length > 0 && (
                      <div className="border-t border-border px-2 py-2 space-y-1 bg-cream">
                        {children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/category/${child.slug}`}
                            locale={locale}
                            className="block rounded-sm px-2 py-1.5 text-sm text-charcoal-light hover:bg-white hover:text-terra"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
