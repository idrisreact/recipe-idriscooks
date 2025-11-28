'use client';

import { updateUserRole } from './actions';
import { useTransition } from 'react';

interface RoleSelectorProps {
  userId: string;
  currentRole: string;
}

export function RoleSelector({ userId, currentRole }: RoleSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (newRole: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('role', newRole);
      await updateUserRole(formData);
    });
  };

  return (
    <select
      name="role"
      value={currentRole}
      onChange={(e) => handleRoleChange(e.target.value)}
      disabled={isPending}
      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
        currentRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
      } ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  );
}
