import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      orderItems: true,
      payment: true,
      customer: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-white font-medium">Customer Orders</h1>
          <p className="text-xs text-gray-400 mt-1">Manage dispatch, customer details & print shipping labels</p>
        </div>
        <span className="text-xs bg-[#232731] text-[#d9b444] px-3 py-1.5 rounded-lg border border-[#333a48]">
          Total Orders: {orders.length}
        </span>
      </div>

      <div className="bg-[#14161d] border border-[#232731] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1a1e27] text-gray-400 uppercase tracking-wider text-[11px] border-b border-[#232731]">
              <tr>
                <th className="py-4 px-6">Order ID & Date</th>
                <th className="py-4 px-6">Customer Details</th>
                <th className="py-4 px-6">Items Ordered</th>
                <th className="py-4 px-6">Payment</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6 text-center">Shipping Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232731]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const snap = (order.shippingAddressSnapshot as any) || {};
                  return (
                    <tr key={order.id} className="hover:bg-[#161a22] transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono text-white font-bold block">{order.orderNumber}</span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      <td className="py-4 px-6 space-y-0.5">
                        <p className="font-semibold text-white">{snap.fullName || order.customer?.user?.name || 'Customer'}</p>
                        <p className="text-[11px] text-[#d9b444]">📞 {snap.phoneNumber || order.customer?.user?.phoneNumber}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-xs">{snap.city}, {snap.pinCode}</p>
                      </td>

                      <td className="py-4 px-6 space-y-1">
                        {order.orderItems.map((item, idx) => (
                          <div key={idx} className="text-[11px]">
                            <span className="font-medium text-white">{item.productName}</span>{' '}
                            <span className="text-gray-400">({item.variantSize} × {item.quantity})</span>
                          </div>
                        ))}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          order.payment?.paymentMethod === 'COD'
                            ? 'bg-amber-950/70 text-amber-400 border border-amber-800/60'
                            : 'bg-green-950/70 text-green-400 border border-green-800/60'
                        }`}>
                          {order.payment?.paymentMethod || 'COD'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-white font-mono">
                          ₹{Number(order.grandTotal).toFixed(0)}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <Link
                          href={`/admin/orders/label?id=${order.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 bg-[#c69e2a] hover:bg-[#d9b444] text-black font-bold px-3 py-1.5 rounded text-[11px] uppercase tracking-wider transition-colors shadow-sm"
                        >
                          🖨️ Print Label
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}