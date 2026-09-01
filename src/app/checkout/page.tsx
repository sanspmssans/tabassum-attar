import prisma from '@/lib/prisma';
import Link from 'next/link';
import CheckoutForm from './CheckoutForm';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { variantId?: string };
}) {
  const variant = searchParams.variantId
    ? await prisma.productVariant.findUnique({
        where: { id: searchParams.variantId },
        include: { product: true, inventory: true },
      })
    : null;

  const serializedVariant = variant
    ? {
        id: variant.id,
        name: variant.product.name,
        labelSize: variant.labelSize,
        price: Number(variant.price),
        discountPrice: variant.discountPrice ? Number(variant.discountPrice) : null,
      }
    : null;

  return (
    <main className="min-h-screen bg-[#0b0c10] text-[#fbf8f2]">
      <header className="border-b border-[#232731] bg-[#101217]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif tracking-widest text-[#d9b444] font-bold">
            TABASSUM ATTAR
          </Link>
          <Link href="/" className="text-xs uppercase tracking-wider text-gray-400 hover:text-[#d9b444]">
            ← Return to Store
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl md:text-3xl font-serif text-white mb-8">Secure Express Checkout</h1>
        <CheckoutForm variant={serializedVariant} />
      </div>
    </main>
  );
}