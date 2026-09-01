import prisma from '@/lib/prisma';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      orderItems: true,
      payment: true,
      customer: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  async function updateOrderStatusAction(formData: FormData) {
    'use server';
    const orderId = formData.get('orderId') as string;
    const newStatus = formData.get('orderStatus') as OrderStatus;

    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: newStatus },
    });

    revalidatePath('/admin/orders');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-white font-medium">Customer Orders</h1>
          <p className="text-xs text-gray-400 mt-1">Real-time orders, dispatch details, and customer shipping addresses</p>
        </div>
        <Link href="/admin" className="text-xs text-gray-400 hover:text-[#d9b444] border border-[#2e3440] px-3 py-1.5 rounded">
          ← Back to Dashboard
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#14161d] border border-[#232731] rounded-xl p-12 text-center text-gray-400 text-xs">
          No orders placed yet. Place a test order from the store!
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const address = order.shippingAddressSnapshot as any;
            return (
              <div key={order.id} className="bg-[#14161d] border border-[#232731] rounded-xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#232731] pb-4">
                  <div>
                    <span className="font-mono text-sm font-bold text-[#d9b444]">{order.orderNumber}</span>
                    <span className="text-[11px] text-gray-400 ml-3">
                      {new Date(order.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  {/* Status Changer Form */}
                  <form action={updateOrderStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select
                      name="orderStatus"
                      defaultValue={order.orderStatus}
                      className="bg-[#0d0f12] border border-[#232731] text-xs text-[#d9b444] rounded px-2.5 py-1 outline-none"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="DISPATCHED">DISPATCHED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <button type="submit" className="bg-[#232731] hover:bg-[#2d3240] text-white text-[11px] px-3 py-1 rounded transition-colors">
                      Update
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Items Ordered */}
                  <div>
                    <p className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold mb-2">Ordered Fragrances</p>
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="space-y-0.5">
                        <p className="font-semibold text-white">{item.productName}</p>
                        <p className="text-gray-400">{item.variantSize} × {item.quantity}</p>
                        <p className="text-[#d9b444]">₹{item.totalPrice.toString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <p className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold mb-2">Customer Shipping Address</p>
                    <p className="font-semibold text-white">{address?.fullName || order.customer.user.name}</p>
                    <p className="text-gray-300 mt-1">{address?.address}</p>
                    <p className="text-gray-300">{address?.city}, {address?.state} - {address?.pinCode}</p>
                    <p className="text-[#d9b444] mt-1">📞 {address?.phoneNumber || order.customer.user.phoneNumber}</p>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="space-y-1">
                    <p className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold mb-2">Payment Summary</p>
                    <div className="flex justify-between text-gray-400">
                      <span>Method:</span>
                      <span className="text-white font-medium">{order.payment?.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Shipping:</span>
                      <span>₹{order.shippingCharge.toString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>COD Fee:</span>
                      <span>₹{order.codCharge.toString()}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-2 border-t border-[#232731]">
                      <span>Grand Total:</span>
                      <span className="text-[#d9b444] text-sm">₹{order.grandTotal.toString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}