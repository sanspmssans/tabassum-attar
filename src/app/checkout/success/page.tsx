import Link from 'next/link';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderNumber?: string };
}) {
  const orderNumber = searchParams?.orderNumber || 'N/A';
  const whatsappNumber = '917306610349';
  const message = encodeURIComponent(
    `Hello Tabassum Attar, I have placed order #${orderNumber}. Please confirm my order dispatch details.`
  );

  return (
    <main className="min-h-screen bg-[#0b0c10] text-[#fbf8f2] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#14161d] border border-[#232731] rounded-2xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-green-950/60 border border-green-600/60 rounded-full flex items-center justify-center mx-auto text-green-400 text-3xl">
          ✓
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-serif text-[#d9b444] font-bold">
            Order Confirmed!
          </h1>
          <p className="text-xs text-gray-400">
            Thank you for shopping with Tabassum Attar. Your pure fragrance order has been received.
          </p>
        </div>

        <div className="bg-[#0d0f12] border border-[#232731] p-4 rounded-xl">
          <p className="text-[11px] uppercase tracking-wider text-gray-400">Your Order Number</p>
          <p className="text-lg font-mono font-bold text-white mt-1">#{orderNumber}</p>
        </div>

        {/* WhatsApp Order Direct Button */}
        <Link
          href={`https://wa.me/${whatsappNumber}?text=${message}`}
          target="_blank"
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#25D366]/20"
        >
          💬 Confirm Order via WhatsApp
        </Link>

        <div>
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-[#d9b444] underline tracking-wide"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}