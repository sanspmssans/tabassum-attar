import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#f5efe6] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#14161d] border-b md:border-b-0 md:border-r border-[#232731] flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div>
            <Link href="/" className="text-xl font-serif tracking-widest text-[#d9b444] font-bold block">
              TABASSUM
            </Link>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Administration Hub</span>
          </div>

          <nav className="space-y-2 text-xs uppercase tracking-wider">
            <Link
              href="/admin"
              className="block px-4 py-2.5 rounded-lg bg-[#232731] text-[#d9b444] font-semibold transition-colors"
            >
              📊 Overview & Stats
            </Link>
            <Link
              href="/"
              className="block px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1e27] transition-colors"
            >
              🌐 View Live Store
            </Link>
            <Link
              href="/admin/products/new"
              className="block px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1e27] transition-colors"
            >
              ➕ Add New Fragrance
            </Link>
            <Link
              href="/admin/orders"
              className="block px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1e27] transition-colors"
            >
              📦 Customer Orders
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-[#232731] text-[11px] text-gray-500">
          Logged in as: <span className="text-[#d9b444] font-medium block">admin@tabassumattar.com</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}