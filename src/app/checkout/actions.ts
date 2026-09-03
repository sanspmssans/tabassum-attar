'use server';

import prisma from '@/lib/prisma';
import Razorpay from 'razorpay';
import { PaymentMethod, PaymentStatus, OrderStatus, InventoryAction } from '@prisma/client';
import { redirect } from 'next/navigation';

export async function createCheckoutOrder(formData: FormData) {
  const selectedVariantId =
    (formData.get('variantId') as string) ||
    (formData.get('selectedVariantId') as string);

  const fullName = ((formData.get('fullName') as string) || 'Customer').trim();
  const phoneNumber = ((formData.get('phoneNumber') as string) || '').trim();
  const email = ((formData.get('email') as string) || '').trim().toLowerCase();
  const address = ((formData.get('address') as string) || '').trim();
  const city = ((formData.get('city') as string) || '').trim();
  const state = ((formData.get('state') as string) || 'Kerala').trim();
  const pinCode = ((formData.get('pinCode') as string) || '').trim();
  
  const paymentMethodRaw = formData.get('paymentMethod') as string;
  const paymentMethod = paymentMethodRaw === 'UPI' ? PaymentMethod.ONLINE : PaymentMethod.COD;

  const couponCodeInput = ((formData.get('couponCode') as string) || '').trim().toUpperCase();

  if (!selectedVariantId || !fullName || !phoneNumber || !address || !pinCode) {
    throw new Error('Please fill in all required delivery details.');
  }

  // 1. Fetch Variant with Inventory and Product details
  const variantData = await (prisma.productVariant.findUnique as any)({
    where: { id: selectedVariantId },
    include: { product: true, inventory: true },
  });

  if (!variantData) {
    throw new Error('Selected perfume size not found.');
  }

  // 2. Pricing & ROYAL10 Coupon Calculation
  const unitPrice = Number(variantData.discountPrice || variantData.price || 0);

  let couponCode: string | null = null;
  let couponDiscount = 0;

  if (couponCodeInput === 'ROYAL10') {
    couponCode = 'ROYAL10';
    couponDiscount = Math.round((unitPrice * 10) / 100);
  }

  const priceAfterDiscount = Math.max(0, unitPrice - couponDiscount);
  const shippingCharge = priceAfterDiscount >= 999 ? 0 : 0; // Free Shipping
  const codCharge = 0;
  const grandTotal = priceAfterDiscount + shippingCharge + codCharge;

  const orderNumber = `TAB-${Date.now().toString().slice(-6)}`;

  // 3. User Lookup or Create (Original Schema Flow)
  let user = await (prisma.user.findFirst as any)({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : []),
      ],
    },
  });

  if (!user) {
    user = await (prisma.user.create as any)({
      data: {
        name: fullName,
        email: email || `guest_${Date.now()}@tabassumattar.com`,
        phoneNumber: phoneNumber || null,
        passwordHash: 'GUEST_CHECKOUT',
      },
    });
  } else {
    user = await (prisma.user.update as any)({
      where: { id: user.id },
      data: { name: fullName },
    });
  }

  // 4. Customer Lookup or Upsert using userId
  const customer = await (prisma.customer.upsert as any)({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
    },
  });

  // 5. Create Order in Database
  const dbOrder = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      orderStatus: OrderStatus.CONFIRMED,
      currency: 'INR',
      subTotal: unitPrice,
      couponCode: couponCode,
      couponDiscount: couponDiscount,
      shippingCharge: shippingCharge,
      codCharge: codCharge,
      taxAmount: 0,
      grandTotal: grandTotal,
      shippingAddressSnapshot: {
        fullName,
        phoneNumber,
        address,
        city,
        state,
        pinCode,
      },
      billingAddressSnapshot: {
        fullName,
        phoneNumber,
        address,
        city,
        state,
        pinCode,
      },
      orderItems: {
        create: {
          variantId: variantData.id,
          productName: variantData.product.name,
          variantSize: variantData.labelSize || 'Standard',
          sku: variantData.sku || '',
          unitPrice: unitPrice,
          quantity: 1,
          totalPrice: priceAfterDiscount,
        },
      },
      payment: {
        create: {
          paymentMethod: paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          amount: grandTotal,
        },
      },
    },
  });

  // 6. Inventory Decrement Update
  try {
    if (variantData.inventory) {
      await (prisma.inventory.update as any)({
        where: { id: variantData.inventory.id },
        data: {
          stockQuantity: { decrement: 1 },
          transactions: {
            create: {
              action: InventoryAction.ORDER_SALE,
              quantityDelta: -1,
              balanceAfter: Math.max(0, (variantData.inventory.stockQuantity || 1) - 1),
              reason: `Order ${orderNumber}`,
            },
          },
        },
      });
    }
  } catch (invErr) {
    console.error('Inventory skipped:', invErr);
  }

  // 7. Redirect to Success Page
  redirect(`/checkout/success?orderId=${dbOrder.orderNumber}`);
}

// Export under processOrder as well to prevent import mismatches
export const processOrder = createCheckoutOrder;