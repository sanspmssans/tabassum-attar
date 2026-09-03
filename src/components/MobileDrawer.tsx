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

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');

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
      alert('പേരും മൊബൈൽ നമ്പറും നൽകുക');
      return;
    }

    const message = `ഹലോ Tabassum Attar,\n\nപേര്: ${contactName}\nമൊബൈൽ: ${contactPhone}\nവിവരം: ${contactMsg || 'അത്തറുകളെ കുറിച്ച് കൂടുതൽ അറിയാൻ താല്പര്യപ്പെടുന്നു.'}`;
    const whatsappUrl = `https://wa.me/919846350490?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* ☰ Hamburger Button: md:hidden ഉള്ളതിനാൽ ലാപ്‌ടോപ്പിൽ കാണില്ല, മൊബൈലിൽ മാത്രം കാണും */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Navigation Menu"
        className="md:hidden p-2 text-gray-300 hover:text-[#d9b444] transition-colors focus:outline-none cursor-pointer"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeDrawer}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity md:hidden"
        />
      )}

      {/* Sliding Drawer Menu */}
      <aside
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[#101217] border-l border-[#232731] z-50 p-5 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-[#232731] pb-3">
            <span className="font-serif text-[#d9b444] font-bold text-base tracking-widest">
              TABASSUM ATTAR
            </span>
            <button
              onClick={closeDrawer}
              className="text-gray-400 hover:text-white p-1 text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* 1. Primary Navigation (Home, About, Track) */}
          <div className="flex flex-col space-y-2.5 text-xs uppercase tracking-wider border-b border-[#232731] pb-4">
            <Link
              href="/"
              onClick={closeDrawer}
              className="text-gray-200 hover:text-[#d9b444] transition-colors py-1"
            >
              🏠 Home
            </Link>
            <Link
              href="/#about"
              onClick={closeDrawer}
              className="text-gray-200 hover:text-[#d9b444] transition-colors py-1"
            >
              📜 About Us
            </Link>
            <Link
              href="/track"
              onClick={closeDrawer}
              className="text-[#d9b444] font-medium transition-colors py-1"
            >
              🔍 Track Order
            </Link>
          </div>

          {/* 2. Products Section (Category -> Subcategory -> Items) */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#d9b444] font-bold mb-2">
              Fragrances (Categories & Items)
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
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-white font-medium hover:bg-[#1a1e27]"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[#d9b444] text-[10px]">{isCatOpen ? '▲' : '▼'}</span>
                    </button>

                    {isCatOpen && (
                      <div className="px-3 pb-2 pt-1 border-t border-[#1f222b] bg-[#0c0d11] space-y-2">
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
                                  <span className="text-gray-500 text-[9px]">{isSubOpen ? '▲' : '▼'}</span>
                                </button>

                                {/* Items under Subcategory */}
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

                        {/* Direct Products */}
                        {directProducts && !hasSubs && (
                          <div className="pl-2 py-1 space-y-1">
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

          {/* 3. Contact Us Form */}
          <div className="border-t border-[#232731] pt-4">
            <p className="text-[10px] uppercase tracking-wider text-[#d9b444] font-bold mb-2">
              Contact & Inquiries
            </p>
            <form onSubmit={handleContactSubmit} className="space-y-2">
              <input
                type="text"
                placeholder="Your Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-[#14161d] border border-[#232731] rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-[#d9b444] outline-none"
              />
              <input
                type="tel"
                placeholder="Mobile / WhatsApp Number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-[#14161d] border border-[#232731] rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-[#d9b444] outline-none"
              />
              <textarea
                rows={2}
                placeholder="Message / Requirement"
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                className="w-full bg-[#14161d] border border-[#232731] rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-[#d9b444] outline-none resize-none"
              />
              <button
                type="submit"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                💬 Send via WhatsApp
              </button>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-[#232731] text-[10px] text-gray-500">
          <p>© {new Date().getFullYear()} Tabassum Attar</p>
        </div>
      </aside>
    </>
  );
}