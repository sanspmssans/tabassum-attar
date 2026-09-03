import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { toggleProductStatus, deleteProduct } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products: any[] = await (prisma.product.findMany as any)({
    include: {
      category: true,
      images: true,
      variants: true,
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#232731] pb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            Fragrance Catalog ({products.length})
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage your perfumes, sizes (3ml, 6ml, 12ml), stock inventory, and visibility.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-[#c69e2a] hover:bg-[#d9b444] text-black font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c69e2a]/20 flex items-center gap-2 cursor-pointer"
        >
          <span>➕</span> Add New Fragrance
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-[#14161d] border border-[#232731] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0e1015] border-b border-[#232731] text-[10px] uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-4 px-4">Fragrance</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Gender</th>
                <th className="py-4 px-4">Bottle Sizes & Prices</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f222b]">
              {products.length > 0 ? (
                products.map((prod: any) => {
                  const img = prod.images?.[0]?.url;
                  const variants: any[] = prod.variants || [];

                  return (
                    <tr key={prod.id} className="hover:bg-[#1a1e27] transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#0d0f12] border border-[#232731] relative overflow-hidden flex-shrink-0">
                          {img ? (
                            <Image src={img} alt={prod.name || 'Attar'} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                              🧴
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-serif font-bold text-white text-sm">{prod.name}</p>
                          <p className="text-[10px] text-[#c69e2a]">{prod.fragranceFamily || 'Artisanal'}</p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="bg-[#1e222d] border border-[#2e3440] text-gray-300 px-2 py-1 rounded text-[10px]">
                          {prod.category?.name || 'Unassigned'}
                        </span>
                      </td>

                      {/* Gender */}
                      <td className="py-3 px-4">
                        <span className="text-[10px] text-gray-400 uppercase font-medium">
                          {prod.gender || 'UNISEX'}
                        </span>
                      </td>

                      {/* Sizes & Stock */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {variants.length > 0 ? (
                            variants.map((v: any) => (
                              <div key={v.id || Math.random()} className="flex items-center gap-2 text-[11px]">
                                <span className="text-gray-400 font-medium">
                                  {v.size || v.name || 'Standard'}:
                                </span>
                                <span className="text-[#d9b444] font-bold">
                                  ₹{v.discountPrice ? v.discountPrice.toString() : (v.price ? v.price.toString() : '0')}
                                </span>
                                {v.discountPrice && v.price && (
                                  <span className="line-through text-gray-600 text-[10px]">
                                    ₹{v.price.toString()}
                                  </span>
                                )}
                                <span className="text-[9px] text-gray-500 bg-[#0d0f12] px-1.5 py-0.5 rounded">
                                  {v.stock ?? 0} in stock
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-gray-600 italic">No sizes configured</span>
                          )}
                        </div>
                      </td>

                      {/* Active / Inactive Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            prod.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {prod.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <form action={toggleProductStatus}>
                            <input type="hidden" name="id" value={prod.id} />
                            <input type="hidden" name="currentStatus" value={String(prod.isActive)} />
                            <button
                              type="submit"
                              className="text-[10px] px-2.5 py-1 rounded bg-[#232731] hover:bg-[#2e3440] text-gray-300 transition-colors cursor-pointer"
                            >
                              {prod.isActive ? 'Hide' : 'Show'}
                            </button>
                          </form>

                          <form action={deleteProduct}>
                            <input type="hidden" name="id" value={prod.id} />
                            <button
                              type="submit"
                              className="text-[10px] px-2.5 py-1 rounded bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/60 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 text-xs">
                    No fragrances found. Click &quot;Add New Fragrance&quot; to create your first item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}