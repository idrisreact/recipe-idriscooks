import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/src/utils/roles';
import Link from 'next/link';
import { LayoutDashboard, Users, ChefHat, Settings, LogOut } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/sign-in?redirect_url=/admin');
  }

  const userIsAdmin = await isAdmin(session.user.id);

  if (!userIsAdmin) {
    redirect('/?error=unauthorized');
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/dashboard', label: 'Recipes', icon: ChefHat },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {session.user.name}</p>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            <span className="font-medium">Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
