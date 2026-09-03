'use server';

import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export async function processOrder(formData: FormData) {
  const selectedVariantId = (formData.get('variantId') as string) || (formData.get('selectedVariantId') as string);
  const fullName = ((formData.get('fullName') as string) || 'Customer').trim();
  const phoneNumber = ((formData.get('phoneNumber') as string) || '').trim();
  const email = ((formData.get('email') as string) || '').trim().toLowerCase();
  const address = ((formData.get('address') as string) || '').trim();
  const city = ((formData.get('city') as string) || '').trim();
  const state = ((formData.get('state') as string) || 'Kerala').trim();
  const pinCode = ((formData.get('pinCode') as string) || '').trim();
  const paymentMethodInput = (formData.get('paymentMethod') as string) || 'COD';
  const couponCodeInput = ((formData.get('couponCode') as string) || '').trim().toUpperCase();

  if (!selectedVariantId || !fullName || !phoneNumber || !address || !pinCode) {
    throw new Error('Please fill in all required delivery details.');
  }

  // 1. Fetch Product Variant Details
  const variantData = await (prisma.productVariant.findUnique as any)({
    where: { id: selectedVariantId },
    include: { product: true },
  });

  if (!variantData) {
    throw new Error('Selected perfume size not found.');
  }

  // 2. Pricing & Coupon Calculation
  const unitPrice = Number(variantData.discountPrice || variantData.price || 0);

  let couponCode: string | null = null;
  let couponDiscount = 0;

  // ROYAL10 Coupon (10% Discount)
  if (couponCodeInput === 'ROYAL10') {
    couponCode = 'ROYAL10';
    couponDiscount = Math.round((unitPrice * 10) / 100);
  }

  const priceAfterDiscount = Math.max(0, unitPrice - couponDiscount);
  const shippingCharge = 0; // Free Shipping
  const codCharge = 0;
  const grandTotal = priceAfterDiscount + shippingCharge + codCharge;

  // Unique Order Number
  const orderNumber = `TAB-${Date.now().toString().slice(-6)}`;

  // 3. User Lookup or Create
  let user = await (prisma.user.findFirst as any)({
    where: {
      OR: [
        { email: email ? email : undefined },
        { phoneNumber: phoneNumber ? phoneNumber : undefined },
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

  // 4. Customer Lookup or Create Linked to User
  let customer = await (prisma.customer.findUnique as any)({
    where: { userId: user.id },
  });

  if (!customer) {
    customer = await (prisma.customer.create as any)({
      data: {
        userId: user.id,
      },
    });
  }

  // Determine Payment Method
  const isCOD = paymentMethodInput === 'COD';
  const paymentMethod = isCOD ? PaymentMethod.COD : PaymentMethod.ONLINE;
  const paymentStatus = PaymentStatus.PENDING;

  // 5. Create DB Order
  const dbOrder = await (prisma.order.create as any)({
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
          totalPrice: unitPrice,
        },
      },
      payment: {
        create: {
          paymentMethod: paymentMethod,
          paymentStatus: paymentStatus,
          amount: grandTotal,
        },
      },
    },
  });

  // 6. Redirect to Order Success Screen
  redirect(`/checkout/success?orderId=${dbOrder.orderNumber}`);
}

// Export under both names to guarantee compatibility with CheckoutForm
export const createCheckoutOrder = processOrder;