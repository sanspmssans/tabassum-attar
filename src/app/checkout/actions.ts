'use server';

import prisma from '@/lib/prisma';
import Razorpay from 'razorpay';
import { PaymentMethod, PaymentStatus, OrderStatus, InventoryAction } from '@prisma/client';

export async function createCheckoutOrder(formData: FormData) {
  try {
    const selectedVariantId = formData.get('variantId') as string;
    const fullName = (formData.get('fullName') as string) || 'Customer';
    const phoneNumber = ((formData.get('phoneNumber') as string) || '').trim();
    const email = ((formData.get('email') as string) || '').trim().toLowerCase();
    const address = (formData.get('address') as string) || '';
    const city = (formData.get('city') as string) || '';
    const state = (formData.get('state') as string) || 'Kerala';
    const pinCode = (formData.get('pinCode') as string) || '';
    const paymentMethod = (formData.get('paymentMethod') as PaymentMethod) || PaymentMethod.COD;
    const couponCode = ((formData.get('couponCode') as string) || '').trim().toUpperCase();

    const variantData = await prisma.productVariant.findUnique({
      where: { id: selectedVariantId },
      include: { product: true, inventory: true },
    });

    if (!variantData) {
      return { success: false, error: 'Selected item is unavailable.' };
    }

    const unitPrice = Number(variantData.discountPrice || variantData.price);
    
    // 10% Discount for ROYAL10
    let discountAmount = 0;
    if (couponCode === 'ROYAL10') {
      discountAmount = Math.round(unitPrice * 0.10);
    }

    const priceAfterDiscount = Math.max(0, unitPrice - discountAmount);
    const shippingCharge = priceAfterDiscount >= 999 ? 0 : 70;
    const codCharge = paymentMethod === PaymentMethod.COD ? 50 : 0;
    const grandTotal = priceAfterDiscount + shippingCharge + codCharge;
    const orderNumber = `TAB-${Date.now().toString().slice(-6)}`;

    // User lookup / create
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email ? email : undefined },
          { phoneNumber: phoneNumber ? phoneNumber : undefined },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: fullName,
          email: email || `guest_${Date.now()}@tabassumattar.com`,
          phoneNumber: phoneNumber || null,
          passwordHash: 'GUEST_CHECKOUT',
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: fullName },
      });
    }

    const customer = await prisma.customer.upsert({
      where: { userId: user.id },
      update: { totalOrders: { increment: 1 }, totalSpent: { increment: grandTotal } },
      create: {
        userId: user.id,
        totalOrders: 1,
        totalSpent: grandTotal,
      },
    });

    // Create DB Order
    const dbOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        orderStatus: OrderStatus.CONFIRMED,
        subTotal: priceAfterDiscount,
        shippingCharge,
        codCharge,
        grandTotal,
        shippingAddressSnapshot: { fullName, phoneNumber, address, city, state, pinCode },
        billingAddressSnapshot: { fullName, phoneNumber, address, city, state, pinCode },
        orderItems: {
          create: {
            variantId: variantData.id,
            productName: variantData.product.name,
            variantSize: variantData.labelSize,
            sku: variantData.sku,
            unitPrice: priceAfterDiscount,
            quantity: 1,
            totalPrice: priceAfterDiscount,
          },
        },
        payment: {
          create: {
            paymentMethod,
            paymentStatus: paymentMethod === PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.PENDING,
            amount: grandTotal,
          },
        },
      },
    });

    // Inventory Update
    try {
      if (variantData.inventory) {
        await prisma.inventory.update({
          where: { id: variantData.inventory.id },
          data: {
            stockQuantity: { decrement: 1 },
            transactions: {
              create: {
                action: InventoryAction.ORDER_SALE,
                quantityDelta: -1,
                balanceAfter: Math.max(0, variantData.inventory.stockQuantity - 1),
                reason: `Order ${orderNumber}`,
              },
            },
          },
        });
      }
    } catch (invErr) {
      console.error('Inventory skipped:', invErr);
    }

    // Razorpay Order if UPI
    let razorpayOrderId = null;
    if (paymentMethod === PaymentMethod.UPI) {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAY_KEY_SECRET || '',
      });

      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        receipt: `rcpt_${orderNumber}`,
      });

      razorpayOrderId = rzpOrder.id;
    }

    return {
      success: true,
      orderNumber,
      dbOrderId: dbOrder.id,
      grandTotal,
      paymentMethod,
      razorpayOrderId,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      fullName,
      email: email || `${orderNumber}@tabassumattar.com`,
      phoneNumber,
    };
  } catch (error: any) {
    console.error('Order creation error:', error);
    return { success: false, error: error.message };
  }
}