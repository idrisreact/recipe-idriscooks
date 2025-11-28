'use client';

import { deleteUser } from './actions';
import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete user ${userName}?`)) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('userId', userId);
      await deleteUser(formData);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
