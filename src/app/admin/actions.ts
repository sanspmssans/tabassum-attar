'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({
      where: { id: productId },
    });
  } catch (error) {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
  }

  revalidatePath('/admin');
  revalidatePath('/');
}