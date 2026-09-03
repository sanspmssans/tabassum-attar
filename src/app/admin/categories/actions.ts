'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Function to create a new category or subcategory
export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  const parentId = formData.get('parentId') as string;

  if (!name || !name.trim()) return;

  // Auto-generate URL-friendly slug (e.g. Pure Dehn Al Oudh -> pure-dehn-al-oudh)
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  await prisma.category.create({
    data: {
      name: name.trim(),
      slug,
      parentId: parentId && parentId !== 'none' ? parentId : null,
      isActive: true,
    },
  });

  revalidatePath('/admin/categories');
  revalidatePath('/');
}

// Function to delete an existing category
export async function deleteCategory(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath('/admin/categories');
    revalidatePath('/');
  } catch (error) {
    console.error('Failed to delete category:', error);
  }
}