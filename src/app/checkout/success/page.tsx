import Link from 'next/link';

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { orderNumber?: string };
}) {
  return (
    <main className="min-h-screen bg-[#0b0c10] text-[#fbf8f2] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#14161d] border border-[#232731] rounded-2xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-[#c69e2a]/20 border border-[#d9b444] rounded-full mx-auto flex items-center justify-center">
          <span className="text-2xl text-[#d9b444]">✓</span>
        </div>

        <div>
          <h1 className="text-2xl font-serif text-white">Order Confirmed!</h1>
          <p className="text-xs text-gray-400 mt-2">
            Thank you for choosing Tabassum Attar. Your pure artisanal blend is being hand-bottled for dispatch.
          </p>
        </div>

        <div className="bg-[#0d0f12] border border-[#232731] p-4 rounded-lg">
          <p className="text-xs text-gray-400">Your Order Reference Number</p>
          <p className="text-lg font-mono font-bold text-[#d9b444] mt-1">{searchParams.orderNumber || 'TAB-CONFIRMED'}</p>
        </div>

        <Link
          href="/"
          className="block w-full bg-[#c69e2a] hover:bg-[#d9b444] text-black font-semibold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}