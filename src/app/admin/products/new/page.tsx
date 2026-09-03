import prisma from '@/lib/prisma';
import Link from 'next/link';
import { createProduct } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AddProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#232731] pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white">Add New Fragrance</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure bottle sizes (3ml, 6ml, 12ml), pricing, fragrance pyramid, and images.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-xs text-gray-400 hover:text-white border border-[#232731] px-3 py-1.5 rounded-lg transition-colors"
        >
          ← Back to Catalog
        </Link>
      </div>

      <form action={createProduct} className="space-y-6">
        {/* 1. Basic Product Information */}
        <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#d9b444] uppercase tracking-wider border-b border-[#1f222b] pb-2">
            1. Fragrance Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Fragrance Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Dehn Al Oudh Cambodi, Royal Taif Rose"
                className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-[#d9b444] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Category *
              </label>
              <select
                name="categoryId"
                required
                className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-[#d9b444] outline-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Fragrance Family
              </label>
              <input
                type="text"
                name="fragranceFamily"
                placeholder="e.g. Woody Oriental, Pure Floral, Musky Amber"
                className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-[#d9b444] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Gender Classification
              </label>
              <select
                name="gender"
                defaultValue="UNISEX"
                className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-[#d9b444] outline-none cursor-pointer"
              >
                <option value="UNISEX">UNISEX</option>
                <option value="MEN">MEN</option>
                <option value="WOMEN">WOMEN</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Short Description
            </label>
            <textarea
              name="shortDescription"
              rows={2}
              placeholder="Brief summary of scent profile, longevity, and origin..."
              className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#d9b444] outline-none resize-none"
            />
          </div>
        </div>

        {/* 2. Bottle Sizes (Variants), Pricing & Stock */}
        <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#d9b444] uppercase tracking-wider border-b border-[#1f222b] pb-2">
            2. Bottle Sizes, Pricing & Stock Inventory
          </h3>
          <p className="text-[11px] text-gray-400">
            Enter prices for the sizes you want to offer. Leave blank if a size is unavailable.
          </p>

          <div className="space-y-4">
            {/* 3ml Size */}
            <div className="bg-[#0e1015] border border-[#232731] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              <div>
                <span className="font-bold text-white text-xs block">3ml (1/4 Tola)</span>
                <span className="text-[10px] text-gray-500">Pocket / Travel Size</span>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 uppercase">MRP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price_3ml"
                  placeholder="e.g. 599"
                  className="w-full bg-[#14161d] border border-[#232731] rounded px-3 py-1.5 text-xs text-white focus:border-[#d9b444] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 uppercase">Discount Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="discount_3ml"
                  placeholder="e.g. 499"
                  className="w-full bg-[#14161d] border border-[#232731] rounded px-3 py-1.5 text-xs text-white focus:border-[#d9b444] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 uppercase">Stock Qty</label>
                <input
                  type="number"
                  name="stock_3ml"
                  defaultValue="50"
                  className="w-full bg-[#14161d] border border-[#232731] rounded px-3 py-1.5 text-xs text-white focus:border-[#d9b444] outline-none"
                />
              </div>
            </div>

            {/* 6ml Size */}
            <div className="bg-[#0e1015] border border-[#232731] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              <div>
                <span className="font-bold text-white text-xs block">6ml (1/2 Tola)</span>
                <span className="text-[10px] text-gray-500">Standard Flacon</span>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 uppercase">MRP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price_6ml"
                  placeholder="e.g. 1099"
                  className="w-full bg-[#14161d] border border-[#232731] rounded px-3 py-1.5 text-xs text-white focus:border-[#d9b444] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 uppercase">Discount Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="discount_6ml"
                  placeholder="e.g. 899"
                  className="w-full bg-[#14161d] border border-[#232731] rounded px-3 py-1.5 text-xs text-white focus:border-[#d9b444] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 uppercase">Stock Qty</label>
                <input
                  type="number"
                  name="stock_6ml"
                  defaultValue="40"
                  className="w-full bg-[#14161d] border border-[#232731] rounded px-3 py-1.5 text-xs text-white focus:border-[#d9b444] outline-none"
                />
              </div>
            </div>

            {/* 12ml Size */}
            <div className="bg-[#0e1015] border border-[#232731] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              <div>
                <span className="font-bold text-white text-xs block">12ml (1 Tola)</span>
                <span className="text-[10px] text-gray-500">Luxury Crystal Bottle</span>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 uppercase">MRP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price_12ml"
                  placeholder="e.g. 1999"
                  className="w-full bg-[#14161d] border border-[#232731] rounded px-3 py-1.5 text-xs text-white focus:border-[#d9b444] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 uppercase">Discount Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="discount_12ml"
                  placeholder="e.g. 1699"
                  className="w-full bg-[#14161d] border border-[#232731] rounded px-3 py-1.5 text-xs text-white focus:border-[#d9b444] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 uppercase">Stock Qty</label>
                <input
                  type="number"
                  name="stock_12ml"
                  defaultValue="25"
                  className="w-full bg-[#14161d] border border-[#232731] rounded px-3 py-1.5 text-xs text-white focus:border-[#d9b444] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Product Media */}
        <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#d9b444] uppercase tracking-wider border-b border-[#1f222b] pb-2">
            3. Product Image
          </h3>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Direct Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              placeholder="https://images.unsplash.com/... or Cloudinary URL"
              className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-[#d9b444] outline-none"
            />
          </div>
        </div>

        {/* 4. Olfactory Pyramid */}
        <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#d9b444] uppercase tracking-wider border-b border-[#1f222b] pb-2">
            4. Olfactory Notes (Pyramid)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase">Top Notes</label>
              <input
                type="text"
                name="topNotes"
                placeholder="e.g. Bergamot, Saffron"
                className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d9b444] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase">Heart Notes</label>
              <input
                type="text"
                name="heartNotes"
                placeholder="e.g. Taif Rose, Jasmine"
                className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d9b444] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase">Base Notes</label>
              <input
                type="text"
                name="baseNotes"
                placeholder="e.g. Aged Agarwood, Amber"
                className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d9b444] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded-lg border border-[#232731] text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-[#c69e2a] hover:bg-[#d9b444] text-black font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-[#c69e2a]/20 cursor-pointer"
          >
            Publish Fragrance to Store
          </button>
        </div>
      </form>
    </div>
  );
}