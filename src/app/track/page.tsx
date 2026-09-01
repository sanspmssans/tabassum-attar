import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams?.q?.trim();

  let order = null;
  if (query) {
    order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: query.toUpperCase() },
          { id: query },
          { customer: { user: { phoneNumber: query } } },
        ],
      },
      include: {
        orderItems: true,
        payment: true,
        customer: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  const shipping = (order?.shippingAddressSnapshot as any) || {};

  // Status Step Mapper
  const steps = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStatus = order?.orderStatus || 'CONFIRMED';
  const currentStepIndex = steps.indexOf(currentStatus) !== -1 ? steps.indexOf(currentStatus) : 0;

  return (
    <main className="min-h-screen bg-[#0b0c10] text-[#fbf8f2]">
      {/* Header */}
      <header className="border-b border-[#232731] bg-[#101217]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif tracking-widest text-[#d9b444] font-bold">
            TABASSUM ATTAR
          </Link>
          <Link href="/" className="text-xs uppercase tracking-wider text-gray-400 hover:text-[#d9b444]">
            ← Back to Store
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-white font-medium">Track Your Consignment</h1>
          <p className="text-xs text-gray-400">
            Enter your Order Number (e.g. TAB-395575) or registered Mobile Number
          </p>
        </div>

        {/* Search Bar */}
        <form method="GET" className="flex gap-2 max-w-lg mx-auto">
          <input
            name="q"
            defaultValue={query || ''}
            placeholder="e.g. TAB-395575 or 7306610349"
            required
            className="flex-1 bg-[#14161d] border border-[#232731] rounded-lg px-4 py-3 text-xs text-white uppercase outline-none focus:border-[#d9b444]"
          />
          <button
            type="submit"
            className="bg-[#c69e2a] hover:bg-[#d9b444] text-black font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#c69e2a]/20"
          >
            Track
          </button>
        </form>

        {query && !order && (
          <div className="bg-[#14161d] border border-red-900/40 rounded-xl p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-red-400">No consignment found for &quot;{query}&quot;</p>
            <p className="text-xs text-gray-500">Please double-check your Order Number or Phone Number.</p>
          </div>
        )}

        {order && (
          <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl">
            {/* Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#232731] gap-4">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Order Consignment</span>
                <p className="text-xl font-mono font-bold text-[#d9b444]">#{order.orderNumber}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Total Payable</span>
                <span className="text-xl font-bold font-mono text-white">₹{Number(order.grandTotal).toFixed(2)}</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">({order.payment?.paymentMethod})</span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-4 font-semibold">Live Dispatch Timeline</p>
              <div className="grid grid-cols-4 gap-2 text-center relative">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  return (
                    <div key={step} className="space-y-2">
                      <div
                        className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-[#d9b444] text-black shadow-lg shadow-[#d9b444]/30'
                            : 'bg-[#232731] text-gray-500 border border-[#333a48]'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDone ? 'text-[#d9b444]' : 'text-gray-600'}`}>
                        {step}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items & Shipping Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#232731] text-xs">
              <div className="space-y-2 bg-[#0d0f12] p-4 rounded-xl border border-[#232731]">
                <p className="font-bold text-[#d9b444] uppercase tracking-wider text-[11px]">Ordered Fragrances</p>
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-gray-300 py-1 border-b border-[#1a1e27] last:border-none">
                    <span>{item.productName} ({item.variantSize}) × {item.quantity}</span>
                    <span className="font-mono text-white">₹{Number(item.totalPrice).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 bg-[#0d0f12] p-4 rounded-xl border border-[#232731]">
                <p className="font-bold text-[#d9b444] uppercase tracking-wider text-[11px]">Delivery Consignee</p>
                <p className="font-semibold text-white">{shipping.fullName}</p>
                <p className="text-gray-400">{shipping.address}</p>
                <p className="text-gray-400">{shipping.city}, {shipping.state} - {shipping.pinCode}</p>
                <p className="text-gray-400">📞 {shipping.phoneNumber}</p>
              </div>
            </div>

            {/* Help / Support */}
            <div className="text-center pt-4">
              <a
                href="https://wa.me/917306610349?text=Hello%20Tabassum%20Attar,%20need%20help%20tracking%20my%20order."
                target="_blank"
                className="text-xs text-[#25D366] hover:underline"
              >
                Need help with your delivery? Chat with us on WhatsApp →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}