import prisma from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PaymentMethod, PaymentStatus, OrderStatus, InventoryAction } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { variantId?: string };
}) {
  const variant = searchParams.variantId
    ? await prisma.productVariant.findUnique({
        where: { id: searchParams.variantId },
        include: { product: true, inventory: true },
      })
    : null;

  async function placeOrderAction(formData: FormData) {
    'use server';

    const selectedVariantId = formData.get('variantId') as string;
    const fullName = (formData.get('fullName') as string) || 'Customer';
    const phoneNumber = (formData.get('phoneNumber') as string || '').trim();
    const email = (formData.get('email') as string || '').trim().toLowerCase();
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
      throw new Error('Selected item is unavailable.');
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

    // Safely find existing user by email or phoneNumber
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

    // Create Order
    await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        orderStatus: OrderStatus.CONFIRMED,
        subTotal: priceAfterDiscount,
        shippingCharge,
        codCharge,
        grandTotal,
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
            paymentStatus: paymentMethod === PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.CAPTURED,
            amount: grandTotal,
          },
        },
      },
    });

    // Safe Inventory Update
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

    redirect(`/checkout/success?orderNumber=${orderNumber}`);
  }

  return (
    <main className="min-h-screen bg-[#0b0c10] text-[#fbf8f2]">
      <header className="border-b border-[#232731] bg-[#101217]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif tracking-widest text-[#d9b444] font-bold">
            TABASSUM ATTAR
          </Link>
          <Link href="/" className="text-xs uppercase tracking-wider text-gray-400 hover:text-[#d9b444]">
            ← Return to Store
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl md:text-3xl font-serif text-white mb-8">Secure Express Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Shipping Form */}
          <form action={placeOrderAction} className="md:col-span-2 bg-[#14161d] border border-[#232731] rounded-xl p-6 space-y-4">
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

            {/* Coupon Code Input */}
            <div className="pt-2">
              <label className="text-xs text-gray-400">Discount Coupon / Promo Code</label>
              <input 
                name="couponCode" 
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
                <input type="radio" name="paymentMethod" value="COD" defaultChecked className="accent-[#d9b444]" />
                <div>
                  <p className="font-semibold text-white">Cash on Delivery (COD)</p>
                  <p className="text-[11px] text-gray-400">Pay cash upon delivery (+₹50 Handling fee)</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-[#232731] bg-[#0d0f12] cursor-pointer hover:border-[#d9b444]">
                <input type="radio" name="paymentMethod" value="UPI" className="accent-[#d9b444]" />
                <div>
                  <p className="font-semibold text-white">UPI / Google Pay / PhonePe</p>
                  <p className="text-[11px] text-gray-400">Instant contactless payment</p>
                </div>
              </label>
            </div>

            <button type="submit" className="w-full bg-[#c69e2a] hover:bg-[#d9b444] text-black font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#c69e2a]/20">
              Confirm & Place Order
            </button>
          </form>

          {/* Order Summary Sidebar */}
          <div className="bg-[#14161d] border border-[#232731] rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-serif text-[#d9b444] tracking-wider">Order Summary</h2>

            {variant ? (
              <div className="space-y-3 text-xs">
                <div className="border-b border-[#232731] pb-3">
                  <p className="font-semibold text-white">{variant.product.name}</p>
                  <p className="text-gray-400">{variant.labelSize}</p>
                  <p className="text-[#d9b444] font-medium mt-1">₹{variant.discountPrice?.toString() || variant.price.toString()}</p>
                </div>

                <div className="space-y-1.5 text-gray-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{variant.discountPrice?.toString() || variant.price.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-400">
                      {Number(variant.discountPrice || variant.price) >= 999 ? 'FREE' : '₹70'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#d9b444] text-[11px] pt-1">
                    <span>Special Coupon (ROYAL10)</span>
                    <span>10% OFF at checkout</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No fragrance selected. Please return to catalog.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}