import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string; orderNumber?: string; id?: string };
}) {
  const queryParam =
    searchParams.orderNumber ||
    searchParams.orderId ||
    searchParams.id ||
    '';

  // Find order by orderNumber or database ID
  let order: any = null;
  if (queryParam) {
    order = await (prisma.order.findFirst as any)({
      where: {
        OR: [
          { orderNumber: queryParam },
          { id: queryParam },
        ],
      },
      include: {
        customer: true,
        orderItems: true,
      },
    }).catch(() => null);
  }

  // Fallback to queryParam directly if it's already an order number (e.g. TAB-123456)
  const displayOrderNumber =
    order?.orderNumber ||
    (queryParam.startsWith('TAB-') ? queryParam : null) ||
    'CONFIRMED';

  const customerName =
    order?.shippingAddressSnapshot?.fullName ||
    order?.customer?.name ||
    'Valued Customer';

  const waMessage = encodeURIComponent(
    `Hello Tabassum Attar,\n\nI have placed an order #${displayOrderNumber}.\nPlease confirm my shipment.\n\nThank you!`
  );

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#fbf8f2] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#14161d] border border-[#232731] rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 text-3xl font-bold shadow-lg shadow-emerald-500/20">
          ✓
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#d9b444]">
            Order Confirmed!
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Thank you for shopping with Tabassum Attar. Your pure fragrance order has been received.
          </p>
        </div>

        {/* Order Number Box */}
        <div className="bg-[#0b0c10] border border-[#232731] rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
            YOUR ORDER NUMBER
          </span>
          <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider block">
            #{displayOrderNumber}
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <a
            href={`https://wa.me/917306610349?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 cursor-pointer"
          >
            <span>💬</span> Confirm Order via WhatsApp
          </a>

          <Link
            href="/"
            className="inline-block text-xs font-semibold text-gray-400 hover:text-white transition-colors pt-2"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}