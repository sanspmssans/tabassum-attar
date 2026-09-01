'use client';

import React, { useState } from 'react';
import { createCheckoutOrder } from './actions';

interface VariantInfo {
  id: string;
  name: string;
  labelSize: string;
  price: number;
  discountPrice: number | null;
}

export default function CheckoutForm({ variant }: { variant: VariantInfo | null }) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [couponCode, setCouponCode] = useState('');

  const unitPrice = variant ? (variant.discountPrice || variant.price) : 0;
  const isCouponApplied = couponCode.trim().toUpperCase() === 'ROYAL10';
  const discountAmount = isCouponApplied ? Math.round(unitPrice * 0.10) : 0;
  const priceAfterDiscount = Math.max(0, unitPrice - discountAmount);
  const shippingCharge = priceAfterDiscount >= 999 ? 0 : 70;
  const codCharge = paymentMethod === 'COD' ? 50 : 0;
  const grandTotal = priceAfterDiscount + shippingCharge + codCharge;

  async function handleOrderSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await createCheckoutOrder(formData);

      if (!res.success || !res.orderNumber || res.grandTotal === undefined) {
        alert(res.error || 'Failed to place order.');
        setLoading(false);
        return;
      }

      if (res.paymentMethod === 'COD') {
        window.location.href = `/checkout/success?orderNumber=${res.orderNumber}`;
        return;
      }

      const options = {
        key: res.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(Number(res.grandTotal) * 100),
        currency: 'INR',
        name: 'TABASSUM ATTAR',
        description: `Order #${res.orderNumber}`,
        order_id: res.razorpayOrderId,
        prefill: {
          name: res.fullName,
          email: res.email,
          contact: res.phoneNumber,
        },
        theme: {
          color: '#d9b444',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: res.dbOrderId,
              }),
            });

            if (verifyRes.ok) {
              window.location.href = `/checkout/success?orderNumber=${res.orderNumber}`;
            } else {
              alert('Payment verification failed. Please contact support.');
              setLoading(false);
            }
          } catch (err) {
            console.error(err);
            alert('Verification network error.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayWindow = new (window as any).Razorpay(options);
      razorpayWindow.open();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Something went wrong.');
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      <form onSubmit={handleOrderSubmit} className="md:col-span-2 bg-[#14161d] border border-[#232731] rounded-xl p-6 space-y-4">
        <input type="hidden" name="variantId" value={variant?.id || ''} />

        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#d9b444]">Delivery Details</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400">Full Name</label>
            <input required name="fullName" placeholder="e.g. Mohammed Shafi" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white outline-none focus:border-[#d9b444]" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Phone Number</label>
            <input required name="phoneNumber" placeholder="e.g. 9876543210" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white outline-none focus:border-[#d9b444]" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400">Email Address (for order receipt)</label>
          <input required type="email" name="email" placeholder="name@example.com" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white outline-none focus:border-[#d9b444]" />
        </div>

        <div>
          <label className="text-xs text-gray-400">Delivery Address</label>
          <input required name="address" placeholder="House/Flat No, Building, Street" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white outline-none focus:border-[#d9b444]" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-400">City / Town</label>
            <input required name="city" placeholder="Kottakkal" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white outline-none focus:border-[#d9b444]" />
          </div>
          <div>
            <label className="text-xs text-gray-400">State</label>
            <input required name="state" defaultValue="Kerala" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white outline-none focus:border-[#d9b444]" />
          </div>
          <div>
            <label className="text-xs text-gray-400">PIN Code</label>
            <input required name="pinCode" placeholder="676503" className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white outline-none focus:border-[#d9b444]" />
          </div>
        </div>

        <div className="pt-2">
          <label className="text-xs text-gray-400">Discount Coupon / Promo Code</label>
          <input 
            name="couponCode" 
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter coupon code (e.g. ROYAL10)" 
            className="w-full bg-[#0d0f12] border border-[#232731] rounded p-2.5 text-xs text-white uppercase outline-none focus:border-[#d9b444] mt-1" 
          />
          <p className="text-[11px] text-[#d9b444] mt-1">
            ✨ Special Offer: Use code <strong className="font-bold underline">ROYAL10</strong> to get 10% instant discount!
          </p>
        </div>

        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#d9b444] pt-4 border-t border-[#232731]">Payment Method</h2>
        
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-3 p-3 rounded-lg border border-[#232731] bg-[#0d0f12] cursor-pointer hover:border-[#d9b444]">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="COD" 
              checked={paymentMethod === 'COD'} 
              onChange={() => setPaymentMethod('COD')}
              className="accent-[#d9b444]" 
            />
            <div>
              <p className="font-semibold text-white">Cash on Delivery (COD)</p>
              <p className="text-[11px] text-gray-400">Pay cash upon delivery (+₹50 Handling fee)</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-[#232731] bg-[#0d0f12] cursor-pointer hover:border-[#d9b444]">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="UPI" 
              checked={paymentMethod === 'UPI'} 
              onChange={() => setPaymentMethod('UPI')}
              className="accent-[#d9b444]" 
            />
            <div>
              <p className="font-semibold text-white">UPI / Google Pay / PhonePe / Cards</p>
              <p className="text-[11px] text-gray-400">Instant contactless & zero extra handling fees</p>
            </div>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading || !variant}
          className="w-full bg-[#c69e2a] hover:bg-[#d9b444] text-black font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#c69e2a]/20 disabled:opacity-50"
        >
          {loading ? 'Processing...' : (paymentMethod === 'UPI' ? `Pay ₹${grandTotal} Online` : 'Confirm & Place Order')}
        </button>
      </form>

      <div className="bg-[#14161d] border border-[#232731] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-serif text-[#d9b444] tracking-wider">Order Summary</h2>

        {variant ? (
          <div className="space-y-3 text-xs">
            <div className="border-b border-[#232731] pb-3">
              <p className="font-semibold text-white">{variant.name}</p>
              <p className="text-gray-400">{variant.labelSize}</p>
              <p className="text-[#d9b444] font-medium mt-1">₹{unitPrice}</p>
            </div>

            <div className="space-y-1.5 text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{unitPrice}</span>
              </div>
              {isCouponApplied && (
                <div className="flex justify-between text-[#d9b444]">
                  <span>Discount (ROYAL10)</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-400">{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
              </div>
              {paymentMethod === 'COD' && (
                <div className="flex justify-between text-yellow-500">
                  <span>COD Handling Fee</span>
                  <span>₹50</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold pt-2 border-t border-[#232731] text-sm">
                <span>Total Amount</span>
                <span className="text-[#d9b444]">₹{grandTotal}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400">No fragrance selected. Please return to catalog.</p>
        )}
      </div>
    </div>
  );
}