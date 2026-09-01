import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { PaymentStatus, OrderStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
    } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed: Invalid Signature' },
        { status: 400 }
      );
    }

    if (dbOrderId) {
      await prisma.payment.updateMany({
        where: { orderId: dbOrderId },
        data: {
          paymentStatus: PaymentStatus.CAPTURED,
          transactionId: razorpay_payment_id,
        },
      });

      await prisma.order.update({
        where: { id: dbOrderId },
        data: { orderStatus: OrderStatus.CONFIRMED },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}