import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductInteractive from './ProductInteractive';

export const dynamic = 'force-dynamic';

export default async function ProductDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const product: any = await (prisma.product.findUnique as any)({
    where: { slug: params.slug },
    include: {
      variants: { orderBy: { price: 'asc' } },
      notes: { orderBy: { orderIndex: 'asc' } },
      images: true,
      category: true,
    },
  }).catch(() => null);

  if (!product) {
    notFound();
  }

  const imageUrl = product.images?.[0]?.url || '';
  const variants = product.variants || [];
  const notes = product.notes || [];

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#fbf8f2] py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400">{product.category?.name || 'Fragrance'}</span>
          <span>/</span>
          <span className="text-[#d9b444] font-medium">{product.name}</span>
        </div>

        {/* Interactive Showcase */}
        <ProductInteractive
          product={product}
          variants={variants}
          notes={notes}
          imageUrl={imageUrl}
        />
      </div>
    </div>
  );
}