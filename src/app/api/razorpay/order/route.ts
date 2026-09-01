import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { amount, receipt } = await req.json();

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const order = await instance.orders.create({
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}