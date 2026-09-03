import prisma from '@/lib/prisma';
import CheckoutForm from './CheckoutForm';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { productId?: string; variantId?: string };
}) {
  const { productId, variantId } = searchParams;

  if (!variantId && !productId) {
    redirect('/');
  }

  let variant: any = null;

  if (variantId) {
    variant = await (prisma.productVariant.findUnique as any)({
      where: { id: variantId },
      include: { product: { include: { images: true } } },
    }).catch(() => null);
  }

  if (!variant && productId) {
    variant = await (prisma.productVariant.findFirst as any)({
      where: { productId: productId },
      include: { product: { include: { images: true } } },
    }).catch(() => null);
  }

  if (!variant) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d9b444]">Product Variant Not Found</h2>
          <p className="text-xs text-gray-400">The item you are trying to checkout is unavailable.</p>
          <a href="/" className="inline-block bg-[#c69e2a] text-black font-bold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider">
            Return to Store
          </a>
        </div>
      </div>
    );
  }

  const product = variant.product || {};

  // Serialize Decimal to Number for Client Component safety
  const serializedVariant = {
    ...variant,
    price: Number(variant.price || 0),
    discountPrice: variant.discountPrice ? Number(variant.discountPrice) : null,
  };

  const serializedProduct = {
    ...product,
    basePrice: Number(product.basePrice || 0),
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#fbf8f2] py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <a href="/" className="text-xl font-serif tracking-widest text-[#d9b444] font-bold">
            TABASSUM ATTAR
          </a>
          <h1 className="text-2xl font-serif font-bold text-white">Secure Express Checkout</h1>
        </div>

        <CheckoutForm product={serializedProduct} variant={serializedVariant} />
      </div>
    </div>
  );
}