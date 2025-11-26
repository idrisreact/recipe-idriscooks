'use client';

import { useState } from 'react';
import { authClient } from '@/src/utils/auth-client';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

export function useAuth() {
  const session = authClient.useSession();
  return {
    session: session.data,
    loading: session.isPending
  };
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return null;

  return <>{children}</>;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (session) return null;

  return <>{children}</>;
}

export function SignInButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleSignIn = async () => {
    await authClient.signIn.social({ provider: 'google' });
  };

  return <div onClick={handleSignIn}>{children}</div>;
}

export function SignUpButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleSignUp = async () => {
    await authClient.signIn.social({ provider: 'google' });
  };

  return <div onClick={handleSignUp}>{children}</div>;
}

export function UserButton() {
  const { session } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  };

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-10 h-10 rounded-full ring-2 ring-white/10 hover:ring-white/20 transition-all overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center"
      >
        {session.user.image ? (
          <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </button>

      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
        >
          <div className="p-3 border-b border-white/10">
            <p className="text-sm font-medium text-white">{session.user.name}</p>
            <p className="text-xs text-white/50">{session.user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            Sign Out
          </button>
        </motion.div>
      )}
    </div>
  );
}
