'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitProductReview(formData: FormData) {
  const productId = formData.get('productId') as string;
  const slug = formData.get('slug') as string;
  const name = ((formData.get('name') as string) || 'Customer').trim();
  const rating = Number(formData.get('rating') || 5);
  const title = ((formData.get('title') as string) || 'Wonderful Fragrance').trim();
  const comment = ((formData.get('comment') as string) || '').trim();

  if (!productId || !comment) {
    throw new Error('Please enter your review comments.');
  }

  // 1. Create or Find User for review author
  let user = await (prisma.user.findFirst as any)({
    where: { name: name },
  });

  if (!user) {
    user = await (prisma.user.create as any)({
      data: {
        name: name,
        email: `reviewer_${Date.now()}@tabassumattar.com`,
        passwordHash: 'GUEST_REVIEW',
      },
    });
  }

  // 2. Upsert Customer linked to User
  const customer = await (prisma.customer.upsert as any)({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
    },
  });

  // 3. Create Review in Database
  await (prisma.review.create as any)({
    data: {
      productId: productId,
      customerId: customer.id,
      rating: Math.min(5, Math.max(1, rating)),
      title: title,
      comment: comment,
      isVerified: true,
      isApproved: true,
    },
  });

  // 4. Update Product Review Count
  await (prisma.product.update as any)({
    where: { id: productId },
    data: {
      reviewCount: { increment: 1 },
    },
  }).catch(() => {});

  if (slug) {
    revalidatePath(`/product/${slug}`);
  }

  return { success: true };
}