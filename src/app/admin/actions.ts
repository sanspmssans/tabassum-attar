'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteProduct(productId: string) {
  try {
    await prisma.productNote.deleteMany({ where: { productId } }).catch(() => {});
    await prisma.productImage.deleteMany({ where: { productId } }).catch(() => {});

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      select: { id: true },
    });
    const variantIds = variants.map((v) => v.id);

    if (variantIds.length > 0) {
      await prisma.inventory.deleteMany({
        where: { variantId: { in: variantIds } },
      }).catch(() => {});

      await prisma.productVariant.deleteMany({
        where: { productId },
      }).catch(() => {});
    }

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