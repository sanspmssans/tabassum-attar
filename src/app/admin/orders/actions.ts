'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Function to update order fulfillment status
export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const status = formData.get('status') as string;

  if (!orderId || !status) return;

  try {
    await (prisma.order.update as any)({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath('/admin/orders');
    revalidatePath('/track');
  } catch (error) {
    console.error('Failed to update order status:', error);
  }
}

// Function to update shipment tracking number & courier details
export async function updateTrackingInfo(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const trackingNumber = (formData.get('trackingNumber') as string)?.trim();
  const courierName = (formData.get('courierName') as string)?.trim();

  if (!orderId) return;

  try {
    await (prisma.order.update as any)({
      where: { id: orderId },
      data: {
        trackingNumber: trackingNumber || null,
        ...(courierName ? { courierName } : {}),
        // If tracking is provided and current status is PENDING, mark as SHIPPED
        status: trackingNumber ? 'SHIPPED' : undefined,
      },
    });

    revalidatePath('/admin/orders');
    revalidatePath('/track');
  } catch (error) {
    console.error('Failed to update tracking info:', error);
  }
}