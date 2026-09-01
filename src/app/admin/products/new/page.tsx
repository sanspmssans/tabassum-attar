import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { GenderTarget, FragranceConcentration, InventoryAction } from '@prisma/client';
import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function AddProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  async function createProductAction(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const categoryId = formData.get('categoryId') as string;
    const gender = formData.get('gender') as GenderTarget;
    const concentration = formData.get('concentration') as FragranceConcentration;
    const fragranceFamily = formData.get('fragranceFamily') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const description = formData.get('description') as string;
    const topNotes = formData.get('topNotes') as string;
    const heartNotes = formData.get('heartNotes') as string;
    const baseNotes = formData.get('baseNotes') as string;

    const price3ml = parseFloat(formData.get('price3ml') as string) || 0;
    const discount3ml = parseFloat(formData.get('discount3ml') as string) || null;
    const stock3ml = parseInt(formData.get('stock3ml') as string) || 0;

    const price6ml = parseFloat(formData.get('price6ml') as string) || 0;
    const discount6ml = parseFloat(formData.get('discount6ml') as string) || null;
    const stock6ml = parseInt(formData.get('stock6ml') as string) || 0;

    const price12ml = parseFloat(formData.get('price12ml') as string) || 0;
    const discount12ml = parseFloat(formData.get('discount12ml') as string) || null;
    const stock12ml = parseInt(formData.get('stock12ml') as string) || 0;

    // Image Upload Handling
    const imageFile = formData.get('productImage') as File | null;
    let imageUrl: string | null = null;

    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const cleanFileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadDirPath = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDirPath, { recursive: true });
      await fs.writeFile(path.join(uploadDirPath, cleanFileName), buffer);
      imageUrl = `/uploads/${cleanFileName}`;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        categoryId,
        gender,
        concentration,
        fragranceFamily,
        shortDescription,
        description,
        ingredients: '100% Pure Concentrated Perfume Oil. Alcohol Free.',
        usageInstructions: 'Apply one micro-swipe using dipstick to pulse points.',
        images: imageUrl
          ? {
              create: [
                {
                  url: imageUrl,
                  altText: name,
                  isPrimary: true,
                },
              ],
            }
          : undefined,
        notes: {
          create: [
            { type: 'TOP', noteName: topNotes || 'Fresh Accord', orderIndex: 0 },
            { type: 'HEART', noteName: heartNotes || 'Floral Balsam', orderIndex: 1 },
            { type: 'BASE', noteName: baseNotes || 'Precious Woods & Musk', orderIndex: 2 },
          ],
        },
        variants: {
          create: [
            {
              sku: `${sku}-3ML`,
              sizeInMl: 3.0,
              labelSize: '1/4 Tola (3ml)',
              price: price3ml,
              discountPrice: discount3ml,
              inventory: {
                create: {
                  stockQuantity: stock3ml,
                  lowStockThreshold: 5,
                  transactions: {
                    create: {
                      action: InventoryAction.OPENING_STOCK,
                      quantityDelta: stock3ml,
                      balanceAfter: stock3ml,
                      reason: 'Product Creation Opening Stock',
                    },
                  },
                },
              },
            },
            {
              sku: `${sku}-6ML`,
              sizeInMl: 6.0,
              labelSize: '1/2 Tola (6ml)',
              price: price6ml,
              discountPrice: discount6ml,
              inventory: {
                create: {
                  stockQuantity: stock6ml,
                  lowStockThreshold: 5,
                  transactions: {
                    create: {
                      action: InventoryAction.OPENING_STOCK,
                      quantityDelta: stock6ml,
                      balanceAfter: stock6ml,
                      reason: 'Product Creation Opening Stock',
                    },
                  },
                },
              },
            },
            {
              sku: `${sku}-12ML`,
              sizeInMl: 12.0,
              labelSize: '1 Tola (12ml)',
              price: price12ml,
              discountPrice: discount12ml,
              inventory: {
                create: {
                  stockQuantity: stock12ml,
                  lowStockThreshold: 5,
                  transactions: {
                    create: {
                      action: InventoryAction.OPENING_STOCK,
                      quantityDelta: stock12ml,
                      balanceAfter: stock12ml,
                      reason: 'Product Creation Opening Stock',
                    },
                  },
                },
              },
            },
          ],
        },
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    redirect('/admin');
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white">Add New Luxury Fragrance</h1>
          <p className="text-xs text-gray-400 mt-1">Upload bottle image, fragrance notes, and tola pricing</p>
        </div>
        <Link href="/admin" className="text-xs text-gray-400 hover:text-[#d9b444] border border-[#2e3440] px-3 py-1.5 rounded">
          ← Back to Dashboard
        </Link>
      </div>

      <form action={createProductAction} className="bg-[#14161d] border border-[#232731] rounded-xl p-8 space-y-6">
        
        {/* Product Image Upload Field */}
        <div className="p-4 bg-[#0d0f12] border border-dashed border-[#c69e2a]/60 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-[#d9b444] uppercase tracking-wider block">
            📸 Product Flacon / Bottle Image
          </label>
          <input
            type="file"
            name="productImage"
            accept="image/*"
            className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#c69e2a] file:text-black hover:file:bg-[#d9b444] cursor-pointer"
          />
          <p className="text-[10px] text-gray-500">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-medium">Fragrance Name</label>
            <input name="name" required placeholder="e.g. Ruh Al Ward Pure Taif" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white focus:border-[#d9b444] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-medium">Unique SKU Code</label>
            <input name="sku" required placeholder="e.g. TAB-WARD-001" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white focus:border-[#d9b444] outline-none font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-medium">Category</label>
            <select name="categoryId" required className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white focus:border-[#d9b444] outline-none">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-medium">Gender Target</label>
            <select name="gender" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white focus:border-[#d9b444] outline-none">
              <option value="UNISEX">Unisex</option>
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-medium">Concentration Type</label>
            <select name="concentration" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white focus:border-[#d9b444] outline-none">
              <option value="PURE_ATTAR_OIL">Pure Attar Oil</option>
              <option value="DEHN_AL_OUD">Dehn Al Oud</option>
              <option value="MUKHALLAT">Mukhallat</option>
              <option value="CONCENTRATED_PERFUME_OIL">Concentrated Oil</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-300 font-medium">Fragrance Family & Olfactory Description</label>
          <input name="fragranceFamily" required placeholder="e.g. Rich Floral Oriental / Sweet Balsamic" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white focus:border-[#d9b444] outline-none" />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-300 font-medium">Short Highlight</label>
          <input name="shortDescription" required placeholder="Short summary for homepage cards" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white focus:border-[#d9b444] outline-none" />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-300 font-medium">Detailed Narrative</label>
          <textarea name="description" rows={3} required placeholder="Full product story and distillation details..." className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white focus:border-[#d9b444] outline-none" />
        </div>

        {/* Fragrance Notes Breakdown */}
        <div className="p-4 bg-[#0d0f12] border border-[#232731] rounded-lg space-y-3">
          <p className="text-xs font-semibold text-[#d9b444] uppercase tracking-wider">Fragrance Notes Breakdown</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-gray-400">Top Notes</label>
              <input name="topNotes" placeholder="e.g. Taif Rose, Bergamot" className="w-full bg-[#14161d] border border-[#232731] rounded p-2 text-xs text-white focus:border-[#d9b444] outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-gray-400">Heart Notes</label>
              <input name="heartNotes" placeholder="e.g. Saffron, Damask Rose" className="w-full bg-[#14161d] border border-[#232731] rounded p-2 text-xs text-white focus:border-[#d9b444] outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-gray-400">Base Notes</label>
              <input name="baseNotes" placeholder="e.g. Amber, Sandalwood, Musk" className="w-full bg-[#14161d] border border-[#232731] rounded p-2 text-xs text-white focus:border-[#d9b444] outline-none" />
            </div>
          </div>
        </div>

        {/* Flacon Sizes & Inventory */}
        <div className="p-4 bg-[#0d0f12] border border-[#232731] rounded-lg space-y-4">
          <p className="text-xs font-semibold text-[#d9b444] uppercase tracking-wider">Flacon Sizes & Inventory Setup</p>
          
          <div className="grid grid-cols-3 gap-3 items-center text-xs">
            <span className="font-semibold text-white">1/4 Tola (3ml)</span>
            <input name="price3ml" required type="number" step="0.01" placeholder="MRP Price ₹" className="bg-[#14161d] border border-[#232731] rounded p-2 text-xs text-white" />
            <div className="flex gap-2">
              <input name="discount3ml" type="number" step="0.01" placeholder="Offer ₹" className="w-1/2 bg-[#14161d] border border-[#232731] rounded p-2 text-xs text-white" />
              <input name="stock3ml" required type="number" placeholder="Stock Qty" className="w-1/2 bg-[#14161d] border border-[#232731] rounded p-2 text-xs text-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-center text-xs">
            <span className="font-semibold text-white">1/2 Tola (6ml)</span>
            <input name="price6ml" required type="number" step="0.01" placeholder="MRP Price ₹" className="bg-[#14161d] border border-[#232731] rounded p-2 text-xs text-white" />
            <div className="flex gap-2">
              <input name="discount6ml" type="number" step="0.01" placeholder="Offer ₹" className="w-1/2 bg-[#14161d] border border-[#232731] rounded p-2 text-xs text-white" />
              <input name="stock6ml" required type="number" placeholder="Stock Qty" className="w-1/2 bg-[#14161d] border border-[#232731] rounded p-2 text-xs text-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-center text-xs">
            <span className="font-semibold text-white">1 Tola (12ml)</span>
            <input name="price12ml" required type="number" step="0.01" placeholder="MRP Price ₹" className="bg-[#14161d] border border-[#232731] rounded p-2 text-xs text-white" />
            <div className="flex gap-2">
              <input name="discount12ml" type="number" step="0.01" placeholder="Offer ₹" className="w-1/2 bg-[#14161d] border border-[#232731] rounded p-2 text-xs text-white" />
              <input name="stock12ml" required type="number" placeholder="Stock Qty" className="w-1/2 bg-[#14161d] border border-[#232731] rounded p-2 text-xs text-white" />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-[#c69e2a] hover:bg-[#d9b444] text-black font-semibold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#c69e2a]/20">
          Publish Fragrance to Store
        </button>
      </form>
    </div>
  );
}