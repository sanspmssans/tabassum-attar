'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  children?: SubCategoryItem[];
  products?: ProductItem[];
}

export default function MobileDrawer({
  categories = [],
}: {
  categories?: MainCategoryItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      alert('ദയവായി പേരും ഫോൺ നമ്പറും നൽകുക.');
      return;
    }

    const message = `ഹലോ Tabassum Attar,\n\nപേര്: ${contactName}\nമൊബൈൽ: ${contactPhone}\nവിവരം: ${contactMsg || 'അത്തറുകളെ കുറിച്ച് കൂടുതൽ അറിയാൻ താല്പര്യപ്പെടുന്നു.'}`;
    const whatsappUrl = `https://wa.me/919846350490?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* ☰ Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Navigation Menu"
        className="md:hidden p-2 text-gray-200 hover:text-[#d9b444] transition-colors focus:outline-none cursor-pointer"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Direct Body Portal: Ensures drawer expands to the full height of the mobile screen */}
      {isMounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-[99999] transition-all duration-300 md:hidden ${
              isOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
            }`}
          >
            {/* Dark Backdrop */}
            <div
              onClick={closeDrawer}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            {/* Sliding Drawer Container */}
            <aside
              className={`absolute top-0 right-0 h-[100dvh] w-[85%] max-w-sm bg-[#0e1015] border-l border-[#232731] shadow-2xl flex flex-col justify-between overflow-y-auto p-5 transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-[#232731] pb-4">
                  <span className="font-serif text-[#d9b444] font-bold text-lg tracking-widest">
                    TABASSUM ATTAR
                  </span>
                  <button
                    onClick={closeDrawer}
                    className="text-gray-400 hover:text-white p-1 text-xl font-bold cursor-pointer"
                    aria-label="Close Menu"
                  >
                    ✕
                  </button>
                </div>

                {/* Main Navigation Links */}
                <div className="flex flex-col space-y-3 text-xs uppercase tracking-wider border-b border-[#232731] pb-4">
                  <Link
                    href="/"
                    onClick={closeDrawer}
                    className="text-gray-200 hover:text-[#d9b444] transition-colors py-1 flex items-center gap-2"
                  >
                    <span>🏠</span> Home
                  </Link>
                  <Link
                    href="/#about"
                    onClick={closeDrawer}
                    className="text-gray-200 hover:text-[#d9b444] transition-colors py-1 flex items-center gap-2"
                  >
                    <span>📜</span> About Us
                  </Link>
                  <Link
                    href="/track"
                    onClick={closeDrawer}
                    className="text-[#d9b444] font-medium transition-colors py-1 flex items-center gap-2"
                  >
                    <span>🔍</span> Track Order
                  </Link>
                </div>

                {/* Fragrance Catalog Accordion */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#d9b444] font-bold mb-3">
                    Fragrance Catalog
                  </p>
                  <div className="space-y-2">
                    {categories && categories.length > 0 ? (
                      categories.map((cat) => {
                        const isCatOpen = expandedCat === cat.id;
                        const hasSubs = cat.children && cat.children.length > 0;
                        const hasDirectProds = cat.products && cat.products.length > 0;

                        return (
                          <div key={cat.id} className="border border-[#1f222b] rounded-lg bg-[#14161d] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => toggleCategory(cat.id)}
                              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left text-white font-medium hover:bg-[#1a1e27] cursor-pointer"
                            >
                              <span>{cat.name}</span>
                              <span className="text-[#d9b444] text-[10px]">{isCatOpen ? '▲' : '▼'}</span>
                            </button>

                            {isCatOpen && (
                              <div className="px-3 pb-3 pt-1 border-t border-[#1f222b] bg-[#090a0d] space-y-2">
                                {/* Subcategories */}
                                {hasSubs &&
                                  cat.children!.map((sub) => {
                                    const isSubOpen = expandedSub === sub.id;
                                    return (
                                      <div key={sub.id} className="pl-2 border-l border-[#2e3440] my-1.5">
                                        <button
                                          type="button"
                                          onClick={() => toggleSubCategory(sub.id)}
                                          className="w-full flex items-center justify-between text-left text-gray-300 hover:text-[#d9b444] text-[11px] py-1 cursor-pointer"
                                        >
                                          <span>↳ {sub.name}</span>
                                          <span className="text-gray-500 text-[9px]">
                                            {isSubOpen ? '▲' : '▼'}
                                          </span>
                                        </button>

                                        {isSubOpen && (
                                          <div className="pl-3 py-1 space-y-1">
                                            {sub.products && sub.products.length > 0 ? (
                                              sub.products.map((p) => (
                                                <Link
                                                  key={p.id}
                                                  href={`/product/${p.slug}`}
                                                  onClick={closeDrawer}
                                                  className="block text-[11px] text-gray-400 hover:text-[#d9b444] py-1 transition-colors"
                                                >
                                                  • {p.name}
                                                </Link>
                                              ))
                                            ) : (
                                              <p className="text-[10px] text-gray-600">No products available</p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}

                                {/* Direct Products */}
                                {hasDirectProds && (
                                  <div className="pl-2 py-1 space-y-1">
                                    {cat.products!.map((p) => (
                                      <Link
                                        key={p.id}
                                        href={`/product/${p.slug}`}
                                        onClick={closeDrawer}
                                        className="block text-[11px] text-gray-400 hover:text-[#d9b444] py-1 transition-colors"
                                      >
                                        • {p.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}

                                {!hasSubs && !hasDirectProds && (
                                  <p className="text-[10px] text-gray-600 py-1 pl-2">No fragrances found</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-gray-500 italic">No categories found.</p>
                    )}
                  </div>
                </div>

                {/* WhatsApp Quick Inquiry Form */}
                <div className="border-t border-[#232731] pt-4">
                  <p className="text-[11px] uppercase tracking-wider text-[#d9b444] font-bold mb-2.5">
                    Quick Inquiry & Contact
                  </p>
                  <form onSubmit={handleContactSubmit} className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-[#14161d] border border-[#232731] rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#d9b444] outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Mobile / WhatsApp Number"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-[#14161d] border border-[#232731] rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#d9b444] outline-none"
                    />
                    <textarea
                      rows={2}
                      placeholder="Message / Fragrance Requirement"
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      className="w-full bg-[#14161d] border border-[#232731] rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#d9b444] outline-none resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold text-xs py-2.5 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      💬 Send via WhatsApp
                    </button>
                  </form>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-5 mt-6 border-t border-[#232731] text-[10px] text-gray-500 text-center">
                <p>© {new Date().getFullYear()} Tabassum Attar</p>
                <p className="text-gray-600 mt-0.5">Handcrafted Luxury Fragrances</p>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}