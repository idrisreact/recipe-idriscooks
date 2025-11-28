import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">Manage your application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={session?.user?.name || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Application Version</span>
              <span className="font-semibold text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Environment</span>
              <span className="font-semibold text-gray-900">
                {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Database</span>
              <span className="font-semibold text-green-600">Connected</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-red-900 mb-4">Danger Zone</h2>
          <p className="text-sm text-gray-600 mb-4">
            These actions are irreversible. Please be careful.
          </p>
          <div className="space-y-3">
            <button
              disabled
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 opacity-50 cursor-not-allowed"
            >
              Clear All Cache
            </button>
            <button
              disabled
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 opacity-50 cursor-not-allowed ml-3"
            >
              Reset Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
