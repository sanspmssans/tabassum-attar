'use server';

import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export async function processOrder(formData: FormData) {
  const variantId = formData.get('variantId') as string;
  const fullName = (formData.get('fullName') as string)?.trim();
  const phoneNumber = (formData.get('phoneNumber') as string)?.trim();
  const address = (formData.get('address') as string)?.trim();
  const city = (formData.get('city') as string)?.trim();
  const state = (formData.get('state') as string)?.trim() || 'Kerala';
  const pinCode = (formData.get('pinCode') as string)?.trim();
  const paymentMethodInput = (formData.get('paymentMethod') as string) || 'COD';
  const couponCodeInput = (formData.get('couponCode') as string)?.trim().toUpperCase() || '';

  if (!variantId || !fullName || !phoneNumber || !address || !pinCode) {
    throw new Error('Please fill in all required delivery details.');
  }

  // 1. Fetch Product Variant details
  const variantData = await (prisma.productVariant.findUnique as any)({
    where: { id: variantId },
    include: { product: true },
  });

  if (!variantData) {
    throw new Error('Selected perfume size not found.');
  }

  // 2. Pricing & Coupon Calculation
  const unitPrice = Number(variantData.discountPrice || variantData.price || 0);
  const priceAfterDiscount = unitPrice;

  let couponCode: string | null = null;
  let couponDiscount = 0;

  // Validate ROYAL10 (10% discount)
  if (couponCodeInput === 'ROYAL10') {
    couponCode = 'ROYAL10';
    couponDiscount = Math.round((priceAfterDiscount * 10) / 100);
  }

  const shippingCharge = 0;
  const codCharge = 0;
  const grandTotal = Math.max(0, priceAfterDiscount - couponDiscount + shippingCharge + codCharge);

  // Generate unique order number (e.g. TAB-481920)
  const orderNumber = `TAB-${Math.floor(100000 + Math.random() * 900000)}`;

  // 3. Upsert Customer Record
  let customer: any;
  try {
    customer = await (prisma.customer.upsert as any)({
      where: { phone: phoneNumber },
      update: { name: fullName },
      create: { name: fullName, phone: phoneNumber },
    });
  } catch {
    customer = await prisma.customer.create({
      data: { name: fullName, phone: phoneNumber },
    });
  }

  // Determine Payment Method & Status Enum
  const isCOD = paymentMethodInput === 'COD';
  const paymentMethod = isCOD ? PaymentMethod.COD : PaymentMethod.ONLINE;
  const paymentStatus = PaymentStatus.PENDING;

  // 4. Create Order in Database
  const dbOrder = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      orderStatus: OrderStatus.CONFIRMED,
      currency: 'INR',
      subTotal: priceAfterDiscount,
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

  // 5. Redirect to Order Success Screen
  redirect(`/checkout/success?orderId=${dbOrder.orderNumber}`);
}