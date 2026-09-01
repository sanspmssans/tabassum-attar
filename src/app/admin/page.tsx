import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [productCount, categoryCount, totalVariants, products] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.productVariant.count(),
    prisma.product.findMany({
      include: {
        category: true,
        variants: {
          include: {
            inventory: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif text-white font-medium">Dashboard Overview</h1>
        <p className="text-xs text-gray-400 mt-1">Live inventory, catalog statistics, and product pricing</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#14161d] border border-[#232731] p-6 rounded-xl">
          <p className="text-xs uppercase tracking-wider text-gray-400">Total Fragrances</p>
          <p className="text-3xl font-serif text-[#d9b444] font-bold mt-2">{productCount}</p>
        </div>

        <div className="bg-[#14161d] border border-[#232731] p-6 rounded-xl">
          <p className="text-xs uppercase tracking-wider text-gray-400">Active Categories</p>
          <p className="text-3xl font-serif text-[#d9b444] font-bold mt-2">{categoryCount}</p>
        </div>

        <div className="bg-[#14161d] border border-[#232731] p-6 rounded-xl">
          <p className="text-xs uppercase tracking-wider text-gray-400">Total Flacon SKU Sizes</p>
          <p className="text-3xl font-serif text-[#d9b444] font-bold mt-2">{totalVariants}</p>
        </div>
      </div>

      {/* Products Inventory & Pricing Table */}
      <div className="bg-[#14161d] border border-[#232731] rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#232731] flex justify-between items-center">
          <h2 className="text-base font-serif text-white">Product Inventory & Pricing Matrix</h2>
          <span className="text-xs text-[#d9b444] bg-[#232731] px-3 py-1 rounded">Live Sync Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1a1e27] text-gray-400 uppercase tracking-wider text-[11px] border-b border-[#232731]">
              <tr>
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Concentration</th>
                <th className="py-4 px-6">Size / Flacon</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232731]">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#161a22] transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-white text-sm">{prod.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{prod.sku}</p>
                  </td>
                  <td className="py-4 px-6">{prod.category.name}</td>
                  <td className="py-4 px-6">
                    <span className="bg-[#232731] text-[#d9b444] px-2 py-0.5 rounded text-[10px] uppercase">
                      {prod.concentration.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 space-y-1">
                    {prod.variants.map((v) => (
                      <p key={v.id} className="text-gray-300">{v.labelSize}</p>
                    ))}
                  </td>
                  <td className="py-4 px-6 space-y-1">
                    {prod.variants.map((v) => (
                      <p key={v.id} className="text-[#d9b444] font-medium">
                        ₹{v.discountPrice?.toString() || v.price.toString()}
                        {v.discountPrice && (
                          <span className="text-[10px] text-gray-500 line-through ml-1.5">
                            ₹{v.price.toString()}
                          </span>
                        )}
                      </p>
                    ))}
                  </td>
                  <td className="py-4 px-6 space-y-1">
                    {prod.variants.map((v) => (
                      <p key={v.id}>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          (v.inventory?.stockQuantity ?? 0) > 5
                            ? 'bg-green-950/70 text-green-400 border border-green-800/60'
                            : 'bg-red-950/70 text-red-400 border border-red-800/60'
                        }`}>
                          {v.inventory?.stockQuantity ?? 0} units
                        </span>
                      </p>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}