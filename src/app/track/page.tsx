import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TrackPage({
  searchParams,
}: {
  searchParams: { orderId?: string; q?: string };
}) {
  const query = (searchParams.orderId || searchParams.q || '').trim();

  let order: any = null;

  if (query) {
    const cleanQuery = query.replace('#', '');

    order = await (prisma.order.findFirst as any)({
      where: {
        OR: [
          { orderNumber: cleanQuery },
          { id: cleanQuery },
          { customer: { phone: cleanQuery } },
        ],
      },
      include: {
        orderItems: true,
        shipping: true,
      },
    }).catch(() => null);
  }

  const getStepNumber = (status: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      default: return 1;
    }
  };

  const status = order?.orderStatus || 'PENDING';
  const currentStep = order ? getStepNumber(status) : 0;

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#fbf8f2] py-12 px-6">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="text-xl font-serif tracking-widest text-[#d9b444] font-bold">
            TABASSUM ATTAR
          </Link>
          <h2 className="text-2xl font-serif font-bold text-white">Track Your Order</h2>
          <p className="text-xs text-gray-400">
            Enter your Order ID (e.g. #ORD-12345) or Phone Number
          </p>
        </div>

        <form method="GET" action="/track" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Enter Order ID or Mobile..."
            required
            className="flex-1 bg-[#14161d] border border-[#232731] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-[#d9b444] outline-none"
          />
          <button
            type="submit"
            className="bg-[#c69e2a] hover:bg-[#d9b444] text-black font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Track
          </button>
        </form>

        {query && (
          <div className="bg-[#14161d] border border-[#232731] rounded-2xl p-6 shadow-xl space-y-6">
            {order ? (
              <>
                <div className="flex items-center justify-between border-b border-[#232731] pb-4">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400">Order Number</span>
                    <p className="text-base font-mono font-bold text-[#d9b444]">
                      #{order.orderNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-gray-400">Live Status</span>
                    <p className="text-xs font-bold text-white uppercase bg-[#1f2430] px-2.5 py-1 rounded border border-[#2e3440] mt-0.5">
                      {status}
                    </p>
                  </div>
                </div>

                {/* Timeline Progress */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-medium pt-2">
                  <div className={`space-y-1 ${currentStep >= 1 ? 'text-[#d9b444]' : 'text-gray-600'}`}>
                    <div className={`h-1.5 rounded-full ${currentStep >= 1 ? 'bg-[#d9b444]' : 'bg-[#232731]'}`} />
                    <span>Order Placed</span>
                  </div>
                  <div className={`space-y-1 ${currentStep >= 2 ? 'text-[#d9b444]' : 'text-gray-600'}`}>
                    <div className={`h-1.5 rounded-full ${currentStep >= 2 ? 'bg-[#d9b444]' : 'bg-[#232731]'}`} />
                    <span>Confirmed</span>
                  </div>
                  <div className={`space-y-1 ${currentStep >= 3 ? 'text-[#d9b444]' : 'text-gray-600'}`}>
                    <div className={`h-1.5 rounded-full ${currentStep >= 3 ? 'bg-[#d9b444]' : 'bg-[#232731]'}`} />
                    <span>Shipped</span>
                  </div>
                  <div className={`space-y-1 ${currentStep >= 4 ? 'text-emerald-400' : 'text-gray-600'}`}>
                    <div className={`h-1.5 rounded-full ${currentStep >= 4 ? 'bg-emerald-400' : 'bg-[#232731]'}`} />
                    <span>Delivered</span>
                  </div>
                </div>

                {order.shipping?.trackingNumber && (
                  <div className="bg-[#0e1015] border border-[#2e3440] rounded-xl p-4 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400">
                      Tracking Consignment
                    </span>
                    <p className="text-xs text-white">
                      Tracking No: <span className="font-mono font-bold text-[#d9b444]">{order.shipping.trackingNumber}</span>
                    </p>
                    {order.shipping.carrier && (
                      <p className="text-[11px] text-gray-400">Via: {order.shipping.carrier}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-gray-400 text-xs">
                No order found for &quot;{query}&quot;. Please verify the details.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}