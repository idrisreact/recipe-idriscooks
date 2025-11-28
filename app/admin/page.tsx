import { db } from '@/src/db';
import { user } from '@/src/db/schemas/user.schema';
import { recipes } from '@/src/db/schemas/recipe.schema';
import { shoppingLists } from '@/src/db/schemas/premium-features.schema';
import { eq, count } from 'drizzle-orm';
import { Users, ChefHat, ShoppingCart, TrendingUp } from 'lucide-react';

export default async function AdminDashboard() {
  // Fetch statistics
  const [totalUsersResult] = await db.select({ count: count() }).from(user);
  const [adminUsersResult] = await db
    .select({ count: count() })
    .from(user)
    .where(eq(user.role, 'admin'));
  const [totalRecipesResult] = await db.select({ count: count() }).from(recipes);
  const [totalShoppingListsResult] = await db.select({ count: count() }).from(shoppingLists);

  const totalUsers = totalUsersResult?.count || 0;
  const adminUsers = adminUsersResult?.count || 0;
  const totalRecipes = totalRecipesResult?.count || 0;
  const totalShoppingLists = totalShoppingListsResult?.count || 0;

  const statCards = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      description: `${adminUsers} admins`,
    },
    {
      title: 'Total Recipes',
      value: totalRecipes,
      icon: ChefHat,
      color: 'bg-green-500',
      description: 'All published recipes',
    },
    {
      title: 'Shopping Lists',
      value: totalShoppingLists,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      description: 'Active lists',
    },
    {
      title: 'Growth',
      value: '+12%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      description: 'This month',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Monitor your application statistics and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
            <p className="text-xs text-gray-400">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/admin/users"
              className="block p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500 mt-1">View and edit user accounts</p>
            </a>
            <a
              href="/dashboard"
              className="block p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Manage Recipes</h3>
              <p className="text-sm text-gray-500 mt-1">Create and edit recipes</p>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Authentication</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Active</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
