'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { processOrder } from './actions';

export default function CheckoutForm({
  product,
  variant,
}: {
  product: any;
  variant: any;
}) {
  const [isPending, startTransition] = useTransition();

  // Coupon States
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');

  // Pricing calculations
  const basePrice = Number(variant.discountPrice || variant.price || 0);
  const discountAmount = appliedCoupon ? Math.round((basePrice * appliedCoupon.percent) / 100) : 0;
  const grandTotal = Math.max(0, basePrice - discountAmount);

  // Apply Coupon Logic
  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setCouponError('');

    const cleanCode = couponInput.trim().toUpperCase();

    if (cleanCode === 'ROYAL10') {
      setAppliedCoupon({ code: 'ROYAL10', percent: 10 });
      setCouponError('');
    } else if (!cleanCode) {
      setCouponError('Please enter a coupon code.');
    } else {
      setCouponError('Invalid coupon code. Try ROYAL10');
    }
  };

  const handleRemoveCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await processOrder(formData);
        });
      }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
    >
      <input type="hidden" name="variantId" value={variant.id} />
      <input type="hidden" name="couponCode" value={appliedCoupon?.code || ''} />
      <input type="hidden" name="couponDiscount" value={discountAmount} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      {/* Left Column: Shipping Details Form */}
      <div className="lg:col-span-7 bg-[#14161d] border border-[#232731] rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Shipping & Delivery Details
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Please provide your complete shipping address for express delivery.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="Enter your full name"
              className="w-full bg-[#0b0c10] border border-[#232731] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:border-[#d9b444] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              WhatsApp / Mobile Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              required
              placeholder="10-digit mobile number"
              className="w-full bg-[#0b0c10] border border-[#232731] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:border-[#d9b444] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Complete Delivery Address (House / Building / Street) *
            </label>
            <textarea
              name="address"
              required
              rows={3}
              placeholder="House Name / Flat No, Street or Locality"
              className="w-full bg-[#0b0c10] border border-[#232731] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:border-[#d9b444] outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                City / Town *
              </label>
              <input
                type="text"
                name="city"
                required
                placeholder="e.g. Kottakkal"
                className="w-full bg-[#0b0c10] border border-[#232731] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:border-[#d9b444] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                defaultValue="Kerala"
                required
                className="w-full bg-[#0b0c10] border border-[#232731] rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#d9b444] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                name="pinCode"
                required
                placeholder="6-digit PIN"
                className="w-full bg-[#0b0c10] border border-[#232731] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:border-[#d9b444] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="pt-4 border-t border-[#232731] space-y-3">
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Select Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('COD')}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                paymentMethod === 'COD'
                  ? 'border-[#d9b444] bg-[#d9b444]/15'
                  : 'border-[#232731] bg-[#0b0c10] text-gray-400'
              }`}
            >
              <span className="block text-xs font-bold text-white">💵 Cash on Delivery</span>
              <span className="text-[10px] text-gray-400">Pay when order arrives</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('UPI')}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                paymentMethod === 'UPI'
                  ? 'border-[#d9b444] bg-[#d9b444]/15'
                  : 'border-[#232731] bg-[#0b0c10] text-gray-400'
              }`}
            >
              <span className="block text-xs font-bold text-white">⚡ UPI / Online</span>
              <span className="text-[10px] text-gray-400">GPay, PhonePe, Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Order Summary & Coupon */}
      <div className="lg:col-span-5 space-y-4">
        {/* Fragrance Item Card */}
        <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-5 shadow-xl space-y-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#d9b444] block">
            Selected Fragrance
          </span>

          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-xl bg-[#0b0c10] border border-[#232731] relative overflow-hidden flex-shrink-0 flex items-center justify-center">
              {product.images?.[0]?.url ? (
                <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
              ) : (
                <span className="text-2xl">🧴</span>
              )}
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base">{product.name}</h3>
              <p className="text-xs text-[#d9b444] font-medium mt-0.5">
                Size: {variant.labelSize || 'Standard'}
              </p>
              <p className="text-xs text-gray-400">Qty: 1 Bottle</p>
            </div>
          </div>
        </div>

        {/* Promo Code / Coupon Section */}
        <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-5 shadow-xl space-y-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-300 block">
            Have a Promo Code?
          </span>

          {!appliedCoupon ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter Code (e.g. ROYAL10)"
                className="flex-1 bg-[#0b0c10] border border-[#232731] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 uppercase font-mono focus:border-[#d9b444] outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="bg-[#c69e2a] hover:bg-[#d9b444] text-black font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow"
              >
                Apply
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-[#0b0c10] border border-[#d9b444]/50 p-3 rounded-xl">
              <div>
                <span className="font-mono text-xs font-bold text-[#d9b444] block">
                  🎉 {appliedCoupon.code} APPLIED
                </span>
                <span className="text-[10px] text-gray-400">
                  {appliedCoupon.percent}% discount applied to this order
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}

          {couponError && (
            <p className="text-[11px] text-red-400 font-medium">{couponError}</p>
          )}
        </div>

        {/* Order Bill Breakdown */}
        <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-5 shadow-xl space-y-3 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>Item Price</span>
            <span>₹{basePrice.toLocaleString('en-IN')}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-[#d9b444] font-medium">
              <span>Promo Discount ({appliedCoupon.code})</span>
              <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-400">
            <span>Express Delivery</span>
            <span className="text-emerald-400 font-medium uppercase">Free Shipping</span>
          </div>

          <div className="flex justify-between text-sm font-bold text-white border-t border-[#232731] pt-3">
            <span>Total Payable</span>
            <span className="text-lg text-[#d9b444]">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Place Order Action Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#c69e2a] hover:bg-[#d9b444] disabled:opacity-50 text-black font-bold text-center py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c69e2a]/20 cursor-pointer mt-2"
          >
            {isPending ? 'Placing Order...' : `Confirm Order • ₹${grandTotal.toLocaleString('en-IN')}`}
          </button>
        </div>
      </div>
    </form>
  );
}