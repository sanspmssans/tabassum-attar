import prisma from '@/lib/prisma';
import { createCategory, deleteCategory } from './actions';

export const dynamic = 'force-dynamic';

export default async function CategoriesAdminPage() {
  // Fetch main categories along with nested subcategories and product counts
  const mainCategories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { name: 'asc' },
      },
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-bold text-white">
          Category & Subcategory Management
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Create and manage primary fragrance categories and their nested subcategories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Category Form */}
        <div className="bg-[#14161d] border border-[#232731] rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-[#d9b444] uppercase tracking-wider">
            + Add New Category
          </h3>

          <form action={createCategory} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">
                Category Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Pure Dehn Al Oudh, Musk, Floral"
                className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-[#d9b444] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">
                Parent Category (Optional)
              </label>
              <select
                name="parentId"
                defaultValue="none"
                className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d9b444] outline-none cursor-pointer"
              >
                <option value="none">None (Create as Main Category)</option>
                {mainCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    Under: {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-500 mt-1">
                Select a parent category if creating a subcategory.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#c69e2a] hover:bg-[#d9b444] text-black font-bold text-xs py-2.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow"
            >
              Save Category
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Active Categories & Hierarchy ({mainCategories.length})
          </h3>

          <div className="space-y-3">
            {mainCategories.length > 0 ? (
              mainCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-[#14161d] border border-[#232731] rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#1f222b] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#d9b444] font-bold text-sm">📁 {cat.name}</span>
                      <span className="text-[10px] bg-[#1e222d] text-gray-400 px-2 py-0.5 rounded">
                        {cat._count.products} Products
                      </span>
                    </div>

                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button
                        type="submit"
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </form>
                  </div>

                  {/* Subcategories View */}
                  <div className="pl-4 space-y-2">
                    {cat.children && cat.children.length > 0 ? (
                      cat.children.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between bg-[#0d0f12] border border-[#1f222b] rounded-lg px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300">↳ {sub.name}</span>
                            <span className="text-[10px] text-gray-500">
                              ({sub._count.products} items)
                            </span>
                          </div>

                          <form action={deleteCategory}>
                            <input type="hidden" name="id" value={sub.id} />
                            <button
                              type="submit"
                              className="text-red-400 hover:text-red-300 text-[11px] px-1.5 py-0.5 rounded cursor-pointer"
                            >
                              ✕
                            </button>
                          </form>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-gray-600 italic">No subcategories under this.</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#14161d] border border-[#232731] rounded-xl p-8 text-center text-xs text-gray-500">
                No categories created yet. Use the form to add one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}