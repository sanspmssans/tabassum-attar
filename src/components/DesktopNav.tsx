'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DesktopNav({ categories = [] }: { categories?: any[] }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please enter your name and phone number.');
      return;
    }
    const text = `Hello Tabassum Attar,\n\nName: ${name}\nMobile: ${phone}\nInquiry: ${message || 'I would like to know more about your fragrance collection.'}`;
    window.open(`https://wa.me/919846350490?text=${encodeURIComponent(text)}`, '_blank');
    setShowContactModal(false);
  };

  return (
    <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-wider font-medium text-gray-300">
      <Link href="/" className="hover:text-[#d9b444] transition-colors">
        Home
      </Link>

      {/* Fragrances Dropdown (Category -> Subcategory -> Items) */}
      <div
        className="relative"
        onMouseEnter={() => setShowDropdown(true)}
        onMouseLeave={() => setShowDropdown(false)}
      >
        <button
          type="button"
          className="flex items-center gap-1.5 hover:text-[#d9b444] py-2 transition-colors cursor-pointer uppercase"
        >
          <span>Fragrances</span>
          <span className="text-[10px] text-[#d9b444]">▼</span>
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 w-[550px] bg-[#101217] border border-[#232731] rounded-xl shadow-2xl p-5 z-50 grid grid-cols-3 gap-5 normal-case">
            {categories.length > 0 ? (
              categories.map((cat: any) => (
                <div key={cat.id} className="space-y-2">
                  <p className="text-xs font-serif text-[#d9b444] font-bold border-b border-[#232731] pb-1 uppercase tracking-wider">
                    {cat.name}
                  </p>

                  {/* Subcategories */}
                  {cat.children && cat.children.length > 0 &&
                    cat.children.map((sub: any) => (
                      <div key={sub.id} className="space-y-1">
                        <span className="text-[11px] font-semibold text-gray-300 block">
                          ↳ {sub.name}
                        </span>
                        <div className="pl-2 space-y-1">
                          {sub.products && sub.products.length > 0 ? (
                            sub.products.map((p: any) => (
                              <Link
                                key={p.id}
                                href={`/product/${p.slug}`}
                                className="block text-[11px] text-gray-400 hover:text-[#d9b444] transition-colors truncate"
                              >
                                • {p.name}
                              </Link>
                            ))
                          ) : (
                            <span className="text-[10px] text-gray-600">No items</span>
                          )}
                        </div>
                      </div>
                    ))}

                  {/* Direct Products */}
                  {cat.products && cat.products.length > 0 && (!cat.children || cat.children.length === 0) && (
                    <div className="space-y-1">
                      {cat.products.map((p: any) => (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          className="block text-[11px] text-gray-400 hover:text-[#d9b444] transition-colors truncate"
                        >
                          • {p.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 col-span-3">No categories found</p>
            )}
          </div>
        )}
      </div>

      <Link href="/#about" className="hover:text-[#d9b444] transition-colors">
        About Us
      </Link>

      <Link href="/track" className="hover:text-[#d9b444] text-[#d9b444] font-semibold transition-colors flex items-center gap-1">
        <span>🔍</span> Track Order
      </Link>

      {/* Contact Inquiry Button */}
      <button
        type="button"
        onClick={() => setShowContactModal(true)}
        className="border border-[#c69e2a]/50 text-[#d9b444] hover:bg-[#c69e2a] hover:text-black px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-semibold tracking-wider"
      >
        Contact
      </button>

      {/* Contact Inquiry Popup Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm normal-case">
          <div className="bg-[#101217] border border-[#232731] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-lg font-serif text-[#d9b444] font-bold">Contact & Inquiries</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Please enter your details to connect with us directly via WhatsApp.
            </p>

            <form onSubmit={handleWhatsAppSubmit} className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#14161d] border border-[#232731] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d9b444] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Mobile / WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9846350490"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-[#14161d] border border-[#232731] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d9b444] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Message / Requirement</label>
                <textarea
                  rows={3}
                  placeholder="Fragrance requirements, custom blends, or inquiries..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#14161d] border border-[#232731] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d9b444] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer uppercase tracking-wider mt-2"
              >
                💬 Send via WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}