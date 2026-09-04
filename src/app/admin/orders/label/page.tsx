import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PrintShippingLabelPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }> | { id?: string };
}) {
  // Await searchParams for Next.js 15 compatibility
  const resolvedParams = await searchParams;
  const orderId = resolvedParams?.id;

  if (!orderId) {
    return (
      <div className="p-8 text-center text-sm font-sans">
        Order ID missing. Please return to orders page.
      </div>
    );
  }

  let order: any = null;
  try {
    order = await (prisma.order.findUnique as any)({
      where: { id: orderId },
      include: {
        orderItems: true,
        shipping: true,
        customer: true,
        payment: true,
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-sm font-sans">
        Order not found.
      </div>
    );
  }

  // Parse shipping address snapshot safely
  let snapshot: any = {};
  try {
    if (typeof order.shippingAddressSnapshot === 'string') {
      snapshot = JSON.parse(order.shippingAddressSnapshot);
    } else if (order.shippingAddressSnapshot) {
      snapshot = order.shippingAddressSnapshot;
    }
  } catch (err) {
    console.error('Address parsing error:', err);
    snapshot = {};
  }

  const customerName =
    snapshot.fullName ||
    order.customer?.name ||
    'Customer';

  const customerPhone =
    snapshot.phoneNumber ||
    snapshot.phone ||
    order.customer?.phone ||
    'Not provided';

  const address = snapshot.address || '';
  const city = snapshot.city || '';
  const state = snapshot.state || '';
  const pinCode = snapshot.pinCode || snapshot.pincode || '';

  const items: any[] = order.orderItems || [];
  const isCOD =
    Number(order.codCharge || 0) > 0 ||
    order.payment?.paymentMethod === 'COD' ||
    String(order.paymentMethod || '').toUpperCase().includes('COD');

  return (
    <div className="min-h-screen bg-neutral-100 p-4 md:p-8 text-black font-sans print:p-0 print:bg-white">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/admin/orders"
          className="text-xs font-semibold text-gray-600 hover:text-black border border-gray-300 bg-white px-3 py-1.5 rounded"
        >
          ← Back to Orders
        </Link>
        {/* Handled via vanilla script listener to prevent Server Component onClick error */}
        <button
          type="button"
          className="print-trigger bg-black hover:bg-neutral-800 text-white font-bold text-xs px-5 py-2 rounded shadow cursor-pointer"
        >
          🖨️ Print Label (4x6 / A4)
        </button>
      </div>

      {/* 4x6 Shipping Label Sheet */}
      <div className="max-w-2xl mx-auto bg-white border-2 border-black p-5 space-y-4 shadow-sm print:max-w-full print:border-2 print:border-black print:p-4 print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <h1 className="text-xl font-serif font-black tracking-wider uppercase">
              TABASSUM ATTAR
            </h1>
            <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">
              Artisanal Perfumes & Dehn Al Oudh
            </p>
          </div>
          <div className="text-right border-2 border-black px-3 py-1">
            <span className="text-[9px] uppercase font-bold block">Type</span>
            <span className="text-sm font-black tracking-wider uppercase">
              {isCOD ? 'CASH ON DELIVERY' : 'PREPAID'}
            </span>
          </div>
        </div>

        {/* Order Reference & Tracking */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">
              Order Number
            </span>
            <span className="font-mono text-base font-black tracking-wider">
              #{order.orderNumber || order.id?.slice(0, 8)}
            </span>
            <span className="text-[10px] block text-neutral-600">
              Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
            </span>
          </div>

          <div className="text-right">
            {order.shipping?.trackingNumber ? (
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">AWB / Consignment</span>
                <span className="font-mono text-sm font-bold">{order.shipping.trackingNumber}</span>
                <span className="text-[10px] block text-neutral-600">{order.shipping.courierName || 'Speed Post'}</span>
              </div>
            ) : (
              <div className="border border-dashed border-neutral-400 px-3 py-1 text-[11px] font-mono text-neutral-500">
                STANDARD SHIPPING
              </div>
            )}
          </div>
        </div>

        {/* Deliver To (Recipient) */}
        <div className="border-b-2 border-black pb-3 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 inline-block">
            SHIP TO (DELIVERY ADDRESS)
          </span>
          <p className="text-base font-black uppercase text-black pt-1">
            {customerName}
          </p>
          <p className="text-xs leading-relaxed font-semibold text-neutral-800">
            {address}
          </p>
          {(city || state) && (
            <p className="text-xs font-bold text-black">
              {[city, state].filter(Boolean).join(', ')} {pinCode ? `- ${pinCode}` : ''}
            </p>
          )}
          <div className="pt-1.5">
            <span className="text-xs font-bold bg-neutral-200 px-2 py-0.5 rounded border border-neutral-400">
              📞 Phone: {customerPhone}
            </span>
          </div>
        </div>

        {/* Package Items */}
        <div className="border-b-2 border-black pb-3">
          <span className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">
            Package Contents
          </span>
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-neutral-300 text-neutral-600">
                <th className="py-1">Fragrance</th>
                <th className="py-1">Size</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-medium">
              {items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-1.5 font-bold">{item.productName || item.title || 'Item'}</td>
                  <td className="py-1.5 text-neutral-600">{item.variantSize || 'Standard'}</td>
                  <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                  <td className="py-1.5 text-right">₹{Number(item.totalPrice || item.price || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Amount to Collect */}
        <div className="flex items-center justify-between bg-neutral-100 border-2 border-black p-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-600 block">
              Instructions
            </span>
            <span className="text-xs font-black uppercase">
              {isCOD ? 'Collect Cash from Customer' : 'Prepaid Order - Do Not Collect Cash'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-neutral-600 block">Total Amount</span>
            <span className="text-xl font-black text-black">
              ₹{Number(order.grandTotal || order.total || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Sender Address */}
        <div className="pt-2 text-[10px] leading-relaxed border-t border-neutral-300 flex justify-between items-end">
          <div>
            <span className="font-black uppercase block text-[9px] text-neutral-600">Sender / Return Address:</span>
            <p className="font-bold text-neutral-900">TABASSUM ATTAR</p>
            <p className="text-neutral-600">Kottakkal, Malappuram District, Kerala - 676503</p>
            <p className="text-neutral-600">Support: +91 7306610349</p>
          </div>
          <div className="text-right font-mono text-[9px] text-neutral-400">
            FRAGILE • HANDLE WITH CARE
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelector('.print-trigger')?.addEventListener('click', function() {
              window.print();
            });
          `,
        }}
      />
    </div>
  );
}