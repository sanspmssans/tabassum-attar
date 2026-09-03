import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get('tabassum_admin_auth')?.value === 'true';

  // Server Action for Admin Login
  async function handleAdminLogin(formData: FormData) {
    'use server';

    const email = ((formData.get('email') as string) || '').trim().toLowerCase();
    const password = ((formData.get('password') as string) || '').trim();

    // Default Admin Credentials & DB Verification
    const isMasterAdmin =
      (email === 'admin@tabassumattar.com' || email === 'admin@tabassum.com') &&
      (password === 'admin123' || password === 'tabassum123' || password === 'Admin@123');

    const dbAdmin = await prisma.user
      .findFirst({
        where: { email, role: 'SUPER_ADMIN' as any },
      })
      .catch(() => null);

    if (isMasterAdmin || dbAdmin) {
      cookies().set('tabassum_admin_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days session
        path: '/',
      });
      redirect('/admin');
    } else {
      redirect('/admin?error=invalid');
    }
  }

  // Server Action for Admin Logout
  async function handleAdminLogout() {
    'use server';
    cookies().delete('tabassum_admin_auth');
    redirect('/admin');
  }

  // If NOT Authenticated, show Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-[#f5efe6] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#14161d] border border-[#232731] rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-serif tracking-widest text-[#d9b444] font-bold">
              TABASSUM ATTAR
            </h1>
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Admin Portal Authentication
            </p>
          </div>

          <form action={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                Admin Email
              </label>
              <input
                required
                type="email"
                name="email"
                placeholder="admin@tabassumattar.com"
                defaultValue="admin@tabassumattar.com"
                className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg p-3 text-xs text-white outline-none focus:border-[#d9b444]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                Password
              </label>
              <input
                required
                type="password"
                name="password"
                placeholder="Enter password"
                className="w-full bg-[#0d0f12] border border-[#232731] rounded-lg p-3 text-xs text-white outline-none focus:border-[#d9b444]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#c69e2a] hover:bg-[#d9b444] text-black font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#c69e2a]/20 mt-2"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="pt-4 border-t border-[#232731] text-center">
            <Link href="/" className="text-xs text-gray-500 hover:text-[#d9b444] transition-colors">
              ← Return to Main Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If Authenticated, show Sidebar & Dashboard
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
            
            {/* Categories Link */}
            <Link
              href="/admin/categories"
              className="block px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1e27] transition-colors"
            >
              📁 Manage Categories
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

            <Link
              href="/"
              target="_blank"
              className="block px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1e27] transition-colors"
            >
              🌐 View Live Store
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-[#232731] space-y-3">
          <div className="text-[11px] text-gray-500">
            Logged in as: <span className="text-[#d9b444] font-medium block">admin@tabassumattar.com</span>
          </div>
          <form action={handleAdminLogout}>
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-900/50 text-[11px] font-semibold transition-colors text-center cursor-pointer"
            >
              🚪 Sign Out (Logout)
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}