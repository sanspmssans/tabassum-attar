import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PrintShippingLabelPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const orderId = searchParams?.id;

  if (!orderId) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: orderId }, { orderNumber: orderId }],
    },
    include: {
      orderItems: true,
      payment: true,
      customer: { include: { user: true } },
    },
  });

  if (!order) {
    notFound();
  }

  const shipping = (order.shippingAddressSnapshot as any) || {};
  const isCOD = order.payment?.paymentMethod === 'COD';

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans print:p-0">
      {/* Print / Navigation Bar */}
      <div className="max-w-2xl mx-auto mb-6 flex justify-between items-center bg-gray-100 p-4 rounded-lg border border-gray-300 print:hidden">
        <Link
          href="/admin/orders"
          className="text-xs uppercase font-bold text-gray-600 hover:text-black tracking-wider"
        >
          ← Back to Orders
        </Link>
        <Link
          href="javascript:window.print()"
          className="bg-black text-[#d9b444] px-5 py-2 rounded font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition"
        >
          🖨️ Print Label / Save PDF
        </Link>
      </div>

      {/* 4x6 Inch Standard Shipping Label */}
      <div className="max-w-2xl mx-auto border-2 border-black p-6 space-y-4 rounded-md shadow-sm print:border-2 print:shadow-none print:m-0 print:w-full">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-3">
          <div>
            <h1 className="text-xl font-serif font-black tracking-widest uppercase">
              TABASSUM ATTAR
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-700">
              Pure Hydro-Distillations & Artisanal Perfumes
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block border-2 border-black px-2 py-1 text-xs font-black uppercase">
              {isCOD ? 'COD PARCEL' : 'PREPAID'}
            </span>
            <p className="text-[11px] font-mono mt-1 font-bold">
              #{order.orderNumber}
            </p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-4 border-b-2 border-black pb-4 text-xs">
          <div className="space-y-1">
            <p className="font-bold uppercase text-[10px] bg-black text-white px-1.5 py-0.5 inline-block">
              Deliver To (Consignee):
            </p>
            <p className="font-black text-sm">{shipping.fullName || order.customer?.user?.name}</p>
            <p className="font-medium text-gray-800 leading-snug">{shipping.address}</p>
            <p className="font-bold">
              {shipping.city}, {shipping.state} - <span className="text-sm underline">{shipping.pinCode}</span>
            </p>
            <p className="font-bold mt-1 text-sm">
              📞 Tel: {shipping.phoneNumber || order.customer?.user?.phoneNumber}
            </p>
          </div>

          <div className="border-l-2 border-black pl-4 space-y-1 text-[11px]">
            <p className="font-bold uppercase text-[10px] bg-gray-200 px-1.5 py-0.5 inline-block">
              From (Sender / Return):
            </p>
            <p className="font-bold text-xs">TABASSUM ATTAR</p>
            <p className="text-gray-700 leading-tight">
              Kottakkal, Malappuram District
              <br />
              Kerala, India - 676503
            </p>
            <p className="font-semibold text-[10px] text-gray-600 mt-2">
              Order Date: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Ordered Items */}
        <div>
          <table className="w-full text-left text-xs border border-black border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-black text-[11px]">
                <th className="p-2 border-r border-black font-bold">Item / Fragrance</th>
                <th className="p-2 border-r border-black font-bold">Size</th>
                <th className="p-2 border-r border-black font-bold text-center">Qty</th>
                <th className="p-2 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item, idx) => (
                <tr key={idx} className="border-b border-black font-medium">
                  <td className="p-2 border-r border-black font-bold">{item.productName}</td>
                  <td className="p-2 border-r border-black">{item.variantSize}</td>
                  <td className="p-2 border-r border-black text-center">{item.quantity}</td>
                  <td className="p-2 text-right">₹{Number(item.totalPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Total */}
        <div className="border-2 border-black p-3 bg-gray-50 flex justify-between items-center">
          <div>
            <p className="text-[11px] uppercase font-bold text-gray-600">Payment Mode</p>
            <p className="text-sm font-black uppercase">
              {order.payment?.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid (UPI / Card)'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase font-bold text-gray-600">
              {isCOD ? 'Total Cash to Collect' : 'Total Amount Paid'}
            </p>
            <p className="text-xl font-black font-mono">
              ₹{Number(order.grandTotal).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="text-center pt-2 text-[10px] text-gray-500 font-medium">
          Thank you for choosing Tabassum Attar • Artisanal Non-Alcoholic Concentrated Perfumes
        </div>
      </div>
    </div>
  );
}