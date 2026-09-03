'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Function to update order fulfillment status (uses orderStatus)
export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const status = formData.get('status') as string;

  if (!orderId || !status) return;

  try {
    await (prisma.order.update as any)({
      where: { id: orderId },
      data: {
        orderStatus: status, // Prisma Schema field: orderStatus
      },
    });

    revalidatePath('/admin/orders');
    revalidatePath('/track');
  } catch (error) {
    console.error('Failed to update order status:', error);
  }
}

// Function to update shipment tracking number
export async function updateTrackingInfo(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const trackingNumber = (formData.get('trackingNumber') as string)?.trim();
  const courierName = (formData.get('courierName') as string)?.trim();

  if (!orderId) return;

  try {
    // 1. Update status to SHIPPED if tracking is provided
    if (trackingNumber) {
      await (prisma.order.update as any)({
        where: { id: orderId },
        data: { orderStatus: 'SHIPPED' },
      });
    }

    // 2. Save tracking to Shipping model if exists
    if ((prisma as any).shipping) {
      await (prisma as any).shipping.upsert({
        where: { orderId },
        create: {
          orderId,
          trackingNumber: trackingNumber || '',
          carrier: courierName || 'Courier',
          status: 'SHIPPED',
        },
        update: {
          trackingNumber: trackingNumber || '',
          carrier: courierName || 'Courier',
        },
      }).catch(() => null);
    }

    revalidatePath('/admin/orders');
    revalidatePath('/track');
  } catch (error) {
    console.error('Failed to update tracking info:', error);
  }
}