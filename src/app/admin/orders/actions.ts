'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Update order status
export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const status = formData.get('status') as string;

  if (!orderId || !status) return;

  try {
    await (prisma.order.update as any)({
      where: { id: orderId },
      data: {
        orderStatus: status,
      },
    });

    revalidatePath('/admin/orders');
    revalidatePath('/track');
  } catch (error) {
    console.error('Failed to update order status:', error);
  }
}

// Update tracking number & courier details (Exact Schema Match)
export async function updateTrackingInfo(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const trackingNumber = (formData.get('trackingNumber') as string)?.trim();
  const courierName = (formData.get('courierName') as string)?.trim() || 'DTDC / Speed Post';

  if (!orderId || !trackingNumber) return;

  try {
    // 1. Mark order as SHIPPED
    await (prisma.order.update as any)({
      where: { id: orderId },
      data: { orderStatus: 'SHIPPED' },
    });

    // 2. Save directly to Shipping table
    await (prisma.shipping.upsert as any)({
      where: { orderId },
      create: {
        orderId,
        trackingNumber,
        courierName,
        shippedAt: new Date(),
      },
      update: {
        trackingNumber,
        courierName,
        shippedAt: new Date(),
      },
    });

    revalidatePath('/admin/orders');
    revalidatePath('/track');
  } catch (error) {
    console.error('Failed to save tracking:', error);
  }
}