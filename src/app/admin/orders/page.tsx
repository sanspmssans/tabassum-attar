import prisma from '@/lib/prisma';
import Link from 'next/link';
import { updateOrderStatus, updateTrackingInfo } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders: any[] = await (prisma.order.findMany as any)({
    include: {
      customer: true,
      orderItems: true,
      shipping: true,
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o: any) => o.orderStatus === 'PENDING').length;
  const shippedOrders = orders.filter((o: any) => o.orderStatus === 'SHIPPED').length;
  const totalRevenue = orders.reduce(
    (sum: number, o: any) => sum + Number(o.grandTotal || o.subTotal || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#232731] pb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            Customer Orders ({totalOrders})
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Track customer shipments, print shipping labels, and manage fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/track"
            target="_blank"
            className="text-xs text-[#d9b444] border border-[#c69e2a]/40 hover:bg-[#c69e2a]/10 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>🔍</span> Customer Tracking Page
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#14161d] border border-[#232731] rounded-xl p-4">
          <span className="text-[10px] uppercase text-gray-400 tracking-wider">Total Orders</span>
          <p className="text-2xl font-bold text-white mt-1">{totalOrders}</p>
        </div>

        <div className="bg-[#14161d] border border-[#232731] rounded-xl p-4">
          <span className="text-[10px] uppercase text-amber-400 tracking-wider">Pending Orders</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pendingOrders}</p>
        </div>

        <div className="bg-[#14161d] border border-[#232731] rounded-xl p-4">
          <span className="text-[10px] uppercase text-blue-400 tracking-wider">In Transit / Shipped</span>
          <p className="text-2xl font-bold text-blue-400 mt-1">{shippedOrders}</p>
        </div>

        <div className="bg-[#14161d] border border-[#232731] rounded-xl p-4">
          <span className="text-[10px] uppercase text-[#d9b444] tracking-wider">Total Revenue</span>
          <p className="text-2xl font-bold text-[#d9b444] mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-[#14161d] border border-[#232731] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0e1015] border-b border-[#232731] text-[10px] uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-4 px-4">Order ID</th>
                <th className="py-4 px-4">Customer & Contact</th>
                <th className="py-4 px-4">Fragrances Ordered</th>
                <th className="py-4 px-4">Total Amount</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Tracking Details</th>
                <th className="py-4 px-4 text-right">Label & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f222b]">
              {orders.length > 0 ? (
                orders.map((order: any) => {
                  const items: any[] = order.orderItems || [];

                  // Address snapshot parsing
                  const snapshot =
                    typeof order.shippingAddressSnapshot === 'string'
                      ? JSON.parse(order.shippingAddressSnapshot)
                      : order.shippingAddressSnapshot || {};

                  const customerName =
                    snapshot.fullName ||
                    snapshot.name ||
                    order.customer?.name ||
                    'Customer';

                  const customerPhone =
                    snapshot.phone ||
                    snapshot.mobile ||
                    order.customer?.phone ||
                    '';

                  const addressText =
                    snapshot.address ||
                    [snapshot.street, snapshot.city, snapshot.state, snapshot.pincode]
                      .filter(Boolean)
                      .join(', ') ||
                    'Address in record';

                  const trackingNo = order.shipping?.trackingNumber || '';
                  const courier = order.shipping?.carrier || '';

                  const currentStatus = order.orderStatus || 'PENDING';

                  const waMessage = encodeURIComponent(
                    `Hello ${customerName},\n\nYour order #${order.orderNumber} from Tabassum Attar is now: ${currentStatus}.\n${
                      trackingNo
                        ? `Tracking No: ${trackingNo} (${courier || 'Courier'})\nTrack here: https://tabassum-attar.vercel.app/track`
                        : ''
                    }\n\nThank you for choosing Tabassum Attar!`
                  );

                  return (
                    <tr key={order.id} className="hover:bg-[#1a1e27] transition-colors align-top">
                      {/* Order Number */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#d9b444] text-xs block">
                          #{order.orderNumber}
                        </span>
                      </td>

                      {/* Customer Details */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <p className="font-semibold text-white text-xs">{customerName}</p>
                        <p className="text-[11px] text-gray-400">{customerPhone || 'No Phone'}</p>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
                          {addressText}
                        </p>
                      </td>

                      {/* Line Items */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="space-y-1.5">
                          {items.map((item: any, idx: number) => (
                            <div key={idx} className="text-[11px] text-gray-300">
                              <span className="font-medium text-white">
                                {item.productName}
                              </span>
                              <span className="text-[10px] text-gray-400 block">
                                Size: {item.variantSize || 'Standard'} × {item.quantity} (₹{Number(item.totalPrice || 0)})
                              </span>
                            </div>
                          ))}
                          {items.length === 0 && (
                            <span className="text-[10px] text-gray-500 italic">Fragrance Order</span>
                          )}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-bold text-[#d9b444] text-sm">
                          ₹{Number(order.grandTotal || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="block text-[10px] text-gray-500 uppercase">
                          COD / UPI
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 min-w-[140px]">
                        <form action={updateOrderStatus} className="space-y-1.5">
                          <input type="hidden" name="orderId" value={order.id} />
                          <select
                            name="status"
                            defaultValue={currentStatus}
                            className={`w-full text-xs font-semibold py-1.5 px-2 rounded-lg border outline-none cursor-pointer ${
                              currentStatus === 'DELIVERED'
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                                : currentStatus === 'SHIPPED'
                                ? 'bg-blue-950/40 text-blue-400 border-blue-800/50'
                                : currentStatus === 'CANCELLED'
                                ? 'bg-red-950/40 text-red-400 border-red-800/50'
                                : 'bg-amber-950/40 text-amber-400 border-amber-800/50'
                            }`}
                          >
                            <option value="PENDING" className="bg-[#14161d] text-white">PENDING</option>
                            <option value="CONFIRMED" className="bg-[#14161d] text-white">CONFIRMED</option>
                            <option value="SHIPPED" className="bg-[#14161d] text-white">SHIPPED</option>
                            <option value="DELIVERED" className="bg-[#14161d] text-white">DELIVERED</option>
                            <option value="CANCELLED" className="bg-[#14161d] text-white">CANCELLED</option>
                          </select>
                          <button
                            type="submit"
                            className="w-full bg-[#232731] hover:bg-[#2e3440] text-[10px] text-gray-300 py-1 rounded transition-colors cursor-pointer"
                          >
                            Update
                          </button>
                        </form>
                      </td>

                      {/* Tracking */}
                      <td className="py-4 px-4 min-w-[180px]">
                        <form action={updateTrackingInfo} className="space-y-1.5">
                          <input type="hidden" name="orderId" value={order.id} />
                          <input
                            type="text"
                            name="trackingNumber"
                            defaultValue={trackingNo}
                            placeholder="Tracking / AWB No."
                            className="w-full bg-[#0d0f12] border border-[#232731] rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:border-[#d9b444] outline-none"
                          />
                          <button
                            type="submit"
                            className="w-full bg-[#c69e2a]/20 hover:bg-[#c69e2a]/30 text-[#d9b444] border border-[#c69e2a]/40 text-[10px] py-1 rounded transition-colors cursor-pointer"
                          >
                            Save Tracking
                          </button>
                        </form>
                      </td>

                      {/* Print Label & WhatsApp Action */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end gap-1.5">
                          <Link
                            href={`/admin/orders/label?id=${order.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 bg-[#d9b444] hover:bg-[#c69e2a] text-black px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all shadow cursor-pointer"
                          >
                            🖨️ Print Label
                          </Link>

                          {customerPhone ? (
                            <a
                              href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${waMessage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 hover:bg-[#25D366] hover:text-black px-2.5 py-1 rounded text-[10px] font-medium transition-all"
                            >
                              💬 WhatsApp
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 text-xs">
                    No orders received yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}