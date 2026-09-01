import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: true,
      variants: { orderBy: { price: 'asc' } },
      notes: { orderBy: { orderIndex: 'asc' } },
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  const primaryVariant = product.variants[0];
  const primaryImage = product.images?.[0]?.url;

  return (
    <main className="min-h-screen bg-[#0b0c10] text-[#fbf8f2]">
      <header className="border-b border-[#232731] bg-[#101217]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif tracking-widest text-[#d9b444] font-bold">
            TABASSUM ATTAR
          </Link>
          <Link href="/" className="text-xs uppercase tracking-wider text-gray-400 hover:text-[#d9b444] transition-colors">
            ← Back to Catalog
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Visual Display */}
          <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[420px] shadow-2xl overflow-hidden relative">
            {primaryImage ? (
              <div className="w-full h-80 relative rounded-xl overflow-hidden">
                <Image
                  src={primaryImage}
                  alt={product.name}
                  fill
                  className="object-cover rounded-xl"
                  priority
                />
              </div>
            ) : (
              <div className="w-44 h-56 border border-[#c69e2a]/30 rounded-t-full rounded-b-2xl bg-gradient-to-b from-[#242938] to-[#12141a] flex flex-col items-center justify-center p-6 shadow-inner relative">
                <div className="w-10 h-10 border-2 border-[#d9b444] rounded-full mb-3 flex items-center justify-center">
                  <span className="text-[#d9b444] text-xs font-serif">TA</span>
                </div>
                <p className="text-xs font-serif text-[#d9b444] uppercase tracking-widest text-center">{product.name}</p>
                <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{product.concentration.replace(/_/g, ' ')}</span>
              </div>
            )}
            <p className="text-xs text-[#c69e2a] mt-4 tracking-widest uppercase">Pure Handcrafted Oil Flacon</p>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#d9b444] bg-[#1c202a] px-3 py-1 rounded">
                {product.category.name}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif text-white mt-3">{product.name}</h1>
              <p className="text-sm text-[#c69e2a] mt-1">{product.fragranceFamily} • {product.gender}</p>
            </div>

            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-bold text-[#d9b444]">
                ₹{primaryVariant?.discountPrice?.toString() || primaryVariant?.price.toString()}
              </span>
              {primaryVariant?.discountPrice && (
                <span className="text-base text-gray-500 line-through">
                  ₹{primaryVariant?.price.toString()}
                </span>
              )}
              <span className="text-xs text-green-400 bg-green-950/60 border border-green-800 px-2 py-0.5 rounded">In Stock</span>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">{product.description}</p>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Available Sizes</label>
              <div className="grid grid-cols-3 gap-3">
                {product.variants.map((v) => (
                  <div key={v.id} className="border border-[#c69e2a]/50 bg-[#171a22] p-3 rounded-lg text-center cursor-pointer hover:border-[#d9b444]">
                    <p className="text-xs font-semibold text-white">{v.labelSize}</p>
                    <p className="text-xs text-[#d9b444] mt-0.5">₹{v.discountPrice?.toString() || v.price.toString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#14161d] border border-[#232731] rounded-xl p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-300">Olfactory Breakdown</p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {product.notes.map((note) => (
                  <div key={note.id} className="border-l-2 border-[#c69e2a] pl-2">
                    <p className="text-[10px] text-[#c69e2a] font-bold uppercase">{note.type}</p>
                    <p className="text-gray-300 text-xs mt-0.5">{note.noteName}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/919876543210?text=Hello%20Tabassum%20Attar,%20I%20would%20like%20to%20order%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg text-xs tracking-wider uppercase text-center transition-colors"
              >
                Order via WhatsApp
              </a>
              <Link
                href={`/checkout?variantId=${primaryVariant?.id}`}
                className="flex-1 bg-[#c69e2a] hover:bg-[#d9b444] text-black font-semibold py-3 px-6 rounded-lg text-xs tracking-wider uppercase text-center transition-colors inline-block"
              >
                Buy Now (Direct Checkout)
              </Link>
            </div>

            <div className="text-[11px] text-gray-400 space-y-1 pt-4 border-t border-[#1f222b]">
              <p>✓ 100% Pure Concentrated Perfume Oil (Alcohol-Free)</p>
              <p>✓ Premium Crystal Glass Bottle with Glass Dipstick</p>
              <p>✓ All India Express Delivery (Free on orders above ₹999)</p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}