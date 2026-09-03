'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Function to Create a New Product with Bottle Sizes (Variants) & Notes
export async function createProduct(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const categoryId = formData.get('categoryId') as string;
  const gender = (formData.get('gender') as string) || 'UNISEX';
  const fragranceFamily = (formData.get('fragranceFamily') as string)?.trim();
  const shortDescription = (formData.get('shortDescription') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || shortDescription;
  const imageUrl = (formData.get('imageUrl') as string)?.trim();

  // Olfactory Notes
  const topNotes = (formData.get('topNotes') as string)?.trim();
  const heartNotes = (formData.get('heartNotes') as string)?.trim();
  const baseNotes = (formData.get('baseNotes') as string)?.trim();

  if (!name || !categoryId) {
    throw new Error('Name and Category are required');
  }

  // Auto-generate URL-friendly unique slug
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  // Parse Bottle Sizes (Variants)
  const variantsData = [];

  // 3ml Variant
  const price3ml = formData.get('price_3ml') as string;
  if (price3ml && Number(price3ml) > 0) {
    const discount3ml = formData.get('discount_3ml') as string;
    const stock3ml = formData.get('stock_3ml') as string;
    variantsData.push({
      size: '3ml (1/4 Tola)',
      price: parseFloat(price3ml),
      discountPrice: discount3ml ? parseFloat(discount3ml) : null,
      stock: stock3ml ? parseInt(stock3ml) : 50,
    });
  }

  // 6ml Variant
  const price6ml = formData.get('price_6ml') as string;
  if (price6ml && Number(price6ml) > 0) {
    const discount6ml = formData.get('discount_6ml') as string;
    const stock6ml = formData.get('stock_6ml') as string;
    variantsData.push({
      size: '6ml (1/2 Tola)',
      price: parseFloat(price6ml),
      discountPrice: discount6ml ? parseFloat(discount6ml) : null,
      stock: stock6ml ? parseInt(stock6ml) : 50,
    });
  }

  // 12ml Variant
  const price12ml = formData.get('price_12ml') as string;
  if (price12ml && Number(price12ml) > 0) {
    const discount12ml = formData.get('discount_12ml') as string;
    const stock12ml = formData.get('stock_12ml') as string;
    variantsData.push({
      size: '12ml (1 Tola)',
      price: parseFloat(price12ml),
      discountPrice: discount12ml ? parseFloat(discount12ml) : null,
      stock: stock12ml ? parseInt(stock12ml) : 50,
    });
  }

  // Notes structure
  const notesData = [];
  if (topNotes) notesData.push({ type: 'TOP', note: topNotes, orderIndex: 1 });
  if (heartNotes) notesData.push({ type: 'HEART', note: heartNotes, orderIndex: 2 });
  if (baseNotes) notesData.push({ type: 'BASE', note: baseNotes, orderIndex: 3 });

  // Database Creation
  await prisma.product.create({
    data: {
      name,
      slug,
      fragranceFamily: fragranceFamily || 'Artisanal Blend',
      shortDescription: shortDescription || '',
      description: description || '',
      gender: gender as any,
      isActive: true,
      categoryId,
      images: imageUrl
        ? {
            create: [{ url: imageUrl }],
          }
        : undefined,
      variants: {
        create: variantsData.length > 0 ? variantsData : [
          { size: '6ml (1/2 Tola)', price: 999, discountPrice: null, stock: 25 }
        ],
      },
      notes: notesData.length > 0
        ? {
            create: notesData,
          }
        : undefined,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

// Function to Toggle Product Active Status
export async function toggleProductStatus(formData: FormData) {
  const id = formData.get('id') as string;
  const currentStatus = formData.get('currentStatus') === 'true';

  if (!id) return;

  await prisma.product.update({
    where: { id },
    data: { isActive: !currentStatus },
  });

  revalidatePath('/');
  revalidatePath('/admin/products');
}

// Function to Delete Product
export async function deleteProduct(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  try {
    // Delete relations first
    await prisma.variant.deleteMany({ where: { productId: id } });
    await prisma.productImage.deleteMany({ where: { productId: id } }).catch(() => null);
    await prisma.fragranceNote.deleteMany({ where: { productId: id } }).catch(() => null);

    await prisma.product.delete({ where: { id } });

    revalidatePath('/');
    revalidatePath('/admin/products');
  } catch (error) {
    console.error('Failed to delete product:', error);
  }
}