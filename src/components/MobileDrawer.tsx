'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
}

interface SubCategoryItem {
  id: string;
  name: string;
  slug: string;
  products: ProductItem[];
}

interface MainCategoryItem {
  id: string;
  name: string;
  slug: string;
  children: SubCategoryItem[];
  products: ProductItem[];
}

export default function MobileDrawer({
  categories,
}: {
  categories: MainCategoryItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setExpandedCat(expandedCat === id ? null : id);
    setExpandedSub(null);
  };

  const toggleSubCategory = (id: string) => {
    setExpandedSub(expandedSub === id ? null : id);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setExpandedCat(null);
    setExpandedSub(null);
  };

  return (
    <>
      {/* ☰ Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Navigation Menu"
        className="md:hidden p-2 text-gray-300 hover:text-[#d9b444] transition-colors focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeDrawer}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity"
        />
      )}

      {/* Sliding Drawer Menu */}
      <aside
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[#101217] border-l border-[#232731] z-50 p-6 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-[#232731] pb-4">
            <span className="font-serif text-[#d9b444] font-bold text-lg tracking-widest">
              TABASSUM
            </span>
            <button
              onClick={closeDrawer}
              className="text-gray-400 hover:text-white p-1 text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-col space-y-3 text-sm border-b border-[#232731] pb-4">
            <Link href="/" onClick={closeDrawer} className="text-gray-200 hover:text-[#d9b444]">
              Home
            </Link>
            <Link href="/#collection" onClick={closeDrawer} className="text-gray-200 hover:text-[#d9b444]">
              All Collections
            </Link>
            <Link href="/track" onClick={closeDrawer} className="text-[#d9b444] font-medium">
              🔍 Track Order
            </Link>
          </div>

          {/* Hierarchy: Category -> Subcategory -> Items */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-3">
              Fragrance Categories
            </p>
            <div className="space-y-2">
              {categories.map((cat) => {
                const isCatOpen = expandedCat === cat.id;
                const hasSubs = cat.children && cat.children.length > 0;
                const directProducts = cat.products && cat.products.length > 0;

                return (
                  <div key={cat.id} className="border border-[#1f222b] rounded-lg bg-[#14161d] overflow-hidden">
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-left text-white font-medium hover:bg-[#1a1e27]"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[#d9b444] text-xs">{isCatOpen ? '▲' : '▼'}</span>
                    </button>

                    {isCatOpen && (
                      <div className="px-3 pb-3 pt-1 border-t border-[#1f222b] bg-[#0c0d11] space-y-2">
                        {/* Subcategories */}
                        {hasSubs &&
                          cat.children.map((sub) => {
                            const isSubOpen = expandedSub === sub.id;
                            return (
                              <div key={sub.id} className="pl-2 border-l border-[#2e3440] my-1.5">
                                <button
                                  onClick={() => toggleSubCategory(sub.id)}
                                  className="w-full flex items-center justify-between text-left text-gray-300 hover:text-[#d9b444] text-[11px] py-1"
                                >
                                  <span>↳ {sub.name}</span>
                                  <span className="text-gray-500 text-[10px]">
                                    {isSubOpen ? '▲' : '▼'}
                                  </span>
                                </button>

                                {/* Items / Products */}
                                {isSubOpen && (
                                  <div className="pl-3 py-1 space-y-1">
                                    {sub.products.length > 0 ? (
                                      sub.products.map((p) => (
                                        <Link
                                          key={p.id}
                                          href={`/product/${p.slug}`}
                                          onClick={closeDrawer}
                                          className="block text-[10px] text-gray-400 hover:text-[#d9b444] py-0.5"
                                        >
                                          • {p.name}
                                        </Link>
                                      ))
                                    ) : (
                                      <p className="text-[10px] text-gray-600">No items available</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                        {/* Direct Products under Main Category */}
                        {directProducts && !hasSubs && (
                          <div className="pl-3 py-1 space-y-1">
                            {cat.products.map((p) => (
                              <Link
                                key={p.id}
                                href={`/product/${p.slug}`}
                                onClick={closeDrawer}
                                className="block text-[11px] text-gray-400 hover:text-[#d9b444] py-0.5"
                              >
                                • {p.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info inside Drawer */}
        <div className="pt-6 border-t border-[#232731] text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} Tabassum Attar</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Handcrafted Luxury Fragrances</p>
        </div>
      </aside>
    </>
  );
}