'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Variant {
  id: string;
  size: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
}

interface Note {
  type: string;
  note: string;
}

export default function ProductInteractive({
  product,
  variants,
  notes,
  imageUrl,
}: {
  product: any;
  variants: Variant[];
  notes: Note[];
  imageUrl: string;
}) {
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    variants[0] || {
      id: 'default',
      size: '6ml (1/2 Tola)',
      price: 999,
      discountPrice: null,
      stock: 10,
    }
  );

  const topNote = notes.find((n) => n.type === 'TOP')?.note;
  const heartNote = notes.find((n) => n.type === 'HEART')?.note;
  const baseNote = notes.find((n) => n.type === 'BASE')?.note;

  const currentPrice = selectedVariant.discountPrice || selectedVariant.price;
  const hasDiscount = !!selectedVariant.discountPrice && selectedVariant.discountPrice < selectedVariant.price;
  const discountPercent = hasDiscount
    ? Math.round(((selectedVariant.price - (selectedVariant.discountPrice || 0)) / selectedVariant.price) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
      {/* Product Image Stage */}
      <div className="space-y-4">
        <div className="relative aspect-square w-full rounded-2xl bg-[#14161d] border border-[#232731] overflow-hidden shadow-2xl flex items-center justify-center group">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-6xl">🧴</span>
          )}

          {hasDiscount && (
            <span className="absolute top-4 left-4 bg-[#c69e2a] text-black font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded shadow">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Product Details & Selection */}
      <div className="space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#d9b444] font-semibold">
            {product.fragranceFamily || 'Pure Artisanal Blend'} • {product.gender || 'UNISEX'}
          </span>
          <h1 className="text-3xl font-serif font-bold text-white mt-1">
            {product.name}
          </h1>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Live Price Display */}
        <div className="flex items-baseline gap-3 border-y border-[#232731] py-4">
          <span className="text-3xl font-bold text-[#d9b444]">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-base text-gray-500 line-through">
              ₹{selectedVariant.price.toLocaleString('en-IN')}
            </span>
          )}
          <span className="text-[11px] text-gray-400">
            (Inclusive of all taxes • Free Shipping)
          </span>
        </div>

        {/* Interactive Bottle Size Selector (3ml, 6ml, 12ml) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 font-semibold uppercase tracking-wider">
              Select Bottle Volume:
            </span>
            <span className="text-[11px] text-gray-500">
              {selectedVariant.stock > 0 ? `In Stock (${selectedVariant.stock})` : 'Out of Stock'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {variants.map((v) => {
              const isSelected = selectedVariant.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#d9b444] bg-[#d9b444]/10 shadow-lg shadow-[#d9b444]/10'
                      : 'border-[#232731] bg-[#14161d] hover:border-gray-600'
                  }`}
                >
                  <span className={`block text-xs font-bold ${isSelected ? 'text-[#d9b444]' : 'text-white'}`}>
                    {v.size}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    ₹{Number(v.discountPrice || v.price).toLocaleString('en-IN')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Olfactory Pyramid Display */}
        {(topNote || heartNote || baseNote) && (
          <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-5 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-[#d9b444] font-semibold border-b border-[#232731] pb-2 flex items-center gap-2">
              <span>🔺</span> Fragrance Pyramid (Notes)
            </h3>

            <div className="space-y-2.5 pt-1 text-xs">
              {topNote && (
                <div className="flex items-start gap-3">
                  <span className="bg-[#232731] text-[#d9b444] px-2 py-0.5 rounded text-[10px] uppercase font-bold min-w-[55px] text-center">
                    Top
                  </span>
                  <p className="text-gray-300">{topNote}</p>
                </div>
              )}
              {heartNote && (
                <div className="flex items-start gap-3">
                  <span className="bg-[#232731] text-amber-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold min-w-[55px] text-center">
                    Heart
                  </span>
                  <p className="text-gray-300">{heartNote}</p>
                </div>
              )}
              {baseNote && (
                <div className="flex items-start gap-3">
                  <span className="bg-[#232731] text-yellow-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold min-w-[55px] text-center">
                    Base
                  </span>
                  <p className="text-gray-300">{baseNote}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/checkout?productId=${product.id}&variantId=${selectedVariant.id}`}
            className="flex-1 bg-[#c69e2a] hover:bg-[#d9b444] text-black font-bold text-center py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c69e2a]/20 cursor-pointer"
          >
            Buy Now • ₹{currentPrice.toLocaleString('en-IN')}
          </Link>
          <a
            href={`https://wa.me/919746333333?text=${encodeURIComponent(
              `Hi Tabassum Attar, I am interested in ordering: ${product.name} (${selectedVariant.size}) for ₹${currentPrice}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/40 font-bold text-center py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>💬</span> Order via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}