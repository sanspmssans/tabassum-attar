import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; gender?: string; sort?: string };
}) {
  const searchQuery = searchParams.q || '';
  const selectedCategory = searchParams.category || '';
  const selectedGender = searchParams.gender || '';
  const selectedSort = searchParams.sort || 'latest';

  const whereClause: any = { isActive: true };

  if (searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { fragranceFamily: { contains: searchQuery, mode: 'insensitive' } },
      { shortDescription: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  if (selectedCategory) {
    whereClause.category = { slug: selectedCategory };
  }

  if (selectedGender) {
    whereClause.gender = selectedGender;
  }

  let products = await prisma.product.findMany({
    where: whereClause,
    include: {
      images: true,
      variants: { orderBy: { price: 'asc' } },
      notes: { orderBy: { orderIndex: 'asc' } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (selectedSort === 'price-low') {
    products = products.sort((a, b) => {
      const priceA = Number(a.variants[0]?.discountPrice || a.variants[0]?.price || 0);
      const priceB = Number(b.variants[0]?.discountPrice || b.variants[0]?.price || 0);
      return priceA - priceB;
    });
  } else if (selectedSort === 'price-high') {
    products = products.sort((a, b) => {
      const priceA = Number(a.variants[0]?.discountPrice || a.variants[0]?.price || 0);
      const priceB = Number(b.variants[0]?.discountPrice || b.variants[0]?.price || 0);
      return priceB - priceA;
    });
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return (
    <main className="min-h-screen bg-[#0b0c10] text-[#fbf8f2]">
      <div className="bg-[#c69e2a] text-black text-xs font-semibold py-2 px-4 text-center tracking-widest uppercase">
        Special Offer: Use code <span className="font-bold underline">ROYAL10</span> for 10% Off | 100% Pure Non-Alcoholic Artisanal Attars
      </div>

      <header className="border-b border-[#232731] bg-[#101217]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif tracking-widest text-[#d9b444] font-bold">
            TABASSUM ATTAR
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider text-gray-300">
            <Link href="/" className="hover:text-[#d9b444] transition-colors">Home</Link>
            <Link href="#collection" className="hover:text-[#d9b444] transition-colors">Catalog</Link>
            <Link href="/admin" className="hover:text-[#d9b444] transition-colors border border-[#333] px-3 py-1 rounded">Admin</Link>
          </nav>
        </div>
      </header>

      <section className="py-16 px-6 text-center border-b border-[#1f222b] bg-gradient-to-b from-[#14161d] to-[#0b0c10]">
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d9b444]">Pure Hydro-Distillations & Rare Ouds</p>
          <h1 className="text-3xl md:text-5xl font-serif text-white">Handcrafted Luxury Fragrances</h1>
          <p className="text-gray-400 text-xs md:text-sm">
            Discover artisanal non-alcoholic attars crafted from high-grade natural botanicals.
          </p>
        </div>
      </section>

      <section id="collection" className="max-w-7xl mx-auto px-6 pt-10">
        <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-6 space-y-6 shadow-xl">
          <form method="GET" action="/" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="hidden" name="category" value={selectedCategory} />
            <input type="hidden" name="gender" value={selectedGender} />

            <div className="md:col-span-3">
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search by name (e.g. Oudh, Rose, Amber, Saffron)..."
                className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#d9b444] outline-none"
              />
            </div>

            <div className="flex gap-2">
              <select
                name="sort"
                defaultValue={selectedSort}
                className="flex-1 bg-[#0d0f12] border border-[#232731] rounded-lg px-3 py-2.5 text-xs text-white focus:border-[#d9b444] outline-none"
              >
                <option value="latest">Latest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <button
                type="submit"
                className="bg-[#c69e2a] hover:bg-[#d9b444] text-black font-semibold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors"
              >
                Filter
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1f222b]">
            <span className="text-[11px] text-gray-500 uppercase tracking-wider mr-2">Category:</span>
            <Link
              href={`/?q=${searchQuery}&gender=${selectedGender}&sort=${selectedSort}`}
              className={`text-xs px-3.5 py-1.5 rounded-full transition-colors ${
                !selectedCategory ? 'bg-[#c69e2a] text-black font-semibold' : 'bg-[#0d0f12] text-gray-300 border border-[#232731] hover:border-[#c69e2a]'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}&q=${searchQuery}&gender=${selectedGender}&sort=${selectedSort}`}
                className={`text-xs px-3.5 py-1.5 rounded-full transition-colors ${
                  selectedCategory === cat.slug ? 'bg-[#c69e2a] text-black font-semibold' : 'bg-[#0d0f12] text-gray-300 border border-[#232731] hover:border-[#c69e2a]'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-gray-500 uppercase tracking-wider mr-2">Gender:</span>
            {['', 'UNISEX', 'MEN', 'WOMEN'].map((gender) => (
              <Link
                key={gender || 'ALL'}
                href={`/?gender=${gender}&category=${selectedCategory}&q=${searchQuery}&sort=${selectedSort}`}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  selectedGender === gender ? 'bg-[#232731] text-[#d9b444] border border-[#d9b444]' : 'bg-[#0d0f12] text-gray-400 border border-[#1f222b] hover:text-white'
                }`}
              >
                {gender || 'ALL'}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-serif text-white">
            Available Fragrances ({products.length})
          </h2>
          {(searchQuery || selectedCategory || selectedGender) && (
            <Link href="/" className="text-xs text-[#d9b444] hover:underline">
              Clear All Filters ✕
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => {
            const primaryVariant = prod.variants[0];
            const prodImg = prod.images?.[0]?.url;
            return (
              <div key={prod.id} className="bg-[#14161d] border border-[#232731] rounded-xl p-6 flex flex-col justify-between hover:border-[#c69e2a]/50 transition-all shadow-lg space-y-4">
                {prodImg && (
                  <div className="w-full h-48 relative rounded-lg overflow-hidden border border-[#232731]">
                    <Image src={prodImg} alt={prod.name} fill className="object-cover" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase tracking-wider bg-[#232731] text-[#d9b444] px-2 py-0.5 rounded">
                      {prod.category.name}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase border border-[#2e3440] px-1.5 py-0.5 rounded">
                      {prod.gender}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif text-white">{prod.name}</h3>
                  <p className="text-xs text-[#c69e2a]">{prod.fragranceFamily}</p>
                  <p className="text-xs text-gray-400 line-clamp-2">{prod.shortDescription}</p>
                </div>

                <div className="pt-4 border-t border-[#1f222b] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Starting from</span>
                    <p className="text-base font-bold text-[#d9b444]">
                      ₹{primaryVariant?.discountPrice?.toString() || primaryVariant?.price?.toString()}
                    </p>
                  </div>

                  <Link
                    href={`/product/${prod.slug}`}
                    className="bg-[#c69e2a] hover:bg-[#d9b444] text-black text-xs font-semibold px-4 py-2 rounded uppercase tracking-wider transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-[#1f222b] bg-[#0e1015] py-10 text-center text-xs text-gray-500">
        <p className="font-serif text-[#d9b444] text-base mb-1">TABASSUM ATTAR</p>
        <p>© {new Date().getFullYear()} Tabassum Attar. All rights reserved.</p>
      </footer>
    </main>
  );
}